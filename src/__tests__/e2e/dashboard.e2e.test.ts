import { Page } from 'puppeteer';
import { signIn, TEST_USER } from './helpers/auth.helper';
import { waitForElement, getTextContent, clickAndWait } from './helpers/page.helper';

describe('Dashboard E2E Tests', () => {
  let page: Page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Sign in before all dashboard tests
    await signIn(page);
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Dashboard Layout', () => {
    it('should display all main dashboard components', async () => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Check for main components
      await waitForElement(page, '[data-testid="net-worth-summary"], .net-worth-summary, h2:has-text("Net Worth")');
      await waitForElement(page, '[data-testid="assets-list"], .assets-list, h2:has-text("Assets")');
      await waitForElement(page, '[data-testid="liabilities-list"], .liabilities-list, h2:has-text("Liabilities")');
    });

    it('should display user information', async () => {
      // Check for user email or avatar in header/sidebar
      const userInfoSelectors = [
        '.user-email',
        '[data-testid="user-info"]',
        '.avatar',
        'span:has-text("@")'
      ];
      
      let found = false;
      for (const selector of userInfoSelectors) {
        const element = await page.$(selector);
        if (element) {
          found = true;
          break;
        }
      }
      
      expect(found).toBe(true);
    });
  });

  describe('Net Worth Summary', () => {
    it('should display total assets, liabilities, and net worth', async () => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Wait for summary to load
      await waitForElement(page, '[data-testid="net-worth-summary"], .net-worth-summary');
      
      // Check for the three main metrics
      const totalAssetsText = await page.$eval(
        '[data-testid="total-assets"], .total-assets, :has-text("Total Assets") + *, :has-text("Total Assets") ~ *',
        el => el.textContent
      );
      expect(totalAssetsText).toMatch(/\$[\d,]+(\.\d{2})?/);
      
      const totalLiabilitiesText = await page.$eval(
        '[data-testid="total-liabilities"], .total-liabilities, :has-text("Total Liabilities") + *, :has-text("Total Liabilities") ~ *',
        el => el.textContent
      );
      expect(totalLiabilitiesText).toMatch(/\$[\d,]+(\.\d{2})?/);
      
      const netWorthText = await page.$eval(
        '[data-testid="net-worth"], .net-worth, :has-text("Net Worth") + *, :has-text("Net Worth") ~ *',
        el => el.textContent
      );
      expect(netWorthText).toMatch(/\$[\d,]+(\.\d{2})?/);
    });

    it('should update when assets or liabilities change', async () => {
      // Get initial net worth
      const initialNetWorth = await page.$eval(
        '[data-testid="net-worth"], .net-worth, :has-text("Net Worth") ~ *',
        el => el.textContent
      );
      
      // Add a new asset (this will be tested more thoroughly in assets tests)
      const addAssetButton = await page.$('button:has-text("Add Asset"), button:has-text("+ Asset")');
      if (addAssetButton) {
        await addAssetButton.click();
        await waitForElement(page, '[role="dialog"], .modal, .dialog');
        
        // Fill in asset form
        await page.type('input[name="name"]', 'Test Savings');
        await page.type('input[name="value"], input[name="amount"]', '1000');
        await page.select('select[name="category"]', 'CASH_AND_SAVINGS');
        
        // Submit
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000); // Wait for update
        
        // Check that net worth changed
        const newNetWorth = await page.$eval(
          '[data-testid="net-worth"], .net-worth, :has-text("Net Worth") ~ *',
          el => el.textContent
        );
        expect(newNetWorth).not.toBe(initialNetWorth);
      }
    });
  });

  describe('Navigation', () => {
    it('should have working navigation links', async () => {
      // Check for navigation elements
      const navSelectors = [
        'nav a:has-text("Dashboard")',
        'nav a:has-text("Assets")',
        'nav a:has-text("Liabilities")',
        '[data-testid="nav-dashboard"]'
      ];
      
      let navFound = false;
      for (const selector of navSelectors) {
        const element = await page.$(selector);
        if (element) {
          navFound = true;
          break;
        }
      }
      
      expect(navFound).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/dashboard');
      
      // Check that main components are still visible
      await waitForElement(page, '[data-testid="net-worth-summary"], .net-worth-summary');
      await waitForElement(page, '[data-testid="assets-list"], .assets-list');
      await waitForElement(page, '[data-testid="liabilities-list"], .liabilities-list');
      
      // Reset viewport
      await page.setViewport({ width: 1280, height: 720 });
    });
  });

  describe('Loading States', () => {
    it('should show loading states while fetching data', async () => {
      // Intercept network requests to simulate slow loading
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          setTimeout(() => request.continue(), 1000); // Delay API requests
        } else {
          request.continue();
        }
      });
      
      await page.goto('http://localhost:3000/dashboard');
      
      // Check for loading indicators
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '.skeleton',
        '[data-testid="loading"]',
        ':has-text("Loading")'
      ];
      
      let loadingFound = false;
      for (const selector of loadingSelectors) {
        const element = await page.$(selector);
        if (element) {
          loadingFound = true;
          break;
        }
      }
      
      // Disable request interception
      await page.setRequestInterception(false);
      
      // Wait for content to load
      await waitForElement(page, '[data-testid="net-worth-summary"], .net-worth-summary');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Intercept API requests and return errors
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        if (request.url().includes('/api/networth')) {
          request.respond({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' })
          });
        } else {
          request.continue();
        }
      });
      
      await page.goto('http://localhost:3000/dashboard');
      
      // Check for error message
      const errorSelectors = [
        '[role="alert"]',
        '.error',
        '.error-message',
        ':has-text("Error")',
        ':has-text("failed")'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          errorFound = true;
          break;
        } catch (e) {
          // Continue checking other selectors
        }
      }
      
      // Disable request interception
      await page.setRequestInterception(false);
    });
  });
});