// Custom Cypress Commands for Landing Page Tests

/// <reference types="cypress" />

/**
 * Custom command to check if an element is in the viewport
 */
Cypress.Commands.add("isInViewport", { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  const windowHeight = Cypress.config("viewportHeight");
  const windowWidth = Cypress.config("viewportWidth");

  expect(rect.top).to.be.lessThan(windowHeight);
  expect(rect.bottom).to.be.greaterThan(0);
  expect(rect.left).to.be.lessThan(windowWidth);
  expect(rect.right).to.be.greaterThan(0);

  return subject;
});

/**
 * Custom command to check if an element has CSS animations or transitions
 */
Cypress.Commands.add("hasAnimation", { prevSubject: true }, (subject) => {
  cy.wrap(subject).should(($el) => {
    const transition = $el.css("transition");
    const animation = $el.css("animation");

    expect(
      transition !== "all 0s ease 0s" ||
        animation !== "none 0s ease 0s normal none running none",
    ).to.be.true;
  });

  return subject;
});

/**
 * Add command to tab through elements (keyboard navigation)
 */
Cypress.Commands.add("tab", { prevSubject: "optional" }, (subject) => {
  cy.wrap(subject).trigger("keydown", { keyCode: 9, which: 9, key: "Tab" });
  return cy.focused();
});

// Declare the custom command types
declare global {
  namespace Cypress {
    interface Chainable {
      tab(): Chainable<Element>;
    }
  }
}

// Export for TypeScript
export {};
