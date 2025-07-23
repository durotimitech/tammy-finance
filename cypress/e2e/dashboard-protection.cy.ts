describe('Dashboard Route Protection', () => {
  describe('Unauthenticated Access', () => {
    beforeEach(() => {
      cy.clearSupabaseSession()
    })

    it('should redirect to login when accessing dashboard without auth', () => {
      cy.visit('/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
      
      // Login page should be visible
      cy.findByRole('heading', { name: /welcome back/i }).should('be.visible')
    })

    it('should redirect all dashboard sub-routes to login', () => {
      const dashboardRoutes = [
        '/dashboard',
        '/dashboard/assets',
        '/dashboard/liabilities',
        '/dashboard/settings'
      ]

      dashboardRoutes.forEach(route => {
        cy.clearSupabaseSession()
        cy.visit(route)
        cy.url().should('include', '/auth/login')
      })
    })
  })

  describe('Authenticated Access', () => {
    beforeEach(() => {
      // Set up authenticated session
      cy.mockAuthenticatedSession({
        id: 'test-user-123',
        email: 'user@example.com'
      })
      
      // Mock API responses for dashboard data
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: {
          assets: [
            {
              id: '1',
              name: 'Savings Account',
              category: 'CASH',
              value: 10000,
              created_at: new Date().toISOString()
            }
          ]
        }
      }).as('getAssets')

      cy.intercept('GET', '/api/liabilities', {
        statusCode: 200,
        body: {
          liabilities: [
            {
              id: '1',
              name: 'Credit Card',
              category: 'CREDIT_CARD',
              amount: 2000,
              created_at: new Date().toISOString()
            }
          ]
        }
      }).as('getLiabilities')

      cy.intercept('GET', '/api/networth', {
        statusCode: 200,
        body: {
          totalAssets: 10000,
          totalLiabilities: 2000,
          netWorth: 8000
        }
      }).as('getNetWorth')
    })

    it('should allow access to dashboard when authenticated', () => {
      cy.visit('/dashboard')
      
      // Should stay on dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/auth/login')
      
      // Wait for API calls
      cy.wait(['@getAssets', '@getLiabilities', '@getNetWorth'])
      
      // Dashboard elements should be visible
      cy.findByText(/net worth/i).should('be.visible')
      cy.findByText(/\$8,000/i).should('be.visible')
    })

    it('should maintain auth across navigation', () => {
      // Visit dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Navigate to home
      cy.visit('/')
      
      // Navigate back to dashboard - should still be authenticated
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.wait(['@getAssets', '@getLiabilities', '@getNetWorth'])
    })

    it('should show user-specific data', () => {
      cy.visit('/dashboard')
      
      // Wait for data to load
      cy.wait(['@getAssets', '@getLiabilities', '@getNetWorth'])
      
      // Should show the mocked data
      cy.findByText('Savings Account').should('be.visible')
      cy.findByText('Credit Card').should('be.visible')
    })
  })

  describe('Auth State Changes', () => {
    it('should redirect to login when session is cleared', () => {
      // Start authenticated
      cy.mockAuthenticatedSession()
      
      // Visit dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Clear session
      cy.clearSupabaseSession()
      
      // Try to navigate to another protected route
      cy.visit('/dashboard/assets')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
    })

    it('should handle logout correctly', () => {
      // Set up authenticated session
      cy.mockAuthenticatedSession()
      cy.mockSupabaseAuth()
      
      // Visit dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Look for logout button (adjust selector based on your UI)
      // This assumes there's a logout button in the dashboard
      cy.get('button').contains(/logout|sign out/i).click()
      
      // Should redirect to login after logout
      cy.url().should('include', '/auth/login')
      
      // Session should be cleared
      cy.window().then((win) => {
        const session = win.localStorage.getItem('supabase.auth.token')
        expect(session).to.be.null
      })
    })
  })

  describe('API Route Protection', () => {
    it('should return 401 for unauthenticated API requests', () => {
      cy.clearSupabaseSession()
      
      // Test each API endpoint
      const endpoints = ['/api/assets', '/api/liabilities', '/api/networth']
      
      endpoints.forEach(endpoint => {
        cy.request({
          url: endpoint,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(401)
          expect(response.body).to.have.property('error', 'Unauthorized')
        })
      })
    })

    it('should allow authenticated API requests', () => {
      cy.mockAuthenticatedSession()
      
      // Mock successful API responses
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: { assets: [] }
      })
      
      cy.request({
        url: '/api/assets',
        headers: {
          'Authorization': 'Bearer mock-access-token'
        }
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('assets')
      })
    })
  })
})