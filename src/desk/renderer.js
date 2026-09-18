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

  const PHASE_PATHS = {
    egg: '../../character/Pet_Egg_Master.svg',
    cracking: '../../character/Pet_Egg_Cracking.svg',
    hatching: '../../character/Pet_Hatching.svg',
    newborn: '../../character/Pet_Newborn.svg',
    growing: '../../character/Pet_Growing.svg',
    adult: '../../character/Pet_Base_Master.svg',
  };
  const PHASE_FALLBACKS = {};

  /** @type {object | null} */
  let lastPayload = null;
  /** @type {string} */
  let phase = 'egg';
  let petLoaded = false;
  /** @type {Record<string, boolean>} */
  const phaseArtLoaded = {};
  let lastVisualPhase = '';

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
   * Visual daytime phases from CORE hatchProgress: egg | cracking | hatched.
   * Day/Save still gates collection via hatchDay.
   * @param {'egg' | 'cracking' | 'hatched' | 'growing'} next
   * @param {{ caption?: string, clicks?: number, nextAt?: number|null }} [opts]
   */
  const EGGISH = new Set(['egg', 'cracking', 'hatching']);
  const PETISH = new Set(['newborn', 'growing', 'adult', 'hatched']);

  function normalizePhase(next) {
    if (next === 'hatched') return 'adult';
    if (
      next === 'egg' ||
      next === 'cracking' ||
      next === 'hatching' ||
      next === 'newborn' ||
      next === 'growing' ||
      next === 'adult'
    ) {
      return next;
    }
    return 'egg';
  }

  const CAPTIONS = {
    egg: "Today’s egg",
    cracking: 'Cracking…',
    hatching: 'Hatching…',
    newborn: 'Newborn',
    growing: 'Growing…',
    adult: 'Adult look',
  };

  /**
   * CORE 6-stage daytime look; Day/Save still gates collection.
   * @param {string} next
   * @param {{ caption?: string, clicks?: number, nextAt?: number|null }} [opts]
   */
  async function applyPhase(next, opts = {}) {
    const visual = normalizePhase(next);
    phase = visual;
    stageEl.dataset.phase = visual;
    if (visual === 'cracking' || visual === 'hatching' || visual === 'growing') {
      stageEl.dataset.growing = '1';
    } else {
      delete stageEl.dataset.growing;
    }

    const showPet = PETISH.has(visual);
    if (eggEl) eggEl.hidden = showPet;
    if (petEl) petEl.hidden = !showPet;

    const cap = eggEl && eggEl.querySelector('.egg-caption');
    if (cap) {
      cap.textContent = opts.caption || CAPTIONS[visual] || "Today’s egg";
    }

    if (EGGISH.has(visual)) {
      await loadPhaseArt(visual);
    } else {
      // newborn/growing/adult share pet mount; reload when path differs
      petLoaded = false;
      await loadPetSvg(PHASE_PATHS[visual] || PHASE_PATHS.adult, visual);
    }

    const hudC = document.getElementById('hud-clicks');
    const hudP = document.getElementById('hud-phase');
    if (typeof opts.clicks === 'number' && hudC) {
      hudC.textContent = String(opts.clicks);
    }
    if (hudP) hudP.textContent = visual;
    if (typeof opts.clicks === 'number') {
      const nextAt = opts.nextAt;
      // keep status subtle; HUD shows the live number
      if (nextAt != null) {
        setStatus(`next stage @ ${nextAt}`);
      }
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


  async function loadPhaseArt(visual) {
    const mount = document.getElementById('egg-art');
    if (!mount) return false;
    if (phaseArtLoaded[visual] && lastVisualPhase === visual && mount.childElementCount) {
      return true;
    }
    let path = PHASE_PATHS[visual] || PHASE_PATHS.egg;
    try {
      let res = await fetch(path);
      if (!res.ok && PHASE_FALLBACKS[visual]) {
        path = PHASE_FALLBACKS[visual];
        res = await fetch(path);
      }
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
      mount.replaceChildren(document.importNode(svg, true));
      phaseArtLoaded[visual] = true;
      lastVisualPhase = visual;
      return true;
    } catch (err) {
      setStatus(`Could not load ${visual} SVG: ${err.message || err}`);
      return false;
    }
  }

  async function loadPetSvg(pathOverride, cacheKey) {
    const path = pathOverride || PHASE_PATHS.adult;
    const key = cacheKey || path;
    if (petLoaded && lastVisualPhase === key) return true;
    try {
      let res = await fetch(path);
      if (!res.ok && PHASE_FALLBACKS[cacheKey]) {
        res = await fetch(PHASE_FALLBACKS[cacheKey]);
      }
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
      lastVisualPhase = key;
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

    await applyPhase('adult');
    if (openPanel) setPanelOpen(true);
    setStatus(save ? `Hatched & saved · collection ${payload.count ?? '?'}` : 'Hatched');
    setTimeout(() => setStatus(''), 2200);
    return payload;
  }

  async function syncFromMain() {
    if (!api?.getDayState) {
      await applyPhase('egg');
      return;
    }
    try {
      const day = await api.getDayState();
      if (!day?.ok) {
        await applyPhase('egg');
        return;
      }
      if (day.newEgg) {
        lastPayload = null;
        await applyPhase('egg', { caption: 'New day · fresh egg' });
        setStatus('New day — a fresh egg');
        setTimeout(() => setStatus(''), 2400);
        return;
      }
      if (day.phase === 'hatched') {
        const okSvg = await loadPetSvg();
        if (okSvg) await applyPhase('adult');
        else applyPhase('egg');
        // Soft line if we already hatched today — settle without auto-save
        if (!lastPayload) await loadSettle(false);
      } else if (day.phase === 'growing') {
        await applyPhase('cracking');
      } else {
        await applyPhase('egg');
      }
    } catch {
      await applyPhase('egg');
    }
  }

  // Morning default: egg (no auto-hatch on boot)
  await applyPhase('egg');
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


  // —— Settings ——
  const settingsEl = document.getElementById('settings');
  const opacityEl = document.getElementById('set-opacity');
  const scaleEl = document.getElementById('set-scale');
  const lockEl = document.getElementById('set-lock');

  function setSettingsOpen(open) {
    if (settingsEl) settingsEl.hidden = !open;
  }

  async function hydrateSettings() {
    if (!api?.getSettings) return;
    try {
      const res = await api.getSettings();
      if (!res?.ok || !res.settings) return;
      const s = res.settings;
      if (opacityEl) opacityEl.value = String(s.opacity);
      if (scaleEl) scaleEl.value = String(s.scale);
      if (lockEl) lockEl.checked = Boolean(s.lockPosition);
    } catch {
      // ignore
    }
  }

  document.getElementById('btn-settings')?.addEventListener('click', async () => {
    setPanelOpen(false);
    await hydrateSettings();
    setSettingsOpen(true);
  });
  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    setSettingsOpen(false);
  });
  opacityEl?.addEventListener('input', () => {
    api?.setSettings?.({ opacity: Number(opacityEl.value) });
  });
  scaleEl?.addEventListener('input', () => {
    api?.setSettings?.({ scale: Number(scaleEl.value) });
  });
  lockEl?.addEventListener('change', () => {
    api?.setSettings?.({ lockPosition: Boolean(lockEl.checked) });
  });

  document.getElementById('btn-quit')?.addEventListener('click', () => {
    api?.quitApp?.();
  });

  document.getElementById('btn-collect')?.addEventListener('click', async () => {
    if (phase === 'egg') {
      await hatch({ save: true, openPanel: true });
      return;
    }
    setStatus('');
    const payload = await loadSettle(true);
    if (payload?.ok) {
      await applyPhase('adult');
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
      await applyPhase('egg', { caption: 'New day · fresh egg' });
      setStatus('New day — a fresh egg');
      setTimeout(() => setStatus(''), 2400);
    } else if (day?.phase === 'hatched') {
      const okSvg = await loadPetSvg();
      if (okSvg) await applyPhase('adult');
    } else if (day?.phase === 'growing') {
      await applyPhase('cracking');
    }
  });
  async function refreshHatchProgress() {
    if (!api?.getHatchProgress) return;
    try {
      const hp = await api.getHatchProgress();
      if (!hp?.ok || !hp.progress) return;
      const visual = hp.alreadySaved ? 'adult' : hp.progress.phase;
      await applyPhase(visual, {
        clicks: hp.clicks,
        nextAt: hp.progress.nextStageAt,
      });
    } catch {
      // ignore
    }
  }


  // —— Newbie guide (first run) ——
  const GUIDE_KEY = 'loaflings.guide.v2.done';
  const guideEl = document.getElementById('guide');
  function setGuideOpen(open) {
    if (guideEl) guideEl.hidden = !open;
  }
  function maybeShowGuide() {
    try {
      if (localStorage.getItem(GUIDE_KEY) === '1') return;
    } catch {
      // ignore
    }
    setSettingsOpen(false);
    setPanelOpen(false);
    setGuideOpen(true);
  }
  function dismissGuide() {
    try {
      localStorage.setItem(GUIDE_KEY, '1');
    } catch {
      // ignore
    }
    setGuideOpen(false);
  }
  document.getElementById('btn-guide-ok')?.addEventListener('click', dismissGuide);
  document.getElementById('btn-close-guide')?.addEventListener('click', dismissGuide);
  document.getElementById('btn-show-guide')?.addEventListener('click', () => {
    setSettingsOpen(false);
    try { localStorage.removeItem(GUIDE_KEY); } catch {}
    setGuideOpen(true);
  });
  // reopen from Settings? skip for MVP
  maybeShowGuide();

  await refreshHatchProgress();
  setInterval(refreshHatchProgress, 500);

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
