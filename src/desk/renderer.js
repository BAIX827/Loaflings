/**
 * Renderer: egg by day → hatch to Pet_Base_Master.svg + Day reveal + collection.
 * Part IDs from window.loaflings.parts (← src/art/parts.ts).
 * Settlement from CORE via IPC — no gene formulas in DESK.
 */
(async function boot() {
  const stageEl = document.getElementById('stage');
  const eggEl = document.getElementById('egg');
  const petEl = document.getElementById('pet');
  const statusEl = document.getElementById('status');
  const revealEl = document.getElementById('reveal');
  const revealLine = document.getElementById('reveal-line');
  const panelEl = document.getElementById('panel');
  const panelTitle = document.getElementById('panel-title');
  const badgeEl = document.getElementById('collection-badge');
  const api = window.loaflings;

  const masterPath = '../../character/Pet_Base_Master.svg';

  /** @type {object | null} */
  let lastPayload = null;
  /** @type {'egg' | 'growing' | 'hatched'} */
  let phase = 'egg';
  let petLoaded = false;

  function setStatus(msg) {
    if (!msg) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = msg;
  }

  function displayName(result) {
    const p = result?.personality || '?';
    const r = result?.rarity || '?';
    return `${p} · ${r}`;
  }

  /**
   * CORE phases: egg | growing | hatched.
   * Egg art for egg+growing; Pet_Base_Master only after hatch.
   * @param {'egg' | 'growing' | 'hatched'} next
   * @param {{ caption?: string }} [opts]
   */
  function applyPhase(next, opts = {}) {
    if (next === 'hatched') phase = 'hatched';
    else if (next === 'growing') phase = 'growing';
    else phase = 'egg';
    // CSS: egg chrome for egg+growing; pet only when hatched
    stageEl.dataset.phase = phase === 'hatched' ? 'hatched' : 'egg';
    if (phase === 'growing') stageEl.dataset.growing = '1';
    else delete stageEl.dataset.growing;
    if (eggEl) {
      eggEl.hidden = phase === 'hatched';
      const cap = eggEl.querySelector('.egg-caption');
      if (cap) {
        if (opts.caption) cap.textContent = opts.caption;
        else if (phase === 'growing') cap.textContent = 'Growing…';
        else cap.textContent = "Today’s egg";
      }
    }
    if (petEl) petEl.hidden = phase !== 'hatched';
    if (phase !== 'hatched') {
      revealEl.hidden = true;
      setPanelOpen(false);
    }
  }

  function fillPanel(payload) {
    const result = payload?.result || {};
    const g = result.genes || {};
    document.getElementById('f-name').textContent = displayName(result);
    document.getElementById('f-type').textContent = result.personality || '—';
    document.getElementById('f-rarity').textContent = result.rarity || '—';
    document.getElementById('f-personality').textContent = result.personality || '—';
    document.getElementById('f-genes').textContent = [
      g.body,
      g.cloud,
      g.face,
      g.tail,
    ]
      .filter(Boolean)
      .join(' / ') || '—';
    document.getElementById('f-traits').textContent = Array.isArray(result.traits)
      ? result.traits.join(', ') || '—'
      : '—';
    document.getElementById('f-source').textContent = payload?.source || '—';

    const note = result.events?.[0]?.note || '';
    const date = result.date || '';
    document.getElementById('panel-note').textContent = [date, note]
      .filter(Boolean)
      .join(' · ');

    if (panelTitle) panelTitle.textContent = 'Day hatch';
    revealEl.hidden = false;
    revealLine.textContent = [
      'Hatched',
      result.kind === 'loafling' ? 'Loafling' : null,
      displayName(result),
      `${g.body}/${g.cloud}/${g.face}/${g.tail}`,
      note,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  function setPanelOpen(open) {
    panelEl.hidden = !open;
  }

  async function refreshBadge() {
    if (!api?.getCollection) return;
    try {
      const col = await api.getCollection();
      if (col?.ok) badgeEl.textContent = String(col.count ?? col.items?.length ?? 0);
    } catch {
      // ignore
    }
  }

  async function loadPetSvg() {
    if (petLoaded) return true;
    try {
      const res = await fetch(masterPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svgText = await res.text();
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const svg = doc.documentElement;
      if (svg.querySelector('parsererror')) throw new Error('SVG parse error');

      const firstRect = svg.querySelector('rect');
      if (firstRect) firstRect.setAttribute('fill', 'none');
      svg.querySelectorAll('line').forEach((line) => {
        const opacity = line.getAttribute('opacity');
        if (opacity && Number(opacity) < 1) line.remove();
      });
      svg.querySelectorAll('g[opacity]').forEach((g) => {
        const opacity = Number(g.getAttribute('opacity'));
        if (opacity > 0 && opacity < 1) g.remove();
      });

      if (api?.parts?.fields) {
        svg.setAttribute('data-mvp-parts', api.parts.fields.join(','));
        svg.setAttribute('data-mvp-base', JSON.stringify(api.parts.base));
      }

      petEl.replaceChildren(document.importNode(svg, true));
      petLoaded = true;
      return true;
    } catch (err) {
      setStatus(`Could not load pet SVG: ${err.message || err}`);
      return false;
    }
  }

  async function loadSettle(preferCollect) {
    if (!api) return null;
    try {
      if (preferCollect && api.collectDay) {
        const payload = await api.collectDay();
        if (!payload?.ok) throw new Error(payload?.error || 'collect failed');
        lastPayload = payload;
        fillPanel(payload);
        if (typeof payload.count === 'number') {
          badgeEl.textContent = String(payload.count);
        } else {
          await refreshBadge();
        }
        return payload;
      }
      const getter = api.getDaySettle || api.getDemoSettle;
      const payload = await getter();
      if (!payload?.ok) throw new Error(payload?.error || 'settle failed');
      lastPayload = payload;
      fillPanel(payload);
      return payload;
    } catch (err) {
      setStatus(`Settle error: ${err.message || err}`);
      return null;
    }
  }

  /**
   * Hatch: settle → show pet → mark day hatched.
   * @param {{ save?: boolean, openPanel?: boolean }} [opts]
   */
  async function hatch(opts = {}) {
    const { save = false, openPanel = true } = opts;
    setStatus('');
    const payload = await loadSettle(save);
    if (!payload?.ok) return null;

    const okSvg = await loadPetSvg();
    if (!okSvg) return payload;

    if (api?.markDayHatched && !save) {
      try {
        await api.markDayHatched();
      } catch {
        // ignore — UI still shows hatch
      }
    }

    applyPhase('hatched');
    if (openPanel) setPanelOpen(true);
    setStatus(save ? `Hatched & saved · collection ${payload.count ?? '?'}` : 'Hatched');
    setTimeout(() => setStatus(''), 2200);
    return payload;
  }

  async function syncFromMain() {
    if (!api?.getDayState) {
      applyPhase('egg');
      return;
    }
    try {
      const day = await api.getDayState();
      if (!day?.ok) {
        applyPhase('egg');
        return;
      }
      if (day.newEgg) {
        lastPayload = null;
        applyPhase('egg', { caption: 'New day · fresh egg' });
        setStatus('New day — a fresh egg');
        setTimeout(() => setStatus(''), 2400);
        return;
      }
      if (day.phase === 'hatched') {
        const okSvg = await loadPetSvg();
        if (okSvg) applyPhase('hatched');
        else applyPhase('egg');
        // Soft line if we already hatched today — settle without auto-save
        if (!lastPayload) await loadSettle(false);
      } else if (day.phase === 'growing') {
        applyPhase('growing');
      } else {
        applyPhase('egg');
      }
    } catch {
      applyPhase('egg');
    }
  }

  // Morning default: egg (no auto-hatch on boot)
  applyPhase('egg');
  await refreshBadge();
  await syncFromMain();

  document.getElementById('btn-reveal')?.addEventListener('click', async () => {
    if (phase === 'egg') {
      await hatch({ save: false, openPanel: true });
      return;
    }
    // Already hatched: toggle reveal panel
    setStatus('');
    const open = panelEl.hidden;
    if (open) {
      if (!lastPayload) await loadSettle(false);
      else fillPanel(lastPayload);
    }
    setPanelOpen(open);
  });

  document.getElementById('btn-close-panel')?.addEventListener('click', () => {
    setPanelOpen(false);
  });

  document.getElementById('btn-collect')?.addEventListener('click', async () => {
    if (phase === 'egg') {
      await hatch({ save: true, openPanel: true });
      return;
    }
    setStatus('');
    const payload = await loadSettle(true);
    if (payload?.ok) {
      applyPhase('hatched');
      setPanelOpen(true);
      setStatus(`Saved · collection ${payload.count ?? '?'}`);
      setTimeout(() => setStatus(''), 2200);
    }
  });

  api?.onCompanionWindowId?.((payload) => {
    console.log('[loaflings] companion windowId', payload?.windowId);
  });

  api?.onDayState?.(async (day) => {
    if (day?.newEgg || day?.phase === 'egg') {
      lastPayload = null;
      applyPhase('egg', { caption: 'New day · fresh egg' });
      setStatus('New day — a fresh egg');
      setTimeout(() => setStatus(''), 2400);
    } else if (day?.phase === 'hatched') {
      const okSvg = await loadPetSvg();
      if (okSvg) applyPhase('hatched');
    } else if (day?.phase === 'growing') {
      applyPhase('growing');
    }
  });
})();


// DAY-SENSE: quiet when healthy; surface Accessibility hint if hooks idle-only
(async function sensePermissionHint() {
  const api = window.loaflings;
  const statusEl = document.getElementById('status');
  if (!api?.getSenseStatus || !statusEl) return;
  try {
    const s = await api.getSenseStatus();
    if (s?.permissionHint && s.backend !== 'uiohook-napi') {
      statusEl.hidden = false;
      statusEl.textContent = `Sense (${s.backend || 'off'}): tap to open Accessibility`;
      statusEl.style.cursor = 'pointer';
      statusEl.onclick = () => api.openAccessibilitySettings?.();
    }
  } catch (err) {
    console.warn('[loaflings] sense status', err);
  }
})();
