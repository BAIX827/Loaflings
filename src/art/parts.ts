/**
 * MVP Loafling part IDs — keep in sync with character/PARTS_MVP.md
 * and DAY-CORE gene fields: body / cloud / face / tail.
 */

export const MVP_PART_FIELDS = ['body', 'cloud', 'face', 'tail'] as const;
export type MvpPartField = (typeof MVP_PART_FIELDS)[number];

/** Default gene values for the current base master. */
export const MVP_BASE_PARTS: Record<MvpPartField, string> = {
  body: 'body_base',
  cloud: 'cloud_base',
  face: 'face_base',
  tail: 'tail_base',
};

/** Bottom → top draw order for companion compose. */
export const MVP_ASSEMBLY_ORDER: MvpPartField[] = [
  'tail',
  'body',
  'face',
  'cloud',
];

/** Paths relative to repo root. */
export const CHARACTER_ASSETS = {
  masterSvg: 'character/svg/Pet_Base_Master.svg',
  runtimePng: 'character/png/Pet_Base_Master.png',
  css: 'character/loafling-standard-base.css',
  spec: 'character/LOAFLING_CHARACTER_SPEC_UPDATED.md',
  partsDoc: 'character/PARTS_MVP.md',
} as const;

/** Runtime daytime hatch look — PNG only; thresholds live in CORE. */
export const HATCH_PHASE_ASSETS = {
  egg: 'character/png/Pet_Egg_Master.png',
  cracking: 'character/png/Pet_Egg_Cracking.png',
  hatching: 'character/png/Pet_Hatching.png',
  newborn: 'character/png/Pet_Newborn.png',
  growing: 'character/png/Pet_Growing.png',
  adult: 'character/png/Pet_Base_Master.png',
} as const;

export type HatchPhaseVisual = keyof typeof HATCH_PHASE_ASSETS;

/** Idle MVP pool — random play by DESK; see character/IDLE_MVP.md */
export const IDLE_MVP_ASSETS = {
  expressions: [
    'character/svg/idle/expr_normal.svg',
    'character/svg/idle/expr_happy.svg',
    'character/svg/idle/expr_sleepy.svg',
    'character/svg/idle/expr_surprised.svg',
    'character/svg/idle/expr_content.svg',
  ],
  poses: [
    'character/svg/idle/pose_sit.svg',
    'character/svg/idle/pose_stretch.svg',
    'character/svg/idle/pose_lie.svg',
  ],
} as const;

export const IDLE_CLOUD_ASSETS = [
  'character/svg/idle/cloud_normal.svg',
  'character/svg/idle/cloud_happy.svg',
  'character/svg/idle/cloud_excited.svg',
  'character/svg/idle/cloud_sleepy.svg',
  'character/svg/idle/cloud_angry.svg',
  'character/svg/idle/cloud_sad.svg',
] as const;
