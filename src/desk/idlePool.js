/**
 * MVP idle FX pool — mirrors character/IDLE_MVP.md (DAY-ART).
 * Not genes — cosmetic only.
 */
const IDLE_EXPR = Object.freeze([
  'expr_normal',
  'expr_happy',
  'expr_sleepy',
  'expr_surprised',
  'expr_content',
]);

const IDLE_POSES = Object.freeze([
  'pose_sit',
  'pose_stretch',
  'pose_lie',
]);

/** Paths relative to src/desk/ (renderer fetch) */
function idleAssetPath(id) {
  return `../../character/idle/${id}.svg`;
}

module.exports = { IDLE_EXPR, IDLE_POSES, idleAssetPath };
