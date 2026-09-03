// ════════════════════════════════════════════
//   COMUNIDAD.JS — auth, formulario de envío (con selectores visuales) y feed
//   Usa armas-data.json (catálogo local) + Supabase (wz-community.js)
// ════════════════════════════════════════════
let COM_ARMAS = {};
let COM_SLOTS = {};
let COM_ARMA_ELEGIDA = null;
let COM_ACCESORIOS_ELEGIDOS = {};
let COM_SESION = null;
let COM_EDITORIALES = [];
const COM_MAX_ACCESORIOS = 5;
let COM_CLASE_DESTACADA = null;
let COM_CLASE_DESTACADA_ENFOCADA = false;
let COM_ARMA_DESDE_URL = null;
let COM_ENTRADA_CONTEXTUAL = false;

try {
  const parametrosUrl = new URLSearchParams(window.location.search);
  const claseDesdeUrl = parametrosUrl.get('clase');
  if (claseDesdeUrl && /^[A-Za-z0-9-]{1,120}$/.test(claseDesdeUrl)) COM_CLASE_DESTACADA = claseDesdeUrl;
  const armaDesdeUrl = parametrosUrl.get('arma');
  if (armaDesdeUrl && /^[a-z0-9-]{1,80}$/.test(armaDesdeUrl)) {
    COM_ARMA_DESDE_URL = armaDesdeUrl;
    COM_ENTRADA_CONTEXTUAL = true;
  }
} catch (e) { /* URL sin parámetros compatibles */ }

// El SDK de Supabase puede limpiar el "#type=recovery" de la URL (via
// detectSessionInUrl) antes de que comActualizarEstadoSesion() llegue a
// leerlo -- carrera que hacia que el link de "elegi una contraseña nueva"
// dejara a la persona logueada de una en vez de mostrarle el formulario.
// PASSWORD_RECOVERY es el evento que Supabase dispara para este caso
// especifico, asi que es la fuente de verdad (no el hash a mano).
let COM_EN_RECUPERACION = false;
wzsb.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    COM_EN_RECUPERACION = true;
    comActualizarEstadoSesion();
  }
});

function comNombreES(n) {
  return (typeof traducirAccesorioES === 'function') ? traducirAccesorioES(n) : n;
}

function comSlugSafe(s) {
  return (s || '').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
}

function comAvatarTone(username) {
  const tones = ['violet', 'cyan', 'lime', 'rose', 'amber'];
  const value = String(username || '');
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash * 31) + value.charCodeAt(i)) >>> 0;
  return tones[hash % tones.length];
}

async function comCargarArmas() {
  try {
    const r = await fetch('/armas-data.json', { cache: 'no-cache' });
    if (!r.ok) return;
    const data = await r.json();
    COM_ARMAS = data.armas || {};
    COM_SLOTS = data._slot_translations || {};
    comPoblarArmaGrid();
    comPoblarFiltro();
    if (COM_ARMA_DESDE_URL && COM_ARMAS[COM_ARMA_DESDE_URL]) {
      comElegirArma(COM_ARMA_DESDE_URL);
    }
  } catch (e) {
    console.error('No se pudo cargar armas-data.json', e);
  }
}

async function comCargarEditoriales() {
  try {
    const r = await fetch('/community-editorial.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    COM_EDITORIALES = Array.isArray(data.loadouts) ? data.loadouts : [];
  } catch (e) {
    COM_EDITORIALES = [];
    console.error('No se pudo cargar community-editorial.json', e);
  }
}

function comPoblarFiltro() {
  const entradas = Object.entries(COM_ARMAS).sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));
  const selFiltro = document.getElementById('comFiltroArma');
  for (const [slug, arma] of entradas) {
    const o = document.createElement('option');
    o.value = slug;
    o.textContent = arma.nombre;
    selFiltro.appendChild(o);
  }
}

// ── selector visual de arma ──
function comPoblarArmaGrid(filtro) {
  const grid = document.getElementById('comArmaGrid');
  const term = (filtro || '').toLowerCase();
  const entradas = Object.entries(COM_ARMAS)
    .filter(([, a]) => a.nombre.toLowerCase().includes(term))
    .sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));

  grid.innerHTML = entradas.map(([slug, a]) => `
    <button type="button" class="com-arma-tile${slug === COM_ARMA_ELEGIDA ? ' selected' : ''}" data-slug="${slug}">
      <img src="${escapeHtml(a.imagen)}" alt="${escapeHtml(a.nombre)}" loading="lazy" onerror="this.style.visibility='hidden'">
      <span>${escapeHtml(a.nombre)}</span>
    </button>`).join('');

  grid.querySelectorAll('.com-arma-tile').forEach(btn => {
    btn.addEventListener('click', () => comElegirArma(btn.dataset.slug));
  });
}

function comElegirArma(slug) {
  COM_ARMA_ELEGIDA = slug;
  COM_ACCESORIOS_ELEGIDOS = {};
  document.getElementById('comArma').value = slug;
  document.querySelectorAll('.com-arma-tile').forEach(t => t.classList.toggle('selected', t.dataset.slug === slug));

  const arma = COM_ARMAS[slug];
  const elegida = document.getElementById('comArmaElegida');
  document.getElementById('comArmaElegidaImg').src = arma.imagen;
  document.getElementById('comArmaElegidaNombre').textContent = `${arma.nombre} (${arma.tipo})`;
  elegida.classList.add('show');

  comRenderAccesorios(slug);
}

// ── selector visual de accesorios (imagen + nombre, uno por slot) ──
function comRenderAccesorios(slug) {
  const wrap = document.getElementById('comAccesoriosWrap');
  const cont = document.getElementById('comAccesorios');
  cont.innerHTML = '';
  const arma = COM_ARMAS[slug];
  if (!arma || !arma.attachments) { wrap.style.display = 'none'; return; }

  const entries = Object.entries(arma.attachments).filter(([, items]) => items && items.length);
  if (!entries.length) { wrap.style.display = 'none'; return; }

  for (const [slotKey, items] of entries) {
    const label = COM_SLOTS[slotKey] || slotKey;
    const block = document.createElement('div');
    block.className = 'com-slot-block';
    const iconBase = arma.icon_path;
    block.innerHTML = `<div class="com-slot-label">${escapeHtml(label)}</div>
      <div class="com-chip-row">${items.map(it => `
        <div class="com-chip" data-slot="${escapeHtml(label)}" data-name="${escapeHtml(it.name)}">
          <img src="${iconBase}/${comSlugSafe(it.name)}.png" alt="${escapeHtml(it.name)}" loading="lazy" onerror="this.style.visibility='hidden'">
          <span>${escapeHtml(comNombreES(it.name))}</span>
        </div>`).join('')}</div>`;
    cont.appendChild(block);
  }
  wrap.style.display = 'block';

  cont.querySelectorAll('.com-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const slot = chip.dataset.slot, name = chip.dataset.name;
      const yaElegido = COM_ACCESORIOS_ELEGIDOS[slot] === name;
      const totalElegidos = Object.keys(COM_ACCESORIOS_ELEGIDOS).length;

      if (!yaElegido && totalElegidos >= COM_MAX_ACCESORIOS) return; // al tope, no deja elegir uno nuevo

      cont.querySelectorAll(`.com-chip[data-slot="${CSS.escape(slot)}"]`).forEach(c => c.classList.remove('selected'));
      if (yaElegido) {
        delete COM_ACCESORIOS_ELEGIDOS[slot];
      } else {
        COM_ACCESORIOS_ELEGIDOS[slot] = name;
        chip.classList.add('selected');
      }
      comActualizarContadorAccesorios();
    });
  });

  comActualizarContadorAccesorios();
}

function comActualizarContadorAccesorios() {
  const total = Object.keys(COM_ACCESORIOS_ELEGIDOS).length;
  const contador = document.getElementById('comAccContador');
  contador.textContent = `${total}/${COM_MAX_ACCESORIOS} elegidos`;
  contador.classList.toggle('full', total >= COM_MAX_ACCESORIOS);

  const alTope = total >= COM_MAX_ACCESORIOS;
  document.querySelectorAll('.com-chip').forEach(chip => {
    const slot = chip.dataset.slot, name = chip.dataset.name;
    const elegido = COM_ACCESORIOS_ELEGIDOS[slot] === name;
    chip.classList.toggle('disabled', alTope && !elegido);
  });
}

function comMostrarMsg(id, texto, ok) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = 'com-msg ' + (ok ? 'ok' : 'err');
}

// ── toasts ──
function comToast(texto, emoji) {
  const zone = document.getElementById('comToastZone');
  const t = document.createElement('div');
  t.className = 'com-toast';
  t.innerHTML = `${emoji ? `<span>${emoji}</span>` : ''}<span>${escapeHtml(texto)}</span>`;
  zone.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 2400);
}

// ── skeletons de carga ──
function comSkeletonsHtml(n) {
  const uno = `<div class="com-skel">
    <div class="s sk-banner"></div>
    <div class="sk-body">
      <div class="sk-row"><div class="s sk-av"></div><div style="flex:1;display:flex;flex-direction:column;gap:6px"><div class="s sk-l1"></div><div class="s sk-l2"></div></div></div>
      <div class="s sk-block"></div>
      <div class="s sk-code"></div>
    </div>
  </div>`;
  return uno.repeat(n);
}

// ── stats del hero ──
async function comCargarStats() {
  try {
    const [{ count: clases }, { count: votos }] = await Promise.all([
      wzsb.from('loadouts').select('id', { count: 'exact', head: true }).eq('estado', 'aprobado'),
      wzsb.from('votos').select('id', { count: 'exact', head: true })
    ]);
    document.getElementById('comStatClases').textContent = (clases ?? 0) + COM_EDITORIALES.length;
    document.getElementById('comStatVotos').textContent = votos ?? 0;
    document.getElementById('comHeroStats').style.display = 'flex';
  } catch (e) { /* stats decorativas: si fallan, no se muestran */ }
}

// ── auth ──
const COM_ICONO_OJO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const COM_ICONO_OJO_TACHADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><path d="M1 1l22 22"></path></svg>';

function comExpandirAuth(expandido, enfocar) {
  const card = document.getElementById('comAuthCard');
  const panel = document.getElementById('comAuthPanel');
  const toggle = document.getElementById('comAuthToggle');
  card.classList.toggle('is-collapsed', !expandido);
  panel.hidden = !expandido;
  toggle.setAttribute('aria-expanded', String(expandido));
  if (expandido && enfocar) {
    requestAnimationFrame(() => {
      const campo = document.querySelector('.com-auth-form.active input');
      if (campo) campo.focus();
    });
  }
}

function comInitAuth() {
  document.getElementById('comAuthToggle').addEventListener('click', () => {
    comCambiarTab('registro');
    wzTrackCommunity('community_publish_cta_open', { entry_point: 'community' });
    wzTrackCommunity('community_register_view', { entry_point: 'community' });
    comExpandirAuth(true, true);
  });
  document.getElementById('comAuthMinimize').addEventListener('click', () => comExpandirAuth(false, false));
  document.getElementById('comTabLogin').addEventListener('click', () => comCambiarTab('login'));
  document.getElementById('comTabRegistro').addEventListener('click', () => {
    comCambiarTab('registro');
    wzTrackCommunity('community_register_view', { entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
  });

  document.querySelectorAll('.com-pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.target);
      const oculto = inp.type === 'password';
      inp.type = oculto ? 'text' : 'password';
      btn.innerHTML = oculto ? COM_ICONO_OJO_TACHADO : COM_ICONO_OJO;
      btn.setAttribute('aria-label', oculto ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });

  document.getElementById('comForgotLink').addEventListener('click', e => {
    e.preventDefault();
    comCambiarTab('forgot');
  });
  document.getElementById('comForgotVolver').addEventListener('click', e => {
    e.preventDefault();
    comCambiarTab('login');
  });
  document.getElementById('comForgotForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('comForgotEmail').value.trim();
    const { error } = await wzOlvideContrasena(email);
    if (error) { comMostrarMsg('comForgotMsg', 'No se pudo enviar el mail. Probá de nuevo.', false); return; }
    comMostrarMsg('comForgotMsg', 'Listo, revisá tu email para elegir una contraseña nueva.', true);
  });

  document.getElementById('comResetForm').addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.getElementById('comResetPass').value;
    const { error } = await wzActualizarContrasena(password);
    if (error) { comMostrarMsg('comResetMsg', 'No se pudo guardar. Probá de nuevo.', false); return; }
    // La sesion de recuperacion ya quedo autenticada tras updateUser(), pero
    // preferimos que inicie sesion de nuevo a mano con la contraseña nueva
    // (mas claro que seguir de largo ya logueado sin pasar por el login).
    await wzLogout();
    COM_EN_RECUPERACION = false;
    history.replaceState(null, '', window.location.pathname); // saca el #type=recovery de la URL
    document.getElementById('comAuthTabsWrap').style.display = '';
    comCambiarTab('login');
    comMostrarMsg('comLoginMsg', '¡Contraseña actualizada! Iniciá sesión con tu contraseña nueva.', true);
    await comActualizarEstadoSesion();
  });

  document.getElementById('comLoginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('comLoginEmail').value.trim();
    const password = document.getElementById('comLoginPass').value;
    const { error } = await wzLogin(email, password);
    if (error) { comMostrarMsg('comLoginMsg', 'Email o contraseña incorrectos.', false); return; }
    await comActualizarEstadoSesion();
  });

  document.getElementById('comRegistroForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('comRegUsername').value.trim();
    const email = document.getElementById('comRegEmail').value.trim();
    const password = document.getElementById('comRegPass').value;
    if (username.length < 3) { comMostrarMsg('comRegMsg', 'El nombre de usuario debe tener al menos 3 caracteres.', false); return; }
    wzTrackCommunity('community_register_submit', { entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
    const { error } = await wzRegistrar(email, password, username);
    if (error) {
      let msg = 'No se pudo crear la cuenta. Probá de nuevo.';
      if (/unique|duplicate/i.test(error.message)) msg = 'Ese nombre de usuario ya está en uso.';
      else if (/rate limit/i.test(error.message)) msg = 'Demasiados registros seguidos, esperá unos minutos y probá de nuevo.';
      else if (/invalid/i.test(error.message)) msg = 'Ese email no es válido.';
      else if (/already registered/i.test(error.message)) msg = 'Ese email ya tiene una cuenta — iniciá sesión.';
      comMostrarMsg('comRegMsg', msg, false);
      return;
    }
    try { localStorage.setItem('wz_community_pending_registration', '1'); } catch (e) { /* métrica opcional */ }
    wzTrackCommunity('community_register_created', { entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
    comMostrarMsg('comRegMsg', '¡Cuenta creada! Revisá tu email para confirmar antes de publicar.', true);
    await comActualizarEstadoSesion();
  });

  document.getElementById('comLogoutBtn').addEventListener('click', async () => {
    await wzLogout();
    comExpandirAuth(false, false);
    await comActualizarEstadoSesion();
  });
}

function comCambiarTab(tab) {
  // "forgot"/"reset" no son pestañas de verdad, así que las tabs quedan
  // marcadas como "login" en esos dos casos (es de donde se llega/vuelve).
  document.getElementById('comTabLogin').classList.toggle('active', tab === 'login' || tab === 'forgot' || tab === 'reset');
  document.getElementById('comTabRegistro').classList.toggle('active', tab === 'registro');
  document.getElementById('comLoginForm').classList.toggle('active', tab === 'login');
  document.getElementById('comRegistroForm').classList.toggle('active', tab === 'registro');
  document.getElementById('comForgotForm').classList.toggle('active', tab === 'forgot');
  document.getElementById('comResetForm').classList.toggle('active', tab === 'reset');
}

async function comActualizarEstadoSesion() {
  COM_SESION = await wzSesionActual();
  const logueado = !!COM_SESION;
  const enRecuperacion = COM_EN_RECUPERACION || /type=recovery/.test(window.location.hash);

  // Con un link de recuperación, Supabase arma una sesión temporal — no la
  // tratamos como "logueado normal" hasta que elija una contraseña nueva.
  if (enRecuperacion) {
    document.getElementById('comAuthCard').style.display = 'block';
    comExpandirAuth(true, false);
    document.getElementById('comAuthTabsWrap').style.display = 'none';
    document.getElementById('comUserBar').style.display = 'none';
    document.getElementById('comFormCard').style.display = 'none';
    comCambiarTab('reset');
    return;
  }

  document.getElementById('comAuthTabsWrap').style.display = '';
  document.getElementById('comAuthCard').style.display = logueado ? 'none' : 'block';
  document.getElementById('comUserBar').style.display = logueado ? 'flex' : 'none';
  document.getElementById('comFormCard').style.display = logueado ? 'block' : 'none';

  if (logueado) {
    const { data: perfil } = await wzMiPerfil(COM_SESION.user.id);
    const username = perfil ? perfil.username : COM_SESION.user.email;
    document.getElementById('comUsername').textContent = username;
    comPintarAvatar(username, perfil && perfil.avatar_url);
    try {
      if (localStorage.getItem('wz_community_pending_registration') === '1') {
        wzTrackCommunity('community_account_confirmed', { entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
        localStorage.removeItem('wz_community_pending_registration');
      }
      if (sessionStorage.getItem('wz_community_loadout_form_seen') !== '1') {
        wzTrackCommunity('community_loadout_form_view', { entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
        sessionStorage.setItem('wz_community_loadout_form_seen', '1');
      }
    } catch (e) { /* medición opcional, nunca bloquea publicar */ }
  }
}

function comPintarAvatar(username, avatarUrl) {
  const img = document.getElementById('comAvatarImg');
  const inicial = document.getElementById('comAvatarInicial');
  if (avatarUrl) {
    img.src = avatarUrl;
    img.style.display = 'block';
    inicial.style.display = 'none';
  } else {
    img.style.display = 'none';
    inicial.style.display = 'flex';
    inicial.textContent = username.charAt(0).toUpperCase();
  }
}

function comInitAvatarUpload() {
  document.getElementById('comAvatarInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file || !COM_SESION) return;
    if (file.size > 4 * 1024 * 1024) { alert('La imagen no puede pesar más de 4MB.'); return; }
    const { data: url, error } = await wzSubirAvatar(COM_SESION.user.id, file);
    if (error) { alert('No se pudo subir la foto. Probá de nuevo.'); console.error(error); return; }
    comPintarAvatar(document.getElementById('comUsername').textContent, url);
  });
}

function comInitForm() {
  document.getElementById('comArmaBuscar').addEventListener('input', e => comPoblarArmaGrid(e.target.value));

  document.getElementById('comForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('comSubmitBtn');
    const codigo_clase = document.getElementById('comCodigo').value.trim();
    const comentario = document.getElementById('comComentario').value.trim();
    const honeypot = document.getElementById('comWeb').value;

    if (honeypot) return; // bot: silencio total, no delatamos el honeypot
    if (!COM_ARMA_ELEGIDA || !codigo_clase) {
      wzTrackCommunity('community_loadout_validation_error', { reason: 'weapon_or_code' });
      comMostrarMsg('comMsg', 'Elegí un arma y completá el código de clase.', false); return;
    }
    // Regla: una clase válida lleva SIEMPRE los 5 accesorios + el código.
    if (!COM_ACCESORIOS_ELEGIDOS || Object.keys(COM_ACCESORIOS_ELEGIDOS).length !== COM_MAX_ACCESORIOS) {
      wzTrackCommunity('community_loadout_validation_error', { reason: 'attachments' });
      comMostrarMsg('comMsg', 'La clase debe tener los 5 accesorios completos.', false); return;
    }

    btn.disabled = true;
    wzTrackCommunity('community_loadout_submit', { arma_slug: COM_ARMA_ELEGIDA, entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
    const { error } = await wzEnviarLoadout({
      arma_slug: COM_ARMA_ELEGIDA, comentario, codigo_clase,
      accesorios: COM_ACCESORIOS_ELEGIDOS
    });
    btn.disabled = false;

    if (error) {
      comMostrarMsg('comMsg', error.message || 'No se pudo enviar. Probá de nuevo en un momento.', false);
      console.error(error);
      return;
    }
    wzTrackCommunity('community_loadout_submitted', { arma_slug: COM_ARMA_ELEGIDA, entry_point: COM_ENTRADA_CONTEXTUAL ? 'weapon_page' : 'community' });
    comMostrarMsg('comMsg', '¡Gracias! Tu clase quedó pendiente de revisión.', true);
    document.getElementById('comForm').reset();
    document.getElementById('comAccesoriosWrap').style.display = 'none';
    document.getElementById('comArmaElegida').classList.remove('show');
    COM_ARMA_ELEGIDA = null;
    COM_ACCESORIOS_ELEGIDOS = {};
    comPoblarArmaGrid();
  });
}

// ── feed ──
let COM_FEED_CACHE = [];
let COM_PERFILES = {};
let COM_FILTRO_USUARIO = null;

async function comCargarFeed() {
  const grid = document.getElementById('comGrid');
  grid.innerHTML = comSkeletonsHtml(3);

  const filtroBar = document.getElementById('comFiltroActivo');
  if (COM_FILTRO_USUARIO) {
    document.getElementById('comFiltroActivoNombre').textContent = COM_FILTRO_USUARIO;
    filtroBar.classList.add('show');
  } else {
    filtroBar.classList.remove('show');
  }

  const filtroArma = document.getElementById('comFiltroArma').value;
  const { data: loadouts, error } = await wzGetLoadoutsAprobados(filtroArma || null);
  if (error) console.error('No se pudieron cargar las clases de Supabase', error);

  const reales = error ? [] : (loadouts || []);
  const [{ data: votos }, { data: perfiles }] = await Promise.all([
    wzGetVotosPorLoadouts(reales.map(l => l.id)),
    wzGetPerfiles(reales.map(l => l.user_id))
  ]);

  COM_PERFILES = {};
  for (const p of (perfiles || [])) COM_PERFILES[p.id] = { username: p.username, avatar_url: p.avatar_url };

  const votosPorLoadout = {};
  for (const v of (votos || [])) {
    (votosPorLoadout[v.loadout_id] = votosPorLoadout[v.loadout_id] || []).push(v);
  }

  const editoriales = COM_EDITORIALES
    .filter(l => !filtroArma || l.arma_slug === filtroArma)
    .map(l => ({ ...l, _editorial: true, _username: l.alias, _resumen: wzResumenVotos([]) }));
  const comunidad = reales.map(l => ({
    ...l,
    _editorial: false,
    _username: (COM_PERFILES[l.user_id] || {}).username || 'Usuario',
    _resumen: wzResumenVotos(votosPorLoadout[l.id] || [])
  }));

  let items = [...editoriales, ...comunidad];
  if (COM_FILTRO_USUARIO) items = items.filter(l => l._username === COM_FILTRO_USUARIO);

  if (!items.length) {
    grid.innerHTML = `<div class="com-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
      <p>${error ? 'No se pudo cargar la comunidad. Probá recargar.' : `Todavía no hay clases aprobadas${filtroArma ? ' para esta arma' : ''}. ¡Sé el primero en compartir la tuya!`}</p>
    </div>`;
    return;
  }

  COM_FEED_CACHE = items;

  comOrdenarYRenderizar();
}

function comOrdenarYRenderizar() {
  const orden = document.getElementById('comOrden').value;
  const items = [...COM_FEED_CACHE];
  if (orden === 'votadas') {
    items.sort((a, b) => b._resumen.total - a._resumen.total);
  } else {
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const grid = document.getElementById('comGrid');
  grid.innerHTML = items.map((l, i) => comCardHtml(l, i)).join('');
  grid.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', () => comCopiarCodigo(btn)));
  grid.querySelectorAll('[data-voto]').forEach(btn => btn.addEventListener('click', () => comVotar(btn)));
  grid.querySelectorAll('[data-perfil]').forEach(btn => btn.addEventListener('click', () => {
    COM_FILTRO_USUARIO = btn.dataset.perfil;
    comCargarFeed();
    window.scrollTo({ top: document.getElementById('comFiltroActivo').offsetTop - 120, behavior: 'smooth' });
  }));
  comEnfocarClaseCompartida(grid);
}

function comEnfocarClaseCompartida(grid) {
  if (!COM_CLASE_DESTACADA) return;
  const card = [...grid.querySelectorAll('[data-com-loadout-id]')]
    .find(el => el.dataset.comLoadoutId === COM_CLASE_DESTACADA);
  if (!card) return;
  card.classList.add('is-linked');
  if (COM_CLASE_DESTACADA_ENFOCADA) return;
  COM_CLASE_DESTACADA_ENFOCADA = true;
  requestAnimationFrame(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }));
}

function comCardHtml(l, idx) {
  const arma = COM_ARMAS[l.arma_slug];
  const nombre = arma ? arma.nombre : l.arma_slug;
  const tipo = arma ? arma.tipo : '';
  const color = typeof colorTipo === 'function' ? colorTipo(tipo) : '#94A3B8';
  const perfil = COM_PERFILES[l.user_id] || {};
  const username = l._username || perfil.username || 'Usuario';
  const avatarHtml = perfil.avatar_url
    ? `<img class="com-avatar-img" src="${escapeHtml(perfil.avatar_url)}" alt="${escapeHtml(username)}">`
    : `<span class="com-avatar com-avatar--${comAvatarTone(username)}">${escapeHtml(username.charAt(0).toUpperCase())}</span>`;
  const yaVoto = l._editorial ? null : wzVotoLocal(l.id);
  const acc = Object.entries(l.accesorios || {});
  const r = l._resumen;
  const gustos = r.conteo.funciono;
  const accHtml = acc.map(([slot, val]) => {
    const iconSrc = arma ? `${arma.icon_path}/${comSlugSafe(val)}.png` : '';
    const icon = iconSrc
      ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;noicon&quot;>◈</span>'">`
      : `<span class="noicon">◈</span>`;
    return `<div class="com-acc-row">${icon}<span class="slot">${escapeHtml(slot)}</span><span class="val">${escapeHtml(comNombreES(val))}</span></div>`;
  }).join('');

  return `<article class="com-card" data-com-loadout-id="${escapeHtml(String(l.id || ''))}" style="animation-delay:${Math.min(idx * 70, 500)}ms">
    <div class="com-card-weapon">
      ${arma ? `<img src="${escapeHtml(arma.imagen)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
      <div class="wname">
        <h3>${escapeHtml(nombre)}</h3>
        <span class="com-tipo-chip" style="color:${color};background:${color}1c;border:1px solid ${color}55">${escapeHtml(tipo)}</span>
      </div>
    </div>
    <div class="com-card-body">
      <div class="com-card-head">
        <div class="com-card-who">
          ${avatarHtml}
          <div class="com-card-titles">
            <div class="com-username">${escapeHtml(username.toUpperCase())}${r.verificada ? ' <span class="verif" title="Verificada por la comunidad">✔</span>' : ''}</div>
            <div class="com-subtitle">${escapeHtml(nombre)} Loadout${r.total ? ` · ${r.total} voto${r.total === 1 ? '' : 's'}` : ''}</div>
          </div>
        </div>
        ${l._editorial ? '<span class="com-editorial-badge">Selección editorial</span>' : `<button class="com-like-badge${yaVoto ? ' chosen' : ''}" data-voto="funciono" data-id="${l.id}" ${yaVoto ? 'disabled' : ''}>👍 ${gustos}</button>`}
      </div>
      ${acc.length ? `<div class="com-acc-list">${accHtml}</div>` : ''}
      <div class="com-codigo-row">
        <span class="com-codigo">${escapeHtml(l.codigo_clase)}</span>
        <button class="com-copy-btn" data-copy data-code="${escapeHtml(l.codigo_clase)}">Copiar</button>
      </div>
      ${l._editorial
        ? ''
        : `<button class="com-profile-btn" data-perfil="${escapeHtml(username)}">Ver clases de ${escapeHtml(username)}</button>`}
    </div>
  </article>`;
}

async function comCopiarCodigo(btn) {
  try {
    await navigator.clipboard.writeText(btn.dataset.code);
    btn.textContent = '✔ Copiado';
    btn.classList.add('done');
    comToast('Código copiado — pegalo en el juego', '📋');
    setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('done'); }, 1800);
  } catch (e) { /* clipboard no disponible, sin drama */ }
}

async function comVotar(btn) {
  const id = btn.dataset.id;
  const tipo = btn.dataset.voto;
  if (wzVotoLocal(id)) return;
  btn.disabled = true;
  const { error } = await wzVotar(id, tipo);
  if (error) { btn.disabled = false; return; }
  comToast('¡Gracias por tu voto!', '🗳️');
  await comCargarFeed(); // recarga simple para reflejar el conteo real desde el server
}

document.addEventListener('DOMContentLoaded', async () => {
  comInitAuth();
  comInitForm();
  comInitAvatarUpload();
  if (COM_ENTRADA_CONTEXTUAL) {
    comCambiarTab('registro');
    wzTrackCommunity('community_contextual_cta_open', { arma_slug: COM_ARMA_DESDE_URL });
    wzTrackCommunity('community_register_view', { entry_point: 'weapon_page' });
    comExpandirAuth(true, true);
  }
  comActualizarEstadoSesion();
  document.getElementById('comFiltroArma').addEventListener('change', () => { COM_FILTRO_USUARIO = null; comCargarFeed(); });
  document.getElementById('comOrden').addEventListener('change', comOrdenarYRenderizar);
  document.getElementById('comFiltroActivoQuitar').addEventListener('click', () => { COM_FILTRO_USUARIO = null; comCargarFeed(); });
  await Promise.all([comCargarArmas(), comCargarEditoriales()]);
  await Promise.all([comCargarFeed(), comCargarStats()]);
});
