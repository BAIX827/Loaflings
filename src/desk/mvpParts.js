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
  masterSvg: 'character/Pet_Base_Master.svg',
  css: 'character/loafling-standard-base.css',
  spec: 'character/LOAFLING_CHARACTER_SPEC_UPDATED.md',
  partsDoc: 'character/PARTS_MVP.md',
});
const HATCH_PHASE_ASSETS = Object.freeze({
  egg: 'character/Pet_Egg_Master.svg',
  cracking: 'character/Pet_Egg_Cracking.svg',
  hatching: 'character/Pet_Hatching.svg',
  newborn: 'character/Pet_Newborn.svg',
  growing: 'character/Pet_Growing.svg',
  adult: 'character/Pet_Base_Master.svg',
});
module.exports = {
  MVP_PART_FIELDS,
  MVP_BASE_PARTS,
  MVP_ASSEMBLY_ORDER,
  CHARACTER_ASSETS,
  HATCH_PHASE_ASSETS,
};
