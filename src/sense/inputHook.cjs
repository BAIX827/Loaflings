/**
 * Thin global input hook (inspired by BongoCat-mac InputMonitor layout).
 * Emits count-safe events only — never key characters or window titles.
 *
 * @see https://github.com/Gamma-Software/BongoCat-mac (MIT) — structure only
 */
'use strict';

/**
 * @typedef {'keydown'|'click'|'mousemove'} SenseInputEvent
 */

/**
 * @param {{
 *   onKeydown?: () => void,
 *   onClick?: () => void,
 *   onMousemove?: (x: number, y: number) => void,
 *   onChordTab?: () => void,
 * }} handlers
 */
function createInputHook(handlers) {
  let uIOhook = null;
  let UiohookKey = null;
  let running = false;

  return {
    /**
     * @returns {{ ok: boolean, backend: string, warning?: string, permissionHint?: string }}
     */
    start() {
      if (running) return { ok: true, backend: 'uiohook-napi', already: true };
      try {
        ({ uIOhook, UiohookKey } = require('uiohook-napi'));
      } catch (err) {
        return {
          ok: true,
          backend: 'idle-only',
          warning: err instanceof Error ? err.message : String(err),
          permissionHint:
            'System Settings → Privacy & Security → Accessibility — enable Electron / Loaflings',
        };
      }

      uIOhook.on('keydown', (e) => {
        handlers.onKeydown?.();
        try {
          if ((e.metaKey || e.ctrlKey) && e.keycode === UiohookKey.Tab) {
            handlers.onChordTab?.();
          }
        } catch {
          // ignore chord parse errors
        }
      });
      uIOhook.on('click', () => handlers.onClick?.());
      uIOhook.on('mousemove', (e) => handlers.onMousemove?.(e.x, e.y));
      uIOhook.start();
      running = true;
      return { ok: true, backend: 'uiohook-napi' };
    },

    stop() {
      if (!running || !uIOhook) return;
      try {
        uIOhook.stop();
      } catch {
        // ignore
      }
      running = false;
      uIOhook = null;
    },

    get running() {
      return running;
    },
  };
}

module.exports = { createInputHook };
