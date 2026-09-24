/**
 * Controlador Tags (etiquetas de ofertas).
 */
import { createCrudController } from './crudController.js';
import { TagModel } from '../models/TagModel.js';
import { esc } from '../utils/helpers.js';

export const tagsController = {
  async render(body) {
    const crud = createCrudController({
      model: new TagModel(),
      title: 'Tags',
      subtitle: 'Etiquetas para categorizar ofertas',
      autoTimestamp: false,
      columns: [
        {
          key: 'nombre',
          label: 'Nombre',
          render: (r) => `<span class="cell-strong">${esc(r.nombre)}</span>`,
        },
        { key: 'descripcion', label: 'Descripción' },
      ],
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true },
      ],
      rowActions: [
        { action: 'edit', label: 'Editar', icon: 'edit', tone: 'secondary', title: 'Editar tag' },
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar tag' },
      ],
    });

    await crud.render(body);
  },
};