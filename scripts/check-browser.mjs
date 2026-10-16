import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const output = process.env.BROWSER_OUTPUT || '/tmp/astro-migration-browser';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    // CookieConsent intentionally hides from webdriver; exercise the human UI in this test.
    await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
    const page = await context.newPage();
    const errors = [];
    const missing = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith('http://127.0.0.1:4321') && response.status() >= 400) missing.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Manage preferences', exact: true }).click();
    await page.getByRole('heading', { name: 'Consent Preferences Center', exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Reject all', exact: true }).last().click();
    await page.getByRole('heading', { name: 'Consent Preferences Center', exact: true }).waitFor({ state: 'hidden' });
    assert.equal(await page.locator('.card').count(), 4);
    assert.equal(await page.locator('script[src*="googletagmanager"]').count(), 0, 'Analytics remains disabled after rejection');
    if (viewport.width < 500) {
      await page.getByRole('button', { name: 'Open navigation menu overlay' }).click();
      await page.waitForSelector('#offcanvasRight.show');
      await page.locator('#mobile-articles').click();
      await page.locator('#offcanvasRight').getByRole('link', { name: 'All articles', exact: true }).waitFor({ state: 'visible' });
      await page.getByRole('button', { name: 'Close navigation' }).click();
      await page.waitForSelector('#offcanvasRight.show', { state: 'hidden' });
    } else {
      await page.locator('#desktop-articles').focus();
      await page.keyboard.press('Enter');
      await page.locator('.collapse.navbar-collapse').getByRole('link', { name: 'All articles', exact: true }).waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
    }
    for (const path of ['/', '/about', '/articles', '/categories', '/series-collection', '/category/programming', '/series/a-specific-series', '/testing-speech-recognition', '/symfony-feature-flags', '/lying-coverage', '/testing-commonmark-features']) {
      await page.goto(`http://127.0.0.1:4321${path}`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.equal(overflow, false, `Horizontal overflow at ${viewport.width} ${path}`);
      const broken = await page.locator('img').evaluateAll(async images => {
        const local = images.filter(img => img.src.startsWith(location.origin));
        for (const img of local) img.loading = 'eager';
        await Promise.all(local.map(img => img.decode().catch(() => {})));
        return local.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
      });
      assert.deepEqual(broken.filter(src => src.startsWith('http://127.0.0.1')), [], `Broken local images at ${path}`);
      if (path === '/testing-speech-recognition') {
        await page.locator('details > summary').click();
        assert.equal(await page.locator('details').getAttribute('open'), '');
        assert.ok(await page.locator('details pre').isVisible());
        await page.locator('details > summary').click();
      }
      await page.screenshot({ path: `${output}/${viewport.width}-${path.replaceAll('/', '_') || 'home'}.png`, fullPage: path === '/' });
    }
    assert.deepEqual(errors, [], 'Browser JavaScript errors');
    assert.deepEqual(missing, [], 'Local HTTP errors');
    results.push({ viewport, checkedPages: 11, errors, missing, interactions: ['cookie preferences/rejection', 'navigation dropdown', ...(viewport.width < 500 ? ['mobile offcanvas'] : []), 'native details'] });
    await context.close();
  }
  // Capture the deployed homepage in the same browser for direct visual comparison.
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('https://dkarlovi.github.io/', { waitUntil: 'networkidle' });
  const reject = page.getByRole('button', { name: 'Reject all', exact: true });
  if (await reject.isVisible()) await reject.click();
  await page.screenshot({ path: `${output}/baseline-home-desktop.png`, fullPage: true });
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
