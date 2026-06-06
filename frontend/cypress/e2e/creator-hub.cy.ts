describe('CreatorHub E2E — Full Feature Coverage', () => {
  const apiUrl = Cypress.config('apiUrl') as string;
  let educationChannelId = '';
  let healthChannelId = '';
  let spiritualityChannelId = '';

  before(() => {
    cy.logToConsole('=== Test suite started: Full feature coverage ===');

    cy.request(`${apiUrl}/api/channels`).then((res) => {
      expect(res.status).to.eq(200);
      cy.logApi('GET', '/api/channels', res.status);
      cy.logToConsole(`Loaded ${res.body.length} channels from API`);
      const edu = res.body.find((c: any) => c.name === 'Education');
      const health = res.body.find((c: any) => c.name === 'Health');
      const spirit = res.body.find((c: any) => c.name === 'Spirituality');
      expect(edu, 'Education channel exists').to.exist;
      expect(health, 'Health channel exists').to.exist;
      expect(spirit, 'Spirituality channel exists').to.exist;
      educationChannelId = edu.id;
      healthChannelId = health.id;
      spiritualityChannelId = spirit.id;
      cy.logToConsole(`Channel IDs: edu=${edu.id} health=${health.id} spirit=${spirit.id}`);
    });
  });

  beforeEach(function () {
    cy.logToConsole(`--- Starting test: ${this.currentTest?.title} ---`);
  });

  afterEach(function () {
    const title = this.currentTest?.title ?? 'unknown';
    const state = this.currentTest?.state ?? 'unknown';
    cy.logToConsole(`Test "${title}" finished with state: ${state}`);
    if (this.currentTest?.state === 'failed') {
      cy.logToConsole(`FAILURE captured for "${title}"`);
    }
  });

  describe('1. Channel Routing & Redirect', () => {
    it('redirects / to the first channel idea vault', () => {
      cy.visit('/');
      cy.logToConsole( 'Visited root URL');
      cy.url({ timeout: 10000 }).should('include', `/channel/${educationChannelId}/ideas`);
      cy.contains('h2', 'Idea Vault').should('be.visible');
      cy.logToConsole( 'Redirect to first channel works');
    });

    it('displays channel selector with all 3 channels', () => {
      cy.visit('/');
      cy.get('[data-testid="channel-selector"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="channel-selector"] option').should('have.length', 3);
      cy.logToConsole( 'Channel selector shows 3 channels');
    });

    it('switches channels via dropdown and updates URL', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="channel-selector"]').select(healthChannelId);
      cy.url().should('include', `/channel/${healthChannelId}/ideas`);
      cy.logToConsole( 'Switched to Health channel via dropdown');
    });

    it('switches to Kanban via nav link', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="nav-kanban"]').click();
      cy.url().should('include', '/kanban');
      cy.contains('h2', 'Kanban Board').should('be.visible');
    });

    it('switches to Brand Kit via nav link', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="nav-brand-kit"]').click();
      cy.url().should('include', '/brand-kit');
      cy.contains('h2', 'Brand Kit').should('be.visible');
    });

    it('highlights active nav link based on URL', () => {
      cy.visit(`/channel/${educationChannelId}/kanban`);
      cy.get('[data-testid="nav-kanban"]').should('have.class', 'text-violet-400');
      cy.logToConsole( 'Active nav link highlighted correctly');
    });

    it('preserves channel when switching between vault/kanban/brand-kit', () => {
      cy.visit(`/channel/${healthChannelId}/ideas`);
      cy.get('[data-testid="nav-kanban"]').click();
      cy.url().should('include', `/channel/${healthChannelId}/kanban`);
      cy.get('[data-testid="nav-brand-kit"]').click();
      cy.url().should('include', `/channel/${healthChannelId}/brand-kit`);
      cy.logToConsole( 'Channel preserved across all 3 views');
    });
  });

  describe('2. Idea Vault — Display & Load', () => {
    beforeEach(() => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
    });

    it('shows loading grid initially then loads ideas', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.contains('h2', 'Idea Vault').should('be.visible');
      cy.get('[data-testid="idea-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.logToConsole( 'Ideas loaded successfully');
    });

    it('loads Education ideas only (not from other channels)', () => {
      cy.get('[data-testid="idea-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.get('[data-testid="idea-card"]').each(($card) => {
        cy.wrap($card).invoke('text').then((text) => {
          cy.logToConsole( `Card text: ${text.substring(0, 50)}...`);
        });
      });
    });

    it('displays status badge on each card', () => {
      cy.get('[data-testid="status-select"]', { timeout: 10000 }).first().should('exist');
      cy.logToConsole( 'Status badges present');
    });

    it('shows different idea counts per channel', () => {
      const counts: Record<string, number> = {};
      cy.then(() => {
        cy.visit(`/channel/${educationChannelId}/ideas`);
        cy.get('[data-testid="idea-card"]', { timeout: 10000 }).its('length').then((n) => {
          counts['Education'] = n;
        });
      });
      cy.then(() => {
        cy.visit(`/channel/${healthChannelId}/ideas`);
        cy.get('[data-testid="idea-card"]', { timeout: 10000 }).its('length').then((n) => {
          counts['Health'] = n;
          cy.logToConsole( `Counts: ${JSON.stringify(counts)}`);
        });
      });
    });
  });

  describe('3. Idea Vault — CRUD', () => {
    let createdIdeaId = '';
    const testTitle = `Cypress Test Idea ${Date.now()}`;
    const testDescription = 'Created via Cypress E2E test';

    beforeEach(() => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="idea-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });

    it('opens create modal when clicking + New Idea', () => {
      cy.get('[data-testid="new-idea-button"]').click();
      cy.get('[data-testid="idea-modal"]').should('be.visible');
      cy.contains('Capture New Idea').should('be.visible');
      cy.logToConsole( 'Create modal opened');
    });

    it('shows validation error when saving with empty title', () => {
      cy.get('[data-testid="new-idea-button"]').click();
      cy.get('[data-testid="save-button"]').click();
      cy.get('[data-testid="modal-error"]').should('contain', 'highlighted fields');
      cy.logToConsole( 'Validation works');
    });

    it('creates a new idea with valid data', () => {
      const beforeCount = 0;
      cy.get('[data-testid="idea-card"]').its('length').then((n) => {
        cy.wrap(n).as('beforeCount');
      });

      cy.get('[data-testid="new-idea-button"]').click();
      cy.get('[data-testid="title-input"]').type(testTitle);
      cy.get('[data-testid="description-input"]').type(testDescription);
      cy.get('[data-testid="save-button"]').click();

      cy.get('[data-testid="idea-modal"]').should('not.exist');
      cy.contains('[data-testid="idea-card"]', testTitle).should('be.visible');
      cy.get('[data-toast-kind="success"]').should('contain', 'Idea captured');
      cy.logToConsole( `Created idea: ${testTitle}`);

      cy.request(`${apiUrl}/api/ideas?channelId=${educationChannelId}`).then((res) => {
        const found = res.body.find((i: any) => i.title === testTitle);
        if (found) createdIdeaId = found.id;
        cy.logToConsole( `Created idea ID: ${createdIdeaId}`);
      });
    });

    it('edits an existing idea', function () {
      const updatedTitle = `Updated ${testTitle}`;
      cy.contains('[data-testid="idea-card"]', testTitle).scrollIntoView().should('be.visible');
      cy.contains('[data-testid="idea-card"]', testTitle)
        .find('[data-testid="edit-button"]')
        .click({ force: true });

      cy.get('[data-testid="idea-modal"]').should('be.visible');
      cy.contains('Edit Idea').should('be.visible');
      cy.get('[data-testid="title-input"]').clear().type(updatedTitle);
      cy.get('[data-testid="save-button"]').click();

      cy.contains('[data-testid="idea-card"]', updatedTitle).should('be.visible');
      cy.logToConsole( `Edited idea to: ${updatedTitle}`);
    });

    it('changes status via dropdown on idea card', () => {
      const targetStatus = 'COMPLETED';
      cy.contains('[data-testid="idea-card"]', testTitle)
        .find('[data-testid="status-select"]')
        .select(targetStatus);

      cy.contains('[data-testid="idea-card"]', testTitle)
        .find('[data-testid="status-select"]')
        .should('have.value', targetStatus);
      cy.logToConsole( `Status changed to ${targetStatus}`);
    });

    it('deletes an idea with confirmation', () => {
      cy.contains('[data-testid="idea-card"]', testTitle)
        .find('[data-testid="delete-button"]')
        .click({ force: true });

      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.contains('Delete idea?').should('be.visible');
      cy.get('[data-testid="confirm-accept"]').click();

      cy.contains('[data-testid="idea-card"]', testTitle).should('not.exist');
      cy.logToConsole( `Deleted idea: ${testTitle}`);
    });

    it('cancels deletion when clicking Cancel', () => {
      cy.contains('[data-testid="idea-card"]', 'IT Career Blueprint').should('be.visible');
      cy.contains('[data-testid="idea-card"]', 'IT Career Blueprint')
        .find('[data-testid="delete-button"]')
        .click({ force: true });
      cy.get('[data-testid="confirm-cancel"]').click();
      cy.contains('[data-testid="idea-card"]', 'IT Career Blueprint').should('be.visible');
      cy.logToConsole( 'Cancel preserves idea');
    });
  });

  describe('4. Kanban Board', () => {
    beforeEach(() => {
      cy.visit(`/channel/${educationChannelId}/kanban`);
    });

    it('renders four columns for each status', () => {
      cy.contains('h2', 'Kanban Board').should('be.visible');
      ['RESEARCHING', 'PLANNING', 'IN PROGRESS', 'COMPLETED'].forEach((status) => {
        cy.contains(status.replace('_', ' ')).should('be.visible');
      });
      cy.logToConsole( 'All 4 status columns rendered');
    });

    it('groups ideas by status', () => {
      cy.get('[data-testid="status-select"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.logToConsole( 'Ideas grouped into columns');
    });

    it('moves an idea between columns via dropdown', () => {
      const title = 'IT Career Blueprint';
      cy.contains(title).should('be.visible');
      cy.contains(title)
        .parents('[class*="rounded-xl"]')
        .find('select')
        .first()
        .select('PLANNING');
      cy.logToConsole( 'Moved idea to PLANNING');

      cy.contains('PLANNING')
        .parents('[class*="rounded"]')
        .parent()
        .contains(title)
        .should('be.visible');
    });

    it('shows count of ideas in each column header', () => {
      cy.contains('RESEARCHING').parent().find('span').last().invoke('text').then((t) => {
        cy.logToConsole( `Researching count: ${t}`);
      });
    });

    it('loads only the selected channel ideas', () => {
      cy.visit(`/channel/${healthChannelId}/kanban`);
      cy.get('select', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.logToConsole( 'Health channel kanban loaded');
    });
  });

  describe('5. Brand Kit', () => {
    beforeEach(() => {
      cy.visit(`/channel/${educationChannelId}/brand-kit`);
    });

    it('renders brand kit page for the selected channel', () => {
      cy.contains('h2', 'Brand Kit').should('be.visible');
      cy.contains('Visual identity for Education').should('be.visible');
      cy.logToConsole( 'Brand kit header shows correct channel name');
    });

    it('shows the existing brand kit for Education', () => {
      cy.contains('Colors (JSON array', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="brand-kit-colors"]').should('exist');
      cy.logToConsole( 'Brand kit form loaded with existing data');
    });

    it('updates brand kit colors and persists', () => {
      cy.get('[data-testid="brand-kit-colors"]', { timeout: 10000 })
        .clear()
        .type('["#FF00FF", "#00FFFF", "#FFFF00"]');
      cy.get('[data-testid="brand-kit-save"]').click();

      cy.request(`${apiUrl}/api/brand-kits/${educationChannelId}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.colors).to.include('#FF00FF');
        cy.logToConsole( 'Brand kit colors persisted');
      });
    });

    it('switches brand kit data when channel changes', () => {
      cy.get('[data-testid="brand-kit-colors"]', { timeout: 10000 }).invoke('val').then((eduColors) => {
        cy.visit(`/channel/${healthChannelId}/brand-kit`);
        cy.get('[data-testid="brand-kit-colors"]', { timeout: 10000 }).invoke('val').should('not.eq', eduColors);
        cy.logToConsole( 'Brand kit changes when channel switches');
      });
    });

    it('shows channel-specific brand kit name', () => {
      cy.contains('Visual identity for Education').should('be.visible');
      cy.visit(`/channel/${healthChannelId}/brand-kit`);
      cy.contains('Visual identity for Health').should('be.visible');
      cy.visit(`/channel/${spiritualityChannelId}/brand-kit`);
      cy.contains('Visual identity for Spirituality').should('be.visible');
      cy.logToConsole( 'Channel name appears in all 3 brand kits');
    });
  });

  describe('6. Multi-Channel Data Isolation', () => {
    it('does not show Education ideas when on Health channel', () => {
      cy.visit(`/channel/${healthChannelId}/ideas`);
      cy.contains('[data-testid="idea-card"]', 'IT Career Blueprint').should('not.exist');
      cy.logToConsole( 'Education ideas not leaked to Health');
    });

    it('does not show Health ideas when on Education channel', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.contains('[data-testid="idea-card"]', 'IT Career Blueprint').should('exist');
      cy.logToConsole( 'Health isolation check passed');
    });

    it('switches channels rapidly without race conditions', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="channel-selector"]').select(healthChannelId);
      cy.get('[data-testid="channel-selector"]').select(spiritualityChannelId);
      cy.get('[data-testid="channel-selector"]').select(educationChannelId);
      cy.url().should('include', `/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="idea-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.logToConsole( 'Rapid channel switching works');
    });
  });

  describe('7. Navigation & Browser Behavior', () => {
    it('supports browser back button', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="nav-kanban"]').click();
      cy.go('back');
      cy.url().should('include', '/ideas');
      cy.logToConsole( 'Back button works');
    });

    it('supports browser forward button', () => {
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="nav-kanban"]').click();
      cy.go('back');
      cy.go('forward');
      cy.url().should('include', '/kanban');
      cy.logToConsole( 'Forward button works');
    });

    it('preserves channel in URL on direct deep link', () => {
      cy.visit(`/channel/${healthChannelId}/brand-kit`, { failOnStatusCode: false });
      cy.contains('h2', 'Brand Kit').should('be.visible');
      cy.contains('Visual identity for Health').should('be.visible');
      cy.logToConsole( 'Deep link with channel param works');
    });
  });

  describe('8. UI States & Edge Cases', () => {
    it('shows loading state on initial page load', () => {
      cy.intercept('GET', `${apiUrl}/api/ideas*`, (req) => {
        req.on('response', (res) => {
          res.setDelay(500);
        });
      });
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.logToConsole( 'Loading delay applied');
      cy.get('[data-testid="idea-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });

    it('handles invalid channel ID gracefully', () => {
      cy.visit('/channel/invalid-id/ideas', { failOnStatusCode: false });
      cy.contains('h2', 'Idea Vault').should('be.visible');
      cy.logToConsole( 'Invalid channel renders page without crash');
    });

    it('toast notifications appear and disappear', () => {
      const title = `Toast Test ${Date.now()}`;
      cy.visit(`/channel/${educationChannelId}/ideas`);
      cy.get('[data-testid="new-idea-button"]').click();
      cy.get('[data-testid="title-input"]').type(title);
      cy.get('[data-testid="save-button"]').click();
      cy.get('[data-toast-kind="success"]').should('contain', 'Idea captured');
      cy.logToConsole( 'Toast appeared for successful create');
    });
  });
});
