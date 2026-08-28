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

  function communityHref(loadout) {
    var id = String(loadout && loadout.id || '');
    return id ? '/comunidad?clase=' + encodeURIComponent(id) + '#comGrid' : '/comunidad#comGrid';
  }

  function initials(alias) {
    return String(alias || '?').trim().slice(0, 2).toUpperCase();
  }

  function avatarTone(alias) {
    var tones = ['violet', 'cyan', 'lime', 'rose', 'amber'];
    var value = String(alias || '');
    var hash = 0;
    for (var i = 0; i < value.length; i += 1) hash = ((hash * 31) + value.charCodeAt(i)) >>> 0;
    return tones[hash % tones.length];
  }

  function shortAccessory(name) {
    var value = String(name || '').trim();
    if (/\bELO\b/i.test(value)) return 'ELO';
    if (/suppressor/i.test(value)) return 'SUP';
    if (/brake/i.test(value)) return 'BRK';
    if (/barrel/i.test(value)) {
      var size = value.match(/\d+(?:\.\d+)?\s*\"/);
      return size ? size[0].replace(/\s/g, '') : 'BAR';
    }
    if (/mag|drum/i.test(value)) return 'MAG';
    if (/stock|pad/i.test(value)) return 'STK';
    if (/grip|handstop|handguard|foregrip/i.test(value)) return 'GRP';
    if (/laser/i.test(value)) return 'LSR';
    return value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'MOD';
  }

  function safeAttachmentBase(value) {
    return typeof value === 'string' && /^\/icons\/attachments\/[a-z0-9-]+$/.test(value);
  }

  function attachmentFilename(name) {
    return String(name || '')
      .replace(/[<>:"/\\|?*]+/g, '')
      .replace(/\s+/g, '_');
  }

  function attachmentsMarkup(item, weapon) {
    if (!item.accesorios || typeof item.accesorios !== 'object') return '';
    var attachmentBase = safeAttachmentBase(weapon && weapon.icon_path) ? weapon.icon_path : '';
    var attachments = Object.keys(item.accesorios).slice(0, 5).map(function (type) {
      var name = String(item.accesorios[type] || '').trim();
      if (!name) return '';
      var image = attachmentBase ? attachmentBase + '/' + attachmentFilename(name) + '.png' : '';
      var fallback = image ? '' : ' hc-attachment--text';
      return '<span class="hc-attachment' + fallback + '" title="' + esc(type + ': ' + name) + '" aria-label="' + esc(type + ': ' + name) + '">' +
        (image ? '<img class="hc-attachment-icon" src="' + esc(image) + '" alt="" loading="lazy" decoding="async" onerror="this.remove();this.parentElement.classList.add(\'hc-attachment--text\')">' : '') +
        '<b>' + esc(shortAccessory(name)) + '</b></span>';
    }).filter(Boolean).join('');
    return attachments ? '<div class="hc-attachments" aria-label="Cinco accesorios de la clase">' + attachments + '</div>' : '';
  }

  function render(loadouts, weapons) {
    var cards = loadouts.filter(function (item) {
      return item && safeSlug(item.arma_slug) && weapons[item.arma_slug] &&
        typeof item.alias === 'string' && typeof item.codigo_clase === 'string' && item.codigo_clase;
    }).slice(0, 9);
    if (!cards.length) return;

    function cardMarkup(item, duplicate) {
      var weapon = weapons[item.arma_slug];
      var image = safeImage(weapon.imagen) ? weapon.imagen : '';
      var hidden = duplicate ? ' aria-hidden="true"' : '';
      var tabIndex = duplicate ? ' tabindex="-1"' : '';
      return '<article class="hc-card' + (duplicate ? ' hc-card--copy' : '') + '"' + hidden + '>' +
        '<a class="hc-card-link" href="' + communityHref(item) + '" aria-label="Ver clase compartida de ' + esc(weapon.nombre) + '"' + tabIndex + '></a>' +
        (image ? '<img class="hc-weapon" src="' + esc(image) + '" alt="" loading="lazy" decoding="async" onerror="this.style.visibility=\'hidden\'">' : '<span></span>') +
        '<div class="hc-body"><div class="hc-top"><span class="hc-author"><i class="hc-avatar hc-tone-' + avatarTone(item.alias) + '">' + esc(initials(item.alias)) + '</i>' + esc(item.alias) + '</span>' +
        '<span class="hc-kind">' + esc(contextFor(item, weapon)) + '</span></div><strong class="hc-weapon-name">' + esc(weapon.nombre) + '</strong>' + attachmentsMarkup(item, weapon) + '</div>' +
        '<div class="hc-bottom"><span class="hc-code">' + esc(item.codigo_clase) + '</span>' +
        '<button class="hc-copy" type="button" data-code="' + esc(item.codigo_clase) + '"' + tabIndex + '>Copiar</button></div></article>';
    }

    rail.innerHTML = cards.map(function (item) { return cardMarkup(item, false); }).join('') +
      cards.map(function (item) { return cardMarkup(item, true); }).join('');

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
    startAutoScroll();
  }

  function startAutoScroll() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var firstCard = rail.querySelector('.hc-card:not(.hc-card--copy)');
    var firstCopy = rail.querySelector('.hc-card--copy');
    if (!firstCard || !firstCopy) return;
    var cycleWidth = firstCopy.offsetLeft - firstCard.offsetLeft;
    if (!cycleWidth) return;

    var paused = false;
    var lastFrame = 0;
    var resumeTimer = 0;
    var position = rail.scrollLeft;
    function pause() {
      paused = true;
      window.clearTimeout(resumeTimer);
    }
    function resumeSoon() {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () { paused = false; }, 1800);
    }
    function frame(now) {
      if (!lastFrame) lastFrame = now;
      var elapsed = Math.min(now - lastFrame, 60);
      lastFrame = now;
      if (!paused && !document.hidden) {
        position += elapsed * 0.014;
        if (position >= cycleWidth) position -= cycleWidth;
        rail.scrollLeft = position;
      }
      window.requestAnimationFrame(frame);
    }
    rail.addEventListener('focusin', pause);
    rail.addEventListener('focusout', resumeSoon);
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('touchend', resumeSoon, { passive: true });
    rail.addEventListener('scroll', function () {
      if (Math.abs(rail.scrollLeft - position) > 3) position = rail.scrollLeft;
    }, { passive: true });
    window.requestAnimationFrame(frame);
  }

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
