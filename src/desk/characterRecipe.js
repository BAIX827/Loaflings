'use strict';

/**
 * Renderer-safe contract for the modular SVG character library.
 * Kept in plain CommonJS so main/preload/tests can share the same validation.
 */
const manifest = require('../../character/modular/manifest.json');

const RECIPE_FIELDS = Object.freeze([
  'body',
  'marking',
  'expression',
  'cloudMood',
  'headwear',
  'facewear',
  'outfit',
]);

const DEFAULT_RECIPE = Object.freeze({ ...manifest.defaultRecipe });
const DEFAULT_WARDROBE = Object.freeze({
  headwear: DEFAULT_RECIPE.headwear,
  facewear: DEFAULT_RECIPE.facewear,
  outfit: DEFAULT_RECIPE.outfit,
});

function hasChoice(group, id) {
  return typeof id === 'string' && Object.hasOwn(group, id);
}

function compatible(entry, body) {
  return !entry || !Array.isArray(entry.compatibleBodies) || entry.compatibleBodies.includes(body);
}

/**
 * @param {object|null|undefined} candidate
 * @returns {object}
 */
function normalizeCharacterRecipe(candidate) {
  const input = candidate && typeof candidate === 'object' ? candidate : {};
  const body = hasChoice(manifest.bodies, input.body) ? input.body : DEFAULT_RECIPE.body;
  const recipe = {
    body,
    marking: hasChoice(manifest.markings, input.marking) ? input.marking : DEFAULT_RECIPE.marking,
    expression: hasChoice(manifest.expressions, input.expression)
      ? input.expression
      : DEFAULT_RECIPE.expression,
    cloudMood: hasChoice(manifest.cloudMoods, input.cloudMood)
      ? input.cloudMood
      : DEFAULT_RECIPE.cloudMood,
    headwear: hasChoice(manifest.headwear, input.headwear) ? input.headwear : DEFAULT_RECIPE.headwear,
    facewear: hasChoice(manifest.facewear, input.facewear) ? input.facewear : DEFAULT_RECIPE.facewear,
    outfit: hasChoice(manifest.outfits, input.outfit) ? input.outfit : DEFAULT_RECIPE.outfit,
  };

  const groupBySlot = {
    marking: 'markings',
    headwear: 'headwear',
    facewear: 'facewear',
    outfit: 'outfits',
  };
  for (const slot of Object.keys(groupBySlot)) {
    const entry = manifest[groupBySlot[slot]][recipe[slot]];
    if (!compatible(entry, body)) recipe[slot] = 'none';
  }
  return recipe;
}

/**
 * Validate the three player-controlled cosmetic slots without touching the
 * Loafling's body, expression, cloud or innate marking.
 * @param {object|null|undefined} candidate
 * @param {string} [body]
 * @returns {{ headwear: string, facewear: string, outfit: string }}
 */
function normalizeWardrobe(candidate, body = DEFAULT_RECIPE.body) {
  const input = candidate && typeof candidate === 'object' ? candidate : {};
  const safeBody = hasChoice(manifest.bodies, body) ? body : DEFAULT_RECIPE.body;
  const wardrobe = {
    headwear: hasChoice(manifest.headwear, input.headwear)
      ? input.headwear
      : DEFAULT_WARDROBE.headwear,
    facewear: hasChoice(manifest.facewear, input.facewear)
      ? input.facewear
      : DEFAULT_WARDROBE.facewear,
    outfit: hasChoice(manifest.outfits, input.outfit)
      ? input.outfit
      : DEFAULT_WARDROBE.outfit,
  };
  const groupBySlot = { headwear: 'headwear', facewear: 'facewear', outfit: 'outfits' };
  for (const slot of Object.keys(wardrobe)) {
    if (!compatible(manifest[groupBySlot[slot]]?.[wardrobe[slot]], safeBody)) wardrobe[slot] = 'none';
  }
  return wardrobe;
}

/**
 * Backward-compatible recipe for collection rows saved before appearance v1.
 * Mirrors the deterministic CORE mapping without changing old gene fields.
 */
function legacyRecipeFromResult(result) {
  const personality = result?.personality || 'balanced';
  const rarity = result?.rarity || 'common';
  const dream = Number(result?.energy?.dream) || 0;
  const recipe = { ...DEFAULT_RECIPE };

  if (personality === 'builder') {
    recipe.expression = 'expr_focused';
    recipe.cloudMood = 'cloud_focused';
  } else if (personality === 'explorer') {
    recipe.body = 'body_chubby';
    recipe.expression = 'expr_curious';
    recipe.cloudMood = 'cloud_curious';
  } else if (personality === 'dreamer') {
    recipe.body = 'body_long';
    recipe.expression = 'expr_sleepy';
    recipe.cloudMood = dream > 35 ? 'cloud_dreamy' : 'cloud_sleepy';
  } else {
    recipe.expression = 'expr_happy';
    recipe.cloudMood = 'cloud_happy';
  }

  if (rarity === 'rare') recipe.marking = 'marking_patchy';
  if (rarity === 'epic') recipe.cloudMood = 'cloud_twin';
  return normalizeCharacterRecipe(recipe);
}

function recipeFromResult(result) {
  if (result?.appearance && typeof result.appearance === 'object') {
    return normalizeCharacterRecipe(result.appearance);
  }
  return legacyRecipeFromResult(result);
}

function entrySource(groupName, id) {
  const entry = manifest[groupName]?.[id];
  return entry && typeof entry.src === 'string' ? entry.src : null;
}

/**
 * Resolve draw-order layers for one validated recipe.
 * @returns {{ recipe: object, body: object, layers: { slot: string, src: string }[] }}
 */
function layersForRecipe(candidate) {
  const recipe = normalizeCharacterRecipe(candidate);
  const body = manifest.bodies[recipe.body];
  const bySlot = {
    shadow: body.shadow,
    tail: body.tail,
    body: body.body,
    marking: entrySource('markings', recipe.marking),
    outfit: entrySource('outfits', recipe.outfit),
    expression: entrySource('expressions', recipe.expression),
    facewear: entrySource('facewear', recipe.facewear),
    pawsForeground: body.pawsForeground,
    headwear: entrySource('headwear', recipe.headwear),
    cloudMood: entrySource('cloudMoods', recipe.cloudMood),
  };
  const layers = manifest.drawOrder
    .map((slot) => ({ slot, src: bySlot[slot] }))
    .filter((layer) => typeof layer.src === 'string');
  return { recipe, body, layers };
}

function recipeToken(candidate) {
  const recipe = normalizeCharacterRecipe(candidate);
  return RECIPE_FIELDS.map((field) => recipe[field]).join('|');
}

module.exports = {
  manifest,
  RECIPE_FIELDS,
  DEFAULT_RECIPE,
  DEFAULT_WARDROBE,
  normalizeCharacterRecipe,
  normalizeWardrobe,
  legacyRecipeFromResult,
  recipeFromResult,
  layersForRecipe,
  recipeToken,
};
