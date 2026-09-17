/**
 * Mirrors src/art/parts.ts MVP IDs — keep in sync with ART.
 * Fields match DAY-CORE gene contract: body / cloud / face / tail.
 */

const MVP_PART_FIELDS = Object.freeze(['body', 'cloud', 'face', 'tail']);

/** @type {Readonly<Record<string, string>>} */
const MVP_BASE_PARTS = Object.freeze({
  body: 'body_base',
  cloud: 'cloud_base',
  face: 'face_base',
  tail: 'tail_base',
});

/** Bottom → top draw order for later compose. */
const MVP_ASSEMBLY_ORDER = Object.freeze(['tail', 'body', 'face', 'cloud']);

/** Paths relative to repo root. */
const CHARACTER_ASSETS = Object.freeze({
  masterSvg: 'character/Pet_Base_Master.svg',
  css: 'character/loafling-standard-base.css',
  spec: 'character/LOAFLING_CHARACTER_SPEC_UPDATED.md',
  partsDoc: 'character/PARTS_MVP.md',
});

module.exports = {
  MVP_PART_FIELDS,
  MVP_BASE_PARTS,
  MVP_ASSEMBLY_ORDER,
  CHARACTER_ASSETS,
};
