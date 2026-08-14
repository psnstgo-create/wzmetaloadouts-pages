// ════════════════════════════════════════════════════════════════════
//   BO7-HUB — Meta de armas de Black Ops 7 (se muestra en /black-ops-7)
//   Lee armas-data.json, filtra por juego=bo7, y renderiza:
//     • una franja de ARMAS NUEVAS de la temporada (badge NEW)
//     • chips de categoría (filtro)
//     • la grilla de armas ordenada por ranking, con tier y pick rate
//   Cada arma linkea a su ficha /armas/{slug}. Sin dependencias.
// ════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var TIER_COLOR = { S: '#FF9500', A: '#00FF87', B: '#00A8FF', C: '#BF5FFF', D: '#7A8494' };
  // tipo (armas-data) → etiqueta corta + clave de filtro
  var CAT = {
    'Fusil de asalto': 'Fusiles', 'Subfusil': 'SMG', 'Rifle de francotirador': 'Francotirador',
    'Ametralladora ligera': 'LMG', 'Fusil táctico': 'Táctico', 'Escopeta': 'Escopetas',
    'Pistola': 'Pistolas', 'Ballesta': 'Ballesta', 'Lanzador': 'Lanzador',
    'Especial': 'Especial', 'Cuerpo a cuerpo': 'Melee'
  };

  var ALL = [];
  var filtroCat = 'todos';
  var query = '';

  function tierDe(w) {
    if (w.tier) return w.tier;
    var c = w._catRank;
    if (c == null) return 'A';
    return c <= 2 ? 'S' : c <= 5 ? 'A' : c <= 9 ? 'B' : 'C';
  }

  function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function cardHTML(w) {
    var t = tierDe(w);
    var col = TIER_COLOR[t] || '#7A8494';
    var nuevo = w.es_nuevo ? '<span class="wc-new">NUEVA</span>' : '';
    var pick = w.pick_rate ? ('<span class="wc-pick">' + esc(w.pick_rate) + ' pick</span>') : '';
    return '<a class="wcard" href="/armas/' + encodeURIComponent(w.slug) + '" style="--tc:' + col + '">' +
      '<span class="wc-tier" style="background:' + col + '">' + t + '</span>' +
      '<div class="wc-img"><img src="' + esc(w.imagen || '') + '" alt="' + esc(w.nombre) + '" loading="lazy" onerror="this.style.opacity=0"></div>' +
      '<div class="wc-body"><div class="wc-name">' + esc(w.nombre) + nuevo + '</div>' +
      '<div class="wc-meta">' + esc(w.tipo || '') + (pick ? ' · ' : '') + pick + '</div></div>' +
      '<svg class="wc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>' +
      '</a>';
  }

  function renderNew() {
    var host = document.getElementById('bo7New');
    if (!host) return;
    var nuevas = ALL.filter(function (w) { return w.es_nuevo; });
    if (!nuevas.length) { host.style.display = 'none'; return; }
    host.innerHTML = '<div class="bo7-sec-h">🆕 Nuevas en la Temporada</div>' +
      '<div class="wgrid">' + nuevas.map(cardHTML).join('') + '</div>';
  }

  function renderCats() {
    var host = document.getElementById('bo7Cats');
    if (!host) return;
    var presentes = [];
    ALL.forEach(function (w) {
      var lbl = CAT[w.tipo] || w.tipo;
      if (lbl && presentes.indexOf(lbl) === -1) presentes.push(lbl);
    });
    var chips = ['<button class="bo7-chip on" data-cat="todos">Todas</button>'];
    presentes.forEach(function (lbl) {
      chips.push('<button class="bo7-chip" data-cat="' + esc(lbl) + '">' + esc(lbl) + '</button>');
    });
    host.innerHTML = chips.join('');
    host.querySelectorAll('.bo7-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        filtroCat = b.dataset.cat;
        host.querySelectorAll('.bo7-chip').forEach(function (x) { x.classList.toggle('on', x === b); });
        renderGrid();
      });
    });
  }

  function renderGrid() {
    var host = document.getElementById('bo7Grid');
    if (!host) return;
    var lista = ALL.filter(function (w) {
      var lbl = CAT[w.tipo] || w.tipo;
      var okCat = filtroCat === 'todos' || lbl === filtroCat;
      var okQ = !query || (w.nombre || '').toLowerCase().indexOf(query) !== -1;
      return okCat && okQ;
    });
    var cnt = document.getElementById('bo7Count');
    if (cnt) cnt.textContent = lista.length;
    host.innerHTML = lista.length
      ? '<div class="wgrid">' + lista.map(cardHTML).join('') + '</div>'
      : '<div class="bo7-empty">Sin armas para ese filtro.</div>';
  }

  function init() {
    var search = document.getElementById('bo7Search');
    if (search) search.addEventListener('input', function () { query = search.value.toLowerCase().trim(); renderGrid(); });
    fetch('/armas-data.json?v=' + Date.now(), { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        ALL = Object.keys(d.armas || {}).map(function (slug) {
          var w = d.armas[slug]; w.slug = slug; return w;
        }).filter(function (w) {
          return (w.juego || 'bo7') === 'bo7';
        }).sort(function (a, b) {
          return (a.ranking || 999) - (b.ranking || 999);
        });
        renderNew(); renderCats(); renderGrid();
      })
      .catch(function (e) {
        var host = document.getElementById('bo7Grid');
        if (host) host.innerHTML = '<div class="bo7-empty">No se pudo cargar el arsenal. Probá recargar.</div>';
        console.warn('[BO7-HUB]', e);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
