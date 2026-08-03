// ════════════════════════════════════════════
//   NOTICIAS.JS — v2 Promise-based init
//   Sin race conditions, garantiza render correcto
// ════════════════════════════════════════════

let noticiasIndex = null;
let noticiasError = null;

// ═══ Promise pública que el HTML puede esperar ═══
// Se resuelve cuando el JSON terminó de cargar (éxito O error)
window.noticiasReady = (async function cargarNoticias() {
    try {
        const res = await fetch('noticias-index.json?v=' + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        noticiasIndex = await res.json();
        console.log('[NOTICIAS] Cargadas:', noticiasIndex.length);
        return noticiasIndex;
    } catch (err) {
        console.error('[NOTICIAS] Error cargando índice:', err);
        noticiasError = err;
        noticiasIndex = [];
        return [];
    }
})();

const CAT_LABELS = {
    'temporadas': { label: 'TEMPORADAS', color: '#FF9500', emoji: '📅' },
    'meta':       { label: 'META',       color: '#00FF87', emoji: '⚖️' },
    'eventos':    { label: 'EVENTOS',    color: '#00A8FF', emoji: '🎮' },
    'noticias':   { label: 'NOTICIAS',   color: '#BF5FFF', emoji: '📰' }
};

function renderCardDestacada(n) {
    const cat = CAT_LABELS[n.categoria] || CAT_LABELS.noticias;
    const imgHtml = n.imagen
        ? `<img src="${n.imagen}" alt="${n.titulo}" class="hero-news-img">`
        : `<div class="hero-news-placeholder">
                <div class="hero-news-placeholder-icon">${cat.emoji}</div>
           </div>`;

    return `
    <a href="${n.url}" class="hero-news">
        <div class="hero-news-visual">
            ${imgHtml}
            <div class="hero-news-overlay">
                <span class="hero-news-cat" style="background:${cat.color}22;color:${cat.color};border-color:${cat.color}66">
                    ⭐ DESTACADA · ${cat.emoji} ${cat.label}
                </span>
                <h2 class="hero-news-titulo">${n.titulo}</h2>
                <p class="hero-news-resumen">${n.resumen || ''}</p>
                <div class="hero-news-meta">
                    <span class="hero-news-fecha">${n.fecha_legible}</span>
                    <span class="hero-news-leer">LEER MÁS →</span>
                </div>
            </div>
        </div>
    </a>`;
}

function renderCardMini(n) {
    const cat = CAT_LABELS[n.categoria] || CAT_LABELS.noticias;
    const imgHtml = n.imagen
        ? `<img src="${n.imagen}" alt="${n.titulo}" class="card-news-img">`
        : `<div class="card-news-placeholder">
                <div class="card-news-placeholder-icon">${cat.emoji}</div>
           </div>`;

    return `
    <a href="${n.url}" class="card-news">
        <div class="card-news-visual">
            ${imgHtml}
            <span class="card-news-cat" style="background:${cat.color}22;color:${cat.color};border-color:${cat.color}66">
                ${cat.emoji} ${cat.label}
            </span>
        </div>
        <div class="card-news-body">
            <h3 class="card-news-titulo">${n.titulo}</h3>
            <p class="card-news-resumen">${n.resumen || ''}</p>
            <div class="card-news-meta">
                <span class="card-news-fecha">${n.fecha_legible}</span>
                <span class="card-news-leer">→</span>
            </div>
        </div>
    </a>`;
}

function renderNoticias() {
    const container = document.getElementById('noticias-container');
    if (!container) return;

    // Estado: error de red
    if (noticiasError) {
        container.innerHTML = `
            <div style="text-align:center;padding:80px 24px;font-family:var(--font-mono);color:#EF4444;font-size:14px;letter-spacing:2px">
                ⚠️ ERROR AL CARGAR NOTICIAS<br>
                <span style="font-size:11px;color:var(--text-dim);margin-top:10px;display:block">Verifica tu conexión o intenta refrescar (Ctrl+Shift+R)</span>
            </div>`;
        return;
    }

    // Estado: sin noticias (vacío legítimo)
    if (!noticiasIndex || noticiasIndex.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:80px 24px;font-family:var(--font-mono);color:var(--text-muted);font-size:14px;letter-spacing:2px">
                📭 SIN NOTICIAS POR AHORA<br>
                <span style="font-size:11px;color:var(--text-dim);margin-top:10px;display:block">Próximamente actualizaciones del meta y temporadas</span>
            </div>`;
        return;
    }

    // Estado: render normal
    const destacada = noticiasIndex.find(n => n.destacada) || noticiasIndex[0];
    const resto = noticiasIndex.filter(n => n.slug !== destacada.slug);

    container.innerHTML = `
        ${renderCardDestacada(destacada)}
        ${resto.length > 0 ? `
            <div class="news-section">
                <h3 class="news-section-title">📰 ÚLTIMAS NOTICIAS</h3>
                <div class="news-grid">
                    ${resto.map(n => renderCardMini(n)).join('')}
                </div>
            </div>
        ` : ''}
    `;

    inyectarSchemaNoticias(destacada, resto);
}

// Schema.org BreadcrumbList + CollectionPage/ItemList del listado de
// noticias — la pagina no tenia nada de schema estructurado.
function inyectarSchemaNoticias(destacada, resto) {
    const ordenNoticias = [destacada, ...resto].filter(n => n && n.url);
    const abs = u => u.startsWith('http') ? u : `https://wzmetaloadouts.com${u.startsWith('/') ? '' : '/'}${u}`;
    const schema = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://wzmetaloadouts.com/" },
                { "@type": "ListItem", "position": 2, "name": "Noticias", "item": "https://wzmetaloadouts.com/noticias" }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Noticias Warzone y Black Ops 7",
            "url": "https://wzmetaloadouts.com/noticias",
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": ordenNoticias.length,
                "itemListElement": ordenNoticias.map((n, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": n.titulo,
                    "url": abs(n.url)
                }))
            }
        }
    ];
    document.querySelectorAll('script[data-schema="noticias"]').forEach(el => el.remove());
    schema.forEach(obj => {
        const tag = document.createElement('script');
        tag.type = 'application/ld+json';
        tag.dataset.schema = 'noticias';
        tag.textContent = JSON.stringify(obj);
        document.head.appendChild(tag);
    });
}

// ═══ Auto-render cuando el fetch termina ═══
// Si el HTML ya está listo, renderiza inmediatamente al terminar el fetch.
// Si el HTML aún no está listo, el HTML hará await de noticiasReady (más abajo).
window.noticiasReady.then(() => {
    if (document.readyState === 'loading') {
        // El DOM aún no está listo, esperamos al evento
        document.addEventListener('DOMContentLoaded', renderNoticias);
    } else {
        // El DOM ya está listo, render inmediato
        renderNoticias();
    }
});
