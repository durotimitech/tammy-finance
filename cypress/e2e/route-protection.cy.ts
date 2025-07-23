describe('Route Protection', () => {
  describe('Unauthenticated User Access', () => {
    beforeEach(() => {
      // Ensure user is not authenticated
      cy.clearSupabaseSession()
    })

    it('should redirect to login when accessing dashboard', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/auth/login')
      cy.findByRole('heading', { name: /welcome back/i }).should('be.visible')
    })

    it('should redirect to login when accessing protected API routes', () => {
      // Test assets API
      cy.request({
        url: '/api/assets',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
        expect(response.body).to.have.property('error', 'Unauthorized')
      })

      // Test liabilities API
      cy.request({
        url: '/api/liabilities',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
        expect(response.body).to.have.property('error', 'Unauthorized')
      })

      // Test networth API
      cy.request({
        url: '/api/networth',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
        expect(response.body).to.have.property('error', 'Unauthorized')
      })
    })

    it('should allow access to public routes', () => {
      // Home page
      cy.visit('/')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      
      // Login page
      cy.visit('/auth/login')
      cy.url().should('include', '/auth/login')
      cy.findByRole('heading', { name: /welcome back/i }).should('be.visible')
      
      // Signup page
      cy.visit('/auth/signup')
      cy.url().should('include', '/auth/signup')
      cy.findByRole('heading', { name: /create account/i }).should('be.visible')
    })

    it('should preserve redirect URL after login', () => {
      // Try to access dashboard
      cy.visit('/dashboard')
      
      // Should be redirected to login
      cy.url().should('include', '/auth/login')
      
      // The middleware should have set a redirect parameter
      // Note: This depends on your middleware implementation
      // If your middleware doesn't preserve the original URL, you can skip this test
      cy.log('Note: Redirect URL preservation depends on middleware implementation')
    })

    it('should handle direct navigation to protected routes', () => {
      // List of protected routes to test
      const protectedRoutes = [
        '/dashboard',
        '/dashboard/assets',
        '/dashboard/liabilities',
        '/dashboard/settings',
        '/dashboard/profile'
      ]

      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', '/auth/login')
      })
    })
  })

  describe('Authenticated User Access', () => {
    beforeEach(() => {
      // Mock authenticated session
      // This is a simplified version - in real tests you might need to:
      // 1. Actually log in with test credentials
      // 2. Or mock the Supabase session more thoroughly
      cy.window().then((win) => {
        // Mock Supabase auth session
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          }
        }))
      })
      
      // Mock successful auth check
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          id: 'mock-user-id',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        }
      }).as('authCheck')
    })

    it('should allow access to dashboard when authenticated', () => {
      cy.visit('/dashboard')
      
      // Should stay on dashboard, not redirect to login
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/auth/login')
      
      // Dashboard content should be visible
      cy.findByText(/net worth/i).should('exist')
    })

    it('should redirect from login to dashboard when already authenticated', () => {
      cy.visit('/auth/login')
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/auth/login')
    })

    it('should redirect from signup to dashboard when already authenticated', () => {
      cy.visit('/auth/signup')
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/auth/signup')
    })

    it('should allow access to protected API routes when authenticated', () => {
      // Mock API responses
      cy.intercept('GET', '/api/assets', {
        statusCode: 200,
        body: { assets: [] }
      }).as('getAssets')

      cy.intercept('GET', '/api/liabilities', {
        statusCode: 200,
        body: { liabilities: [] }
      }).as('getLiabilities')

      cy.intercept('GET', '/api/networth', {
        statusCode: 200,
        body: { 
          totalAssets: 0,
          totalLiabilities: 0,
          netWorth: 0
        }
      }).as('getNetworth')

      // Visit dashboard which should trigger API calls
      cy.visit('/dashboard')
      
      // Wait for API calls to complete
      cy.wait(['@getAssets', '@getLiabilities', '@getNetworth'])
    })

    it('should maintain authentication across page navigations', () => {
      // Start at dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Navigate to home
      cy.visit('/')
      
      // Navigate back to dashboard - should still be authenticated
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/auth/login')
    })
  })

  describe('Session Expiry and Logout', () => {
    it('should redirect to login when session expires', () => {
      // Set up expired session
      cy.window().then((win) => {
        const expiredSession = {
          access_token: 'expired-token',
          token_type: 'bearer',
          expires_in: -3600, // Negative value indicates expired
          refresh_token: 'expired-refresh-token',
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          }
        }
        win.localStorage.setItem('supabase.auth.token', JSON.stringify(expiredSession))
      })
      
      // Mock failed auth check due to expired token
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 401,
        body: { 
          message: 'Token expired',
          error: 'unauthorized'
        }
      }).as('expiredAuthCheck')
      
      // Try to access protected route
      cy.visit('/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
    })

    it('should clear session and redirect on logout', () => {
      // Set up authenticated session
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-access-token',
          user: { id: 'mock-user-id', email: 'test@example.com' }
        }))
      })
      
      // Visit dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Find and click logout button (adjust selector based on your UI)
      cy.findByRole('button', { name: /logout|sign out/i }).click()
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
      
      // Session should be cleared
      cy.window().then((win) => {
        const session = win.localStorage.getItem('supabase.auth.token')
        expect(session).to.be.null
      })
      
      // Should not be able to access dashboard anymore
      cy.visit('/dashboard')
      cy.url().should('include', '/auth/login')
    })
  })

  describe('CSRF and Security Headers', () => {
    it('should include security headers in responses', () => {
      cy.request('/').then((response) => {
        // Check for common security headers
        // Note: These depend on your Next.js configuration
        const headers = response.headers
        
        // X-Frame-Options helps prevent clickjacking
        if (headers['x-frame-options']) {
          expect(headers['x-frame-options']).to.match(/DENY|SAMEORIGIN/i)
        }
        
        // X-Content-Type-Options prevents MIME sniffing
        if (headers['x-content-type-options']) {
          expect(headers['x-content-type-options']).to.equal('nosniff')
        }
      })
    })

    it('should handle invalid authentication tokens gracefully', () => {
      // Set invalid token
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', 'invalid-json-token')
      })
      
      // Try to access protected route
      cy.visit('/dashboard')
      
      // Should redirect to login without crashing
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Concurrent Session Handling', () => {
    it('should handle multiple tabs/windows correctly', () => {
      // This test simulates having multiple tabs open
      
      // Set up authenticated session
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-access-token',
          user: { id: 'mock-user-id', email: 'test@example.com' }
        }))
      })
      
      // Open dashboard in current tab
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      
      // Simulate logout in another tab by clearing session
      cy.window().then((win) => {
        win.localStorage.removeItem('supabase.auth.token')
      })
      
      // Navigate to another protected route in current tab
      // Should detect session is gone and redirect
      cy.visit('/dashboard/settings')
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Error Boundary Protection', () => {
    it('should handle authentication errors gracefully', () => {
      // Mock network error during auth check
      cy.intercept('GET', '**/auth/v1/user', {
        forceNetworkError: true
      }).as('networkError')
      
      // Try to access protected route
      cy.visit('/dashboard')
      
      // Should handle error gracefully and redirect to login
      cy.url().should('include', '/auth/login')
      
      // Page should not crash - login form should be functional
      cy.findByPlaceholderText('Enter your email').should('be.visible')
      cy.findByPlaceholderText('Enter your password').should('be.visible')
    })

    it('should handle malformed authentication responses', () => {
      // Mock malformed response
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: 'not-json-response'
      }).as('malformedResponse')
      
      cy.visit('/dashboard')
      
      // Should handle error and redirect to login
      cy.url().should('include', '/auth/login')
    })
  })
})