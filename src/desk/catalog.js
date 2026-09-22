'use strict';

const { legacyRecipeFromResult, recipeFromResult } = require('./characterRecipe');

const CATALOG_PERSONALITIES = Object.freeze([
  'builder',
  'explorer',
  'dreamer',
]);
const CATALOG_RARITIES = Object.freeze(['common', 'rare', 'epic']);

function catalogSlotId(personality, rarity) {
  return `${personality}:${rarity}`;
}

function representativeAppearance(personality, rarity) {
  return legacyRecipeFromResult({
    personality,
    rarity,
    // Keep the dreamer catalogue representative stable and visibly dreamy.
    energy: { work: 0, explore: 0, dream: 50 },
  });
}

/**
 * Project collection rows onto the complete, currently reachable catalogue.
 * A slot is a personality + rarity combination; duplicate hatches increase its
 * count without creating invented species or modifying collection storage.
 * @param {object[]} items
 */
function buildCatalog(items) {
  const validItems = Array.isArray(items)
    ? items.filter((item) => (
      item &&
      CATALOG_PERSONALITIES.includes(item.personality) &&
      CATALOG_RARITIES.includes(item.rarity)
    ))
    : [];

  const slots = [];
  for (const personality of CATALOG_PERSONALITIES) {
    for (const rarity of CATALOG_RARITIES) {
      const matches = validItems
        .filter((item) => item.personality === personality && item.rarity === rarity)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      const latest = matches[0] || null;
      const oldest = matches[matches.length - 1] || null;
      slots.push({
        number: slots.length + 1,
        id: catalogSlotId(personality, rarity),
        personality,
        rarity,
        collected: Boolean(latest),
        count: matches.length,
        firstCollectedDate: oldest?.date || null,
        latestCollectedDate: latest?.date || null,
        latestEntryId: latest?.id || null,
        appearance: latest
          ? recipeFromResult(latest)
          : representativeAppearance(personality, rarity),
      });
    }
  }

  return {
    version: 1,
    total: slots.length,
    collectedCount: slots.filter((slot) => slot.collected).length,
    slots,
  };
}

module.exports = {
  CATALOG_PERSONALITIES,
  CATALOG_RARITIES,
  catalogSlotId,
  representativeAppearance,
  buildCatalog,
};
