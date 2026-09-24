'use strict';

const { recipeFromResult, normalizeCharacterRecipe } = require('./characterRecipe');
const manifest = require('../../character/modular/manifest.json');

// The catalog follows hatchable visual recipes. Role outfits remain wardrobe inspiration.
const VARIANTS = Object.freeze([
  ...manifest.templates.basic,
  ...manifest.templates.mutations,
].map((file) => {
  const template = require(`../../character/modular/${file}`);
  return {
    id: template.id,
    rarity: template.kind === 'basic' ? 'common'
      : template.id === 'mutation_twin_cloud' ? 'epic' : 'rare',
    appearance: normalizeCharacterRecipe(template.recipe),
  };
}));

function variantIdFromAppearance(appearance) {
  const recipe = normalizeCharacterRecipe(appearance);
  if (recipe.cloudMood === 'cloud_twin') return 'mutation_twin_cloud';
  if (recipe.body === 'body_round_mocha') return 'mutation_sesame';
  if (recipe.body === 'body_pointy_strawberry') return 'mutation_dapple';
  if (recipe.body === 'body_melted_matcha') return 'mutation_sprout_cloud';
  if (recipe.marking === 'marking_patchy') return 'mutation_patchy';
  const basic = VARIANTS.find((variant) => variant.rarity === 'common' && variant.appearance.body === recipe.body);
  return basic?.id || 'basic_classic';
}

function buildCatalog(items) {
  const validItems = Array.isArray(items) ? items.filter((item) => item && item.date) : [];
  const slots = VARIANTS.map((variant, index) => {
    const matches = validItems
      .filter((item) => variantIdFromAppearance(recipeFromResult(item)) === variant.id)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const latest = matches[0] || null;
    const oldest = matches[matches.length - 1] || null;
    return {
      number: index + 1,
      id: variant.id,
      rarity: variant.rarity,
      collected: Boolean(latest),
      count: matches.length,
      firstCollectedDate: oldest?.date || null,
      latestCollectedDate: latest?.date || null,
      latestEntryId: latest?.id || null,
      appearance: latest ? recipeFromResult(latest) : variant.appearance,
    };
  });
  return {
    version: 2,
    total: slots.length,
    collectedCount: slots.filter((slot) => slot.collected).length,
    slots,
  };
}

module.exports = { VARIANTS, variantIdFromAppearance, buildCatalog };
