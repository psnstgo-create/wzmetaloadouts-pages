/* Carrusel de la comunidad en la home. Lee solo el catálogo editorial público:
   no depende de sesión, Supabase ni datos privados. */
(function () {
  'use strict';

  var section = document.getElementById('homeCommunityStrip');
  var rail = document.getElementById('homeCommunityRail');
  if (!section || !rail) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeSlug(value) {
    return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
  }

  function safeImage(value) {
    return typeof value === 'string' &&
      /^\/weapons\/(?:[A-Za-z0-9_ .%()-]+\/)*[A-Za-z0-9_ .%()-]+$/.test(value) &&
      !/(?:^|\/)\.\.(?:\/|$)/.test(value);
  }

  function contextFor(loadout, weapon) {
    var id = String(loadout.id || '');
    if (/corto-alcance/.test(id)) return 'Corto alcance';
    if (/largo-alcance/.test(id)) return 'Largo alcance';
    if (/francotirador/.test(id)) return 'Francotirador';
    if (/battle-royale/.test(id)) return 'Battle Royale';
    return (weapon.tipo || 'Arma') + ' · build destacado';
  }

  function initials(alias) {
    return String(alias || '?').trim().slice(0, 2).toUpperCase();
  }

  function render(loadouts, weapons) {
    var cards = loadouts.filter(function (item) {
      return item && safeSlug(item.arma_slug) && weapons[item.arma_slug] &&
        typeof item.alias === 'string' && typeof item.codigo_clase === 'string' && item.codigo_clase;
    }).slice(0, 9);
    if (!cards.length) return;

    rail.innerHTML = cards.map(function (item) {
      var weapon = weapons[item.arma_slug];
      var image = safeImage(weapon.imagen) ? weapon.imagen : '';
      return '<article class="hc-card">' +
        '<a class="hc-card-link" href="/armas/' + encodeURIComponent(item.arma_slug) + '" aria-label="Ver ficha de ' + esc(weapon.nombre) + '"></a>' +
        (image ? '<img class="hc-weapon" src="' + esc(image) + '" alt="" loading="lazy" decoding="async" onerror="this.style.visibility=\'hidden\'">' : '<span></span>') +
        '<div class="hc-body"><div class="hc-top"><span class="hc-author"><i class="hc-avatar">' + esc(initials(item.alias)) + '</i>' + esc(item.alias) + '</span>' +
        '<span class="hc-kind">' + esc(contextFor(item, weapon)) + '</span></div><strong class="hc-weapon-name">' + esc(weapon.nombre) + '</strong></div>' +
        '<div class="hc-bottom"><span class="hc-code">' + esc(item.codigo_clase) + '</span>' +
        '<button class="hc-copy" type="button" data-code="' + esc(item.codigo_clase) + '">Copiar</button></div></article>';
    }).join('');

    rail.querySelectorAll('.hc-copy').forEach(function (button) {
      button.addEventListener('click', function () {
        var code = button.getAttribute('data-code') || '';
        if (!code || !navigator.clipboard) return;
        navigator.clipboard.writeText(code).then(function () {
          button.textContent = 'Copiado';
          window.setTimeout(function () { button.textContent = 'Copiar'; }, 1300);
        }).catch(function () {});
      });
    });
    section.hidden = false;
  }

  document.querySelectorAll('[data-hc-nav]').forEach(function (button) {
    button.addEventListener('click', function () {
      var direction = button.getAttribute('data-hc-nav') === 'next' ? 1 : -1;
      rail.scrollBy({ left: direction * Math.max(250, rail.clientWidth * 0.78), behavior: 'smooth' });
    });
  });

  Promise.all([
    fetch('/community-editorial.json', { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }),
    fetch('/armas-data.json', { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; })
  ]).then(function (result) {
    var editorial = result[0];
    var catalog = result[1];
    if (!editorial || !catalog || !Array.isArray(editorial.loadouts) || !catalog.armas) return;
    render(editorial.loadouts, catalog.armas);
  }).catch(function () {});
})();
