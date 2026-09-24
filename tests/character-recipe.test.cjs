'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_RECIPE,
  DEFAULT_WARDROBE,
  normalizeCharacterRecipe,
  normalizeWardrobe,
  legacyRecipeFromResult,
  recipeFromResult,
  layersForRecipe,
  recipeToken,
} = require('../src/desk/characterRecipe');
const { MODULAR_CHARACTER } = require('../src/desk/mvpParts');

test('modular character contract is exposed with a stable asset root', () => {
  assert.equal(MODULAR_CHARACTER.assetRoot, '../../character/modular');
  assert.equal(MODULAR_CHARACTER.manifest.version, 3);
  assert.equal(MODULAR_CHARACTER.manifest.defaultRecipe.body, 'body_classic');
});

test('invalid recipe fields safely fall back to the default recipe', () => {
  assert.deepEqual(
    normalizeCharacterRecipe({
      body: 'missing_body',
      marking: 'missing_marking',
      expression: 'missing_expression',
      cloudMood: 'missing_cloud',
      headwear: 'missing_hat',
      facewear: 'missing_glasses',
      outfit: 'missing_outfit',
    }),
    DEFAULT_RECIPE,
  );
});

test('wardrobe validation only accepts declared wearable slots', () => {
  assert.deepEqual(
    normalizeWardrobe({
      headwear: 'hat_knit_blue',
      facewear: 'missing_glasses',
      outfit: 'outfit_vest_sage',
      body: 'body_long',
      expression: 'expr_grumpy',
    }),
    {
      headwear: 'hat_knit_blue',
      facewear: DEFAULT_WARDROBE.facewear,
      outfit: 'outfit_vest_sage',
    },
  );
});

test('legacy collection rows derive the same basic and mutation recipes', () => {
  const rare = legacyRecipeFromResult({ personality: 'explorer', rarity: 'rare' });
  assert.equal(rare.body, 'body_chubby');
  assert.equal(rare.marking, 'marking_patchy');
  assert.equal(rare.cloudMood, 'cloud_curious');

  const epic = legacyRecipeFromResult({ personality: 'dreamer', rarity: 'epic', energy: { dream: 60 } });
  assert.equal(epic.body, 'body_long');
  assert.equal(epic.marking, 'none');
  assert.equal(epic.cloudMood, 'cloud_twin');
});

test('appearance recipes resolve to ordered existing layer sources', () => {
  const supplied = {
    ...DEFAULT_RECIPE,
    body: 'body_chubby',
    marking: 'marking_patchy',
    expression: 'expr_curious',
  };
  assert.deepEqual(recipeFromResult({ appearance: supplied }), supplied);
  const resolved = layersForRecipe(supplied);
  assert.equal(resolved.recipe.body, 'body_chubby');
  assert.deepEqual(
    resolved.layers.map((layer) => layer.slot),
    ['shadow', 'tail', 'body', 'marking', 'expression', 'pawsForeground', 'cloudMood'],
  );
  assert.match(recipeToken(supplied), /^body_chubby\|marking_patchy\|/);
});

test('colour and shape mutations retain matching body parts and compatible wearables', () => {
  for (const id of ['mutation_sesame', 'mutation_dapple', 'mutation_sprout_cloud']) {
    const template = require(`../character/modular/templates/${id}.json`);
    const recipe = {
      ...template.recipe,
      headwear: 'hat_leaf_clip',
      facewear: 'glasses_oval_amber',
      outfit: 'outfit_baker_apron',
    };
    assert.deepEqual(normalizeCharacterRecipe(recipe), recipe);
    const { layers } = layersForRecipe(recipe);
    assert.equal(layers.find((layer) => layer.slot === 'body')?.src, `body/${recipe.body}.svg`);
    assert.equal(layers.find((layer) => layer.slot === 'pawsForeground')?.src, `body/paws_${recipe.body.slice(5)}.svg`);
    assert.equal(layers.find((layer) => layer.slot === 'tail')?.src, `body/tail_${recipe.body.slice(5)}.svg`);
  }
});
