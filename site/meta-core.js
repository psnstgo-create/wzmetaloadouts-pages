// ════════════════════════════════════════════
//   META-CORE.JS — Motor compartido del meta (v1)
//   Única fuente de verdad para TODO el sitio (home + /armas).
//   Carga meta_warzone.json (+ weapons-official.json, weapon-patches.json),
//   normaliza, calcula TTK + momentum + orden por categoría (_catRank/_autoRank)
//   y tier. Si tocás el ranking, se cambia ACÁ y se actualiza en todas las páginas.
//   Lo usan: app.js (/armas) y home.js (portada).
//   Derivado de app.js v4.6 — misma matemática, sin cambios de lógica.
// ════════════════════════════════════════════
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ── Tier según ranking ──
function getTier(ranking) {
    if (ranking <= 5)  return 'S';
    if (ranking <= 15) return 'A';
    if (ranking <= 30) return 'B';
    return 'C';
}
let todasLasArmas = [];
function colorTipo(tipo) {
    const t = (tipo || '').toLowerCase();
    if (t.includes('ametralladora')) return '#F0C419';
    if (t.includes('subfusil'))      return '#22C55E';
    if (t.includes('asalto'))        return '#3B82F6';
    if (t.includes('escopeta'))      return '#EF4444';
    if (t.includes('precisión') || t.includes('precision') || t.includes('francotirador')) return '#A855F7';
    if (t.includes('marksman') || t.includes('táctico') || t.includes('tactico')) return '#F97316';
    return '#94A3B8';
}
function norm(str) {
    return (str || '').toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ════════════════════════════════════════════
// 🆕 META PERIODISMO: TTK (stats oficiales) + "porqué" (parches)
// Cruza cada arma del home con weapons-official.json y
// weapon-patches.json por un slug derivado del nombre.
// Degrada con gracia: sin datos = sin extras, nada se rompe.
// ════════════════════════════════════════════
let OFICIAL_MAP = {};   // slug -> objeto de stats oficiales
let PATCHES_MAP = {};   // slug -> { nombre, patches:[...] }

// Si algún nombre no calza con su slug real, agrega aquí: 'derivado': 'slug-real'
const SLUG_ALIAS = {
    'cincelador-vst': 'vst', // el home usa "VST" (calza directo); esto cubre si alguna vez aparece "Cincelador VST"
    'executioner-s-duet': 'executioners-duet', // apóstrofe en "Executioner's Duet" rompe el slug derivado del nombre
};

function slugify(nombre) {
    const base = norm(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return SLUG_ALIAS[base] || base;
}

// ── Nombre de accesorio en español (patrón del juego en ES) ──
// El juego muestra "Cañón Bowen Aileron de 47.49 cm" donde codmunity dice
// "18.7\" Bowen Aileron Barrel" (pulgadas → cm exactos, 1" = 2.54 cm).
// Solo transforma lo determinista (unidades + tipo de accesorio); nunca
// inventa nombres. El name original queda para rutas de íconos/matching.
function traducirAccesorioES(name) {
    if (!name) return '';
    const s = String(name);
    const mBarrel = s.match(/^(\d+(?:\.\d+)?)["”]\s+(.+?)\s+Barrel$/i);
    if (mBarrel) {
        // el juego TRUNCA a 2 decimales (18.7" -> 47.49 cm), no redondea
        const cm = (Math.floor(parseFloat(mBarrel[1]) * 2.54 * 100) / 100).toFixed(2);
        return `Cañón ${mBarrel[2]} de ${cm} cm`;
    }
    const REGLAS = [
        [/\s+Suppressor$/i, 'Silenciador'],
        [/\s+Brake$/i, 'Freno'],
        [/\s+Compensator$/i, 'Compensador'],
        [/\s+Foregrip$/i, 'Empuñadura'],
        [/\s+Grip$/i, 'Empuñadura'],
        [/\s+Stock$/i, 'Culata'],
        [/\s+Drum$/i, 'Tambor'],
        [/\s+(?:Extended\s+)?Mags?$/i, 'Cargador'],
        [/\s+Laser(?:\s+Array)?$/i, 'Láser'],
        [/\s+Barrel$/i, 'Cañón'],
        [/\s+Choke$/i, 'Estrangulador'],
        [/\s+Comb$/i, 'Peine'],
        [/\s+Pad$/i, 'Almohadilla'],
        [/\s+Handstop$/i, 'Tope de mano'],
        [/\s+Handguard$/i, 'Guardamanos'],
        [/\s+Riser$/i, 'Elevador'],
    ];
    for (const [re, prefijo] of REGLAS) {
        if (re.test(s)) return `${prefijo} ${s.replace(re, '').trim()}`;
    }
    return s;
}

// Lee un valor de daño que puede venir como número o como { valor: N }
function statVal(x) {
    if (x == null) return null;
    if (typeof x === 'number') return x;
    if (typeof x === 'object' && typeof x.valor === 'number') return x.valor;
    return null;
}

function oficialDeArma(arma) {
    return OFICIAL_MAP[slugify(arma.arma)] || null;
}

// TTK canónico: stk = ceil(EHP/daño); ttkMs = (stk-1)*(60000/rpm)
// EHP 250 = 100 vida + 3 placas (estándar BR/Resurgence)
function calcTTK(oficial, ehp) {
    ehp = ehp || 250;
    if (!oficial) return null;
    const dpp = oficial.dano_por_parte || {};
    const pecho = statVal(dpp.pecho) || statVal(dpp.cuello_pecho_alto);
    const pf = oficial.potencia_de_fuego || {};
    const rpm = Number(pf.cadencia_rpm);
    if (!pecho || !rpm) return null;
    const stk = Math.ceil(ehp / pecho);
    const ttk = Math.round((stk - 1) * (60000 / rpm));
    return { stk, ttk, pecho, rpm, ehp };
}

// El TTK por ráfaga solo tiene sentido en armas automáticas.
// En francotirador/marksman/escopeta la métrica engaña (matan de 1-2 tiros), así que no se muestra.
function ttkAplicaPorTipo(tipo) {
    const t = norm(tipo);
    return t.includes('asalto') || t.includes('subfusil') || t.includes('ametralladora');
}

// ════════════════════════════════════════════
// 🆕 ORDEN AUTOMÁTICO v2: ranking POR CATEGORÍA DE RANGO (no lista global).
// - Largo Alcance se ordena por TTK a distancia (con caída de daño).
// - Corto Alcance se ordena por TTK a quemarropa.
// - Francotirador/Marksman no usan TTK (fallback manual dentro de su categoría).
// Momentum de parches con peso real (±20) para que una nerfeada no quede sobre
// una buffeada cuando el TTK está parejo. Fallback gradual: sin stats = orden
// manual detrás. Nunca se rompe.
// ════════════════════════════════════════════
// ════════════════════════════════════════════
// Pesos del momentum (AJUSTABLES — este es el único lugar para calibrar #5).
// Una nerfeada no debe quedar sobre una buffeada con TTK parejo: por eso buff/nerf
// pesan ±20 y "nuevo" +10. Subí/bajá estos números para tunear el efecto.
// ════════════════════════════════════════════
const PESOS_MOMENTUM = { buff: 20, nerf: -20, nuevo: 10, fix: 0 };

// Momentum del arma. Se DERIVA del último parche verificado (weapon-patches.json):
// suma los pesos de los cambios (buff/nerf/nuevo) de ese parche, con tope ±cap para
// no apilar. Si no hay datos de parche para el arma, cae a los flags manuales del
// meta_warzone.json (es_buff / es_nerfeada / es_nuevo). Más honesto y automático.
function momentumDeArma(arma) {
    const parche = ultimoParcheDeArma(arma);
    if (parche && Array.isArray(parche.cambios) && parche.cambios.length) {
        let m = 0, visto = false;
        parche.cambios.forEach(c => {
            const w = PESOS_MOMENTUM[norm(c.tipo)];
            if (typeof w === 'number') { m += w; visto = true; }
        });
        if (visto) {
            const cap = Math.max(Math.abs(PESOS_MOMENTUM.buff), Math.abs(PESOS_MOMENTUM.nerf));
            return Math.max(-cap, Math.min(cap, m));
        }
    }
    // Fallback: flags manuales del meta_warzone.json
    let m = 0;
    if (arma.es_buff)     m += PESOS_MOMENTUM.buff;
    if (arma.es_nerfeada) m += PESOS_MOMENTUM.nerf;
    if (arma.es_nuevo)    m += PESOS_MOMENTUM.nuevo;
    return m;
}

// Distancia de referencia según la categoría táctica del arma
function rangoRefDeCategoria(cat) {
    const c = norm(cat);
    if (c.includes('largo')) return 40; // combate a distancia
    return 0;                           // corto / por defecto: a quemarropa
}

// Daño corporal a una distancia dada, leyendo alcance_dano [{distancia_m, dano}].
// distancia_m viene como rango en texto: "0-39", "39-65", "65+" (o "65-inf").
// Se parsea a [lo, hi) y se devuelve el daño del tramo que contiene d.
function parseTramo(s) {
    if (s == null) return [0, Infinity];
    const t = String(s).trim().replace(/\s|m/gi, '');
    if (/^\d+(\.\d+)?\+$/.test(t)) return [parseFloat(t), Infinity];          // "65+"
    const m = t.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?|inf|infinity)$/i);       // "39-65" / "59-inf"
    if (m) return [parseFloat(m[1]), /inf/i.test(m[2]) ? Infinity : parseFloat(m[2])];
    const n = parseFloat(t);
    return isNaN(n) ? [0, Infinity] : [n, Infinity];
}
function danoADistancia(alcance, d) {
    if (!Array.isArray(alcance) || !alcance.length) return null;
    for (const b of alcance) {
        const [lo, hi] = parseTramo(b.distancia_m);
        if (d >= lo && d < hi) return statVal(b.dano);   // [lo, hi): el borde pertenece al tramo siguiente
    }
    return statVal(alcance[alcance.length - 1].dano);    // d más allá del último borde
}

// TTK del arma en el rango propio de su categoría. Si no hay tabla de distancia,
// cae al daño al pecho base (a quemarropa). Solo clases automáticas.
function ttkBucket(arma) {
    if (!ttkAplicaPorTipo(arma.tipo_arma)) return null;
    const o = oficialDeArma(arma);
    if (!o) return null;
    const rpm = Number((o.potencia_de_fuego || {}).cadencia_rpm);
    if (!rpm) return null;
    const ref = rangoRefDeCategoria(arma.categoria_tactica);
    let dano = danoADistancia(o.alcance_dano, ref);
    if (dano == null) {
        const dpp = o.dano_por_parte || {};
        dano = statVal(dpp.pecho) || statVal(dpp.cuello_pecho_alto);
    }
    if (!dano) return null;
    const stk = Math.ceil(250 / dano);
    const ttk = Math.round((stk - 1) * (60000 / rpm));
    return { ttk, ref, dano };
}

// Mantengo ttkForArma como envoltorio (lo usa el chip/modal): ahora a-rango.
function ttkForArma(arma) {
    return ttkBucket(arma);
}

// ════════════════════════════════════════════
// 🆕 Modelo para FRANCOTIRADOR / MARKSMAN (#4). El TTK por ráfaga no aplica
// (matan de 1-2 tiros), así que se rankea por una métrica propia y transparente:
//   1) one-shot a la cabeza a vida llena (cabeza >= EHP) = lo que define el meta
//   2) si no, más daño a la cabeza es mejor
//   3) bala más rápida = tiros largos más fáciles
//   4) ADS más rápido = mejor manejo
// Solo se activa para tipos sniper/marksman; cualquier otra arma sin TTK sigue en
// orden manual (no rompe pistolas, escopetas, etc.).
// ════════════════════════════════════════════
function esTipoSniper(arma) {
    const t = norm(arma.tipo_arma) + ' ' + norm(arma.categoria_tactica);
    return t.includes('francotirador') || t.includes('precision')
        || t.includes('marksman') || t.includes('tirador');
}
function sniperScore(arma) {
    if (!esTipoSniper(arma)) return null;
    const o = oficialDeArma(arma);
    if (!o) return null;
    const cabeza = statVal((o.dano_por_parte || {}).cabeza);
    const vel = Number((o.potencia_de_fuego || {}).velocidad_balas_ms) || 0;
    const ads = Number((o.manejo || {}).ads_ms) || 9999;
    let s = 0;
    if (cabeza != null && cabeza >= 250) s += 1000;      // one-shot cabeza (vida llena)
    else if (cabeza != null) s += cabeza;                // si no, más daño a la cabeza
    s += vel / 100;                                       // bala más rápida
    s += (1000 - Math.min(ads, 1000)) / 100;             // ADS más rápido (menor ms)
    return s;
}

// Rango efectivo de un arma para ordenar/tier (interleave global)
function rankAuto(arma) {
    return arma._autoRank || arma.ranking;
}

// Tier por posición DENTRO de su categoría (el mejor de cada rango es S, como wzstats)
function tierDe(arma) {
    const r = arma._catRank || arma.ranking || 99;
    if (r <= 2) return 'S';
    if (r <= 5) return 'A';
    if (r <= 9) return 'B';
    return 'C';
}

// Etiqueta corta de categoría para los encabezados de grupo
function etiquetaCategoria(cat) {
    const c = norm(cat);
    if (c.includes('largo')) return { txt: 'LARGO ALCANCE', sub: 'ordenado por TTK a distancia' };
    if (c.includes('corto')) return { txt: 'CORTO ALCANCE', sub: 'ordenado por TTK a quemarropa' };
    if (c.includes('francotirador') || c.includes('precision')) return { txt: 'FRANCOTIRADOR', sub: 'orden curado (TTK no aplica)' };
    return { txt: (cat || 'OTRAS').toUpperCase(), sub: '' };
}

// Prioridad de categoría al intercalar el orden global
function catPrio(cat) {
    const c = norm(cat);
    if (c.includes('largo')) return 0;
    if (c.includes('corto')) return 1;
    return 2;
}
function esCategoriaPrimaria(cat) {
    const c = norm(cat);
    return c.includes('largo') || c.includes('corto');
}

// Calcula el ranking por categoría (_catRank) y el orden global intercalado (_autoRank).
function calcularOrdenAuto() {
    // 1) TTK a-rango + momentum por arma
    todasLasArmas.forEach(a => {
        const t = ttkBucket(a);
        a._ttk = t ? t.ttk : null;
        a._ttkRef = t ? t.ref : null;
        a._mom = momentumDeArma(a);
        a._auto = false;
        a._ttkNorm = null;
        a._score = null;
        a._catRank = null;
    });
    // 2) por CATEGORÍA: normalizar TTK entre las que tienen dato y rankear
    const cats = {};
    todasLasArmas.forEach(a => {
        (cats[a.categoria_tactica || '—'] = cats[a.categoria_tactica || '—'] || []).push(a);
    });
    Object.values(cats).forEach(grupo => {
        const auto  = grupo.filter(a => a._ttk != null);
        const resto = grupo.filter(a => a._ttk == null);
        if (auto.length) {
            const ttks = auto.map(a => a._ttk);
            const min = Math.min(...ttks), max = Math.max(...ttks);
            auto.forEach(a => {
                a._ttkNorm = (max === min) ? 100 : Math.round(100 * (max - a._ttk) / (max - min));
                a._score = a._ttkNorm + a._mom;
                a._auto = true;
            });
            auto.sort((x, y) => y._score - x._score || x._ttk - y._ttk || (x.ranking || 999) - (y.ranking || 999));
        }
        resto.sort((x, y) => {
            // 1) El ranking del scraper (meta OBSERVADO, se actualiza a diario)
            //    manda cuando ambos lo tienen: refleja lo que la gente usa de
            //    verdad, que nuestra formula de stats no captura completo
            //    (ej. VS Recon > Hawker HX por margen de one-shot y daño al
            //    cuerpo, aunque el Hawker tenga la bala mas rapida).
            const rx = x.ranking || 999, ry = y.ranking || 999;
            if (rx !== ry && rx < 999 && ry < 999) return rx - ry;
            // 2) Fallback: score propio por stats oficiales (armas que el
            //    scraper todavia no rankea)
            const sx = sniperScore(x), sy = sniperScore(y);
            if (sx != null && sy != null && sx !== sy) return sy - sx;
            return rx - ry;
        });
        [...auto, ...resto].forEach((a, i) => a._catRank = i + 1);
    });
    // 3) orden global: intercalar Largo/Corto por _catRank, snipers detrás
    const prim = todasLasArmas.filter(a => esCategoriaPrimaria(a.categoria_tactica))
        .sort((a, b) => (a._catRank || 99) - (b._catRank || 99) || catPrio(a.categoria_tactica) - catPrio(b.categoria_tactica) || (a.ranking || 999) - (b.ranking || 999));
    const sec = todasLasArmas.filter(a => !esCategoriaPrimaria(a.categoria_tactica))
        .sort((a, b) => (a._catRank || 99) - (b._catRank || 99) || (a.ranking || 999) - (b.ranking || 999));
    [...prim, ...sec].forEach((a, i) => a._autoRank = i + 1);
    // 🥇 MEDALLAS: oro/plata/bronce a los 3 subfusiles mejor rankeados del meta.
    // Pura posición: se toman los subfusiles ordenados por _autoRank y se taguean 1/2/3.
    todasLasArmas.forEach(a => { a._medalla = null; });
    const MEDALLAS = ['oro', 'plata', 'bronce'];
    todasLasArmas
        .filter(a => norm(a.tipo_arma).includes('subfusil'))
        .sort((a, b) => (a._autoRank || 999) - (b._autoRank || 999))
        .slice(0, 3)
        .forEach((a, i) => { a._medalla = MEDALLAS[i]; });
    const nAuto = todasLasArmas.filter(a => a._auto).length;
    console.log('[APP] Orden por categoría →', nAuto, 'con TTK,', todasLasArmas.length - nAuto, 'en fallback');
}

function seasonRank(s) {
    const m = String(s || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
}

// Devuelve el parche más reciente del arma (mayor temporada; empata por orden)
// Clave de orden de un parche: la temporada manda; la fecha desempata
// (para sub-parches tipo "Reloaded" que comparten temporada).
function patchKey(p) {
    const sr = seasonRank(p && p.season);
    let f = 0;
    if (p && p.fecha) { const t = Date.parse(p.fecha); if (!isNaN(t)) f = t; }
    return sr * 1e13 + f;
}
function ultimoParcheDeArma(arma) {
    const entry = PATCHES_MAP[slugify(arma.arma)];
    if (!entry || !Array.isArray(entry.patches) || !entry.patches.length) return null;
    let best = entry.patches[0], bk = patchKey(best);
    entry.patches.forEach((p) => {
        const k = patchKey(p);
        if (k >= bk) { best = p; bk = k; }
    });
    return best;
}

// Bloque "POR QUÉ ESTÁ EN EL META" para el modal (estilos inline = no depende de CSS nuevo)
function buildPorque(parche) {
    if (!parche || !Array.isArray(parche.cambios) || !parche.cambios.length) return '';
    const orden = { buff: 0, nerf: 1, nuevo: 2, fix: 3 };
    const cambios = parche.cambios.slice().sort((a, b) => (orden[a.tipo] ?? 9) - (orden[b.tipo] ?? 9));
    const top = cambios.slice(0, 2);
    const col = (t) => t === 'buff' ? '#22C55E' : t === 'nerf' ? '#EF4444' : t === 'nuevo' ? '#F0C419' : '#94A3B8';
    const lab = (t) => t === 'buff' ? 'BUFF' : t === 'nerf' ? 'NERF' : t === 'nuevo' ? 'NUEVO' : 'AJUSTE';
    const items = top.map(c => `
        <div style="display:flex;gap:8px;align-items:flex-start;margin-top:8px">
            <span style="flex:0 0 auto;font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.05em;padding:2px 6px;border:1px solid ${col(c.tipo)}55;border-radius:4px;color:${col(c.tipo)}">${lab(c.tipo)}</span>
            <span style="font-size:.82rem;line-height:1.4;color:rgba(255,255,255,.82)">${escapeHtml(c.descripcion || '')}</span>
        </div>`).join('');
    // Fuente sin link: muestra "notas oficiales" solo si el parche tiene una fuente registrada
    const fuente = parche.fuente
        ? `<div style="margin-top:10px;font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,255,255,.4)">Fuente: notas oficiales</div>`
        : '';
    return `
        <div style="margin:14px 0;padding:14px 16px;border:1px solid rgba(240,196,25,.18);border-radius:10px;background:rgba(240,196,25,.04)">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.66rem;letter-spacing:.12em;color:#F0C419">POR QUÉ ESTÁ EN EL META · ${escapeHtml(parche.season || '')}</div>
            ${items}
            ${fuente}
        </div>`;
}

// Carga adicional (TTK + parches). Silenciosa: si falla, no muestra extras.
async function loadMetaExtras() {
    const safeFetch = async (url) => {
        try {
            const r = await fetch(url + '?v=' + Date.now());
            if (!r.ok) return null;
            return await r.json();
        } catch (e) { return null; }
    };
    const [oficial, patches] = await Promise.all([
        safeFetch('/weapons-official.json'),
        safeFetch('/weapon-patches.json')
    ]);
    OFICIAL_MAP = (oficial && oficial.armas) ? oficial.armas : (oficial || {});
    PATCHES_MAP = patches || {};
    console.log('[APP] Extras META → oficial:', Object.keys(OFICIAL_MAP).length, 'parches:', Object.keys(PATCHES_MAP).length);
}
// ── Compatibilidad segura para JSON nuevo/incompleto ──
const MODOS_DEFAULT = [
    'battle_royale',
    'resurgence',
    'black_ops_royale',
    'res_clasificatorio'
];
function inferirTipoArma(nombre, tipoActual) {
    if (tipoActual) return tipoActual;
    const n = norm(nombre);
    if (['kogot-7', 'carbon 57', 'dravec 45', 'ryden 45k', 'sturmwolf 45'].some(x => n.includes(x))) {
        return 'Subfusil';
    }
    if (['mk.78', 'mk78', 'hawker hx'].some(x => n.includes(x))) {
        return 'Ametralladora ligera';
    }
    if (['vs recon', 'strider 300'].some(x => n.includes(x))) {
        return 'Fusil de precisión';
    }
    if (['mk35 isr'].some(x => n.includes(x))) {
        return 'Marksman';
    }
    if (['ds20 mirage', 'mxr-17', 'ak-27', 'voyak kt-3', 'vst'].some(x => n.includes(x))) {
        return 'Fusil de asalto';
    }
    return 'Arma';
}
function inferirCategoriaTactica(nombre, tipoArma, categoriaActual) {
    if (categoriaActual) return categoriaActual;
    const n = norm(nombre);
    const t = norm(tipoArma);
    if (
        t.includes('subfusil') ||
        t.includes('escopeta') ||
        t.includes('pistola') ||
        ['kogot-7', 'carbon 57', 'dravec 45', 'ryden 45k', 'sturmwolf 45'].some(x => n.includes(x))
    ) {
        return 'Corto Alcance';
    }
    return 'Largo Alcance';
}
function normalizarArma(arma, index) {
    const nombre = arma.arma || arma.nombre || arma.name || `Arma ${index + 1}`;
    const tipoArma = inferirTipoArma(nombre, arma.tipo_arma || arma.tipo || arma.category);
    const categoriaTactica = inferirCategoriaTactica(
        nombre,
        tipoArma,
        arma.categoria_tactica || arma.rango || arma.range
    );
    return {
        ...arma,
        arma: nombre,
        imagen_url: arma.imagen_url || arma.imagen || arma.image || '',
        ranking: Number(arma.ranking || arma.rank || index + 1),
        codigo: arma.codigo || arma.code || '',
        tipo_arma: tipoArma,
        categoria_tactica: categoriaTactica,
        modos: Array.isArray(arma.modos) && arma.modos.length ? arma.modos : MODOS_DEFAULT.slice(),
        es_nuevo: Boolean(arma.es_nuevo || arma.is_new),
        es_buff: Boolean(arma.es_buff || arma.buff || arma.is_buff),
        es_nerfeada: Boolean(arma.es_nerfeada || arma.nerf || arma.is_nerfed),
        attachments: arma.attachments || [],
        loadouts: Array.isArray(arma.loadouts) ? arma.loadouts : []
    };
}

// ════════════════════════════════════════════
// 🆕 cargarMeta(): orquestador único de carga. Lo llaman home.js y app.js.
// Hace fetch del JSON del scraper, normaliza, carga extras y calcula el orden.
// ════════════════════════════════════════════
async function cargarMeta() {
    const res = await fetch('meta_warzone.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    todasLasArmas = Array.isArray(data) ? data.map((arma, i) => normalizarArma(arma, i)) : [];
    todasLasArmas.forEach((a, i) => a._idx = i);
    await loadMetaExtras();
    calcularOrdenAuto();
    return todasLasArmas;
}
