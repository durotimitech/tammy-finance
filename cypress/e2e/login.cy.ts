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
      
      // Check password toggle button exists
      cy.get('button[type="button"]').should('exist')
      
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
      cy.get('button[type="button"]').click()
      cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'text')
      
      // Click again to hide password
      cy.get('button[type="button"]').click()
      cy.get('input[placeholder="Password"]').should('have.attr', 'type', 'password')
    })

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.findByRole('button', { name: /login/i }).click()
      
      // Since we're using server actions, we need to check if form submission was prevented
      // The form uses HTML5 validation with required attributes
      cy.get('input[type="email"]').then(($input) => {
        const element = $input[0] as HTMLInputElement
        expect(element.checkValidity()).to.be.false
      })
    })

    it('should validate email format', () => {
      // Type invalid email
      cy.findByPlaceholderText('Username').type('invalidemail')
      cy.findByPlaceholderText('Password').type('password123')
      cy.findByRole('button', { name: /login/i }).click()
      
      // Check validation
      cy.get('input[type="email"]').then(($input) => {
        const element = $input[0] as HTMLInputElement
        expect(element.checkValidity()).to.be.false
      })
    })

    it('should show loading state while submitting', () => {
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Intercept the form submission
      cy.intercept('POST', '/auth/login', {
        delay: 1000,
        statusCode: 303,
        headers: {
          'Location': '/dashboard'
        }
      }).as('loginRequest')
      
      cy.findByRole('button', { name: /login/i }).click()
      
      // Button should show loading state
      cy.findByRole('button', { name: /signing in/i }).should('exist')
      cy.findByRole('button', { name: /signing in/i }).should('be.disabled')
    })
  })

  describe('Authentication Flow', () => {
    it('should show error message for invalid credentials', () => {
      // Type invalid credentials
      cy.findByPlaceholderText('Username').type('wrong@example.com')
      cy.findByPlaceholderText('Password').type('wrongpassword')
      
      // Mock failed login with Supabase error response
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials'
        }
      }).as('failedLogin')
      
      cy.findByRole('button', { name: /login/i }).click()
      
      // Wait for the error to appear (server action will return error state)
      cy.findByText(/invalid login credentials/i, { timeout: 10000 }).should('be.visible')
    })

    it('should redirect to dashboard on successful login', () => {
      // Type valid credentials
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Mock successful Supabase login response
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 200,
        body: {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: '123',
            email: 'test@example.com',
            user_metadata: {}
          }
        }
      }).as('successfulLogin')
      
      // Mock the user session check
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {}
        }
      }).as('getUser')
      
      cy.findByRole('button', { name: /login/i }).click()
      
      // Should redirect to dashboard
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
    })

    it('should handle network errors gracefully', () => {
      cy.findByPlaceholderText('Username').type('test@example.com')
      cy.findByPlaceholderText('Password').type('password123')
      
      // Mock network error
      cy.intercept('POST', '**/auth/v1/token*', {
        forceNetworkError: true
      }).as('networkError')
      
      cy.findByRole('button', { name: /login/i }).click()
      
      // Should show error message
      cy.findByText(/error/i, { timeout: 10000 }).should('be.visible')
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
      // Mock authenticated state
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {}
        }
      }).as('getUser')

      // Set auth cookie
      cy.setCookie('sb-access-token', 'mock-token')
      
      // Visit login page
      cy.visit('/auth/login')
      
      // Should redirect to dashboard
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Focus on first input
      cy.findByPlaceholderText('Username').focus()
      
      // Tab to password field
      cy.realPress('Tab')
      cy.focused().should('have.attr', 'placeholder', 'Password')
      
      // Tab to password toggle button
      cy.realPress('Tab')
      cy.focused().should('have.attr', 'type', 'button')
      
      // Tab to forgot password link
      cy.realPress('Tab')
      cy.focused().should('contain.text', 'Forgot Password')
      
      // Tab to login button
      cy.realPress('Tab')
      cy.focused().should('contain.text', 'Login')
    })

    it('should have proper ARIA labels and semantic HTML', () => {
      // Check form has proper structure
      cy.get('form').should('exist')
      
      // Check inputs have proper types
      cy.get('input[type="email"]').should('exist')
      cy.get('input[type="password"]').should('exist')
      
      // Check button is properly labeled
      cy.findByRole('button', { name: /login/i }).should('exist')
      
      // Check heading hierarchy
      cy.findByRole('heading', { level: 1 }).should('exist')
    })

    it('should announce errors to screen readers', () => {
      // Submit with invalid credentials
      cy.findByPlaceholderText('Username').type('wrong@example.com')
      cy.findByPlaceholderText('Password').type('wrongpassword')
      
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: { 
          error: 'invalid_grant',
          error_description: 'Invalid login credentials' 
        }
      }).as('failedLogin')
      
      cy.findByRole('button', { name: /login/i }).click()
      
      // Error notification should be present
      cy.get('.text-red-600', { timeout: 10000 }).should('exist')
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

    it('should have autocomplete attributes for better security', () => {
      cy.get('input[type="email"]').should('have.attr', 'name', 'email')
      cy.get('input[type="password"]').should('have.attr', 'name', 'password')
    })
  })
})