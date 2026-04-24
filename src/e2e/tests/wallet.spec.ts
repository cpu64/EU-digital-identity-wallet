import { test, expect, BrowserContext, Page } from '@playwright/test';
import { TOTP } from 'totp-generator';

const USERNAME = `e2euser${Date.now().toString(36)}`;
const PASSWORD = 'testpass';

let ctx: BrowserContext;
let walletPage: Page;

test.describe.serial('Wallet E2E', () => {

  test.beforeAll(async ({ browser }) => {
    ctx = await browser.newContext({ ignoreHTTPSErrors: true });
    walletPage = await ctx.newPage();
  });

  test.afterAll(async () => {
    await ctx.close();
  });

  test('Register and login', async () => {
    await walletPage.goto('https://wallet-frontend.wallet.test/register');
    await walletPage.fill('#username', USERNAME);
    await walletPage.fill('#password', PASSWORD);
    await walletPage.click('button[type="submit"]');
    await walletPage.waitForURL(url => !url.pathname.startsWith('/register'));

    await walletPage.goto('https://wallet-frontend.wallet.test/login');
    await walletPage.fill('#username', USERNAME);
    await walletPage.fill('#password', PASSWORD);
    await walletPage.click('button[type="submit"]');
    await expect(walletPage).toHaveURL(/\/credentials/);
  });

  test('Add PID credential from PID provider', async () => {
    await walletPage.goto('https://wallet-frontend.wallet.test/pid-providers');
    await walletPage.locator('[role="button"]').first().click();
    await walletPage.waitForURL(/.*pid-provider.*/);

    await walletPage.fill('#pan', '39502101234');
    await walletPage.click('button[type="submit"]');

    await walletPage.waitForSelector('input[name="code"]');
    const { otp } = await TOTP.generate('JBSWY3DPEBLW64TM');
    await walletPage.fill('input[name="code"]', otp);
    await walletPage.click('button[type="submit"]');

    await walletPage.waitForURL(/.*pid-callback.*/);
    await walletPage.click('button:has-text("View Credentials")');

    await expect(walletPage).toHaveURL(/\/credentials/);
    await expect(walletPage.locator('text="Personal ID (PID)"').first()).toBeVisible({ timeout: 15000 });
  });

  test('Use wallet in Relying Party to leave a review', async () => {
    const rpPage = await ctx.newPage();
    await rpPage.goto('https://relying-party.wallet.test/product/2');

    await rpPage.click('text="Write a review"');
    await rpPage.fill('textarea[placeholder="Share your thoughts about this hot sauce..."]', 'E2E test review');
    await rpPage.click('text="Submit Review via EUDI Wallet"');

    const pre = rpPage.locator('pre').first();
    await expect(pre).toBeVisible({ timeout: 15000 });
    const requestBase64 = await pre.textContent();

    await walletPage.goto('https://wallet-frontend.wallet.test/verify');
    await walletPage.fill('#base64-input', requestBase64!.trim());
    await walletPage.click('button:has-text("Verify")');

    await walletPage.waitForSelector('button[class*="shareButton"]', { timeout: 10000 });
    await walletPage.locator('button[class*="shareButton"]').click();

    await expect(walletPage.locator('text="Proof Shared Successfully"')).toBeVisible({ timeout: 15000 });
    await expect(rpPage.locator('text="Review posted"')).toBeVisible({ timeout: 20000 });

    await rpPage.close();
  });

});
