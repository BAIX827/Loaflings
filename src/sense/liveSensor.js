/**
 * DAY-SENSE live counters for Electron main process.
 * Count-only: never reads key codes as text, never window titles.
 */
const fs = require('fs');
const path = require('path');
const { emptyProfile, assertProfileShape } = require('./profile.cjs');

const IDLE_THRESHOLD_SEC = 60;

function pxToMetres(px, scaleFactor = 2) {
  // Assume ~110 CSS-px per inch at scale 1; physical px ≈ css * scaleFactor
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

class LiveSensor {
  /**
   * @param {object} opts
   * @param {string} opts.persistPath
   * @param {() => boolean} [opts.shouldIgnoreClick] — true when event is on companion
   * @param {string} [opts.seedKey]
   * @param {import('electron').PowerMonitor} [opts.powerMonitor]
   * @param {number} [opts.scaleFactor]
   */
  constructor(opts) {
    this.persistPath = opts.persistPath;
    this.shouldIgnoreClick = opts.shouldIgnoreClick || (() => false);
    this.seedKey = opts.seedKey || 'local';
    this.powerMonitor = opts.powerMonitor || null;
    this.scaleFactor = opts.scaleFactor || 2;
    this.profile = this.#loadOrCreate();
    this.lastMouse = null;
    this.lastPersistAt = 0;
    this.tickTimer = null;
    this.uiohook = null;
    this.running = false;
    this._excludedWindowIds = [];
    this._backend = null;
    this.focusStartedAt = null;
    this.lastActiveAt = Date.now();
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

  _writePersist() {
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
    if (this.profile.date !== today) {
      this.#endFocus();
      this._writePersist();
      this.profile = emptyProfile(today, this.seedKey);
      this.lastMouse = null;
      this.focusStartedAt = null;
      this.lastActiveAt = Date.now();
      this._writePersist();
      console.log('[sense] new day egg', today);
    }
  }

  persist(force = false) {
    this.ensureToday();
    const now = Date.now();
    if (!force && now - this.lastPersistAt < 2000) return;
    this.lastPersistAt = now;
    this._writePersist();
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
      excludedWindowIds: [...(this._excludedWindowIds || [])],
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
        const hour = new Date(at).getHours();
        this.profile.activeHours[hour] += sec;
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

  #onKey() {
    // Always count — 老大 wants counts even while companion is focused.
    this.#markActive();
    this.profile.keystrokes += 1;
    this.persist();
  }

  #onClick() {
    // Always count — including companion window clicks.
    this.#markActive();
    this.profile.clicks += 1;
    this.persist();
  }

  #onMove(x, y) {
    if (this.lastMouse) {
      const dx = x - this.lastMouse.x;
      const dy = y - this.lastMouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        this.#markActive();
        this.profile.mouseTravel += pxToMetres(dist, this.scaleFactor);
        this.persist();
      }
    }
    this.lastMouse = { x, y };
  }

  #onWheelOrSwitch() {
    // Approximate window-switch signal: frequent alt-tab isn't available; leave for Accessibility later.
  }

  #tickIdle() {
    const at = Date.now();
    if (this.powerMonitor && typeof this.powerMonitor.getSystemIdleTime === 'function') {
      const idleSec = this.powerMonitor.getSystemIdleTime();
      if (idleSec >= IDLE_THRESHOLD_SEC) {
        this.#endFocus(at);
        // Don't double-count: only add delta since last tick via lastActiveAt gap
        const gapMs = at - this.lastActiveAt;
        if (gapMs >= IDLE_THRESHOLD_SEC * 1000) {
          this.profile.idleSec += Math.floor(gapMs / 1000);
          this.lastActiveAt = at;
          this.persist();
        }
      }
    } else {
      const gapMs = at - this.lastActiveAt;
      if (gapMs >= IDLE_THRESHOLD_SEC * 1000) {
        this.#endFocus(at);
        this.profile.idleSec += Math.floor(gapMs / 1000);
        this.lastActiveAt = at;
        this.persist();
      }
    }
  }

  async start() {
    this.ensureToday();
    if (this.running) return { ok: true, already: true };
    this.running = true;
    this.tickTimer = setInterval(() => this.#tickIdle(), 5000);

    try {
      // Lazy require so desk still boots if native module missing
      const { uIOhook, UiohookKey } = require('uiohook-napi');
      this.uiohook = uIOhook;
      this._UiohookKey = UiohookKey;

      uIOhook.on('keydown', () => this.#onKey());
      uIOhook.on('click', () => this.#onClick());
      uIOhook.on('mousemove', (e) => this.#onMove(e.x, e.y));
      // Rough proxy for context switches when user presses Cmd+Tab / Ctrl+Tab
      uIOhook.on('keydown', (e) => {
        try {
          const meta = e.metaKey || e.ctrlKey;
          if (meta && e.keycode === UiohookKey.Tab) {
            this.#markActive();
            this.profile.windowSwitches += 1;
            this.persist();
          }
        } catch {
          // ignore
        }
      });

      uIOhook.start();
      this._backend = 'uiohook-napi';
      console.log('[sense] liveSensor started (uiohook-napi)');
      return { ok: true, backend: 'uiohook-napi' };
    } catch (err) {
      console.warn(
        '[sense] uiohook-napi unavailable — idle-only mode. Install deps + grant Accessibility.',
        err && err.message ? err.message : err,
      );
      this._backend = 'idle-only';
      return {
        ok: true,
        backend: 'idle-only',
        warning: 'uiohook-napi not loaded; key/mouse counts stay 0 until native module works',
        permissionHint:
          'System Settings → Privacy & Security → Accessibility — enable Electron / Loaflings',
      };
    }
  }

  stop() {
    this.running = false;
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
    this.#endFocus();
    try {
      this.uiohook?.stop();
    } catch {
      // ignore
    }
    this.persist(true);
  }
}

module.exports = { LiveSensor, todayLocal, pxToMetres, IDLE_THRESHOLD_SEC };
