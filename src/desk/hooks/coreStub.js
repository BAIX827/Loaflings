/**
 * Core integration notes — live settle runs via src/desk/pipeline.js → settleDay().
 */
function createCoreStub() {
  return {
    status: 'pipeline-wired',
    moduleHint: 'src/core/',
    async settleDay(_profile) {
      return null; // use window.loaflings.getDemoSettle() in MVP
    },
    async getGenes() {
      return null;
    },
  };
}

module.exports = { createCoreStub };
