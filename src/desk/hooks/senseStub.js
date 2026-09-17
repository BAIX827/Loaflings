/**
 * Sense integration notes for DESK (live path uses pipeline.js + fixture).
 * Real sensors: DAY-SENSE under src/sense/. Call excludeWindowIds when wired.
 */
function createSenseStub() {
  return {
    status: 'fixture-wired',
    moduleHint: 'src/sense/',
    fixtureHint: 'src/sense/fixtures/demo-day.json',
    async getDailyProfile() {
      return null; // use window.loaflings.getDemoSettle() in MVP
    },
    async start() {
      return { ok: false, reason: 'sensors-not-wired-use-demo-fixture' };
    },
    excludeWindowIds(_ids) {
      return { ok: false, reason: 'exclude-stub' };
    },
  };
}

module.exports = { createSenseStub };
