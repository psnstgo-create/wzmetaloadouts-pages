/* ════════════════════════════════════════════
   server-status.js — Estado de los servidores en el footer
   Lee server_status.json (actualizado cada pocos minutos por el
   scraper, con estado independiente por juego en data.activision)
   y muestra un banner horizontal por juego (BO7 / Warzone) al
   principio del <footer>, en todas las páginas del sitio. Si hay
   una caída activa, además muestra un banner de alerta arriba del
   contenido principal.
   ════════════════════════════════════════════ */

function _ssEscapeHtml(s) {
    return (s || '').toString().replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

const _SS_JUEGOS = [
    [/black ops 7/i, { logoHtml: 'BO<b>7</b>', titulo: 'Servidor BO7', tema: 'bo7' }],
    [/warzone/i, { logoHtml: 'WARZONE', titulo: 'Servidor Warzone', tema: 'wz' }],
];
function _ssInfoJuego(nombre) {
    for (const [re, info] of _SS_JUEGOS) if (re.test(nombre)) return info;
    const corto = (nombre || '?').replace(/^call of duty:?\s*/i, '');
    return { logoHtml: _ssEscapeHtml(corto.toUpperCase()), titulo: `Servidor ${corto}`, tema: 'bo7' };
}

// ok: estado OK y sin eventos activos · deg: hay eventos activos (degradado,
// no caido del todo) · down: estado distinto de OK y sin eventos
function _ssEstadoJuego(info) {
    const ok = !!info && info.estado === 'OK';
    const evts = (info && info.eventos_activos) || [];
    if (ok && !evts.length) return 'ok';
    if (evts.length) return 'deg';
    return 'down';
}
const _SS_TXT_STATUS = { ok: 'Operativo', deg: 'Degradado', down: 'Caído' };
const _SS_TXT_SUB = {
    ok: 'Todos los sistemas funcionando',
    deg: 'Reportando problemas intermitentes',
    down: 'Servicio interrumpido',
};
const _SS_ICONS = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>',
    deg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>',
};

// ── Banners horizontales por juego en el footer, con link a
// /servidores para el detalle completo ──
function renderServerStatusPill(data) {
    let wrap = document.getElementById('server-status-pill-wrap');
    const juegos = data && data.activision && typeof data.activision === 'object'
        ? Object.entries(data.activision)
        : null;

    if (!juegos || !juegos.length) {
        if (wrap) wrap.remove();
        return;
    }

    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'server-status-pill-wrap';
        wrap.className = 'srv-banners';
        const footer = document.querySelector('footer');
        if (footer) {
            footer.insertBefore(wrap, footer.firstChild);
        } else {
            document.body.appendChild(wrap);
        }
    }

    wrap.innerHTML = juegos.map(([nombre, info]) => {
        const est = _ssEstadoJuego(info);
        const j = _ssInfoJuego(nombre);
        const estCls = est === 'ok' ? '' : ` ${est}`;
        return `
        <a class="srv-banner ${j.tema}${estCls}" href="/servidores" title="${_ssEscapeHtml(nombre)}">
            <div class="srv-banner-effects" aria-hidden="true"></div>
            <span class="srv-banner-logo">${j.logoHtml}</span>
            <span class="srv-banner-body">
                <span class="srv-banner-name">${_ssEscapeHtml(j.titulo)}</span>
                <span class="srv-banner-state">${_SS_TXT_STATUS[est]}</span>
                <span class="srv-banner-msg">${_SS_TXT_SUB[est]}</span>
            </span>
            <span class="srv-banner-orb">${_SS_ICONS[est]}</span>
        </a>`;
    }).join('');
}

// ── Banner de alerta (solo si hay caída activa) ──
function renderServerStatusBanner(data) {
    let banner = document.getElementById('server-status-banner');

    if (data.estado !== 'ALERTA') {
        if (banner) banner.remove();
        return;
    }

    const eventos = (data.eventos_activos || []).slice(0, 2);
    const tweets = (data.tweets_recientes || []).slice(0, 1);

    let detalles;
    if (eventos.length > 0) {
        detalles = _ssEscapeHtml(eventos[0].texto || '').substring(0, 200);
        if (detalles.length === 200) detalles += '…';
    } else if (tweets.length > 0) {
        detalles = _ssEscapeHtml(tweets[0].texto || '').substring(0, 200);
    } else {
        detalles = 'Activision investiga problemas en los servidores.';
    }

    let haceCuanto = '';
    try {
        const minutos = Math.floor((new Date() - new Date(data.timestamp)) / 60000);
        haceCuanto = minutos < 60 ? `hace ${minutos} min` : `hace ${Math.floor(minutos / 60)}h`;
    } catch (e) { /* sin fecha valida */ }

    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'server-status-banner';
        banner.className = 'server-status-banner';
        const main = document.querySelector('main') || document.body;
        main.prepend(banner);
    }

    banner.innerHTML = `
        <div class="ssb-icon">⚠</div>
        <div class="ssb-content">
            <div class="ssb-title">CAÍDA DETECTADA EN SERVIDORES <span class="ssb-time">${haceCuanto}</span></div>
            <div class="ssb-detail">${detalles}</div>
            <a href="https://support.activision.com/es/onlineservices" target="_blank" rel="noopener noreferrer" class="ssb-link">Ver detalles oficiales →</a>
        </div>
        <button class="ssb-close" id="ssb-close" aria-label="Cerrar">×</button>
    `;

    const closeBtn = document.getElementById('ssb-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.style.display = 'none';
            try { sessionStorage.setItem('ssb_dismissed', data.timestamp); } catch (e) {}
        });
    }
    try {
        if (sessionStorage.getItem('ssb_dismissed') === data.timestamp) banner.style.display = 'none';
    } catch (e) {}
}

(function initServerStatus() {
    async function check() {
        try {
            const res = await fetch('/server_status.json?v=' + Date.now());
            if (!res.ok) return;
            const data = await res.json();
            renderServerStatusPill(data);
            renderServerStatusBanner(data);
        } catch (err) {
            console.warn('[SERVER-STATUS] no disponible:', err);
        }
    }
    check();
    setInterval(check, 5 * 60 * 1000);
})();
