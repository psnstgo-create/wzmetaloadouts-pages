/**
 * patches-render.js v2 — WZ Meta Loadouts
 *
 * Renderiza el historial oficial de buffs/nerfs por arma.
 * Fuente: weapon-patches.json
 *
 * CAMBIOS v2:
 *  - Sin emojis genéricos en título ni badges
 *  - Sin link a fuente externa
 *  - Temporada ACTUAL destacada vs anteriores
 *  - Fecha visible y formateada en español
 *  - Estructura lista para auto-update desde patch_watcher.py
 *
 * USO:
 *   <script src="/js/patches-render.js" defer></script>
 */

(function() {
  'use strict';

  const PATCHES_URL = '/weapon-patches.json';

  // ═══════════════════════════════════════════════════
  // 1. Detectar slug del arma desde la URL
  // ═══════════════════════════════════════════════════
  function getWeaponSlug() {
    const match = window.location.pathname.match(/\/armas\/([a-z0-9\-]+)(?:\.html)?\/?$/i);
    if (match) return match[1].toLowerCase();
    if (window.WEAPON_SLUG) return window.WEAPON_SLUG.toLowerCase();
    return null;
  }

  // ═══════════════════════════════════════════════════
  // 2. Formatear fecha a español
  // ═══════════════════════════════════════════════════
  function formatFecha(fechaIso) {
    if (!fechaIso) return '';
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const partes = fechaIso.split('-');
    if (partes.length !== 3) return fechaIso;
    const [y, m, d] = partes;
    const dia = parseInt(d, 10);
    const mes = meses[parseInt(m, 10) - 1] || '';
    return `${dia} de ${mes} de ${y}`;
  }

  // ═══════════════════════════════════════════════════
  // 3. Determinar la temporada más reciente
  // ═══════════════════════════════════════════════════
  function getTemporadaActual(patches) {
    if (!patches || patches.length === 0) return null;
    const ordenados = [...patches].sort((a, b) => {
      return (b.fecha || '').localeCompare(a.fecha || '');
    });
    return ordenados[0].season;
  }

  // ═══════════════════════════════════════════════════
  // 4. Renderizar un cambio individual
  // ═══════════════════════════════════════════════════
  function renderCambio(cambio) {
    const tipo = cambio.tipo;
    let label;
    if (tipo === 'buff')      label = 'BUFF';
    else if (tipo === 'nerf') label = 'NERF';
    else if (tipo === 'fix')  label = 'FIX';
    else if (tipo === 'nuevo')label = 'NUEVO';
    else                      label = tipo.toUpperCase();

    return `
      <li class="patch-cambio patch-cambio--${tipo}">
        <span class="patch-badge patch-badge--${tipo}">${label}</span>
        <span class="patch-desc">${escapeHtml(cambio.descripcion)}</span>
      </li>
    `;
  }

  // ═══════════════════════════════════════════════════
  // 5. Renderizar un patch (season completa)
  // ═══════════════════════════════════════════════════
  function renderPatch(patch, esActual) {
    const cambios = patch.cambios || [];
    const buffs = cambios.filter(c => c.tipo === 'buff').length;
    const nerfs = cambios.filter(c => c.tipo === 'nerf').length;
    const fixes = cambios.filter(c => c.tipo === 'fix' || c.tipo === 'nuevo').length;

    let resumen = '';
    if (buffs > 0) resumen += `<span class="patch-stat patch-stat--buff">+${buffs} BUFF${buffs>1?'S':''}</span>`;
    if (nerfs > 0) resumen += `<span class="patch-stat patch-stat--nerf">-${nerfs} NERF${nerfs>1?'S':''}</span>`;
    if (fixes > 0) resumen += `<span class="patch-stat patch-stat--fix">${fixes} FIX</span>`;

    const modos = (patch.modos_afectados || []).join(' · ');
    const modosHtml = modos ? `<div class="patch-modos">Afecta a: ${escapeHtml(modos)}</div>` : '';

    const contextoHtml = patch.contexto
      ? `<p class="patch-contexto">${escapeHtml(patch.contexto)}</p>`
      : '';

    const fechaFormat = formatFecha(patch.fecha);
    const fechaHtml = fechaFormat ? `<span class="patch-fecha">${fechaFormat}</span>` : '';

    // Marcar la temporada actual de forma especial
    const labelTemporada = esActual
      ? `<span class="patch-season-title patch-season-title--actual">${escapeHtml(patch.season)} <span class="patch-actual-tag">TEMPORADA ACTUAL</span></span>`
      : `<span class="patch-season-title">${escapeHtml(patch.season)}</span>`;

    return `
      <details class="patch-season ${esActual ? 'patch-season--actual' : ''}" ${esActual ? 'open' : ''}>
        <summary class="patch-summary">
          <div class="patch-summary-left">
            ${labelTemporada}
            ${fechaHtml}
          </div>
          <div class="patch-stats">${resumen}</div>
        </summary>
        <div class="patch-body">
          ${modosHtml}
          <ul class="patch-cambios">
            ${cambios.map(renderCambio).join('')}
          </ul>
          ${contextoHtml}
        </div>
      </details>
    `;
  }

  // ═══════════════════════════════════════════════════
  // 6. Renderizar la sección completa
  // ═══════════════════════════════════════════════════
  function renderSection(armaData) {
    const patches = armaData.patches || [];

    if (patches.length === 0) {
      return `
        <section class="patches-section">
          <h2 class="patches-title">Historial de cambios oficiales</h2>
          <p class="patches-empty">Sin cambios registrados aún para esta arma.</p>
        </section>
      `;
    }

    const temporadaActual = getTemporadaActual(patches);
    const patchesOrdenados = [...patches].sort((a, b) => {
      return (b.fecha || '').localeCompare(a.fecha || '');
    });

    return `
      <section class="patches-section">
        <h2 class="patches-title">Historial de cambios oficiales</h2>
        <p class="patches-subtitle">Datos verificados del blog oficial de Treyarch — sin opiniones, solo cambios reales</p>
        ${patchesOrdenados.map((p, i) => renderPatch(p, p.season === temporadaActual)).join('')}
      </section>
    `;
  }

  // ═══════════════════════════════════════════════════
  // 7. Estilos
  // ═══════════════════════════════════════════════════
  const STYLES = `
    .patches-section {
      max-width: 900px;
      margin: 40px auto;
      padding: 24px;
      background: #0a0a0a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .patches-title {
      color: #f5a623;
      font-size: 1.4em;
      margin: 0 0 8px 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .patches-subtitle {
      color: #888;
      font-size: 0.85em;
      margin: 0 0 24px 0;
      font-style: italic;
    }
    .patches-empty {
      color: #666;
      font-style: italic;
      padding: 12px 0;
    }
    .patch-season {
      background: #141414;
      border-left: 3px solid #2a2a2a;
      margin: 12px 0;
      padding: 0;
      border-radius: 4px;
      overflow: hidden;
    }
    .patch-season--actual {
      border-left-color: #f5a623;
      background: #161208;
    }
    .patch-summary {
      cursor: pointer;
      padding: 14px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      list-style: none;
      user-select: none;
    }
    .patch-summary::-webkit-details-marker { display: none; }
    .patch-summary::marker { content: ''; }
    .patch-summary::before {
      content: '▶';
      color: #f5a623;
      font-size: 0.7em;
      transition: transform 0.2s;
      margin-right: 8px;
    }
    .patch-season[open] .patch-summary::before {
      transform: rotate(90deg);
    }
    .patch-summary-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 200px;
    }
    .patch-season-title {
      font-weight: 700;
      color: #fff;
      font-size: 1.05em;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .patch-season-title--actual { color: #f5a623; }
    .patch-actual-tag {
      display: inline-block;
      background: #f5a623;
      color: #000;
      font-size: 0.65em;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 3px;
      letter-spacing: 0.8px;
    }
    .patch-fecha {
      color: #aaa;
      font-size: 0.85em;
    }
    .patch-stats {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .patch-stat {
      font-size: 0.7em;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 3px;
      letter-spacing: 0.5px;
    }
    .patch-stat--buff { background: #1e3a1e; color: #4ade80; }
    .patch-stat--nerf { background: #3a1e1e; color: #f87171; }
    .patch-stat--fix  { background: #1e2a3a; color: #60a5fa; }
    .patch-body {
      padding: 0 16px 16px 16px;
    }
    .patch-modos {
      color: #888;
      font-size: 0.8em;
      margin-bottom: 12px;
      padding: 6px 10px;
      background: #1a1a1a;
      border-radius: 3px;
      display: inline-block;
    }
    .patch-cambios {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .patch-cambio {
      padding: 10px 0;
      border-bottom: 1px solid #1f1f1f;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      flex-wrap: wrap;
    }
    .patch-cambio:last-child { border-bottom: none; }
    .patch-badge {
      font-size: 0.7em;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 3px;
      letter-spacing: 0.8px;
      white-space: nowrap;
      min-width: 60px;
      text-align: center;
    }
    .patch-badge--buff  { background: #1e3a1e; color: #4ade80; }
    .patch-badge--nerf  { background: #3a1e1e; color: #f87171; }
    .patch-badge--fix   { background: #1e2a3a; color: #60a5fa; }
    .patch-badge--nuevo { background: #3a2a1e; color: #f5a623; }
    .patch-desc {
      color: #d0d0d0;
      font-size: 0.92em;
      line-height: 1.5;
      flex: 1;
      min-width: 0;
    }
    .patch-contexto {
      margin-top: 14px;
      padding: 10px 12px;
      background: #1a1a1a;
      border-left: 2px solid #60a5fa;
      color: #b0b0b0;
      font-size: 0.88em;
      font-style: italic;
      border-radius: 3px;
    }
    @media (max-width: 600px) {
      .patches-section { margin: 20px 10px; padding: 16px; }
      .patch-summary { flex-direction: column; align-items: flex-start; }
      .patch-stats { width: 100%; }
    }
  `;

  function injectStyles() {
    if (document.getElementById('patches-styles')) return;
    const style = document.createElement('style');
    style.id = 'patches-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════
  // 8. Helpers
  // ═══════════════════════════════════════════════════
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function findContainer() {
    let container = document.getElementById('patches-container');
    if (container) return container;
    container = document.createElement('div');
    container.id = 'patches-container';
    const target = document.querySelector('main') || document.body;
    target.appendChild(container);
    return container;
  }

  // ═══════════════════════════════════════════════════
  // 9. MAIN
  // ═══════════════════════════════════════════════════
  async function init() {
    const slug = getWeaponSlug();
    if (!slug) return;

    try {
      const response = await fetch(PATCHES_URL, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();

      const armaData = data[slug];
      if (!armaData) return;

      injectStyles();
      const container = findContainer();
      container.innerHTML = renderSection(armaData);
      console.log(`[patches-render] ✓ ${(armaData.patches || []).length} patches renderizados para '${slug}'`);

    } catch (err) {
      console.error('[patches-render]', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
