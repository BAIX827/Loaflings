/**
 * Mirrors src/art/parts.ts MVP IDs — keep in sync with ART.
 */
const MVP_PART_FIELDS = Object.freeze(['body', 'cloud', 'face', 'tail']);
const MVP_BASE_PARTS = Object.freeze({
  body: 'body_base',
  cloud: 'cloud_base',
  face: 'face_base',
  tail: 'tail_base',
});
const MVP_ASSEMBLY_ORDER = Object.freeze(['tail', 'body', 'face', 'cloud']);
const CHARACTER_ASSETS = Object.freeze({
  masterSvg: 'character/svg/Pet_Base_Master.svg',
  runtimePng: 'character/png/Pet_Base_Master.png',
  css: 'character/loafling-standard-base.css',
  spec: 'character/LOAFLING_CHARACTER_SPEC_UPDATED.md',
  partsDoc: 'character/PARTS_MVP.md',
});
const HATCH_PHASE_ASSETS = Object.freeze({
  egg: 'character/png/Pet_Egg_Master.png',
  cracking: 'character/png/Pet_Egg_Cracking.png',
  hatching: 'character/png/Pet_Hatching.png',
  newborn: 'character/png/Pet_Newborn.png',
  growing: 'character/png/Pet_Growing.png',
  adult: 'character/png/Pet_Base_Master.png',
});
const HATCH_PHASE_FILES = Object.freeze({
  egg: 'Pet_Egg_Master',
  cracking: 'Pet_Egg_Cracking',
  hatching: 'Pet_Hatching',
  newborn: 'Pet_Newborn',
  growing: 'Pet_Growing',
  adult: 'Pet_Base_Master',
});
const QUALITY_STYLE_FILES = Object.freeze({
  common: 'style_common',
  rare: 'style_rare',
  epic: 'style_epic',
});
const MODULAR_CHARACTER = Object.freeze({
  assetRoot: '../../character/modular',
  manifest: require('../../character/modular/manifest.json'),
});
module.exports = {
  MVP_PART_FIELDS,
  MVP_BASE_PARTS,
  MVP_ASSEMBLY_ORDER,
  CHARACTER_ASSETS,
  HATCH_PHASE_ASSETS,
  HATCH_PHASE_FILES,
  QUALITY_STYLE_FILES,
  MODULAR_CHARACTER,
};
