describe.skip('Dashboard Route Protection', () => {
  describe('Unauthenticated Access', () => {
    beforeEach(() => {
      cy.clearSupabaseSession();
    });

    it('should redirect to login when accessing dashboard without auth', () => {
      cy.visit('/dashboard');

      // Should redirect to login
      cy.url().should('include', '/auth/login');

      // Login page should be visible
      cy.findByRole('heading', { name: /welcome back/i }).should('be.visible');
    });

    it('should redirect all dashboard sub-routes to login', () => {
      const dashboardRoutes = [
        '/dashboard',
        '/dashboard/assets',
        '/dashboard/liabilities',
        '/dashboard/settings',
      ];

      dashboardRoutes.forEach((route) => {
        cy.clearSupabaseSession();
        cy.visit(route);
        cy.url().should('include', '/auth/login');
      });
    });
  });

  describe('Authenticated Access', () => {
    beforeEach(() => {
      // Use real authentication
      cy.login();
    });

    it('should allow access to dashboard when authenticated', () => {
      cy.visit('/dashboard');

      // Should stay on dashboard
      cy.url().should('include', '/dashboard');
      cy.url().should('not.include', '/auth/login');

      // Wait for page to load and check for key dashboard elements
      cy.get('body').should('be.visible');

      // Check for main dashboard structure
      cy.get('main').should('exist');

      // Check for Net Worth Summary component
      cy.get('[data-testid="net-worth-value"]', { timeout: 15000 }).should('exist');

      // Check for the cards that contain the text (instead of looking for the text directly)
      cy.get('[data-testid="total-assets-card"]').should('exist');
      cy.get('[data-testid="total-liabilities-card"]').should('exist');
    });

    it('should maintain auth across navigation', () => {
      // Visit dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');

      // Navigate to home
      cy.visit('/');

      // Navigate back to dashboard - should still be authenticated
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.contains('Net Worth').should('be.visible');
    });

    it('should show user-specific data', () => {
      cy.visit('/dashboard');

      // Check that user data sections are displayed
      cy.contains('Net Worth').should('be.visible');
      cy.get('[data-testid="net-worth-value"]').should('exist');
      cy.get('[data-testid="total-assets-value"]').should('exist');
      cy.get('[data-testid="total-liabilities-value"]').should('exist');
    });
  });

  describe('Auth State Changes', () => {
    it('should redirect to login when session is cleared', () => {
      // Start authenticated with real login
      cy.login();

      // Visit dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');

      // Clear session
      cy.clearSupabaseSession();

      // Try to navigate to another protected route
      cy.visit('/dashboard/assets');

      // Should redirect to login
      cy.url().should('include', '/auth/login');
    });

    it('should handle logout correctly', () => {
      // Login with real authentication
      cy.login();

      // Visit dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');

      // Look for logout button (adjust selector based on your UI)
      // This assumes there's a logout button in the dashboard
      cy.get('button')
        .contains(/logout|sign out/i)
        .click();

      // Should redirect to login after logout
      cy.url().should('include', '/auth/login');

      // Session should be cleared
      cy.window().then((win) => {
        const session = win.localStorage.getItem('supabase.auth.token');
        expect(session).to.equal(null);
      });
    });
  });

  describe('API Route Protection', () => {
    it('should return 401 for unauthenticated API requests', () => {
      cy.clearSupabaseSession();

      // Test each API endpoint
      const endpoints = ['/api/assets', '/api/liabilities', '/api/networth'];

      endpoints.forEach((endpoint) => {
        cy.request({
          url: endpoint,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body).to.have.property('error', 'Unauthorized');
        });
      });
    });

    it('should allow authenticated API requests', () => {
      // Login first to establish session
      cy.login();

      // Make authenticated API request
      cy.request('/api/assets').then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('assets');
      });

      cy.request('/api/liabilities').then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('liabilities');
      });

      cy.request('/api/networth').then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('netWorth');
      });
    });
  });
});
