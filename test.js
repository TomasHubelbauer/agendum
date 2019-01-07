const puppeteer = require('puppeteer');
const fs = require('fs');

// TODO: See if this is needed
fs.mkdirSync('screenshots');

void async function() {
  try {
    const browser = await puppeteer.launch();
    const pages = await browser.pages();
    // Close the default page
    await pages[0].close();
    
    const tests = [
      testLoadingApplication,
      testCreatingAnItemWithBasicEditor,
    ];
    
    for (let test of tests) {
      const page = await browser.newPage();
      // TODO: Serve the files on localhost and use that, the `file:///` protocol will have different behavior
      // TODO: Figure out why index.html doesn't work here and hangs the agent
      await page.goto('https://agendum.today');
      // TODO: Race this with a timeout to kill too-long-running tests
      await test(page);
      await page.screenshot({ path: `screenshots/${test.name}.png` });
      await page.close();
    }
    
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
}()

function testLoadingApplication(page) {
  await page.waitForSelector('#editorInput');
}

function testCreatingAnItemWithBasicEditor() {
  await page.type('#editorInput', 'Test creating an item');
  await page.waitFor(1000);
  await page.click('#submitButton');
  // TODO: Verify the item has been created
}
