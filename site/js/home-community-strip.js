/* Clases destacadas en la home. Separa aportes de la comunidad de las
   clases verificadas de creadores y mantiene ambos feeds dentro del sitio. */
(function () {
  'use strict';

  var section = document.getElementById('homeCommunityStrip');
  var communityRail = document.getElementById('homeCommunityRail');
  var creatorRail = document.getElementById('homeCreatorRail');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hc-feed]'));
  var communityPanel = document.getElementById('hcPanelCommunity');
  var creatorPanel = document.getElementById('hcPanelCreators');
  var creatorCount = document.getElementById('hcCreatorCount');
  var scrollingRails = [];
  if (!section || !communityRail || !creatorRail || !communityPanel || !creatorPanel) return;

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

  function safeAvatar(value) {
    return typeof value === 'string' && /^https:\/\/[A-Za-z0-9.-]+\//.test(value);
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
    if (/suppressor|silenciador/i.test(value)) return 'SUP';
    if (/brake|freno/i.test(value)) return 'BRK';
    if (/barrel|cañón/i.test(value)) return 'BAR';
    if (/mag|drum|cargador|tambor/i.test(value)) return 'MAG';
    if (/stock|pad|culata|almohadilla/i.test(value)) return 'STK';
    if (/grip|handstop|handguard|foregrip|empuñadura|acople/i.test(value)) return 'GRP';
    if (/laser/i.test(value)) return 'LSR';
    return value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'MOD';
  }

  function safeAttachmentBase(value) {
    return typeof value === 'string' && /^\/icons\/attachments\/[a-z0-9-]+$/.test(value);
  }

  function attachmentFilename(name) {
    return String(name || '').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
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

  function avatarMarkup(item, creator) {
    var alias = creator ? creator.name : item.alias;
    var avatar = creator && safeAvatar(creator.avatar) ? creator.avatar : '';
    if (avatar) {
      return '<img class="hc-avatar hc-avatar--image" src="' + esc(avatar) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">';
    }
    return '<i class="hc-avatar hc-tone-' + avatarTone(alias) + '">' + esc(initials(alias)) + '</i>';
  }

  function cardMarkup(item, weapon, creator, duplicate) {
    var isCreator = Boolean(creator);
    var alias = isCreator ? creator.name : item.alias;
    var image = safeImage(weapon.imagen) ? weapon.imagen : '';
    var hidden = duplicate ? ' aria-hidden="true"' : '';
    var tabIndex = duplicate ? ' tabindex="-1"' : '';
    var region = isCreator && creator.region ? '<span class="hc-region">' + esc(creator.region) + '</span>' : '';
    return '<article class="hc-card' + (isCreator ? ' hc-card--creator' : '') + (duplicate ? ' hc-card--copy' : '') + '"' + hidden + '>' +
      '<a class="hc-card-link" href="' + communityHref(item) + '" aria-label="Ver clase de ' + esc(alias) + ' para ' + esc(weapon.nombre) + '"' + tabIndex + '></a>' +
      '<div class="hc-card-accent" aria-hidden="true"></div>' +
      (image ? '<img class="hc-weapon" src="' + esc(image) + '" alt="" loading="lazy" decoding="async" onerror="this.style.visibility=\'hidden\'">' : '<span></span>') +
      '<div class="hc-body"><div class="hc-top"><span class="hc-author">' + avatarMarkup(item, creator) + '<span>' + esc(alias) + region + '</span></span>' +
      (isCreator ? '<span class="hc-verified" title="Clase verificada">✓ CREADOR</span>' : '<span class="hc-kind">' + esc(contextFor(item, weapon)) + '</span>') +
      '</div><strong class="hc-weapon-name">' + esc(weapon.nombre) + '</strong>' + attachmentsMarkup(item, weapon) + '</div>' +
      '<div class="hc-bottom"><span class="hc-code"><small>CÓDIGO</small>' + esc(item.codigo_clase) + '</span>' +
      '<button class="hc-copy" type="button" data-code="' + esc(item.codigo_clase) + '"' + tabIndex + '>Copiar</button></div></article>';
  }

  function isComplete(item, weapons) {
    return item && safeSlug(item.arma_slug) && weapons[item.arma_slug] &&
      typeof item.alias === 'string' && typeof item.codigo_clase === 'string' && item.codigo_clase.trim() &&
      item.accesorios && Object.keys(item.accesorios).length === 5;
  }

  function renderRail(rail, cards, weapons, creatorsById) {
    if (!cards.length) return false;
    var originals = cards.map(function (item) {
      return cardMarkup(item, weapons[item.arma_slug], creatorsById[item.creator_id] || null, false);
    }).join('');
    var copies = cards.map(function (item) {
      return cardMarkup(item, weapons[item.arma_slug], creatorsById[item.creator_id] || null, true);
    }).join('');
    // Tres vueltas garantizan movimiento continuo incluso si solo hay dos creadores.
    rail.innerHTML = originals + copies + copies;
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
    return true;
  }

  function startAutoScroll(rail) {
    if (!rail || scrollingRails.indexOf(rail) !== -1) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scrollingRails.push(rail);
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
      var firstCard = rail.querySelector('.hc-card:not(.hc-card--copy)');
      var firstCopy = rail.querySelector('.hc-card--copy');
      var cycleWidth = firstCard && firstCopy ? firstCopy.offsetLeft - firstCard.offsetLeft : 0;
      if (!paused && !document.hidden && cycleWidth > 0 && rail.offsetParent !== null) {
        position += elapsed * 0.014;
        if (position >= cycleWidth) position -= cycleWidth;
        rail.scrollLeft = position;
      }
      window.requestAnimationFrame(frame);
    }
    rail.addEventListener('focusin', pause);
    rail.addEventListener('focusout', resumeSoon);
    rail.addEventListener('mouseenter', pause);
    rail.addEventListener('mouseleave', resumeSoon);
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('touchend', resumeSoon, { passive: true });
    rail.addEventListener('scroll', function () {
      if (Math.abs(rail.scrollLeft - position) > 3) position = rail.scrollLeft;
    }, { passive: true });
    window.requestAnimationFrame(frame);
  }

  function selectFeed(feed) {
    var creators = feed === 'creators';
    communityPanel.hidden = creators;
    creatorPanel.hidden = !creators;
    tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-hc-feed') === feed;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    window.requestAnimationFrame(function () { startAutoScroll(creators ? creatorRail : communityRail); });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { selectFeed(tab.getAttribute('data-hc-feed')); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var next = tab === tabs[0] ? tabs[1] : tabs[0];
      next.focus();
      next.click();
    });
  });

  Promise.all([
    fetch('/community-editorial.json', { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }),
    fetch('/armas-data.json', { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }),
    fetch('/creator-radar.json', { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; })
  ]).then(function (result) {
    var editorial = result[0];
    var catalog = result[1];
    var radar = result[2];
    if (!editorial || !catalog || !Array.isArray(editorial.loadouts) || !catalog.armas) return;
    var creatorsById = {};
    var creators = radar && Array.isArray(radar.creators) ? radar.creators : [];
    creators.forEach(function (creator) { creatorsById[String(creator.id || '')] = creator; });
    var complete = editorial.loadouts.filter(function (item) { return isComplete(item, catalog.armas); });
    var creatorCards = complete.filter(function (item) { return item.creator_id && creatorsById[item.creator_id]; }).slice(0, 9);
    var communityCards = complete.filter(function (item) { return !item.creator_id; }).slice(0, 9);
    var hasCommunity = renderRail(communityRail, communityCards, catalog.armas, creatorsById);
    var hasCreators = renderRail(creatorRail, creatorCards, catalog.armas, creatorsById);
    if (!hasCommunity && !hasCreators) return;
    if (creatorCount && hasCreators) creatorCount.textContent = creatorCards.length;
    var creatorTab = document.getElementById('hcTabCreators');
    if (creatorTab) creatorTab.hidden = !hasCreators;
    section.hidden = false;
    selectFeed(hasCommunity ? 'community' : 'creators');
  }).catch(function () {});
})();
