/**
 * Controlador Instituciones (centros educativos).
 */
import { createCrudController } from './crudController.js';
import { InstitucionModel } from '../models/InstitucionModel.js';
import { badge } from '../views/crudView.js';
import { esc, fmtDate } from '../utils/helpers.js';

const ESTADO_BADGE = { aprobada: 'success', rechazada: 'danger' };

export const institucionesController = {
  async render(body) {
    const crud = createCrudController({
      model: new InstitucionModel(),
      title: 'Instituciones',
      subtitle: 'Centros educativos registrados',
      autoTimestamp: true,
      addValues: () => ({ estado: 'pendiente' }),
      filters: [
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'estado', label: 'Estado', options: [{ value: 'pendiente', label: 'Pendiente' }, { value: 'aprobada', label: 'Aprobada' }, { value: 'rechazada', label: 'Rechazada' }], match: (r, _k, v) => (r.estado || 'pendiente') === v },
        { key: 'createdAt', label: 'Creada', type: 'date' },
      ],
      banner: `
        <div class="banner banner--info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Las instituciones con <strong>latitud/longitud</strong> aparecen en el mapa de la app. El estado permite marcarlas como pendiente, aprobada o rechazada.</span>
        </div>`,
      columns: [
        { key: 'nombre', label: 'Nombre', render: (r) => `<span class="cell-strong">${esc(r.nombre)}</span>` },
        {
          key: 'ciudad',
          label: 'Ciudad',
          render: (r) => esc([r.ciudad, r.provincia].filter(Boolean).join(', ')),
          export: (r) => [r.ciudad, r.provincia].filter(Boolean).join(', '),
        },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
        {
          key: 'estado',
          label: 'Estado',
          render: (r) => badge(r.estado || 'pendiente', ESTADO_BADGE[r.estado] || 'warning'),
        },
        { key: 'createdAt', label: 'Creada', export: (r) => fmtDate(r.createdAt) },
      ],
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, full: true },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true },
        { name: 'direccion', label: 'Dirección', type: 'text', full: true },
        { name: 'ciudad', label: 'Ciudad', type: 'text', required: true },
        { name: 'provincia', label: 'Provincia', type: 'text' },
        { name: 'telefono', label: 'Teléfono', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'sitioWeb', label: 'Sitio web', type: 'text' },
        { name: 'logoURL', label: 'URL del logo', type: 'text' },
        { name: 'latitud', label: 'Latitud', type: 'number', step: '0.000001', hint: 'Para el mapa del mobile.' },
        { name: 'longitud', label: 'Longitud', type: 'number', step: '0.000001', hint: 'Para el mapa del mobile.' },
        {
          name: 'estado',
          label: 'Estado',
          type: 'select',
          options: [
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'aprobada', label: 'Aprobada' },
            { value: 'rechazada', label: 'Rechazada' },
          ],
        },
      ],
      rowActions: [
        { action: 'edit', label: 'Editar', icon: 'edit', tone: 'secondary', title: 'Editar institución' },
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar institución' },
      ],
    });

    await crud.render(body);
  },
};