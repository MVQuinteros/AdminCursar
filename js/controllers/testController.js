/**
 * Controlador Test vocacional (resultados generados por la app móvil).
 * Módulo de lectura: listado, búsqueda, export y limpieza de resultados.
 */
import { createCrudController } from './crudController.js';
import { TestResultadoModel } from '../models/TestResultadoModel.js';
import { badge } from '../views/crudView.js';
import { esc, fmtDateTime } from '../utils/helpers.js';

const AREA_TONE = {
  'Tecnología': 'purple',
  'Ingeniería': 'info',
  'Salud': 'success',
  'Educación': 'warning',
  'Creativa': 'danger',
  'Administración': 'info',
  'Economía': 'success',
  'Derecho': 'warning',
};

const userFull = (u) => [u?.nombre, u?.apellido].filter(Boolean).join(' ').trim();

export const testController = {
  async render(body) {
    const crud = createCrudController({
      model: new TestResultadoModel(),
      title: 'Test vocacional',
      subtitle: 'Resultados generados en la app',
      allowAdd: false,
      fields: [],
      filters: [
        { key: 'areaInteres', label: 'Área de interés' },
        { key: 'createdAt', label: 'Fecha', type: 'date' },
      ],
      banner: `
        <div class="banner banner--info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/></svg>
          <span>Los resultados los guarda la <strong>app móvil</strong> cuando un usuario completa el test (área de interés + ofertas recomendadas). Este módulo solo consulta y permite limpiar resultados.</span>
        </div>`,
      columns: [
        {
          key: 'userUid',
          label: 'Usuario',
          render: (r) =>
            r._usuario
              ? `<span class="cell-strong">${esc(userFull(r._usuario) || r._usuario.email || 'Usuario')}</span><span class="cell-muted" style="display:block;font-size:12px">${esc(r._usuario.email || '')}</span>`
              : `<span class="cell-muted">${esc(r.userUid)}</span> ${badge('sin cuenta', 'warning')}`,
          export: (r) => (r._usuario ? `${userFull(r._usuario)} (${r._usuario.email || ''})` : r.userUid),
        },
        {
          key: 'areaInteres',
          label: 'Área de interés',
          render: (r) => badge(r.areaInteres || 'Sin área', AREA_TONE[r.areaInteres] || 'neutral'),
        },
        {
          key: 'ofertas',
          label: 'Ofertas recomendadas',
          render: (r) => badge(String((r.ofertasRecomendadas || []).length), 'info'),
          export: (r) => (r.ofertasRecomendadas || []).join(', '),
        },
        { key: 'createdAt', label: 'Fecha', render: (r) => fmtDateTime(r.createdAt), export: (r) => fmtDateTime(r.createdAt) },
      ],
      rowActions: [
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar resultado del test' },
      ],
    });

    await crud.render(body);
  },
};