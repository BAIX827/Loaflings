/**
 * Renderer: show Pet_Base_Master.svg + demo settle (SENSE fixture → CORE).
 * Part IDs from window.loaflings.parts (← src/art/parts.ts).
 */
(async function boot() {
  const petEl = document.getElementById('pet');
  const statusEl = document.getElementById('status');
  const revealEl = document.getElementById('reveal');
  const revealLine = document.getElementById('reveal-line');
  const api = window.loaflings;

  const masterPath = '../../character/Pet_Base_Master.svg';

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
    statusEl.hidden = false;
    statusEl.textContent = `Could not load pet SVG: ${err.message || err}`;
    return;
  }

  // Wire SENSE demo fixture → CORE settleDay (no formulas in DESK)
  if (api?.getDemoSettle) {
    try {
      const payload = await api.getDemoSettle();
      if (!payload?.ok) {
        statusEl.hidden = false;
        statusEl.textContent = `Settle failed: ${payload?.error || 'unknown'}`;
        return;
      }
      const { result } = payload;
      const g = result.genes || {};
      const eventNote = result.events?.[0]?.note || '';
      revealEl.hidden = false;
      revealLine.textContent = [
        `${result.personality || '?'} · ${result.rarity || '?'}`,
        `${g.body}/${g.cloud}/${g.face}/${g.tail}`,
        eventNote,
      ]
        .filter(Boolean)
        .join(' · ');
    } catch (err) {
      statusEl.hidden = false;
      statusEl.textContent = `Settle IPC error: ${err.message || err}`;
    }
  }

  // Later: pass companion window id into SENSE excludeWindowIds
  api?.onCompanionWindowId?.((payload) => {
    console.log('[loaflings] companion windowId', payload?.windowId);
  });
})();
