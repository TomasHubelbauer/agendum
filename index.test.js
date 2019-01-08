const puppeteer = require('puppeteer');
const fs = require('fs');

describe('unit tests', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('UI tests', () => {
  let browser;
  let page;

  // TODO: Replace this with reading process.argv for the artifact directory and upload that
  fs.mkdirSync('screenshots');

  beforeEach(async () => {
    jest.setTimeout(10000);
    browser = await puppeteer.launch();
    page = (await browser.pages())[0];
    // TODO: Serve the files on localhost and use that, the `file:///` protocol will have different behavior
    await page.goto(`file:${__dirname}/index.html`);
    await page.reload();
  });

  afterEach(async () => {
    await browser.close();
  });

  const createsAnItemUsingBasicEditor = 'createsAnItemUsingBasicEditor';
  test(createsAnItemUsingBasicEditor, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    await page.click('#submitButton');
    const item = await page.$('details');
    await page.screenshot({ path: `screenshots/${createsAnItemUsingBasicEditor}.png` });
    expect(item).not.toBeNull();
  });

  const createsAnItemUsingRichEditor = 'createsAnItemUsingRichEditor';
  test(createsAnItemUsingRichEditor, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    await page.focus('#editorInput');
    // TODO: Figure out why this doesn't work
    await page.keyboard.down('Meta');
    await page.keyboard.type('Enter');
    await page.keyboard.up('Meta');
    await page.click('#submitButton');
    const item = await page.$('details');
    await page.screenshot({ path: `screenshots/${createsAnItemUsingRichEditor}.png` });
    expect(item).not.toBeNull();
  });
  
  const storesADraftUponTabBlue = 'storesADraftUponTabBlur';
  test(storesADraftUponTabBlue, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    const tab = await browser.newPage();
    await tab.close();
    const draft = await page.$('#draftsDiv > div');
    await page.screenshot({ path: `screenshots/${storesADraftUponTabBlue}.png` });
    expect(draft).not.toBeNull();
  });
});
