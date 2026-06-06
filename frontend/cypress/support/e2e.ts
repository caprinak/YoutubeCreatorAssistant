declare namespace Cypress {
  interface Chainable {
    logToConsole(msg: string): Chainable<void>;
    logApi(method: string, url: string, status?: number): Chainable<void>;
  }
}

Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error').as('consoleError');
  cy.spy(win.console, 'warn').as('consoleWarn');
});

Cypress.on('uncaught:exception', (err) => {
  console.error('[CYPRESS] Uncaught exception:', err.message);
  console.error('[CYPRESS] Stack:', err.stack);
  return false;
});

Cypress.Commands.add('logToConsole', (msg: string) => {
  cy.task('log', msg);
});

Cypress.Commands.add('logApi', (method: string, url: string, status?: number) => {
  const statusText = status !== undefined ? ` [${status}]` : '';
  cy.task('log', `API ${method} ${url}${statusText}`);
});
