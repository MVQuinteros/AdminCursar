/**
 * Vista Layout - estructura general de la aplicación (sidebar, topbar, main).
 * Renderiza el "esqueleto" una vez logueado y maneja la navegación activa.
 */
import { state } from '../state/appState.js';
import { esc, initials } from '../utils/helpers.js';

/* Iconos SVG (estilo feather, stroke actual) --------------------------------- */
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  usuarios: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  ofertas: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  instituciones: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>',
  tags: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  avisos: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  soporte: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  test: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
};

export const NAV = [
  { route: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: '/usuarios', label: 'Usuarios', icon: 'usuarios' },
  { route: '/ofertas', label: 'Ofertas', icon: 'ofertas' },
  { route: '/instituciones', label: 'Instituciones', icon: 'instituciones' },
  { route: '/tags', label: 'Tags', icon: 'tags' },
  { route: '/avisos', label: 'Avisos', icon: 'avisos' },
  { route: '/soporte', label: 'Soporte', icon: 'soporte' },
  { route: '/test', label: 'Test vocacional', icon: 'test' },
];

const svg = (name, className = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}">${ICONS[name] || ''}</svg>`;

function navItemsHTML() {
  return NAV.map(
    (item) => `
      <button type="button" class="nav__item" data-route="${item.route}" aria-current="${item.route === state.route ? 'page' : 'false'}">
        <span class="nav__icon">${svg(item.icon)}</span><span>${esc(item.label)}</span>
      </button>`
  ).join('');
}

function userSlotHTML() {
  return `
    <div class="sidebar__footer">
      <div class="user-chip">
        <span class="user-chip__avatar">${esc(initials(state.adminDoc?.nombre, state.adminDoc?.apellido))}</span>
        <span class="user-chip__meta">
          <span class="user-chip__name">${esc(adminName())}</span>
          <span class="user-chip__role">Administrador</span>
        </span>
      </div>
      <button type="button" class="btn btn--danger btn--sm btn--block" id="btn-logout">${svg('logout')} Cerrar sesión</button>
    </div>`;
}

/** Nombre mostrable del admin (nombre + apellido, o email, o "Admin"). */
function adminName() {
  const { user, adminDoc } = state;
  const nombre = (adminDoc?.nombre || user?.displayName || '').trim();
  const apellido = (adminDoc?.apellido || '').trim();
  return (nombre + ' ' + apellido).trim() || user?.email || 'Admin';
}

/** Saludo según la hora del día. */
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/* Tema claro/oscuro (preferencia por navegador, en localStorage) -------------- */
const THEME_KEY = 'cursar-theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* almacenamiento no disponible: el tema queda seteado igual */
  }
  const btn = document.getElementById('btn-theme');
  if (btn) btn.setAttribute('aria-checked', theme === 'light' ? 'true' : 'false');
}

/** Aplica el tema guardado; por defecto el claro (identidad de la marca). */
function initTheme() {
  let theme = 'light';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch {
    /* sin localStorage: se usa el tema por defecto */
  }
  applyTheme(theme);
  return theme;
}

/** Pinta el esqueleto de la app dentro de #app. */
export function renderShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__brand">
          <img src="assets/logoCursar.png" alt="Cursar" class="sidebar__brand-logo" />
          <span>
            <span class="sidebar__brand-name">CURSAR</span><br/>
            <span class="sidebar__brand-tag">Panel de administración</span>
          </span>
        </div>
        <nav class="sidebar__nav" aria-label="Navegación principal">
          <p class="nav__label">Gestión</p>
          ${navItemsHTML()}
        </nav>
        ${userSlotHTML()}
      </aside>
      <div class="sidebar-backdrop" id="sidebar-backdrop" hidden></div>
      <main class="main">
        <header class="topbar">
          <button type="button" class="icon-btn topbar__burger" id="btn-burger" aria-label="Abrir menú">${svg('menu')}</button>
          <div class="topbar__text">
            <h1 class="topbar__title" id="topbar-title"></h1>
            <p class="topbar__greet" id="topbar-greet"></p>
          </div>
          <div class="topbar__spacer"></div>
          <button type="button" class="theme-toggle" id="btn-theme" role="switch" aria-checked="false" aria-label="Cambiar tema claro/oscuro" title="Cambiar tema">
            ${svg('sun', 'theme-toggle__icon theme-toggle__icon--sun')}
            <span class="theme-toggle__track"><span class="theme-toggle__knob"></span></span>
            ${svg('moon', 'theme-toggle__icon theme-toggle__icon--moon')}
          </button>
        </header>
        <div class="content" id="view"></div>
      </main>
    </div>`;

  initTheme();
  const greet = document.getElementById('topbar-greet');
  if (greet) greet.textContent = `${timeGreeting()}, ${esc(adminName())} 👋`;

  bindShell();
}

/** Resalta el item activo y actualiza el título del topbar. */
export function setActiveRoute(route) {
  state.route = route;
  const title = NAV.find((n) => n.route === route)?.label || 'CURSAR';
  document.getElementById('topbar-title').textContent = title;

  document.querySelectorAll('.nav__item').forEach((btn) => {
    const active = btn.dataset.route === route;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });

  closeDrawer();
}

function bindShell() {
  document.getElementById('btn-logout').addEventListener('click', () => {
    import('../controllers/authController.js').then(({ logout }) => logout());
  });

  document.getElementById('btn-burger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('is-open');
    document.getElementById('sidebar-backdrop').hidden = false;
  });

  document.getElementById('sidebar-backdrop').addEventListener('click', closeDrawer);

  document.getElementById('btn-theme').addEventListener('click', async () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    if (state.route === '/dashboard') {
      const { navigate } = await import('../controllers/router.js');
      navigate('/dashboard');
    }
  });
}

function closeDrawer() {
  document.getElementById('sidebar')?.classList.remove('is-open');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.hidden = true;
}

/** Navegación por click en los items del sidebar. */
export function bindNav(callback) {
  document.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => callback(btn.dataset.route));
  });
}