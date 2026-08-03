// ════════════════════════════════════════════
//   WZ-COMMUNITY.JS — cliente Supabase + helpers compartidos
//   Usado por /comunidad, /comunidad-admin y (a futuro)
//   la sección "Clases de la comunidad" en cada ficha de arma.
//   Requiere que la página cargue antes el SDK:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ════════════════════════════════════════════
const WZ_SUPABASE_URL = 'https://hvymuobgqnqqfedqxqmp.supabase.co';
const WZ_SUPABASE_KEY = 'sb_publishable_K9getRZ8g1RRu6ycx_z1Cw_ZhS9bLnY';

const wzsb = window.supabase.createClient(WZ_SUPABASE_URL, WZ_SUPABASE_KEY);

const WZ_VOTO_LABELS = {
  funciono:    { emoji: '✅', texto: 'Me funcionó' },
  masomenos:   { emoji: '😐', texto: 'Más o menos' },
  no_funciono: { emoji: '❌', texto: 'No me funcionó' },
  no_codigo:   { emoji: '⚠️', texto: 'El código no funciona' }
};

function wzDeviceId() {
  let id = localStorage.getItem('wz_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('wz_device_id', id);
  }
  return id;
}

function wzVotoLocal(loadoutId) {
  const votados = JSON.parse(localStorage.getItem('wz_votos') || '{}');
  return votados[loadoutId] || null;
}

function wzMarcarVotoLocal(loadoutId, tipo) {
  const votados = JSON.parse(localStorage.getItem('wz_votos') || '{}');
  votados[loadoutId] = tipo;
  localStorage.setItem('wz_votos', JSON.stringify(votados));
}

async function wzEnviarLoadout({ arma_slug, accesorios, codigo_clase, comentario }) {
  const { data: { user } } = await wzsb.auth.getUser();
  if (!user) return { error: { message: 'Necesitás iniciar sesión para publicar.' } };
  // Sin .select(): la fila queda en estado "pendiente" y la política RLS
  // solo permite leer (SELECT) las aprobadas, así que pedir devolución
  // del insert falla el chequeo aunque el insert en sí sea válido.
  return wzsb.from('loadouts').insert([{
    arma_slug,
    user_id: user.id,
    accesorios,
    codigo_clase,
    comentario: comentario || null
  }]);
}

async function wzGetLoadoutsAprobados(arma_slug) {
  let q = wzsb.from('loadouts').select('*').eq('estado', 'aprobado').order('created_at', { ascending: false });
  if (arma_slug) q = q.eq('arma_slug', arma_slug);
  return q;
}

async function wzGetPerfiles(userIds) {
  const unicos = [...new Set(userIds)];
  if (!unicos.length) return { data: [], error: null };
  return wzsb.from('profiles').select('id,username,avatar_url').in('id', unicos);
}

// ── cuentas de usuario (registro obligatorio para publicar) ──
async function wzRegistrar(email, password, username) {
  // emailRedirectTo: sin esto, el link del mail manda a la home (que no
  // carga el SDK) y la sesión se pierde apenas confirmás.
  return wzsb.auth.signUp({
    email, password,
    options: { data: { username }, emailRedirectTo: `${window.location.origin}/comunidad` }
  });
}

async function wzLogin(email, password) {
  return wzsb.auth.signInWithPassword({ email, password });
}

async function wzLogout() {
  return wzsb.auth.signOut();
}

// Manda un mail con un link para elegir una contraseña nueva.
// (No existe forma de "recuperar" la contraseña anterior: nunca se guarda
// en texto plano, ni nosotros ni Supabase pueden verla. Se resetea, no se recupera.)
async function wzOlvideContrasena(email) {
  return wzsb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/comunidad`
  });
}

async function wzActualizarContrasena(password) {
  return wzsb.auth.updateUser({ password });
}

async function wzSesionActual() {
  const { data } = await wzsb.auth.getSession();
  return data.session;
}

async function wzMiPerfil(userId) {
  return wzsb.from('profiles').select('username,avatar_url').eq('id', userId).single();
}

// Sube/reemplaza la foto de perfil del usuario logueado y devuelve la URL pública.
async function wzSubirAvatar(userId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${userId}.${ext}`;
  const { error: upErr } = await wzsb.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
  if (upErr) return { error: upErr };

  const { data: pub } = wzsb.storage.from('avatars').getPublicUrl(path);
  const avatar_url = `${pub.publicUrl}?t=${Date.now()}`; // cache-busting: la URL pública no cambia al reemplazar el archivo

  const { error: dbErr } = await wzsb.from('profiles').update({ avatar_url }).eq('id', userId);
  if (dbErr) return { error: dbErr };

  return { data: avatar_url, error: null };
}

async function wzGetVotosPorLoadouts(loadoutIds) {
  if (!loadoutIds.length) return { data: [], error: null };
  return wzsb.from('votos').select('loadout_id,tipo').in('loadout_id', loadoutIds);
}

async function wzVotar(loadoutId, tipo) {
  const device_id = wzDeviceId();
  const { error } = await wzsb.from('votos').insert([{ loadout_id: loadoutId, device_id, tipo }]);
  if (!error) wzMarcarVotoLocal(loadoutId, tipo);
  return { error };
}

// Resume un arreglo de votos { tipo } en conteos + si califica para el sello verificado.
function wzResumenVotos(votos) {
  const conteo = { funciono: 0, masomenos: 0, no_funciono: 0, no_codigo: 0 };
  for (const v of votos) if (conteo[v.tipo] != null) conteo[v.tipo]++;
  const total = votos.length;
  const verificada = total >= 10 && (conteo.funciono / total) >= 0.7;
  return { conteo, total, verificada };
}
