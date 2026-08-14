/* ═══════════════════════════════════════════════
   WZ META · armas.js v5
   Carga datos desde armas-data.json +
   cruza rankings frescos desde meta_warzone.json
   (top actualizado diario por el scraper).

   Cambios v5:
   - TYPE_MAPPING sincronizado con el vocabulario real del dato:
     'Rifle de francotirador' → Sniper (antes quedaba sin mapear)
     'Fusil táctico' → Marksman
     'Especial' + 'Lanzador' + 'Ballesta' → Especial (botón único)
     'Cuerpo a cuerpo' → Melee
   - Arregla los filtros SNIPER y MARKSMAN, que estaban rotos por
     desfase entre las claves del mapping y los tipos del JSON
   - Nuevo botón ESPECIAL en las pestañas 'all' y 'corta'
   - La tabla sigue mostrando la clase real (tipoOriginal): el
     agrupamiento es solo del filtro, el dato queda honesto

   Cambios v4:
   - Cruce automático meta_warzone.json + armas-data.json
   - Las armas que están en meta_warzone usan ESE ranking
     (siempre fresco), no el del catálogo (semanal)
   - Separador visual "META ACTUAL" / "CATÁLOGO COMPLETO"
   - Normalización de nombres robusta (sin acentos, puntos, etc.)
   ═══════════════════════════════════════════════ */

// ───────────────────────────────────────────────
// CONFIGURACIÓN
// ───────────────────────────────────────────────
const TYPE_MAPPING = {
    'Subfusil':                { internal: 'SMG',      range: 'corta', versatile: false },
    'Fusil de asalto':         { internal: 'AR',       range: 'mixto', versatile: true  },
    'Ametralladora ligera':    { internal: 'LMG',      range: 'larga', versatile: false },
    'Rifle de francotirador':  { internal: 'Sniper',   range: 'larga', versatile: false },
    'Fusil de precisión':      { internal: 'Sniper',   range: 'larga', versatile: false }, // alias por si el scraper lo emite
    'Fusil táctico':           { internal: 'Marksman', range: 'larga', versatile: false },
    'Marksman':                { internal: 'Marksman', range: 'larga', versatile: false }, // alias
    'Escopeta':                { internal: 'Shotgun',  range: 'corta', versatile: false },
    'Pistola':                 { internal: 'Pistol',   range: 'corta', versatile: false },
    'Especial':                { internal: 'Especial', range: 'corta', versatile: false },
    'Lanzador':                { internal: 'Especial', range: 'corta', versatile: false },
    'Ballesta':                { internal: 'Especial', range: 'corta', versatile: false },
    'Cuerpo a cuerpo':         { internal: 'Melee',    range: 'corta', versatile: false },
};

const TYPES_BY_RANGE = {
    all:   ['SMG', 'AR', 'Shotgun', 'Pistol', 'Sniper', 'Marksman', 'LMG', 'Especial'],
    corta: ['SMG', 'AR', 'Shotgun', 'Pistol', 'Especial'],
    larga: ['AR', 'Sniper', 'Marksman', 'LMG']
};

// ───────────────────────────────────────────────
// ESTADO
// ───────────────────────────────────────────────
const state = {
    range: 'all',
    type: 'all',
    tier: 'all',
    flag: 'all',
    search: '',
    sort: 'ranking',
    sortDir: 'asc'
};

let WEAPONS = [];
let MAX_PICK_RATE = 1;
let focusedAcIndex = -1;
let currentAcItems = [];

// ───────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function parsePickRate(str) {
    return parseFloat((str || '0').replace('%', '')) || 0;
}

function getTier(ranking) {
    if (ranking <= 5)  return 'S';
    if (ranking <= 15) return 'A';
    if (ranking <= 30) return 'B';
    return 'C';
}

// Asigna tiers por categoría táctica usando _catRank (TTK de meta-core.js) si está
// disponible, o ranking global como fallback. Umbrales: S≤2, A≤5, B≤9, C resto.
function computeCategoryTiers() {
    // Tier CANONICO: derivado del _catRank de meta-core (el mismo numero que
    // usan el home y las fichas), con los mismos umbrales que tierDe().
    // Nunca por posicion dentro de un grupo propio: agrupar distinto que
    // meta-core daba tiers contradictorios (ej. VST B aca / A en la ficha).
    WEAPONS.forEach(w => {
        if (!w.inMeta) return;
        const r = w._catRank;
        if (r != null) {
            w.tier = r <= 2 ? 'S' : r <= 5 ? 'A' : r <= 9 ? 'B' : 'C';
        } else if (w.tierCanon) {
            w.tier = w.tierCanon;   // sync diario de armas-data (fallback)
        }
    });
}

function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\./g, '-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// NUEVO v4: normalización robusta de nombres para matching entre JSONs
function normalizeWeaponName(name) {
    return (name || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

// ───────────────────────────────────────────────
// NUEVO v4: cargar rankings frescos desde meta_warzone.json
// ───────────────────────────────────────────────
async function loadFreshRankings() {
    try {
        const res = await fetch('meta_warzone.json?v=' + Date.now());
        if (!res.ok) {
            console.warn('[ARMAS] meta_warzone.json no disponible, usando rankings del catálogo');
            return new Map();
        }
        const data = await res.json();
        const map = new Map();

        data.forEach(w => {
            if (w.arma && w.ranking) {
                const key = normalizeWeaponName(w.arma);
                map.set(key, {
                    ranking:  w.ranking,
                    pickRate: w.pick_rate,
                    esNuevo:  w.es_nuevo === true,
                    esBuff:   w.es_buff === true,
                });
            }
        });

        console.log(`[ARMAS] Rankings frescos cargados: ${map.size} armas en el meta`);
        return map;
    } catch (err) {
        console.warn('[ARMAS] Error cargando rankings frescos:', err.message);
        return new Map();
    }
}

// ───────────────────────────────────────────────
// TRANSFORMAR datos
// ───────────────────────────────────────────────
function transformWeapons(raw) {
    return raw.map(w => {
        const mapping = TYPE_MAPPING[w.tipo_arma] || { internal: w.tipo_arma, range: 'corta', versatile: false };

        let rangos = [];
        if (mapping.range === 'corta') rangos = ['corta'];
        else if (mapping.range === 'larga') rangos = ['larga'];
        else if (mapping.range === 'mixto') {
            if (w.categoria_tactica === 'Corto Alcance') rangos = ['corta', 'larga'];
            else if (w.categoria_tactica === 'Largo Alcance') rangos = ['larga', 'corta'];
            else rangos = ['larga'];
        }

        const flags = [];
        if (w.es_nuevo) flags.push('new');
        if (w.es_buff) flags.push('buff');
        if (mapping.versatile && rangos.length > 1) flags.push('versatile');

        const tier = getTier(w.ranking);
        const pickNum = parsePickRate(w.pick_rate);

        return {
            id: w.slug || slugify(w.arma),
            nombre: w.arma,
            tipo: mapping.internal,
            tipoOriginal: w.tipo_arma,
            categoriaTactica: w.categoria_tactica,
            tier: tier,
            pickRate: pickNum,
            pickRateStr: w.pick_rate,
            ranking: w.ranking,
            rangos: rangos,
            flags: flags,
            imagen: w.imagen_url,
            modos: w.modos || [],
            codigo: w.codigo || '',
            _catRank: w._catRankCanon ?? undefined,
            _autoRank: w._autoRankCanon ?? undefined,
            tierCanon: w.tierCanon || null,
            inMeta: w.ranking < 9999  // NUEVO v4: flag para saber si está en meta
        };
    });
}

// ───────────────────────────────────────────────
// URL PARAMS
// ───────────────────────────────────────────────
function loadFromURL() {
    const p = new URLSearchParams(window.location.search);
    if (p.has('range') && ['all', 'corta', 'larga'].includes(p.get('range'))) state.range = p.get('range');
    if (p.has('type')) state.type = p.get('type');
    if (p.has('tier')) state.tier = p.get('tier');
    if (p.has('flag')) state.flag = p.get('flag');
    if (p.has('q')) state.search = p.get('q');
}

function updateURL() {
    const p = new URLSearchParams();
    if (state.range !== 'all') p.set('range', state.range);
    if (state.type !== 'all') p.set('type', state.type);
    if (state.tier !== 'all') p.set('tier', state.tier);
    if (state.flag !== 'all') p.set('flag', state.flag);
    if (state.search) p.set('q', state.search);
    const url = p.toString() ? `?${p.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', url);
}

// ───────────────────────────────────────────────
// FILTROS Y SORT
// ───────────────────────────────────────────────
function getBaseFilteredForTable() {
    let list = state.range === 'all'
        ? WEAPONS.slice()
        : WEAPONS.filter(w => w.rangos.includes(state.range));
    if (state.type !== 'all') list = list.filter(w => w.tipo === state.type);
    if (state.tier !== 'all') list = list.filter(w => w.tier === state.tier);
    if (state.flag !== 'all') list = list.filter(w => w.flags.includes(state.flag));
    if (state.search) {
        const s = state.search.toLowerCase();
        list = list.filter(w =>
            w.nombre.toLowerCase().includes(s) ||
            w.tipo.toLowerCase().includes(s) ||
            w.tipoOriginal.toLowerCase().includes(s)
        );
    }
    return sortList(list);
}

function sortList(list) {
    const key = state.sort;
    const dir = state.sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
        if (key === 'tier') {
            const order = { S: 0, A: 1, B: 2, C: 3 };
            return (order[a.tier] - order[b.tier]) * dir;
        }
        if (key === 'ranking') {
            // Filtro de categoría activo + misma categoría táctica: usar _catRank (TTK)
            if (state.range !== 'all' &&
                a._catRank != null && b._catRank != null &&
                a.categoriaTactica === b.categoriaTactica) {
                return (a._catRank - b._catRank) * dir;
            }
            // Vista global: usar _autoRank (nuestro sistema TTK, igual que el home)
            const ra = a._autoRank || a.ranking || 9999;
            const rb = b._autoRank || b.ranking || 9999;
            return (ra - rb) * dir;
        }
        if (typeof a[key] === 'string') return a[key].localeCompare(b[key]) * dir;
        return (a[key] - b[key]) * dir;
    });
}

// ───────────────────────────────────────────────
// NUEVO v4: render del separador visual entre meta y catálogo
// ───────────────────────────────────────────────
function renderSeparator(title, subtitle) {
    return `
        <tr class="meta-divider">
            <td colspan="7" class="meta-divider-cell">
                <span class="divider-label">▸ ${title}</span>
                ${subtitle ? `<span class="divider-sub">${subtitle}</span>` : ''}
            </td>
        </tr>
    `;
}

// ───────────────────────────────────────────────
// RENDER
// ───────────────────────────────────────────────
function renderTypePills() {
    const types = TYPES_BY_RANGE[state.range];
    const typePills = $('#typePills');
    typePills.innerHTML =
        `<button class="pill ${state.type === 'all' ? 'active' : ''}" data-type="all">TODAS</button>` +
        types.map(t => `<button class="pill ${state.type === t ? 'active' : ''}" data-type="${t}">${t.toUpperCase()}</button>`).join('');
}

function renderTable() {
    const list = getBaseFilteredForTable();
    const tbody = $('#weaponsTbody');
    const table = $('#weaponsTable');
    const emptyState = $('#emptyState');
    const resultsCount = $('#resultsCount');

    resultsCount.textContent = list.length;

    if (list.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = '';
    emptyState.style.display = 'none';

    // NUEVO v4: solo mostrar separadores cuando el sort es por ranking
    const showDividers = state.sort === 'ranking' && state.sortDir === 'asc';

    let html = '';
    let metaSeparatorAdded = false;
    let catalogSeparatorAdded = false;
    const metaCount = list.filter(w => w.inMeta).length;
    const catalogCount = list.length - metaCount;

    list.forEach((w, idx) => {
        // Insertar separador "META ACTUAL" antes de la primera arma del meta
        if (showDividers && !metaSeparatorAdded && w.inMeta) {
            html += renderSeparator('META ACTUAL', `Top ${metaCount} actualizado diariamente`);
            metaSeparatorAdded = true;
        }

        // Insertar separador "CATÁLOGO COMPLETO" antes de la primera arma fuera del meta
        if (showDividers && !catalogSeparatorAdded && !w.inMeta && idx > 0) {
            html += renderSeparator('CATÁLOGO COMPLETO', `${catalogCount} arma${catalogCount === 1 ? '' : 's'} no-meta`);
            catalogSeparatorAdded = true;
        }

        const flagsHTML = w.flags.map(f => {
            if (f === 'new') return '<span class="status-mini new">NEW</span>';
            if (f === 'buff') return '<span class="status-mini buff">BUFF</span>';
            if (f === 'versatile') return '<span class="status-mini versatile">VERSÁTIL</span>';
            return '';
        }).join('');

        const pickPct = (w.pickRate / MAX_PICK_RATE) * 100;
        const sClass = w.tier === 'S' ? 'is-s-tier' : '';
        const metaRowClass = w.inMeta ? 'is-meta' : 'is-catalog';

        const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns='http%3A//www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='none' stroke='%23F0C419' stroke-opacity='0.2'/%3E%3Ctext x='50' y='28' text-anchor='middle' fill='%23F0C419' font-size='8' opacity='0.5'%3E${encodeURIComponent(w.nombre)}%3C/text%3E%3C/svg%3E`;

        // Pick rate visual: ocultar cuando no está en meta (no tiene dato confiable)
        const pickRateCell = w.inMeta ? `
            <div class="pickrate-cell">
                <div class="pickrate-bar"><div class="pickrate-fill" style="width:${pickPct}%"></div></div>
                <span class="pickrate-value">${w.pickRateStr}</span>
            </div>
        ` : `<span style="color:rgba(255,255,255,0.2);font-family:monospace;font-size:0.7rem;">—</span>`;

        // Ranking visual — usa _autoRank (nuestro TTK) con fallback al scraper
        const dispRank = w._autoRank || w.ranking;
        const rankingDisplay = w.inMeta
            ? `<span class="rank-num ${dispRank <= 3 ? 'top-3' : ''}">#${dispRank}</span>`
            : `<span class="rank-num" style="opacity:0.3">—</span>`;

        html += `
        <tr class="${sClass} ${metaRowClass}" data-id="${w.id}" onclick="goToWeapon('${w.id}')">
            <td class="col-icon">
                <div class="weapon-icon-cell">
                    <img src="${w.imagen}" alt="${w.nombre}" loading="lazy"
                         onerror="this.onerror=null;this.src='${fallbackSvg}';this.style.opacity='0.6'">
                </div>
            </td>
            <td class="col-name"><span class="weapon-name-cell">${w.nombre}</span></td>
            <td class="col-type"><span class="weapon-type-cell">${w.tipoOriginal}</span></td>
            <td class="col-tier"><span class="tier-inline" data-tier="${w.tier}">${w.tier}</span></td>
            <td class="col-rank">${rankingDisplay}</td>
            <td class="col-flags"><div class="status-flags-cell">${flagsHTML || '<span style="color:rgba(255,255,255,0.2);font-family:monospace;font-size:0.7rem;">—</span>'}</div></td>
            <td class="col-action">
                <a href="armas/${w.id}" class="row-action" onclick="event.stopPropagation()">
                    VER <span>→</span>
                </a>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
}

function goToWeapon(id) {
    window.location.href = `armas/${id}`;
}
window.goToWeapon = goToWeapon;

// ───────────────────────────────────────────────
// SORT EN COLUMNAS
// ───────────────────────────────────────────────
function setSort(key) {
    if (state.sort === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        state.sort = key;
        state.sortDir = (key === 'tier' || key === 'ranking' || key === 'nombre') ? 'asc' : 'desc';
    }

    $$('#weaponsTable th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === state.sort) {
            th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });

    renderTable();
}

// ───────────────────────────────────────────────
// AUTOCOMPLETE
// ───────────────────────────────────────────────
function highlightMatch(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function buildAutocomplete(query) {
    const autocomplete = $('#autocomplete');

    if (!query || query.length < 1) {
        autocomplete.classList.remove('open');
        currentAcItems = [];
        return;
    }

    const q = query.toLowerCase();
    const matches = WEAPONS.filter(w =>
        w.nombre.toLowerCase().includes(q) ||
        w.tipo.toLowerCase().includes(q) ||
        w.tipoOriginal.toLowerCase().includes(q)
    ).sort((a, b) => {
        const aStarts = a.nombre.toLowerCase().startsWith(q);
        const bStarts = b.nombre.toLowerCase().startsWith(q);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.ranking - b.ranking;
    }).slice(0, 8);

    if (matches.length === 0) {
        autocomplete.innerHTML = `
            <div class="ac-empty">
                Sin resultados para <strong style="color:#F0C419">"${query}"</strong>
            </div>
            <div class="ac-footer">
                Presiona <kbd>Enter</kbd> para buscar de todos modos
            </div>
        `;
        autocomplete.classList.add('open');
        currentAcItems = [];
        return;
    }

    currentAcItems = matches;
    focusedAcIndex = -1;

    autocomplete.innerHTML = `
        <div class="ac-section-label">▸ ${matches.length} ${matches.length === 1 ? 'arma encontrada' : 'armas encontradas'}</div>
        ${matches.map((w, i) => `
            <a href="armas/${w.id}" class="ac-item" data-index="${i}">
                <span class="ac-tier" data-tier="${w.tier}">${w.tier}</span>
                <div class="ac-info">
                    <div class="ac-name">${highlightMatch(w.nombre, query)}</div>
                    <div class="ac-meta">${w.tipoOriginal}${w.inMeta ? ` · #${w.ranking} META` : ' · CATÁLOGO'}</div>
                </div>
                ${w.inMeta ? `<span class="ac-rank">#${w.ranking}</span>` : ''}
            </a>
        `).join('')}
        <div class="ac-footer">
            <kbd>↑</kbd><kbd>↓</kbd> navegar · <kbd>Enter</kbd> abrir · <kbd>Esc</kbd> cerrar
        </div>
    `;
    autocomplete.classList.add('open');
}

function updateAcFocus() {
    $$('#autocomplete .ac-item').forEach((el, i) => {
        el.classList.toggle('focused', i === focusedAcIndex);
        if (i === focusedAcIndex) el.scrollIntoView({ block: 'nearest' });
    });
}

// ───────────────────────────────────────────────
// EVENTOS
// ───────────────────────────────────────────────
function attachEventListeners() {
    const searchInput = $('#searchInput');
    const searchClear = $('#searchClear');
    const autocomplete = $('#autocomplete');
    const typePills = $('#typePills');

    $$('.range-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.range-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.range = tab.dataset.range;
            state.type = 'all';
            renderTypePills();
            renderTable();
            updateURL();
        });
    });

    typePills.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        $$('#typePills .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.type = pill.dataset.type;
        renderTable();
        updateURL();
    });

    $('#tierPills').addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        $$('#tierPills .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.tier = pill.dataset.tierFilter;
        renderTable();
        updateURL();
    });

    $('#flagPills').addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        $$('#flagPills .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.flag = pill.dataset.flag;
        renderTable();
        updateURL();
    });

    $$('#weaponsTable th[data-sort]').forEach(th => {
        th.addEventListener('click', () => setSort(th.dataset.sort));
    });

    let searchTimer;
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        searchClear.classList.toggle('visible', val.length > 0);
        buildAutocomplete(val);

        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.search = val.trim();
            renderTable();
            updateURL();
        }, 150);
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length > 0) buildAutocomplete(searchInput.value);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (!autocomplete.classList.contains('open') || currentAcItems.length === 0) {
            if (e.key === 'Escape') {
                searchInput.blur();
                autocomplete.classList.remove('open');
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedAcIndex = Math.min(focusedAcIndex + 1, currentAcItems.length - 1);
            updateAcFocus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedAcIndex = Math.max(focusedAcIndex - 1, -1);
            updateAcFocus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedAcIndex >= 0 && currentAcItems[focusedAcIndex]) {
                window.location.href = `armas/${currentAcItems[focusedAcIndex].id}`;
            }
        } else if (e.key === 'Escape') {
            autocomplete.classList.remove('open');
            searchInput.blur();
        }
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        state.search = '';
        searchClear.classList.remove('visible');
        autocomplete.classList.remove('open');
        renderTable();
        updateURL();
        searchInput.focus();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            autocomplete.classList.remove('open');
        }
    });
}

// ───────────────────────────────────────────────
// ADAPTADOR · armas-data.json → formato legacy + cruce con rankings frescos
// ───────────────────────────────────────────────
function adaptArmasDataToLegacyFormat(armasData, freshRankings = new Map()) {
    const armasObj = armasData.armas || {};
    const list = [];

    const RANGO_TO_CATEGORIA = {
        'Largo Alcance':  'Largo Alcance',
        'Corto Alcance':  'Corto Alcance',
        'Medio Alcance':  'Medio Alcance',
    };

    let metaMatches = 0;
    let catalogOnly = 0;

    for (const [slug, arma] of Object.entries(armasObj)) {
        const nombreKey = normalizeWeaponName(arma.nombre || slug);
        const fresh = freshRankings.get(nombreKey);

        // Si está en el meta_warzone.json, usa esos datos (frescos)
        // Si no, usa los del catálogo (semanal) o defaults
        const ranking   = fresh ? fresh.ranking  : (arma.ranking ?? 9999);
        const pick_rate = fresh ? fresh.pickRate : (arma.pick_rate || '0%');
        const es_nuevo  = fresh ? fresh.esNuevo  : (arma.es_nuevo === true);
        const es_buff   = fresh ? fresh.esBuff   : (arma.es_buff === true);

        if (fresh) metaMatches++;
        else catalogOnly++;

        list.push({
            slug:              slug,
            arma:              arma.nombre || slug,
            tipo_arma:         arma.tipo || '',
            categoria_tactica: RANGO_TO_CATEGORIA[arma.rango] || arma.rango || '',
            ranking:           ranking,
            pick_rate:         pick_rate,
            es_nuevo:          es_nuevo,
            es_buff:           es_buff,
            imagen_url:        arma.imagen || '',
            modos:             arma.modos || [],
            codigo:            (arma.loadouts && arma.loadouts[0] && arma.loadouts[0].codigo) || '',
            // canon sincronizado a diario por _build/export_rankings.py
            _catRankCanon:     arma._catRank ?? null,
            _autoRankCanon:    arma._autoRank ?? null,
            tierCanon:         arma.tier || null,
        });
    }

    console.log(`[ARMAS] Cruce: ${metaMatches} en meta · ${catalogOnly} solo catálogo`);

    // Ordenar: primero las del meta (ranking 1-15), después las del catálogo (9999)
    // Dentro de "solo catálogo" (ranking == 9999), sub-ordenar alfabéticamente
    list.sort((a, b) => {
        const ra = a.ranking || 9999;
        const rb = b.ranking || 9999;
        if (ra !== rb) return ra - rb;
        // Mismo ranking (probablemente ambos 9999) → alfabético
        return (a.arma || '').localeCompare(b.arma || '');
    });

    return list;
}

// ───────────────────────────────────────────────
// CARGA INICIAL
// ───────────────────────────────────────────────
// Schema.org CollectionPage + ItemList del catalogo, para que Google vea
// las 50+ fichas de armas como una lista estructurada (no solo una tabla
// HTML). Se arma desde WEAPONS ya cargado, asi nunca queda desactualizado
// aunque cambie el roster entre parches.
function inyectarItemListSchema() {
    if (!Array.isArray(WEAPONS) || !WEAPONS.length) return;
    const ordenadas = WEAPONS.filter(w => w.inMeta && w.id)
        .slice()
        .sort((a, b) => (a._catRank ?? a.ranking ?? 999) - (b._catRank ?? b.ranking ?? 999));
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Armas Warzone Black Ops 7 — Base de Datos Completa",
        "url": "https://wzmetaloadouts.com/armas",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": ordenadas.length,
            "itemListElement": ordenadas.map((w, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": w.nombre,
                "url": `https://wzmetaloadouts.com/armas/${w.id}`
            }))
        }
    };
    document.querySelectorAll('script[data-schema="item-list"]').forEach(el => el.remove());
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.dataset.schema = 'item-list';
    tag.textContent = JSON.stringify(schema);
    document.head.appendChild(tag);
}

async function init() {
    console.log('[ARMAS] Iniciando carga (v4 con cruce meta+catálogo)...');

    // Cargar AMBOS en paralelo
    const [freshRankings, armasDataRes] = await Promise.all([
        loadFreshRankings(),
        fetch('armas-data.json?v=' + Date.now())
    ]);

    let raw;
    let source;

    if (armasDataRes.ok) {
        let armasData = await armasDataRes.json();
        // Filtro por JUEGO (ej: /armas?juego=bo7 desde el hub de Black Ops 7).
        // Cada arma trae 'juego' (Fase 0). Hoy todas son bo7 → no cambia nada;
        // cuando MW4 integre, /armas?juego=mw4 muestra solo las de MW4. Sin
        // param = Warzone (todas las integradas al momento).
        try {
            const juegoParam = new URLSearchParams(location.search).get('juego');
            if (juegoParam && armasData.armas) {
                const filtradas = {};
                Object.entries(armasData.armas).forEach(([slug, w]) => {
                    if ((w.juego || 'bo7') === juegoParam) filtradas[slug] = w;
                });
                armasData = Object.assign({}, armasData, { armas: filtradas });
                console.log(`[ARMAS] filtrado por juego='${juegoParam}': ${Object.keys(filtradas).length} armas`);
            }
        } catch (e) { /* sin URLSearchParams: sin filtro */ }
        raw = adaptArmasDataToLegacyFormat(armasData, freshRankings);
        source = `armas-data.json + meta_warzone.json (cruzados)`;
    } else {
        console.warn('[ARMAS] armas-data.json falló, fallback a meta_warzone.json puro');
        try {
            const res = await fetch('meta_warzone.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            raw = await res.json();
            source = 'meta_warzone.json (fallback puro)';
        } catch (err) {
            console.error('[ARMAS] Error fatal:', err);
            const tbody = $('#weaponsTbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr><td colspan="8" style="text-align:center;padding:60px;color:#EF4444;font-family:'Share Tech Mono',monospace;letter-spacing:0.15em;">
                        ERROR AL CARGAR DATOS · Revisa la consola
                    </td></tr>
                `;
            }
            return;
        }
    }

    try {
        // Calcular _catRank y _autoRank por TTK usando meta-core.js (igual que el home).
        // Si meta-core.js no está disponible, degrada al ranking del scraper.
        let rankLookup = new Map();
        if (typeof cargarMeta === 'function') {
            try {
                await cargarMeta();   // carga meta_warzone.json + TTK + calcula _catRank/_autoRank
                todasLasArmas.forEach(a => {
                    rankLookup.set(normalizeWeaponName(a.arma), {
                        _catRank:  a._catRank,
                        _autoRank: a._autoRank
                    });
                });
            } catch(e) {
                console.warn('[ARMAS] meta-core TTK no disponible, usando ranking como fallback:', e.message);
            }
        }

        WEAPONS = transformWeapons(raw);
        WEAPONS.forEach(w => {
            const entry = rankLookup.get(normalizeWeaponName(w.nombre));
            if (entry) {
                if (entry._catRank  != null) w._catRank  = entry._catRank;
                if (entry._autoRank != null) w._autoRank = entry._autoRank;
            }
        });
        computeCategoryTiers();
        MAX_PICK_RATE = Math.max(...WEAPONS.filter(w => w.inMeta).map(w => w.pickRate), 1);
        console.log(`[ARMAS] Total: ${WEAPONS.length} desde ${source}`);
        const allCountEl = $('#allCount');
        if (allCountEl) allCountEl.textContent = WEAPONS.length;

        loadFromURL();

        $$('.range-tab').forEach(t => t.classList.toggle('active', t.dataset.range === state.range));
        $$('#tierPills .pill').forEach(p => p.classList.toggle('active', p.dataset.tierFilter === state.tier));
        $$('#flagPills .pill').forEach(p => p.classList.toggle('active', p.dataset.flag === state.flag));

        if (state.search) {
            $('#searchInput').value = state.search;
            $('#searchClear').classList.add('visible');
        }

        $('#weaponsTable th[data-sort="ranking"]')?.classList.add('sort-asc');
        $('#weaponsTable th[data-sort="pickRate"]')?.classList.add('sort-desc');

        renderTypePills();
        renderTable();
        attachEventListeners();
        inyectarItemListSchema();

        if (raw[0]?.timestamp) {
            const ts = document.getElementById('timestamp-display');
            if (ts) ts.textContent = raw[0].timestamp;
        }
    } catch (err) {
        console.error('[ARMAS] Error procesando datos:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
