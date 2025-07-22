import { Page } from 'puppeteer';

export async function waitForElement(page: Page, selector: string, timeout: number = 5000) {
  await page.waitForSelector(selector, { visible: true, timeout });
}

export async function clickAndWait(page: Page, selector: string, waitForNav: boolean = true) {
  if (waitForNav) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click(selector)
    ]);
  } else {
    await page.click(selector);
  }
}

export async function typeInField(page: Page, selector: string, text: string, clear: boolean = true) {
  if (clear) {
    await page.click(selector, { clickCount: 3 }); // Select all text
  }
  await page.type(selector, text);
}

export async function selectOption(page: Page, selector: string, value: string) {
  await page.select(selector, value);
}

export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = await page.waitForSelector(selector);
  if (!element) return '';
  return await element.evaluate(el => el.textContent || '');
}

export async function waitForNetworkIdle(page: Page, timeout: number = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = `./screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}