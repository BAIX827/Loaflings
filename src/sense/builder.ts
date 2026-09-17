import {
  DailyActivityProfile,
  FocusSession,
  emptyProfile,
  assertProfileShape,
} from './profile';

/**
 * Aggregates count-only events into a DailyActivityProfile.
 * Real macOS sensors plug in later; this is the demo stub.
 */
export class DailyProfileBuilder {
  private profile: DailyActivityProfile;
  private lastInputAt: number | null = null;
  private focusStartedAt: number | null = null;
  private readonly idleThresholdMs: number;

  constructor(
    date: string,
    seedKey = 'local',
    opts?: { idleThresholdMs?: number }
  ) {
    this.profile = emptyProfile(date, seedKey);
    this.idleThresholdMs = opts?.idleThresholdMs ?? 60_000;
  }

  /** Exclude companion / own window from stats (ids only, never titles). */
  excludeWindowIds(_ids: string[]): void {
    // Demo stub — desk will pass own window id(s).
  }

  recordKeystroke(n = 1, at = Date.now()): void {
    this.profile.keystrokes += n;
    this.markActive(at);
  }

  recordClick(n = 1, at = Date.now()): void {
    this.profile.clicks += n;
    this.markActive(at);
  }

  /** Delta mouse travel in metres. */
  recordMouseTravel(metres: number, at = Date.now()): void {
    if (metres > 0) {
      this.profile.mouseTravel += metres;
      this.markActive(at);
    }
  }

  recordWindowSwitch(n = 1, at = Date.now()): void {
    this.profile.windowSwitches += n;
    this.markActive(at);
  }

  /** Call on a timer while app is running to accumulate idle. */
  tick(at = Date.now()): void {
    if (this.lastInputAt == null) {
      this.lastInputAt = at;
      return;
    }
    const gap = at - this.lastInputAt;
    if (gap >= this.idleThresholdMs) {
      this.endFocus(at);
      this.profile.idleSec += Math.floor(gap / 1000);
      this.lastInputAt = at;
    }
  }

  startFocus(at = Date.now()): void {
    if (this.focusStartedAt == null) this.focusStartedAt = at;
  }

  endFocus(at = Date.now()): void {
    if (this.focusStartedAt == null) return;
    const durationSec = Math.max(0, Math.floor((at - this.focusStartedAt) / 1000));
    if (durationSec > 0) {
      const session: FocusSession = { durationSec };
      this.profile.focusSessions.push(session);
    }
    this.focusStartedAt = null;
  }

  private markActive(at: number): void {
    if (this.lastInputAt != null) {
      const gap = at - this.lastInputAt;
      if (gap > 0 && gap < this.idleThresholdMs) {
        const sec = Math.floor(gap / 1000);
        this.profile.activeSec += sec;
        const hour = new Date(at).getHours();
        this.profile.activeHours[hour] += sec;
        this.startFocus(this.lastInputAt);
      } else if (gap >= this.idleThresholdMs) {
        this.profile.idleSec += Math.floor(gap / 1000);
        this.endFocus(at);
      }
    }
    this.lastInputAt = at;
  }

  /** Snapshot for DAY-CORE settleDay(). */
  build(): DailyActivityProfile {
    this.endFocus();
    assertProfileShape(this.profile);
    return {
      ...this.profile,
      focusSessions: [...this.profile.focusSessions],
      activeHours: [...this.profile.activeHours],
    };
  }

  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }
}
