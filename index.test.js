const puppeteer = require('puppeteer');
const path = require('path');
const artifactsPath = process.env.BUILD_ARTIFACTSSTAGINGDIRECTORY || '.';

describe('unit tests', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('UI tests', () => {
  let browser;
  let page;

  beforeEach(async () => {
    jest.setTimeout(10000);
    browser = await puppeteer.launch({ headless: false });
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
    const item = await page.$('.itemSpan');
    await page.screenshot({ path: path.join(artifactsPath, createsAnItemUsingBasicEditor + '.png') });
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
    const item = await page.$('.itemSpan');
    await page.screenshot({ path: path.join(artifactsPath, createsAnItemUsingRichEditor + '.png') });
    expect(item).not.toBeNull();
  });
  
  const storesADraftUponTabBlur = 'storesADraftUponTabBlur';
  test(storesADraftUponTabBlur, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    const tab = await browser.newPage();
    await tab.close();
    const draft = await page.$('#draftsDiv > div');
    await page.screenshot({ path: path.join(artifactsPath, storesADraftUponTabBlur + '.png') });
    expect(draft).not.toBeNull();
  });
  
  const recallsADraft = 'recallsADraft';
  test(recallsADraft, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    const tab = await browser.newPage();
    await tab.close();
    await (await page.waitForXPath('//button[text()="Recall"]')).click();
    await page.screenshot({ path: path.join(artifactsPath, recallsADraft + '.png') });
    const text = await page.evaluate(() => document.querySelector('#editorInput').value);
    expect(text).toEqual('Test creating an item');
  });
  
  const dismissesADraft = 'dismissesADraft';
  test(dismissesADraft, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    const tab = await browser.newPage();
    await tab.close();
    await (await page.waitForXPath('//button[text()="Dismiss"]')).click();
    await page.screenshot({ path: path.join(artifactsPath, dismissesADraft + '.png') });
    const count = await page.evaluate(() => document.querySelector('#draftsDiv').childElementCount);
    expect(count).toEqual(0);
  });
  
  const ignoresADraft = 'ignoresADraft';
  test(ignoresADraft, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', '');
    const tab = await browser.newPage();
    await tab.close();
    await page.screenshot({ path: path.join(artifactsPath, ignoresADraft + '.png') });
    const count = await page.evaluate(() => document.querySelector('#draftsDiv').childElementCount);
    expect(count).toEqual(0);
  });
  
  const renamesAnItem = 'renamesAnItem';
  test(renamesAnItem, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    await page.click('#submitButton');
    await page.$('.itemSpan');
    page.on('dialog', dialog => dialog.accept('New name'));
    await (await page.waitForXPath('//button[text()="Rename"]')).click();
    const item = await page.$('.itemSpan');
    const text = await page.evaluate(item => item.textContent, item);
    await page.screenshot({ path: path.join(artifactsPath, renamesAnItem + '.png') });
    expect(item).not.toBeNull();
    expect(text).toEqual('New name');
  });
  
  const archivesAnItem = 'archivesAnItem';
  test(archivesAnItem, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    await page.click('#submitButton');
    await (await page.waitForXPath('//button[text()="Archive"]')).click();
    const itemQueued = await page.$('.itemSpan');
    await page.screenshot({ path: path.join(artifactsPath, archivesAnItem + '.png') });
    expect(itemQueued).toBeNull();
    await (await page.waitForXPath('//button[text()="Archived"]')).click();
    const itemArchived = await page.$('.itemSpan');
    expect(itemArchived).not.toBeNull();
  });
  
  const deletesAnItem = 'deletesAnItem';
  test(deletesAnItem, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Test creating an item');
    await page.click('#submitButton');
    await (await page.waitForXPath('//button[text()="Archive"]')).click();
    await (await page.waitForXPath('//button[text()="Archived"]')).click();
    page.on('dialog', dialog => dialog.accept());
    await (await page.waitForXPath('//button[text()="Delete"]')).click();
    await page.screenshot({ path: path.join(artifactsPath, deletesAnItem + '.png') });
    const count = await page.evaluate(() => document.querySelectorAll('.itemSpan').length);
    expect(count).toEqual(0);
  });

  const movesAnItemUp = 'movesAnItemUp';
  test(movesAnItemUp, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Item #1');
    await page.click('#submitButton');
    await page.type('#editorInput', 'Item #2');
    await page.click('#submitButton');
    await page.type('#editorInput', 'Item #3');
    await page.click('#submitButton');
    await page.click(`button[title="Move 'Item #3' up"]`);
    await page.screenshot({ path: path.join(artifactsPath, movesAnItemUp + '.png') });
    const labels = await page.evaluate(() => [...document.querySelectorAll('.itemSpan')].map(i => i.textContent));
    expect(labels).toEqual([ 'Item #1', 'Item #3', 'Item #2' ]);
  });

  const movesAnItemDown = 'movesAnItemDown';
  test(movesAnItemDown, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Item #1');
    await page.click('#submitButton');
    await page.type('#editorInput', 'Item #2');
    await page.click('#submitButton');
    await page.type('#editorInput', 'Item #3');
    await page.click('#submitButton');
    await page.click(`button[title="Move 'Item #1' down"]`);
    await page.screenshot({ path: path.join(artifactsPath, movesAnItemDown + '.png') });
    const labels = await page.evaluate(() => [...document.querySelectorAll('.itemSpan')].map(i => i.textContent));
    expect(labels).toEqual([ 'Item #2', 'Item #1', 'Item #3' ]);
  });

  const clearsAllItems = 'clearsAllItems';
  test(clearsAllItems, async () => {
    await page.waitForSelector('#editorInput');
    await page.type('#editorInput', 'Item #1');
    await page.click('#submitButton');
    await page.type('#editorInput', 'Item #2');
    await page.click('#submitButton');
    await page.type('#editorInput', 'Item #3');
    await page.click('#submitButton');
    await page.screenshot({ path: path.join(artifactsPath, clearsAllItems + '.png') });
    expect(await page.evaluate(() => document.querySelectorAll('.itemSpan').length)).toEqual(3);
    page.on('dialog', dialog => dialog.accept());
    await page.click('#clearButton');
    expect(await page.evaluate(() => document.querySelectorAll('.itemSpan').length)).toEqual(0);
  });
});
