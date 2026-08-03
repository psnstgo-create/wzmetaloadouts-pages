// ════════════════════════════════════════════
//   CLASES.JS — Renderizado de clases/loadouts
// ════════════════════════════════════════════

const CLASES = [
    {
        id: 'meta_absoluto',
        estilo: 'META ABSOLUTO',
        nombre: 'Todo Terreno',
        icono: 'meta',
        dificultad: 'RECOMENDADO',
        modos: ['battle_royale', 'resurgence', 'clasificatorio'],
        descripcion: 'El DS20 Mirage encabeza el meta de la Temporada 4 tras su buff, y el Carbon 57 cubre el corto alcance. La combinación más sólida para casi cualquier situación.',
        primaria: {
            nombre: 'DS20 Mirage', rol: 'PRIMARIA', tipo: 'Fusil de Asalto', tier: 'S',
            imagen: '/weapons/gold/DS20 Mirage.png',
            color: '#3B82F6',
            attachments: [
                { slot: 'Óptica', item: 'FANG HoverPoint ELO' },
                { slot: 'Bocacha', item: 'Silenciador Monolítico' },
                { slot: 'Cañón', item: 'Cañón Abdicator 17.1"' },
                { slot: 'Cargador', item: 'Cargador Griffon Reserve II' },
                { slot: 'Culata', item: 'Culata Lastrada' }
            ]
        },
        secundaria: {
            nombre: 'Carbon 57', rol: 'SECUNDARIA', tipo: 'Subfusil', tier: 'S',
            imagen: '/weapons/gold/Carbon 57.png',
            color: '#00FF87',
            attachments: [
                { slot: 'Bocacha', item: 'Compensador K&S' },
                { slot: 'Cañón', item: 'Cañón VAS Radiant 8.5"' },
                { slot: 'Óptica', item: 'EAM Micro Dot' },
                { slot: 'Bajo Cañón', item: 'Empuñadura Respire' },
                { slot: 'Cargador', item: 'Cargador Bowen Sideline' }
            ]
        },
        stats: { movilidad: 75, daño: 82, rango: 80, facilidad: 85 },
        color: '#FF9500'
    },
    {
        id: 'agresivo',
        estilo: 'ESTILO AGRESIVO',
        nombre: 'Rush & Destroy',
        icono: 'agresivo',
        dificultad: 'FÁCIL',
        modos: ['battle_royale', 'resurgence'],
        descripcion: 'Estilo de presión constante. El MXR-17, buffeado en la Temporada 4, domina el medio alcance; el VST limpia interiores y peleas cerradas.',
        primaria: {
            nombre: 'MXR-17', rol: 'PRIMARIA', tipo: 'Fusil de Asalto', tier: 'S',
            imagen: '/weapons/gold/MXR-17.png',
            color: '#3B82F6',
            attachments: [
                { slot: 'Óptica', item: 'VAS MicroFlex' },
                { slot: 'Bocacha', item: 'Greaves Ti-762' },
                { slot: 'Cañón', item: 'Cañón Rapid Sterling 18"' },
                { slot: 'Bajo Cañón', item: 'Empuñadura Sentry Pro' },
                { slot: 'Cargador', item: 'Cargador Ampliado Vault' }
            ]
        },
        secundaria: {
            nombre: 'VST', rol: 'SECUNDARIA', tipo: 'Subfusil', tier: 'A',
            imagen: '/weapons/gold/VST.png',
            color: '#00FF87',
            attachments: [
                { slot: 'Bocacha', item: 'Silenciador Bowen .45' },
                { slot: 'Cañón', item: 'Cañón Enmity 9.7"' },
                { slot: 'Bajo Cañón', item: 'Empuñadura Respire' },
                { slot: 'Cargador', item: 'Cargador Rápido Divest' },
                { slot: 'Láser', item: 'Láser VAS Precision Shift' }
            ]
        },
        stats: { movilidad: 85, daño: 80, rango: 72, facilidad: 82 },
        color: '#EF4444'
    },
    {
        id: 'sniper',
        estilo: 'FRANCOTIRADOR',
        nombre: 'One Shot King',
        icono: 'sniper',
        dificultad: 'AVANZADO',
        modos: ['battle_royale', 'clasificatorio'],
        descripcion: 'Para los que juegan de posición. El Strider 300 (buffeado) castiga a distancia, y el Ryden 45K te respalda cuando te cierran el hueco.',
        primaria: {
            nombre: 'Strider 300', rol: 'PRIMARIA', tipo: 'Fusil de Precisión', tier: 'A',
            imagen: '/weapons/gold/Strider 300.png',
            color: '#BF5FFF',
            attachments: [
                { slot: 'Bocacha', item: 'Compensador RL-7.62' },
                { slot: 'Cañón', item: 'Cañón Saltire Dispatch 24.1"' },
                { slot: 'Bajo Cañón', item: 'Guardamanos Cornerstone-642' },
                { slot: 'Cargador', item: 'Cargador Ampliado Laden' },
                { slot: 'Láser', item: 'Láser Convergence Box' }
            ]
        },
        secundaria: {
            nombre: 'Ryden 45K', rol: 'SECUNDARIA', tipo: 'Subfusil', tier: 'B',
            imagen: '/weapons/gold/Ryden 45K.png',
            color: '#00FF87',
            attachments: [
                { slot: 'Bocacha', item: 'Hawker Serie 45' },
                { slot: 'Cañón', item: 'Cañón Rauch 6L-R 11"' },
                { slot: 'Óptica', item: 'LTI Reflex' },
                { slot: 'Bajo Cañón', item: 'Empuñadura Respire' },
                { slot: 'Cargador', item: 'Cargador Fraternity Flip' }
            ]
        },
        stats: { movilidad: 58, daño: 100, rango: 100, facilidad: 55 },
        color: '#BF5FFF'
    },
    {
        id: 'resurgence',
        estilo: 'RESURGENCE SPECIALIST',
        nombre: 'Domina el Respawn',
        icono: 'resurgence',
        dificultad: 'MEDIO',
        modos: ['resurgence'],
        descripcion: 'Pensado para el ritmo rápido de Resurgence. El Dravec 45, uno de los subfusiles más fuertes tras su buff, se apoya en el AK-27 para el medio alcance.',
        primaria: {
            nombre: 'Dravec 45', rol: 'PRIMARIA', tipo: 'Subfusil', tier: 'S',
            imagen: '/weapons/gold/Dravec 45.png',
            color: '#00FF87',
            attachments: [
                { slot: 'Bocacha', item: 'Hawker Serie 45' },
                { slot: 'Cañón', item: 'Cañón Jetstream 18"' },
                { slot: 'Óptica', item: 'Lethal Tools ELO' },
                { slot: 'Láser', item: 'Láser EAM ScatterLine' },
                { slot: 'Cargador', item: 'Cargador Rápido FrontGate' }
            ]
        },
        secundaria: {
            nombre: 'AK-27', rol: 'SECUNDARIA', tipo: 'Fusil de Asalto', tier: 'S',
            imagen: '/weapons/gold/AK-27.png',
            color: '#3B82F6',
            attachments: [
                { slot: 'Óptica', item: 'VAS LED' },
                { slot: 'Bocacha', item: 'Compensador EMT3' },
                { slot: 'Cañón', item: 'Cañón Pesado Vandal 17.6"' },
                { slot: 'Cargador', item: 'Tambor Pesado Saber Pack' },
                { slot: 'Bajo Cañón', item: 'Empuñadura Lateral Precision' }
            ]
        },
        stats: { movilidad: 88, daño: 80, rango: 68, facilidad: 80 },
        color: '#00A8FF'
    },
    {
        id: 'black_ops_royale',
        estilo: 'BLACK OPS ROYALE',
        nombre: 'Floor Loot King',
        icono: 'bor',
        dificultad: 'ESTRATÉGICO',
        modos: ['black_ops_royale'],
        descripcion: 'En Black Ops Royale no hay clases: usás lo que encontrás. El MXR-17 y el Hawker HX son de las armas más fuertes del loot del suelo.',
        primaria: {
            nombre: 'MXR-17', rol: 'BUSCAR EN LOOT', tipo: 'Fusil de Asalto', tier: 'S',
            imagen: '/weapons/gold/MXR-17.png',
            color: '#00A8FF',
            attachments: [
                { slot: 'Arquetipo', item: 'Recon — Prioriza este' },
                { slot: 'Mejora 1', item: 'Control Retroceso Vertical' },
                { slot: 'Mejora 2', item: 'Control Retroceso Horizontal' },
                { slot: 'Mejora 3', item: 'Rango de Daño Aumentado' },
                { slot: 'Mejora 4', item: 'Cargador Grande' }
            ]
        },
        secundaria: {
            nombre: 'Hawker HX', rol: 'BUSCAR EN LOOT', tipo: 'Fusil de Precisión', tier: 'A',
            imagen: '/weapons/gold/Hawker HX.png',
            color: '#BF5FFF',
            attachments: [
                { slot: 'Nota', item: 'En BOR usas Arquetipos, no attachments' },
                { slot: 'Arquetipo', item: 'Sniper — Mayor velocidad de bala' },
                { slot: 'Mejora 1', item: 'Velocidad de Bala' },
                { slot: 'Mejora 2', item: 'Daño por Disparo' },
                { slot: 'Consejo', item: 'Prioriza recoger esta arma' }
            ]
        },
        stats: { movilidad: 65, daño: 88, rango: 85, facilidad: 60 },
        color: '#06B6D4'
    },
    {
        id: 'clasificatorio',
        estilo: 'RANKED / CLASIFICATORIO',
        nombre: 'Competitive Edge',
        icono: 'ranked',
        dificultad: 'ALTO NIVEL',
        modos: ['clasificatorio'],
        descripcion: 'Para el clasificatorio mandan la consistencia y el control. El VS Recon cubre las distancias largas y el AK-27 (buffeado) es un fusil fiable para todo lo demás.',
        primaria: {
            nombre: 'VS Recon', rol: 'PRIMARIA', tipo: 'Fusil de Precisión', tier: 'A',
            imagen: '/weapons/gold/VS Recon.png',
            color: '#BF5FFF',
            attachments: [
                { slot: 'Bocacha', item: 'Greaves A-762' },
                { slot: 'Cañón', item: 'Cañón Domain 24.9"' },
                { slot: 'Óptica', item: 'RistRauch 7x' },
                { slot: 'Bajo Cañón', item: 'Guardamanos AxisPro' },
                { slot: 'Cargador', item: 'Cargador Rápido DashLine' }
            ]
        },
        secundaria: {
            nombre: 'AK-27', rol: 'SECUNDARIA', tipo: 'Fusil de Asalto', tier: 'S',
            imagen: '/weapons/gold/AK-27.png',
            color: '#3B82F6',
            attachments: [
                { slot: 'Óptica', item: 'VAS LED' },
                { slot: 'Bocacha', item: 'Compensador EMT3' },
                { slot: 'Cañón', item: 'Cañón Pesado Vandal 17.6"' },
                { slot: 'Cargador', item: 'Tambor Pesado Saber Pack' },
                { slot: 'Bajo Cañón', item: 'Empuñadura Lateral Precision' }
            ]
        },
        stats: { movilidad: 60, daño: 90, rango: 95, facilidad: 62 },
        color: '#00FF87'
    }
];

// ── Iconos propios (SVG line-tactical, heredan el color via currentColor) ──
const ICON_PATHS = {
    agresivo:  '<path d="M4 5L11 12L4 19"/><path d="M12 5L19 12L12 19"/>',
    sniper:    '<circle cx="12" cy="12" r="7.5"/><line x1="12" y1="1.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22.5" y2="12"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
    meta:      '<path d="M12 2L20 7L20 17L12 22L4 17L4 7Z"/><path d="M12 8L13.2 10.8L16 12L13.2 13.2L12 16L10.8 13.2L8 12L10.8 10.8Z" fill="currentColor" stroke="none"/>',
    resurgence:'<path d="M19 12a7 7 0 1 1-2.05-4.95"/><polyline points="13.4 6.6 16.95 7.05 16.6 3.5"/>',
    bor:       '<rect x="3.5" y="9" width="17" height="11" rx="1"/><path d="M3.5 9L6 4.2H18L20.5 9"/><line x1="12" y1="4.2" x2="12" y2="20"/>',
    ranked:    '<path d="M5 10L12 6L19 10"/><path d="M5 14L12 10L19 14"/><path d="M5 18L12 14L19 18"/>',
    br:        '<circle cx="12" cy="12" r="9" stroke-dasharray="3.5 3"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>'
};
function svgIcono(key, size = 22) {
    const p = ICON_PATHS[key] || '';
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block">${p}</svg>`;
}

const TIER_COLORS = { S: '#FF9500', A: '#00FF87', B: '#00A8FF', C: '#BF5FFF' };
const MODO_INFO = {
    'battle_royale':   { icon: 'br',         label: 'BATTLE ROYALE' },
    'resurgence':      { icon: 'resurgence', label: 'RESURGENCE' },
    'black_ops_royale':{ icon: 'bor',        label: 'BLACK OPS ROYALE' },
    'clasificatorio':  { icon: 'ranked',     label: 'CLASIFICATORIO' }
};

const SLOT_COLORS_C = {
    'óptica': '#00A8FF', 'bocacha': '#FF9500', 'cañón': '#00FF87',
    'culata': '#BF5FFF', 'cargador': '#EF4444', 'bajo cañón': '#F97316',
    'empuñadura': '#06B6D4', 'mod. disparo': '#EC4899', 'láser': '#84CC16',
    'arquetipo': '#FF9500', 'mejora': '#00FF87', 'nota': '#7A8494', 'consejo': '#7A8494'
};

function getSlotColorClase(slot) {
    const k = slot.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [key, color] of Object.entries(SLOT_COLORS_C)) {
        const nk = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (k.includes(nk)) return color;
    }
    return '#6B7280';
}

function renderModosBadges(modos) {
    return modos.map(m => {
        const info = MODO_INFO[m] || { icon: '', label: m };
        return `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,149,0,0.1);border:1px solid rgba(255,149,0,0.3);color:#FF9500;
              font-family:var(--font-mono);font-size:9px;letter-spacing:2px;padding:3px 9px;">
            ${svgIcono(info.icon, 12)}${info.label}
        </span>`;
    }).join('');
}

// ════════════ LOADOUTS EN VIVO (desde meta_warzone.json) ════════════
// Las clases leen los attachments verificados de meta_warzone.json al cargar.
// Si el scraper actualiza un loadout, la clase se actualiza sola (y al
// re-hornear, también para Google). Si el fetch falla o falta el arma,
// se usa el loadout que viene en el array CLASES (fallback).

let META_LOADOUTS = null;

const _norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Traducción de slots (inglés/scraper → convención del sitio)
const SLOT_MAP = {
    'mira': 'Óptica', 'optic': 'Óptica', 'optica': 'Óptica',
    'boca de cañon': 'Bocacha', 'muzzle': 'Bocacha',
    'cañon': 'Cañón', 'barrel': 'Cañón',
    'cargador': 'Cargador', 'magazine': 'Cargador', 'mag': 'Cargador',
    'culata': 'Culata', 'stock': 'Culata',
    'acople': 'Bajo Cañón', 'underbarrel': 'Bajo Cañón',
    'empuñadura': 'Empuñadura', 'empuñadura trasera': 'Empuñadura', 'rear grip': 'Empuñadura', 'grip': 'Empuñadura',
    'laser': 'Láser', 'mods de disparo': 'Mod. Disparo', 'fire mods': 'Mod. Disparo'
};
// Sustantivo de tipo del attachment → español (se mueve al frente)
const _TIPO = {
    'suppressor': 'Silenciador', 'compensator': 'Compensador', 'brake': 'Freno',
    'barrel': 'Cañón', 'magazine': 'Cargador', 'mag': 'Cargador', 'loader': 'Cargador',
    'drum': 'Tambor', 'stock': 'Culata', 'handstop': 'Empuñadura', 'grip': 'Empuñadura',
    'foregrip': 'Empuñadura', 'guard': 'Guardamanos', 'handguard': 'Guardamanos',
    'laser': 'Láser', 'comb': 'Peine'
};
// Adjetivos comunes
const _ADJ = {
    'monolithic': 'Monolítico', 'heavy': 'Pesado', 'rapid': 'Rápido', 'extended': 'Ampliado',
    'fast': 'Rápido', 'light': 'Ligero', 'tactical': 'Táctico', 'precision': 'Precisión',
    'speed': 'Rápido', 'weighted': 'Lastrada', 'reinforced': 'Reforzado', 'reserve': 'Reserva',
    'vertical': 'Vertical', 'lateral': 'Lateral', 'quickdraw': 'Desenfunde'
};

function traducirSlot(s) {
    const k = _norm(s);
    return SLOT_MAP[k] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
}

function traducirItem(item) {
    if (!item) return '';
    let tipoEs = null;
    const resto = [];
    item.split(/\s+/).forEach(w => {
        const lw = w.toLowerCase().replace(/[.,]/g, '');
        if (_TIPO[lw] && !tipoEs) tipoEs = _TIPO[lw];
        else resto.push(_ADJ[lw] || w);
    });
    const r = resto.join(' ').trim();
    return tipoEs ? (r ? `${tipoEs} ${r}` : tipoEs) : item;
}

const _RE_OPTICA_CLASES = /mira|óptica|optica|optic/i;
const _RE_LASER_CLASES = /láser|laser/i;

// Devuelve los attachments a renderizar: del JSON si están, si no el fallback.
function attachmentsDe(arma) {
    if (arma.rol && arma.rol.includes('LOOT')) return arma.attachments; // BOR usa arquetipos, no se sincroniza
    if (META_LOADOUTS) {
        const lo = META_LOADOUTS[_norm(arma.nombre)];
        if (lo && lo.length) {
            // Sanity check contra el fallback propio (codmunity, playstyle
            // verificado y matcheado al rango real):
            //  1) sin mira en meta_warzone.json pero con mira confirmada en
            //     el propio -> usar el propio
            //  2) con laser en meta_warzone.json pero el propio (verificado
            //     sin ambiguedad) no lo tiene -> usar el propio (el laser
            //     delata posicion en armas de precision; no se generaliza a
            //     todo sniper, hay excepciones reales como Shadow SK)
            const loTieneOptica = lo.some(x => _RE_OPTICA_CLASES.test(x.slot || ''));
            const propioTieneOptica = Array.isArray(arma.attachments) &&
                arma.attachments.some(x => _RE_OPTICA_CLASES.test(x.slot || ''));
            const loTieneLaser = lo.some(x => _RE_LASER_CLASES.test(x.slot || ''));
            const propioTieneLaser = Array.isArray(arma.attachments) &&
                arma.attachments.some(x => _RE_LASER_CLASES.test(x.slot || ''));

            const faltaOptica = !loTieneOptica && propioTieneOptica;
            const laserDudoso = loTieneLaser && Array.isArray(arma.attachments) && !propioTieneLaser;
            if (!(faltaOptica || laserDudoso)) {
                return lo;
            }
        }
    }
    return arma.attachments; // fallback (loadout del array CLASES)
}

function _modoActual() {
    const b = document.querySelector('.nav-modo.active');
    return b ? b.dataset.modo : 'battle_royale';
}

async function cargarMeta() {
    try {
        const r = await fetch('/meta_warzone.json', { cache: 'no-cache' });
        if (!r.ok) return;
        const data = await r.json();
        const arr = Array.isArray(data) ? data : (data.armas || []);
        const map = {};
        arr.forEach(a => {
            const nom = a.arma || a.nombre;
            const att = a.attachments;
            if (nom && Array.isArray(att) && att.length) {
                map[_norm(nom)] = att.map(x => ({
                    slot: traducirSlot(x.slot || x.tipo || ''),
                    item: traducirItem(x.item || x.nombre || '')
                }));
            }
        });
        META_LOADOUTS = map;
        // Tier CANONICO en vivo: los tiers escritos en CLASES son una foto del
        // dia en que se curo la clase; aca se pisan con el tier sincronizado
        // de armas-data.json (_catRank de meta-core, el mismo del resto del sitio).
        try {
            const r2 = await fetch('/armas-data.json', { cache: 'no-cache' });
            if (r2.ok) {
                const d2 = await r2.json();
                const tierPorNombre = {};
                Object.values(d2.armas || {}).forEach(a => {
                    if (!a || !a.nombre) return;
                    const cr = a._catRank;
                    const t = (cr != null)
                        ? (cr <= 2 ? 'S' : cr <= 5 ? 'A' : cr <= 9 ? 'B' : 'C')
                        : (a.tier || null);
                    if (t) tierPorNombre[_norm(a.nombre)] = t;
                });
                (typeof CLASES !== 'undefined' ? CLASES : []).forEach(c => {
                    Object.values(c).forEach(v => {
                        if (v && typeof v === 'object' && v.nombre && v.tier) {
                            const t = tierPorNombre[_norm(v.nombre)];
                            if (t) v.tier = t;
                        }
                    });
                });
            }
        } catch (e2) { /* sin armas-data: quedan los tiers de respaldo */ }
        if (typeof renderTodas === 'function') renderTodas(_modoActual()); // re-render con loadouts en vivo
    } catch (e) {
        console.warn('[CLASES] meta_warzone.json no disponible, uso loadouts de respaldo');
    }
}

document.addEventListener('DOMContentLoaded', cargarMeta);
// ═════════════════════════════════════════════════════════════════════

function renderArmaPanel(arma, accentColor) {
    const attachHtml = attachmentsDe(arma).map(at => {
        const c = getSlotColorClase(at.slot);
        return `<div class="attach-mini">
            <span class="attach-mini-dot" style="background:${c}"></span>
            <span class="attach-mini-slot">${at.slot}</span>
            <span class="attach-mini-item">${at.item}</span>
        </div>`;
    }).join('');

    return `
    <div class="arma-panel">
        <div class="arma-panel-header" style="border-color:${accentColor}22">
            <div class="arma-panel-meta">
                <span class="arma-panel-rol">${arma.rol}</span>
                <div class="arma-panel-nombre">${arma.nombre}</div>
                <div class="arma-panel-tipo">
                    <span class="tier-pip" style="background:${TIER_COLORS[arma.tier]}"></span>
                    TIER ${arma.tier} · ${arma.tipo}
                </div>
            </div>
            <img class="arma-panel-img" src="${arma.imagen}" alt="${arma.nombre}" onerror="this.style.display='none'">
        </div>
        <div class="arma-attachments">${attachHtml}</div>
    </div>`;
}

function renderStat(label, val, color) {
    return `<div class="cstat">
        <div class="cstat-header">
            <span class="cstat-label">${label}</span>
            <span class="cstat-val" style="color:${color}">${val}</span>
        </div>
        <div class="cstat-track">
            <div class="cstat-fill" style="background:${color}" data-w="${val}%"></div>
        </div>
    </div>`;
}

function renderClase(c, i) {
    return `
    <div class="combo-card" style="--accent:${c.color};animation-delay:${i*80}ms">
        <div class="combo-top">
            <div class="combo-badge" style="background:${c.color}15;border-color:${c.color}44">
                <span class="combo-icon" style="color:${c.color};display:inline-flex;align-items:center">${svgIcono(c.icono, 22)}</span>
                <div>
                    <div class="combo-estilo" style="color:${c.color}">${c.estilo}</div>
                    <div class="combo-nombre">${c.nombre}</div>
                </div>
            </div>
            <span class="combo-diff">${c.dificultad}</span>
        </div>

        <div style="padding:8px 18px;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--border)">
            ${renderModosBadges(c.modos)}
        </div>

        <div class="combo-weapons">
            ${renderArmaPanel(c.primaria, c.primaria.color)}
            <div class="combo-vs">VS</div>
            ${renderArmaPanel(c.secundaria, c.secundaria.color)}
        </div>

        <div class="combo-stats-row">
            ${renderStat('MOVILIDAD', c.stats.movilidad, c.color)}
            ${renderStat('DAÑO',      c.stats.daño,      c.color)}
            ${renderStat('RANGO',     c.stats.rango,     c.color)}
            ${renderStat('FACILIDAD', c.stats.facilidad, c.color)}
        </div>

        <div class="combo-desc">${c.descripcion}</div>
    </div>`;
}

function renderTodas(filtro = 'todos') {
    console.log('[CLASES] renderTodas:', filtro);
    const grid = document.getElementById('combos-grid');
    if (!grid) {
        console.error('[CLASES] No se encontró #combos-grid');
        return;
    }
    const lista = filtro === 'todos'
        ? CLASES
        : CLASES.filter(c => c.modos.includes(filtro));

    console.log('[CLASES] Encontradas:', lista.length);

    if (!lista.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;font-family:var(--font-mono);color:var(--text-muted)">SIN CLASES PARA ESTE MODO</div>`;
        return;
    }
    grid.innerHTML = lista.map((c, i) => renderClase(c, i)).join('');
    requestAnimationFrame(() => {
        setTimeout(() => {
            document.querySelectorAll('.cstat-fill[data-w]').forEach(el => {
                el.style.width = el.dataset.w;
            });
        }, 200);
    });
}
