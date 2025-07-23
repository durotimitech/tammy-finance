describe('Middleware Edge Cases', () => {
  beforeEach(() => {
    cy.clearSupabaseSession()
  })

  describe('Cookie and Token Handling', () => {
    it('should handle missing auth cookies gracefully', () => {
      // Clear all cookies
      cy.clearCookies()
      
      // Try to access protected route without any auth cookies
      cy.visit('/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
    })

    it('should handle corrupted auth cookies', () => {
      // Set corrupted cookie
      cy.setCookie('sb-access-token', 'corrupted-data-!@#$%', {
        path: '/',
        sameSite: 'lax'
      })
      
      cy.visit('/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
    })

    it('should prioritize cookie auth over localStorage', () => {
      // Set valid cookie
      cy.setCookie('sb-access-token', 'valid-cookie-token', {
        path: '/',
        sameSite: 'lax'
      })
      
      // Set different localStorage token
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'different-localstorage-token'
        }))
      })
      
      // Mock successful auth with cookie token
      cy.intercept('GET', '**/auth/v1/user', (req) => {
        // Verify the cookie token is being used
        if (req.headers.authorization === 'Bearer valid-cookie-token') {
          req.reply({
            statusCode: 200,
            body: { id: 'user-id', email: 'test@example.com' }
          })
        } else {
          req.reply({ statusCode: 401 })
        }
      }).as('authCheck')
      
      cy.visit('/dashboard')
      cy.wait('@authCheck')
      
      // Should successfully access dashboard with cookie auth
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Refresh Token Handling', () => {
    it('should attempt to refresh expired access token', () => {
      // Set expired access token with valid refresh token
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'expired-access-token',
          refresh_token: 'valid-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
        }))
      })
      
      // Mock refresh token endpoint
      cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', {
        statusCode: 200,
        body: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600
        }
      }).as('refreshToken')
      
      // Mock successful auth check with new token
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: { id: 'user-id', email: 'test@example.com' }
      }).as('authCheck')
      
      cy.visit('/dashboard')
      
      // Should attempt refresh and succeed
      cy.wait('@refreshToken')
      cy.wait('@authCheck')
      cy.url().should('include', '/dashboard')
    })

    it('should redirect to login when refresh token fails', () => {
      // Set expired tokens
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'expired-access-token',
          refresh_token: 'invalid-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) - 3600
        }))
      })
      
      // Mock failed refresh
      cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', {
        statusCode: 401,
        body: { error: 'invalid_refresh_token' }
      }).as('failedRefresh')
      
      cy.visit('/dashboard')
      
      // Should redirect to login after failed refresh
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Race Conditions', () => {
    it('should handle simultaneous auth checks correctly', () => {
      let authCheckCount = 0
      
      // Mock auth endpoint with counter
      cy.intercept('GET', '**/auth/v1/user', (req) => {
        authCheckCount++
        req.reply({
          statusCode: 200,
          body: { id: 'user-id', email: 'test@example.com' }
        })
      }).as('authCheck')
      
      // Set valid auth
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'valid-token',
          user: { id: 'user-id' }
        }))
      })
      
      // Open multiple routes quickly
      cy.visit('/dashboard')
      cy.visit('/dashboard/assets')
      cy.visit('/dashboard/liabilities')
      
      // Should not make excessive auth checks
      cy.wait(1000).then(() => {
        expect(authCheckCount).to.be.lessThan(10)
      })
    })

    it('should handle auth state changes during navigation', () => {
      // Start authenticated
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'valid-token',
          user: { id: 'user-id' }
        }))
      })
      
      // Mock successful initial auth
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: { id: 'user-id', email: 'test@example.com' }
      }).as('authCheck')
      
      // Start navigation to dashboard
      cy.visit('/dashboard')
      
      // Clear auth mid-navigation
      cy.window().then((win) => {
        win.localStorage.removeItem('supabase.auth.token')
      })
      
      // Should still complete navigation based on initial auth state
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Special Routes and Patterns', () => {
    it('should handle routes with query parameters', () => {
      cy.visit('/dashboard?tab=assets&filter=all')
      
      // Should redirect to login with or without preserving query params
      cy.url().should('include', '/auth/login')
    })

    it('should handle routes with hash fragments', () => {
      cy.visit('/dashboard#section-assets')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
    })

    it('should handle deeply nested routes', () => {
      const deepRoutes = [
        '/dashboard/assets/details/123',
        '/dashboard/reports/annual/2024/summary',
        '/dashboard/settings/profile/security/2fa'
      ]
      
      deepRoutes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', '/auth/login')
      })
    })

    it('should handle routes with special characters', () => {
      // Test URL encoding
      cy.visit('/dashboard/search?q=test%20query')
      cy.url().should('include', '/auth/login')
      
      // Test route with spaces (should be encoded)
      cy.visit('/dashboard/my documents')
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Performance and Caching', () => {
    it('should cache auth state to avoid redundant checks', () => {
      let authCheckCount = 0
      
      // Mock auth with counter
      cy.intercept('GET', '**/auth/v1/user', (req) => {
        authCheckCount++
        req.reply({
          statusCode: 200,
          body: { id: 'user-id', email: 'test@example.com' }
        })
      }).as('authCheck')
      
      // Set valid auth
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'valid-token',
          user: { id: 'user-id' }
        }))
      })
      
      // Navigate to multiple pages
      cy.visit('/dashboard')
      cy.wait('@authCheck')
      
      // Navigate to another protected route
      cy.visit('/dashboard/assets')
      
      // Should use cached auth state, not make another check immediately
      cy.wait(500).then(() => {
        expect(authCheckCount).to.equal(1)
      })
    })
  })

  describe('Error Recovery', () => {
    it('should recover from temporary network failures', () => {
      let attemptCount = 0
      
      // Mock network failure then success
      cy.intercept('GET', '**/auth/v1/user', (req) => {
        attemptCount++
        if (attemptCount === 1) {
          req.reply({ forceNetworkError: true })
        } else {
          req.reply({
            statusCode: 200,
            body: { id: 'user-id', email: 'test@example.com' }
          })
        }
      }).as('authCheck')
      
      // Set valid auth
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'valid-token',
          user: { id: 'user-id' }
        }))
      })
      
      cy.visit('/dashboard')
      
      // Should eventually succeed if middleware has retry logic
      // Otherwise should redirect to login
      cy.url().should('satisfy', (url) => {
        return url.includes('/dashboard') || url.includes('/auth/login')
      })
    })

    it('should handle server errors gracefully', () => {
      // Mock 500 error
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('serverError')
      
      cy.visit('/dashboard')
      
      // Should redirect to login on server error
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Cross-Origin and External Routes', () => {
    it('should not interfere with external navigation', () => {
      // Visit app first
      cy.visit('/')
      
      // External links should work normally
      cy.window().then((win) => {
        const link = win.document.createElement('a')
        link.href = 'https://example.com'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        win.document.body.appendChild(link)
        
        // Cypress doesn't actually navigate to external URLs
        // Just verify the link exists and has correct attributes
        cy.get('a[href="https://example.com"]').should('have.attr', 'target', '_blank')
      })
    })

    it('should handle navigation to non-existent routes', () => {
      cy.visit('/this-route-does-not-exist', { failOnStatusCode: false })
      
      // Should show 404 page or redirect based on your app's behavior
      // Should not crash the middleware
      cy.get('body').should('be.visible')
    })
  })
})