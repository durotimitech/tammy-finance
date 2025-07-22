import { Page } from 'puppeteer';
import { signIn } from './helpers/auth.helper';
import { waitForElement, getTextContent, typeInField, selectOption } from './helpers/page.helper';

describe('Liabilities CRUD E2E Tests', () => {
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
    await waitForElement(page, '[data-testid="liabilities-list"], .liabilities-list');
  });

  describe('Create Liability', () => {
    it('should open add liability modal when clicking add button', async () => {
      const addButton = await page.$('button:has-text("Add Liability"), button:has-text("+ Liability"), [data-testid="add-liability-button"]');
      expect(addButton).toBeTruthy();
      
      await addButton!.click();
      await waitForElement(page, '[role="dialog"], .modal, .dialog');
      
      // Check modal title
      const modalTitle = await getTextContent(page, '[role="dialog"] h2, .modal h2, .dialog h2');
      expect(modalTitle).toMatch(/add.*liability/i);
    });

    it('should create a new credit card liability', async () => {
      // Open modal
      await page.click('button:has-text("Add Liability"), button:has-text("+ Liability")');
      await waitForElement(page, '[role="dialog"]');
      
      // Fill form
      await typeInField(page, 'input[name="name"]', 'Visa Credit Card');
      await typeInField(page, 'input[name="value"], input[name="amount"]', '2500');
      
      // Select category
      const categorySelect = await page.$('select[name="category"]');
      if (categorySelect) {
        await selectOption(page, 'select[name="category"]', 'CREDIT_CARDS');
      }
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Wait for modal to close and list to update
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      // Verify liability appears in list
      const liabilityItem = await page.$(':has-text("Visa Credit Card")');
      expect(liabilityItem).toBeTruthy();
      
      // Verify amount
      const amountText = await getTextContent(page, ':has-text("Visa Credit Card") :has-text("$2,500"), :has-text("Visa Credit Card") ~ * :has-text("$2,500")');
      expect(amountText).toMatch(/\$2,500/);
    });

    it('should create a mortgage liability', async () => {
      await page.click('button:has-text("Add Liability"), button:has-text("+ Liability")');
      await waitForElement(page, '[role="dialog"]');
      
      await typeInField(page, 'input[name="name"]', 'Home Mortgage');
      await typeInField(page, 'input[name="value"], input[name="amount"]', '250000');
      await selectOption(page, 'select[name="category"]', 'MORTGAGES');
      
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      const liabilityItem = await page.$(':has-text("Home Mortgage")');
      expect(liabilityItem).toBeTruthy();
    });

    it('should show validation errors for invalid input', async () => {
      await page.click('button:has-text("Add Liability"), button:has-text("+ Liability")');
      await waitForElement(page, '[role="dialog"]');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      const errorMessage = await page.$('[role="alert"], .error-message, .text-red-500');
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Read Liabilities', () => {
    it('should display liabilities grouped by category', async () => {
      // Check for category headers
      const categories = [
        'Credit Cards',
        'Mortgages',
        'Auto Loans',
        'Student Loans',
        'Personal Loans'
      ];
      
      for (const category of categories) {
        const categoryHeader = await page.$(`h3:has-text("${category}"), .category-header:has-text("${category}")`);
        if (categoryHeader) {
          const isVisible = await categoryHeader.isIntersectingViewport();
          expect(isVisible).toBe(true);
        }
      }
    });

    it('should display liability details correctly', async () => {
      // Find a liability item
      const liabilityItem = await page.$('[data-testid^="liability-item"], .liability-item');
      if (liabilityItem) {
        // Check for required elements
        const name = await liabilityItem.$('.liability-name, :has-text("Visa")');
        const value = await liabilityItem.$('.liability-value, :has-text("$")');
        const category = await liabilityItem.$('.badge, .category-badge');
        
        expect(name).toBeTruthy();
        expect(value).toBeTruthy();
        expect(category).toBeTruthy();
      }
    });
  });

  describe('Update Liability', () => {
    it('should edit an existing liability', async () => {
      // Find a liability with edit button
      const liabilityItem = await page.$('[data-testid^="liability-item"], .liability-item');
      if (!liabilityItem) {
        // Create one first
        await page.click('button:has-text("Add Liability")');
        await waitForElement(page, '[role="dialog"]');
        await typeInField(page, 'input[name="name"]', 'Test Loan');
        await typeInField(page, 'input[name="value"]', '10000');
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
        await valueInput!.type('8000');
        
        // Submit
        await page.click('button[type="submit"]');
        await page.waitForSelector('[role="dialog"]', { hidden: true });
        await page.waitForTimeout(500);
        
        // Verify update
        const updatedValue = await page.$(':has-text("$8,000")');
        expect(updatedValue).toBeTruthy();
      }
    });
  });

  describe('Delete Liability', () => {
    it('should delete a liability', async () => {
      // Count initial liabilities
      const initialLiabilities = await page.$$('[data-testid^="liability-item"], .liability-item');
      const initialCount = initialLiabilities.length;
      
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
        
        // Count liabilities after deletion
        const finalLiabilities = await page.$$('[data-testid^="liability-item"], .liability-item');
        const finalCount = finalLiabilities.length;
        
        expect(finalCount).toBe(initialCount - 1);
      }
    });
  });

  describe('Liability Categories', () => {
    const liabilityCategories = [
      { value: 'CREDIT_CARDS', name: 'MasterCard' },
      { value: 'STUDENT_LOANS', name: 'Federal Student Loan' },
      { value: 'AUTO_LOANS', name: 'Car Loan' },
      { value: 'MORTGAGES', name: 'Investment Property Mortgage' },
      { value: 'HOME_EQUITY', name: 'HELOC' },
      { value: 'PERSONAL_LOANS', name: 'Personal Line of Credit' },
      { value: 'MEDICAL_DEBT', name: 'Hospital Bill' },
      { value: 'OTHER_DEBT', name: 'Family Loan' }
    ];

    it.each(liabilityCategories)('should create liability in %s category', async ({ value, name }) => {
      await page.click('button:has-text("Add Liability"), button:has-text("+ Liability")');
      await waitForElement(page, '[role="dialog"]');
      
      await typeInField(page, 'input[name="name"]', name);
      await typeInField(page, 'input[name="value"]', '5000');
      await selectOption(page, 'select[name="category"]', value);
      
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      // Verify liability was created
      const liabilityItem = await page.$(`:has-text("${name}")`);
      expect(liabilityItem).toBeTruthy();
    });
  });

  describe('Liability Totals', () => {
    it('should update total liabilities when adding/removing liabilities', async () => {
      // Get initial total
      const initialTotalText = await getTextContent(page, '[data-testid="total-liabilities"], :has-text("Total Liabilities") ~ *');
      const initialTotal = parseFloat(initialTotalText.replace(/[$,]/g, ''));
      
      // Add new liability
      await page.click('button:has-text("Add Liability")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'New Debt');
      await typeInField(page, 'input[name="value"]', '3000');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(1000);
      
      // Get new total
      const newTotalText = await getTextContent(page, '[data-testid="total-liabilities"], :has-text("Total Liabilities") ~ *');
      const newTotal = parseFloat(newTotalText.replace(/[$,]/g, ''));
      
      expect(newTotal).toBe(initialTotal + 3000);
    });
  });

  describe('Liability Payment Tracking', () => {
    it('should allow updating liability balance after payment', async () => {
      // Create a liability first
      await page.click('button:has-text("Add Liability")');
      await waitForElement(page, '[role="dialog"]');
      await typeInField(page, 'input[name="name"]', 'Credit Card Balance');
      await typeInField(page, 'input[name="value"]', '5000');
      await selectOption(page, 'select[name="category"]', 'CREDIT_CARDS');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[role="dialog"]', { hidden: true });
      await page.waitForTimeout(500);
      
      // Find and edit the liability
      const editButton = await page.$(':has-text("Credit Card Balance") button:has-text("Edit"), :has-text("Credit Card Balance") button[aria-label*="edit"]');
      if (editButton) {
        await editButton.click();
        await waitForElement(page, '[role="dialog"]');
        
        // Update to lower balance (simulating payment)
        const valueInput = await page.$('input[name="value"], input[name="amount"]');
        await valueInput!.click({ clickCount: 3 });
        await valueInput!.type('4500');
        
        await page.click('button[type="submit"]');
        await page.waitForSelector('[role="dialog"]', { hidden: true });
        await page.waitForTimeout(500);
        
        // Verify updated balance
        const updatedBalance = await getTextContent(page, ':has-text("Credit Card Balance") :has-text("$4,500")');
        expect(updatedBalance).toMatch(/\$4,500/);
      }
    });
  });
});