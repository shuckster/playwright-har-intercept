// @ts-check
const { defineConfig, devices } = require("@playwright/test");
const { SERVER_PORT } = require("./src/server-port.cjs");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: [
    ["html", { open: "on-failure", outputFolder: "reports/e2e" }],
    ["junit", { outputFile: "reports/e2e/junit.xml" }],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: true,
    trace: "on-first-retry",
    launchOptions: { slowMo: 0 },
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run start",
    url: `http://127.0.0.1:${SERVER_PORT}`,
    reuseExistingServer: true,
    timeout: 5000,
  },
});
