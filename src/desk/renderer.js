/**
 * Renderer: Pet_Base_Master.svg + end-of-day reveal + local collection.
 * Part IDs from window.loaflings.parts (← src/art/parts.ts).
 * Settlement from CORE via IPC — no gene formulas in DESK.
 */
(async function boot() {
  const petEl = document.getElementById('pet');
  const statusEl = document.getElementById('status');
  const revealEl = document.getElementById('reveal');
  const revealLine = document.getElementById('reveal-line');
  const panelEl = document.getElementById('panel');
  const badgeEl = document.getElementById('collection-badge');
  const api = window.loaflings;

  const masterPath = '../../character/Pet_Base_Master.svg';

  /** @type {object | null} */
  let lastPayload = null;

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

    const eventNote = note;
    revealEl.hidden = false;
    revealLine.textContent = [
      displayName(result),
      `${g.body}/${g.cloud}/${g.face}/${g.tail}`,
      eventNote,
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
  } catch (err) {
    setStatus(`Could not load pet SVG: ${err.message || err}`);
    return;
  }

  await refreshBadge();

  // Soft preview line from demo (or live if already up) — no auto-save
  await loadSettle(false);

  document.getElementById('btn-reveal')?.addEventListener('click', async () => {
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
    setStatus('');
    const payload = await loadSettle(true);
    if (payload?.ok) {
      setPanelOpen(true);
      setStatus(`Saved · collection ${payload.count ?? '?'}`);
      setTimeout(() => setStatus(''), 2200);
    }
  });

  api?.onCompanionWindowId?.((payload) => {
    console.log('[loaflings] companion windowId', payload?.windowId);
  });
})();
