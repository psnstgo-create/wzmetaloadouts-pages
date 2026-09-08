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
    mw4: { nombre: 'Modern Warfare 4', lanzamiento: '2026-10-23', estado: 'proximo' }
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
      '.wzgame-btn.soon{opacity:.78;cursor:pointer;border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.055)}',
      '.wzgame-btn.soon:hover,.wzgame-btn.soon:focus-visible{opacity:1;border-color:#EF4444;box-shadow:0 0 22px -7px #EF4444;outline:none}',
      '.wzgame-tag{font-family:var(--font-mono,monospace);font-size:.58rem;letter-spacing:.1em;padding:2px 6px;',
      'border-radius:5px;background:rgba(255,255,255,.12);color:#cfd6de}',
      '.mw4-launch-layer{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(2,5,8,.74);backdrop-filter:blur(6px)}',
      '.mw4-launch-card{position:relative;width:min(100%,420px);padding:28px;border:1px solid rgba(239,68,68,.48);border-radius:16px;background:linear-gradient(145deg,#151218,#0b1017 72%);box-shadow:0 24px 80px rgba(0,0,0,.55)}',
      '.mw4-launch-kicker{margin:0 0 8px;font:700 .68rem var(--font-mono,monospace);letter-spacing:.16em;color:#ff8b8b;text-transform:uppercase}',
      '.mw4-launch-card h2{margin:0;color:#f4f6f8;font-family:var(--font-display,var(--font-ui,sans-serif));font-size:clamp(1.65rem,5vw,2.25rem);line-height:1}',
      '.mw4-launch-date{display:flex;align-items:baseline;gap:10px;margin:18px 0 14px;color:#fff}',
      '.mw4-launch-day{font:800 3rem/1 var(--font-display,var(--font-ui,sans-serif));color:#EF4444}',
      '.mw4-launch-month{font:700 .85rem/1.25 var(--font-mono,monospace);letter-spacing:.12em;text-transform:uppercase}',
      '.mw4-launch-card p{margin:0;color:#aeb8c4;font:500 1rem/1.5 var(--font-ui,sans-serif)}',
      '.mw4-launch-actions{display:flex;gap:10px;align-items:center;margin-top:23px}',
      '.mw4-launch-link,.mw4-launch-close{border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:10px 13px;font:700 .76rem var(--font-mono,monospace);letter-spacing:.06em;text-decoration:none;cursor:pointer}',
      '.mw4-launch-link{border-color:#EF4444;background:#EF4444;color:#fff}.mw4-launch-close{background:transparent;color:#d7dee7}',
      '.mw4-launch-x{position:absolute;right:10px;top:9px;border:0;background:transparent;color:#aeb8c4;font-size:1.45rem;line-height:1;cursor:pointer}',
      '@media(max-width:520px){.wzgame-btn{padding:6px 8px;min-height:44px;max-width:none}.wzgame-btn img{max-height:22px}.wzgame-tag{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  function fechaLanzamiento(valor) {
    var partes = String(valor || '').match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
    if (!partes) return { dia: '23', mes: 'octubre', ano: '2026', texto: '23 de octubre de 2026' };
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var mes = meses[parseInt(partes[2], 10) - 1];
    var dia = String(parseInt(partes[3], 10));
    return { dia: dia, mes: mes, ano: partes[1], texto: dia + ' de ' + mes + ' de ' + partes[1] };
  }

  function mostrarLanzamientoMW4(info) {
    var anterior = document.querySelector('.mw4-launch-layer');
    if (anterior) anterior.remove();
    var fecha = fechaLanzamiento(info.lanzamiento);
    var capa = document.createElement('div');
    capa.className = 'mw4-launch-layer';
    capa.setAttribute('role', 'presentation');
    var tarjeta = document.createElement('section');
    tarjeta.className = 'mw4-launch-card';
    tarjeta.setAttribute('role', 'dialog');
    tarjeta.setAttribute('aria-modal', 'true');
    tarjeta.setAttribute('aria-labelledby', 'mw4-launch-title');
    tarjeta.innerHTML = '<button class="mw4-launch-x" type="button" aria-label="Cerrar">×</button>' +
      '<div class="mw4-launch-kicker">Lanzamiento confirmado</div>' +
      '<h2 id="mw4-launch-title">Modern Warfare 4</h2>' +
      '<div class="mw4-launch-date"><span class="mw4-launch-day">' + fecha.dia + '</span><span class="mw4-launch-month">' + fecha.mes + '<br>' + fecha.ano + '</span></div>' +
      '<p>MW4 llega el <strong>' + fecha.texto + '</strong>. Las primeras armas, clases y cambios que afecten Warzone aparecerán aquí cuando se integre al juego.</p>' +
      '<div class="mw4-launch-actions"><a class="mw4-launch-link" href="/noticias/modern-warfare-4-beta-abierta-gratis">Ver novedades de MW4</a><button class="mw4-launch-close" type="button">Cerrar</button></div>';
    capa.appendChild(tarjeta);
    document.body.appendChild(capa);
    var cerrar = function () { capa.remove(); };
    tarjeta.querySelector('.mw4-launch-x').addEventListener('click', cerrar);
    tarjeta.querySelector('.mw4-launch-close').addEventListener('click', cerrar);
    capa.addEventListener('click', function (ev) { if (ev.target === capa) cerrar(); });
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key !== 'Escape') return;
      cerrar();
      document.removeEventListener('keydown', esc);
    });
    tarjeta.querySelector('.mw4-launch-x').focus();
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
      var el = document.createElement(proximo ? 'button' : 'a');
      el.className = 'wzgame-btn' + (id === actual ? ' on' : '') + (proximo ? ' soon' : '');
      if (!proximo) el.href = HOME[id] || '/';
      if (proximo) {
        el.type = 'button';
        el.title = 'Ver fecha de lanzamiento';
        el.addEventListener('click', function () { mostrarLanzamientoMW4(info); });
      }
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
