/**
 * Legacy stub — live path is hooks/senseLive.js (DAY-SENSE).
 */
function createSenseStub() {
  return {
    status: 'live-wired',
    moduleHint: 'src/sense/liveSensor.js',
    bridgeHint: 'src/desk/hooks/senseLive.js',
    fixtureHint: 'src/sense/fixtures/demo-day.json',
  };
}

module.exports = { createSenseStub };
