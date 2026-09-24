/**
 * Controlador Soporte (reportes enviados desde la app).
 */
import { createCrudController } from './crudController.js';
import { SoporteModel } from '../models/SoporteModel.js';
import { badge } from '../views/crudView.js';
import { toast } from '../views/notify.js';
import { esc, fmtDateTime } from '../utils/helpers.js';

export const soporteController = {
  async render(body) {
    const crud = createCrudController({
      model: new SoporteModel(),
      title: 'Soporte',
      subtitle: 'Reportes y consultas enviados desde la app',
      allowAdd: false,
      autoTimestamp: false,
      filters: [
        { key: 'tipo', label: 'Tipo' },
        { key: 'estado', label: 'Estado', options: [{ value: 'nuevo', label: 'Nuevo' }, { value: 'resuelto', label: 'Resuelto' }] },
        { key: 'createdAt', label: 'Recibido', type: 'date' },
      ],
      banner: `
        <div class="banner banner--info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Marcá los reportes como <strong>resuelto</strong> cuando estén atendidos para ordenar la bandeja.</span>
        </div>`,
      columns: [
        { key: 'email', label: 'Email', render: (r) => `<span class="cell-strong">${esc(r.email || '—')}</span>` },
        { key: 'tipo', label: 'Tipo', render: (r) => badge(r.tipo || 'General', 'neutral') },
        {
          key: 'mensaje',
          label: 'Mensaje',
          render: (r) =>
            `<span style="display:block;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)" title="${esc(r.mensaje)}">${esc(r.mensaje)}</span>`,
        },
        { key: 'createdAt', label: 'Recibido', export: (r) => fmtDateTime(r.createdAt) },
        {
          key: 'estado',
          label: 'Estado',
          render: (r) => (r.estado === 'resuelto' ? badge('Resuelto', 'success') : badge('Nuevo', 'warning')),
        },
      ],
      rowActions: [
        { action: 'resolver', label: 'Resolver', icon: 'check', tone: 'success', title: 'Marcar como resuelto', visible: (r) => r.estado !== 'resuelto' },
        { action: 'reabrir', label: 'Reabrir', tone: 'warning', title: 'Reabrir reporte', visible: (r) => r.estado === 'resuelto' },
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar reporte' },
      ],
      onRowAction: async (action, row, { reload }) => {
        if (action === 'resolver') {
          await new SoporteModel().setEstado(row.id, 'resuelto');
          toast('Reporte marcado como resuelto.', 'success');
        } else if (action === 'reabrir') {
          await new SoporteModel().setEstado(row.id, 'nuevo');
          toast('Reporte reabierto.', 'info');
        } else {
          return;
        }
        await reload();
      },
    });

    await crud.render(body);
  },
};