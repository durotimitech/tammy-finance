describe('Encrypted Credentials', () => {
  // Helper function to sign in
  const signIn = (email: string, password: string) => {
    cy.visit('/auth/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  };

  // Test users
  const user1 = {
    email: 'test1@example.com',
    password: 'testpass123',
  };

  const user2 = {
    email: 'test2@example.com',
    password: 'testpass123',
  };

  beforeEach(() => {
    // Reset database state if needed
    cy.task('resetDb');
  });

  describe('RLS Policies', () => {
    it('should only allow users to access their own credentials', () => {
      // This test will be implemented when we have the credentials API
      // For now, we're testing the concept

      // Sign in as user 1
      signIn(user1.email, user1.password);

      // User 1 should be able to create credentials
      cy.request('POST', '/api/credentials', {
        name: 'trading212',
        value: 'test-api-key',
      }).then((response) => {
        expect(response.status).to.equal(201);
      });

      // Sign out
      cy.get('[data-testid="logout-button"]').click();

      // Sign in as user 2
      signIn(user2.email, user2.password);

      // User 2 should not be able to access user 1's credentials
      cy.request({
        method: 'GET',
        url: '/api/credentials/trading212',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });

    it('should enforce unique constraint on user_id and name', () => {
      signIn(user1.email, user1.password);

      // Create first credential
      cy.request('POST', '/api/credentials', {
        name: 'trading212',
        value: 'api-key-1',
      }).then((response) => {
        expect(response.status).to.equal(201);
      });

      // Try to create duplicate
      cy.request({
        method: 'POST',
        url: '/api/credentials',
        body: {
          name: 'trading212',
          value: 'api-key-2',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(409); // Conflict
        expect(response.body.error).to.include('already exists');
      });
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      signIn(user1.email, user1.password);
    });

    it('should create, read, update, and delete credentials', () => {
      const credentialName = 'trading212';
      const apiKey = 'test-api-key-12345';
      const updatedApiKey = 'updated-api-key-67890';

      // Create
      cy.request('POST', '/api/credentials', {
        name: credentialName,
        value: apiKey,
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);
      });

      // Read (internal use only - not exposed to client)
      // This would be tested through the Trading 212 integration

      // Update
      cy.request('PUT', `/api/credentials/${credentialName}`, {
        value: updatedApiKey,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
      });

      // Delete
      cy.request('DELETE', `/api/credentials/${credentialName}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
      });

      // Verify deletion
      cy.request({
        method: 'GET',
        url: `/api/credentials/${credentialName}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });

  describe('Security', () => {
    beforeEach(() => {
      signIn(user1.email, user1.password);
    });

    it('should not expose encrypted values in any response', () => {
      // Create credential
      cy.request('POST', '/api/credentials', {
        name: 'trading212',
        value: 'sensitive-api-key',
      });

      // Check that no API response contains the raw value
      cy.intercept('**/*', (req) => {
        req.continue((res) => {
          // Verify the response doesn't contain sensitive data
          const responseBody = JSON.stringify(res.body || '');
          expect(responseBody).to.not.include('sensitive-api-key');
        });
      });

      // Navigate around the app
      cy.visit('/dashboard/settings');
    });

    it('should require authentication for all credential operations', () => {
      // Sign out
      cy.get('[data-testid="logout-button"]').click();

      // Try to access credentials without auth
      const unauthorizedRequests = [
        { method: 'POST', url: '/api/credentials', body: { name: 'test', value: 'test' } },
        { method: 'GET', url: '/api/credentials/test' },
        { method: 'PUT', url: '/api/credentials/test', body: { value: 'new' } },
        { method: 'DELETE', url: '/api/credentials/test' },
      ];

      unauthorizedRequests.forEach((req) => {
        cy.request({
          method: req.method,
          url: req.url,
          body: req.body,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body.error).to.include('Unauthorized');
        });
      });
    });
  });
});
