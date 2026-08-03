/* ══════════════════════════════════════════════════════════
   meta-verdict-render.js  ·  v1  ·  "Veredicto Meta"
   Conecta el historial de parches (weapon-patches.json) con el
   motor TTK para explicar POR QUÉ un arma está donde está.
   - Estado (buffeada/nerfeada/ajustada/nueva) derivado de los `tipo`
   - Momento (en alza/estable/en baja) por neto buff-nerf de últimas temporadas
   - Veredicto redactado SOLO desde datos verificados
   - TTK antes→después: solo si el parche trae `impacto_ttk` (números
     exactos) y el arma existe en weapons-official.json. Si no, se omite.
   - Se monta en <div id="wz-meta-verdict"></div> o, si no existe,
     justo encima del historial de parches. No toca patches-render.js.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const MOUNT_ID = window.WZ_VERDICT_MOUNT || 'wz-meta-verdict';
  const PATCHES_URL = '/weapon-patches.json';
  const OFFICIAL_URL = '/weapons-official.json';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function getSlug() {
    const m = window.location.pathname.match(/\/armas\/([a-z0-9\-]+)(?:\.html)?\/?$/i);
    if (m) return m[1].toLowerCase();
    if (window.WEAPON_SLUG) return String(window.WEAPON_SLUG).toLowerCase();
    return null;
  }

  function fechaFmt(iso) {
    if (!iso) return '';
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const p = iso.split('-'); if (p.length !== 3) return iso;
    return `${parseInt(p[2], 10)} ${meses[parseInt(p[1], 10) - 1] || ''} ${p[0]}`;
  }

  // ── TTK ──
  function stk(ehp, dmg) { return (!dmg || dmg <= 0) ? null : Math.ceil(ehp / dmg); }
  function ttkMs(shots, rpm) { return (!shots || shots < 1 || !rpm || rpm <= 0) ? null : Math.round((shots - 1) * (60000 / rpm)); }
  function ttk(dmg, rpm, ehp) { return ttkMs(stk(ehp, dmg), rpm); }
  const EHP = 250;

  function countTipos(cambios) {
    const c = { buff: 0, nerf: 0, fix: 0, nuevo: 0 };
    (cambios || []).forEach(x => { if (c[x.tipo] != null) c[x.tipo]++; });
    return c;
  }

  function statusFor(latest) {
    const c = countTipos(latest.cambios);
    if (c.nuevo > 0) return { key: 'nuevo', label: 'NUEVA', arrow: '✦' };
    if (c.buff > c.nerf) return { key: 'buff', label: 'BUFFEADA', arrow: '▲' };
    if (c.nerf > c.buff) return { key: 'nerf', label: 'NERFEADA', arrow: '▼' };
    return { key: 'fix', label: 'AJUSTADA', arrow: '＝' };
  }

  function momentum(patches) {
    const last = patches.slice(0, 3);
    let net = 0;
    last.forEach(p => { const c = countTipos(p.cambios); net += c.buff - c.nerf; });
    if (net >= 2) return { txt: 'En alza', cls: 'buff', arrow: '↑' };
    if (net <= -2) return { txt: 'En baja', cls: 'nerf', arrow: '↓' };
    return { txt: 'Estable', cls: 'fix', arrow: '→' };
  }

  function ttkBlock(latest, official) {
    const imp = latest.impacto_ttk;
    if (!imp || !official) return '';
    let before, after, label;
    if (imp.metric === 'cadencia_rpm') {
      const dmg = (official.dano_por_parte && (official.dano_por_parte.pecho && official.dano_por_parte.pecho.valor != null ? official.dano_por_parte.pecho.valor : official.dano_por_parte.pecho));
      if (typeof dmg !== 'number') return '';
      before = ttk(dmg, imp.antes, EHP); after = ttk(dmg, imp.despues, EHP);
      label = `Cadencia ${imp.antes} → ${imp.despues} rpm`;
    } else if (imp.metric === 'dano_pecho') {
      const rpm = official.potencia_de_fuego && official.potencia_de_fuego.cadencia_rpm;
      if (typeof rpm !== 'number') return '';
      before = ttk(imp.antes, rpm, EHP); after = ttk(imp.despues, rpm, EHP);
      label = `Daño al pecho ${imp.antes} → ${imp.despues}`;
    } else { return ''; }
    if (before == null || after == null) return '';
    const delta = after - before;
    const mejor = delta < 0; // menos TTK = mejor
    const signo = delta > 0 ? '+' : '';
    return `<div class="mv-ttk">
      <div class="mv-ttk-row">
        <span class="mv-ttk-k">Impacto en TTK · ${esc(label)}</span>
        <span class="mv-ttk-delta mv-${mejor ? 'buff' : (delta > 0 ? 'nerf' : 'fix')}">${signo}${delta} ms</span>
      </div>
      <div class="mv-ttk-vals"><b>${before} ms</b> <span>→</span> <b>${after} ms</b> <small>· objetivo ${EHP} EHP (3 placas)</small></div>
    </div>`;
  }

  function render(root, slug, patchData, official) {
    const entry = patchData && patchData[slug];
    if (!entry || !Array.isArray(entry.patches) || !entry.patches.length) { root.innerHTML = ''; return; }

    const patches = [...entry.patches].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
    const latest = patches[0];
    const st = statusFor(latest);
    const mo = momentum(patches);
    const c = countTipos(latest.cambios);

    // Veredicto redactado desde datos
    const partes = [];
    if (c.buff) partes.push(`${c.buff} buff${c.buff !== 1 ? 's' : ''}`);
    if (c.nerf) partes.push(`${c.nerf} nerf${c.nerf !== 1 ? 's' : ''}`);
    if (c.nuevo) partes.push('ingreso al juego');
    if (!partes.length && c.fix) partes.push('ajustes/correcciones');
    const conteo = partes.length ? partes.join(' y ') : 'sin cambios de balance';
    const verdicto = `En ${esc(latest.season)} (${fechaFmt(latest.fecha)}) registró ${conteo}. ${mo.txt} en las últimas temporadas según los parches oficiales.`;

    // Cambios clave de la última temporada
    const claves = (latest.cambios || []).filter(x => x.tipo === 'buff' || x.tipo === 'nerf').slice(0, 4);
    const chips = claves.map(x =>
      `<li class="mv-chip mv-chip--${x.tipo}"><span class="mv-badge mv-${x.tipo === 'buff' ? 'buff' : 'nerf'}">${x.tipo === 'buff' ? 'BUFF' : 'NERF'}</span><span>${esc(x.descripcion)}</span></li>`
    ).join('');

    root.innerHTML = `<section class="mv-widget mv-${st.key}">
      <header class="mv-head">
        <div>
          <h2 class="mv-title">Veredicto Meta</h2>
          <p class="mv-sub">Por qué está donde está — derivado de parches oficiales</p>
        </div>
        <div class="mv-status mv-${st.key}">${st.arrow} ${st.label}</div>
      </header>
      <div class="mv-row">
        <div class="mv-momentum mv-${mo.cls}"><span class="mv-mo-arrow">${mo.arrow}</span><div><span class="mv-mo-k">Momento</span><span class="mv-mo-v">${mo.txt}</span></div></div>
        <p class="mv-verdict">${verdicto}</p>
      </div>
      ${ttkBlock(latest, official)}
      ${chips ? `<ul class="mv-chips">${chips}</ul>` : ''}
      <p class="mv-note"><span class="mv-i">i</span><span>Estado y momento calculados de los cambios verificados de Treyarch/Raven. El TTK antes→después se muestra solo cuando el parche aporta los números exactos. El historial completo está abajo.</span></p>
    </section>`;
  }

  function injectStyles() {
    if (document.getElementById('mv-styles')) return;
    if (!document.getElementById('wo-fonts')) {
      const l = document.createElement('link');
      l.id = 'wo-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap';
      document.head.appendChild(l);
    }
    const css = `
    .mv-widget{--muted:rgba(235,240,245,.6);--dim:rgba(235,240,245,.34);--yellow:#ffd21f;--buff:#4ade80;--nerf:#f87171;--blue:#60a5fa;
      max-width:900px;margin:40px auto;color:#eef2f5;font-family:'Rajdhani',system-ui,sans-serif;
      border:1px solid rgba(255,255,255,.13);border-left:4px solid var(--yellow);border-radius:16px;padding:22px;position:relative;overflow:hidden;
      background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.12)),#0b1117}
    .mv-widget.mv-buff{border-left-color:var(--buff)} .mv-widget.mv-nerf{border-left-color:var(--nerf)}
    .mv-widget.mv-nuevo{border-left-color:var(--blue)} .mv-widget.mv-fix{border-left-color:var(--yellow)}
    .mv-widget *{box-sizing:border-box}
    .mv-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:16px}
    .mv-title{margin:0;font-size:1.7rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;line-height:.9}
    .mv-sub{margin:6px 0 0;color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.76rem;letter-spacing:.02em}
    .mv-status{font-family:'Share Tech Mono',monospace;font-weight:700;font-size:.82rem;letter-spacing:.08em;padding:8px 14px;border-radius:999px;white-space:nowrap;border:1px solid currentColor}
    .mv-status.mv-buff{color:var(--buff);background:rgba(74,222,128,.1)} .mv-status.mv-nerf{color:var(--nerf);background:rgba(248,113,113,.1)}
    .mv-status.mv-nuevo{color:var(--blue);background:rgba(96,165,250,.1)} .mv-status.mv-fix{color:var(--yellow);background:rgba(255,210,31,.1)}
    .mv-row{display:flex;gap:16px;align-items:stretch;flex-wrap:wrap}
    .mv-momentum{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 16px;background:rgba(0,0,0,.18);min-width:150px}
    .mv-mo-arrow{font-size:1.7rem;font-weight:700;line-height:1}
    .mv-momentum.mv-buff .mv-mo-arrow,.mv-momentum.mv-buff .mv-mo-v{color:var(--buff)}
    .mv-momentum.mv-nerf .mv-mo-arrow,.mv-momentum.mv-nerf .mv-mo-v{color:var(--nerf)}
    .mv-momentum.mv-fix .mv-mo-arrow,.mv-momentum.mv-fix .mv-mo-v{color:var(--yellow)}
    .mv-mo-k{display:block;font-family:'Share Tech Mono',monospace;font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dim)}
    .mv-mo-v{display:block;font-weight:700;font-size:1.05rem;letter-spacing:.03em;text-transform:uppercase}
    .mv-verdict{flex:1;min-width:220px;margin:0;align-self:center;font-size:1.05rem;line-height:1.45;color:#e6ebef}
    .mv-ttk{margin-top:16px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:13px 15px;background:rgba(0,0,0,.2)}
    .mv-ttk-row{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
    .mv-ttk-k{font-family:'Share Tech Mono',monospace;font-size:.74rem;letter-spacing:.05em;color:var(--muted);text-transform:uppercase}
    .mv-ttk-delta{font-family:'Share Tech Mono',monospace;font-weight:700;font-size:1.1rem}
    .mv-ttk-delta.mv-buff{color:var(--buff)} .mv-ttk-delta.mv-nerf{color:var(--nerf)} .mv-ttk-delta.mv-fix{color:var(--muted)}
    .mv-ttk-vals{font-family:'Share Tech Mono',monospace;font-size:1.25rem;margin-top:8px;color:#fff}
    .mv-ttk-vals span{color:var(--muted);margin:0 4px} .mv-ttk-vals small{font-size:.62rem;color:var(--dim);margin-left:6px;letter-spacing:.04em}
    .mv-chips{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
    .mv-chip{display:flex;gap:10px;align-items:flex-start;font-size:.92rem;line-height:1.4;color:#dde3e8;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:9px 11px;background:rgba(255,255,255,.02)}
    .mv-badge{font-family:'Share Tech Mono',monospace;font-size:.62rem;font-weight:800;letter-spacing:.06em;padding:3px 8px;border-radius:4px;white-space:nowrap;flex:0 0 auto;margin-top:1px}
    .mv-badge.mv-buff{background:rgba(74,222,128,.15);color:var(--buff)} .mv-badge.mv-nerf{background:rgba(248,113,113,.15);color:var(--nerf)}
    .mv-note{margin:16px 0 0;display:flex;gap:9px;align-items:flex-start;color:var(--muted);font-size:.82rem;line-height:1.4;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
    .mv-i{width:20px;height:20px;flex:0 0 auto;border:1px solid rgba(255,255,255,.4);border-radius:50%;display:grid;place-items:center;font-family:'Share Tech Mono',monospace;color:#fff;font-size:.74rem}
    @media(max-width:600px){.mv-widget{padding:18px 15px;margin:24px auto}.mv-title{font-size:1.45rem}.mv-verdict{font-size:.98rem}.mv-row{flex-direction:column}}`;
    const tag = document.createElement('style'); tag.id = 'mv-styles'; tag.textContent = css;
    document.head.appendChild(tag);
  }

  function resolveMount() {
    let el = document.getElementById(MOUNT_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = MOUNT_ID;
    const before = document.querySelector('.patches-section') || document.getElementById('patches-container') || document.getElementById('wo-official');
    if (before && before.parentNode) before.parentNode.insertBefore(el, before);
    else (document.querySelector('main') || document.body).appendChild(el);
    return el;
  }

  async function init() {
    const slug = getSlug();
    if (!slug) return;
    let patchData = null, official = null;
    try {
      const r = await fetch(PATCHES_URL, { cache: 'no-store' });
      if (!r.ok) return;
      patchData = await r.json();
    } catch (e) { return; }
    if (!patchData[slug]) return;
    try {
      const r2 = await fetch(OFFICIAL_URL + '?v=' + Date.now());
      if (r2.ok) { const d = await r2.json(); official = d && d.armas ? d.armas[slug] : null; }
    } catch (e) { /* TTK opcional: si no hay stats, se omite */ }

    injectStyles();
    render(resolveMount(), slug, patchData, official);
  }

  window.__metaVerdictInit = init;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
