import { Page } from 'puppeteer';
import { signIn } from './helpers/auth.helper';
import { waitForElement, getTextContent, typeInField, selectOption } from './helpers/page.helper';

describe('Assets CRUD E2E Tests', () => {
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
    await waitForElement(page, '[data-testid="assets-list"], .assets-list');
  });

  describe('Create Asset', () => {
    it('should open add asset modal when clicking add button', async () => {
      const addButton = await page.$('button:has-text("Add Asset"), button:has-text("+ Asset"), [data-testid="add-asset-button"]');
      expect(addButton).toBeTruthy();
      
      await addButton!.click();
      await waitForElement(page, '[role="dialog"], .modal, .dialog');
      
      // Check modal title
      const modalTitle = await getTextContent(page, '[role="dialog"] h2, .modal h2, .dialog h2');
      expect(modalTitle).toMatch(/add.*asset/i);
    });

    it('should create a new cash asset', async () => {
      // Open modal
      await page.click('button:has-text("Add Asset"), button:has-text("+ Asset")');
      await waitForElement(page, '[role="dialog"]');
      
      // Fill form
      await typeInField(page, 'input[name="name"]', 'Emergency Fund');
      await typeInField(page, 'input[name="value"], input[name="amount"]', '10000');
      
      // Select category
      const categorySelect = await page.$('select[name="category"]');
      if (categorySelect) {
        await selectOption(page, 'select[name="category"]', 'CASH_AND_SAVINGS');
      }
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Wait for modal to close and list to update
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      // Verify asset appears in list
      const assetItem = await page.$(':has-text("Emergency Fund")');
      expect(assetItem).toBeTruthy();
      
      // Verify amount
      const amountText = await getTextContent(page, ':has-text("Emergency Fund") :has-text("$10,000"), :has-text("Emergency Fund") ~ * :has-text("$10,000")');
      expect(amountText).toMatch(/\$10,000/);
    });

    it('should create an investment asset', async () => {
      await page.click('button:has-text("Add Asset"), button:has-text("+ Asset")');
      await waitForElement(page, '[role="dialog"]');
      
      await typeInField(page, 'input[name="name"]', 'Stock Portfolio');
      await typeInField(page, 'input[name="value"], input[name="amount"]', '25000');
      await selectOption(page, 'select[name="category"]', 'INVESTMENTS');
      
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      const assetItem = await page.$(':has-text("Stock Portfolio")');
      expect(assetItem).toBeTruthy();
    });

    it('should show validation errors for invalid input', async () => {
      await page.click('button:has-text("Add Asset"), button:has-text("+ Asset")');
      await waitForElement(page, '[role="dialog"]');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      const errorMessage = await page.$('[role="alert"], .error-message, .text-red-500');
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Read Assets', () => {
    it('should display assets grouped by category', async () => {
      // Check for category headers
      const categories = [
        'Cash',
        'Investments',
        'Real Estate',
        'Personal Property'
      ];
      
      for (const category of categories) {
        const categoryHeader = await page.$(`h3:has-text("${category}"), .category-header:has-text("${category}")`);
        if (categoryHeader) {
          const isVisible = await categoryHeader.isIntersectingViewport();
          expect(isVisible).toBe(true);
        }
      }
    });

    it('should display asset details correctly', async () => {
      // Find an asset item
      const assetItem = await page.$('[data-testid^="asset-item"], .asset-item');
      if (assetItem) {
        // Check for required elements
        const name = await assetItem.$('.asset-name, :has-text("Emergency Fund")');
        const value = await assetItem.$('.asset-value, :has-text("$")');
        const category = await assetItem.$('.badge, .category-badge');
        
        expect(name).toBeTruthy();
        expect(value).toBeTruthy();
        expect(category).toBeTruthy();
      }
    });
  });

  describe('Update Asset', () => {
    it('should edit an existing asset', async () => {
      // Find an asset with edit button
      const assetItem = await page.$('[data-testid^="asset-item"], .asset-item');
      if (!assetItem) {
        // Create one first
        await page.click('button:has-text("Add Asset")');
        await waitForElement(page, '[role="dialog"]');
        await typeInField(page, 'input[name="name"]', 'Test Asset');
        await typeInField(page, 'input[name="value"]', '5000');
        await page.click('button[type="submit"]');
        await page.waitForSelector('[role="dialog"]', { hidden: true });
        await page.waitForTimeout(500);
      }
      
      // Click edit button
      const editButton = await page.$('button:has-text("Edit"), button[aria-label*="edit"], [data-testid*="edit"]');
      if (editButton) {
        await editButton.click();
        await waitForElement(page, '[role="dialog"]');
        
        // Update value
        const valueInput = await page.$('input[name="value"], input[name="amount"]');
        await valueInput!.click({ clickCount: 3 }); // Select all
        await valueInput!.type('7500');
        
        // Submit
        await page.click('button[type="submit"]');
        await page.waitForSelector('[role="dialog"]', { hidden: true });
        await page.waitForTimeout(500);
        
        // Verify update
        const updatedValue = await page.$(':has-text("$7,500")');
        expect(updatedValue).toBeTruthy();
      }
    });
  });

  describe('Delete Asset', () => {
    it('should delete an asset', async () => {
      // Count initial assets
      const initialAssets = await page.$$('[data-testid^="asset-item"], .asset-item');
      const initialCount = initialAssets.length;
      
      // Find delete button
      const deleteButton = await page.$('button:has-text("Delete"), button[aria-label*="delete"], [data-testid*="delete"]');
      if (deleteButton) {
        await deleteButton.click();
        
        // Confirm deletion if there's a confirmation dialog
        const confirmButton = await page.$('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
        if (confirmButton) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(500);
        
        // Count assets after deletion
        const finalAssets = await page.$$('[data-testid^="asset-item"], .asset-item');
        const finalCount = finalAssets.length;
        
        expect(finalCount).toBe(initialCount - 1);
      }
    });
  });

  describe('Asset Categories', () => {
    const assetCategories = [
      { value: 'CASH_AND_SAVINGS', name: 'Checking Account' },
      { value: 'INVESTMENTS', name: 'Mutual Fund' },
      { value: 'REAL_ESTATE', name: 'Primary Home' },
      { value: 'PERSONAL_PROPERTY', name: 'Car' },
      { value: 'RETIREMENT_ACCOUNTS', name: '401k' },
      { value: 'BUSINESS_INTERESTS', name: 'Side Business' },
      { value: 'OTHER_ASSETS', name: 'Collectibles' }
    ];

    it.each(assetCategories)('should create asset in %s category', async ({ value, name }) => {
      await page.click('button:has-text("Add Asset"), button:has-text("+ Asset")');
      await waitForElement(page, '[role="dialog"]');
      
      await typeInField(page, 'input[name="name"]', name);
      await typeInField(page, 'input[name="value"]', '1000');
      await selectOption(page, 'select[name="category"]', value);
      
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      // Verify asset was created
      const assetItem = await page.$(`:has-text("${name}")`);
      expect(assetItem).toBeTruthy();
    });
  });

  describe('Asset Totals', () => {
    it('should update total assets when adding/removing assets', async () => {
      // Get initial total
      const initialTotalText = await getTextContent(page, '[data-testid="total-assets"], :has-text("Total Assets") ~ *');
      const initialTotal = parseFloat(initialTotalText.replace(/[$,]/g, ''));
      
      // Add new asset
      await page.click('button:has-text("Add Asset")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'New Asset');
      await typeInField(page, 'input[name="value"]', '1000');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Get new total
      const newTotalText = await getTextContent(page, '[data-testid="total-assets"], :has-text("Total Assets") ~ *');
      const newTotal = parseFloat(newTotalText.replace(/[$,]/g, ''));
      
      expect(newTotal).toBe(initialTotal + 1000);
    });
  });
});