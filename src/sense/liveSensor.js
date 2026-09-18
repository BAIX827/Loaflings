/**
 * DAY-SENSE live counters for Electron main.
 * Aggregates inputHook events into DailyActivityProfile (count-only).
 *
 * Layout inspired by BongoCat-mac InputMonitor (start/stop + callbacks),
 * but we never read key characters — only counts.
 */
'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { emptyProfile, assertProfileShape } = require('./profile.cjs');
const { createInputHook } = require('./inputHook.cjs');

const IDLE_THRESHOLD_SEC = 60;

function pxToMetres(px, scaleFactor = 2) {
  const inches = px / (110 * scaleFactor);
  return inches * 0.0254;
}

function todayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

class LiveSensor extends EventEmitter {
  /**
   * @param {object} opts
   * @param {string} opts.persistPath
   * @param {string} [opts.seedKey]
   * @param {import('electron').PowerMonitor} [opts.powerMonitor]
   * @param {number} [opts.scaleFactor]
   */
  constructor(opts) {
    super();
    this.persistPath = opts.persistPath;
    this.seedKey = opts.seedKey || 'local';
    this.powerMonitor = opts.powerMonitor || null;
    this.scaleFactor = opts.scaleFactor || 2;
    this.profile = this.#loadOrCreate();
    this.lastMouse = null;
    this.lastPersistAt = 0;
    this.tickTimer = null;
    this.running = false;
    this._backend = null;
    this._excludedWindowIds = [];
    this.focusStartedAt = null;
    this.lastActiveAt = Date.now();

    this.hook = createInputHook({
      onKeydown: () => this.#onKey(),
      onClick: () => this.#onClick(),
      onMousemove: (x, y) => this.#onMove(x, y),
      onChordTab: () => {
        this.#markActive();
        this.profile.windowSwitches += 1;
        this.persist();
      },
    });
  }

  #loadOrCreate() {
    const date = todayLocal();
    try {
      if (fs.existsSync(this.persistPath)) {
        const raw = JSON.parse(fs.readFileSync(this.persistPath, 'utf8'));
        if (raw && raw.date === date) {
          if (!Array.isArray(raw.activeHours) || raw.activeHours.length !== 24) {
            raw.activeHours = Array.from({ length: 24 }, () => 0);
          }
          return raw;
        }
      }
    } catch {
      // fall through
    }
    return emptyProfile(date, this.seedKey);
  }

  #writePersist() {
    try {
      assertProfileShape(this.profile);
      fs.mkdirSync(path.dirname(this.persistPath), { recursive: true });
      fs.writeFileSync(this.persistPath, JSON.stringify(this.profile, null, 2));
    } catch (err) {
      console.error('[sense] persist failed', err);
    }
  }

  /** One egg per local day — fresh profile when calendar day changes. */
  ensureToday() {
    const today = todayLocal();
    if (this.profile.date === today) return;
    this.#endFocus();
    this.#writePersist();
    this.profile = emptyProfile(today, this.seedKey);
    this.lastMouse = null;
    this.focusStartedAt = null;
    this.lastActiveAt = Date.now();
    this.#writePersist();
    console.log('[sense] new day egg', today);
  }

  persist(force = false) {
    this.ensureToday();
    const now = Date.now();
    if (!force && now - this.lastPersistAt < 250) return;
    this.lastPersistAt = now;
    this.#writePersist();
  }

  getProfile() {
    this.ensureToday();
    return {
      ...this.profile,
      focusSessions: [...this.profile.focusSessions],
      activeHours: [...this.profile.activeHours],
    };
  }

  excludeWindowIds(ids) {
    this._excludedWindowIds = (ids || []).map(String);
    return { ok: true, ids: [...this._excludedWindowIds] };
  }

  getStatus() {
    return {
      backend: this._backend || (this.running ? 'running' : 'stopped'),
      running: this.running,
      date: this.profile.date,
      keystrokes: this.profile.keystrokes,
      clicks: this.profile.clicks,
      mouseTravel: Number(this.profile.mouseTravel.toFixed(4)),
      idleSec: this.profile.idleSec,
      activeSec: this.profile.activeSec,
      windowSwitches: this.profile.windowSwitches,
      excludedWindowIds: [...this._excludedWindowIds],
      permissionHint:
        this._backend === 'uiohook-napi'
          ? null
          : 'System Settings → Privacy & Security → Accessibility — enable Electron / Loaflings',
    };
  }

  #markActive(at = Date.now()) {
    const gapMs = at - this.lastActiveAt;
    if (gapMs > 0 && gapMs < IDLE_THRESHOLD_SEC * 1000) {
      const sec = Math.floor(gapMs / 1000);
      if (sec > 0) {
        this.profile.activeSec += sec;
        this.profile.activeHours[new Date(at).getHours()] += sec;
      }
      if (this.focusStartedAt == null) this.focusStartedAt = this.lastActiveAt;
    } else if (gapMs >= IDLE_THRESHOLD_SEC * 1000) {
      this.#endFocus(at);
      this.profile.idleSec += Math.floor(gapMs / 1000);
    }
    this.lastActiveAt = at;
  }

  #endFocus(at = Date.now()) {
    if (this.focusStartedAt == null) return;
    const durationSec = Math.max(0, Math.floor((at - this.focusStartedAt) / 1000));
    if (durationSec > 0) {
      this.profile.focusSessions.push({ durationSec });
    }
    this.focusStartedAt = null;
  }

  #emitCounts() {
    const keystrokes = this.profile.keystrokes;
    const clicks = this.profile.clicks;
    this.emit('counts', {
      date: this.profile.date,
      keystrokes,
      clicks,
      activityHits: keystrokes + clicks,
      mouseTravel: this.profile.mouseTravel,
    });
  }

  #onKey() {
    this.#markActive();
    this.profile.keystrokes += 1;
    this.#emitCounts();
    this.persist();
  }

  #onClick() {
    this.#markActive();
    this.profile.clicks += 1;
    this.#emitCounts();
    this.persist();
  }

  #onMove(x, y) {
    if (this.lastMouse) {
      const dist = Math.hypot(x - this.lastMouse.x, y - this.lastMouse.y);
      if (dist > 0) {
        this.#markActive();
        this.profile.mouseTravel += pxToMetres(dist, this.scaleFactor);
        this.persist();
      }
    }
    this.lastMouse = { x, y };
  }

  #tickIdle() {
    const at = Date.now();
    if (this.powerMonitor && typeof this.powerMonitor.getSystemIdleTime === 'function') {
      const idleSec = this.powerMonitor.getSystemIdleTime();
      if (idleSec >= IDLE_THRESHOLD_SEC) {
        this.#endFocus(at);
        const gapMs = at - this.lastActiveAt;
        if (gapMs >= IDLE_THRESHOLD_SEC * 1000) {
          this.profile.idleSec += Math.floor(gapMs / 1000);
          this.lastActiveAt = at;
          this.persist();
        }
      }
      return;
    }
    const gapMs = at - this.lastActiveAt;
    if (gapMs >= IDLE_THRESHOLD_SEC * 1000) {
      this.#endFocus(at);
      this.profile.idleSec += Math.floor(gapMs / 1000);
      this.lastActiveAt = at;
      this.persist();
    }
  }

  async start() {
    this.ensureToday();
    if (this.running) {
      return { ok: true, already: true, backend: this._backend || 'running' };
    }
    this.running = true;
    this.tickTimer = setInterval(() => this.#tickIdle(), 5000);

    const started = this.hook.start();
    this._backend = started.backend;
    if (started.backend === 'uiohook-napi') {
      console.log('[sense] liveSensor started (uiohook-napi)');
    } else {
      console.warn('[sense] uiohook unavailable — idle-only', started.warning);
    }
    return started;
  }

  stop() {
    this.running = false;
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
    this.#endFocus();
    this.hook.stop();
    this.persist(true);
  }
}

module.exports = { LiveSensor, todayLocal, pxToMetres, IDLE_THRESHOLD_SEC };
