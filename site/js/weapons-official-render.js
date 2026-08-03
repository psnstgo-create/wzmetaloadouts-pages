/* ══════════════════════════════════════════════════════════
   weapons-official-render.js  ·  v3.2 (X-Ray Callout)
   Ficha de ESTADÍSTICAS OFICIALES (Armería in-game BO7).
   - Lee /weapons-official.json y cruza por slug (window.WEAPON_SLUG)
   - Cuerpo = imagen X-Ray + heat dinámico por zona (mapa de calor = datos)
   - Layout callout: cuerpo al centro, 4 zonas a cada lado con líneas que
     SÍ conectan; desktop ancho/bajo, móvil en columna. Íconos SVG reales.
   - CSS propio, todo prefijado .wo- (no colisiona con style.css)
   - Si el arma no tiene stats oficiales → no hace nada (no rompe)
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function attr(s) { return esc(s).replace(/`/g, '&#96;'); }
  function cssUrl(s) { return `url("${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`; }

  // Imagen base X-Ray. Súbela a /js/assets/wo-xray-body-base.png
  // (puedes sobrescribir la ruta con window.WO_XRAY_BODY_IMAGE antes de cargar).
  const WO_BODY_IMAGE_SRC = window.WO_XRAY_BODY_IMAGE || '/js/assets/wo-xray-body-base.png';

  // Zona JSON → etiqueta
  const ZONE_DEFS = [
    ['cabeza', 'Cabeza'],
    ['cuello_pecho_alto', 'Cuello'],
    ['pecho', 'Pecho'],
    ['brazos', 'Brazos'],
    ['abdomen', 'Abdomen'],
    ['caderas', 'Caderas'],
    ['piernas', 'Piernas'],
    ['pies', 'Pies']
  ];

  // Íconos SVG (línea, currentColor) — uno por zona
  const ICONS = {
    cabeza: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5c-4 0-6.7 2.8-6.7 6.6 0 2 .7 3.4 1.6 4.4.4.45.6 1 .6 1.6v1.2c0 .8.6 1.4 1.4 1.4h7.4c.8 0 1.4-.6 1.4-1.4v-1.2c0-.6.2-1.15.6-1.6.9-1 1.6-2.4 1.6-4.4 0-3.8-2.7-6.6-6.7-6.6Z" fill="currentColor" opacity=".13"/><circle cx="9.2" cy="10.4" r="2" fill="currentColor"/><circle cx="14.8" cy="10.4" r="2" fill="currentColor"/><path d="M12 12.7l-1 2.1h2l-1-2.1Z" fill="currentColor"/><path d="M9.5 17.6v2M12 17.6v2.4M14.5 17.6v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 2.5c-4 0-6.7 2.8-6.7 6.6 0 2 .7 3.4 1.6 4.4.4.45.6 1 .6 1.6v1.2c0 .8.6 1.4 1.4 1.4h7.4c.8 0 1.4-.6 1.4-1.4v-1.2c0-.6.2-1.15.6-1.6.9-1 1.6-2.4 1.6-4.4 0-3.8-2.7-6.6-6.7-6.6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    cuello: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3.4" fill="currentColor" opacity=".13"/><circle cx="12" cy="6" r="3.4"/><path d="M9.6 8.8 9.2 12c-.06.5-.4.9-.9 1.05L5 14M14.4 8.8l.4 3.2c.06.5.4.9.9 1.05L19 14"/><path d="M5.5 20.5c0-3 2.9-5 6.5-5s6.5 2 6.5 5"/></svg>`,
    pecho: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v16"/><path d="M12 6.4c-2.6 0-4.7.9-5.8 2M12 6.4c2.6 0 4.7.9 5.8 2"/><path d="M12 9.9c-2.2 0-4 .8-5 1.8M12 9.9c2.2 0 4 .8 5 1.8"/><path d="M12 13.4c-1.8 0-3.3.7-4.2 1.6M12 13.4c1.8 0 3.3.7 4.2 1.6"/><path d="M12 16.9c-1.4 0-2.6.6-3.4 1.4M12 16.9c1.4 0 2.6.6 3.4 1.4"/></svg>`,
    brazos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20.5c-.5-2.2-.3-4 .8-5.5C6.4 13.9 5.5 12.2 5.6 10.1 5.7 7.5 7.5 5.5 10 5.5"/><path d="M10 5.5c2.2 0 3.7 1.6 3.9 3.9.15 1.8-.5 3.2-1.7 4.2 1.7.7 2.7 2.2 2.8 4.2.05 1-.15 1.9-.5 2.7"/></svg>`,
    abdomen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5c-.6 4-.6 11 0 15 .3 1.8 1 2.5 5 2.5s4.7-.7 5-2.5c.6-4 .6-11 0-15" fill="currentColor" opacity=".12"/><path d="M7 4.5c-.6 4-.6 11 0 15 .3 1.8 1 2.5 5 2.5s4.7-.7 5-2.5c.6-4 .6-11 0-15"/><path d="M12 5v15M7.5 9.5h9M7.3 13h9.4M7.4 16.5h9.2"/></svg>`,
    caderas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7c.5 4.5 2.5 7.2 4.6 8.2.6.3 1 .9 1.1 1.6l.4 3.2M20 7c-.5 4.5-2.5 7.2-4.6 8.2-.6.3-1 .9-1.1 1.6l-.4 3.2"/><path d="M4 7c2.4-1.3 5.2-1.6 8-1.6S17.6 5.7 20 7"/><path d="M9 14.6c.9.6 1.9.9 3 .9s2.1-.3 3-.9"/></svg>`,
    piernas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.4 3c-.4 3.5-.5 5.2 0 7 .6 2.2.5 3.8-.2 6-.4 1.3-.5 2.6-.3 4"/><path d="M14.6 3c.4 3.5.5 5.2 0 7-.6 2.2-.5 3.8.2 6 .4 1.3.5 2.6.3 4"/><path d="M6.4 20.7c.8.5 1.8.8 2.8.8M14.8 21.5c1 0 2-.3 2.8-.8"/></svg>`,
    pies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.5c-.3 2.5-.2 4.8.1 7 .2 1.6-.2 2.7-1.4 3.7-1.6 1.3-2.5 2.6-2.6 4.2-.05.9.5 1.6 1.4 1.7 2.6.3 7.4.3 10 0 1.3-.15 2-1 2-2.2 0-1.8-1.1-2.8-2.8-3.6-1.8-.85-2.6-2-2.7-3.9-.06-1 .1-2.2.3-3.9" fill="currentColor" opacity=".1"/><path d="M9 3.5c-.3 2.5-.2 4.8.1 7 .2 1.6-.2 2.7-1.4 3.7-1.6 1.3-2.5 2.6-2.6 4.2-.05.9.5 1.6 1.4 1.7 2.6.3 7.4.3 10 0 1.3-.15 2-1 2-2.2 0-1.8-1.1-2.8-2.8-3.6-1.8-.85-2.6-2-2.7-3.9-.06-1 .1-2.2.3-3.9"/></svg>`
  };

  const PRECISION = [
    ['dispersion_cadera_max', 'Dispersión cadera', '°'],
    ['dispersion_cadera_saltar', 'Dispersión saltando', '°'],
    ['dispersion_cadera_deslizarse', 'Dispersión deslizando', '°'],
    ['dispersion_cadera_lanzarse', 'Dispersión lanzándose', '°'],
    ['escala_retroceso_primer_disparo', 'Escala retroceso 1er disparo', '×'],
    ['retroceso_arma', 'Retroceso del arma', '°/s'],
    ['control_retroceso_horizontal', 'Control retroceso H', '°/s'],
    ['control_retroceso_vertical', 'Control retroceso V', '°/s'],
    ['velocidad_restablecimiento_retroceso_ms', 'Restablecimiento retroceso', 'ms'],
    ['balanceo_apuntar_inmovil', 'Balanceo al apuntar', '°/s'],
    ['retraso_balanceo_ms', 'Retraso del balanceo', 'ms'],
    ['resistencia_estremecimiento', 'Resistencia al estremecimiento', 'N']
  ];
  const MOVILIDAD = [
    ['velocidad_movimiento_ms', 'Velocidad de movimiento', 'm/s'],
    ['velocidad_agachado_ms', 'Agachado', 'm/s'],
    ['velocidad_esprintar_ms', 'Al esprintar', 'm/s'],
    ['velocidad_apuntando_ms', 'Apuntando (ADS)', 'm/s']
  ];
  const MANEJO = [
    ['recarga_ms', 'Recarga', 'ms'],
    ['ads_ms', 'Apuntado (ADS)', 'ms'],
    ['ads_saltar_ms', 'ADS al saltar', 'ms'],
    ['esprintar_disparar_ms', 'Esprintar a disparar', 'ms'],
    ['deslizarse_disparar_ms', 'Deslizar a disparar', 'ms'],
    ['lanzarse_disparar_ms', 'Lanzarse a disparar', 'ms'],
    ['esprintar_disparar_saltar_ms', 'Esprintar a disparar (salto)', 'ms']
  ];

  // ── Heatmap: daño → color (bajo=amarillo, medio=naranja, alto=rojo) ──
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function zoneColor(d, min, max) {
    if (max <= min) return 'rgb(255,138,0)';
    const t = Math.max(0, Math.min(1, (d - min) / (max - min)));
    const Y = [255, 210, 31], O = [255, 122, 0], R = [255, 45, 45];
    let a, b, k;
    if (t < 0.5) { a = Y; b = O; k = t / 0.5; } else { a = O; b = R; k = (t - 0.5) / 0.5; }
    return `rgb(${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k)},${lerp(a[2], b[2], k)})`;
  }
  function zoneVal(z) { return (z && typeof z === 'object') ? z.valor : z; }
  function heatAlpha(d, min, max) {
    if (typeof d !== 'number') return 0.42;
    if (max <= min) return 0.62;
    const t = Math.max(0, Math.min(1, (d - min) / (max - min)));
    // Híbrido: la zona de mayor daño tiñe fuerte (rojo); la menor queda tenue (amarillo)
    return (0.42 + (t * 0.5)).toFixed(2);
  }
  function heatStyleFor(key, dano, min, max) {
    const v = zoneVal(dano[key]);
    const c = (typeof v === 'number') ? zoneColor(v, min, max) : 'rgb(255,138,0)';
    return { color: c, alpha: heatAlpha(v, min, max) };
  }

  function statIcon(type) {
    if (type === 'rate') return `<svg viewBox="0 0 48 48" fill="none"><path d="M8 29a16 16 0 1 1 32 0" stroke="currentColor" stroke-width="3"/><path d="M24 29l8-12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M10 35h28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
    if (type === 'bullet') return `<svg viewBox="0 0 48 48" fill="none"><path d="M24 4c8 8 10 16 10 26v12H14V30C14 20 16 12 24 4Z" stroke="currentColor" stroke-width="3"/><path d="M14 30h20" stroke="currentColor" stroke-width="3"/></svg>`;
    return `<svg viewBox="0 0 48 48" fill="none"><path d="M15 7h16l4 8v26H17L13 15l2-8Z" stroke="currentColor" stroke-width="3"/><path d="M19 12v23M25 12v23M31 16v19" stroke="currentColor" stroke-width="2"/></svg>`;
  }

  // ── Posiciones del callout (% dentro de .wo-figure) ────────────────
  // side: 'l' izquierda / 'r' derecha · bx,by = punto en el cuerpo · cy = centro vertical de la tarjeta
  // ↳ Si algo queda corrido, ajusta SOLO estos números.
  const POS = {
    cabeza:  { side: 'l', bx: 50, by: 8,  cy: 9.4 },
    cuello:  { side: 'r', bx: 53, by: 16, cy: 9.4 },
    pecho:   { side: 'l', bx: 47, by: 27, cy: 34 },
    brazos:  { side: 'r', bx: 60, by: 34, cy: 34 },
    abdomen: { side: 'l', bx: 47, by: 42, cy: 59 },
    caderas: { side: 'r', bx: 53, by: 48, cy: 59 },
    piernas: { side: 'l', bx: 46, by: 66, cy: 84 },
    pies:    { side: 'r', bx: 52, by: 92, cy: 84 }
  };

  // ── Motor TTK ──────────────────────────────────────────────
  // EHP objetivo = 100 base + 50 por placa (máx 250 en BR/Resurgence).
  const EHP_PRESETS = [
    { ehp: 100, label: 'Sin placas' },
    { ehp: 150, label: '1 placa' },
    { ehp: 200, label: '2 placas' },
    { ehp: 250, label: '3 placas' }
  ];
  const EHP_DEFAULT = 250;

  function stk(ehp, dmg) {              // balas para matar
    if (!dmg || dmg <= 0) return null;
    return Math.ceil(ehp / dmg);
  }
  function ttkMs(shots, rpm) {          // tiempo del 1er al último impacto
    if (!shots || shots < 1 || !rpm || rpm <= 0) return null;
    return Math.round((shots - 1) * (60000 / rpm));
  }
  function ttkData(dmg, rpm, ehp) {
    const s = stk(ehp, dmg);
    return { stk: s, ms: ttkMs(s, rpm) };
  }
  // API pública para una futura página de ranking que itere todas las armas
  window.WZTTK = { stk, ttkMs, ttkData, EHP_PRESETS, EHP_DEFAULT };

  function buildTTK(dano, pf) {
    const rpm = (pf && typeof pf.cadencia_rpm === 'number') ? pf.cadencia_rpm : null;
    const body = zoneVal(dano.pecho);
    const head = zoneVal(dano.cabeza);
    if (!rpm || (typeof body !== 'number' && typeof head !== 'number')) return '';

    const between = Math.round(60000 / rpm);
    const dps = (typeof body === 'number') ? Math.round(body * rpm / 60) : null;
    const b = ttkData(body, rpm, EHP_DEFAULT);
    const hh = ttkData(head, rpm, EHP_DEFAULT);
    const fmt = v => (v == null ? '—' : v);

    const buttons = EHP_PRESETS.map(p =>
      `<button type="button" class="wo-plate${p.ehp === EHP_DEFAULT ? ' is-active' : ''}" data-ehp="${p.ehp}">${esc(p.label)}<small>${p.ehp}</small></button>`
    ).join('');

    return `<section class="wo-ttk" data-body="${typeof body === 'number' ? body : ''}" data-head="${typeof head === 'number' ? head : ''}" data-rpm="${rpm}">
        <div class="wo-ttk-top">
          <h3 class="wo-fall-title" style="margin:0">⏱ Tiempo en matar · TTK</h3>
          <div class="wo-plates" role="group" aria-label="Placas del objetivo">${buttons}</div>
        </div>
        <div class="wo-ttk-grid">
          <article class="wo-ttk-card wo-ttk-body">
            <div class="wo-ttk-k">Al pecho</div>
            <div class="wo-ttk-v" data-ttk-body>${fmt(b.ms)}<span>ms</span></div>
            <div class="wo-ttk-s"><b data-stk-body>${fmt(b.stk)}</b> balas · STK</div>
          </article>
          <article class="wo-ttk-card wo-ttk-head">
            <div class="wo-ttk-k">A la cabeza</div>
            <div class="wo-ttk-v" data-ttk-head>${fmt(hh.ms)}<span>ms</span></div>
            <div class="wo-ttk-s"><b data-stk-head>${fmt(hh.stk)}</b> balas · STK</div>
          </article>
          <article class="wo-ttk-card">
            <div class="wo-ttk-k">DPS · cadencia</div>
            <div class="wo-ttk-v">${fmt(dps)}</div>
            <div class="wo-ttk-s">${rpm} rpm · ${between} ms/disparo</div>
          </article>
        </div>
        <p class="wo-ttk-note">TTK teórico a quemarropa contra <b data-ehp-label>${EHP_DEFAULT}</b> EHP (100 base + 50 por placa, máx 250 en BR/Resurgence). No incluye retroceso, accesorios ni caída de daño por distancia — el tiempo real varía.</p>
      </section>`;
  }

  function wireTTK(root) {
    const box = root.querySelector('.wo-ttk');
    if (!box) return;
    const body = parseFloat(box.dataset.body);
    const head = parseFloat(box.dataset.head);
    const rpm = parseFloat(box.dataset.rpm);
    const elB = box.querySelector('[data-ttk-body]');
    const elH = box.querySelector('[data-ttk-head]');
    const elSB = box.querySelector('[data-stk-body]');
    const elSH = box.querySelector('[data-stk-head]');
    const elL = box.querySelector('[data-ehp-label]');
    const set = (el, ms) => { if (el) el.innerHTML = (ms == null ? '—' : ms) + '<span>ms</span>'; };
    box.querySelectorAll('.wo-plate').forEach(btn => {
      btn.addEventListener('click', () => {
        box.querySelectorAll('.wo-plate').forEach(x => x.classList.remove('is-active'));
        btn.classList.add('is-active');
        const ehp = parseFloat(btn.dataset.ehp);
        const b = ttkData(body, rpm, ehp);
        const h = ttkData(head, rpm, ehp);
        set(elB, b.ms); set(elH, h.ms);
        if (elSB) elSB.textContent = (b.stk == null ? '—' : b.stk);
        if (elSH) elSH.textContent = (h.stk == null ? '—' : h.stk);
        if (elL) elL.textContent = ehp;
      });
    });
  }

  function buildFigure(dano, min, max) {
    const h = {
      cabeza: heatStyleFor('cabeza', dano, min, max),
      cuello: heatStyleFor('cuello_pecho_alto', dano, min, max),
      pecho: heatStyleFor('pecho', dano, min, max),
      brazos: heatStyleFor('brazos', dano, min, max),
      abdomen: heatStyleFor('abdomen', dano, min, max),
      caderas: heatStyleFor('caderas', dano, min, max),
      piernas: heatStyleFor('piernas', dano, min, max),
      pies: heatStyleFor('pies', dano, min, max)
    };
    const styleVars = [
      `--wo-body-url:${cssUrl(WO_BODY_IMAGE_SRC)}`,
      `--wo-cabeza:${h.cabeza.color}`, `--wo-a-cabeza:${h.cabeza.alpha}`,
      `--wo-cuello:${h.cuello.color}`, `--wo-a-cuello:${h.cuello.alpha}`,
      `--wo-pecho:${h.pecho.color}`, `--wo-a-pecho:${h.pecho.alpha}`,
      `--wo-brazos:${h.brazos.color}`, `--wo-a-brazos:${h.brazos.alpha}`,
      `--wo-abdomen:${h.abdomen.color}`, `--wo-a-abdomen:${h.abdomen.alpha}`,
      `--wo-caderas:${h.caderas.color}`, `--wo-a-caderas:${h.caderas.alpha}`,
      `--wo-piernas:${h.piernas.color}`, `--wo-a-piernas:${h.piernas.alpha}`,
      `--wo-pies:${h.pies.color}`, `--wo-a-pies:${h.pies.alpha}`
    ].join(';');

    const heatMap = {
      cabeza: 'cabeza', cuello_pecho_alto: 'cuello', pecho: 'pecho', brazos: 'brazos',
      abdomen: 'abdomen', caderas: 'caderas', piernas: 'piernas', pies: 'pies'
    };

    // líneas + puntos
    let lines = '', dots = '', cards = '';
    ZONE_DEFS.forEach(([key, label]) => {
      const hk = heatMap[key];
      const p = POS[hk];
      const raw = dano[key];
      const v = zoneVal(raw);
      const mult = (raw && typeof raw === 'object') ? raw.multiplicador : '';
      const color = (typeof v === 'number') ? zoneColor(v, min, max) : 'rgb(255,138,0)';
      const x1 = p.side === 'l' ? 30 : 70;
      lines += `<line x1="${x1}" y1="${p.cy}" x2="${p.bx}" y2="${p.by}"/>`;
      dots += `<span class="wo-dot wo-dot-${hk}" style="--zone:${color};left:${p.bx}%;top:${p.by}%"></span>`;
      cards += `<article class="wo-cc wo-cc-${hk}" style="--zone:${color}">
        <div class="wo-cc-ic">${ICONS[hk] || ''}</div>
        <div class="wo-cc-tx"><span class="wo-cc-nm">${esc(label)}</span><span class="wo-cc-sub">Daño</span></div>
        <div class="wo-cc-dmg">${v == null ? '—' : esc(v)}${mult ? `<small>(${esc(mult)})</small>` : ''}</div>
      </article>`;
    });

    return `
      <div class="wo-figure" style="${attr(styleVars)}">
        <div class="wo-fig-img-wrap">
          <img class="wo-body-base" src="${attr(WO_BODY_IMAGE_SRC)}" alt="Cuerpo X-Ray con esqueleto" loading="lazy" decoding="async" />
          <div class="wo-body-heat-mask" aria-hidden="true">
            <span class="wo-heat wo-heat-cabeza"></span>
            <span class="wo-heat wo-heat-cuello"></span>
            <span class="wo-heat wo-heat-pecho"></span>
            <span class="wo-heat wo-heat-brazos wo-heat-brazos-l"></span>
            <span class="wo-heat wo-heat-brazos wo-heat-brazos-r"></span>
            <span class="wo-heat wo-heat-abdomen"></span>
            <span class="wo-heat wo-heat-caderas"></span>
            <span class="wo-heat wo-heat-piernas wo-heat-piernas-l"></span>
            <span class="wo-heat wo-heat-piernas wo-heat-piernas-r"></span>
            <span class="wo-heat wo-heat-pies wo-heat-pies-l"></span>
            <span class="wo-heat wo-heat-pies wo-heat-pies-r"></span>
          </div>
        </div>
        <svg class="wo-fig-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
        <div class="wo-dots" aria-hidden="true">${dots}</div>
        <div class="wo-callouts">${cards}</div>
      </div>`;
  }

  function specGroup(title, defs, obj) {
    const rows = defs.map(([k, label, unit]) => {
      const v = obj ? obj[k] : null;
      return `<div class="wo-spec"><span class="wo-spec-label">${esc(label)}</span><span class="wo-spec-val">${v == null ? '—' : esc(v)}<span class="wo-spec-unit">${v == null ? '' : ' ' + esc(unit)}</span></span></div>`;
    }).join('');
    return `<div class="wo-spec-group"><h4 class="wo-spec-title">${esc(title)}</h4><div class="wo-spec-grid">${rows}</div></div>`;
  }

  function build(arma) {
    const dano = arma.dano_por_parte || {};
    const vals = ZONE_DEFS.map(([k]) => zoneVal(dano[k])).filter(v => typeof v === 'number');
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 1;

    const pf = arma.potencia_de_fuego || {};
    const cg = arma.cargador || {};
    const mag = (cg.capacidad != null) ? `${cg.capacidad}${cg.cantidad != null ? ' × ' + cg.cantidad : ''}` : '—';

    const tramos = Array.isArray(arma.alcance_dano) ? arma.alcance_dano : [];
    const falloff = tramos.map(t =>
      `<div class="wo-fall-cell"><div class="wo-fall-k">Distancia</div><div class="wo-fall-d">${esc(t.distancia_m)} m</div><div class="wo-fall-k">Daño</div><div class="wo-fall-n">${esc(t.dano)}</div></div>`
    ).join('');

    const sec = document.createElement('section');
    sec.className = 'wo-damage-widget';
    sec.id = 'wo-official';
    sec.setAttribute('aria-label', 'Estadísticas oficiales del arma');
    sec.innerHTML = `
      <header class="wo-topbar">
        <div class="wo-brand">
          <div class="wo-brand-icon"><svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="13" stroke="currentColor" stroke-width="2"/><path d="M24 4v12M24 32v12M4 24h12M32 24h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg></div>
          <div>
            <h2 class="wo-weapon-title">${esc((arma.nombre || '').toUpperCase())}</h2>
            <p class="wo-weapon-type">${esc((arma.tipo || '').toUpperCase())}</p>
          </div>
        </div>
        <div class="wo-source-chip">ARMERÍA IN-GAME<span class="wo-dot-chip"></span></div>
      </header>
      <main class="wo-content">
        <div class="wo-title-row">
          <h3 class="wo-section-title">Distribución de daño</h3>
          ${arma.modo_disparo ? `<div class="wo-mode-tag">${esc(arma.modo_disparo)}</div>` : ''}
        </div>
        <div class="wo-legend"><span>Daño bajo</span><span class="wo-bar"></span><span>Alto</span></div>
        <section class="wo-hero-panel">
          ${buildFigure(dano, min, max)}
        </section>
        <section class="wo-stats-row">
          <article class="wo-stat-card"><div class="wo-stat-icon">${statIcon('rate')}</div><div><div class="wo-stat-k">Cadencia</div><div class="wo-stat-v">${esc(pf.cadencia_rpm != null ? pf.cadencia_rpm : '—')}</div><div class="wo-stat-u">rpm</div></div></article>
          <article class="wo-stat-card"><div class="wo-stat-icon">${statIcon('bullet')}</div><div><div class="wo-stat-k">Vel. bala</div><div class="wo-stat-v">${esc(pf.velocidad_balas_ms != null ? pf.velocidad_balas_ms : '—')}</div><div class="wo-stat-u">m/s</div></div></article>
          <article class="wo-stat-card"><div class="wo-stat-icon">${statIcon('mag')}</div><div><div class="wo-stat-k">Cargador</div><div class="wo-stat-v">${esc(mag)}</div><div class="wo-stat-u">balas × cargs</div></div></article>
        </section>
        ${buildTTK(dano, pf)}
        ${falloff ? `<section class="wo-falloff"><h3 class="wo-fall-title">⌖ Caída de daño</h3><div class="wo-fall-grid">${falloff}</div></section>` : ''}
        <section class="wo-specs">
          ${specGroup('Precisión', PRECISION, arma.precision)}
          ${specGroup('Movilidad', MOVILIDAD, arma.movilidad)}
          ${specGroup('Manejo', MANEJO, arma.manejo)}
        </section>
        <div class="wo-note"><span class="wo-info">i</span><span>Stats base de la Armería in-game de Black Ops 7 (PS5), sin accesorios · Temporada 4. El daño efectivo varía según distancia, accesorios y blindaje del objetivo.</span></div>
      </main>`;
    return sec;
  }

  function injectStyles() {
    if (document.getElementById('wo-official-styles')) return;
    if (!document.getElementById('wo-fonts')) {
      const l = document.createElement('link');
      l.id = 'wo-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap';
      document.head.appendChild(l);
    }
    const css = `
    .wo-damage-widget{--panel:#0b1117;--line:rgba(255,255,255,.12);--line2:rgba(255,207,36,.28);--txt:#f3f5f7;--muted:rgba(235,240,245,.58);--dim:rgba(235,240,245,.32);--yellow:#ffd21f;--orange:#ff8a00;--red:#ff2d2d;
      max-width:1040px;margin:48px auto;border:1px solid rgba(255,255,255,.14);border-radius:20px;overflow:hidden;position:relative;color:var(--txt);
      font-family:'Rajdhani',system-ui,-apple-system,'Segoe UI',sans-serif;
      background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.015) 24%,rgba(255,255,255,.025)),var(--panel);
      background-size:28px 28px,28px 28px,auto,auto;box-shadow:0 28px 90px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.035)}
    .wo-damage-widget *{box-sizing:border-box}
    .wo-damage-widget:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 5px);mix-blend-mode:screen;opacity:.55}
    .wo-topbar{position:relative;z-index:1;padding:24px 28px 18px;border-bottom:1px solid var(--line);display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start}
    .wo-brand{display:flex;gap:14px;align-items:flex-start;min-width:0}
    .wo-brand-icon{width:42px;height:42px;border:1px solid var(--line2);border-radius:10px;display:grid;place-items:center;color:var(--yellow);flex:0 0 auto;background:rgba(0,0,0,.2);box-shadow:inset 0 0 22px rgba(255,210,31,.06)}
    .wo-brand-icon svg{width:25px;height:25px}
    .wo-weapon-title{margin:0;font-size:clamp(1.8rem,6vw,3.6rem);line-height:.82;letter-spacing:.055em;font-weight:700;text-shadow:0 2px 0 rgba(0,0,0,.7),0 0 18px rgba(255,255,255,.1)}
    .wo-weapon-type{margin:8px 0 0;font-family:'Share Tech Mono',monospace;color:var(--yellow);letter-spacing:.08em;font-size:clamp(.82rem,2.6vw,1.05rem);text-transform:uppercase}
    .wo-source-chip{font-family:'Share Tech Mono',monospace;color:var(--yellow);border:1px solid rgba(255,210,31,.7);border-radius:999px;padding:9px 14px;letter-spacing:.08em;font-weight:700;font-size:.72rem;background:rgba(255,210,31,.055);box-shadow:inset 0 0 22px rgba(255,210,31,.05),0 0 22px rgba(255,210,31,.08);white-space:nowrap}
    .wo-source-chip .wo-dot-chip{display:inline-block;width:8px;height:8px;background:#23d8ff;border-radius:50%;margin-left:9px;box-shadow:0 0 12px #23d8ff;vertical-align:middle}
    .wo-content{position:relative;z-index:1;padding:22px 24px 24px}
    .wo-title-row{display:flex;align-items:center;gap:14px;justify-content:space-between;margin-bottom:14px}
    .wo-section-title{margin:0;font-size:clamp(1.4rem,5vw,2.6rem);line-height:.96;letter-spacing:.055em;text-transform:uppercase;font-weight:700}
    .wo-mode-tag{font-family:'Share Tech Mono',monospace;font-size:clamp(.62rem,2.1vw,.88rem);color:var(--yellow);border:1px solid rgba(255,210,31,.35);padding:7px 11px;border-radius:9px;background:rgba(255,210,31,.045);white-space:nowrap;text-align:right}
    .wo-legend{display:flex;align-items:center;gap:10px;margin:2px 0 18px;color:var(--muted);font-family:'Share Tech Mono',monospace;text-transform:uppercase;font-size:.7rem;letter-spacing:.08em}
    .wo-legend .wo-bar{height:7px;min-width:110px;max-width:210px;flex:1;border-radius:99px;background:linear-gradient(90deg,var(--yellow),var(--orange),var(--red));box-shadow:0 0 16px rgba(255,120,0,.35)}
    .wo-hero-panel{border:1px solid rgba(255,255,255,.1);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(0,0,0,.08));padding:20px 18px;position:relative;overflow:hidden}

    /* ── FIGURA / CALLOUT ── */
    .wo-figure{position:relative;width:100%;max-width:860px;margin:0 auto;aspect-ratio:1.55/1}
    .wo-fig-img-wrap{position:absolute;top:0;left:50%;transform:translateX(-50%);height:100%;aspect-ratio:664/1672;isolation:isolate;filter:drop-shadow(0 0 16px rgba(255,126,0,.25))}
    .wo-body-base{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:2;filter:saturate(1.05) contrast(1.04) brightness(1.03)}
    .wo-body-heat-mask{position:absolute;inset:0;z-index:3;-webkit-mask-image:var(--wo-body-url);mask-image:var(--wo-body-url);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;mix-blend-mode:screen;pointer-events:none;filter:saturate(1.35) contrast(1.08)}
    .wo-heat{position:absolute;display:block;background:var(--zone-color);opacity:var(--zone-alpha,.55);filter:blur(12px);transform:translateZ(0);mix-blend-mode:screen}
    .wo-heat:after{content:"";position:absolute;inset:-14%;border-radius:inherit;background:inherit;opacity:.5;filter:blur(16px)}
    .wo-heat-cabeza{--zone-color:var(--wo-cabeza);--zone-alpha:var(--wo-a-cabeza);left:30%;top:1%;width:40%;height:13%;border-radius:50% 50% 45% 45%}
    .wo-heat-cuello{--zone-color:var(--wo-cuello);--zone-alpha:var(--wo-a-cuello);left:38%;top:12%;width:24%;height:7%;border-radius:38%}
    .wo-heat-pecho{--zone-color:var(--wo-pecho);--zone-alpha:var(--wo-a-pecho);left:18%;top:16%;width:64%;height:18%;border-radius:30% 30% 22% 22%;clip-path:polygon(10% 12%,90% 12%,80% 100%,20% 100%)}
    .wo-heat-brazos{--zone-color:var(--wo-brazos);--zone-alpha:var(--wo-a-brazos);top:18%;width:19%;height:34%;border-radius:42% 42% 34% 34%}
    .wo-heat-brazos-l{left:9%;transform:rotate(6deg)}
    .wo-heat-brazos-r{right:9%;transform:rotate(-6deg)}
    .wo-heat-abdomen{--zone-color:var(--wo-abdomen);--zone-alpha:var(--wo-a-abdomen);left:30%;top:33%;width:40%;height:10%;border-radius:24%;clip-path:polygon(12% 0,88% 0,74% 100%,26% 100%)}
    .wo-heat-caderas{--zone-color:var(--wo-caderas);--zone-alpha:var(--wo-a-caderas);left:26%;top:42%;width:48%;height:13%;border-radius:45% 45% 35% 35%}
    .wo-heat-piernas{--zone-color:var(--wo-piernas);--zone-alpha:var(--wo-a-piernas);top:54%;width:21%;height:36%;border-radius:35% 35% 28% 28%;clip-path:polygon(20% 0,80% 0,68% 100%,32% 100%)}
    .wo-heat-piernas-l{left:29%;transform:rotate(1deg)}
    .wo-heat-piernas-r{right:29%;transform:rotate(-1deg)}
    .wo-heat-pies{--zone-color:var(--wo-pies);--zone-alpha:var(--wo-a-pies);top:90%;width:18%;height:8%;border-radius:45%;filter:blur(8px)}
    .wo-heat-pies-l{left:31%;transform:rotate(-6deg)}
    .wo-heat-pies-r{right:31%;transform:rotate(6deg)}

    .wo-fig-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:4}
    .wo-fig-lines line{stroke:rgba(255,255,255,.42);stroke-width:1;vector-effect:non-scaling-stroke}
    .wo-dots{position:absolute;inset:0;pointer-events:none;z-index:5}
    .wo-dot{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--zone);box-shadow:0 0 9px 1px var(--zone),0 0 0 2px rgba(8,8,12,.7)}
    .wo-callouts{position:absolute;inset:0;z-index:6}
    .wo-cc{position:absolute;width:31%;display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;padding:8px 10px;border:1px solid rgba(255,255,255,.11);border-left:3px solid var(--zone);border-radius:11px;background:linear-gradient(90deg,color-mix(in srgb,var(--zone),transparent 88%),rgba(10,12,16,.55));-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);box-shadow:0 6px 20px rgba(0,0,0,.35)}
    .wo-cc-cabeza{left:0;top:3%}.wo-cc-pecho{left:0;top:28%}.wo-cc-abdomen{left:0;top:53%}.wo-cc-piernas{left:0;top:78%}
    .wo-cc-cuello{right:0;top:3%}.wo-cc-brazos{right:0;top:28%}.wo-cc-caderas{right:0;top:53%}.wo-cc-pies{right:0;top:78%}
    .wo-cc-ic{width:34px;height:34px;border:1px solid color-mix(in srgb,var(--zone),transparent 35%);border-radius:9px;display:grid;place-items:center;color:var(--zone);background:rgba(0,0,0,.28)}
    .wo-cc-ic svg{width:21px;height:21px}
    .wo-cc-nm{font-size:.92rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;line-height:1;display:block}
    .wo-cc-sub{font-family:'Share Tech Mono',monospace;color:var(--dim);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;margin-top:4px;display:block}
    .wo-cc-dmg{font-family:'Share Tech Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--zone);line-height:1;text-align:right;text-shadow:0 0 14px color-mix(in srgb,var(--zone),transparent 70%)}
    .wo-cc-dmg small{display:block;color:var(--muted);font-size:.58rem;margin-top:4px;font-weight:400}

    .wo-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}
    .wo-stat-card{border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;background:linear-gradient(180deg,rgba(255,255,255,.052),rgba(0,0,0,.11));min-height:92px;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden}
    .wo-stat-card:before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;background:var(--yellow);box-shadow:0 0 18px var(--yellow)}
    .wo-stat-icon{width:34px;height:34px;color:var(--yellow);flex:0 0 auto;opacity:.95}
    .wo-stat-k{font-family:'Share Tech Mono',monospace;color:var(--muted);font-size:.76rem;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
    .wo-stat-v{font-family:'Share Tech Mono',monospace;font-size:1.85rem;line-height:.95;color:#fff;letter-spacing:.03em;margin-top:4px}
    .wo-stat-u{font-family:'Share Tech Mono',monospace;color:rgba(255,255,255,.62);font-size:.82rem;margin-top:3px}
    .wo-falloff{margin-top:16px;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.08))}
    .wo-fall-title{display:flex;align-items:center;gap:10px;margin:0 0 14px;color:var(--yellow);font-size:1.3rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
    .wo-fall-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px}
    .wo-fall-cell{border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:15px;text-align:center;background:rgba(0,0,0,.12)}
    .wo-fall-k{font-family:'Share Tech Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-size:.72rem}
    .wo-fall-d{font-family:'Share Tech Mono',monospace;font-size:1.45rem;color:#fff;margin:8px 0 4px}
    .wo-fall-n{font-family:'Share Tech Mono',monospace;font-size:2.05rem;font-weight:700;color:var(--yellow);text-shadow:0 0 16px rgba(255,210,31,.22)}
    .wo-fall-cell:first-child .wo-fall-n{color:#ff4b22}
    .wo-ttk{margin-top:16px;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.08))}
    .wo-ttk-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
    .wo-plates{display:flex;gap:6px;flex-wrap:wrap}
    .wo-plate{font-family:'Share Tech Mono',monospace;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:6px 11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.1;transition:background .15s,color .15s,border-color .15s}
    .wo-plate small{font-size:.64rem;color:var(--dim)}
    .wo-plate:hover{border-color:rgba(255,210,31,.5);color:#fff}
    .wo-plate.is-active{color:#0a0a0c;background:var(--yellow);border-color:var(--yellow);font-weight:700}
    .wo-plate.is-active small{color:rgba(0,0,0,.55)}
    .wo-ttk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .wo-ttk-card{border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:14px;background:rgba(0,0,0,.14);text-align:center;position:relative;overflow:hidden}
    .wo-ttk-card.wo-ttk-body:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:var(--orange);box-shadow:0 0 14px var(--orange)}
    .wo-ttk-card.wo-ttk-head:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:var(--red);box-shadow:0 0 14px var(--red)}
    .wo-ttk-k{font-family:'Share Tech Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-size:.72rem}
    .wo-ttk-v{font-family:'Share Tech Mono',monospace;font-size:2rem;font-weight:700;color:#fff;line-height:1;margin:9px 0 6px}
    .wo-ttk-v span{font-size:.8rem;color:var(--muted);margin-left:3px;font-weight:400}
    .wo-ttk-card.wo-ttk-body .wo-ttk-v{color:var(--orange)}
    .wo-ttk-card.wo-ttk-head .wo-ttk-v{color:#ff5b3b}
    .wo-ttk-s{font-family:'Share Tech Mono',monospace;color:var(--muted);font-size:.74rem}
    .wo-ttk-s b{color:#fff}
    .wo-ttk-note{margin:14px 0 0;color:var(--muted);font-size:.82rem;line-height:1.4}
    .wo-ttk-note b{color:var(--yellow)}
    .wo-specs{margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
    .wo-spec-group{border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:16px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(0,0,0,.08))}
    .wo-spec-title{margin:0 0 12px;font-family:'Share Tech Mono',monospace;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--yellow)}
    .wo-spec{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:7px 0;border-bottom:1px dashed rgba(255,255,255,.07)}
    .wo-spec:last-child{border-bottom:none}
    .wo-spec-label{font-size:.84rem;color:var(--muted)}
    .wo-spec-val{font-family:'Share Tech Mono',monospace;font-size:.9rem;color:#fff;font-weight:600;white-space:nowrap}
    .wo-spec-unit{color:var(--dim);font-size:.78em;font-weight:400}
    .wo-note{margin-top:14px;display:flex;gap:10px;align-items:flex-start;color:var(--muted);font-size:.92rem;line-height:1.35;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;background:rgba(0,0,0,.12)}
    .wo-info{width:24px;height:24px;border:1px solid rgba(255,255,255,.4);border-radius:50%;display:grid;place-items:center;font-family:'Share Tech Mono',monospace;flex:0 0 auto;color:#fff}

    /* ── TABLET ── */
    @media(max-width:1000px){
      .wo-figure{max-width:680px;aspect-ratio:1.4/1}
      .wo-cc{width:33%}.wo-cc-nm{font-size:.82rem}.wo-cc-dmg{font-size:1.2rem}.wo-cc-ic{width:30px;height:30px}.wo-cc-ic svg{width:18px;height:18px}
    }
    /* ── MÓVIL: cuerpo arriba, zonas en grid 2 col ── */
    @media(max-width:720px){
      .wo-damage-widget{border-radius:16px;margin:32px auto;max-width:480px}
      .wo-topbar{padding:20px 18px 14px;grid-template-columns:1fr;gap:14px}
      .wo-source-chip{justify-self:start}
      .wo-content{padding:18px 14px}
      .wo-title-row{flex-direction:column;align-items:flex-start;gap:10px}
      .wo-mode-tag{text-align:left}
      .wo-hero-panel{padding:14px 12px;border-radius:15px}
      .wo-figure{aspect-ratio:auto;max-width:none}
      .wo-fig-img-wrap{position:relative;left:auto;top:auto;height:auto;width:56%;max-width:230px;margin:0 auto 8px;transform:none}
      .wo-fig-lines,.wo-dots{display:none}
      .wo-callouts{position:static;margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .wo-cc{position:static;width:auto;border-radius:10px;padding:9px 10px;grid-template-columns:auto 1fr auto;gap:8px;background:linear-gradient(90deg,color-mix(in srgb,var(--zone),transparent 84%),#0d141c);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none}
      .wo-cc-ic{width:30px;height:30px}.wo-cc-ic svg{width:18px;height:18px}
      .wo-cc-nm{font-size:.78rem}.wo-cc-sub{display:none}.wo-cc-dmg{font-size:1.1rem}
      .wo-stats-row{grid-template-columns:1fr;gap:9px}
      .wo-stat-card{min-height:70px;padding:11px 13px}.wo-stat-v{font-size:1.5rem}
      .wo-ttk-grid{grid-template-columns:1fr 1fr;gap:9px}
      .wo-ttk-card:last-child{grid-column:1/-1}
      .wo-ttk-v{font-size:1.7rem}
      .wo-ttk-top{flex-direction:column;align-items:flex-start;gap:10px}
      .wo-specs{grid-template-columns:1fr}
      .wo-fall-grid{grid-template-columns:1fr 1fr;gap:9px}
      .wo-fall-cell{padding:12px 8px}.wo-fall-d{font-size:1.05rem}.wo-fall-n{font-size:1.6rem}
    }
    @media(max-width:400px){.wo-weapon-title{font-size:1.7rem}.wo-section-title{font-size:1.35rem}.wo-callouts{grid-template-columns:1fr}}`;
    const tag = document.createElement('style');
    tag.id = 'wo-official-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  async function init() {
    if (document.getElementById('wo-official')) return;
    const slug = window.WEAPON_SLUG;
    if (!slug) return;
    let data;
    try {
      const res = await fetch('/weapons-official.json?v=' + Date.now());
      if (!res.ok) return;
      data = await res.json();
    } catch (e) { return; }
    const arma = data && data.armas ? data.armas[slug] : null;
    if (!arma) return;

    injectStyles();
    const section = build(arma);
    wireTTK(section);
    const anchor = document.querySelector('.loadouts-section')
      || document.querySelector('.weapon-hero')
      || document.getElementById('weapon-main');
    if (!anchor) return;
    if (anchor.id === 'weapon-main') anchor.appendChild(section);
    else anchor.insertAdjacentElement('afterend', section);
  }

  window.__officialStatsInit = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
