/* ══════════════════════════════════════════════════════════
   seo-enhance.js  ·  v2
   Mejoras SEO on-page para las páginas de arma (/armas/{slug}.html):
   1) Bloque FAQ visible (acordeón <details>) con preguntas long-tail
      → contenido real indexable que ataca búsquedas de cola larga
   2) H1 enriquecido con keyword ("{Arma} Warzone — Mejor clase y accesorios")

   (Sin FAQPage JSON-LD: el rich result "People Also Ask" está prácticamente
   deprecado para sitios no autoritativos, así que no se agrega relleno.)

   PRINCIPIO DE HONESTIDAD: todas las respuestas se derivan de datos reales
   de meta_warzone.json (clase recomendada, modos, ranking, tipo/alcance).
   No se inventa nada. Si falta un dato, esa pregunta se omite.

   Patrón calcado de meta-verdict-render.js: slug del pathname → fetch JSON →
   render + inyección, sin tocar los otros renderers.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var META_URL = '/meta_warzone.json';
  var MOUNT_ID = 'wz-faq';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getSlug() {
    var m = window.location.pathname.match(/\/armas\/([a-z0-9\-]+)(?:\.html)?\/?$/i);
    if (m) return m[1].toLowerCase();
    if (window.WEAPON_SLUG) return String(window.WEAPON_SLUG).toLowerCase();
    return null;
  }

  // slugify alineado 1:1 con meta-core.js (norm + alias)
  var SLUG_ALIAS = { 'cincelador-vst': 'vst', 'executioner-s-duet': 'executioners-duet' };
  function norm(s) {
    return (s || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function slugify(nombre) {
    var base = norm(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return SLUG_ALIAS[base] || base;
  }

  var MODO_LABEL = {
    battle_royale: 'Battle Royale',
    resurgence: 'Resurgence',
    clasificatorio: 'Clasificatorio (Ranked)',
    black_ops_royale: 'Black Ops Royale'
  };
  function modosTexto(modos) {
    var arr = (modos || []).map(function (m) { return MODO_LABEL[m] || m; }).filter(Boolean);
    if (!arr.length) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  }

  // Construye la lista de preguntas/respuestas SOLO desde datos reales.
  function buildFaqs(arma) {
    var nombre = arma.arma;
    var tipo = (arma.tipo_arma || '').toLowerCase();
    var cat = arma.categoria_tactica || '';
    var modos = arma.modos || [];
    var att = Array.isArray(arma.attachments) ? arma.attachments : [];
    var ranking = arma.ranking;
    var faqs = [];

    // 1) Mejor clase (desde el loadout recomendado real)
    if (att.length) {
      var lista = att.map(function (a) {
        var nivel = a.nivel && a.nivel !== '—' ? ' (nivel ' + esc(a.nivel) + ')' : '';
        return esc(a.slot) + ': ' + esc(a.item) + nivel;
      }).join('; ');
      faqs.push({
        q: '¿Cuál es la mejor clase del ' + nombre + ' en Warzone Black Ops 7?',
        a: 'La clase meta del ' + esc(nombre) + ' usa estos accesorios verificados — ' + lista + '. Es el build recomendado en esta página, con sus niveles de desbloqueo.'
      });
    } else {
      faqs.push({
        q: '¿Cuál es la mejor clase del ' + nombre + ' en Warzone Black Ops 7?',
        a: 'El ' + esc(nombre) + ' es competitivo de base. Todavía no hay una clase de accesorios verificada publicada para esta arma; en cuanto se confirme un build, aparece en esta página.'
      });
    }

    // 2) Modos recomendados
    var mt = modosTexto(modos);
    if (mt) {
      faqs.push({
        q: '¿En qué modos se recomienda el ' + nombre + '?',
        a: 'El ' + esc(nombre) + ' se recomienda para ' + esc(mt) + ', según el meta actual de Warzone.'
      });
    }

    // 3) Ranked / Clasificatorio
    var enRanked = modos.indexOf('clasificatorio') !== -1;
    faqs.push({
      q: '¿El ' + nombre + ' sirve para Ranked (Clasificatorio)?',
      a: enRanked
        ? 'Sí. El ' + esc(nombre) + ' figura entre las opciones recomendadas para Clasificatorio en el meta actual.'
        : 'Hoy el ' + esc(nombre) + ' se recomienda sobre todo para ' + esc(mt || 'Battle Royale') + ' y no figura en las clases de Clasificatorio del meta actual.'
    });

    // 4) Tipo / alcance  ("arma" como núcleo → concordancia femenina siempre correcta)
    if (tipo) {
      faqs.push({
        q: '¿Qué tipo de arma es el ' + nombre + ' y para qué alcance sirve?',
        a: 'El ' + esc(nombre) + ' es un arma de tipo ' + esc(arma.tipo_arma) + (cat ? ', orientada a ' + esc(cat) + '.' : '.')
      });
    }

    // 5) Posición en el meta
    if (typeof ranking === 'number' && ranking > 0) {
      var nuevo = arma.es_nuevo ? ' Es un arma nueva de la temporada.' : '';
      faqs.push({
        q: '¿El ' + nombre + ' está en el meta actual de Warzone?',
        a: 'En el ranking actual del meta, el ' + esc(nombre) + ' ocupa el puesto #' + ranking + '.' + nuevo
      });
    }

    return faqs;
  }

  function renderVisible(root, nombre, faqs) {
    var items = faqs.map(function (f, i) {
      return '<details class="faq-item"' + (i === 0 ? ' open' : '') + '>' +
        '<summary class="faq-q">' + esc(f.q) +
        '<svg class="faq-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
        '</summary>' +
        '<div class="faq-a">' + f.a + '</div>' +
        '</details>';
    }).join('');
    root.innerHTML = '<section class="faq-widget" aria-label="Preguntas frecuentes">' +
      '<header class="faq-head"><h2 class="faq-title">Preguntas frecuentes — ' + esc(nombre) + '</h2>' +
      '<p class="faq-sub">Respuestas basadas en los datos del meta actual</p></header>' +
      items + '</section>';
  }

  function enrichH1(nombre) {
    var h1 = document.querySelector('h1');
    if (!h1) return;
    var t = (h1.textContent || '').trim();
    // solo enriquecer si está "pelado" (no contiene ya "Warzone")
    if (/warzone/i.test(t)) return;
    h1.textContent = nombre + ' Warzone — Mejor clase y accesorios';
  }

  function injectStyles() {
    if (document.getElementById('faq-styles')) return;
    var css =
    '.faq-widget{--muted:rgba(235,240,245,.6);--gold:#ffd21f;max-width:900px;margin:40px auto;color:#eef2f5;' +
    "font-family:'Rajdhani',system-ui,sans-serif;border:1px solid rgba(255,255,255,.13);border-left:4px solid var(--gold);" +
    'border-radius:16px;padding:22px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.12)),#0b1117}' +
    '.faq-widget *{box-sizing:border-box}' +
    '.faq-head{margin-bottom:14px}' +
    '.faq-title{margin:0;font-size:1.45rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;line-height:1}' +
    ".faq-sub{margin:6px 0 0;color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.72rem;letter-spacing:.02em}" +
    '.faq-item{border-top:1px solid rgba(255,255,255,.1);padding:2px 0}' +
    '.faq-item:first-of-type{border-top:none}' +
    '.faq-q{display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer;list-style:none;' +
    'padding:13px 0;font-weight:700;font-size:1.02rem;line-height:1.35;color:#eef2f5}' +
    '.faq-q::-webkit-details-marker{display:none}' +
    '.faq-chev{flex:0 0 auto;width:18px;height:18px;color:var(--muted);transition:transform .25s ease}' +
    '.faq-item[open] .faq-chev{transform:rotate(180deg)}' +
    '.faq-a{padding:0 0 14px;color:#d8dee4;font-size:.96rem;line-height:1.5}' +
    '@media(max-width:600px){.faq-widget{padding:18px 15px;margin:24px auto}.faq-title{font-size:1.25rem}.faq-q{font-size:.96rem}}';
    if (!document.getElementById('wo-fonts')) {
      var l = document.createElement('link');
      l.id = 'wo-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap';
      document.head.appendChild(l);
    }
    var tag = document.createElement('style');
    tag.id = 'faq-styles'; tag.textContent = css;
    document.head.appendChild(tag);
  }

  function resolveMount() {
    var el = document.getElementById(MOUNT_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = MOUNT_ID;
    var footer = document.querySelector('footer') || document.querySelector('.bnav');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(el, footer);
    else (document.querySelector('main') || document.body).appendChild(el);
    return el;
  }

  async function init() {
    var slug = getSlug();
    if (!slug) return;
    var meta = null;
    try {
      var r = await fetch(META_URL, { cache: 'no-store' });
      if (!r.ok) return;
      meta = await r.json();
    } catch (e) { return; }
    if (!Array.isArray(meta)) return;

    var arma = null;
    for (var i = 0; i < meta.length; i++) {
      if (slugify(meta[i].arma) === slug) { arma = meta[i]; break; }
    }
    if (!arma) return;

    // Ranking CANONICO del sitio (_autoRank, el mismo del header de la ficha
    // y del home). El ranking crudo del scraper ordena distinto y generaba
    // FAQs contradictorias con el resto del dominio (malo para SEO).
    try {
      var rd = await fetch('/armas-data.json', { cache: 'no-store' });
      if (rd.ok) {
        var dd = await rd.json();
        var propio = dd && dd.armas && dd.armas[slug];
        if (propio && typeof propio._autoRank === 'number' && propio._autoRank > 0) {
          arma.ranking = propio._autoRank;
        }
      }
    } catch (e) { /* sin armas-data: se mantiene el ranking del meta */ }

    // meta_warzone.json (el robot) a veces guarda el nombre en MAYUSCULAS
    // ("GRIMHAWK", "EXECUTIONER'S DUET") aunque el arma tenga un nombre
    // propio en Title Case. El <h1> original ya lo trae bien capitalizado
    // (viene de armas-data.json vía arma-render.js), así que se usa ESE
    // texto como fuente de verdad para el nombre mostrado en FAQ/H1.
    var h1Original = document.querySelector('h1');
    var nombreReal = h1Original && h1Original.textContent.trim();
    if (nombreReal) arma.arma = nombreReal;

    var faqs = buildFaqs(arma);
    if (!faqs.length) return;

    injectStyles();
    renderVisible(resolveMount(), arma.arma, faqs);
    enrichH1(arma.arma);
  }

  window.__seoEnhanceInit = init;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
