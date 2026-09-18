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
  masterSvg: 'character/Pet_Base_Master.svg',
  css: 'character/loafling-standard-base.css',
  spec: 'character/LOAFLING_CHARACTER_SPEC_UPDATED.md',
  partsDoc: 'character/PARTS_MVP.md',
} as const;

/** Daytime hatch look — CORE 6 phases (1000 clicks each) */
export const HATCH_PHASE_ASSETS = {
  egg: 'character/Pet_Egg_Master.svg',
  cracking: 'character/Pet_Egg_Cracking.svg',
  hatching: 'character/Pet_Hatching.svg',
  newborn: 'character/Pet_Newborn.svg',
  growing: 'character/Pet_Growing.svg',
  adult: 'character/Pet_Base_Master.svg',
} as const;

export type HatchPhaseVisual = keyof typeof HATCH_PHASE_ASSETS;

/** Idle MVP pool — random play by DESK; see character/IDLE_MVP.md */
export const IDLE_MVP_ASSETS = {
  expressions: [
    'character/idle/expr_normal.svg',
    'character/idle/expr_happy.svg',
    'character/idle/expr_sleepy.svg',
    'character/idle/expr_surprised.svg',
    'character/idle/expr_content.svg',
  ],
  poses: [
    'character/idle/pose_sit.svg',
    'character/idle/pose_stretch.svg',
    'character/idle/pose_lie.svg',
  ],
} as const;
