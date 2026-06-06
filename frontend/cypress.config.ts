import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    apiUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      on('task', {
        log(message: string) {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] [E2E] ${message}`);
          return null;
        },
      });
      return config;
    },
  },
});
