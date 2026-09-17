/**
 * Daily activity profile — owned by DAY-SENSE, consumed by DAY-CORE.
 * Count-only metrics. Never includes typed text, documents, screenshots, or window titles.
 * Field names locked to `src/core/profile.ts`.
 */

export interface FocusSession {
  /** Duration in seconds. */
  durationSec: number;
}

export interface DailyActivityProfile {
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  /** Stable install / device id for seeding (not PII content). */
  seedKey: string;

  keystrokes: number;
  clicks: number;
  /** Mouse travel in metres (local consistent unit). */
  mouseTravel: number;
  /** Total idle seconds. */
  idleSec: number;
  /** Total active (non-idle) seconds. */
  activeSec: number;
  focusSessions: FocusSession[];
  /** Window switch count for the day. */
  windowSwitches: number;
  /**
   * Active-hour histogram: 24 buckets (0–23), seconds active in each local hour.
   */
  activeHours: number[];
}

export const PROFILE_SCHEMA_VERSION = 1;

export function emptyProfile(date: string, seedKey = 'local'): DailyActivityProfile {
  return {
    date,
    seedKey,
    keystrokes: 0,
    clicks: 0,
    mouseTravel: 0,
    idleSec: 0,
    activeSec: 0,
    focusSessions: [],
    windowSwitches: 0,
    activeHours: Array.from({ length: 24 }, () => 0),
  };
}

export function assertProfileShape(p: DailyActivityProfile): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    throw new Error(`Invalid date: ${p.date}`);
  }
  if (!Array.isArray(p.activeHours) || p.activeHours.length !== 24) {
    throw new Error('activeHours must be length 24');
  }
  for (const key of [
    'keystrokes',
    'clicks',
    'mouseTravel',
    'idleSec',
    'activeSec',
    'windowSwitches',
  ] as const) {
    if (typeof p[key] !== 'number' || p[key] < 0 || Number.isNaN(p[key])) {
      throw new Error(`Invalid ${key}`);
    }
  }
}
