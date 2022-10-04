//https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/
//node server
//./node_modules/.bin/mocha tests.js --timeout 10000

const express = require('express');
const path = require('path');
const {
  By,
  Builder
} = require('selenium-webdriver');
const {
  suite
} = require('selenium-webdriver/testing');
const assert = require("assert");

const port = 8083;

let driver;

suite(function(env) {
  describe('Tests', function() {

    before(async function() {
      driver = await new Builder().forBrowser('chrome').build();

      startTestingWebServer();
    });

    after(async () => await driver.quit());

    it('Test Headers', async function() {
      const workerThreads = 4;
      const totalRequests = 2;

      await driver.get('http://localhost:8080/');

      await checkTitle();

      await populateSettings("/testHeaders", "GET")

      let headerKeyInput = await driver.findElement(By.id("headerKey"))
      let headerValueInput = await driver.findElement(By.id("headerValue"))

      const addHeaderParamButton = await driver.findElement(By.id('addHeaderParamButton'));

      await headerKeyInput.clear()
      await headerKeyInput.sendKeys("key1");
      await headerValueInput.clear()
      await headerValueInput.sendKeys("value1");
      await addHeaderParamButton.click();

      await headerKeyInput.clear()
      await headerKeyInput.sendKeys("key2");
      await headerValueInput.clear()
      await headerValueInput.sendKeys("value2");
      await addHeaderParamButton.click();

      let submitButton = await driver.findElement(By.css("input[type='submit']"))

      await submitButton.click();

      let response = await driver.findElement(By.tagName('pre'));

      let responseText = await response.getText();

      console.log(responseText)

      let totalMatches = responseText.split('{"content-type":"application/x-www-form-urlencoded","key1":"value1","key2":"value2","host":"localhost:8083","connection":"close"}').length - 1;

      assert.equal(workerThreads * totalRequests, totalMatches);

      //await driver.sleep(20000)
    });

    it('Test Body', async function() {
      const workerThreads = 4;
      const totalRequests = 2;

      await driver.get('http://localhost:8080/');

      await checkTitle();

      await populateSettings("/testBody", "POST")

      let bodyKeyInput = await driver.findElement(By.id("bodyKey"))
      let bodyValueInput = await driver.findElement(By.id("bodyValue"))

      const addBodyParamButtonButton = await driver.findElement(By.id('addBodyParamButton'));

      await bodyKeyInput.clear()
      await bodyKeyInput.sendKeys("key1");
      await bodyValueInput.clear()
      await bodyValueInput.sendKeys("value1");
      await addBodyParamButtonButton.click();

      await bodyKeyInput.clear()
      await bodyKeyInput.sendKeys("key2");
      await bodyValueInput.clear()
      await bodyValueInput.sendKeys("value2");
      await addBodyParamButtonButton.click();

      let submitButton = await driver.findElement(By.css("input[type='submit']"))

      await submitButton.click();

      let response = await driver.findElement(By.tagName('pre'));

      let responseText = await response.getText();

      console.log(responseText)

      let totalMatches = responseText.split('{"key1":"value1","key2":"value2"}').length - 1;

      assert.equal(workerThreads * totalRequests, totalMatches);

    });

    it('Test Remove buttons', async function() {
      await driver.get('http://localhost:8080/');

      await checkTitle();

      let headerKeyInput = await driver.findElement(By.id("headerKey"))
      let headerValueInput = await driver.findElement(By.id("headerValue"))

      const addHeaderParamButton = await driver.findElement(By.id('addHeaderParamButton'));

      await headerKeyInput.clear()
      await headerKeyInput.sendKeys("key1");
      await headerValueInput.clear()
      await headerValueInput.sendKeys("value1");
      await addHeaderParamButton.click();

      await headerKeyInput.clear()
      await headerKeyInput.sendKeys("key2");
      await headerValueInput.clear()
      await headerValueInput.sendKeys("value2");
      await addHeaderParamButton.click();

      let bodyKeyInput = await driver.findElement(By.id("bodyKey"))
      let bodyValueInput = await driver.findElement(By.id("bodyValue"))

      const addBodyParamButtonButton = await driver.findElement(By.id('addBodyParamButton'));

      await bodyKeyInput.clear()
      await bodyKeyInput.sendKeys("key1");
      await bodyValueInput.clear()
      await bodyValueInput.sendKeys("value1");
      await addBodyParamButtonButton.click();

      await bodyKeyInput.clear()
      await bodyKeyInput.sendKeys("key2");
      await bodyValueInput.clear()
      await bodyValueInput.sendKeys("value2");
      await addBodyParamButtonButton.click();

      const removeBodyParamButton1 = await driver.findElement(By.id('removeBodyParamButton1'));
      await removeBodyParamButton1.click();

      const removeHeaderButton1 = await driver.findElement(By.id('removeHeaderButton1'));
      await removeHeaderButton1.click();

      assert.equal(true, (await driver.findElements(By.id("bodyParam1"))).length == 0);
      assert.equal(true, (await driver.findElements(By.id("headerParam1"))).length == 0);

    });

  });
});

async function populateSettings(path, method) {

  let workerThreadsInput = await driver.findElement(By.css("input[name='workerThreads']"))
  await workerThreadsInput.clear()
  await workerThreadsInput.sendKeys("4");

  let delayInput = await driver.findElement(By.css("input[name='delay']"))
  await delayInput.clear()
  await delayInput.sendKeys("2000");

  let totalRequestsInput = await driver.findElement(By.css("input[name='totalRequests']"))
  await totalRequestsInput.clear()
  await totalRequestsInput.sendKeys("2");

  let methodInput = await driver.findElement(By.css("input[name='method']"))
  await methodInput.clear()
  await methodInput.sendKeys(method);

  let hostnameInput = await driver.findElement(By.css("textarea[name='hostname']"))
  await hostnameInput.clear()
  await hostnameInput.sendKeys("localhost");

  let pathInput = await driver.findElement(By.css("textarea[name='path']"))
  await pathInput.clear()
  await pathInput.sendKeys(path);

  let portInput = await driver.findElement(By.css("input[name='port']"))
  await portInput.clear()
  await portInput.sendKeys("8083");

  let protocolInput = await driver.findElement(By.css("input[name='protocol']"))
  await protocolInput.clear()
  await protocolInput.sendKeys("HTTP");

}

async function checkTitle() {
  let title = await driver.getTitle();
  assert.equal("Ddosser", title);
}

function startTestingWebServer() {

  const app = express();

  //parse post body data
  app.use(express.urlencoded({
    extended: true
  }));
  app.use(express.json());

  app.get('/testHeaders', function(req, res) {
    res.send(req.headers)
  });

  app.post('/testBody', function(req, res) {
    res.send(req.body)
  });

  app.listen(port);

  console.log("Testing Web Server stareted on port " + port)

}
