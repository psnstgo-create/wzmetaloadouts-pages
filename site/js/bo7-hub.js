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
  var filtroVista = 'meta';
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

  function esMetaActual(w) {
    var tier = tierDe(w);
    return tier === 'S' || tier === 'A';
  }

  function hotCardHTML(w, index) {
    var tier = tierDe(w);
    var col = TIER_COLOR[tier] || '#00FF87';
    return '<a class="bo7-hot" href="/armas/' + encodeURIComponent(w.slug) + '" style="--hot-color:' + col + '">' +
      '<span class="bo7-hot-rank">#' + (index + 1) + '</span>' +
      '<img src="' + esc(w.imagen || '') + '" alt="" loading="lazy" onerror="this.style.opacity=0">' +
      '<span><strong>' + esc(w.nombre) + '</strong><span>' + tier + ' Tier · ' + esc(w.tipo || 'Arma') + '</span></span></a>';
  }

  function radarCardHTML(w) {
    return '<a class="bo7-radar-card" href="/armas/' + encodeURIComponent(w.slug) + '">' +
      '<span class="bo7-radar-tag">Nueva temporada</span><strong>' + esc(w.nombre) + '</strong>' +
      '<span>' + esc(w.tipo || 'Arma') + '</span>' +
      '<img src="' + esc(w.imagen || '') + '" alt="" loading="lazy" onerror="this.style.opacity=0"></a>';
  }

  function loadoutDestacado(w) {
    var loadouts = Array.isArray(w.loadouts) ? w.loadouts : [];
    return loadouts.find(function (l) { return l.codigo && Array.isArray(l.items) && l.items.length >= 5; }) ||
      loadouts.find(function (l) { return Array.isArray(l.items) && l.items.length >= 5; }) || null;
  }

  function copiarCodigo(button, code) {
    function listo() {
      var original = button.textContent;
      button.textContent = 'Código copiado ✓';
      setTimeout(function () { button.textContent = original; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(listo).catch(function () {});
      return;
    }
    var campo = document.createElement('textarea');
    campo.value = code;
    campo.setAttribute('readonly', '');
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    try { document.execCommand('copy'); listo(); } catch (e) {}
    document.body.removeChild(campo);
  }

  function renderFeatured() {
    var host = document.getElementById('bo7Featured');
    if (!host) return;
    var weapon = ALL.filter(esMetaActual).find(function (w) { return loadoutDestacado(w); });
    if (!weapon) { host.innerHTML = ''; return; }
    var loadout = loadoutDestacado(weapon);
    var tier = tierDe(weapon);
    var code = loadout.codigo || '';
    var accesorios = loadout.items.slice(0, 5).map(function (item) {
      var slot = item.label || item.slot || 'Accesorio';
      return '<span class="bo7-featured-item" title="' + esc(slot + ': ' + (item.name || '')) + '"><b>' + esc(slot) + '</b>' + esc(item.name || '') + '</span>';
    }).join('');
    var copiar = code ? '<button class="bo7-copy" type="button" data-bo7-copy-code="' + esc(code) + '">Copiar código</button>' : '';
    host.innerHTML = '<article class="bo7-featured-card">' +
      '<div class="bo7-featured-code">' + (code ? 'Código de importación' : 'Build recomendada') + '</div>' +
      '<div><div class="bo7-featured-label"><span class="bo7-featured-tier">' + esc(tier) + '</span>' + esc(loadout.nombre || 'Clase meta') + '</div>' +
      '<h3>' + esc(weapon.nombre) + '</h3><p class="bo7-featured-role">' + esc(weapon.tipo || 'Arma') + ' · 5 accesorios</p>' +
      '<div class="bo7-featured-items">' + accesorios + '</div>' +
      '<div class="bo7-featured-actions">' + copiar + '<a class="bo7-featured-open" href="/armas/' + encodeURIComponent(weapon.slug) + '">Ver clase completa →</a></div></div>' +
      '<img class="bo7-featured-weapon" src="' + esc(weapon.imagen || '') + '" alt="' + esc(weapon.nombre) + '" loading="eager" onerror="this.style.opacity=0"></article>';
    var button = host.querySelector('[data-bo7-copy-code]');
    if (button) button.addEventListener('click', function () { copiarCodigo(button, button.dataset.bo7CopyCode); });
  }

  function renderHot() {
    var host = document.getElementById('bo7HotList');
    if (!host) return;
    var meta = ALL.filter(esMetaActual).slice(0, 3);
    host.innerHTML = meta.length
      ? meta.map(hotCardHTML).join('')
      : '<div class="bo7-empty">El meta se está actualizando.</div>';
  }

  function renderRadar() {
    var host = document.getElementById('bo7Radar');
    if (!host) return;
    var nuevas = ALL.filter(function (w) { return w.es_nuevo; });
    if (!nuevas.length) { host.style.display = 'none'; return; }
    host.innerHTML = nuevas.map(radarCardHTML).join('');
  }

  function renderStats() {
    var meta = ALL.filter(esMetaActual).length;
    var nuevas = ALL.filter(function (w) { return w.es_nuevo; }).length;
    var total = ALL.length;
    var values = { bo7MetaCount: meta, bo7NewCount: nuevas, bo7TotalCount: total };
    Object.keys(values).forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.textContent = values[id];
    });
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
      var okVista = filtroVista === 'todas' ||
        (filtroVista === 'meta' && esMetaActual(w)) ||
        (filtroVista === 'nuevas' && w.es_nuevo);
      return okCat && okQ && okVista;
    });
    var cnt = document.getElementById('bo7Count');
    if (cnt) cnt.textContent = lista.length;
    host.innerHTML = lista.length
      ? '<div class="wgrid">' + lista.map(cardHTML).join('') + '</div>'
      : '<div class="bo7-empty">Sin armas para ese filtro.</div>';
  }

  function elegirVista(vista) {
    filtroVista = vista;
    document.querySelectorAll('.bo7-view').forEach(function (button) {
      var activa = button.dataset.view === vista;
      button.classList.toggle('on', activa);
      button.setAttribute('aria-selected', String(activa));
    });
    renderGrid();
  }

  function init() {
    var search = document.getElementById('bo7Search');
    if (search) search.addEventListener('input', function () { query = search.value.toLowerCase().trim(); renderGrid(); });
    document.querySelectorAll('.bo7-view').forEach(function (button) {
      button.addEventListener('click', function () { elegirVista(button.dataset.view); });
    });
    document.querySelectorAll('[data-bo7-view]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        elegirVista(link.dataset.bo7View);
        var arsenal = document.getElementById('bo7Arsenal');
        if (arsenal) arsenal.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
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
        renderStats(); renderFeatured(); renderHot(); renderRadar(); renderCats(); renderGrid();
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
