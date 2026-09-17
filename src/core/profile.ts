/**
 * Daily activity profile input — count-only metrics from DAY-SENSE.
 * No typed text, documents, screenshots, or window titles.
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
  /** Mouse travel in metres (or consistent local unit; document in sense schema). */
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
   * Used later for colour / night-owl style traits (post-MVP palette).
   */
  activeHours: number[];
}

export function longestFocusSec(profile: DailyActivityProfile): number {
  if (!profile.focusSessions.length) return 0;
  return Math.max(...profile.focusSessions.map((s) => s.durationSec));
}

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
