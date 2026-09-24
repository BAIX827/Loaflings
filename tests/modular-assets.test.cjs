'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const modularRoot = path.join(root, 'character', 'modular');
const manifest = JSON.parse(
  fs.readFileSync(path.join(modularRoot, 'manifest.json'), 'utf8'),
);

function collectSources() {
  const sources = [];
  for (const body of Object.values(manifest.bodies)) {
    sources.push(body.shadow, body.tail, body.body, body.pawsForeground);
  }
  for (const entry of Object.values(manifest.markings)) if (entry) sources.push(entry.src);
  for (const entry of Object.values(manifest.expressions)) sources.push(entry.src);
  for (const entry of Object.values(manifest.cloudMoods)) sources.push(entry.src);
  for (const entry of Object.values(manifest.headwear)) if (entry) sources.push(entry.src);
  for (const entry of Object.values(manifest.facewear)) if (entry) sources.push(entry.src);
  for (const entry of Object.values(manifest.outfits)) if (entry) sources.push(entry.src);
  return sources;
}

test('modular manifest has a stable canvas and layer order', () => {
  assert.deepEqual(manifest.canvas, {
    width: 1200,
    height: 900,
    viewBox: '0 0 1200 900',
  });
  assert.deepEqual(manifest.drawOrder, [
    'shadow',
    'tail',
    'body',
    'marking',
    'outfit',
    'expression',
    'facewear',
    'pawsForeground',
    'headwear',
    'cloudMood',
  ]);
  assert.equal(manifest.version, 3);
  assert.equal(manifest.defaultRecipe.body, 'body_classic');
  assert.equal(Object.keys(manifest.bodies).length, 8);
  assert.equal(Object.keys(manifest.expressions).length, 8);
  assert.equal(Object.keys(manifest.cloudMoods).length, 13);
  assert.deepEqual(
    manifest.headwear.hat_knit_blue.compatibleBodies,
    ['body_classic', 'body_chubby', 'body_long', 'body_bun', 'body_pudgy', 'body_pointy_strawberry', 'body_melted_matcha', 'body_round_mocha'],
  );
});

test('basic and mutation templates resolve to valid modular recipes', () => {
  const templateSources = [...manifest.templates.basic, ...manifest.templates.mutations, ...manifest.templates.roles];
  assert.equal(manifest.templates.basic.length, 5);
  assert.equal(manifest.templates.mutations.length, 5);
  assert.equal(manifest.templates.roles.length, 8);

  for (const source of templateSources) {
    const template = JSON.parse(fs.readFileSync(path.join(modularRoot, source), 'utf8'));
    const recipe = template.recipe;
    assert.ok(manifest.bodies[recipe.body], `${template.id} has an unknown body`);
    assert.ok(Object.hasOwn(manifest.markings, recipe.marking), `${template.id} has an unknown marking`);
    assert.ok(manifest.expressions[recipe.expression], `${template.id} has an unknown expression`);
    assert.ok(manifest.cloudMoods[recipe.cloudMood], `${template.id} has an unknown cloud`);
    assert.ok(Object.hasOwn(manifest.headwear, recipe.headwear), `${template.id} has unknown headwear`);
    assert.ok(Object.hasOwn(manifest.facewear, recipe.facewear), `${template.id} has unknown facewear`);
    assert.ok(Object.hasOwn(manifest.outfits, recipe.outfit), `${template.id} has an unknown outfit`);
  }
});

test('every modular part exists and remains an editable transparent SVG', () => {
  const sources = collectSources();
  // Body shapes intentionally share compatible paw, tail and shadow modules.

  for (const source of new Set(sources)) {
    const filePath = path.join(modularRoot, source);
    assert.equal(fs.existsSync(filePath), true, `${source} is missing`);
    const svg = fs.readFileSync(filePath, 'utf8');
    assert.match(svg, /viewBox="0 0 1200 900"/, `${source} has the wrong viewBox`);
    assert.match(svg, /id="[^"]+"/, `${source} needs an editable layer id`);
    assert.doesNotMatch(svg, /<rect[^>]+fill="#[Ff]{6}"/, `${source} bakes a background`);
    assert.doesNotMatch(svg, /<image\b/, `${source} embeds a bitmap`);
    assert.equal(
      (svg.match(/<g\b/g) || []).length,
      (svg.match(/<\/g>/g) || []).length,
      `${source} has unbalanced groups`,
    );
  }
});

test('cloud moods use clean silhouette outlines without overlapping lobe strokes', () => {
  for (const [id, entry] of Object.entries(manifest.cloudMoods)) {
    const svg = fs.readFileSync(path.join(modularRoot, entry.src), 'utf8');
    const silhouetteCount = (svg.match(/data-part="cloud-silhouette"/g) || []).length;
    const outlinedCircleCount = (svg.match(/<circle\b[^>]*stroke=/g) || []).length;
    const expectedCloudCount = id === 'cloud_twin' ? 2 : 1;
    assert.equal(silhouetteCount, expectedCloudCount, `${id} needs one outline per cloud`);
    assert.equal(outlinedCircleCount, expectedCloudCount, `${id} should only outline its thought dot`);
    assert.doesNotMatch(svg, /<ellipse\b/, `${id} should not use an overlapping outlined base`);
  }
});

test('the modular preview exposes independent customization controls', () => {
  const html = fs.readFileSync(path.join(modularRoot, 'preview.html'), 'utf8');
  for (const control of ['template', 'body', 'marking', 'expression', 'cloudMood', 'headwear', 'facewear', 'outfit']) {
    assert.match(html, new RegExp(`id="${control}"`));
  }
  assert.match(html, /data-layer="marking"/);
  assert.match(html, /data-layer="pawsForeground"/);
  const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(inlineScript, 'preview inline script is missing');
  assert.doesNotThrow(() => new Function(inlineScript));
});

test('the desktop wardrobe exposes all three wearable slots', () => {
  const html = fs.readFileSync(path.join(root, 'src', 'desk', 'index.html'), 'utf8');
  for (const id of [
    'btn-wardrobe',
    'wardrobe-headwear',
    'wardrobe-facewear',
    'wardrobe-outfit',
    'btn-reset-wardrobe',
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, /<select id="wardrobe-/);
  assert.match(html, /class="wardrobe-grid" role="group"/);
  const renderer = fs.readFileSync(path.join(root, 'src', 'desk', 'renderer.js'), 'utf8');
  assert.match(renderer, /img\.src = modularAssetUrl\(entry\.src\)/);
  assert.match(renderer, /aria-pressed/);
  assert.equal(Object.keys(manifest.headwear).length, 13);
  assert.equal(Object.keys(manifest.facewear).length, 9);
  assert.equal(Object.keys(manifest.outfits).length, 12);
});
