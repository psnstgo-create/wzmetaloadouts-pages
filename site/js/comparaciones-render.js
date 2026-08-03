/* ══════════════════════════════════════════════════════════
   comparaciones-render.js  ·  v1
   En las páginas de arma (/armas/{slug}.html), muestra los links a
   las páginas de comparación 1-a-1 que existen para esa arma
   (/comparar/{slug}-vs-{otro}.html — ver _build/generar_paginas_comparacion.py).

   Solo aparece si el arma tiene al menos una comparación generada
   (index en /comparaciones-index.json). Si no hay ninguna, no se
   monta nada — nunca se anuncia una funcionalidad vacía.

   Patrón calcado de seo-enhance.js: slug del pathname → fetch JSON →
   render + inyección, sin tocar los otros renderers.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var INDEX_URL = '/comparaciones-index.json';
  var MOUNT_ID = 'wz-comparaciones';

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

  function nombreArma() {
    var h1 = document.querySelector('h1');
    var t = h1 && h1.textContent.trim();
    if (!t) return '';
    // el H1 puede venir enriquecido por seo-enhance.js ("X Warzone — Mejor clase...")
    return t.split(' Warzone')[0].trim();
  }

  function renderVisible(root, nombre, comparaciones) {
    var pills = comparaciones.map(function (c) {
      return '<a class="cmpr-pill" href="/comparar/' + esc(c.pareja) + '">' +
        'VS ' + esc(c.rival) + '</a>';
    }).join('');
    root.innerHTML = '<section class="cmpr-widget" aria-label="Comparaciones con otras armas">' +
      '<header class="cmpr-head"><h2 class="cmpr-title">¿Cómo se compara ' + esc(nombre) + '?</h2>' +
      '<p class="cmpr-sub">Comparaciones cabeza a cabeza con datos verificados</p></header>' +
      '<div class="cmpr-grid">' + pills + '</div></section>';
  }

  function injectStyles() {
    if (document.getElementById('cmpr-styles')) return;
    var css =
      '.cmpr-widget{--muted:rgba(235,240,245,.6);--gold:#ffd21f;max-width:900px;margin:24px auto;color:#eef2f5;' +
      "font-family:'Rajdhani',system-ui,sans-serif;border:1px solid rgba(255,255,255,.13);border-left:4px solid var(--gold);" +
      'border-radius:16px;padding:22px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.12)),#0b1117}' +
      '.cmpr-widget *{box-sizing:border-box}' +
      '.cmpr-head{margin-bottom:14px}' +
      '.cmpr-title{margin:0;font-size:1.3rem;font-weight:700;letter-spacing:.02em;text-transform:uppercase;line-height:1.2}' +
      ".cmpr-sub{margin:6px 0 0;color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.72rem;letter-spacing:.02em}" +
      '.cmpr-grid{display:flex;flex-wrap:wrap;gap:9px}' +
      ".cmpr-pill{font-family:'Share Tech Mono',monospace;font-size:.74rem;letter-spacing:.04em;color:#eef2f5;" +
      'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);border-radius:20px;padding:9px 16px;' +
      'text-decoration:none;transition:.15s}' +
      '.cmpr-pill:hover{border-color:var(--gold);color:var(--gold);background:rgba(255,210,31,.08)}' +
      '@media(max-width:600px){.cmpr-widget{padding:18px 15px;margin:18px auto}.cmpr-title{font-size:1.1rem}}';
    var tag = document.createElement('style');
    tag.id = 'cmpr-styles'; tag.textContent = css;
    document.head.appendChild(tag);
  }

  function resolveMount() {
    var el = document.getElementById(MOUNT_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = MOUNT_ID;
    // se monta justo despues del bloque FAQ si existe, para mantener el orden
    // Loadouts -> Stats oficiales -> Veredicto meta -> FAQ -> Comparaciones -> footer
    var faq = document.getElementById('wz-faq');
    var footer = document.querySelector('footer') || document.querySelector('.bnav');
    if (faq && faq.parentNode) faq.parentNode.insertBefore(el, faq.nextSibling);
    else if (footer && footer.parentNode) footer.parentNode.insertBefore(el, footer);
    else (document.querySelector('main') || document.body).appendChild(el);
    return el;
  }

  async function init() {
    var slug = getSlug();
    if (!slug) return;
    var indice = null;
    try {
      var r = await fetch(INDEX_URL, { cache: 'no-store' });
      if (!r.ok) return;
      indice = await r.json();
    } catch (e) { return; }
    if (!indice || typeof indice !== 'object') return;

    var comparaciones = indice[slug];
    if (!Array.isArray(comparaciones) || !comparaciones.length) return; // sin comparaciones -> no se anuncia nada

    var nombre = nombreArma();
    if (!nombre) return;

    injectStyles();
    renderVisible(resolveMount(), nombre, comparaciones);
  }

  window.__comparacionesInit = init;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
