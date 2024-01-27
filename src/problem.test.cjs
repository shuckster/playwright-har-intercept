const { readFileSync } = require("node:fs");
const { test, expect } = require("@playwright/test");
const { SERVER_PORT } = require("./server-port.cjs");

test("routeFromHAR vs. page.route", async ({ page }) => {
  //
  // Mocking
  //

  const mockId = "12345";

  await page.routeFromHAR("./hars/httpbin.har", {
    url: "https://httpbin.org/post",
    update: false,
    updateContent: "embed",
  });

  await page.route("**/*", async (route) => {
    if (route.request().method() !== "POST") {
      return route.continue();
    }
    console.log('=== fulfill ===');
    const response = await route.fetch();
    const json = await response.json();
    json.json.id = mockId;

    const requestData = route.request();
    requestData.id = mockId;

    return route.fulfill({
      response,
      json,
      postData: JSON.stringify(requestData)
    });
  });

  await page.route("**/*", async (route, request) => {
    if (route.request().method() !== "POST") {
      return route.continue();
    }
    console.log('=== fallback ===');
    const requestData = JSON.parse(request.postData());
    if (requestData.id) {
      requestData.id = mockId;
    }
    return route.fallback({
      postData: JSON.stringify(requestData),
    });
  });


  //
  // Testing
  //

  await page.goto(`http://localhost:${SERVER_PORT}/index.html`);
  await delay(1000);

  const harAsJson = readFileSync("./hars/httpbin.har");
  const har = JSON.parse(harAsJson);
  const postDataTextAsJson = har.log.entries[1]?.request.postData.text ?? '{ id: "oops" }';
  const postDataText = JSON.parse(postDataTextAsJson);
  const { id: harId } = postDataText;

  await delay(1000);

  expect(await page.evaluate('window.idValue')).toBe(mockId);
  expect(await page.evaluate('window.nameValue')).toBe('Gordon Freeman');
  expect(await page.evaluate('window.ageValue')).toBe(27);
  expect(harId).toBe(mockId);
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
