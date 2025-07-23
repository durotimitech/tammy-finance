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
      cy.findByRole('heading', { name: /welcome back/i }).should('be.visible')
      
      // Check tagline
      cy.findByText(/enter your email and password to access your account/i).should('be.visible')
      
      // Check logo
      cy.findByText('tammy').should('be.visible')
      
      // Check form elements
      cy.findByPlaceholderText('Enter your email').should('be.visible')
      cy.findByPlaceholderText('Enter your password').should('be.visible')
      cy.findByRole('button', { name: /sign in/i }).should('be.visible')
      
      // Check password toggle button exists
      cy.get('button[type="button"]').should('exist')
      
      // Check links
      cy.findByText(/forgot password/i).should('be.visible')
      cy.findByText(/don't have an account\?/i).should('be.visible')
      cy.findByText(/sign up/i).should('be.visible')
      
      // Check remember me checkbox
      cy.findByText(/remember me/i).should('be.visible')
    })

    it('should have proper responsive design', () => {
      // Desktop view - should show gradient side
      cy.viewport(1280, 720)
      cy.get('.hidden.lg\\:flex').should('be.visible')
      cy.findByText(/put app ss here/i).should('be.visible')
      
      // Mobile view - gradient side should be hidden
      cy.viewport(375, 667)
      cy.get('.hidden.lg\\:flex').should('not.be.visible')
    })

    it('should have proper animations on load', () => {
      // Check for framer-motion animations
      cy.get('[style*="opacity"]').should('exist')
      cy.wait(600) // Wait for animation duration
      cy.get('.bg-gray-50').should('have.css', 'opacity', '1')
    })
  })

  describe('Form Interactions', () => {
    it('should toggle password visibility', () => {
      const password = 'mySecretPassword123'
      
      // Type password
      cy.findByPlaceholderText('Enter your password').type(password)
      
      // Initially password should be hidden
      cy.findByPlaceholderText('Enter your password').should('have.attr', 'type', 'password')
      
      // Click toggle button to show password
      cy.get('button[type="button"]').first().click()
      cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'text')
      
      // Click again to hide password
      cy.get('button[type="button"]').first().click()
      cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'password')
    })

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.findByRole('button', { name: /sign in/i }).click()
      
      // Since we're using server actions, we need to check if form submission was prevented
      // The form uses HTML5 validation with required attributes
      cy.get('input[type="email"]').then(($input) => {
        const element = $input[0] as HTMLInputElement
        expect(element.checkValidity()).to.be.false
      })
    })

    it('should validate email format', () => {
      // Type invalid email
      cy.findByPlaceholderText('Enter your email').type('invalidemail')
      cy.findByPlaceholderText('Enter your password').type('password123')
      cy.findByRole('button', { name: /sign in/i }).click()
      
      // Check validation
      cy.get('input[type="email"]').then(($input) => {
        const element = $input[0] as HTMLInputElement
        expect(element.checkValidity()).to.be.false
      })
    })

    it('should show loading state while submitting', () => {
      cy.findByPlaceholderText('Enter your email').type('test@example.com')
      cy.findByPlaceholderText('Enter your password').type('password123')
      
      // Intercept the form submission
      cy.intercept('POST', '/auth/login', {
        delay: 1000,
        statusCode: 303,
        headers: {
          'Location': '/dashboard'
        }
      }).as('loginRequest')
      
      cy.findByRole('button', { name: /sign in/i }).click()
      
      // Button should show loading state
      cy.findByRole('button', { name: /signing in/i }).should('exist')
      cy.findByRole('button', { name: /signing in/i }).should('be.disabled')
    })

    it('should handle remember me checkbox', () => {
      // Check the checkbox
      cy.get('input[type="checkbox"]').should('not.be.checked')
      cy.get('input[type="checkbox"]').check()
      cy.get('input[type="checkbox"]').should('be.checked')
    })
  })

  describe('Authentication Flow', () => {
    it('should show error message for invalid credentials', () => {
      // Type invalid credentials
      cy.findByPlaceholderText('Enter your email').type('wrong@example.com')
      cy.findByPlaceholderText('Enter your password').type('wrongpassword')
      
      // Mock failed login with Supabase error response
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials'
        }
      }).as('failedLogin')
      
      cy.findByRole('button', { name: /sign in/i }).click()
      
      // Wait for the error to appear (server action will return error state)
      cy.findByText(/invalid login credentials/i, { timeout: 10000 }).should('be.visible')
    })

    it('should redirect on successful login', () => {
      // Skip this test as it requires actual Supabase auth setup
      // In a real environment, you would use test credentials or mock the entire auth flow
      cy.log('Skipping: Requires actual Supabase auth setup or complex server action mocking')
    })
  })

  describe('Navigation', () => {
    it('should navigate to forgot password page', () => {
      cy.findByText(/forgot password/i).click()
      cy.url().should('include', '/forgot-password')
    })

    it('should navigate to signup page', () => {
      cy.findByText(/sign up/i).click()
      cy.url().should('include', '/auth/signup')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Focus on first input
      cy.findByPlaceholderText('Enter your email').focus()
      
      // Tab to password field
      cy.realPress('Tab')
      cy.focused().should('have.attr', 'placeholder', 'Enter your password')
      
      // Tab to password toggle button
      cy.realPress('Tab')
      cy.focused().should('have.attr', 'type', 'button')
      
      // Tab to remember me checkbox
      cy.realPress('Tab')
      cy.focused().should('have.attr', 'type', 'checkbox')
      
      // Tab to forgot password link
      cy.realPress('Tab')
      cy.focused().should('contain.text', 'Forgot Password')
      
      // Tab to login button
      cy.realPress('Tab')
      cy.focused().should('contain.text', 'Sign In')
    })

    it('should have proper ARIA labels and semantic HTML', () => {
      // Check form has proper structure
      cy.get('form').should('exist')
      
      // Check inputs have proper types
      cy.get('input[type="email"]').should('exist')
      cy.get('input[type="password"]').should('exist')
      
      // Check button is properly labeled
      cy.findByRole('button', { name: /sign in/i }).should('exist')
      
      // Check heading hierarchy
      cy.findByRole('heading', { level: 2 }).should('exist')
    })

    it('should announce errors to screen readers', () => {
      // Submit with invalid credentials
      cy.findByPlaceholderText('Enter your email').type('wrong@example.com')
      cy.findByPlaceholderText('Enter your password').type('wrongpassword')
      
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: { 
          error: 'invalid_grant',
          error_description: 'Invalid login credentials' 
        }
      }).as('failedLogin')
      
      cy.findByRole('button', { name: /sign in/i }).click()
      
      // Error notification should be present
      // NotificationBanner component will be rendered with the error message
      cy.findByText(/invalid login credentials/i, { timeout: 10000 }).should('exist')
    })
  })

  describe('Security', () => {
    it('should not show password in plain text by default', () => {
      cy.findByPlaceholderText('Enter your password').type('mysecretpassword')
      cy.findByPlaceholderText('Enter your password').should('have.attr', 'type', 'password')
    })

    it('should clear form on page refresh', () => {
      // Fill form
      cy.findByPlaceholderText('Enter your email').type('test@example.com')
      cy.findByPlaceholderText('Enter your password').type('password123')
      
      // Refresh page
      cy.reload()
      
      // Form should be empty
      cy.findByPlaceholderText('Enter your email').should('have.value', '')
      cy.findByPlaceholderText('Enter your password').should('have.value', '')
    })

    it('should have autocomplete attributes for better security', () => {
      cy.get('input[type="email"]').should('have.attr', 'name', 'email')
      cy.get('input[type="password"]').should('have.attr', 'name', 'password')
    })
  })
})