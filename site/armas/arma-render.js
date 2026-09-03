/* ════════════════════════════════════════════
   arma-render.js — Motor de renderizado
   Lee armas-data.json y arma toda la página
   v2: auto-carga patches-render.js para mostrar
       historial de buffs/nerfs en todas las armas
   v3: auto-carga weapons-official-render.js para
       mostrar las estadísticas oficiales in-game
   v4: auto-carga meta-verdict-render.js para mostrar
       el Veredicto Meta (estado/momento/TTK desde parches)
   ════════════════════════════════════════════ */

// ── meta_warzone.json: misma fuente/prioridad que usan home.js y clases.js,
// para que la ficha del arma muestre EXACTAMENTE el mismo build que las
// tarjetas del home. Si el arma no esta ahi, se usa el loadout propio de
// armas-data.json (generado por _build/score_builds.py) como respaldo.
const _norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const _RE_OPTICA = /mira|óptica|optica|optic/i;
const _RE_LASER = /láser|laser/i;

async function cargarLoadoutMetaWarzone(arma) {
    // Si ya existe un build propio con descripcion real (score_builds.py:
    // texto honesto calculado de los mods reales, validado contra el
    // catalogo y las incompatibilidades del juego, con variantes por modo
    // BR/Resurgence/Ranked), ese manda en la ficha. Es mas confiable y mas
    // completo que el scrapeado externo, que ademas pisaba las 3 variantes
    // por modo con un solo build generico ("Build recomendado").
    if (Array.isArray(arma.loadouts) && arma.loadouts[0] && arma.loadouts[0].descripcion) {
        return arma;
    }
    try {
        const r = await fetch('/meta_warzone.json', { cache: 'no-cache' });
        if (!r.ok) return arma;
        const data = await r.json();
        const lista = Array.isArray(data) ? data : (data.armas || []);
        const entry = lista.find(a => _norm(a.arma || a.nombre) === _norm(arma.nombre));
        const atts = entry && (entry.attachments || entry.accesorios);
        if (!Array.isArray(atts) || !atts.length) return arma;

        // Sanity check contra nuestro build propio (codmunity, playstyle
        // verificado y matcheado al rango real del arma):
        //  1) esta fuente no pone mira pero el propio SI la tiene confirmada
        //     -> quedarse con el propio (ej. REV-46, Corto Alcance con mira real)
        //  2) esta fuente pone laser pero el propio (verificado sin ambiguedad)
        //     NO lo tiene -> quedarse con el propio (ej. Strider 300 / Hawker HX:
        //     el laser delata la posicion, mala eleccion en armas de precision;
        //     no se generaliza a todo sniper porque Shadow SK SI lo usa de verdad)
        const propioItems = Array.isArray(arma.loadouts) && arma.loadouts[0] ? arma.loadouts[0].items : null;
        const estaFuenteTieneOptica = atts.some(x => _RE_OPTICA.test(x.slot || x.tipo || ''));
        const propioTieneOptica = !!propioItems && propioItems.some(it => it.slot === 'Optic' || _RE_OPTICA.test(it.slot || it.label || ''));
        const estaFuenteTieneLaser = atts.some(x => _RE_LASER.test(x.slot || x.tipo || ''));
        const propioTieneLaser = !!propioItems && propioItems.some(it => it.slot === 'Laser' || _RE_LASER.test(it.slot || it.label || ''));

        const faltaOptica = !estaFuenteTieneOptica && propioTieneOptica;
        const laserDudoso = estaFuenteTieneLaser && !propioTieneLaser;
        if (faltaOptica || laserDudoso) {
            return arma;
        }

        const items = atts.map(x => ({
            slot: x.slot || x.tipo || '',
            label: x.slot || x.tipo || '',
            name: x.item || x.nombre || x.name || '',
            level: x.nivel || x.level || '',
        })).filter(it => it.name);
        if (!items.length) return arma;

        arma.loadouts = [{
            id: 'wz-meta',
            nombre: 'Meta WZ',
            emoji: '🎯',
            codigo: entry.codigo || '',
            descripcion: entry.fuente ? `Build recomendado — fuente: ${entry.fuente}` : 'Build recomendado',
            items,
        }];
    } catch (e) {
        console.warn('[ARMA] meta_warzone.json no disponible, uso loadout propio');
    }
    return arma;
}

const SLOT_TRANSLATIONS_ES = {
    "Muzzle": "Boca de Cañón",
    "Barrel": "Cañón",
    "Optic": "Óptica",
    "Underbarrel": "Empuñadura Delantera",
    "Magazine": "Cargador",
    "Stock": "Culata",
    "Rear Grip": "Empuñadura Trasera",
    "Laser": "Láser",
    "Fire Mods": "Modificaciones de Disparo",
    "Comb": "Mira (Comb)"
};

function slugSafe(s) {
    return (s || '').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
}

function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function tierBadgeClass(tier) {
    const t = (tier || '').toUpperCase();
    if (t === 'S') return 'tier-s';
    if (t === 'A') return 'tier-a';
    if (t === 'B') return 'tier-b';
    if (t === 'C') return 'tier-c';
    return '';
}

function renderHero(arma) {
    const tierClass = tierBadgeClass(arma.tier);
    const tierBadge = arma.tier && arma.tier !== '—'
        ? `<span class="hero-badge ${tierClass}">TIER ${arma.tier}</span>`
        : '';
    const dispRank = arma._autoRank || arma.ranking;
    const rankBadge = dispRank
        ? `<span class="hero-badge rank">#${dispRank} META</span>`
        : `<span class="hero-badge rank">CATÁLOGO</span>`;
    const stats = arma.stats || {};
    const statsHtml = Object.keys(stats).length > 0 ? `
        <div class="weapon-stats-grid">
            ${stats.rpm ? `<div class="stat-mini"><div class="label">RPM</div><div class="value">${escapeHtml(stats.rpm)}</div></div>` : ''}
            ${stats.ttk_cerca ? `<div class="stat-mini"><div class="label">TTK Cerca</div><div class="value">${escapeHtml(stats.ttk_cerca)}</div></div>` : ''}
            ${stats.vel_bala ? `<div class="stat-mini"><div class="label">Vel. Bala</div><div class="value">${escapeHtml(stats.vel_bala)}</div></div>` : ''}
            ${stats.movilidad ? `<div class="stat-mini"><div class="label">Movilidad</div><div class="value">${escapeHtml(stats.movilidad)}</div></div>` : ''}
        </div>
    ` : '';
    return `
        <section class="weapon-hero">
            <div>
                <h1>${escapeHtml(arma.nombre)}</h1>
                <p class="weapon-subtitle">${escapeHtml(arma.tipo)}${(arma.rango && arma.rango !== '—') ? ` · ${escapeHtml(arma.rango)}` : ''}</p>
                <div class="weapon-badges">
                    ${tierBadge}
                    <span class="hero-badge type">${escapeHtml(arma.tipo)}</span>
                    ${rankBadge}
                </div>
                ${statsHtml}
            </div>
            <div class="weapon-hero-image">
                <img src="${escapeHtml(arma.imagen)}" alt="${escapeHtml(arma.nombre)} Black Ops 7 Warzone"
                     onerror="this.style.opacity='0.3'">
            </div>
        </section>
    `;
}

function findAttachmentLevel(attachments, slot, name) {
    const list = attachments && attachments[slot];
    if (!list) return '';
    const found = list.find(a => a.name === name);
    return found ? (found.level || '') : '';
}


// Nombre en español para mostrar (meta-core traducirAccesorioES); el name
// original sigue siendo la clave para íconos y matching.
function nombreAccES(n) {
    return (typeof traducirAccesorioES === 'function') ? traducirAccesorioES(n) : n;
}
function renderLoadoutItem(item, iconPath, attachments) {
    const iconSrc = `${iconPath}/${slugSafe(item.name)}.png`;
    const levelText = item.level || findAttachmentLevel(attachments, item.slot, item.name);
    const isSpecial = levelText && isNaN(parseInt(levelText, 10));
    const levelHtml = levelText
        ? (isSpecial
            ? `<span class="att-level special" style="white-space:normal;overflow-wrap:anywhere;max-width:130px;text-align:right">${escapeHtml(levelText)}</span>`
            : `<span class="att-level" style="white-space:normal;overflow-wrap:anywhere;max-width:130px;text-align:right">NVL ${escapeHtml(levelText)}</span>`)
        : '<span class="att-level special" style="white-space:normal;overflow-wrap:anywhere;max-width:130px;text-align:right">UNIVERSAL</span>';
    return `
        <div class="attachment-card">
            <div class="att-icon-frame">
                <img src="${escapeHtml(iconSrc)}" alt="${escapeHtml(item.name)}" loading="lazy">
            </div>
            <div class="att-info">
                <div class="att-slot">${escapeHtml(item.label || item.slot)}</div>
                <div class="att-name">${escapeHtml(nombreAccES(item.name))}</div>
            </div>
            ${levelHtml}
        </div>
    `;
}

function renderLoadout(loadout, iconPath, idx, attachments) {
    const items = loadout.items.map(it => renderLoadoutItem(it, iconPath, attachments)).join('');
    const codigoBox = loadout.codigo ? `
        <div class="class-code-box">
            <div class="code-info">
                <div class="code-label">🔗 Código de Modelo</div>
                <div class="code-value" id="code-${loadout.id}">${escapeHtml(loadout.codigo)}</div>
            </div>
            <button class="copy-btn" onclick="copyCode('code-${loadout.id}', this)">
                <span>📋 Copiar</span>
            </button>
        </div>
    ` : '';
    const tip = loadout.descripcion ? `
        <div class="loadout-tip">
            <strong>Por qué este build:</strong> ${escapeHtml(loadout.descripcion)}
        </div>
    ` : '';
    return `
        <div class="loadout-content ${idx === 0 ? 'active' : ''}" data-loadout="${loadout.id}">
            <div class="loadout-grid">${items}</div>
            ${codigoBox}
            ${tip}
        </div>
    `;
}

function renderLoadoutsSection(arma) {
    if (!arma.loadouts || arma.loadouts.length === 0) {
        return '';
    }
    const tabs = arma.loadouts.map(l =>
        `<button class="loadout-tab ${arma.loadouts[0].id === l.id ? 'active' : ''}" data-loadout="${l.id}">${l.emoji || ''} ${escapeHtml(l.nombre)}</button>`
    ).join('');
    const contents = arma.loadouts.map((l, i) => renderLoadout(l, arma.icon_path, i, arma.attachments)).join('');
    return `
        <section class="loadouts-section">
            <h2 class="section-title">Mejores <span class="accent">Loadouts</span></h2>
            <p class="section-subtitle">Build óptimo según rol y rango de combate. Los 5 attachments marcados con ★ en la lista completa.</p>
            <div class="loadout-tabs">${tabs}</div>
            ${contents}
        </section>
    `;
}

function renderCommunityCta(arma, slug) {
    const nombre = escapeHtml(arma.nombre);
    const armaUrl = encodeURIComponent(slug);
    return `
        <section class="weapon-community-cta" aria-label="Compartir clase de ${nombre}">
            <div>
                <span class="weapon-community-kicker">COMUNIDAD WZ META</span>
                <h2>¿Tu build de ${nombre} te funciona mejor?</h2>
                <p>Compartila con sus 5 accesorios y código. La revisamos antes de publicarla.</p>
            </div>
            <a href="/comunidad?arma=${armaUrl}#comAuthCard" data-community-weapon="${escapeHtml(slug)}">Compartir mi clase <span aria-hidden="true">→</span></a>
        </section>
    `;
}

function setupCommunityCta() {
    document.querySelectorAll('[data-community-weapon]').forEach(link => {
        link.addEventListener('click', () => {
            if (typeof window.gtag !== 'function') return;
            window.gtag('event', 'community_weapon_cta_click', {
                event_category: 'community',
                arma_slug: link.dataset.communityWeapon || '',
            });
        });
    });
}

function renderSlotChips(arma) {
    const slots = Object.keys(arma.attachments || {});
    if (slots.length === 0) return '';
    const chips = slots.map(slot => {
        const id = 'slot-' + slot.toLowerCase().replace(/\s+/g, '-');
        const count = arma.attachments[slot].length;
        const label = SLOT_TRANSLATIONS_ES[slot] || slot;
        return `<a href="#${id}" class="slot-chip" data-slot="${slot.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(label)} <span class="slot-chip-count">${count}</span></a>`;
    }).join('');
    return `
        <div class="slot-chips-wrap">
            <div class="slot-chips">
                <span class="slot-chip-label">▸ Saltar a:</span>
                ${chips}
            </div>
        </div>
    `;
}

function isInLoadout(arma, itemName) {
    if (!arma.loadouts) return false;
    return arma.loadouts.some(l =>
        l.items.some(it => it.name === itemName)
    );
}

function renderAttachmentRow(arma, slot, item) {
    const iconSrc = `${arma.icon_path}/${slugSafe(item.name)}.png`;
    const inLoadout = isInLoadout(arma, item.name);
    const levelText = item.level || '';
    const isSpecial = isNaN(parseInt(levelText, 10));
    const levelHtml = levelText
        ? (isSpecial
            ? `<span class="att-row-level special">${escapeHtml(levelText)}</span>`
            : `<span class="att-row-level">NVL ${escapeHtml(levelText)}</span>`)
        : '';
    return `
        <div class="attachment-row${inLoadout ? ' in-loadout' : ''}">
            <div class="row-icon-frame">
                <img src="${escapeHtml(iconSrc)}" alt="${escapeHtml(item.name)}" loading="lazy">
            </div>
            <div class="att-row-info">
                <div class="att-row-slot-tag">${escapeHtml(item.label || slot)}</div>
                <div class="att-row-name">${escapeHtml(nombreAccES(item.name))}</div>
            </div>
            ${levelHtml}
        </div>
    `;
}

function renderSlotGroup(arma, slot, items) {
    const id = 'slot-' + slot.toLowerCase().replace(/\s+/g, '-');
    const label = SLOT_TRANSLATIONS_ES[slot] || slot;
    const rows = items.map(it => renderAttachmentRow(arma, slot, it)).join('');
    return `
        <div class="slot-group" id="${id}">
            <h3 class="slot-heading">${escapeHtml(label)} <span class="slot-count">${items.length} accesorios</span></h3>
            <div class="attachments-table">${rows}</div>
        </div>
    `;
}

function renderAllAttachmentsSection(arma) {
    const slots = Object.keys(arma.attachments || {});
    if (slots.length === 0) {
        return `
            <section class="all-attachments-section">
                <h2 class="section-title">Todos los <span class="accent">Accesorios</span></h2>
                <p class="section-subtitle">⏳ Inventario de accesorios pendiente</p>
            </section>
        `;
    }
    const total = slots.reduce((sum, s) => sum + arma.attachments[s].length, 0);
    const chips = renderSlotChips(arma);
    const groups = slots.map(slot => renderSlotGroup(arma, slot, arma.attachments[slot])).join('');
    return `
        <section class="all-attachments-section">
            <h2 class="section-title">Todos los <span class="accent">Accesorios</span></h2>
            <p class="section-subtitle">${total} accesorios disponibles · Marcados con ★ los del loadout meta · Niveles de desbloqueo verificados</p>
            ${chips}
            ${groups}
        </section>
    `;
}

function renderBreadcrumb(arma) {
    return `
        <nav class="weapon-breadcrumb">
            <a href="/">Inicio</a> · <a href="/armas">Armas</a> · ${escapeHtml(arma.nombre)}
        </nav>
    `;
}

// ── Video "Míralo en acción" (SEO: VideoObject + facade liviano) ──
// Lee videos-armas.json[slug] (lo llena _build/fetch_videos.py desde la API
// de YouTube). Muestra una miniatura real que abre el video en YouTube (sin
// iframe → no toca la CSP) e inyecta el schema VideoObject para que Google
// muestre el resultado enriquecido de video. Si no hay video real, no se
// muestra nada (nunca se inventa).
function _ldSafe(obj) {
    // evita romper el <script> si el título trae "</script>" o "<"
    return JSON.stringify(obj).replace(/</g, '\\u003c');
}
function renderVideoSection(arma, videos) {
    // videos puede ser una LISTA (rota entre varios recientes) o un objeto (compat)
    const lista = (Array.isArray(videos) ? videos : (videos ? [videos] : []))
        .filter(v => v && v.videoId);
    if (!lista.length) return '';
    // rotación: uno al azar en cada visita (todos son de los más recientes)
    const video = lista[Math.floor(Math.random() * lista.length)];
    const id = String(video.videoId);
    const title = video.title || `${arma.nombre} — Warzone gameplay`;
    const channel = video.channel || '';
    const thumb = video.thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const watch = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
    const desc = `Gameplay y build del ${arma.nombre} en Warzone Black Ops 7${channel ? ' · ' + channel : ''}.`;
    const schema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": title,
        "description": desc,
        "thumbnailUrl": [thumb],
        "embedUrl": `https://www.youtube-nocookie.com/embed/${id}`,
        "contentUrl": watch
    };
    if (video.published) schema.uploadDate = video.published;
    if (video.duration) schema.duration = video.duration;
    return `
        <section class="video-section">
            <h2 class="section-title">Míralo en <span class="accent">acción</span></h2>
            <p class="section-subtitle">Gameplay y build del ${escapeHtml(arma.nombre)} en el meta actual de Warzone</p>
            <a class="yt-facade" href="${watch}" target="_blank" rel="noopener noreferrer" aria-label="Ver en YouTube: ${escapeHtml(title)}">
                <img class="yt-thumb" src="${escapeHtml(thumb)}" alt="Video: ${escapeHtml(title)}" loading="lazy" onerror="this.closest('.yt-facade').classList.add('yt-nothumb')">
                <span class="yt-play" aria-hidden="true"><svg viewBox="0 0 68 48"><path class="yt-play-bg" d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.5C4 2.3 2.3 4.8 1.5 7.7.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z"></path><path d="M45 24 27 14v20" fill="#fff"></path></svg></span>
                <span class="yt-info"><span class="yt-title">${escapeHtml(title)}</span>${channel ? `<span class="yt-ch">${escapeHtml(channel)}</span>` : ''}</span>
            </a>
            <script type="application/ld+json">${_ldSafe(schema)}</script>
        </section>
    `;
}

// ── "Explorá más": linking interno a los hubs (tier list, comparar, clases…) ──
function renderMasLinks(arma) {
    const t = _norm(arma.tipo || '');
    let tierTipo = '/mejores-fusiles-asalto-warzone', tierLabel = 'Mejores fusiles';
    if (t.includes('subfusil')) { tierTipo = '/mejores-smg-warzone'; tierLabel = 'Mejores SMG'; }
    else if (t.includes('francotirador') || t.includes('precision')) { tierTipo = '/mejores-francotiradores-warzone'; tierLabel = 'Mejores snipers'; }
    else if (t.includes('escopeta')) { tierTipo = '/mejores-escopetas-warzone'; tierLabel = 'Mejores escopetas'; }
    else if (!t.includes('asalto')) { tierTipo = '/tier-list-armas-warzone'; tierLabel = 'Tier list completa'; }
    const links = [
        ['/tier-list-armas-warzone', 'Tier list de armas'],
        [tierTipo, tierLabel],
        ['/comparar', 'Comparar armas'],
        ['/clases', 'Clases meta'],
        ['/ventajas', 'Mejores ventajas'],
    ];
    const pills = links.map(([h, txt]) =>
        `<a href="${h}" style="font-family:'Share Tech Mono',monospace;font-size:.78rem;letter-spacing:.04em;color:#EEF2F6;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:9px 16px;text-decoration:none;transition:.15s" onmouseover="this.style.borderColor='#F0C419';this.style.color='#F0C419'" onmouseout="this.style.borderColor='rgba(255,255,255,.09)';this.style.color='#EEF2F6'">${txt}</a>`
    ).join('');
    return `<section class="video-section" aria-label="Explorá más de Warzone">
        <h2 class="section-title">Explorá <span class="accent">más</span></h2>
        <p class="section-subtitle">Tier lists, comparaciones y clases del meta de Warzone</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">${pills}</div>
    </section>`;
}

function setupIconFallback() {
    document.querySelectorAll('.row-icon-frame img, .att-icon-frame img').forEach(img => {
        img.addEventListener('error', function() {
            const frame = this.parentElement;
            this.style.display = 'none';
            if (!frame.querySelector('.icon-fallback')) {
                const f = document.createElement('div');
                f.className = 'icon-fallback';
                f.style.cssText = 'color:rgba(240,196,25,0.4);font-family:monospace;font-size:0.6rem;letter-spacing:0.1em;';
                f.textContent = '◇';
                frame.appendChild(f);
            }
        });
    });
}

function setupLoadoutTabs() {
    document.querySelectorAll('.loadout-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const t = tab.dataset.loadout;
            document.querySelectorAll('.loadout-tab').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.loadout-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = document.querySelector(`.loadout-content[data-loadout="${t}"]`);
            if (target) target.classList.add('active');
        });
    });
}

function setupChipsScroll() {
    const chips = document.querySelectorAll('.slot-chip');
    const groups = document.querySelectorAll('.slot-group[id]');
    if (!chips.length || !groups.length) return;
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            const id = chip.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                chips.forEach(c => {
                    c.classList.toggle('active', c.dataset.slot === id.replace('slot-', ''));
                });
            }
        });
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });
    groups.forEach(g => observer.observe(g));
}

function copyCode(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    const txt = el.innerText;
    if (txt.includes('Pendiente')) return;
    navigator.clipboard.writeText(txt).then(() => {
        const original = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '✓ Copiado';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = original;
        }, 1800);
    });
}
window.copyCode = copyCode;

// ════════════════════════════════════════════
// 🆕 v2: AUTO-CARGA DE patches-render.js
// Carga el motor de historial de patches dinámicamente
// y le pasa el slug actual para evitar parseo de URL.
// Idempotente: si ya está cargado, no duplica.
// ════════════════════════════════════════════
function loadPatchesRenderer(slug) {
    // Pasar el slug al patches-render para que lo use directo
    window.WEAPON_SLUG = slug;

    // Si ya está cargado (ej. agregado manualmente en algún stub), no duplicar
    if (document.getElementById('patches-renderer-script')) {
        // El script ya cargado puede haber corrido sin slug correcto; re-disparar manualmente
        if (typeof window.__patchesRenderInit === 'function') {
            window.__patchesRenderInit();
        }
        return;
    }

    const script = document.createElement('script');
    script.id = 'patches-renderer-script';
    script.src = '/js/patches-render.js';
    script.defer = true;
    document.head.appendChild(script);
}

// ════════════════════════════════════════════
// 🆕 v3: AUTO-CARGA DE weapons-official-render.js
// Carga el motor de estadísticas oficiales in-game.
// Reutiliza window.WEAPON_SLUG (ya seteado arriba).
// Idempotente: si ya está cargado, re-dispara el init.
// ════════════════════════════════════════════
function loadOfficialStatsRenderer(slug) {
    window.WEAPON_SLUG = slug;

    if (document.getElementById('official-stats-script')) {
        if (typeof window.__officialStatsInit === 'function') {
            window.__officialStatsInit();
        }
        return;
    }

    const s = document.createElement('script');
    s.id = 'official-stats-script';
    s.src = '/js/weapons-official-render.js';
    s.defer = true;
    document.head.appendChild(s);
}

// ════════════════════════════════════════════
// 🆕 v4: AUTO-CARGA DE meta-verdict-render.js
// Veredicto Meta (estado/momento/TTK derivado de parches).
// Reutiliza window.WEAPON_SLUG (ya seteado arriba).
// Idempotente: si ya está cargado, re-dispara el init.
// ════════════════════════════════════════════
function loadMetaVerdictRenderer(slug) {
    window.WEAPON_SLUG = slug;

    if (document.getElementById('meta-verdict-script')) {
        if (typeof window.__metaVerdictInit === 'function') {
            window.__metaVerdictInit();
        }
        return;
    }

    const s = document.createElement('script');
    s.id = 'meta-verdict-script';
    s.src = '/js/meta-verdict-render.js';
    s.defer = true;
    document.head.appendChild(s);
}

function loadSeoEnhance(slug) {
    window.WEAPON_SLUG = slug;

    if (document.getElementById('seo-enhance-script')) {
        if (typeof window.__seoEnhanceInit === 'function') {
            window.__seoEnhanceInit();
        }
        return;
    }

    const s = document.createElement('script');
    s.id = 'seo-enhance-script';
    s.src = '/js/seo-enhance.js';
    s.defer = true;
    document.head.appendChild(s);
}

function loadComparaciones(slug) {
    window.WEAPON_SLUG = slug;

    if (document.getElementById('comparaciones-script')) {
        if (typeof window.__comparacionesInit === 'function') {
            window.__comparacionesInit();
        }
        return;
    }

    const s = document.createElement('script');
    s.id = 'comparaciones-script';
    s.src = '/js/comparaciones-render.js';
    s.defer = true;
    document.head.appendChild(s);
}

const MODOS_ES_META = { battle_royale: 'Battle Royale', resurgence: 'Resurgence', clasificatorio: 'Ranked' };

// Enriquece la meta description con datos reales del arma (tier, TTK,
// alcance de referencia, modo) en vez del texto generico identico en
// las 53 fichas. Si un dato no esta disponible, esa parte simplemente
// no se agrega -- nunca se fabrica.
function actualizarMetaDescription(arma) {
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) return;
    const datos = [];
    if (arma.tier) datos.push(`Tier ${arma.tier}`);
    if (arma._ttk != null && arma._refDist != null) datos.push(`TTK ${arma._ttk}ms/${arma._refDist}m`);
    const cabecera = datos.length ? `${arma.nombre} — ${datos.join(', ')}. ` : `${arma.nombre}. `;
    const modos = Array.isArray(arma.modos) && arma.modos.length
        ? arma.modos.map(m => MODOS_ES_META[m] || m).join(' y ')
        : null;
    const cuerpo = modos
        ? `Mejor clase y build meta para ${modos} en Warzone Black Ops 7`
        : `Mejor clase y build meta en Warzone Black Ops 7`;
    meta.setAttribute('content', `${cabecera}${cuerpo}: accesorios, código de clase listo para copiar y gameplay en video. Actualizado con el meta 2026.`);
}

async function renderArmaPage(slug) {
    const main = document.getElementById('weapon-main');
    if (!main) return;
    try {
        const res = await fetch('/armas-data.json?v=' + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        let arma = data.armas[slug];
        if (!arma) {
            main.innerHTML = `<div style="text-align:center;padding:80px 24px;color:rgba(255,255,255,0.6);font-family:monospace">
                ❌ Arma no encontrada: ${escapeHtml(slug)}<br>
                <a href="/armas" style="color:#F0C419">← Volver al catálogo</a>
            </div>`;
            return;
        }
        arma = await cargarLoadoutMetaWarzone(arma);
        document.title = `${arma.nombre} Loadout Warzone — Mejor Clase y Meta Black Ops 7 | WZ Meta`;
        actualizarMetaDescription(arma);
        // video real del arma (si existe) para "Míralo en acción" + schema
        let video = null;
        try {
            const rv = await fetch('/videos-armas.json?v=' + Date.now());
            if (rv.ok) { const vs = await rv.json(); video = vs && vs[slug]; }
        } catch (e) { /* sin video: la sección simplemente no aparece */ }
        main.innerHTML =
            renderBreadcrumb(arma) +
            renderHero(arma) +
            renderLoadoutsSection(arma) +
            renderCommunityCta(arma, slug) +
            renderVideoSection(arma, video) +
            renderAllAttachmentsSection(arma) +
            renderMasLinks(arma);
        setupLoadoutTabs();
        setupCommunityCta();
        setupChipsScroll();
        setupIconFallback();

        // 🆕 v2: cargar historial de patches al final
        loadPatchesRenderer(slug);

        // 🆕 v3: cargar estadísticas oficiales in-game
        loadOfficialStatsRenderer(slug);

        // 🆕 v4: cargar veredicto meta (parches + TTK)
        loadMetaVerdictRenderer(slug);

        // 🆕 v5: cargar mejoras SEO (FAQ + H1 con keyword)
        loadSeoEnhance(slug);

        // 🆕 v6: cargar links a comparaciones 1-a-1 (si esta arma tiene alguna)
        loadComparaciones(slug);

    } catch (err) {
        console.error('[ARMA] Error:', err);
        main.innerHTML = `<div style="text-align:center;padding:80px 24px;color:#EF4444;font-family:monospace">
            ⚠️ Error cargando datos del arma<br>
            <span style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${escapeHtml(err.message)}</span>
        </div>`;
    }
}
window.renderArmaPage = renderArmaPage;
