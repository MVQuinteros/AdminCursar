/**
 * Controlador de enrutado (hash-based).
 * Mapea rutas (`#/usuarios`, etc.) a los controladores de cada módulo.
 */
import { dashboardController } from './dashboardController.js';
import { usuariosController } from './usuariosController.js';
import { ofertasController } from './ofertasController.js';
import { institucionesController } from './institucionesController.js';
import { tagsController } from './tagsController.js';
import { avisosController } from './avisosController.js';
import { soporteController } from './soporteController.js';
import { testController } from './testController.js';
import { setActiveRoute } from '../views/layout.js';
import { toast } from '../views/notify.js';
import { esc } from '../utils/helpers.js';

const ROUTES = {
  '/dashboard': dashboardController,
  '/usuarios': usuariosController,
  '/ofertas': ofertasController,
  '/instituciones': institucionesController,
  '/tags': tagsController,
  '/avisos': avisosController,
  '/soporte': soporteController,
  '/test': testController,
};

const VALID = Object.keys(ROUTES);

const SUBTITLES = {
  '/dashboard': 'Resumen general del sistema',
  '/usuarios': 'Cuentas de la app y roles de acceso',
  '/ofertas': 'Aprobación y gestión de carreras',
  '/instituciones': 'Centros educativos registrados',
  '/tags': 'Etiquetas de categorización',
  '/avisos': 'Noticias publicadas en la app',
  '/soporte': 'Reportes enviados desde la app',
  '/test': 'Resultados del test orientativo vocacional',
};

let started = false;

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash === '/' ? '/dashboard' : hash;
}

/** Ruta actual según el hash (dashboard si no hay nada). */
export function currentRoute() {
  return parseHash();
}

export async function renderRoute(routeParam) {
  const route = VALID.includes(routeParam) ? routeParam : '/dashboard';
  setActiveRoute(route);

  const view = document.getElementById('view');
  if (!view) return;

  view.innerHTML = `
    <div class="view-head">
      <p>${esc(SUBTITLES[route] || '')}</p>
    </div>
    <div id="view-body"></div>`;

  const controller = ROUTES[route];
  const body = document.getElementById('view-body');
  try {
    await controller.render(body);
  } catch (err) {
    console.error(`[router] Error en ${route}:`, err);
    body.innerHTML = `<div class="card" style="color:var(--danger)">Error al cargar este módulo: ${esc(err.message || 'error desconocido')}</div>`;
    toast('No se pudo cargar la vista.', 'error');
  }
}

function onHashChange() {
  if (started) renderRoute(parseHash());
}

/** Activa la navegación por hash y renderiza la ruta actual. */
export function startRouter() {
  if (started) {
    renderRoute(parseHash());
    return;
  }
  started = true;
  window.addEventListener('hashchange', onHashChange);
  renderRoute(parseHash());
}

/** Detiene la navegación (usado al cerrar sesión). */
export function stopRouter() {
  started = false;
  window.removeEventListener('hashchange', onHashChange);
}

/** Navega programáticamente a una ruta. */
export function navigate(route) {
  const target = VALID.includes(route) ? route : '/dashboard';
  if (parseHash() === target) {
    renderRoute(target);
  } else {
    window.location.hash = `#${target}`;
  }
}