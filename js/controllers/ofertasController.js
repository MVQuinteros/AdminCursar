/**
 * Controlador Ofertas (carreras/titulaciones).
 * Incluye el flujo de moderación: aprobar / desaprobar ofertas para la app.
 */
import { createCrudController } from './crudController.js';
import { OfertaModel } from '../models/OfertaModel.js';
import { InstitucionModel } from '../models/InstitucionModel.js';
import { TagModel } from '../models/TagModel.js';
import { badge } from '../views/crudView.js';
import { toast } from '../views/notify.js';
import { esc, fmtDateTime } from '../utils/helpers.js';

const AREAS = [
  'Tecnología', 'Ingeniería', 'Salud', 'Educación', 'Creativa', 'Administración',
  'Economía', 'Ciencias Sociales', 'Ciencias Ambientales', 'Derecho', 'Humanidades',
];

export const ofertasController = {
  async render(body) {
    const [instituciones, tags] = await Promise.all([
      new InstitucionModel().list(),
      new TagModel().list(),
    ]);

    const instName = new Map(instituciones.map((i) => [i.id, i.nombre]));
    const tagNames = tags.map((t) => t.nombre);

    const crud = createCrudController({
      model: new OfertaModel(),
      title: 'Ofertas',
      subtitle: 'Carreras y titulaciones publicadas',
      autoTimestamp: true,
      filters: [
        { key: 'area', label: 'Área' },
        { key: 'aprobada', label: 'Estado', options: [{ value: 'true', label: 'Aprobadas' }, { value: 'false', label: 'Pendientes' }], match: (r, _k, v) => (v === 'true' ? !!r.aprobada : !r.aprobada) },
        { key: 'createdAt', label: 'Alta', type: 'date' },
      ],
      banner: `
        <div class="banner banner--warning">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Las ofertas con estado <strong>pendiente</strong> aún no se muestran en la app. Usá el botón <strong>Aprobar</strong> para publicarlas.</span>
        </div>`,
      columns: [
        { key: 'nombre', label: 'Nombre', render: (r) => `<span class="cell-strong">${esc(r.nombre)}</span>` },
        {
          key: 'institucionUid',
          label: 'Institución',
          render: (r) => esc(instName.get(r.institucionUid) || '—'),
          export: (r) => instName.get(r.institucionUid) || '',
        },
        { key: 'area', label: 'Área' },
        { key: 'nivel', label: 'Nivel' },
        { key: 'modalidad', label: 'Modalidad' },
        { key: 'duracionAnios', label: 'Años' },
        {
          key: 'aprobada',
          label: 'Estado',
          render: (r) => (r.aprobada ? badge('Aprobada', 'success') : badge('Pendiente', 'warning')),
        },
        { key: 'createdAt', label: 'Creada', export: (r) => fmtDateTime(r.createdAt) },
      ],
      fields: [
        {
          name: 'institucionUid',
          label: 'Institución',
          type: 'select',
          required: true,
          options: instituciones.map((i) => ({ value: i.id, label: i.nombre })),
        },
        { name: 'nombre', label: 'Nombre de la oferta', type: 'text', required: true, full: true },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true, full: true },
        { name: 'area', label: 'Área', type: 'datalist', options: AREAS.map((a) => ({ value: a })), required: true },
        {
          name: 'nivel',
          label: 'Nivel',
          type: 'select',
          required: true,
          options: [
            { value: 'Universitario', label: 'Universitario' },
            { value: 'Terciario', label: 'Terciario' },
          ],
        },
        { name: 'duracionAnios', label: 'Duración (años)', type: 'number', min: 1, step: 1 },
        {
          name: 'modalidad',
          label: 'Modalidad',
          type: 'select',
          required: true,
          options: [
            { value: 'Presencial', label: 'Presencial' },
            { value: 'Bimodal', label: 'Bimodal' },
            { value: 'Virtual', label: 'Virtual' },
          ],
        },
        { name: 'salidaLaboral', label: 'Salida laboral', type: 'text', full: true },
        { name: 'requisitos', label: 'Requisitos', type: 'textarea', full: true },
        { name: 'tag', label: 'Tag', type: 'datalist', options: tagNames.map((t) => ({ value: t })) },
        { name: 'aprobada', label: 'Publicada (aprobada)', type: 'switch' },
      ],
      rowActions: [
        { action: 'aprobar', label: 'Aprobar', icon: 'check', tone: 'success', title: 'Publicar oferta', visible: (r) => !r.aprobada },
        { action: 'desaprobar', label: 'Rechazar', icon: 'x', tone: 'warning', title: 'Quitar la aprobación', visible: (r) => r.aprobada },
        { action: 'edit', label: 'Editar', icon: 'edit', tone: 'secondary', title: 'Editar oferta' },
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar oferta' },
      ],
      onRowAction: async (action, row, { reload }) => {
        if (action === 'aprobar') {
          await new OfertaModel().setAprobada(row.id, true);
          toast('Oferta aprobada y publicada.', 'success');
        } else if (action === 'desaprobar') {
          await new OfertaModel().setAprobada(row.id, false);
          toast('Oferta desaprobada (queda oculta en la app).', 'info');
        } else {
          return; // acciones no reconocidas
        }
        await reload();
      },
    });

    await crud.render(body);
  },
};