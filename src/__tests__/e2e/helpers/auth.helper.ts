import { Page } from 'puppeteer';

export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123456!',
};

export async function signUp(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto('http://localhost:3000/signup');
  
  // Fill signup form
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard or error
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

export async function signIn(page: Page, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  await page.goto('http://localhost:3000/signin');
  
  // Fill signin form
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

export async function signOut(page: Page) {
  // Click user menu or sign out button
  const signOutButton = await page.$('button:has-text("Sign Out"), a:has-text("Sign Out")');
  if (signOutButton) {
    await signOutButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
}

export async function clearTestUser() {
  // This would typically call a test API endpoint to clean up test data
  // For now, we'll leave it as a placeholder
  console.log('Test user cleanup would happen here');
}