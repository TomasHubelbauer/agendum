const puppeteer = require('puppeteer');

async function ui() {
  const browser = await puppeteer.launch();
  const pages = await browser.pages();
  const page = pages[0];
  // TODO: Go to the sources instead - but need to serve first, `file:///` will have different behavior
  await page.goto('https://agendum.today/');
  // TODO: Upload screenshots as build artifacts from UI tests
  // TODO: Look into Puppeteer giving jUnit results: https://www.eliostruyf.com/setting-up-puppeteer-to-run-on-azure-devops-for-your-automated-ui-tests/
  console.log('Puppeteer');
  await browser.close();
};

ui().catch(error => {
  throw error;
});
