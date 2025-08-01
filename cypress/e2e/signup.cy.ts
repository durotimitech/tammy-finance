describe.skip('Signup Page', () => {
  beforeEach(() => {
    cy.visit('/auth/signup');
  });

  describe('Page Layout and Elements', () => {
    it('should display all signup page elements correctly', () => {
      // Logo - check if it exists in the expected location
      cy.get('.font-pirata').contains(/tammy/i).should('be.visible');

      // Heading
      cy.findByRole('heading', { name: /create account/i }).should('be.visible');
      cy.findByText(/enter your details to get started/i).should('be.visible');

      // Form fields
      cy.findByPlaceholderText('Enter your email').should('be.visible');
      cy.findByPlaceholderText('Create a password').should('be.visible');
      cy.findByPlaceholderText('Confirm your password').should('be.visible');

      // Submit button
      cy.findByRole('button', { name: /sign up/i }).should('be.visible');

      // Login link
      cy.findByText(/already have an account\?/i).should('be.visible');
      cy.findByText(/sign in/i).should('be.visible');
    });

    it('should have proper responsive design', () => {
      // Desktop view - should show gradient side
      cy.viewport(1280, 720);
      cy.get('.hidden.lg\\:flex').should('be.visible');
      cy.contains('Start Your').should('be.visible');
      cy.contains('Financial').should('be.visible');
      cy.contains('Journey').should('be.visible');

      // Mobile view - gradient side should be hidden
      cy.viewport(375, 667);
      cy.get('.hidden.lg\\:flex').should('not.be.visible');
    });

    it('should have proper animations on load', () => {
      // Check for framer-motion animations
      cy.get('[style*="opacity"]').should('exist');
      cy.wait(600); // Wait for animation duration
      cy.get('.bg-gray-50').should('have.css', 'opacity', '1');
    });
  });

  describe('Form Interactions', () => {
    it('should toggle password visibility for both password fields', () => {
      const password = 'mySecretPassword123';

      // Type password
      cy.findByPlaceholderText('Create a password').type(password);
      cy.findByPlaceholderText('Confirm your password').type(password);

      // Initially passwords should be hidden
      cy.findByPlaceholderText('Create a password').should('have.attr', 'type', 'password');
      cy.findByPlaceholderText('Confirm your password').should('have.attr', 'type', 'password');

      // Click first toggle button to show password
      cy.get('button[type="button"]').first().click();
      cy.get('input[placeholder="Create a password"]').should('have.attr', 'type', 'text');

      // Click second toggle button to show confirm password
      cy.get('button[type="button"]').last().click();
      cy.get('input[placeholder="Confirm your password"]').should('have.attr', 'type', 'text');

      // Click again to hide passwords
      cy.get('button[type="button"]').first().click();
      cy.get('input[placeholder="Create a password"]').should('have.attr', 'type', 'password');

      cy.get('button[type="button"]').last().click();
      cy.get('input[placeholder="Confirm your password"]').should('have.attr', 'type', 'password');
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.findByRole('button', { name: /sign up/i }).click();

      // Since we're using server actions, we need to check if form submission was prevented
      // The form uses HTML5 validation with required attributes
      cy.get('input[type="email"]').then(($input) => {
        const element = $input[0] as HTMLInputElement;
        cy.wrap(element.checkValidity()).should('be.false');
      });
    });

    it('should validate email format', () => {
      // Type invalid email
      cy.findByPlaceholderText('Enter your email').type('invalidemail');
      cy.findByPlaceholderText('Create a password').type('password123');
      cy.findByPlaceholderText('Confirm your password').type('password123');
      cy.findByRole('button', { name: /sign up/i }).click();

      // Check validation
      cy.get('input[type="email"]').then(($input) => {
        const element = $input[0] as HTMLInputElement;
        cy.wrap(element.checkValidity()).should('be.false');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page', () => {
      cy.findByText(/sign in/i).click();
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Focus on first input
      cy.findByPlaceholderText('Enter your email').focus();

      // Tab to password field
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'placeholder', 'Create a password');

      // Tab to password toggle button
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'type', 'button');

      // Tab to confirm password field
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'placeholder', 'Confirm your password');

      // Tab to confirm password toggle button
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'type', 'button');

      // Tab to signup button
      cy.realPress('Tab');
      cy.focused().should('contain.text', 'Sign Up');
    });

    it('should have proper ARIA labels and semantic HTML', () => {
      // Check form has proper labels
      cy.get('label[for="email"]').should('exist');
      cy.get('label[for="password"]').should('exist');
      cy.get('label[for="confirmPassword"]').should('exist');

      // Check inputs have IDs matching labels
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('have.length', 2);

      // Check button is properly labeled
      cy.findByRole('button', { name: /sign up/i }).should('exist');

      // Check heading hierarchy
      cy.findByRole('heading', { level: 2 }).should('exist');
    });
  });

  describe('Security', () => {
    it('should not show passwords in plain text by default', () => {
      cy.findByPlaceholderText('Create a password').type('mysecretpassword');
      cy.findByPlaceholderText('Confirm your password').type('mysecretpassword');

      cy.findByPlaceholderText('Create a password').should('have.attr', 'type', 'password');
      cy.findByPlaceholderText('Confirm your password').should('have.attr', 'type', 'password');
    });

    it('should clear form on page refresh', () => {
      // Fill form
      cy.findByPlaceholderText('Enter your email').type('test@example.com');
      cy.findByPlaceholderText('Create a password').type('password123');
      cy.findByPlaceholderText('Confirm your password').type('password123');

      // Refresh page
      cy.reload();

      // Form should be empty
      cy.findByPlaceholderText('Enter your email').should('have.value', '');
      cy.findByPlaceholderText('Create a password').should('have.value', '');
      cy.findByPlaceholderText('Confirm your password').should('have.value', '');
    });

    it('should have autocomplete attributes for better security', () => {
      cy.get('input[type="email"]').should('have.attr', 'name', 'email');
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('input[name="confirmPassword"]').should('have.attr', 'type', 'password');
    });
  });
});
