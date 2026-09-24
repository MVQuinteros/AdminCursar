/**
 * Controlador Dashboard: estadísticas generales y gráficos.
 * Lee de la misma Firestore que la app mobile.
 */
import {
  Chart,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import { collection, getDocs, query } from 'firebase/firestore';

import { db } from '../models/db.js';
import { UsuarioModel } from '../models/UsuarioModel.js';
import { OfertaModel } from '../models/OfertaModel.js';
import { InstitucionModel } from '../models/InstitucionModel.js';
import { TagModel } from '../models/TagModel.js';
import { AvisoModel } from '../models/AvisoModel.js';
import { SoporteModel } from '../models/SoporteModel.js';

import { statCardsHTML, chartBoxHTML } from '../views/dashboardView.js';
import { loadingHTML } from '../views/crudView.js';
import { navigate } from './router.js';

const CHART_COLORS = ['#007BFF', '#2EA043', '#D29922', '#9C27B0', '#E53935', '#1E88E5', '#00A0B0', '#8B949E'];
const AREA_ORDER = ['Tecnología', 'Ingeniería', 'Salud', 'Educación', 'Creativa', 'Administración', 'Economía', 'Derecho'];

Chart.defaults.font.family =
  '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';

Chart.register(ArcElement, BarController, BarElement, CategoryScale, DoughnutController, LinearScale, Tooltip, Legend);

/** Lee un color del tema activo desde las variables CSS (con fallback). */
function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function syncChartTheme() {
  Chart.defaults.color = cssVar('--text-secondary', '#8B949E');
  Chart.defaults.borderColor = cssVar('--border-subtle', '#30363D');
}

const charts = [];

function countBy(list, key) {
  const acc = {};
  for (const item of list) {
    const k = item[key] || '(sin dato)';
    acc[k] = (acc[k] || 0) + 1;
  }
  return acc;
}

function sortedEntries(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function destroyCharts() {
  charts.forEach((c) => c.destroy());
  charts.length = 0;
}

function makeDoughnut(id, labels, data) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  charts.push(new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: CHART_COLORS, borderColor: cssVar('--bg-surface', '#161B22'), borderWidth: 2 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } } },
    },
  }));
}

function makeBar(id, labels, data) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  charts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS,
        borderRadius: 6,
        maxBarThickness: 42,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  }));
}

export const dashboardController = {
  async render(body) {
    destroyCharts();
    syncChartTheme();

    body.innerHTML = `
      <div id="dash-stats">${loadingHTML()}</div>
      <div class="charts-grid" id="dash-charts"></div>`;

    const safeList = async (model) => {
      try {
        return await model.list();
      } catch (err) {
        console.warn(`[dashboard] No se pudo leer ${model.collectionName}:`, err);
        return [];
      }
    };

    const [usuarios, ofertas, instituciones, tags, avisos, soporte] = await Promise.all([
      safeList(new UsuarioModel()),
      safeList(new OfertaModel()),
      safeList(new InstitucionModel()),
      safeList(new TagModel()),
      safeList(new AvisoModel()),
      safeList(new SoporteModel()),
    ]);

    let resultados = [];
    try {
      const testResultados = await getDocs(query(collection(db, 'testVocacional', 'data', 'resultados')));
      resultados = testResultados.docs.map((d) => d.data());
    } catch (err) {
      console.warn('[dashboard] No se pudieron leer los resultados del test vocacional:', err);
    }

    const aprobadas = ofertas.filter((o) => o.aprobada).length;
    const institucionesAprobadas = instituciones.filter((i) => i.estado === 'aprobada').length;
    const institucionesPendientes = instituciones.filter((i) => i.estado === 'pendiente').length;
    const institucionesRechazadas = instituciones.length - institucionesAprobadas - institucionesPendientes;
    const instSubParts = [`${institucionesAprobadas} aprobadas`];
    if (institucionesPendientes > 0) instSubParts.push(`${institucionesPendientes} pendientes`);
    if (institucionesRechazadas > 0) instSubParts.push(`${institucionesRechazadas} rechazadas`);
    const soportePendiente = soporte.filter((s) => s.estado !== 'resuelto').length;

    document.getElementById('dash-stats').innerHTML = statCardsHTML([
      { label: 'Usuarios registrados', value: usuarios.length, tone: 'accent', route: '/usuarios', sub: `${usuarios.filter((u) => u.rol === 'admin').length} administradores` },
      { label: 'Ofertas', value: ofertas.length, tone: 'neutral', route: '/ofertas', sub: `${aprobadas} aprobadas · ${ofertas.length - aprobadas} pendientes` },
      { label: 'Instituciones', value: instituciones.length, tone: 'success', route: '/instituciones', sub: instSubParts.join(' · ') },
      { label: 'Test vocacional', value: resultados.length, tone: 'purple', route: '/test', sub: 'resultados registrados' },
      { label: 'Avisos', value: avisos.length, tone: 'info', route: '/avisos', sub: `${tags.length} tags disponibles` },
      { label: 'Soporte sin resolver', value: soportePendiente, tone: 'warning', route: '/soporte', sub: `${soporte.length} reportes totales` },
    ]);

    document.querySelectorAll('#dash-stats [data-route]').forEach((card) => {
      card.addEventListener('click', () => navigate(card.dataset.route));
    });

    const chartContainer = document.getElementById('dash-charts');
    chartContainer.innerHTML = [
      chartBoxHTML({ title: 'Ofertas por área', id: 'chart-areas', subtitle: 'Carreras por área de interés' }),
      chartBoxHTML({ title: 'Ofertas aprobadas vs pendientes', id: 'chart-estado' }),
      chartBoxHTML({ title: 'Usuarios por localidad', id: 'chart-localidad', subtitle: 'Top localidades' }),
      chartBoxHTML({ title: 'Resultados del test vocacional', id: 'chart-test', subtitle: 'Área de interés predominante' }),
    ].join('');

    const areas = countBy(ofertas, 'area');
    const areasOrdered = AREA_ORDER.filter((a) => areas[a] !== undefined);
    const areasRest = sortedEntries(areas).filter(([a]) => !AREA_ORDER.includes(a));
    makeDoughnut('chart-areas', [...areasOrdered, ...areasRest.map(([a]) => a)], [
      ...areasOrdered.map((a) => areas[a]),
      ...areasRest.map(([, n]) => n),
    ]);

    makeBar('chart-estado', ['Aprobadas', 'Pendientes'], [aprobadas, ofertas.length - aprobadas]);

    const localidades = sortedEntries(countBy(usuarios.filter((u) => u.localidad && u.localidad !== ''), 'localidad')).slice(0, 8);
    makeBar(
      'chart-localidad',
      localidades.map(([k]) => k),
      localidades.map(([, n]) => n)
    );

    const testAreas = sortedEntries(countBy(resultados, 'areaInteres'));
    makeDoughnut(
      'chart-test',
      testAreas.map(([k]) => k || '(sin dato)'),
      testAreas.map(([, n]) => n)
    );
  },
};