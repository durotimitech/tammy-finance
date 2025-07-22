// Extend Jest matchers
expect.extend({
  async toHaveText(received, expected) {
    const actualText = await received.evaluate(el => el.textContent);
    const pass = actualText.includes(expected);
    
    return {
      pass,
      message: () => pass
        ? `expected element not to have text "${expected}", but it had "${actualText}"`
        : `expected element to have text "${expected}", but it had "${actualText}"`
    };
  }
});

// Set longer timeout for E2E tests
jest.setTimeout(30000);

// Global error handler for Puppeteer
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});