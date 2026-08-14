// ════════════════════════════════════════════════════════════════════
//   GAME-SWITCH — Toggle global de juego (Warzone / Black Ops 7 / MW4)
//   Fase 1 del plan de separación por juego (ver integracion.json + campo
//   'juego' en armas/mapas). Se inyecta solo debajo del header en todas las
//   páginas que incluyan este script. El juego ACTIVO se infiere de la URL;
//   al tocar otro juego, navega a su "home". Data-driven desde integracion.json:
//   agregar/activar MW4 es solo cambiar ese JSON (estado 'proximo' = deshabilitado).
// ════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // Home de cada juego (a dónde lleva su pastilla)
  var HOME = { warzone: '/', bo7: '/black-ops-7', mw4: '/modern-warfare-4' };
  // Orden de las pastillas
  var ORDEN = ['warzone', 'bo7', 'mw4'];
  // Respaldo si integracion.json no carga
  var FALLBACK = {
    warzone: { nombre: 'Warzone', estado: 'actual' },
    bo7: { nombre: 'Black Ops 7', estado: 'actual' },
    mw4: { nombre: 'Modern Warfare 4', estado: 'proximo' }
  };

  function juegoActual() {
    // 1) query param explícito (ej: /armas?juego=bo7) manda
    try {
      var q = new URLSearchParams(location.search).get('juego');
      if (q === 'warzone' || q === 'bo7' || q === 'mw4') return q;
    } catch (e) { /* sin URLSearchParams */ }
    // 2) si no, se infiere del path — normalizado: sin .html ni barra final
    var p = (location.pathname || '/').toLowerCase().replace(/\.html$/, '').replace(/\/+$/, '');
    if (p === '') p = '/';
    if (p === '/black-ops-7' || /(multijugador|zombies)-black-ops-7$/.test(p)) return 'bo7';
    if (p.indexOf('modern-warfare-4') !== -1) return 'mw4';
    return 'warzone';
  }

  function injectStyle() {
    if (document.getElementById('wzgame-style')) return;
    var s = document.createElement('style');
    s.id = 'wzgame-style';
    s.textContent = [
      '.wzgame-bar{display:flex;justify-content:center;gap:8px;padding:10px 14px;',
      'background:rgba(7,10,14,.6);border-bottom:1px solid rgba(255,255,255,.06)}',
      '.wzgame-btn{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-ui,"Rajdhani",sans-serif);',
      'font-weight:700;font-size:.86rem;letter-spacing:.08em;text-transform:uppercase;',
      'padding:8px 20px;border-radius:9px;text-decoration:none;cursor:pointer;transition:.15s;',
      'border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#AEB8C4}',
      '.wzgame-btn:hover{color:#EEF2F6;border-color:rgba(255,255,255,.22)}',
      '.wzgame-btn.on{background:linear-gradient(135deg,#57b524,#8ed13f);border-color:#8ed13f;',
      'color:#0a0f0a;box-shadow:0 0 18px -6px #8ed13f}',
      '.wzgame-btn.soon{opacity:.5;cursor:not-allowed}',
      '.wzgame-tag{font-size:.6rem;letter-spacing:.1em;padding:2px 6px;border-radius:5px;',
      'background:rgba(255,255,255,.12);color:#cfd6de}',
      '.wzgame-btn.on .wzgame-tag{background:rgba(0,0,0,.2);color:#0a0f0a}'
    ].join('');
    document.head.appendChild(s);
  }

  function render(juegos) {
    // index.html/servidores.html usan <header> sin clase; el resto <header class="wzhdr">
    var host = document.querySelector('header.wzhdr') || document.querySelector('header');
    if (!host || document.querySelector('.wzgame-bar')) return;
    var actual = juegoActual();
    var bar = document.createElement('nav');
    bar.className = 'wzgame-bar';
    bar.setAttribute('aria-label', 'Elegir juego');

    ORDEN.forEach(function (id) {
      var info = juegos[id];
      if (!info) return;
      var proximo = info.estado === 'proximo';
      var el = document.createElement(proximo ? 'span' : 'a');
      el.className = 'wzgame-btn' + (id === actual ? ' on' : '') + (proximo ? ' soon' : '');
      if (!proximo) el.href = HOME[id] || '/';
      var nombre = (info.corto && id !== 'warzone') ? info.nombre : info.nombre; // nombre completo
      el.innerHTML = nombre + (proximo ? '<span class="wzgame-tag">PRONTO</span>' : '');
      bar.appendChild(el);
    });

    // insertar la barra justo DESPUÉS del header sticky
    if (host.nextSibling) host.parentNode.insertBefore(bar, host.nextSibling);
    else host.parentNode.appendChild(bar);
  }

  function init() {
    injectStyle();
    fetch('/integracion.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) {
        render((cfg && cfg.juegos) ? cfg.juegos : FALLBACK);
      })
      .catch(function () { render(FALLBACK); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
