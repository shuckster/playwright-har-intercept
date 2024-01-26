const { readFileSync } = require("node:fs");
const { test, expect } = require("@playwright/test");
const { SERVER_PORT } = require("./server-port.cjs");

test("routeFromHAR vs. page.route", async ({ page }) => {
  //
  // Mocking
  //

  const mockId = "12345";

  await page.route("**", async (route, request) => {
    if (request.method() !== "POST") {
      route.continue();
      return;
    }

    const requestData = JSON.parse(request.postData());
    if (requestData.id) {
      requestData.id = mockId;
    }

    route.continue({
      method: request.method(),
      headers: request.headers(),
      postData: JSON.stringify(requestData),
    });
  });

  await page.routeFromHAR("./hars/httpbin.har", {
    url: "https://httpbin.org/post",
    update: true,
    updateContent: "embed",
  });

  //
  // Testing
  //

  await page.goto(`http://localhost:${SERVER_PORT}/index.html`);

  const harAsJson = readFileSync("./hars/httpbin.har");
  const har = JSON.parse(harAsJson);
  const postDataTextAsJson = har.log.entries[0].request.postData.text;
  const postDataText = JSON.parse(postDataTextAsJson);
  const { id: harId } = postDataText;

  expect(harId).toBe(mockId);
});
