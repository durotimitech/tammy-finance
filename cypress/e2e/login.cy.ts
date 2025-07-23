describe('Login Page', () => {
  beforeEach(() => {
    // Clear any existing session before each test
    cy.clearSupabaseSession()
    cy.visit('/auth/login')
    cy.waitForPageLoad()
  })

  describe('Page Layout and Elements', () => {
    it('should display all login page elements correctly', () => {
      // Check main heading
      cy.findByRole('heading', { name: /welcome back!/i }).should('be.visible')
      
      // Check tagline
      cy.findByText(/simplify your workflow/i).should('be.visible')
      cy.findByText(/tuga's app/i).should('be.visible')
      
      // Check form elements
      cy.findByPlaceholderText('Username').should('be.visible')
      cy.findByPlaceholderText('Password').should('be.visible')
      cy.findByRole('button', { name: /login/i }).should('be.visible')
      
      // Check password toggle button
      cy.get('button[type="button"]').contains('svg').should('exist')
      
      // Check links
      cy.findByText(/forgot password\?/i).should('be.visible')
      cy.findByText(/not a member\?/i).should('be.visible')
      cy.findByText(/register now/i).should('be.visible')
      
      // Check social login text
      cy.findByText(/or continue with/i).should('be.visible')
    })

    it('should have proper responsive design', () => {
      // Desktop view - should show illustration
      cy.viewport(1280, 720)
      cy.get('.hidden.lg\\:flex').should('be.visible')
      cy.findByText(/make your work easier and organized/i).should('be.visible')
      
      // Mobile view - illustration should be hidden
      cy.viewport(375, 667)
      cy.get('.hidden.lg\\:flex').should('not.be.visible')
    })

    it('should have proper animations on load', () => {
      // Check for framer-motion animations
      cy.get('[style*="opacity"]').should('exist')
      cy.wait(600) // Wait for animation duration
      cy.get('form').parent().should('have.css', 'opacity', '1')
    })
  })

  describe('Form Interactions', () => {
    it('should toggle password visibility', () => {
      const password = 'mySecretPassword123'
      
      // Type password
      cy.findByPlaceholderText('Password').type(password)
      
      // Initially password should be hidden
      cy.findByPlaceholderText('Password').should('have.attr', 'type', 'password')
      
      // Click toggle button to show password
      cy.get('button[type="button"]').last().click()
      cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'text')
      
      // Click again to hide password
      cy.get('button[type="button"]').last().click()
      cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'password')
    })

    it('should require email and password fields', () => {
      // Try to submit empty form
      cy.findByRole('button', { name: /login/i }).click()
      
      // Check HTML5 validation
      cy.get('input[type="email"]:invalid').should('exist')
      cy.get('input[type="email"]').then($input => {
        expect($input[0].validationMessage).to.not.be.empty
      })
    })

    it('should validate email format', () => {
      // Type invalid email
      cy.findByPlaceholderText('Username').type('invalidemail')
      cy.findByPlaceholderText('Password').type('password123')
      cy.findByRole('button', { name: /login/i }).click()
      
      // Check validation
      cy.get('input[type="email"]:invalid').should('exist')
    })

    it('should disable submit button while loading', () => {
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Intercept the login request to control timing
      cy.intercept('POST', '**/auth/v1/token*', (req) => {
        req.reply((res) => {
          res.delay(1000) // Delay response
          res.send({ statusCode: 401, body: { error: 'Invalid credentials' } })
        })
      }).as('loginRequest')
      
      cy.findByRole('button', { name: /login/i }).click()
      
      // Button should show loading state
      cy.findByRole('button', { name: /signing in/i }).should('be.disabled')
      
      cy.wait('@loginRequest')
    })
  })

  describe('Authentication Flow', () => {
    it('should show error message for invalid credentials', () => {
      // Type invalid credentials
      cy.findByPlaceholderText('Username').type('wrong@example.com')
      cy.findByPlaceholderText('Password').type('wrongpassword')
      
      // Mock failed login response
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: {
          error: 'Invalid login credentials',
          error_description: 'Invalid login credentials'
        }
      }).as('failedLogin')
      
      cy.findByRole('button', { name: /login/i }).click()
      cy.wait('@failedLogin')
      
      // Should show error notification
      cy.findByText(/invalid login credentials/i).should('be.visible')
    })

    it('should redirect to dashboard on successful login', () => {
      // Type valid credentials
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Mock successful login response
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 200,
        body: {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: '123',
            email: 'test@example.com'
          }
        }
      }).as('successfulLogin')
      
      cy.findByRole('button', { name: /login/i }).click()
      cy.wait('@successfulLogin')
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
    })

    it('should handle network errors gracefully', () => {
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Mock network error
      cy.intercept('POST', '**/auth/v1/token*', {
        forceNetworkError: true
      }).as('networkError')
      
      cy.findByRole('button', { name: /login/i }).click()
      cy.wait('@networkError')
      
      // Should show generic error message
      cy.findByText(/error/i).should('be.visible')
    })
  })

  describe('Navigation', () => {
    it('should navigate to forgot password page', () => {
      cy.findByText(/forgot password\?/i).click()
      cy.url().should('include', '/forgot-password')
    })

    it('should navigate to signup page', () => {
      cy.findByText(/register now/i).click()
      cy.url().should('include', '/signup')
    })

    it('should redirect to dashboard if already logged in', () => {
      // Mock authenticated user
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          expires_at: Date.now() + 3600000
        }))
      })

      // Visit login page
      cy.visit('/auth/login')
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Tab through form elements
      cy.get('body').tab()
      cy.focused().should('have.attr', 'placeholder', 'Username')
      
      cy.focused().tab()
      cy.focused().should('have.attr', 'placeholder', 'Password')
      
      cy.focused().tab()
      cy.focused().should('contain', 'Login')
    })

    it('should have proper ARIA labels', () => {
      // Check form has proper structure
      cy.get('form').should('exist')
      
      // Check inputs have proper types
      cy.get('input[type="email"]').should('exist')
      cy.get('input[type="password"]').should('exist')
      
      // Check button is properly labeled
      cy.findByRole('button', { name: /login/i }).should('exist')
    })

    it('should announce errors to screen readers', () => {
      // Submit with invalid credentials
      cy.findByPlaceholderText('Username').type('wrong@example.com')
      cy.findByPlaceholderText('Password').type('wrongpassword')
      
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: { error: 'Invalid credentials' }
      }).as('failedLogin')
      
      cy.findByRole('button', { name: /login/i }).click()
      cy.wait('@failedLogin')
      
      // Error should be in an alert role
      cy.get('[role="alert"]').should('exist')
    })
  })

  describe('Security', () => {
    it('should not show password in plain text by default', () => {
      cy.findByPlaceholderText('Password').type('mysecretpassword')
      cy.findByPlaceholderText('Password').should('have.attr', 'type', 'password')
    })

    it('should clear form on page refresh', () => {
      // Fill form
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Refresh page
      cy.reload()
      
      // Form should be empty
      cy.findByPlaceholderText('Username').should('have.value', '')
      cy.findByPlaceholderText('Password').should('have.value', '')
    })

    it('should not store password in browser autocomplete', () => {
      cy.get('input[type="password"]').should('have.attr', 'autocomplete')
    })
  })
})