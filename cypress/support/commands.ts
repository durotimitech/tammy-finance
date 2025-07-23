/// <reference types="cypress" />
// ***********************************************
// This file is used to create custom commands 
// and overwrite existing commands.
// ***********************************************

// Custom command to handle Supabase authentication
Cypress.Commands.add('loginWithSupabase', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.findByPlaceholderText('Enter your email').type(email)
  cy.findByPlaceholderText('Enter your password').type(password)
  cy.findByRole('button', { name: /sign in$/i }).click()
})

// Command to clear Supabase session
Cypress.Commands.add('clearSupabaseSession', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
  cy.clearCookies()
})

// Command to wait for page to be ready
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.wait(500) // Small wait for animations to complete
})

// TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      loginWithSupabase(email: string, password: string): Chainable<void>
      clearSupabaseSession(): Chainable<void>
      waitForPageLoad(): Chainable<void>
    }
  }
}

export {}