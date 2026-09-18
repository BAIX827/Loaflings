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
  let locale = 'zh';
  /** @type {object|null} collection entry when browsing pack */
  let viewingEntry = null;
  let collectionItems = [];

  /** Basenames under character/png (primary) then character/svg (archive). */
  const PHASE_FILES = {
    egg: 'Pet_Egg_Master',
    cracking: 'Pet_Egg_Cracking',
    hatching: 'Pet_Hatching',
    newborn: 'Pet_Newborn',
    growing: 'Pet_Growing',
    adult: 'Pet_Base_Master',
  };

  async function resolveArtUrl(relBaseNoExt) {
    const png = `../../character/png/${relBaseNoExt}.png`;
    const svg = `../../character/svg/${relBaseNoExt}.svg`;
    try {
      const res = await fetch(png, { method: 'HEAD' });
      if (res.ok) return { url: png, kind: 'png' };
    } catch {
      // fall through
    }
    // Some Electron builds dislike HEAD — try GET lightly via img probe fallback later
    try {
      const res = await fetch(png);
      if (res.ok) return { url: png, kind: 'png' };
    } catch {
      // ignore
    }
    return { url: svg, kind: 'svg' };
  }

  async function resolveIdleUrl(id) {
    const png = `../../character/png/idle/${id}.png`;
    const svg = `../../character/svg/idle/${id}.svg`;
    try {
      const res = await fetch(png);
      if (res.ok) return { url: png, kind: 'png' };
    } catch {
      // ignore
    }
    return { url: svg, kind: 'svg' };
  }

  function mountRaster(mount, url) {
    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    img.src = url;
    mount.replaceChildren(img);
  }

  async function mountSvgText(mount, svgText, { stripGuides = true } = {}) {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement;
    if (svg.querySelector('parsererror')) throw new Error('SVG parse error');
    const firstRect = svg.querySelector('rect');
    if (firstRect) firstRect.setAttribute('fill', 'none');
    if (stripGuides) {
      svg.querySelectorAll('line').forEach((line) => {
        const opacity = line.getAttribute('opacity');
        if (opacity && Number(opacity) < 1) line.remove();
      });
    }
    mount.replaceChildren(document.importNode(svg, true));
    return svg;
  }

  const IDLE_EXPR_IDS = [
    'expr_normal',
    'expr_happy',
    'expr_sleepy',
    'expr_surprised',
    'expr_content',
  ];
  const IDLE_POSE_IDS = ['pose_sit', 'pose_stretch', 'pose_lie'];
  const IDLE_CLOUD_BY_EXPR = {
    normal: 'cloud_normal',
    happy: 'cloud_happy',
    sleepy: 'cloud_sleepy',
    surprised: 'cloud_excited',
    content: 'cloud_happy',
  };
  const IDLE_OK_PHASES = new Set(['newborn', 'growing', 'adult']);


  /** @type {object | null} */
  let lastPayload = null;
  /** @type {string} */
  let phase = 'egg';
  let petLoaded = false;
  /** @type {Record<string, boolean>} */
  const phaseArtLoaded = {};
  let lastVisualPhase = '';

  function setStatus(msg) {
    // UX: never show bottom status / debug toast (老大)
    if (msg) console.warn('[loaflings]', msg);
    if (statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = '';
    }
  }

  function displayName(result) {
    const p = labelPersonality(result?.personality);
    const rarity = labelRarity(result?.rarity);
    return `${p} · ${rarity}`;
  }

  function labelPersonality(id) {
    try {
      return api?.i18n?.labelId?.(locale, 'personality', id) || id || '—';
    } catch {
      return id || '—';
    }
  }

  function labelRarity(id) {
    try {
      return api?.i18n?.labelId?.(locale, 'rarity', id) || id || '—';
    } catch {
      return id || '—';
    }
  }

  function labelStyle(id) {
    try {
      return api?.i18n?.labelId?.(locale, 'style', id) || id || '—';
    } catch {
      return id || '—';
    }
  }

  function labelSource(src) {
    const key = `panel.source.${src}`;
    const hit = tr(key);
    return hit === key ? (src || '—') : hit;
  }

  /**
   * Visual daytime phases from CORE hatchProgress: egg | cracking | hatched.
   * Day/Save still gates collection via hatchDay.
   * @param {'egg' | 'cracking' | 'hatched' | 'growing'} next
   * @param {{ caption?: string, clicks?: number, keystrokes?: number, nextAt?: number|null }} [opts]
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
   * @param {{ caption?: string, clicks?: number, keystrokes?: number, nextAt?: number|null }} [opts]
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
      await loadPetArt(visual);
    }

    const hudH = document.getElementById('hud-hits');
    const hudP = document.getElementById('hud-phase');
    const clicks = typeof opts.clicks === 'number' ? opts.clicks : null;
    const keys = typeof opts.keystrokes === 'number' ? opts.keystrokes : null;
    const inputs = typeof opts.inputs === 'number' ? opts.inputs : null;
    if (hudH && (inputs != null || clicks != null || keys != null)) {
      hudH.textContent = String(inputs != null ? inputs : (clicks || 0) + (keys || 0));
    }
    if (hudP) hudP.textContent = visual;
  }

  function fillPanel(payload) {
    const result = payload?.result || {};
    const g = result.genes || {};
    if (panelTitle) panelTitle.textContent = tr('panel.title');
    document.getElementById('f-name').textContent = displayName(result);
    document.getElementById('f-type').textContent = labelPersonality(result.personality);
    document.getElementById('f-rarity').textContent = labelRarity(result.rarity);
    const styleEl = document.getElementById('f-style');
    if (styleEl) styleEl.textContent = labelStyle(result.style);
    document.getElementById('f-personality').textContent = labelPersonality(result.personality);
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
    document.getElementById('f-source').textContent = labelSource(payload?.source);

    const note = result.events?.[0]?.note || '';
    const date = result.date || '';
    document.getElementById('panel-note').textContent = [date, note]
      .filter(Boolean)
      .join(' · ');

    // Never surface the old debug reveal strip under the pet
    if (revealEl) revealEl.hidden = true;
    if (revealLine) revealLine.textContent = '';
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
    const base = PHASE_FILES[visual] || PHASE_FILES.egg;
    try {
      const art = await resolveArtUrl(base);
      if (art.kind === 'png') {
        mountRaster(mount, art.url);
      } else {
        const res = await fetch(art.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await mountSvgText(mount, await res.text());
      }
      phaseArtLoaded[visual] = true;
      lastVisualPhase = visual;
      return true;
    } catch (err) {
      setStatus(`Could not load ${visual} art: ${err.message || err}`);
      return false;
    }
  }

  async function loadPetArt(cacheKey) {
    const key = cacheKey || 'adult';
    if (petLoaded && lastVisualPhase === key) return true;
    const base = PHASE_FILES[key] || PHASE_FILES.adult;
    try {
      const art = await resolveArtUrl(base);
      if (art.kind === 'png') {
        mountRaster(petEl, art.url);
      } else {
        const res = await fetch(art.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const svg = await mountSvgText(petEl, await res.text());
        svg.querySelectorAll('g[opacity]').forEach((g) => {
          const opacity = Number(g.getAttribute('opacity'));
          if (opacity > 0 && opacity < 1) g.remove();
        });
        if (api?.parts?.fields) {
          svg.setAttribute('data-mvp-parts', api.parts.fields.join(','));
          svg.setAttribute('data-mvp-base', JSON.stringify(api.parts.base));
        }
      }
      petLoaded = true;
      lastVisualPhase = key;
      return true;
    } catch (err) {
      setStatus(`Could not load pet art: ${err.message || err}`);
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

    const okSvg = await loadPetArt();
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
        const okSvg = await loadPetArt();
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



  // —— i18n ——
  function tr(key) {
    try {
      return api?.i18n?.t?.(locale, key) || key;
    } catch {
      return key;
    }
  }
  function applyLocale() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = tr(key);
    });
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
    const banner = document.getElementById('view-banner');
    if (banner && viewingEntry) {
      banner.hidden = false;
      banner.textContent = `${tr('bag.viewing')} ${viewingEntry.date} · ${viewingEntry.name || ''}`;
    }
  }

  // —— Pack / calendar (collection) ——
  const bagEl = document.getElementById('bag');
  const bagCal = document.getElementById('bag-cal');
  const bagList = document.getElementById('bag-list');
  const viewBanner = document.getElementById('view-banner');

  function setBagOpen(open) {
    if (bagEl) bagEl.hidden = !open;
  }

  async function loadCollectionItems() {
    if (!api?.getCollection) return [];
    try {
      const col = await api.getCollection();
      if (!col?.ok) return [];
      collectionItems = Array.isArray(col.items) ? col.items : [];
      return collectionItems;
    } catch {
      return [];
    }
  }

  function itemsByDate() {
    const map = new Map();
    for (const it of collectionItems) {
      if (it?.date) map.set(it.date, it);
    }
    return map;
  }

  function renderBagCalendar() {
    if (!bagCal) return;
    const byDate = itemsByDate();
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay(); // 0 Sun
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const dow = locale === 'en'
      ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      : ['日', '一', '二', '三', '四', '五', '六'];
    bagCal.replaceChildren();
    for (const d of dow) {
      const el = document.createElement('div');
      el.className = 'dow';
      el.textContent = d;
      bagCal.appendChild(el);
    }
    for (let i = 0; i < startPad; i += 1) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bag-day';
      el.disabled = true;
      bagCal.appendChild(el);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = byDate.get(dateStr);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bag-day' + (entry ? ' has' : '') + (viewingEntry?.date === dateStr ? ' active' : '');
      btn.textContent = String(day);
      btn.title = entry ? `${dateStr} · ${entry.name}` : dateStr;
      if (entry) {
        btn.addEventListener('click', () => void viewCollectionEntry(entry));
      } else {
        btn.disabled = true;
      }
      bagCal.appendChild(btn);
    }
  }

  function renderBagList() {
    if (!bagList) return;
    bagList.replaceChildren();
    if (!collectionItems.length) {
      const p = document.createElement('p');
      p.className = 'panel-note';
      p.textContent = tr('bag.empty');
      bagList.appendChild(p);
      return;
    }
    for (const it of collectionItems) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bag-item' + (viewingEntry?.id === it.id ? ' active' : '');
      btn.textContent = `${it.date} · ${it.name || it.personality || 'Loafling'}`;
      btn.addEventListener('click', () => void viewCollectionEntry(it));
      bagList.appendChild(btn);
    }
  }

  async function viewCollectionEntry(entry) {
    viewingEntry = entry;
    if (stageEl) stageEl.dataset.viewing = '1';
    if (viewBanner) {
      viewBanner.hidden = false;
      viewBanner.textContent = `${tr('bag.viewing')} ${entry.date} · ${entry.name || ''}`;
    }
    // Until ART ships per-gene looks, show adult base + panel stats
    await applyPhase('adult');
    fillPanel({
      ok: true,
      source: 'collection',
      result: {
        date: entry.date,
        kind: entry.kind || 'loafling',
        personality: entry.personality,
        rarity: entry.rarity,
        style: entry.style,
        genes: entry.genes,
        traits: entry.traits,
        events: entry.events,
      },
    });
    setPanelOpen(false);
    setBagOpen(false);
    renderBagCalendar();
    renderBagList();
  }

  async function clearViewing() {
    viewingEntry = null;
    if (stageEl) stageEl.dataset.viewing = '0';
    if (viewBanner) {
      viewBanner.hidden = true;
      viewBanner.textContent = '';
    }
    await syncFromMain();
    await refreshHatchProgress();
  }

  document.getElementById('btn-pack')?.addEventListener('click', async () => {
    setSettingsOpen(false);
    setPanelOpen(false);
    await loadCollectionItems();
    renderBagCalendar();
    renderBagList();
    setBagOpen(true);
  });
  document.getElementById('btn-close-bag')?.addEventListener('click', () => setBagOpen(false));
  document.getElementById('bag-back-today')?.addEventListener('click', async () => {
    setBagOpen(false);
    await clearViewing();
  });
  document.getElementById('bag-tab-cal')?.addEventListener('click', () => {
    if (bagCal) bagCal.hidden = false;
    if (bagList) bagList.hidden = true;
    document.getElementById('bag-tab-cal')?.classList.remove('chip-quiet');
    document.getElementById('bag-tab-list')?.classList.add('chip-quiet');
  });
  document.getElementById('bag-tab-list')?.addEventListener('click', () => {
    if (bagCal) bagCal.hidden = true;
    if (bagList) bagList.hidden = false;
    document.getElementById('bag-tab-list')?.classList.remove('chip-quiet');
    document.getElementById('bag-tab-cal')?.classList.add('chip-quiet');
  });

  // —— Settings ——
  const settingsEl = document.getElementById('settings');
  const opacityEl = document.getElementById('set-opacity');
  const scaleEl = document.getElementById('set-scale');
  const lockEl = document.getElementById('set-lock');
  const showChromeEl = document.getElementById('set-show-chrome');
  const showHudEl = document.getElementById('set-show-hud');
  const localeEl = document.getElementById('set-locale');
  const chromePeekEl = document.getElementById('btn-chrome-peek');

  function setSettingsOpen(open) {
    if (settingsEl) settingsEl.hidden = !open;
  }

  function applyChromePrefs(s) {
    const showChrome = s?.showChrome !== false;
    const showHud = s?.showHud !== false;
    if (stageEl) {
      stageEl.dataset.chrome = showChrome ? '1' : '0';
      stageEl.dataset.hud = showHud ? '1' : '0';
    }
    if (chromePeekEl) chromePeekEl.hidden = showChrome;
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
      if (showChromeEl) showChromeEl.checked = s.showChrome !== false;
      if (showHudEl) showHudEl.checked = s.showHud !== false;
      locale = s.locale === 'en' ? 'en' : 'zh';
      if (localeEl) localeEl.value = locale;
      applyChromePrefs(s);
      applyLocale();
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
  chromePeekEl?.addEventListener('click', async () => {
    await api?.setSettings?.({ showChrome: true });
    await hydrateSettings();
    setSettingsOpen(true);
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
  showChromeEl?.addEventListener('change', async () => {
    const showChrome = Boolean(showChromeEl.checked);
    await api?.setSettings?.({ showChrome });
    applyChromePrefs({ showChrome, showHud: showHudEl ? showHudEl.checked : true });
  });
  showHudEl?.addEventListener('change', async () => {
    const showHud = Boolean(showHudEl.checked);
    await api?.setSettings?.({ showHud });
    applyChromePrefs({
      showChrome: showChromeEl ? showChromeEl.checked : true,
      showHud,
    });
  });
  localeEl?.addEventListener('change', async () => {
    locale = localeEl.value === 'en' ? 'en' : 'zh';
    await api?.setSettings?.({ locale });
    applyLocale();
    if (lastPayload && panelEl && !panelEl.hidden) fillPanel(lastPayload);
    if (viewingEntry) {
      const banner = document.getElementById('view-banner');
      if (banner && !banner.hidden) {
        banner.textContent = `${tr('bag.viewing')} ${viewingEntry.date} · ${viewingEntry.name || ''}`;
      }
    }
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
      await loadCollectionItems();
      await refreshBadge();
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
      const okSvg = await loadPetArt();
      if (okSvg) await applyPhase('adult');
    } else if (day?.phase === 'growing') {
      await applyPhase('cracking');
    }
  });

  // —— Idle FX: pose + expr + cloud (LEAD 3-layer; not genes) ——
  const idleFxEl = document.getElementById('idle-fx');
  const idleBodyEl = document.getElementById('idle-fx-body');
  const idleCloudEl = document.getElementById('idle-fx-cloud');
  let idleBusyUntil = 0;
  let lastActivityClicks = 0;
  let lastActivityKeys = 0;
  let quietMs = 0;
  let lastIdlePickAt = 0;
  let lastIdleMood = null;

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickWeightedLocal(weights) {
    const keys = Object.keys(weights || {});
    let total = 0;
    for (const k of keys) total += Math.max(0, Number(weights[k]) || 0);
    if (!keys.length || total <= 0) return null;
    let roll = Math.random() * total;
    for (const k of keys) {
      roll -= Math.max(0, Number(weights[k]) || 0);
      if (roll <= 0) return k;
    }
    return keys[keys.length - 1];
  }

  /** Strip baked thought-cloud (y < 300) so cloud_* layer owns mood. */
  function stripBakedCloud(svg) {
    svg.querySelectorAll('circle').forEach((el) => {
      const cy = Number(el.getAttribute('cy'));
      if (Number.isFinite(cy) && cy < 300) el.remove();
    });
    // sparkles / zZ / lightning often sit with the baked cloud
    svg.querySelectorAll('path, text').forEach((el) => {
      const d = el.getAttribute('d') || '';
      const fill = (el.getAttribute('fill') || '').toUpperCase();
      const stroke = (el.getAttribute('stroke') || '').toUpperCase();
      if (stroke === '#F5C84C' || fill === '#F5C84C') el.remove();
      if (/z/i.test(el.textContent || '')) el.remove();
      // tiny upper sparkle paths (rough: only M points with y < 200)
      const ys = [...d.matchAll(/([\d.]+)\s+([\d.]+)/g)].map((m) => Number(m[2]));
      if (ys.length && ys.every((y) => y < 220)) el.remove();
    });
  }

  async function loadIdleAsset(id, { stripCloud = false } = {}) {
    const art = await resolveIdleUrl(id);
    if (art.kind === 'png') {
      const img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      img.src = art.url;
      return img;
    }
    const res = await fetch(art.url);
    if (!res.ok) throw new Error(`${id} ${res.status}`);
    const svgText = await res.text();
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement;
    if (svg.querySelector('parsererror')) throw new Error(`parse ${id}`);
    const firstRect = svg.querySelector('rect');
    if (firstRect) firstRect.setAttribute('fill', 'none');
    if (stripCloud) stripBakedCloud(svg);
    return document.importNode(svg, true);
  }

  function pickIdleLayers(mood) {
    let exprShort = 'happy';
    let poseId = null;
    const usePose = Math.random() < 0.45;
    if (mood?.expr && mood?.pose) {
      exprShort = pickWeightedLocal(mood.expr) || 'normal';
      if (usePose) {
        const ps = pickWeightedLocal(mood.pose);
        poseId = ps ? `pose_${ps}` : pick(IDLE_POSE_IDS);
      }
    } else {
      exprShort = pick(['happy', 'sleepy', 'surprised', 'content', 'normal']);
      if (usePose) poseId = pick(IDLE_POSE_IDS);
    }
    let cloud = IDLE_CLOUD_BY_EXPR[exprShort] || 'cloud_normal';
    if (mood?.dominant === 'dream' && Math.random() < 0.55) cloud = 'cloud_sleepy';
    if (mood?.dominant === 'work' && exprShort === 'surprised') cloud = 'cloud_excited';
    return {
      // MVP assets are full frames: prefer pose body, else expr body
      body: poseId || `expr_${exprShort}`,
      exprShort,
      cloud,
      isPose: Boolean(poseId),
    };
  }

  async function showIdleCompose(layers) {
    if (!idleFxEl || !idleBodyEl || !idleCloudEl || !IDLE_OK_PHASES.has(phase)) {
      if (idleFxEl) idleFxEl.hidden = true;
      return;
    }
    try {
      const bodySvg = await loadIdleAsset(layers.body, { stripCloud: true });
      const cloudSvg = await loadIdleAsset(layers.cloud, { stripCloud: false });
      idleBodyEl.replaceChildren(bodySvg);
      idleCloudEl.replaceChildren(cloudSvg);
      idleFxEl.hidden = false;
      if (petEl) petEl.style.opacity = '0';
      const ms = layers.isPose ? 4200 : 3200;
      idleBusyUntil = Date.now() + ms;
      setTimeout(() => {
        if (Date.now() < idleBusyUntil - 50) return;
        idleFxEl.hidden = true;
        idleBodyEl.replaceChildren();
        idleCloudEl.replaceChildren();
        if (petEl) petEl.style.opacity = '';
      }, ms);
    } catch (err) {
      console.warn('[loaflings] idle compose', layers, err);
    }
  }

  function maybeIdleFx(hp) {
    if (!IDLE_OK_PHASES.has(phase)) {
      if (idleFxEl) {
        idleFxEl.hidden = true;
        if (petEl) petEl.style.opacity = '';
      }
      return;
    }
    if (Date.now() < idleBusyUntil) return;
    if (hp?.idleMood) lastIdleMood = hp.idleMood;
    const mood = lastIdleMood;
    if (mood && mood.allowIdle === false) return;

    const clicks = hp?.clicks || 0;
    const keys = hp?.keystrokes || 0;
    const delta = clicks - lastActivityClicks + (keys - lastActivityKeys);
    if (delta > 0) {
      quietMs = 0;
      lastActivityClicks = clicks;
      lastActivityKeys = keys;
      return;
    }
    quietMs += 500;
    if (quietMs < 2500) return;
    const gap = (mood && mood.intervalMs) || 12000;
    if (Date.now() - lastIdlePickAt < gap) return;
    if (Math.random() > 0.35) return;
    quietMs = 0;
    lastIdlePickAt = Date.now();
    void showIdleCompose(pickIdleLayers(mood));
  }

  async function refreshHatchProgress() {
    if (!api?.getHatchProgress) return;
    if (viewingEntry) {
      // Still refresh hits number, keep past look
      try {
        const hp = await api.getHatchProgress();
        if (hp?.ok) {
          const hudH = document.getElementById('hud-hits');
          if (hudH) {
            const hits =
              typeof hp.inputs === 'number'
                ? hp.inputs
                : (hp.clicks || 0) + (hp.keystrokes || 0);
            hudH.textContent = String(hits);
          }
        }
      } catch {
        // ignore
      }
      return;
    }
    try {
      const hp = await api.getHatchProgress();
      if (!hp?.ok || !hp.progress) return;
      const visual = hp.alreadySaved ? 'adult' : hp.progress.phase;
      await applyPhase(visual, {
        clicks: hp.clicks,
        keystrokes: hp.keystrokes || 0,
        inputs: hp.progress?.inputs ?? hp.inputs,
        nextAt: hp.progress.nextStageAt,
      });
      // pass keystrokes if present on payload
      maybeIdleFx({
        clicks: hp.clicks,
        keystrokes: hp.keystrokes || 0,
        idleMood: hp.idleMood || null,
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
  
  // Live counts from DAY-SENSE (immediate, not waiting for 500ms poll)
  if (api?.onSenseCounts) {
    api.onSenseCounts((payload) => {
      const hudH = document.getElementById('hud-hits');
      if (!hudH) return;
      if (typeof payload?.activityHits === 'number') {
        hudH.textContent = String(payload.activityHits);
        return;
      }
      const clicks = typeof payload?.clicks === 'number' ? payload.clicks : 0;
      const keys = typeof payload?.keystrokes === 'number' ? payload.keystrokes : 0;
      hudH.textContent = String(clicks + keys);
    });
  }

  setInterval(refreshHatchProgress, 500);

})();


// DAY-SENSE: quiet when healthy; surface Accessibility hint if hooks idle-only
(async function sensePermissionHint() {
  const api = window.loaflings;
  if (!api?.getSenseStatus) return;
  try {
    const s = await api.getSenseStatus();
    if (s?.permissionHint && s.backend !== 'uiohook-napi') {
      console.info('[loaflings] Accessibility needed for live sense', s.backend);
    }
  } catch (err) {
    console.warn('[loaflings] sense status', err);
  }
})();
