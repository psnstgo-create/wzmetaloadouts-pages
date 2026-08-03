/* ══════════════════════════════════════════════════════════
   meta-ttk-render.js  ·  v1
   Ranking META por TTK calculado (honesto, derivado de datos).
   - Lee /weapons-official.json (mismo archivo que la ficha)
   - Calcula TTK/STK por arma y las ordena (menor TTK = mejor)
   - Controles: zona (pecho/cabeza), placas (EHP), clase
   - Se monta en <div id="wz-ttk-ranking"></div>
     (o el id en window.WZ_TTK_MOUNT). CSS propio, prefijo .mt-
   - Si no hay datos suficientes, muestra aviso (no rompe)
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const MOUNT_ID = window.WZ_TTK_MOUNT || 'wz-ttk-ranking';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ── Matemática TTK (igual que la ficha) ──
  const EHP_PRESETS = [
    { ehp: 100, label: 'Sin placas' },
    { ehp: 150, label: '1 placa' },
    { ehp: 200, label: '2 placas' },
    { ehp: 250, label: '3 placas' }
  ];
  function stk(ehp, dmg) { return (!dmg || dmg <= 0) ? null : Math.ceil(ehp / dmg); }
  function ttkMs(shots, rpm) { return (!shots || shots < 1 || !rpm || rpm <= 0) ? null : Math.round((shots - 1) * (60000 / rpm)); }
  function zoneVal(z) { return (z && typeof z === 'object') ? z.valor : z; }

  const state = { ehp: 250, zone: 'pecho', clase: 'all' };
  let WEAPONS = [];   // [{slug,nombre,tipo,body,head,rpm}]

  function rows() {
    const dmgKey = state.zone === 'cabeza' ? 'head' : 'body';
    const list = WEAPONS
      .filter(w => state.clase === 'all' || w.tipo === state.clase)
      .map(w => {
        const dmg = w[dmgKey];
        const s = stk(state.ehp, dmg);
        const t = ttkMs(s, w.rpm);
        const dps = (typeof w.body === 'number') ? Math.round(w.body * w.rpm / 60) : null;
        return { ...w, dmg, stk: s, ttk: t, dps };
      })
      .filter(w => w.ttk != null);
    list.sort((a, b) => a.ttk - b.ttk || (a.stk - b.stk));
    return list;
  }

  function controlsHTML(clases) {
    const ehpBtns = EHP_PRESETS.map(p =>
      `<button type="button" class="mt-chip${p.ehp === state.ehp ? ' on' : ''}" data-ehp="${p.ehp}">${esc(p.label)}<small>${p.ehp}</small></button>`
    ).join('');
    const claseOpts = ['all', ...clases].map(c =>
      `<option value="${esc(c)}"${c === state.clase ? ' selected' : ''}>${c === 'all' ? 'Todas las clases' : esc(c)}</option>`
    ).join('');
    return `<div class="mt-controls">
      <div class="mt-seg" role="group" aria-label="Zona de impacto">
        <button type="button" class="mt-seg-b${state.zone === 'pecho' ? ' on' : ''}" data-zona="pecho">Al pecho</button>
        <button type="button" class="mt-seg-b${state.zone === 'cabeza' ? ' on' : ''}" data-zona="cabeza">A la cabeza</button>
      </div>
      <div class="mt-plates" role="group" aria-label="Placas del objetivo">${ehpBtns}</div>
      <select class="mt-clase" aria-label="Filtrar por clase">${claseOpts}</select>
    </div>`;
  }

  function listHTML() {
    const list = rows();
    if (!list.length) {
      return `<div class="mt-empty">No hay armas con datos suficientes (daño + cadencia) para esta selección.</div>`;
    }
    const best = list[0].ttk;
    return `<div class="mt-list">` + list.map((w, i) => {
      const width = Math.max(8, Math.round((best / w.ttk) * 100));
      return `<div class="mt-row${i < 3 ? ' mt-top mt-top-' + (i + 1) : ''}" style="--w:${width}%">
        <div class="mt-rank">${i + 1}</div>
        <div class="mt-name"><span class="mt-nm">${esc(w.nombre || w.slug)}</span><span class="mt-ty">${esc(w.tipo || '')}</span></div>
        <div class="mt-ttk">${w.ttk}<small>ms</small></div>
        <div class="mt-meta"><span><b>${w.stk}</b> balas</span><span>${w.dps != null ? w.dps + ' DPS' : ''}</span></div>
      </div>`;
    }).join('') + `</div>`;
  }

  function render(root) {
    const clases = Array.from(new Set(WEAPONS.map(w => w.tipo).filter(Boolean))).sort();
    const ehpLabel = (EHP_PRESETS.find(p => p.ehp === state.ehp) || {}).label || '';
    root.innerHTML = `<section class="mt-widget">
      <header class="mt-head">
        <div>
          <h2 class="mt-title">Ranking Meta · TTK</h2>
          <p class="mt-sub">Ordenado por tiempo en matar calculado — menor es mejor</p>
        </div>
        <div class="mt-badge">${esc(state.zone === 'cabeza' ? 'CABEZA' : 'PECHO')} · ${state.ehp} EHP<span class="mt-dot"></span></div>
      </header>
      ${controlsHTML(clases)}
      <div class="mt-body">${listHTML()}</div>
      <p class="mt-note"><span class="mt-i">i</span><span>TTK teórico a quemarropa contra <b>${esc(ehpLabel)} (${state.ehp} EHP)</b>, sin retroceso, accesorios ni caída de daño. El meta real también pesa manejo y contexto del modo — esto mide la base objetiva.</span></p>
    </section>`;
    wire(root);
  }

  function wire(root) {
    root.querySelectorAll('[data-zona]').forEach(b => b.addEventListener('click', () => { state.zone = b.dataset.zona; render(root); }));
    root.querySelectorAll('[data-ehp]').forEach(b => b.addEventListener('click', () => { state.ehp = parseInt(b.dataset.ehp, 10); render(root); }));
    const sel = root.querySelector('.mt-clase');
    if (sel) sel.addEventListener('change', () => { state.clase = sel.value; render(root); });
  }

  function injectStyles() {
    if (document.getElementById('mt-styles')) return;
    if (!document.getElementById('wo-fonts')) {
      const l = document.createElement('link');
      l.id = 'wo-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap';
      document.head.appendChild(l);
    }
    const css = `
    .mt-widget{--muted:rgba(235,240,245,.58);--dim:rgba(235,240,245,.32);--yellow:#ffd21f;--orange:#ff8a00;--red:#ff2d2d;
      max-width:1040px;margin:48px auto;color:#f3f5f7;font-family:'Rajdhani',system-ui,sans-serif;
      border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:24px;position:relative;overflow:hidden;
      background:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.012)),#0b1117;
      background-size:28px 28px,28px 28px,auto,auto;box-shadow:0 28px 90px rgba(0,0,0,.5)}
    .mt-widget *{box-sizing:border-box}
    .mt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
    .mt-title{margin:0;font-size:clamp(1.6rem,5vw,2.6rem);font-weight:700;letter-spacing:.05em;text-transform:uppercase;line-height:.9}
    .mt-sub{margin:6px 0 0;color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.8rem;letter-spacing:.03em}
    .mt-badge{font-family:'Share Tech Mono',monospace;color:var(--yellow);border:1px solid rgba(255,210,31,.6);border-radius:999px;padding:8px 13px;font-size:.72rem;font-weight:700;letter-spacing:.06em;white-space:nowrap;background:rgba(255,210,31,.05)}
    .mt-badge .mt-dot{display:inline-block;width:7px;height:7px;background:#23d8ff;border-radius:50%;margin-left:8px;box-shadow:0 0 10px #23d8ff;vertical-align:middle}
    .mt-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
    .mt-seg{display:flex;border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden}
    .mt-seg-b{font-family:'Rajdhani',sans-serif;font-weight:600;font-size:.86rem;letter-spacing:.03em;color:var(--muted);background:transparent;border:0;padding:9px 14px;cursor:pointer;transition:.15s}
    .mt-seg-b.on{background:var(--yellow);color:#0a0a0c;font-weight:700}
    .mt-plates{display:flex;gap:6px;flex-wrap:wrap}
    .mt-chip{font-family:'Share Tech Mono',monospace;font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:6px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;line-height:1.1;transition:.15s}
    .mt-chip small{font-size:.62rem;color:var(--dim)}
    .mt-chip.on{background:var(--yellow);color:#0a0a0c;border-color:var(--yellow);font-weight:700}
    .mt-chip.on small{color:rgba(0,0,0,.55)}
    .mt-clase{margin-left:auto;font-family:'Share Tech Mono',monospace;font-size:.78rem;color:#f3f5f7;background:#0e151d;border:1px solid rgba(255,255,255,.16);border-radius:9px;padding:9px 12px;cursor:pointer}
    .mt-list{display:flex;flex-direction:column;gap:8px}
    .mt-row{position:relative;display:grid;grid-template-columns:38px 1fr auto auto;gap:14px;align-items:center;padding:13px 16px 15px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.1));overflow:hidden}
    .mt-row:before{content:"";position:absolute;left:0;bottom:0;height:3px;width:var(--w);background:linear-gradient(90deg,var(--yellow),var(--orange),var(--red));opacity:.85}
    .mt-row.mt-top{border-color:rgba(255,210,31,.4)}
    .mt-rank{font-family:'Share Tech Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--dim);text-align:center}
    .mt-top-1 .mt-rank{color:#ffd21f}.mt-top-2 .mt-rank{color:#e6e6e6}.mt-top-3 .mt-rank{color:#ff9d4d}
    .mt-name{min-width:0}
    .mt-nm{display:block;font-size:1.12rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mt-ty{display:block;font-family:'Share Tech Mono',monospace;color:var(--muted);font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;margin-top:5px}
    .mt-ttk{font-family:'Share Tech Mono',monospace;font-size:1.7rem;font-weight:700;color:#fff;line-height:1;text-align:right;white-space:nowrap}
    .mt-ttk small{font-size:.7rem;color:var(--muted);margin-left:3px;font-weight:400}
    .mt-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--muted);white-space:nowrap;min-width:74px}
    .mt-meta b{color:#fff}
    .mt-empty{padding:30px;text-align:center;color:var(--muted);border:1px dashed rgba(255,255,255,.15);border-radius:12px}
    .mt-note{margin:18px 0 0;display:flex;gap:10px;align-items:flex-start;color:var(--muted);font-size:.86rem;line-height:1.4;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;background:rgba(0,0,0,.12)}
    .mt-note b{color:var(--yellow)}
    .mt-i{width:22px;height:22px;flex:0 0 auto;border:1px solid rgba(255,255,255,.4);border-radius:50%;display:grid;place-items:center;font-family:'Share Tech Mono',monospace;color:#fff;font-size:.8rem}
    @media(max-width:640px){
      .mt-widget{padding:18px 14px;margin:28px auto;border-radius:16px}
      .mt-clase{margin-left:0;width:100%}
      .mt-row{grid-template-columns:30px 1fr auto;gap:10px;padding:11px 12px 13px}
      .mt-nm{font-size:1rem;white-space:normal}
      .mt-ttk{font-size:1.35rem}
      .mt-meta{display:none}
      .mt-rank{font-size:1.15rem}
    }`;
    const tag = document.createElement('style');
    tag.id = 'mt-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  async function init() {
    const root = document.getElementById(MOUNT_ID);
    if (!root) return;
    injectStyles();
    root.innerHTML = '<div class="mt-widget"><div class="mt-empty">Cargando ranking…</div></div>';
    let data;
    try {
      const res = await fetch('/weapons-official.json?v=' + Date.now());
      if (!res.ok) throw 0;
      data = await res.json();
    } catch (e) {
      root.innerHTML = '<div class="mt-widget"><div class="mt-empty">No se pudo cargar weapons-official.json.</div></div>';
      return;
    }
    const armas = (data && data.armas) || {};
    WEAPONS = Object.keys(armas).map(slug => {
      const a = armas[slug] || {};
      const d = a.dano_por_parte || {};
      const pf = a.potencia_de_fuego || {};
      return {
        slug,
        nombre: a.nombre,
        tipo: a.tipo,
        body: zoneVal(d.pecho),
        head: zoneVal(d.cabeza),
        rpm: (typeof pf.cadencia_rpm === 'number') ? pf.cadencia_rpm : null
      };
    }).filter(w => w.rpm && (typeof w.body === 'number' || typeof w.head === 'number'));
    render(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
