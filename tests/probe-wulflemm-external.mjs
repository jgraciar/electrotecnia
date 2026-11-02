import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  const response = await page.goto('https://wulflemm.com/circuitjs1/circuitjs.html', {
    waitUntil: 'domcontentloaded', timeout: 45000
  });
  await page.waitForTimeout(12000);
  const probe = await page.evaluate(() => ({
    title: document.title,
    circuitJS1: typeof window.CircuitJS1,
    circuitJSMethods: window.CircuitJS1 ? Object.keys(window.CircuitJS1).filter(k => /import|export|circuit/i.test(k)) : [],
    canvasCount: document.querySelectorAll('canvas').length,
    text: document.body?.innerText?.slice(0, 500)
  }));
  console.log('WULFLEMM EXTERNAL BROWSER PROBE', JSON.stringify({
    httpStatus: response?.status(), url: page.url(), ...probe
  }));
} catch (e) {
  console.log('WULFLEMM EXTERNAL BROWSER PROBE', JSON.stringify({
    reachable: false, error: String(e)
  }));
} finally {
  await browser.close();
}
