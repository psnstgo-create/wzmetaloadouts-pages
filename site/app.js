// ════════════════════════════════════════════
//   APP.JS — Render del catálogo /armas (v5.0)
//   Ahora SOLO dibuja. La lógica de orden/TTK/tier vive en meta-core.js.
//   Cargar SIEMPRE meta-core.js ANTES que este archivo en armas.html.
// ════════════════════════════════════════════

// ── SVG SILUETAS DE ARMAS POR TIPO ──
const WEAPON_SILHOUETTES = {
    'asalto': `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor" opacity="0.4">
        <path d="M10 30 L40 30 L45 22 L75 22 L80 28 L160 28 L165 22 L180 22 L185 26 L195 26 L195 34 L185 34 L180 38 L165 38 L160 32 L120 32 L120 45 L100 45 L100 32 L80 32 L75 38 L45 38 L40 30 Z"/>
        <circle cx="30" cy="30" r="3" fill="#000"/>
    </svg>`,
    'subfusil': `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor" opacity="0.4">
        <path d="M20 28 L40 28 L45 22 L60 22 L65 28 L150 28 L150 22 L170 22 L170 34 L150 34 L150 32 L90 32 L90 45 L75 45 L75 32 L65 32 L60 38 L45 38 L40 32 L20 32 Z"/>
    </svg>`,
    'ametralladora': `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor" opacity="0.4">
        <path d="M10 30 L30 30 L35 20 L75 20 L80 28 L170 28 L175 20 L195 20 L195 38 L175 38 L170 32 L120 32 L120 50 L95 50 L95 32 L80 32 L75 40 L35 40 L30 32 L10 32 Z"/>
        <circle cx="25" cy="30" r="4" fill="#000"/>
    </svg>`,
    'precision': `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor" opacity="0.4">
        <path d="M5 28 L195 28 L195 32 L5 32 Z"/>
        <path d="M70 18 L130 18 L135 28 L65 28 Z" opacity="0.6"/>
        <path d="M50 32 L70 32 L75 45 L55 45 Z"/>
        <circle cx="100" cy="22" r="2" fill="#000"/>
    </svg>`,
    'marksman': `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor" opacity="0.4">
        <path d="M10 28 L185 28 L185 32 L10 32 Z"/>
        <path d="M75 20 L120 20 L125 28 L70 28 Z" opacity="0.6"/>
        <path d="M55 32 L75 32 L80 45 L60 45 Z"/>
    </svg>`,
    'escopeta': `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="currentColor" opacity="0.4">
        <path d="M15 26 L40 26 L45 20 L160 20 L165 24 L185 24 L185 36 L165 36 L160 40 L45 40 L40 34 L15 34 Z"/>
        <path d="M40 34 L55 50 L75 50 L60 34 Z"/>
    </svg>`,
};
function getWeaponSilhouette(tipo) {
    const t = norm(tipo);
    if (t.includes('asalto')) return WEAPON_SILHOUETTES.asalto;
    if (t.includes('subfusil')) return WEAPON_SILHOUETTES.subfusil;
    if (t.includes('ametralladora')) return WEAPON_SILHOUETTES.ametralladora;
    if (t.includes('precision')) return WEAPON_SILHOUETTES.precision;
    if (t.includes('marksman')) return WEAPON_SILHOUETTES.marksman;
    if (t.includes('escopeta')) return WEAPON_SILHOUETTES.escopeta;
    return WEAPON_SILHOUETTES.asalto;
}
// ── Íconos SVG por slot ──
const SLOT_ICONS = {
    'óptica':       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`,
    'mira':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`,
    'bocacha':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="10" width="16" height="4" rx="1"/><rect x="18" y="8" width="4" height="8" rx="1"/><line x1="6" y1="10" x2="6" y2="7"/><line x1="10" y1="10" x2="10" y2="7"/><line x1="14" y1="10" x2="14" y2="7"/></svg>`,
    'boca de cañón':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="10" width="16" height="4" rx="1"/><rect x="18" y="8" width="4" height="8" rx="1"/><line x1="6" y1="10" x2="6" y2="7"/><line x1="10" y1="10" x2="10" y2="7"/><line x1="14" y1="10" x2="14" y2="7"/></svg>`,
    'cañón':        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="10" width="20" height="4" rx="1"/><rect x="21" y="11" width="2" height="2" rx="0.5"/><line x1="5" y1="14" x2="5" y2="17"/><line x1="9" y1="14" x2="9" y2="17"/><line x1="13" y1="14" x2="13" y2="17"/></svg>`,
    'culata':       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8 L8 8 L8 16 L2 16 Z"/><rect x="8" y="10" width="12" height="4" rx="1"/><path d="M20 10 L22 8 L22 16 L20 14"/></svg>`,
    'cargador':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="2" width="8" height="14" rx="2"/><path d="M10 16 L10 22 L14 22 L14 16"/><line x1="10" y1="6" x2="14" y2="6"/><line x1="10" y1="9" x2="14" y2="9"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
    'bajo cañón':   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="9" width="18" height="4" rx="1"/><rect x="6" y="13" width="8" height="5" rx="1"/><line x1="8" y1="13" x2="8" y2="18"/><line x1="12" y1="13" x2="12" y2="18"/></svg>`,
    'acople':       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="9" width="18" height="4" rx="1"/><rect x="6" y="13" width="8" height="5" rx="1"/><line x1="8" y1="13" x2="8" y2="18"/><line x1="12" y1="13" x2="12" y2="18"/></svg>`,
    'empuñadura':   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 4 L15 4 L15 12 L12 16 L9 12 Z"/><path d="M9 12 Q6 14 6 18 L18 18 Q18 14 15 12"/></svg>`,
    'mod. disparo': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2 L12 6M12 18 L12 22M2 12 L6 12M18 12 L22 12"/></svg>`,
    'mods de disparo':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2 L12 6M12 18 L12 22M2 12 L6 12M18 12 L22 12"/></svg>`,
    'láser':        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="12" r="3"/><line x1="9" y1="12" x2="22" y2="12"/><line x1="14" y1="8" x2="22" y2="12"/><line x1="14" y1="16" x2="22" y2="12"/></svg>`,
};
function getSlotIcon(slot) {
    const key = norm(slot);
    for (const [k, svg] of Object.entries(SLOT_ICONS)) {
        if (key.includes(norm(k))) return svg;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="16" height="8" rx="2"/></svg>`;
}
const SLOT_COLORS = {
    'óptica':       '#3B82F6', 'mira':         '#3B82F6',
    'bocacha':      '#F0C419', 'boca de cañón':'#F0C419',
    'cañón':        '#22C55E', 'culata':       '#A855F7',
    'cargador':     '#EF4444', 'bajo cañón':   '#F97316',
    'acople':       '#F97316', 'empuñadura':   '#06B6D4',
    'mod. disparo': '#EC4899', 'mods de disparo':'#EC4899',
    'láser':        '#84CC16',
};
function getSlotColor(slot) {
    const key = norm(slot);
    for (const [k, color] of Object.entries(SLOT_COLORS)) {
        if (key.includes(norm(k))) return color;
    }
    return '#6B7280';
}
// ── Renderiza una fila de attachment (soporta ambos formatos) ──
// Formato A (meta_warzone.json): { slot, item, nivel, nombre_es }
// Formato B (armas-data loadouts): { slot, name, level, nombre_es }
function renderAttachRow(at) {
    const slotColor = getSlotColor(at.slot);
    const slotIcon  = getSlotIcon(at.slot);
    const nombreEn  = at.item || at.name || '';
    const nombreEs  = (at.nombre_es || '').trim();
    const nivel     = at.nivel || at.level || '';

    // Opción B: español primario, inglés referencia
    const principal  = nombreEs || nombreEn;
    const secundario = nombreEs ? nombreEn : '';

    return `
    <div class="attach-row">
        <div class="attach-icon" style="color:${slotColor};border-color:${slotColor}33;background:${slotColor}11">
            ${slotIcon}
        </div>
        <div class="attach-info">
            <div class="attach-slot">${escapeHtml(at.slot)}</div>
            <div class="attach-item">${escapeHtml(principal)}</div>
            ${secundario ? `<div class="attach-item-en">└ ${escapeHtml(secundario)}</div>` : ''}
        </div>
        ${nivel ? `<span class="attach-nivel">LVL ${escapeHtml(nivel)}</span>` : ''}
    </div>`;
}
// ── Renderizado de imagen ──
function renderWeaponImage(arma, esModal = false) {
    const color = colorTipo(arma.tipo_arma);
    const silueta = getWeaponSilhouette(arma.tipo_arma);
    const claseImg = esModal ? 'modal-hero-img' : 'card-img';
    const clasePlace = esModal ? 'weapon-placeholder weapon-placeholder-modal' : 'weapon-placeholder';
    if (!arma.imagen_url || arma.imagen_url.trim() === '') {
        return `
        <div class="${clasePlace}" style="color:${color}">
            ${silueta}
            <div class="weapon-placeholder-name">${escapeHtml(arma.arma)}</div>
        </div>`;
    }
    const placeholderId = `ph-${arma.ranking}-${esModal ? 'm' : 'c'}`;
    // SECURITY: validar que imagen_url no sea javascript: URI
    const safeUrl = /^(https?:)?\/\//.test(arma.imagen_url) || arma.imagen_url.startsWith('/')
        ? arma.imagen_url
        : '';
    return `
        <img class="${claseImg}" src="${escapeHtml(safeUrl)}" alt="${escapeHtml(arma.arma)}"
             onerror="this.style.display='none';document.getElementById('${placeholderId}').style.display='flex'">
        <div id="${placeholderId}" class="${clasePlace}" style="color:${color};display:none">
            ${silueta}
            <div class="weapon-placeholder-name">${escapeHtml(arma.arma)}</div>
        </div>`;
}
// 🆕 Icono de tendencia: ▲ verde si subió (buff), ▼ rojo si bajó (nerf) este parche.
// Honesto: la dirección sale de los parches oficiales (es_buff / es_nerfeada).
function tendenciaHtml(arma) {
    if (arma.es_buff)     return `<svg viewBox="0 0 10 10" width="8" height="8" style="margin-left:4px;vertical-align:middle" aria-label="subió"><path d="M5 1 L9 8.5 L1 8.5 Z" fill="#00FF87"/></svg>`;
    if (arma.es_nerfeada) return `<svg viewBox="0 0 10 10" width="8" height="8" style="margin-left:4px;vertical-align:middle" aria-label="bajó"><path d="M5 9 L1 1.5 L9 1.5 Z" fill="#EF4444"/></svg>`;
    return '';
}
// 🥇 MEDALLA DE SUBFUSIL: etiqueta extra para los 3 subfusiles mejor rankeados del
// meta (oro/plata/bronce). Se calcula en calcularOrdenAuto y se guarda en a._medalla.
// Solo aparece en subfusiles; el resto de armas no lleva medalla.
function medallaHtml(arma) {
    const cfg = {
        oro:    { emoji: '🥇', txt: 'MEJOR SUBFUSIL', color: '#F0C419' },
        plata:  { emoji: '🥈', txt: '2º SUBFUSIL',    color: '#C0C0C0' },
        bronce: { emoji: '🥉', txt: '3º SUBFUSIL',    color: '#CD7F32' },
    }[arma._medalla];
    if (!cfg) return '';
    return `<span class="tag" style="color:${cfg.color};border-color:${cfg.color}66;background:${cfg.color}14;font-weight:700">${cfg.emoji} ${cfg.txt}</span>`;
}
// ── Card ──
function crearCard(arma, index) {
    const tier  = tierDe(arma);
    const color = colorTipo(arma.tipo_arma);
    const mostrarTipo = norm(arma.tipo_arma) !== norm(arma.categoria_tactica);
    const badges = [
        arma.es_nuevo    ? `<span class="tag tag-new">NEW</span>` : '',
        arma.es_buff     ? `<span class="tag tag-buff">BUFFED</span>` : '',
        arma.es_nerfeada ? `<span class="tag tag-nerf">NERFED</span>` : '',
    ].join('');
    const ttkData = ttkForArma(arma);
    const ttkChip = ttkData
        ? `<span class="tag tag-ttk" style="color:#06B6D4;border-color:#06B6D444;background:#06B6D411;font-family:'Share Tech Mono',monospace">TTK ${ttkData.ttk} ms</span>`
        : '';
    return `
    <div class="arma-card tier-${tier}" style="animation-delay:${index * 40}ms"
         onclick="abrirModal(${arma._idx})">
        <div class="card-image-wrap">
            ${renderWeaponImage(arma, false)}
            <span class="rank-badge">#${arma._modoRank || arma._autoRank || arma.ranking}${tendenciaHtml(arma)}</span>
            <span class="tier-badge ${tier}">TIER ${tier}</span>
        </div>
        <div class="card-body">
            <div class="card-nombre">${escapeHtml(arma.arma)}</div>
            <div class="card-tags">
                <span class="tag tag-categoria">${escapeHtml(arma.categoria_tactica || '')}</span>
                ${mostrarTipo ? `<span class="tag tag-tipo" style="color:${color};border-color:${color}44">${escapeHtml(arma.tipo_arma)}</span>` : ''}
                ${medallaHtml(arma)}
                ${badges}
                ${ttkChip}
            </div>
        </div>
    </div>`;
}
function actualizarStats(armas) {
    const el = (id) => document.getElementById(id);
    if (el('total-armas')) el('total-armas').textContent = armas.length;
    if (el('count-s')) el('count-s').textContent = armas.filter(a => tierDe(a) === 'S').length;
    if (el('count-a')) el('count-a').textContent = armas.filter(a => tierDe(a) === 'A').length;
    if (el('count-b')) el('count-b').textContent = armas.filter(a => tierDe(a) === 'B').length;
    if (el('count-c')) el('count-c').textContent = armas.filter(a => tierDe(a) === 'C').length;
    if (el('top-pick') && armas.length > 0) {
        // TOP PICK = el #1 real del orden mostrado (mejor _autoRank), no el primero del array crudo
        const top = armas.reduce((best, a) => ((a._autoRank || 999) < (best._autoRank || 999)) ? a : best, armas[0]);
        el('top-pick').textContent = top.arma;
    }
}
// ── Render armas con filtro por modo ──
function renderArmas(filtro = 'battle_royale', tipo = 'modo') {
    console.log('[APP] renderArmas:', filtro, tipo, 'armas:', todasLasArmas.length);
    const contenedor = document.getElementById('container-armas');
    if (!contenedor) return;
    let lista;
    if (filtro === 'todos') {
        lista = todasLasArmas;
    } else if (tipo === 'modo') {
        lista = todasLasArmas.filter(a => !Array.isArray(a.modos) || !a.modos.length || a.modos.includes(filtro));
    } else {
        lista = todasLasArmas.filter(a => a.categoria_tactica === filtro);
    }
    lista = lista.slice();
    // 🆕 Ranking absoluto del modo: 1..N contiguo, según el motor (TTK + momentum)
    lista.slice()
         .sort((a, b) => (a._autoRank || a.ranking || 99) - (b._autoRank || b.ranking || 99))
         .forEach((a, i) => { a._modoRank = i + 1; });
    actualizarStats(lista);
    if (!lista.length) {
        contenedor.style.display = 'block';
        contenedor.innerHTML = `<div class="loading-state"><p class="mono-text">SIN RESULTADOS PARA ESTE MODO</p></div>`;
        return;
    }
    // Agrupar por categoría y rankear dentro de cada grupo por _catRank
    const grupos = {};
    lista.forEach(a => { (grupos[a.categoria_tactica || 'Otras'] = grupos[a.categoria_tactica || 'Otras'] || []).push(a); });
    const ordenCat = Object.keys(grupos).sort((x, y) => catPrio(x) - catPrio(y));
    contenedor.style.display = 'block'; // se agrupa: el grid va por sección
    let idxAnim = 0;
    const html = ordenCat.map(cat => {
        const arr = grupos[cat].sort((a, b) => (a._catRank || 99) - (b._catRank || 99));
        const et = etiquetaCategoria(cat);
        const cards = arr.map(a => crearCard(a, idxAnim++)).join('');
        return `
        <div class="cat-group">
            <div class="cat-header" style="display:flex;align-items:baseline;gap:10px;margin:26px 4px 12px">
                <span style="font-family:'Share Tech Mono',monospace;font-size:.78rem;letter-spacing:.18em;color:#F0C419">${et.txt}</span>
                <span style="flex:1;height:1px;background:rgba(240,196,25,.18)"></span>
                <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;letter-spacing:.06em;color:#5A636D">${et.sub}</span>
            </div>
            <div class="armas-grid">${cards}</div>
        </div>`;
    }).join('');
    contenedor.innerHTML = html;
}
// ── Modal (v4.6: con escape XSS) ──
function abrirModal(index) {
    const arma = todasLasArmas[index];
    if (!arma) return;
    const tier  = tierDe(arma);
    const color = colorTipo(arma.tipo_arma);
    const mostrarTipo = norm(arma.tipo_arma) !== norm(arma.categoria_tactica);
    const tierColor = tier==='S'?'var(--gold)':tier==='A'?'var(--green)':tier==='B'?'var(--blue)':'var(--purple)';
    const badges = [
        `<span class="tag tag-categoria">${escapeHtml(arma.categoria_tactica || '')}</span>`,
        mostrarTipo ? `<span class="tag tag-tipo" style="color:${color};border-color:${color}44">${escapeHtml(arma.tipo_arma)}</span>` : '',
        `<span class="tier-badge ${tier}" style="position:static;clip-path:none;margin-left:4px">TIER ${tier}</span>`,
        arma.es_nuevo    ? `<span class="tag tag-new">NEW</span>` : '',
        arma.es_buff     ? `<span class="tag tag-buff">BUFFED</span>` : '',
        arma.es_nerfeada ? `<span class="tag tag-nerf">NERFED</span>` : '',
    ].join('');
    // v4.5: prioridad de fuente de attachments:
    // 1. arma.loadouts[0].items (formato armas-data.json con {slot,name,level})
    // 2. arma.attachments (formato meta_warzone.json con {slot,item,nivel})
    let attachItems = [];
    let codigoFuente = arma.codigo || '';
    if (arma.loadouts && arma.loadouts.length && arma.loadouts[0].items && arma.loadouts[0].items.length) {
        attachItems = arma.loadouts[0].items;
        codigoFuente = arma.loadouts[0].codigo || codigoFuente;
    } else if (Array.isArray(arma.attachments) && arma.attachments.length) {
        attachItems = arma.attachments;
    }
    // SECURITY: el código va en data-attribute, NO en onclick inline (evita inyección JS)
    const codigoHtml = codigoFuente
    ? `<div class="loadout-codigo">
        <span class="codigo-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
        <span class="codigo-val">${escapeHtml(codigoFuente)}</span>
        <button class="codigo-copy" data-codigo="${escapeHtml(codigoFuente)}">COPIAR</button>
       </div>`
    : '';
    const attachHtml = attachItems.length
        ? `<div class="loadout-block">${codigoHtml}${attachItems.map(renderAttachRow).join('')}</div>`
        : `<div class="attachment-placeholder">ATTACHMENTS PRÓXIMAMENTE</div>`;

    // 🆕 TTK calculado (si hay stats oficiales) + "porqué" (último parche)
    const ttkData = ttkForArma(arma);
    const ttkStatHtml = ttkData ? `
                <div class="modal-stat">
                    <div class="modal-stat-label">TTK · 250 PV</div>
                    <div class="modal-stat-value" style="color:#06B6D4">${ttkData.ttk} ms</div>
                </div>` : '';
    const ttkNoteHtml = ttkData ? `
            <div style="margin:-4px 0 12px;font-family:'Share Tech Mono',monospace;font-size:.58rem;line-height:1.5;color:rgba(255,255,255,.4)">
                TTK estimado a quemarropa (daño al pecho base, ${ttkData.pecho}) · ${ttkData.rpm} rpm · 250 PV = 3 placas
            </div>` : '';
    const porqueHtml = buildPorque(ultimoParcheDeArma(arma));

    document.getElementById('modal-content').innerHTML = `
        <div class="modal-hero">
            ${renderWeaponImage(arma, true)}
        </div>
        <div class="modal-body">
            <div class="modal-nombre">${escapeHtml(arma.arma)}</div>
            <div class="modal-tags">${badges}</div>
            <div class="modal-stats">
                <div class="modal-stat">
                    <div class="modal-stat-label">RANKING ${escapeHtml((arma.categoria_tactica || '').toUpperCase())}</div>
                    <div class="modal-stat-value" style="color:${tierColor}">#${arma._catRank || arma.ranking}</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">TIER</div>
                    <div class="modal-stat-value" style="color:${tierColor}">${tier}</div>
                </div>${ttkStatHtml}
            </div>
            ${ttkNoteHtml}
            ${porqueHtml}
            <div class="attachments-title">CLASE RECOMENDADA</div>
            <div class="attach-list">${attachHtml}</div>
        </div>`;

    // SECURITY: registrar handler del botón COPIAR via addEventListener
    // (lee el código del data-attribute, no del template string)
    const copyBtn = document.querySelector('#modal-content .codigo-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const codigo = this.dataset.codigo || '';
            navigator.clipboard.writeText(codigo).then(() => {
                this.textContent = '✓';
                this.classList.add('copied');
                setTimeout(() => {
                    this.textContent = 'COPIAR';
                    this.classList.remove('copied');
                }, 1500);
            });
        });
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
}
function cerrarModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}
// Event listeners del modal
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('modal-close');
    const overlay  = document.getElementById('modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', cerrarModal);
    if (overlay) {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) cerrarModal();
        });
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });
});
// ── Carga inicial de datos ──
async function mostrarMeta() {
    console.log('[APP] Cargando meta_warzone.json...');
    try {
        // 🆕 motor compartido: fetch + normalizar + TTK/parches + orden (meta-core.js)
        await cargarMeta();
        console.log('[APP] Armas cargadas:', todasLasArmas.length);
        if (todasLasArmas[0]?.timestamp) {
            const ts = document.getElementById('timestamp-display');
            if (ts) ts.textContent = todasLasArmas[0].timestamp;
        }
        const modoInicial = (typeof modoActivo !== 'undefined') ? modoActivo : 'battle_royale';
        renderArmas(modoInicial, 'modo');
    } catch (err) {
        console.error('[APP] Error cargando datos:', err);
        const cont = document.getElementById('container-armas');
        if (cont) cont.innerHTML = `<div class="loading-state"><p class="mono-text" style="color:#EF4444">ERROR AL CARGAR DATOS</p></div>`;
    }
}
mostrarMeta();
/* ════════════════════════════════════════════
   PATCH PARA app.js — Banner Server Status

   Agregar este código al FINAL de app.js, después
   de la línea `mostrarMeta();` que ya está ahí.

   El código:
   - Lee server_status.json (con cache busting)
   - Si estado === "ALERTA" → muestra banner rojo arriba del meta
   - Si estado === "OK" → no muestra nada
   - Re-chequea cada 5 minutos sin recargar la página

   IMPORTANTE: este código usa escapeHtml() que ya está en
   app.js v4.6, así que no hay riesgo XSS.
════════════════════════════════════════════ */

// ── Server Status Banner ──
async function checkServerStatus() {
    try {
        const res = await fetch('server_status.json?v=' + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        renderServerStatusBanner(data);
    } catch (err) {
        console.warn('[STATUS] No se pudo cargar server_status.json:', err);
        // Silencioso: si falla, no mostramos nada
    }
}

function renderServerStatusBanner(data) {
    // Buscar o crear el contenedor del banner
    let banner = document.getElementById('server-status-banner');

    if (data.estado !== 'ALERTA') {
        // Todo OK → remover banner si existía
        if (banner) banner.remove();
        return;
    }

    // Construir contenido del banner
    const eventos = (data.eventos_activos || []).slice(0, 2);
    const tweets  = (data.tweets_recientes || []).slice(0, 1);

    let detalles = '';
    if (eventos.length > 0) {
        // Tomamos el primer evento más significativo
        const evt = eventos[0];
        detalles = escapeHtml(evt.texto || '').substring(0, 200);
        if (detalles.length === 200) detalles += '…';
    } else if (tweets.length > 0) {
        detalles = escapeHtml(tweets[0].texto || '').substring(0, 200);
    } else {
        detalles = 'Activision investiga problemas en los servidores.';
    }

    // Calcular hace cuánto se detectó
    let haceCuanto = '';
    try {
        const detectado = new Date(data.timestamp);
        const ahora = new Date();
        const minutos = Math.floor((ahora - detectado) / 60000);
        if (minutos < 60) {
            haceCuanto = `hace ${minutos} min`;
        } else {
            const horas = Math.floor(minutos / 60);
            haceCuanto = `hace ${horas}h`;
        }
    } catch (e) {
        haceCuanto = '';
    }

    // Si el banner no existe aún, crearlo e insertarlo antes del container
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'server-status-banner';
        banner.className = 'server-status-banner';
        const container = document.getElementById('container-armas');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(banner, container);
        } else {
            document.querySelector('main')?.prepend(banner);
        }
    }

    banner.innerHTML = `
        <div class="ssb-icon">⚠</div>
        <div class="ssb-content">
            <div class="ssb-title">
                CAÍDA DETECTADA EN SERVIDORES
                <span class="ssb-time">${haceCuanto}</span>
            </div>
            <div class="ssb-detail">${detalles}</div>
            <a href="https://support.activision.com/es/onlineservices"
               target="_blank" rel="noopener noreferrer"
               class="ssb-link">Ver detalles oficiales →</a>
        </div>
        <button class="ssb-close" id="ssb-close" aria-label="Cerrar">×</button>
    `;

    // Botón cerrar (oculta hasta el próximo check)
    const closeBtn = document.getElementById('ssb-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.style.display = 'none';
            // Recordar dismissal en sessionStorage (solo esta sesión)
            try {
                sessionStorage.setItem('ssb_dismissed', data.timestamp);
            } catch (e) { /* ignore */ }
        });
    }

    // Si ya estaba dismissed esta sesión Y es la misma alerta, no mostrar
    try {
        const dismissed = sessionStorage.getItem('ssb_dismissed');
        if (dismissed === data.timestamp) {
            banner.style.display = 'none';
        }
    } catch (e) { /* ignore */ }
}

// Chequear al cargar la página
checkServerStatus();

// Re-chequear cada 5 minutos sin recargar
setInterval(checkServerStatus, 5 * 60 * 1000);

/* ════════════════════════════════════════════
   PATCH PARA app.js — Status Pill en el footer

   PEGAR ESTE CÓDIGO AL FINAL DE app.js
   (no toca el banner existente, es additive)

   Comportamiento:
   - Estado OK → pill verde "SERVERS BO7/WZ · OK" en el footer
   - Estado ALERTA → pill rojo "SERVERS · DOWN" en el footer
   - Estado DESCONOCIDO o error → no muestra nada
   - Auto-update cada 5 minutos
════════════════════════════════════════════ */

// ── Server Status Pill (footer) ──
function renderServerStatusPill(data) {
    let pillWrap = document.getElementById('server-status-pill-wrap');

    // Sin data válida o estado DESCONOCIDO → no mostrar
    if (!data || !data.estado || data.estado === 'DESCONOCIDO') {
        if (pillWrap) pillWrap.remove();
        return;
    }

    // Crear contenedor si no existe
    if (!pillWrap) {
        pillWrap = document.createElement('div');
        pillWrap.id = 'server-status-pill-wrap';
        pillWrap.className = 'server-status-pill-wrap';
        const footer = document.querySelector('footer');
        if (footer) {
            // Insertar como primer hijo del footer (encima del texto existente)
            footer.insertBefore(pillWrap, footer.firstChild);
        } else {
            // Fallback: agregarlo al final del body
            document.body.appendChild(pillWrap);
        }
    }

    const ok  = data.estado === 'OK';
    const cls = ok ? 'ok' : 'alert';
    const txt = ok ? 'SERVERS BO7/WZ · OK' : 'SERVERS · DOWN';

    pillWrap.innerHTML = `
        <span class="server-status-pill ${cls}">
            <span class="ssp-dot"></span>${escapeHtml(txt)}
        </span>
    `;
}

// Auto-init del pill (chequeo independiente del banner)
(async function initStatusPill() {
    async function checkPill() {
        try {
            const res = await fetch('server_status.json?v=' + Date.now());
            if (!res.ok) return;
            const data = await res.json();
            renderServerStatusPill(data);
        } catch (err) {
            console.warn('[STATUS PILL] error:', err);
        }
    }
    checkPill();
    // Re-chequear cada 5 minutos
    setInterval(checkPill, 5 * 60 * 1000);
})();
