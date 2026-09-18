/**
 * CLI smoke: npm run settle:demo (no tsx — uses compiled runtime)
 */
const { runDemoSettle } = require('./pipeline');

const { result, hatch, fixturePath, apiSource } = runDemoSettle();
console.log(
  JSON.stringify(
    {
      fixture: fixturePath,
      apiSource,
      phase: hatch.phase,
      kind: result.kind,
      genes: result.genes,
      energy: result.energy,
      personality: result.personality,
      rarity: result.rarity,
      events: result.events,
    },
    null,
    2,
  ),
);
