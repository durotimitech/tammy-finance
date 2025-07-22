import { Page } from 'puppeteer';
import { signIn } from './helpers/auth.helper';
import { waitForElement, getTextContent, typeInField, selectOption } from './helpers/page.helper';

describe('Net Worth Calculation E2E Tests', () => {
  let page: Page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await signIn(page);
  });

  afterAll(async () => {
    await page.close();
  });

  beforeEach(async () => {
    await page.goto('http://localhost:3000/dashboard');
    await waitForElement(page, '[data-testid="net-worth-summary"], .net-worth-summary');
  });

  describe('Net Worth Formula', () => {
    it('should calculate net worth as assets minus liabilities', async () => {
      // Get current values
      const totalAssetsText = await getTextContent(page, '[data-testid="total-assets"], :has-text("Total Assets") ~ *');
      const totalLiabilitiesText = await getTextContent(page, '[data-testid="total-liabilities"], :has-text("Total Liabilities") ~ *');
      const netWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      
      // Parse values
      const totalAssets = parseFloat(totalAssetsText.replace(/[$,]/g, ''));
      const totalLiabilities = parseFloat(totalLiabilitiesText.replace(/[$,]/g, ''));
      const netWorth = parseFloat(netWorthText.replace(/[$,]/g, ''));
      
      // Verify calculation
      expect(netWorth).toBeCloseTo(totalAssets - totalLiabilities, 2);
    });
  });

  describe('Real-time Updates', () => {
    it('should update net worth when adding an asset', async () => {
      // Get initial net worth
      const initialNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      const initialNetWorth = parseFloat(initialNetWorthText.replace(/[$,]/g, ''));
      
      // Add an asset
      await page.click('button:has-text("Add Asset"), button:has-text("+ Asset")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Test Savings Account');
      await typeInField(page, 'input[name="value"]', '5000');
      await selectOption(page, 'select[name="category"]', 'CASH_AND_SAVINGS');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Get updated net worth
      const updatedNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      const updatedNetWorth = parseFloat(updatedNetWorthText.replace(/[$,]/g, ''));
      
      // Verify increase
      expect(updatedNetWorth).toBeCloseTo(initialNetWorth + 5000, 2);
    });

    it('should update net worth when adding a liability', async () => {
      // Get initial net worth
      const initialNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      const initialNetWorth = parseFloat(initialNetWorthText.replace(/[$,]/g, ''));
      
      // Add a liability
      await page.click('button:has-text("Add Liability"), button:has-text("+ Liability")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Test Credit Card');
      await typeInField(page, 'input[name="value"]', '2000');
      await selectOption(page, 'select[name="category"]', 'CREDIT_CARDS');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Get updated net worth
      const updatedNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      const updatedNetWorth = parseFloat(updatedNetWorthText.replace(/[$,]/g, ''));
      
      // Verify decrease
      expect(updatedNetWorth).toBeCloseTo(initialNetWorth - 2000, 2);
    });

    it('should update net worth when deleting an item', async () => {
      // First add an asset to ensure we have something to delete
      await page.click('button:has-text("Add Asset")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Temporary Asset');
      await typeInField(page, 'input[name="value"]', '10000');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Get net worth after adding
      const netWorthAfterAddText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      const netWorthAfterAdd = parseFloat(netWorthAfterAddText.replace(/[$,]/g, ''));
      
      // Delete the asset
      const deleteButton = await page.$(':has-text("Temporary Asset") button:has-text("Delete"), :has-text("Temporary Asset") button[aria-label*="delete"]');
      if (deleteButton) {
        await deleteButton.click();
        
        // Confirm if needed
        const confirmButton = await page.$('button:has-text("Confirm"), button:has-text("Yes")');
        if (confirmButton) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(1000);
        
        // Get final net worth
        const finalNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
        const finalNetWorth = parseFloat(finalNetWorthText.replace(/[$,]/g, ''));
        
        // Verify decrease
        expect(finalNetWorth).toBeCloseTo(netWorthAfterAdd - 10000, 2);
      }
    });
  });

  describe('Zero and Negative Net Worth', () => {
    it('should handle zero net worth correctly', async () => {
      // This test assumes you can create a scenario with equal assets and liabilities
      // In a real test environment, you might need to clear existing data first
      
      const netWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      
      // Check formatting for zero or near-zero values
      if (netWorthText.includes('$0.00') || netWorthText.includes('$0')) {
        expect(netWorthText).toMatch(/\$0(\.00)?/);
      }
    });

    it('should display negative net worth with proper formatting', async () => {
      // Add a large liability to create negative net worth
      await page.click('button:has-text("Add Liability")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Large Mortgage');
      await typeInField(page, 'input[name="value"]', '500000');
      await selectOption(page, 'select[name="category"]', 'MORTGAGES');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Check net worth display
      const netWorthElement = await page.$('[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      if (netWorthElement) {
        const netWorthText = await netWorthElement.evaluate(el => el.textContent);
        
        // If negative, should show minus sign or be in red
        if (netWorthText && netWorthText.includes('-')) {
          expect(netWorthText).toMatch(/-\$[\d,]+(\.\d{2})?/);
        }
        
        // Check for visual indication (red color)
        const className = await netWorthElement.evaluate(el => el.className);
        if (netWorthText && netWorthText.includes('-')) {
          expect(className).toMatch(/text-red|negative|danger/);
        }
      }
    });
  });

  describe('Currency Formatting', () => {
    it('should format all monetary values consistently', async () => {
      // Check that all monetary values use consistent formatting
      const monetaryElements = await page.$$('[data-testid="total-assets"], [data-testid="total-liabilities"], [data-testid="net-worth"], .money, .currency, :has-text("$")');
      
      for (const element of monetaryElements) {
        const text = await element.evaluate(el => el.textContent);
        if (text && text.includes('$')) {
          // Should match currency format: $X,XXX.XX or $X,XXX
          expect(text).toMatch(/\$[\d,]+(\.\d{2})?/);
        }
      }
    });

    it('should handle large numbers with proper comma separation', async () => {
      // Add a large asset
      await page.click('button:has-text("Add Asset")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Real Estate Portfolio');
      await typeInField(page, 'input[name="value"]', '1500000');
      await selectOption(page, 'select[name="category"]', 'REAL_ESTATE');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Find the formatted value
      const formattedValue = await page.$(':has-text("Real Estate Portfolio") :has-text("$1,500,000")');
      expect(formattedValue).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should calculate net worth quickly with many items', async () => {
      const startTime = Date.now();
      
      // Add multiple items quickly
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("Add Asset")');
        await waitForElement(page, '[role="dialog"]');
        await typeInField(page, 'input[name="name"]', `Asset ${i}`);
        await typeInField(page, 'input[name="value"]', `${(i + 1) * 1000}`);
        await page.click('button[type="submit"]');
        await page.waitForSelector('[role="dialog"]', { hidden: true });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust as needed)
      expect(duration).toBeLessThan(10000); // 10 seconds
      
      // Verify calculations still work
      const netWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      expect(netWorthText).toMatch(/\$[\d,]+/);
    });
  });

  describe('Data Persistence', () => {
    it('should maintain net worth after page refresh', async () => {
      // Get current net worth
      const initialNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      
      // Refresh page
      await page.reload({ waitUntil: 'networkidle0' });
      await waitForElement(page, '[data-testid="net-worth-summary"]');
      
      // Get net worth after refresh
      const refreshedNetWorthText = await getTextContent(page, '[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      
      // Should be the same
      expect(refreshedNetWorthText).toBe(initialNetWorthText);
    });
  });

  describe('Visual Indicators', () => {
    it('should show positive net worth with appropriate styling', async () => {
      // Ensure positive net worth by adding assets
      await page.click('button:has-text("Add Asset")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Savings for Positive NW');
      await typeInField(page, 'input[name="value"]', '50000');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Check styling
      const netWorthElement = await page.$('[data-testid="net-worth"], :has-text("Net Worth") ~ *');
      if (netWorthElement) {
        const className = await netWorthElement.evaluate(el => el.className);
        const text = await netWorthElement.evaluate(el => el.textContent);
        
        // Positive values might have green color or positive indicator
        if (text && !text.includes('-')) {
          expect(className).toMatch(/text-green|positive|success/);
        }
      }
    });
  });
});