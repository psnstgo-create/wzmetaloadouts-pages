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
    // reemplazar el estilo si el pre-render horneó una versión vieja
    var prev = document.getElementById('wzgame-style');
    if (prev) prev.remove();
    var s = document.createElement('style');
    s.id = 'wzgame-style';
    s.textContent = [
      '.wzgame-bar{display:flex;justify-content:center;align-items:center;gap:10px;padding:10px 14px;flex-wrap:wrap;',
      'background:rgba(7,10,14,.6);border-bottom:1px solid rgba(255,255,255,.06)}',
      '.wzgame-btn{flex:1 1 0;max-width:210px;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:54px;',
      'padding:8px 14px;border-radius:10px;text-decoration:none;cursor:pointer;transition:.15s;',
      'border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03)}',
      '.wzgame-btn img{max-height:30px;max-width:100%;width:auto;height:auto;display:block;object-fit:contain;opacity:.72;transition:.15s}',
      '.wzgame-btn:hover{border-color:rgba(255,255,255,.28)}',
      '.wzgame-btn:hover img{opacity:1}',
      '.wzgame-btn.on{border-color:#8ed13f;background:rgba(142,209,63,.12);box-shadow:0 0 22px -6px #8ed13f}',
      '.wzgame-btn.on img{opacity:1}',
      '.wzgame-txt{font-family:var(--font-ui,"Rajdhani",sans-serif);font-weight:700;font-size:.9rem;',
      'letter-spacing:.08em;text-transform:uppercase;color:#AEB8C4}',
      '.wzgame-btn.on .wzgame-txt{color:#EEF2F6}',
      '.wzgame-btn.soon{opacity:.55;cursor:not-allowed}',
      '.wzgame-tag{font-family:var(--font-mono,monospace);font-size:.58rem;letter-spacing:.1em;padding:2px 6px;',
      'border-radius:5px;background:rgba(255,255,255,.12);color:#cfd6de}',
      '@media(max-width:520px){.wzgame-btn{padding:6px 8px;min-height:44px;max-width:none}.wzgame-btn img{max-height:22px}.wzgame-tag{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  function render(juegos) {
    // index.html/servidores.html usan <header> sin clase; el resto <header class="wzhdr">
    var host = document.querySelector('header.wzhdr') || document.querySelector('header');
    if (!host) return;
    // Si el pre-render horneó una barra vieja en el HTML, la reemplazamos por la
    // versión EN VIVO (así un cambio en este script siempre se refleja, no queda
    // pegada la horneada).
    var vieja = document.querySelector('.wzgame-bar');
    if (vieja) vieja.remove();
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
      el.setAttribute('aria-label', info.nombre);
      // logo (imagen) si el juego lo tiene; si falla o no hay, cae al texto
      var contenido = info.logo
        ? '<img src="' + info.logo + '" alt="' + info.nombre + '" onerror="this.outerHTML=\'<span class=\\\'wzgame-txt\\\'>' + info.nombre + '</span>\'">'
        : '<span class="wzgame-txt">' + info.nombre + '</span>';
      el.innerHTML = contenido + (proximo ? '<span class="wzgame-tag">PRONTO</span>' : '');
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
