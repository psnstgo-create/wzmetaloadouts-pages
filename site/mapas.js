/* ═══════════════════════════════════════════════════════════
   MAPAS.JS — catálogo de mapas (grilla + filtro por modo + buscador)
   Lee mapas-data.json. Patrón espejo de armas.js.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var DATA = null;
  var modoActivo = 'todos';
  var termino = '';

  var MODO_ICON = {
    warzone: 'M2 12h4l2-5 4 10 3-7 2 2h5',
    multijugador: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    endgame: 'M13 2L3 14h7l-1 8 10-12h-7z',
    zombies: 'M12 2a7 7 0 0 0-7 7v4l-2 3v2h18v-2l-2-3V9a7 7 0 0 0-7-7z'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]); }); }

  function listaMapas() {
    var m = DATA.mapas || {};
    return Object.keys(m).map(function (slug) { var o = m[slug]; o._slug = slug; return o; });
  }

  function contarPorModo() {
    var c = {}; listaMapas().forEach(function (mp) { c[mp.modo] = (c[mp.modo] || 0) + 1; });
    return c;
  }

  function renderPills() {
    var cont = document.getElementById('modePills'); if (!cont) return;
    var cnt = contarPorModo();
    var total = listaMapas().length;
    var modos = DATA.modos || {};
    var html = '<button class="pill ' + (modoActivo === 'todos' ? 'active' : '') + '" data-modo="todos">Todos <span class="c">' + total + '</span></button>';
    Object.keys(modos).forEach(function (k) {
      var n = cnt[k] || 0;
      html += '<button class="pill ' + (modoActivo === k ? 'active' : '') + '" data-modo="' + k + '">' + esc(modos[k]) + ' <span class="c">' + n + '</span></button>';
    });
    cont.innerHTML = html;
    cont.querySelectorAll('.pill').forEach(function (b) {
      b.addEventListener('click', function () { modoActivo = b.dataset.modo; renderPills(); renderGrid(); });
    });
  }

  function card(mp) {
    var modoLabel = (DATA.modos && DATA.modos[mp.modo]) || mp.modo;
    return '<a class="map-card" href="/mapas/' + esc(mp._slug) + '">' +
      '<div class="mc-img"><img src="' + esc(mp.imagen) + '" alt="Mapa de ' + esc(mp.nombre) + '" loading="lazy" onerror="this.style.opacity=0"></div>' +
      '<div class="mc-body">' +
      '<div class="mc-badges"><span class="mc-mode">' + esc(modoLabel) + '</span>' + (mp.tipo ? '<span class="mc-tipo">' + esc(mp.tipo) + '</span>' : '') + '</div>' +
      '<h3>' + esc(mp.nombre) + '</h3>' +
      '</div></a>';
  }

  function renderGrid() {
    var grid = document.getElementById('mapGrid'); if (!grid) return;
    var arr = listaMapas().filter(function (mp) {
      if (modoActivo !== 'todos' && mp.modo !== modoActivo) return false;
      if (termino && esc(mp.nombre).toLowerCase().indexOf(termino) === -1) return false;
      return true;
    });
    document.getElementById('mapCount') && (document.getElementById('mapCount').textContent = arr.length);
    if (!arr.length) {
      grid.innerHTML = '<div class="map-empty">Todavía no hay mapas en este modo — <strong>próximamente</strong>. 🗺️</div>';
      return;
    }
    grid.innerHTML = arr.map(card).join('');
  }

  function initBuscador() {
    var inp = document.getElementById('mapSearch'); if (!inp) return;
    inp.addEventListener('input', function () { termino = inp.value.trim().toLowerCase(); renderGrid(); });
  }

  fetch('/mapas-data.json?_=' + Date.now())
    .then(function (r) { return r.json(); })
    .then(function (d) { DATA = d; renderPills(); renderGrid(); initBuscador(); })
    .catch(function (e) {
      var grid = document.getElementById('mapGrid');
      if (grid) grid.innerHTML = '<div class="map-empty">No se pudieron cargar los mapas.</div>';
      console.error('[MAPAS]', e);
    });
})();
