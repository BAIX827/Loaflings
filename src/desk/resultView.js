/**
 * Public renderer-safe projection of a CORE DaylingResult.
 * Keep this pure so it can be tested without Electron.
 */
const { recipeFromResult } = require('./characterRecipe');

function slimResult(result) {
  return {
    date: result.date,
    kind: result.kind || 'loafling',
    energy: result.energy,
    genes: result.genes,
    personality: result.personality,
    rarity: result.rarity,
    style: result.style,
    appearance: recipeFromResult(result),
    traits: result.traits,
    events: result.events,
  };
}

module.exports = { slimResult };
