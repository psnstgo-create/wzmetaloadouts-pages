// ════════════════════════════════════════════
//   HOME.JS — Render de la portada (v2 · solo dibujo)
//   La lógica de orden/TTK/tier vive en meta-core.js (motor compartido con /armas).
//   Cargar SIEMPRE meta-core.js ANTES que este archivo en index.html.
//   Pinta: 3 cards (mejor largo/corto/sniper del modo), Top 5 y Cambios por parche.
//   Reactivo al modo: cambia cards, Top 10 y la foto del hero.
// ════════════════════════════════════════════

let MODO = 'battle_royale';
let ACTIVE_CAT = null;

// Degradado de respaldo: si la foto no carga (404 / cache), el hero muestra esto
// en vez de un vacío negro. La foto va ARRIBA; el degradado, debajo.
const HERO_FALLBACK = 'linear-gradient(135deg,#101a24 0%,#0a1019 45%,#070a0e 100%)';
const HERO_BG = {
  battle_royale:     `url(/hero/br.jpg), ${HERO_FALLBACK}`,
  resurgence:        `url(/hero/resurgence.jpg), ${HERO_FALLBACK}`,
  clasificatorio:    `url(/hero/ranked.jpg), ${HERO_FALLBACK}`,
  res_clasificatorio:`url(/hero/ranked.jpg), ${HERO_FALLBACK}` // alias legacy
};

// ── helpers SOLO de presentación (el resto viene de meta-core.js) ──
function tierColor(t){return t==='S'?'#F0C419':t==='A'?'#22C55E':t==='B'?'#3B82F6':'#A855F7';}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}
function textoBoton(hex){return ['#22C55E','#F0C419','#F97316'].includes(hex)?'#08110A':'#fff';}

// ── filtros de modo / categoría ──
function enModo(a){return !Array.isArray(a.modos)||!a.modos.length||a.modos.includes(MODO);}
function catTest(a,key){const c=norm(a.categoria_tactica);
  if(key==='largo')return c.includes('largo');
  if(key==='corto')return c.includes('corto');
  if(key==='sniper')return c.includes('francotirador')||c.includes('precision');
  return false;}
function ordenMetaHome(a,b){
  return (a._catRank||99)-(b._catRank||99) || (a._autoRank||99)-(b._autoRank||99) || (a.ranking||999)-(b.ranking||999);
}
function armasPorCategoriaHome(key,limit){
  const arr=todasLasArmas.filter(a=>enModo(a)&&catTest(a,key)).sort(ordenMetaHome);
  return typeof limit==='number'?arr.slice(0,limit):arr;
}
function mejorDe(key){
  return armasPorCategoriaHome(key,1)[0]||null;}

// ── siluetas SVG (fallback de imagen) ──
const SIL={
  asalto:'<path d="M10 30 L40 30 L45 22 L75 22 L80 28 L160 28 L165 22 L180 22 L185 26 L195 26 L195 34 L185 34 L180 38 L165 38 L160 32 L120 32 L120 45 L100 45 L100 32 L80 32 L75 38 L45 38 L40 30 Z"/>',
  subfusil:'<path d="M20 28 L40 28 L45 22 L60 22 L65 28 L150 28 L150 22 L170 22 L170 34 L150 34 L150 32 L90 32 L90 45 L75 45 L75 32 L65 32 L60 38 L45 38 L40 32 L20 32 Z"/>',
  sniper:'<path d="M5 28 L195 28 L195 32 L5 32 Z"/><path d="M70 18 L130 18 L135 28 L65 28 Z" opacity="0.6"/><path d="M50 32 L70 32 L75 45 L55 45 Z"/>'
};
function silDe(a){const t=norm(a.tipo_arma);
  if(t.includes('subfusil'))return SIL.subfusil;
  if(t.includes('precision')||t.includes('francotirador')||t.includes('marksman'))return SIL.sniper;
  return SIL.asalto;}

// ── iconos de stat ──
const IC={
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bullet:'<circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  bars:'<path d="M4 20V11M10 20V5M16 20v-7M22 20v-3"/>',
  scope:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  dmg:'<path d="M12 2l3 6 6 .5-4.5 4 1.5 6L12 15l-6 3.5 1.5-6L3 8.5 9 8z"/>',
  range:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
};
function ico(d){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${d}</svg>`;}

// ── loadouts del home: intenta leer attachments reales del motor o de /meta_warzone.json ──
let HOME_LOADOUTS = {};
const SLOT_MAP_HOME={
  'mira':'Óptica','optic':'Óptica','optica':'Óptica','óptica':'Óptica',
  'boca de cañon':'Bocacha','boca de cañón':'Bocacha','muzzle':'Bocacha','bocacha':'Bocacha',
  'cañon':'Cañón','cañón':'Cañón','barrel':'Cañón',
  'cargador':'Cargador','magazine':'Cargador','mag':'Cargador',
  'culata':'Culata','stock':'Culata',
  'acople':'Acople','bajo cañon':'Acople','bajo cañón':'Acople','underbarrel':'Acople',
  'empuñadura':'Empuñadura','empuñadura trasera':'Empuñadura','rear grip':'Empuñadura','grip':'Empuñadura',
  'laser':'Láser','láser':'Láser','mods de disparo':'Mod. Disparo','fire mods':'Mod. Disparo'
};
const TIPO_ITEM_HOME={
  'suppressor':'Supresor','silencer':'Silenciador','compensator':'Compensador','brake':'Freno',
  'barrel':'Cañón','magazine':'Cargador','mag':'Cargador','loader':'Cargador','drum':'Tambor',
  'stock':'Culata','handstop':'Empuñadura','grip':'Empuñadura','foregrip':'Empuñadura',
  'guard':'Guardamanos','handguard':'Guardamanos','laser':'Láser','comb':'Peine'
};
const ADJ_ITEM_HOME={
  'monolithic':'Monolítico','heavy':'Pesado','rapid':'Rápido','extended':'Ampliado',
  'fast':'Rápido','light':'Ligero','tactical':'Táctico','precision':'Precisión',
  'speed':'Rápido','weighted':'Lastrada','reinforced':'Reforzado','reserve':'Reserva',
  'vertical':'Vertical','lateral':'Lateral','quickdraw':'Desenfunde'
};
const ATT_IC={
  muzzle:'<path d="M4 12h16M7 8h10M7 16h10"/>',
  barrel:'<path d="M3 12h18M15 9l5 3-5 3"/>',
  under:'<path d="M8 4h8v16H8zM6 8h12M6 16h12"/>',
  mag:'<path d="M9 4h6l2 16H7z"/>',
  optic:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/>',
  laser:'<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
  stock:'<path d="M4 14h7l5-5h4v6h-4l-5-1H4z"/>',
  perk:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
  dmg:'<path d="M12 2l3 6 6 .5-4.5 4 1.5 6L12 15l-6 3.5 1.5-6L3 8.5 9 8z"/>'
};
function slotKeyHome(s){const k=norm(s||'');
  if(k.includes('bocacha')||k.includes('muzzle')||k.includes('supresor')||k.includes('suppressor'))return'muzzle';
  if(k.includes('canon')||k.includes('cañon')||k.includes('barrel'))return'barrel';
  if(k.includes('acople')||k.includes('under')||k.includes('empunadura')||k.includes('empuñadura'))return'under';
  if(k.includes('cargador')||k.includes('mag'))return'mag';
  if(k.includes('mira')||k.includes('optic')||k.includes('optica')||k.includes('óptica'))return'optic';
  if(k.includes('laser')||k.includes('láser'))return'laser';
  if(k.includes('culata')||k.includes('stock'))return'stock';
  if(k.includes('dano')||k.includes('daño'))return'dmg';
  return'perk';}
function iconoSlotHome(slot){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ATT_IC[slotKeyHome(slot)]}</svg>`;}
function traducirSlotHome(s){const k=norm(s||'');return SLOT_MAP_HOME[k]||s||'Accesorio';}
function traducirItemHome(item){
  if(!item)return'';
  // primero el traductor compartido (meta-core): cañones en cm como el juego
  if(typeof traducirAccesorioES==='function'){
    const t=traducirAccesorioES(item);
    if(t!==item)return t;
  }
  let tipo=null;const resto=[];
  String(item).split(/\s+/).forEach(w=>{const lw=w.toLowerCase().replace(/[.,]/g,'');
    if(TIPO_ITEM_HOME[lw]&&!tipo)tipo=TIPO_ITEM_HOME[lw];
    else resto.push(ADJ_ITEM_HOME[lw]||w);
  });
  const r=resto.join(' ').trim();return tipo?(r?`${tipo} ${r}`:tipo):item;
}
function normalizarAttachmentsHome(raw){
  if(!Array.isArray(raw))return[];
  return raw.map(x=>{
    if(typeof x==='string')return{slot:'Accesorio',item:x,original:x};
    const original=x.item||x.nombre||x.name||x.attachment||'';
    return{slot:traducirSlotHome(x.slot||x.tipo||x.categoria||''),item:traducirItemHome(original),original};
  }).filter(x=>x.item).slice(0,5);
}
function slugSafeHome(s){return (s||'').replace(/[<>:"/\\|?*]+/g,'').replace(/\s+/g,'_');}
function loadoutPrincipalHome(a){
  const l=Array.isArray(a.loadouts)&&a.loadouts.length?a.loadouts[0]:(a.loadout||a.build||null);
  return l&&typeof l==='object'?l:null;
}
function codigoDeHome(a){
  // el codigo mostrado debe pertenecer al build que se esta mostrando:
  // si la tarjeta muestra el build del modo (Resurgence/Ranked), usar SU codigo
  const nk=norm(a.arma||a.nombre);
  const bm=typeof buildPropioParaModo==='function'?buildPropioParaModo(nk):null;
  if(MODO!=='battle_royale'&&bm&&(bm.modos||[]).includes(MODO)){
    return (bm.codigo||'').trim();
  }
  const l=loadoutPrincipalHome(a);
  return a.codigo||(l&&(l.codigo||l.code||l.class_code))||'';
}
const _RE_OPTICA_HOME=/mira|óptica|optica|optic/i;
const _RE_LASER_HOME=/láser|laser/i;
// Build propio (score_builds.py) que corresponde al modo activo del home.
// Cada arma puede tener wz-battle_royale / wz-resurgence / wz-clasificatorio.
function buildPropioParaModo(nk){
  const ls=HOME_PROPIOS[nk];
  if(!Array.isArray(ls)||!ls.length)return null;
  return ls.find(l=>(l.modos||[]).includes(MODO)||l.id==='wz-'+MODO)||ls[0];
}
function attachmentsDeHome(a){
  const l=loadoutPrincipalHome(a);
  const nk=norm(a.arma||a.nombre);
  const metaAtt=HOME_LOADOUTS[nk];
  const buildModo=buildPropioParaModo(nk);
  const propio=buildModo?buildModo.items:null; // build propio: armas-data.json / _build/score_builds.py

  // En Resurgence/Ranked el build propio del modo manda: el scrapeado de
  // meta_warzone.json es generico (BR). En BR sigue mandando el scrapeado
  // (meta real observado) con el propio como sanity check.
  if(MODO!=='battle_royale'&&buildModo&&(buildModo.modos||[]).includes(MODO)){
    const arr=normalizarAttachmentsHome(propio.map(it=>({slot:it.label||it.slot,item:it.name})));
    if(arr.length)return arr;
  }

  // Sanity check contra el build propio (codmunity, playstyle verificado):
  //  1) sin mira en meta_warzone.json pero con mira confirmada en el propio
  //     -> usar el propio (ej. REV-46, Corto Alcance con mira real)
  //  2) con laser en meta_warzone.json pero el propio (verificado sin
  //     ambiguedad) no lo tiene -> usar el propio (ej. Strider 300/Hawker HX:
  //     el laser delata la posicion en armas de precision; no se generaliza
  //     a todo sniper porque Shadow SK si lo usa de verdad)
  const metaTieneOptica=Array.isArray(metaAtt)&&metaAtt.some(x=>_RE_OPTICA_HOME.test(x.slot||x.tipo||''));
  const propioTieneOptica=Array.isArray(propio)&&propio.some(it=>it.slot==='Optic'||_RE_OPTICA_HOME.test(it.slot||it.label||''));
  const metaTieneLaser=Array.isArray(metaAtt)&&metaAtt.some(x=>_RE_LASER_HOME.test(x.slot||x.tipo||''));
  const propioTieneLaser=Array.isArray(propio)&&propio.some(it=>it.slot==='Laser'||_RE_LASER_HOME.test(it.slot||it.label||''));

  // Combo ILEGAL en el juego: canon con supresion integrada + boca de canon
  // (la Armeria elimina uno al equipar el otro — verificado en PS5, MK35 ISR).
  // Si el scrapeado lo trae, se usa el build propio (el motor ya lo valida).
  const _supp=/suppress|silenciador|silencer|monolithic/i;
  const _slotDe=x=>norm(x.slot||x.tipo||'');
  const _itemDe=x=>String(x.item||x.nombre||x.name||'');
  const metaComboIlegal=Array.isArray(metaAtt)
    &&metaAtt.some(x=>_slotDe(x).includes('boca')||_slotDe(x).includes('muzzle'))
    &&metaAtt.some(x=>(_slotDe(x).includes('canon')||_slotDe(x).includes('barrel'))&&!_slotDe(x).includes('boca')&&_supp.test(_itemDe(x)));

  const faltaOptica=!metaTieneOptica&&propioTieneOptica;
  const laserDudoso=metaTieneLaser&&Array.isArray(propio)&&!propioTieneLaser;
  const saltarMeta=faltaOptica||laserDudoso||metaComboIlegal;

  if(saltarMeta){
    const arr=normalizarAttachmentsHome(propio.map(it=>({slot:it.label||it.slot,item:it.name})));
    if(arr.length)return arr;
  }

  const opciones=[
    metaAtt,
    l&&(l.attachments||l.accesorios||l.items),
    a.attachments,a.accesorios,a.build_recomendado
  ];
  for(const raw of opciones){const arr=normalizarAttachmentsHome(raw);if(arr.length)return arr;}
  return[];
}
let HOME_PROPIOS={};
let HOME_ARMAS_DATA={};
async function cargarHomeLoadouts(){
  try{
    const r=await fetch('/meta_warzone.json',{cache:'no-cache'});if(!r.ok)return;
    const data=await r.json();const arr=Array.isArray(data)?data:(data.armas||[]);const map={};
    arr.forEach(a=>{const nom=a.arma||a.nombre;const at=a.attachments||a.accesorios;if(nom&&Array.isArray(at)&&at.length){map[norm(nom)]=at;}});
    HOME_LOADOUTS=map;
  }catch(e){console.warn('[HOME] meta_warzone.json no disponible para attachments');}
  // build propio (armas-data.json, _build/score_builds.py) — se usa solo
  // como sanity check cuando meta_warzone.json omite la mira en Largo Alcance
  try{
    const r2=await fetch('/armas-data.json',{cache:'no-cache'});if(!r2.ok)return;
    const d2=await r2.json();const propios={};
    Object.values(d2.armas||{}).forEach(a=>{
      if(a&&Array.isArray(a.loadouts)&&a.loadouts.length&&a.nombre){
        propios[norm(a.nombre)]=a.loadouts; // lista completa: puede haber un build por modo
      }
    });
    HOME_PROPIOS=propios;
    HOME_ARMAS_DATA=d2.armas||{};
  }catch(e){console.warn('[HOME] armas-data.json no disponible para sanity check de mira');}
}
function renderBuildHome(a){
  const at=attachmentsDeHome(a);
  const slug=slugify(a.arma||a.nombre||'');
  const rows=at.length?at.map(x=>{
    const iconSrc=x.original?`/icons/attachments/${slug}/${slugSafeHome(x.original)}.png`:'';
    const icoHtml=iconSrc
      ? `<img src="${iconSrc}" alt="" class="fc-att-img" loading="lazy" onerror="this.outerHTML='${iconoSlotHome(x.slot).replace(/'/g,"\\'")}'">`
      : iconoSlotHome(x.slot);
    return `<div class="fc-att-row"><span class="fc-att-ico">${icoHtml}</span><span class="fc-att-txt"><span class="fc-att-slot">${escapeHtml(x.slot)}</span><span class="fc-att-name">${escapeHtml(x.item)}</span></span><span class="fc-att-dot"></span></div>`;
  }).join(''):`<div class="fc-att-empty">Build pendiente de publicar</div>`;
  return `<div class="fc-build"><div class="fc-build-title">Build recomendado</div>${rows}</div>`;
}
function renderCodigoHome(a){
  const codigo=codigoDeHome(a);
  if(!codigo) return ''; // sin codigo real no se muestra la caja (los codigos los genera el juego al compartir, no se pueden inventar)
  return `<div class="fc-code"><span class="fc-code-text"><span class="fc-code-label">Código</span><span class="fc-code-value">${escapeHtml(codigo)}</span></span><button class="fc-code-copy" data-codigo="${escapeHtml(codigo)}" aria-label="Copiar código">${ico(IC.copy)}</button></div>`;
}

// ── tipo abreviado (para que no desborde la card) ──
function tipoCorto(t){t=norm(t);
  if(t.includes('asalto'))return'Asalto';
  if(t.includes('subfusil'))return'SMG';
  if(t.includes('ametralladora'))return'LMG';
  if(t.includes('escopeta'))return'Escopeta';
  if(t.includes('pistola'))return'Pistola';
  if(t.includes('marksman'))return'Marksman';
  if(t.includes('precision')||t.includes('francotirador'))return'Sniper';
  return'Arma';}

// ── stats por arma (honesto: solo datos reales del motor) ──
function statsDe(a){
  if(esTipoSniper(a)){
    const o=oficialDeArma(a);const cab=o?statVal((o.dano_por_parte||{}).cabeza):null;
    const oneShot=cab!=null&&cab>=250;
    return [
      {l:'Disparo', v:oneShot?'1 al torso':'Preciso', i:IC.scope},
      {l:'Daño',    v:cab!=null?String(cab):'Alto',   i:IC.dmg},
      {l:'Rango',   v:'Extremo',                       i:IC.range},
    ];
  }
  const t=ttkBucket(a);
  return [
    {l:'TTK',  v:t?`${t.ttk} ms`:'—',     i:IC.clock},
    {l:'Daño', v:t?String(t.dano):'—',    i:IC.dmg},
    {l:'Tipo', v:tipoCorto(a.tipo_arma),  i:IC.bars},
  ];
}

// ── render: cards destacadas ──
const ROLES={largo:'Mejor largo alcance',corto:'Mejor corto alcance',sniper:'Mejor sniper'};
// Imagen gold correcta desde armas-data.json (evita 404 por mayúsculas en meta_warzone.json)
function goldSrc(a){
  const rec=HOME_ARMAS_DATA[slugify(a.arma||a.nombre||'')];
  return (rec&&rec.imagen)?rec.imagen:`/weapons/gold/${a.arma}.png`;
}
function cardHtml(a,n,roleKey){
  if(!a)return '';
  const acc=colorTipo(a.tipo_arma), tier=tierDe(a), tcol=tierColor(tier), bt=textoBoton(acc);
  const stats=statsDe(a).map(s=>`
        <div class="stat">${ico(s.i)}<div class="t"><span class="sl">${escapeHtml(s.l)}</span><span class="sn">${escapeHtml(s.v)}</span></div></div>`).join('');
  return `
  <article class="fcard" style="--a:${acc};--a10:${hexA(acc,.1)};--a14:${hexA(acc,.15)};--a30:${hexA(acc,.34)};--bt:${bt}">
    <div class="fc-img">
      <img src="${escapeHtml(goldSrc(a))}" alt="${escapeHtml(a.arma)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
      <svg style="display:none;height:84px;color:${acc};opacity:.55" viewBox="0 0 200 60" fill="currentColor">${silDe(a)}</svg>
    </div>
    <div class="fc-meta">
      <div class="fc-top">
        <div class="rankbox">${n}</div>
        <div class="fc-name"><h3>${escapeHtml(a.arma)}</h3><div class="role">${escapeHtml(roleKey)}</div></div>
        <div class="tierb" style="color:${tcol};border-color:${hexA(tcol,.34)};background:${hexA(tcol,.1)}">TIER<b>${tier}</b></div>
      </div>
      <div class="fc-stats">${stats}</div>
    </div>
    ${renderBuildHome(a)}
    ${renderCodigoHome(a)}
  </article>`;
}
function renderFeatured(){
  const cont=document.getElementById('featured');if(!cont)return;

  let cards, roles;

  if(ACTIVE_CAT){
    cards=armasPorCategoriaHome(ACTIVE_CAT,3);
    roles=cards.map(()=>ROLES[ACTIVE_CAT]||'Meta recomendado');
  }else{
    cards=[mejorDe('largo'),mejorDe('corto'),mejorDe('sniper')];
    roles=['largo','corto','sniper'].map(k=>ROLES[k]);
  }

  const html=cards.map((a,i)=>cardHtml(a,i+1,roles[i])).join('');
  cont.innerHTML=html||`<div class="cap" style="grid-column:1/-1;text-align:center;color:var(--muted);padding:30px 0">Sin armas para este modo o categoría</div>`;
}

// ── render: Top 5 ──
// ── fecha sin hora (DD Mes YYYY) ──
function fechaSolo(ts){
  const s=String(ts).trim();
  const m=s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if(m){const me=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return parseInt(m[3],10)+' '+me[parseInt(m[2],10)-1]+' '+m[1];}
  return s.split(/[ T]/)[0];
}

// ── tag de categoría corta + tendencia para el Top ──
function catCortaTop(a){const c=norm(a.categoria_tactica);
  if(c.includes('largo'))return'Largo alcance';
  if(c.includes('corto'))return'Corto alcance';
  if(c.includes('francotirador')||c.includes('precision'))return'Sniper';
  return a.tipo_arma||'';}
function trendTop(a){
  if(a.es_nuevo) return '<span class="rtrend new">NEW</span>';
  const m=momentumDeArma(a);
  if(m>0) return '<span class="rtrend up">▲</span>';
  if(m<0) return '<span class="rtrend down">▼</span>';
  return '<span class="rtrend"></span>';
}

// ── render: Top 10 (filas clicleables a su página de arma) ──
function filaArma(a, i){
  const tipo=colorTipo(a.tipo_arma), tier=tierDe(a), tcol=tierColor(tier), slug=slugify(a.arma);
  return `<a class="rrow" href="/armas/${slug}" style="text-decoration:none;color:inherit">
      <div class="rnum">${i+1}</div>
      <div class="rname">${escapeHtml(a.arma)}<span class="rcat">${escapeHtml(catCortaTop(a))}</span></div>
      ${trendTop(a)}
      <div class="rmini"><img src="${escapeHtml(goldSrc(a))}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><svg style="display:none" viewBox="0 0 200 60" fill="currentColor">${silDe(a)}</svg></div>
      <div class="rtier">${tier}</div>
    </a>`;
}
function listaHomeBase(){
  return todasLasArmas
    .filter(enModo)
    .filter(a=>!ACTIVE_CAT||catTest(a,ACTIVE_CAT))
    .slice()
    .sort((a,b)=>(ACTIVE_CAT?ordenMetaHome(a,b):(rankAuto(a)-rankAuto(b))));
}
function tituloTopHome(){
  if(ACTIVE_CAT==='largo')return'Top largo alcance';
  if(ACTIVE_CAT==='corto')return'Top corto alcance';
  if(ACTIVE_CAT==='sniper')return'Top sniper';
  if(MODO==='resurgence')return'Top Resurgence';
  if(MODO==='clasificatorio'||MODO==='res_clasificatorio')return'Top Ranked Resurgence';
  return'Top 10 armas';
}
function renderTop5(){
  const cont=document.getElementById('top5');if(!cont)return;
  const titulo=document.getElementById('topTitle');if(titulo)titulo.textContent=tituloTopHome();
  const lista=listaHomeBase().slice(0,10);
  cont.innerHTML=lista.map((a,i)=>filaArma(a,i)).join('')||`<div style="color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.78rem;padding:16px 2px">Sin armas para este modo o categoría</div>`;
}

// ── búsqueda en vivo en el home: filtra la lista de armas ──
function buscarArmasHome(q){
  const cont=document.getElementById('top5'); if(!cont) return;
  const titulo=document.getElementById('topTitle');
  const query=norm(q||'').trim();
  if(!query){ renderTop5(); return; }
  const res=listaHomeBase()
    .filter(a=>norm(a.arma).includes(query) || norm(a.tipo_arma||'').includes(query) || norm(a.categoria_tactica||'').includes(query))
    .slice(0,12);
  if(titulo) titulo.textContent = res.length ? `Resultados (${res.length})` : 'Sin resultados';
  if(!res.length){ cont.innerHTML=`<div style="color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.78rem;padding:16px 2px">No se encontró ningún arma con "${escapeHtml(q)}"</div>`; return; }
  cont.innerHTML=res.map((a,i)=>filaArma(a,i)).join('');
}
function setupHomeSearch(){
  const inp=document.getElementById('homeSearch'); if(!inp) return;
  inp.addEventListener('input', ()=>buscarArmasHome(inp.value));
}

// ── render: Cambios por parche ──
function cambioDe(a){
  const p=ultimoParcheDeArma(a);
  if(p&&Array.isArray(p.cambios)&&p.cambios.length){
    const nb=p.cambios.filter(c=>norm(c.tipo)==='buff').length;
    const nn=p.cambios.filter(c=>norm(c.tipo)==='nerf').length;
    const nu=p.cambios.filter(c=>norm(c.tipo)==='nuevo').length;
    const season=p.season?` · ${p.season}`:'';
    if(nu) return {dir:'new', txt:`Nueva${season}`};
    if(nb>nn) return {dir:'up', txt:`${nb} buff${nb>1?'s':''}${season}`};
    if(nn>0)  return {dir:'down', txt:`${nn} nerf${nn>1?'s':''}${season}`};
  }
  if(a.es_nuevo)    return {dir:'new', txt:'Nueva arma disponible'};
  if(a.es_buff)     return {dir:'up', txt:'Buff aplicado'};
  if(a.es_nerfeada) return {dir:'down', txt:'Nerf aplicado'};
  return null;
}
// ── último parche global (etiqueta = Parche X · fecha) ──
function infoUltimoParche(){
  let bestKey=-1, best=null;
  todasLasArmas.forEach(a=>{const p=ultimoParcheDeArma(a);
    if(p){const k=patchKey(p); if(k>bestKey){bestKey=k; best=p;}}});
  let label='';
  if(best){
    const ver = best.version?('Parche '+best.version):(best.season||'');
    const fec = best.fecha?fechaSolo(best.fecha):'';
    label = [ver, fec].filter(Boolean).join(' · ');
  }
  return {bestKey, label};
}
function renderCambios(){
  const cont=document.getElementById('cambios');if(!cont)return;
  const {bestKey,label}=infoUltimoParche();
  const pn=document.getElementById('patchNum'); if(pn) pn.textContent=label?('· '+label):'';
  // armas con cambios en el ÚLTIMO parche (por fecha/temporada)
  let items=[];
  todasLasArmas.forEach(a=>{const p=ultimoParcheDeArma(a);
    if(!p||patchKey(p)!==bestKey||!Array.isArray(p.cambios))return;
    const nb=p.cambios.filter(c=>norm(c.tipo)==='buff').length;
    const nn=p.cambios.filter(c=>norm(c.tipo)==='nerf').length;
    const nu=p.cambios.filter(c=>norm(c.tipo)==='nuevo').length;
    if(nb||nn||nu) items.push({a,p,nb,nn,nu});
  });
  // fallback: flags manuales del meta_warzone.json si no hay datos de parche
  if(!items.length){
    todasLasArmas.forEach(a=>{
      if(a.es_buff) items.push({a,p:null,nb:1,nn:0,nu:0});
      else if(a.es_nerfeada) items.push({a,p:null,nb:0,nn:1,nu:0});
      else if(a.es_nuevo) items.push({a,p:null,nb:0,nn:0,nu:1});
    });
  }
  // prioridad: buffs/nerfs antes que nuevos
  items.sort((x,y)=>((y.nb+y.nn)-(x.nb+x.nn)));
  const top=items.slice(0,10);
  if(!top.length){cont.innerHTML=`<div class="cap" style="color:var(--muted);padding:8px 0">Sin cambios recientes</div>`;return;}
  const COL={up:'var(--green)',down:'var(--red)',new:'var(--gold)'};
  const ARROW={up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',new:'<path d="M12 5v14M5 12h14"/>'};
  const tipoDir=t=>{t=norm(t);return t==='buff'?'up':t==='nerf'?'down':'new';};
  cont.innerHTML=top.map(({a,p,nb,nn,nu})=>{
    let dir,txt;
    if(nb&&nn){dir='up';txt=`${nb} buff${nb>1?'s':''} · ${nn} nerf${nn>1?'s':''}`;}
    else if(nb){dir='up';txt=`${nb} buff${nb>1?'s':''}`;}
    else if(nn){dir='down';txt=`${nn} nerf${nn>1?'s':''}`;}
    else{dir='new';txt='Nueva arma';}
    const cambios=(p&&Array.isArray(p.cambios))?p.cambios:[];
    const hasDetail=cambios.length>0;
    let detalle='';
    if(hasDetail){
      const plabel=[p.version?('Parche '+p.version):(p.season||''), p.fecha?fechaSolo(p.fecha):''].filter(Boolean).join(' · ');
      const lineas=cambios.map(c=>`<div class="cline"><span class="cdot ${tipoDir(c.tipo)}"></span><span>${escapeHtml(c.descripcion||'')}</span></div>`).join('');
      const fuente=p.fuente?`<div class="cfuente">Fuente: ${escapeHtml(p.fuente)}</div>`:'';
      detalle=`<div class="cdetail"><div class="cdin">${plabel?`<div class="cpatch">${escapeHtml(plabel)}</div>`:''}${lineas}${fuente}</div></div>`;
    }
    const chev=hasDetail?`<svg class="cchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`:'';
    return `<div class="citem${hasDetail?' has-detail':''}" style="--cc:${COL[dir]}">
      <div class="crow"${hasDetail?' role="button" tabindex="0" aria-expanded="false"':''}>
        <div class="cico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">${ARROW[dir]}</svg></div>
        <div class="cbody"><div class="cn">${escapeHtml(a.arma)}</div><div class="cd">${escapeHtml(txt)}</div></div>
        ${chev}
      </div>${detalle}
    </div>`;
  }).join('');
  // toggle: tocar la fila despliega/colapsa el detalle
  cont.querySelectorAll('.citem.has-detail .crow').forEach(row=>{
    const toggle=()=>{const it=row.closest('.citem');const open=it.classList.toggle('open');row.setAttribute('aria-expanded',open?'true':'false');};
    row.addEventListener('click',toggle);
    row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  });
}

// ── hero ──
function setHero(modo){const el=document.getElementById('heroBg');if(el&&HERO_BG[modo])el.style.backgroundImage=HERO_BG[modo];}

// ── render total ──
function renderAll(){renderFeatured();renderTop5();renderCambios();}

// ── pills (modo filtra + hero; categoría navega al catálogo) ──
function setPillActive(pill){
  document.querySelectorAll('.pill').forEach(x=>x.classList.remove('on'));
  if(pill)pill.classList.add('on');
}
function initPills(){
  document.querySelectorAll('.pill').forEach(p=>{
    p.addEventListener('click',()=>{
      const modo=p.dataset.modo;
      const cat=p.dataset.cat;
      const search=document.getElementById('homeSearch');
      if(search)search.value='';
      if(modo){
        ACTIVE_CAT=null;
        MODO=modo;
        setPillActive(p);
        setHero(modo);
        renderAll();
      }else if(cat){
        ACTIVE_CAT=cat;
        setPillActive(p);
        renderAll();
      }
    });
  });
}
function initCopy(){
  document.addEventListener('click',e=>{
    const b=e.target.closest('.fc-code-copy[data-codigo], .btn-fill[data-codigo]');if(!b)return;
    navigator.clipboard.writeText(b.dataset.codigo||'').then(()=>{
      const orig=b.innerHTML;b.textContent='✓ Copiado';setTimeout(()=>b.innerHTML=orig,1200);
    });
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('.btn-ghost[data-idx]');if(!b)return;
    const a=todasLasArmas[+b.dataset.idx];if(a)window.location.href='/armas#'+slugify(a.arma);
  });
}

// ── Velocidad de eliminación · Top 10 (armado desde armas-data.json: _autoRank + _ttk) ──
function renderTTKChart(){
  const cont=document.getElementById('ttkChart');
  if(!cont) return;
  const list=Object.entries(HOME_ARMAS_DATA||{})
    .map(([slug,a])=>Object.assign({slug},a))
    .filter(a=>typeof a._ttk==='number' && typeof a._autoRank==='number')
    .sort((a,b)=>a._autoRank-b._autoRank)
    .slice(0,10);
  if(!list.length) return;

  const ttks=list.map(a=>a._ttk);
  const minT=Math.min.apply(null,ttks), maxT=Math.max.apply(null,ttks);
  const ttkLider=list[0]._ttk; // DIF siempre relativo al #1 del ranking (no al TTK minimo del grupo)
  const rows=list.map((a,i)=>{
    const isLargo=(a._refDist||0)>0;
    const color=isLargo?'#3987e5':'#199e70';
    // Escala directa de la barra: mayor TTK (mas lento) = barra mas larga.
    // Piso del 34% para que hasta el TTK mas bajo del grupo mantenga barra visible.
    const pct=maxT===minT?60:(34+(a._ttk-minT)/(maxT-minT)*(98-34));
    const dif=a._ttk-ttkLider;
    const difTxt=dif===0?'—':(dif>0?`+${dif}`:`${dif}`);
    const difClass=dif<0?' ttk-dif--faster':'';
    const rank=String(i+1).padStart(2,'0');
    return `<a class="ttk-row" href="/armas/${a.slug}" role="listitem" aria-label="${escapeHtml(a.nombre)} TTK ${a._ttk} ms" style="--gc:${color}">
      <div class="ttk-rank"><span class="ttk-rbadge">${rank}</span></div>
      <div class="ttk-weapon">
        <span class="ttk-icobox"><img src="${escapeHtml(a.imagen||'')}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></span>
        <span class="ttk-wtext">
          <span class="ttk-rname">${escapeHtml(a.nombre)}</span>
          <span class="ttk-wtype">${escapeHtml(tipoCorto(a.tipo||''))}</span>
        </span>
      </div>
      <div class="ttk-track">
        <div class="ttk-bar" data-w="${pct.toFixed(1)}" style="width:0%;background:${color};transition-delay:${i*55}ms" aria-hidden="true"></div>
      </div>
      <div class="ttk-val">${a._ttk}<span class="ttk-ms">ms</span></div>
      <div class="ttk-dif${difClass}">${difTxt}</div>
    </a>`;
  }).join('');
  cont.innerHTML=rows;

  let animated=false;
  const disparar=()=>{
    if(animated) return; animated=true;
    cont.querySelectorAll('.ttk-bar').forEach(b=>{ b.style.width=b.dataset.w+'%'; });
  };
  const card=cont.closest('.ttk-card')||cont;
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ disparar(); io.disconnect(); } });
    },{threshold:.25});
    io.observe(card);
  } else {
    disparar();
  }
}

// ═══════════════════════════════════════════════
// COMPARADOR EN VIVO — port 1:1 de _build/generar_paginas_comparacion.py
// (mismos stats, misma direccion de "quien gana", mismo criterio de
// honestidad: si falta un dato en cualquiera de las dos armas, esa
// fila no se muestra). Cualquier par de armas es valido aca — a
// diferencia de las paginas estaticas de /comparar, esto no se indexa,
// asi que no hay riesgo de contenido delgado por comparar tier bajo.
// ═══════════════════════════════════════════════
let HOME_OFFICIAL_DATA={};
const HC_STATE={slugA:null,slugB:null};

async function cargarOfficialData(){
  try{
    const r=await fetch('/weapons-official.json',{cache:'no-cache'});if(!r.ok)return;
    const d=await r.json();
    HOME_OFFICIAL_DATA=d.armas||d||{};
  }catch(e){console.warn('[HOME] weapons-official.json no disponible para el comparador');}
}

function hcGetNested(obj,path){
  let cur=obj;
  for(const part of path.split('.')){
    if(!cur||typeof cur!=='object')return null;
    cur=cur[part];
  }
  return cur;
}

const HC_STATS=[
  {label:'Tiempo para eliminar (TTK)',unit:'ms',higherBetter:false,get:(a,o)=>a._ttk},
  {label:'Cadencia de disparo',unit:'RPM',higherBetter:true,get:(a,o)=>hcGetNested(o,'potencia_de_fuego.cadencia_rpm')},
  {label:'Velocidad de bala',unit:'m/s',higherBetter:true,get:(a,o)=>hcGetNested(o,'potencia_de_fuego.velocidad_balas_ms')},
  {label:'Daño a corta distancia',unit:'',higherBetter:true,get:(a,o)=>{const t=o&&o.alcance_dano;return t&&t[0]?t[0].dano:null;}},
  {label:'Daño a larga distancia',unit:'',higherBetter:true,get:(a,o)=>{const t=o&&o.alcance_dano;return t&&t.length?t[t.length-1].dano:null;}},
  {label:'Velocidad de apuntado (ADS)',unit:'ms',higherBetter:false,get:(a,o)=>hcGetNested(o,'manejo.ads_ms')},
  {label:'Velocidad de recarga',unit:'ms',higherBetter:false,get:(a,o)=>hcGetNested(o,'manejo.recarga_ms')},
  {label:'Velocidad de movimiento',unit:'m/s',higherBetter:true,get:(a,o)=>hcGetNested(o,'movilidad.velocidad_movimiento_ms')},
];

function hcFmtVal(v,unit){
  if(v==null)return'—';
  if(typeof v==='number'&&Number.isInteger(v)===false&&Math.round(v)===v)v=Math.round(v);
  return`${v}${unit?' '+unit:''}`;
}

function hcFilasStats(armaA,offA,armaB,offB){
  // Siempre se muestran las 8 filas (con "—" del lado que no tenga dato),
  // asi la tabla no cambia de alto segun que armas se elijan. Solo se
  // resalta un "ganador" y se suma al conteo cuando AMBOS lados tienen
  // el dato real — nunca se inventa un valor faltante.
  let filas='',ganaA=0,ganaB=0,resumenTtk=null;
  for(const spec of HC_STATS){
    const va=spec.get(armaA,offA), vb=spec.get(armaB,offB);
    let win=null;
    if(va!=null&&vb!=null&&va!==vb){
      win=spec.higherBetter?(va>vb?'a':'b'):(va<vb?'a':'b');
      if(win==='a')ganaA++;else ganaB++;
    }
    if(spec.label.indexOf('Tiempo para eliminar')===0&&va!=null&&vb!=null)resumenTtk={va,vb,win};
    filas+=`<tr><td class="hc-val${win==='a'?' hc-win':''}">${escapeHtml(hcFmtVal(va,spec.unit))}</td>`+
           `<td class="hc-label">${escapeHtml(spec.label)}</td>`+
           `<td class="hc-val${win==='b'?' hc-win':''}">${escapeHtml(hcFmtVal(vb,spec.unit))}</td></tr>`;
  }
  return{filas,ganaA,ganaB,resumenTtk};
}

function hcVeredicto(nombreA,nombreB,ganaA,ganaB,resumenTtk){
  const partes=[];
  if(resumenTtk&&resumenTtk.win){
    const{va,vb,win}=resumenTtk;
    partes.push(win==='a'
      ?`${nombreA} elimina más rápido (${hcFmtVal(va,'ms')} vs ${hcFmtVal(vb,'ms')} de TTK).`
      :`${nombreB} elimina más rápido (${hcFmtVal(vb,'ms')} vs ${hcFmtVal(va,'ms')} de TTK).`);
  }
  if(ganaA>ganaB)partes.push(`En general, ${nombreA} gana en más categorías comparadas (${ganaA} de ${ganaA+ganaB}).`);
  else if(ganaB>ganaA)partes.push(`En general, ${nombreB} gana en más categorías comparadas (${ganaB} de ${ganaA+ganaB}).`);
  else partes.push('Están muy parejas en el resto de las categorías comparadas.');
  return partes.join(' ');
}

function hcCardHtml(arma,label){
  if(!arma)return'';
  const acc=colorTipo(arma.tipo||''), tier=arma.tier||'C', tcol=tierColor(tier), bt=textoBoton(acc);
  const ttk=arma._ttk;
  const rank=arma._autoRank||arma.ranking;
  const stats=`
        <div class="stat">${ico(IC.clock)}<div class="t"><span class="sl">TTK</span><span class="sn">${ttk?ttk+' ms':'—'}</span></div></div>
        <div class="stat">${ico(IC.bars)}<div class="t"><span class="sl">Tipo</span><span class="sn">${escapeHtml(tipoCorto(arma.tipo||''))}</span></div></div>
        <div class="stat">${ico(IC.bullet)}<div class="t"><span class="sl">Ranking</span><span class="sn">${rank&&rank<999?'#'+rank:'—'}</span></div></div>`;
  return`
  <article class="fcard" style="--a:${acc};--a10:${hexA(acc,.1)};--a14:${hexA(acc,.15)};--a30:${hexA(acc,.34)};--bt:${bt}">
    <div class="fc-img"><img src="${escapeHtml(arma.imagen||'')}" alt="${escapeHtml(arma.nombre||'')}" loading="lazy" onerror="this.style.display='none'"></div>
    <div class="fc-meta">
      <div class="fc-top">
        <div class="fc-name"><h3><a href="/armas/${escapeHtml(label.slug)}" style="color:inherit;text-decoration:none">${escapeHtml(arma.nombre||'')}</a></h3></div>
        <div class="tierb" style="color:${tcol};border-color:${hexA(tcol,.34)};background:${hexA(tcol,.1)}">TIER<b>${tier}</b></div>
      </div>
      <div class="fc-stats">${stats}</div>
    </div>
  </article>`;
}

function renderComparador(slugA,slugB){
  const cont=document.getElementById('hcResult');if(!cont)return;
  const armaA=HOME_ARMAS_DATA[slugA], armaB=HOME_ARMAS_DATA[slugB];
  if(!armaA||!armaB)return;
  HC_STATE.slugA=slugA;HC_STATE.slugB=slugB;

  const offA=HOME_OFFICIAL_DATA[slugA]||{}, offB=HOME_OFFICIAL_DATA[slugB]||{};
  const{filas,ganaA,ganaB,resumenTtk}=hcFilasStats(armaA,offA,armaB,offB);
  const veredicto=(ganaA+ganaB)>0||resumenTtk
    ?hcVeredicto(armaA.nombre,armaB.nombre,ganaA,ganaB,resumenTtk)
    :'No hay suficientes datos verificados para comparar estas dos armas todavía.';

  cont.classList.add('hc-swap');
  setTimeout(()=>{
    cont.innerHTML=`
      <div class="hc-cards">
        ${hcCardHtml(armaA,{slug:slugA})}
        ${hcCardHtml(armaB,{slug:slugB})}
      </div>
      <table class="hc-table"><tbody>${filas}</tbody></table>
      <p class="hc-verdict">${escapeHtml(veredicto)}</p>`;
    cont.classList.remove('hc-swap');
  },90);
}

// ── buscador con autocomplete, reutilizable para los 2 selectores ──
function hcSetupSearch(inputId,ddId,onPick){
  const input=document.getElementById(inputId), dd=document.getElementById(ddId);
  if(!input||!dd)return;
  let items=[],focused=-1;

  function cerrar(){dd.classList.remove('open');dd.innerHTML='';items=[];focused=-1;}

  function buscar(q){
    const nq=norm(q);
    const entradas=Object.entries(HOME_ARMAS_DATA).filter(([slug,a])=>a&&a.nombre);
    if(!nq){
      items=entradas.slice(0,8);
    }else{
      items=entradas.filter(([slug,a])=>norm(a.nombre).includes(nq)).slice(0,8);
    }
    focused=-1;
    if(!items.length){
      dd.innerHTML='<div class="hc-dd-empty">Sin resultados</div>';
      dd.classList.add('open');
      return;
    }
    dd.innerHTML=items.map(([slug,a])=>`
      <div class="hc-dd-item" data-slug="${escapeHtml(slug)}">
        <span class="hc-dd-ico"><img src="${escapeHtml(a.imagen||'')}" alt="" loading="lazy" onerror="this.style.display='none'"></span>
        <span class="hc-dd-name">${escapeHtml(a.nombre)}</span>
        <span class="hc-dd-tier">${escapeHtml(a.tier||'C')}</span>
      </div>`).join('');
    dd.classList.add('open');
  }

  function elegir(slug){
    const a=HOME_ARMAS_DATA[slug];if(!a)return;
    input.value=a.nombre;
    cerrar();
    onPick(slug);
  }

  input.addEventListener('focus',()=>buscar(input.value));
  input.addEventListener('input',()=>buscar(input.value));
  input.addEventListener('keydown',e=>{
    if(!dd.classList.contains('open')||!items.length)return;
    if(e.key==='ArrowDown'){e.preventDefault();focused=Math.min(focused+1,items.length-1);}
    else if(e.key==='ArrowUp'){e.preventDefault();focused=Math.max(focused-1,-1);}
    else if(e.key==='Enter'){e.preventDefault();if(focused>=0)elegir(items[focused][0]);return;}
    else if(e.key==='Escape'){cerrar();return;}
    else return;
    dd.querySelectorAll('.hc-dd-item').forEach((el,i)=>{
      el.classList.toggle('focused',i===focused);
      if(i===focused)el.scrollIntoView({block:'nearest'});
    });
  });
  dd.addEventListener('click',e=>{
    const item=e.target.closest('.hc-dd-item');if(!item)return;
    elegir(item.dataset.slug);
  });
  document.addEventListener('click',e=>{
    if(!input.contains(e.target)&&!dd.contains(e.target))cerrar();
  });
}

function initComparador(){
  if(!document.getElementById('hcResult'))return;
  hcSetupSearch('hcInputA','hcDdA',slug=>renderComparador(slug,HC_STATE.slugB||slug));
  hcSetupSearch('hcInputB','hcDdB',slug=>renderComparador(HC_STATE.slugA||slug,slug));

  // par por defecto: #1 y #2 del ranking general, para que se vea "vivo" ya cargado
  const ordenado=Object.entries(HOME_ARMAS_DATA)
    .filter(([slug,a])=>a&&typeof a._autoRank==='number')
    .sort((a,b)=>a[1]._autoRank-b[1]._autoRank);
  if(ordenado.length>=2){
    const[slugA,armaA]=ordenado[0],[slugB,armaB]=ordenado[1];
    document.getElementById('hcInputA').value=armaA.nombre;
    document.getElementById('hcInputB').value=armaB.nombre;
    renderComparador(slugA,slugB);
  }
}

// ── init: usa el motor compartido (cargarMeta de meta-core.js) ──
async function initHome(){
  initPills(); initCopy(); setHero('battle_royale');
  try{
    await cargarMeta();               // meta-core: fetch + normaliza + TTK/parches + orden
    await cargarHomeLoadouts();        // attachments reales para las 3 tarjetas del home
  }catch(e){
    const f=document.getElementById('featured');
    if(f)f.innerHTML=`<div class="cap" style="grid-column:1/-1;text-align:center;color:var(--red);padding:30px 0">No se pudo cargar el meta</div>`;
    return;
  }
  const ts=todasLasArmas[0]&&todasLasArmas[0].timestamp;
  if(ts){const el=document.querySelector('.upd');if(el)el.textContent='Actualizado '+fechaSolo(ts);}
  renderAll();
  setupHomeSearch();
  try{ renderTTKChart(); }catch(e){ console.warn('[HOME] no se pudo armar el chart de TTK', e); }
  try{
    await cargarOfficialData();      // weapons-official.json para el comparador en vivo
    initComparador();
  }catch(e){ console.warn('[HOME] no se pudo armar el comparador', e); }
}
document.addEventListener('DOMContentLoaded',initHome);

// ── Temporadas: transición automática (temporada.json) ─────────────
// ACTUAL  = última temporada cuya fecha de lanzamiento ya pasó → su banner va en el hero.
// PRÓXIMA = siguiente cuya fecha todavía no llegó → banner de arriba con cuenta regresiva.
// Cuando el contador llega a cero, la próxima pasa a ser la actual sola: el banner de
// arriba desaparece, el del hero se reemplaza y los textos cambian de número. Sin tocar nada.
let _cdInterval = null;

function _pickTemporadas(lista, ahora){
  const orden = [...lista].filter(t => t && t.lanzamiento)
    .sort((a,b) => new Date(a.lanzamiento) - new Date(b.lanzamiento));
  let actual = null, proxima = null;
  for (const t of orden){
    if (new Date(t.lanzamiento).getTime() <= ahora) actual = t;      // la última ya lanzada
    else { proxima = t; break; }                                      // la primera pendiente
  }
  return { actual, proxima };
}

function _pintarTemporadaActual(t){
  if (!t) return;
  // banner del hero
  const heroLink = document.getElementById('seasonHeroBanner');
  if (heroLink){
    heroLink.href = t.url || '/noticias';
    heroLink.setAttribute('aria-label', `Temporada ${t.numero} de Warzone Black Ops 7`);
    const img = heroLink.querySelector('img');
    if (img){
      const alt = t.alt || `Temporada ${t.numero} — Warzone Black Ops 7`;
      if (t.banner && img.getAttribute('src') !== t.banner) img.src = t.banner;
      img.alt = alt;
    }
  }
  // etiqueta "TEMPORADA N" (puede haber más de una en la página)
  document.querySelectorAll('.season, [data-season-label]').forEach(el => {
    el.textContent = `TEMPORADA ${t.numero}`;
  });
}

function _pintarCuentaRegresiva(t){
  const banner = document.getElementById('seasonCountdownBanner');
  if (!banner) return;
  if (_cdInterval){ clearInterval(_cdInterval); _cdInterval = null; }

  // sin próxima temporada anunciada → el banner con contador no se muestra
  if (!t){ banner.hidden = true; return; }

  banner.hidden = false;
  banner.href = t.url || '/noticias';
  banner.setAttribute('aria-label', `Temporada ${t.numero} de Warzone Black Ops 7 — ver novedades`);
  const img = banner.querySelector('img');
  if (img && t.banner){
    if (img.getAttribute('src') !== t.banner) img.src = t.banner;
    img.alt = t.alt || `Temporada ${t.numero} — Warzone Black Ops 7`;
  }
  const cd = banner.querySelector('.tb-countdown');
  if (cd) cd.setAttribute('aria-label', `Cuenta regresiva Temporada ${t.numero}`);

  const nums = {d:document.getElementById('s5cd-d'), h:document.getElementById('s5cd-h'),
                m:document.getElementById('s5cd-m'), s:document.getElementById('s5cd-s')};
  const label = document.getElementById('s5CountdownLabel');
  if (!nums.d) return;
  const target = new Date(t.lanzamiento).getTime();
  const pad = n => String(Math.max(0,n)).padStart(2,'0');
  function set(el,val){
    const next = pad(val);
    if (el.textContent === next) return;
    el.textContent = next;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
  }
  function tick(){
    const diff = target - Date.now();
    if (diff <= 0){
      // llegó la hora: recargar la config y hacer la transición sin intervención
      clearInterval(_cdInterval); _cdInterval = null;
      if (label) label.textContent = '¡Ya disponible!';
      set(nums.d,0); set(nums.h,0); set(nums.m,0); set(nums.s,0);
      setTimeout(initTemporadas, 1500);
      return;
    }
    set(nums.d, Math.floor(diff/86400000));
    set(nums.h, Math.floor(diff%86400000/3600000));
    set(nums.m, Math.floor(diff%3600000/60000));
    set(nums.s, Math.floor(diff%60000/1000));
  }
  tick();
  _cdInterval = setInterval(tick, 1000);
}

async function initTemporadas(){
  try{
    const r = await fetch('/temporada.json?v=' + Date.now());
    if (!r.ok) return;
    const cfg = await r.json();
    const { actual, proxima } = _pickTemporadas(cfg.temporadas || [], Date.now());
    _pintarTemporadaActual(actual);
    _pintarCuentaRegresiva(proxima);
  }catch(e){
    console.warn('[HOME] temporada.json no disponible; queda lo horneado en el HTML', e);
  }
}
document.addEventListener('DOMContentLoaded', initTemporadas);
