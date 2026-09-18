/**
 * MVP idle FX pool — mirrors character/IDLE_MVP.md (DAY-ART).
 * Assembly (LEAD): pose_* + expr_* + cloud_* — not genes.
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

const IDLE_CLOUDS = Object.freeze([
  'cloud_normal',
  'cloud_happy',
  'cloud_excited',
  'cloud_sleepy',
  'cloud_angry',
  'cloud_sad',
]);

/** expr short id → cloud_* (MVP map until CORE weights clouds) */
const EXPR_TO_CLOUD = Object.freeze({
  normal: 'cloud_normal',
  happy: 'cloud_happy',
  sleepy: 'cloud_sleepy',
  surprised: 'cloud_excited',
  content: 'cloud_happy',
});

function idleAssetPath(id) {
  return `../../character/idle/${id}.svg`;
}

function exprAssetId(shortId) {
  return `expr_${shortId}`;
}

function poseAssetId(shortId) {
  return `pose_${shortId}`;
}

function cloudAssetId(shortId) {
  return `cloud_${shortId}`;
}

function cloudForExprShort(shortId) {
  return EXPR_TO_CLOUD[shortId] || 'cloud_normal';
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
 * Pick a 3-layer idle clip from CORE IdleMood (or flat random).
 * @returns {{ pose: string|null, expr: string, cloud: string }}
 */
function pickIdleLayers(mood, rng = Math.random) {
  let exprShort;
  let poseShort = null;
  const usePose = rng() < 0.45;

  if (mood?.expr && mood?.pose) {
    exprShort = pickWeightedKey(mood.expr, rng) || 'normal';
    if (usePose) poseShort = pickWeightedKey(mood.pose, rng);
  } else {
    const exprs = ['happy', 'sleepy', 'surprised', 'content', 'normal'];
    exprShort = exprs[Math.floor(rng() * exprs.length)];
    if (usePose) {
      const poses = ['sit', 'stretch', 'lie'];
      poseShort = poses[Math.floor(rng() * poses.length)];
    }
  }

  // dream-heavy: prefer sleepy cloud even on content faces
  let cloud = cloudForExprShort(exprShort);
  if (mood?.dominant === 'dream' && rng() < 0.55) cloud = 'cloud_sleepy';
  if (mood?.dominant === 'explore' && exprShort === 'happy') cloud = 'cloud_happy';
  if (mood?.dominant === 'work' && exprShort === 'surprised') cloud = 'cloud_excited';

  return {
    pose: poseShort ? poseAssetId(poseShort) : null,
    expr: exprAssetId(exprShort),
    cloud,
  };
}

module.exports = {
  IDLE_EXPR,
  IDLE_POSES,
  IDLE_CLOUDS,
  EXPR_TO_CLOUD,
  idleAssetPath,
  exprAssetId,
  poseAssetId,
  cloudAssetId,
  cloudForExprShort,
  pickWeightedKey,
  pickIdleLayers,
};
