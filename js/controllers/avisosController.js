/**
 * Controlador Avisos (noticias/campañas que ve la app).
 */
import { createCrudController } from './crudController.js';
import { AvisoModel } from '../models/AvisoModel.js';
import { badge } from '../views/crudView.js';
import { esc, fmtDateTime } from '../utils/helpers.js';

const TIPO_BADGE = {
  informacion: 'info',
  novedad: 'success',
  promocion: 'purple',
  mantenimiento: 'warning',
  inscripcion: 'info',
  noticia: 'success',
  consejo: 'purple',
};

const tipoTone = (t) => TIPO_BADGE[(t || '').trim().toLowerCase()] || 'neutral';

export const avisosController = {
  async render(body) {
    const crud = createCrudController({
      model: new AvisoModel(),
      title: 'Avisos',
      subtitle: 'Noticias publicadas en el inicio de la app',
      autoTimestamp: false,
      filters: [
        { key: 'tipo', label: 'Tipo' },
        { key: 'publicado', label: 'Publicado', type: 'date' },
      ],
      columns: [
        { key: 'titulo', label: 'Título', render: (r) => `<span class="cell-strong">${esc(r.titulo)}</span>` },
        {
          key: 'tipo',
          label: 'Tipo',
          render: (r) => badge(r.tipo || 'General', tipoTone(r.tipo)),
        },
        { key: 'publicado', label: 'Publicado', export: (r) => fmtDateTime(r.publicado) },
        {
          key: 'link',
          label: 'Link',
          render: (r) =>
            r.link
              ? `<a href="${esc(r.link)}" target="_blank" rel="noopener" style="display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.link)}</a>`
              : '—',
        },
      ],
      fields: [
        { name: 'titulo', label: 'Título', type: 'text', required: true, full: true },
        { name: 'mensaje', label: 'Mensaje', type: 'textarea', required: true, full: true },
        {
          name: 'tipo',
          label: 'Tipo',
          type: 'datalist',
          options: [
            { value: 'Información' },
            { value: 'Novedad' },
            { value: 'Promoción' },
            { value: 'Mantenimiento' },
            { value: 'General' },
            { value: 'Inscripción' },
            { value: 'Noticia' },
            { value: 'Consejo' },
          ],
        },
        { name: 'link', label: 'Link (opcional)', type: 'text', full: true, placeholder: 'https://…' },
      ],
      rowActions: [
        { action: 'edit', label: 'Editar', icon: 'edit', tone: 'secondary', title: 'Editar aviso' },
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar aviso' },
      ],
    });

    await crud.render(body);
  },
};