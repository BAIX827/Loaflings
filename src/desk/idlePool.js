/**
 * MVP idle FX pool — mirrors character/IDLE_MVP.md (DAY-ART).
 * Not genes — cosmetic only. Weights come from CORE idleMood.
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

/** CORE short id → ART file id */
function exprAssetId(shortId) {
  return `expr_${shortId}`;
}

function poseAssetId(shortId) {
  return `pose_${shortId}`;
}

function pickWeightedKey(weights, rng = Math.random) {
  const keys = Object.keys(weights || {});
  let total = 0;
  for (const k of keys) total += Math.max(0, Number(weights[k]) || 0);
  if (!keys.length || total <= 0) return keys[0] || null;
  let roll = rng() * total;
  for (const k of keys) {
    roll -= Math.max(0, Number(weights[k]) || 0);
    if (roll <= 0) return k;
  }
  return keys[keys.length - 1];
}

/**
 * Pick an ART idle asset id from CORE IdleMood, or fall back to flat random.
 * @returns {'expr_*'|'pose_*'|null}
 */
function pickIdleAssetId(mood, rng = Math.random) {
  const usePose = rng() < 0.4;
  if (mood && mood.expr && mood.pose) {
    if (usePose) {
      const short = pickWeightedKey(mood.pose, rng);
      return short ? poseAssetId(short) : null;
    }
    const short = pickWeightedKey(mood.expr, rng);
    return short ? exprAssetId(short) : null;
  }
  if (usePose) {
    return IDLE_POSES[Math.floor(rng() * IDLE_POSES.length)];
  }
  const exprs = IDLE_EXPR.filter((x) => x !== 'expr_normal');
  return exprs[Math.floor(rng() * exprs.length)];
}

module.exports = {
  IDLE_EXPR,
  IDLE_POSES,
  idleAssetPath,
  exprAssetId,
  poseAssetId,
  pickWeightedKey,
  pickIdleAssetId,
};
