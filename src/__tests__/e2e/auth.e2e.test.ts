import { Page } from 'puppeteer';
import { signUp, signIn, signOut, TEST_USER, clearTestUser } from './helpers/auth.helper';
import { waitForElement, getTextContent } from './helpers/page.helper';

describe('Authentication E2E Tests', () => {
  let page: Page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    await clearTestUser();
    await page.close();
  });

  describe('Sign Up Flow', () => {
    it('should redirect to signin when accessing protected route without auth', async () => {
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForNavigation();
      
      const url = page.url();
      expect(url).toContain('/signin');
      expect(url).toContain('redirectedFrom=%2Fdashboard');
    });

    it('should show validation errors for invalid inputs', async () => {
      await page.goto('http://localhost:3000/signup');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      await waitForElement(page, '[role="alert"], .error-message, .text-red-500', 2000);
    });

    it('should successfully create a new account', async () => {
      await page.goto('http://localhost:3000/signup');
      
      // Generate unique email for this test run
      const uniqueEmail = `test${Date.now()}@example.com`;
      
      // Fill form
      await page.type('input[name="email"]', uniqueEmail);
      await page.type('input[name="password"]', TEST_USER.password);
      
      // Submit
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]')
      ]);
      
      // Should redirect to dashboard
      expect(page.url()).toContain('/dashboard');
      
      // Verify we're logged in by checking for dashboard elements
      await waitForElement(page, '[data-testid="net-worth-summary"], h1:has-text("Dashboard"), .dashboard-header');
    });
  });

  describe('Sign In Flow', () => {
    it('should show error for invalid credentials', async () => {
      await page.goto('http://localhost:3000/signin');
      
      // Fill with invalid credentials
      await page.type('input[name="email"]', 'wrong@example.com');
      await page.type('input[name="password"]', 'wrongpassword');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await waitForElement(page, '[role="alert"], .error-message, .text-red-500');
      
      const errorText = await getTextContent(page, '[role="alert"], .error-message, .text-red-500');
      expect(errorText).toMatch(/invalid|incorrect|error/i);
    });

    it('should successfully sign in with valid credentials', async () => {
      // First ensure we're signed out
      await page.goto('http://localhost:3000/signin');
      
      // Sign in with test user
      await signIn(page);
      
      // Should be on dashboard
      expect(page.url()).toContain('/dashboard');
      await waitForElement(page, '[data-testid="net-worth-summary"], h1:has-text("Dashboard"), .dashboard-header');
    });

    it('should redirect to dashboard if already authenticated', async () => {
      // Assuming we're still logged in from previous test
      await page.goto('http://localhost:3000/signin');
      await page.waitForNavigation();
      
      // Should redirect to dashboard
      expect(page.url()).toContain('/dashboard');
    });
  });

  describe('Sign Out Flow', () => {
    it('should successfully sign out', async () => {
      // Ensure we're on dashboard
      await page.goto('http://localhost:3000/dashboard');
      
      // Look for sign out button - could be in header, sidebar, or dropdown
      const signOutSelectors = [
        'button:has-text("Sign Out")',
        'a:has-text("Sign Out")',
        'button:has-text("Logout")',
        'a:has-text("Logout")',
        '[data-testid="sign-out-button"]'
      ];
      
      let signOutButton = null;
      for (const selector of signOutSelectors) {
        signOutButton = await page.$(selector);
        if (signOutButton) break;
      }
      
      // If not visible, might be in a dropdown
      if (!signOutButton) {
        // Try to open user menu
        const menuSelectors = [
          '[data-testid="user-menu"]',
          'button:has-text("Account")',
          '.avatar',
          '[role="button"][aria-label*="user"]'
        ];
        
        for (const selector of menuSelectors) {
          const menuButton = await page.$(selector);
          if (menuButton) {
            await menuButton.click();
            await page.waitForTimeout(500); // Wait for menu to open
            break;
          }
        }
        
        // Try again to find sign out button
        for (const selector of signOutSelectors) {
          signOutButton = await page.$(selector);
          if (signOutButton) break;
        }
      }
      
      if (signOutButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          signOutButton.click()
        ]);
        
        // Should redirect to signin or home
        expect(page.url()).toMatch(/\/(signin|$)/);
      }
    });

    it('should require authentication after signing out', async () => {
      // Try to access dashboard after sign out
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForNavigation();
      
      // Should redirect to signin
      expect(page.url()).toContain('/signin');
    });
  });

  describe('Protected Routes', () => {
    it('should protect API routes', async () => {
      // Try to access API without auth
      const response = await page.goto('http://localhost:3000/api/assets', {
        waitUntil: 'networkidle0'
      });
      
      expect(response?.status()).toBe(401);
    });

    it('should allow access to protected routes after authentication', async () => {
      // Sign in first
      await signIn(page);
      
      // Now API should be accessible
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/assets');
        return { status: res.status, ok: res.ok };
      });
      
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);
    });
  });
});