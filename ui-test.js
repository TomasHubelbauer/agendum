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
      testFailing,
    ];
    
    const errors = [];
    for (let index = 0; index < tests.length; index++) {
      const test = tests[index];
      console.log(`Running test ${test.name}. (${index + 1}/${tests.length})`);
      const page = await browser.newPage();
      // TODO: Serve the files on localhost and use that, the `file:///` protocol will have different behavior
      // TODO: Figure out why index.html doesn't work here and hangs the agent
      await page.goto('https://agendum.today');
      // TODO: Race this with a timeout to kill too-long-running tests
      try {
        await test(page);
      } catch (error) {
        errors.push(error);
      }
      
      await page.screenshot({ path: `screenshots/${test.name}.png` });
      await page.close();
    }
    
    await browser.close();
    
    if (errors.length > 0) {
      for (const error of errors) {
        console.log(error);
      }
      
      console.error(`${errors.length} tests out of ${tests.length} have failed.`);
    }
  } catch (error) {
    console.error(error.message);
  }
}()

async function testLoadingApplication(page) {
  await page.waitForSelector('#editorInput');
}

async function testCreatingAnItemWithBasicEditor(page) {
  await page.waitForFunction(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#editorInput');
  await page.type('#editorInput', 'Test creating an item');
  await page.waitFor(1000);
  await page.click('#submitButton');
  // TODO: Verify the item has been created
}

async function testFailing(page) {
  await page.click('#nonExisting');
}
