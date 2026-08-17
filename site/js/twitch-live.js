// ════════════════════════════════════════════════════════════
//   TWITCH-LIVE.JS — Tira "Warzone en vivo ahora" (home)
//   Lee /streams-live.json (lo genera twitch_live.py cada ~15 min
//   vía GitHub Actions) y pinta tarjetas que ENLAZAN al stream en
//   Twitch (sin iframe → sin tocar CSP, carga liviana). Si no hay
//   streams o el dato está viejo, la sección se OCULTA sola.
//   Patrón calcado de server-status.js (fetch + render + interval).
// ════════════════════════════════════════════════════════════
(function initTwitchLive() {
  var MAX = 8;                 // tarjetas máximas
  var STALE_MIN = 45;          // si el JSON es más viejo que esto, se ignora (streams ya offline)

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtViewers(n) {
    n = parseInt(n, 10) || 0;
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k';
    return String(n);
  }
  function esViejo(gen) {
    if (!gen) return false; // sin timestamp: no bloquea (confiamos en el job)
    var t = Date.parse(gen);
    if (isNaN(t)) return false;
    return (Date.now() - t) > STALE_MIN * 60 * 1000;
  }

  function cardHtml(s) {
    var url = 'https://www.twitch.tv/' + encodeURIComponent(s.login || '');
    var thumb = s.thumb || '';
    var avatar = s.avatar || '';
    var name = esc(s.name || s.login || 'Streamer');
    var title = esc(s.title || '');
    var viewers = fmtViewers(s.viewers);
    var avatarHtml = avatar
      ? '<img class="lv-av" src="' + esc(avatar) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
      : '';
    var thumbHtml = thumb
      ? '<img class="lv-thumb" src="' + esc(thumb) + '" alt="" loading="lazy" onerror="this.closest(\'.lv-card\').classList.add(\'lv-nothumb\')">'
      : '';
    return '<a class="lv-card" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" title="' + name + ' — ver en Twitch">' +
      '<div class="lv-thumbwrap">' + thumbHtml +
        '<span class="lv-badge"><span class="lv-dot"></span>EN VIVO</span>' +
        '<span class="lv-viewers">' + viewers + ' 👁</span>' +
      '</div>' +
      '<div class="lv-meta">' + avatarHtml +
        '<div class="lv-txt"><div class="lv-name">' + name + '</div>' +
        '<div class="lv-title">' + title + '</div></div>' +
      '</div></a>';
  }

  var _raf = null;
  function startAutoScroll(track) {
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    // respeta "reducir movimiento" del sistema
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var sets = track.querySelectorAll('.lv-set');
    if (sets.length < 2) return;

    // pausa al interactuar (mouse / touch), para poder hacer click cómodo
    if (!track._lvBound) {
      track._lvBound = true;
      track.addEventListener('mouseenter', function () { track._lvPause = true; });
      track.addEventListener('mouseleave', function () { track._lvPause = false; });
      track.addEventListener('touchstart', function () { track._lvPause = true; }, { passive: true });
      track.addEventListener('touchend', function () {
        clearTimeout(track._lvT);
        track._lvT = setTimeout(function () { track._lvPause = false; }, 2500);
      });
    }
    track._lvPause = false;
    track._lvPos = track.scrollLeft;                // acumulador float (scrollLeft se redondea a entero)

    function step() {
      var wrap = sets[1].offsetLeft;                // ancho exacto del 1er set (loop sin cortes)
      if (!track._lvPause && wrap > 0) {
        track._lvPos += 0.5;                         // desplazamiento leve hacia la derecha
        if (track._lvPos >= wrap) track._lvPos -= wrap;
        track.scrollLeft = track._lvPos;
      } else {
        track._lvPos = track.scrollLeft;            // si está pausado/arrastrado, re-sincroniza
      }
      _raf = requestAnimationFrame(step);
    }
    _raf = requestAnimationFrame(step);
  }

  function render(data) {
    var sec = document.getElementById('liveNow');
    if (!sec) return;
    var streams = (data && Array.isArray(data.streams)) ? data.streams : [];
    if (!streams.length || esViejo(data && data.generado)) { sec.hidden = true; return; }
    streams = streams.slice(0, MAX);
    var track = sec.querySelector('.lv-track');
    var count = sec.querySelector('.lv-count');
    if (!track) return;
    // dos sets idénticos → el auto-scroll puede hacer loop infinito sin saltos
    var cards = streams.map(cardHtml).join('');
    track.innerHTML = '<div class="lv-set">' + cards + '</div>' +
                      '<div class="lv-set" aria-hidden="true">' + cards + '</div>';
    if (count) count.textContent = streams.length + (streams.length === 1 ? ' canal' : ' canales');
    sec.hidden = false;
    startAutoScroll(track);
  }

  async function check() {
    try {
      var res = await fetch('/streams-live.json?v=' + Date.now(), { cache: 'no-cache' });
      if (!res.ok) return;
      render(await res.json());
    } catch (err) {
      console.warn('[TWITCH-LIVE] no disponible:', err);
    }
  }
  check();
  setInterval(check, 5 * 60 * 1000);
})();
