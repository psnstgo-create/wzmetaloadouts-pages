// ════════════════════════════════════════════
//   COMUNIDAD-ADMIN.JS — panel de aprobación (protegido por login Supabase)
// ════════════════════════════════════════════
let ADM_ARMAS = {};

function admEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function admCargarArmas() {
  try {
    const r = await fetch('/armas-data.json', { cache: 'no-cache' });
    if (r.ok) ADM_ARMAS = (await r.json()).armas || {};
  } catch (e) { /* no bloquea el panel si falla */ }
}

function admMostrarPanel(mostrar, email) {
  document.getElementById('loginCard').style.display = mostrar ? 'none' : 'block';
  document.getElementById('panel').style.display = mostrar ? 'block' : 'none';
  if (mostrar) document.getElementById('admWho').textContent = email || '';
}

async function admLogin() {
  const email = document.getElementById('admEmail').value.trim();
  const password = document.getElementById('admPass').value;
  const msg = document.getElementById('loginMsg');
  msg.textContent = '';
  const { data, error } = await wzsb.auth.signInWithPassword({ email, password });
  if (error) { msg.textContent = 'Login incorrecto.'; return; }
  admMostrarPanel(true, data.user.email);
  admCargarPendientes();
}

async function admLogout() {
  await wzsb.auth.signOut();
  admMostrarPanel(false);
}

async function admCargarPendientes() {
  const grid = document.getElementById('pendGrid');
  grid.innerHTML = '<div class="empty">Cargando…</div>';
  const { data, error } = await wzsb.from('loadouts').select('*').eq('estado', 'pendiente').order('created_at', { ascending: true });
  if (error) { grid.innerHTML = '<div class="empty">Error al cargar. Probá recargar la página.</div>'; console.error(error); return; }
  if (!data.length) { grid.innerHTML = '<div class="empty">No hay clases pendientes por ahora 🎉</div>'; return; }

  const { data: perfiles } = await wzsb.from('profiles').select('id,username').in('id', [...new Set(data.map(l => l.user_id))]);
  const nombrePorUser = {};
  for (const p of (perfiles || [])) nombrePorUser[p.id] = p.username;

  grid.innerHTML = data.map(l => admCardHtml(l, nombrePorUser[l.user_id])).join('');
  grid.querySelectorAll('[data-aprobar]').forEach(b => b.addEventListener('click', () => admResolver(b.dataset.aprobar, 'aprobado')));
  grid.querySelectorAll('[data-rechazar]').forEach(b => b.addEventListener('click', () => admResolver(b.dataset.rechazar, 'rechazado')));
}

function admCardHtml(l, username) {
  const arma = ADM_ARMAS[l.arma_slug];
  const nombre = arma ? arma.nombre : l.arma_slug;
  const acc = Object.entries(l.accesorios || {});
  const fecha = new Date(l.created_at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  return `<div class="pend-card">
    <div class="pend-head"><span class="pend-arma">${admEsc(nombre)}</span><span class="pend-fecha">${fecha}</span></div>
    ${acc.length ? `<div class="pend-acc">${acc.map(([s, v]) => `${admEsc(s)}: ${admEsc(v)}`).join(' · ')}</div>` : ''}
    <span class="pend-codigo">${admEsc(l.codigo_clase)}</span>
    ${l.comentario ? `<p class="pend-comentario">"${admEsc(l.comentario)}"</p>` : ''}
    <div class="pend-alias">Usuario: ${username ? admEsc(username) : '(desconocido)'}</div>
    <div class="pend-actions">
      <button data-aprobar="${l.id}">✔ Aprobar</button>
      <button class="reject" data-rechazar="${l.id}">✕ Rechazar</button>
    </div>
  </div>`;
}

async function admResolver(id, estado) {
  const { error } = await wzsb.from('loadouts').update({ estado, reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) { alert('No se pudo actualizar. Probá de nuevo.'); console.error(error); return; }
  admCargarPendientes();
}

document.addEventListener('DOMContentLoaded', async () => {
  admCargarArmas();
  document.getElementById('admLoginBtn').addEventListener('click', admLogin);
  document.getElementById('admPass').addEventListener('keydown', e => { if (e.key === 'Enter') admLogin(); });
  document.getElementById('admLogoutBtn').addEventListener('click', admLogout);

  const { data } = await wzsb.auth.getSession();
  if (data.session) { admMostrarPanel(true, data.session.user.email); admCargarPendientes(); }
});
