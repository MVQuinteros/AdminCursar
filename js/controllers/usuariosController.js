/**
 * Controlador Usuarios: listado, edición de datos, cambio de rol y baja.
 * El alta de usuarios se hace desde la app móvil (register), por eso no hay botón "Nuevo".
 */
import { createCrudController } from './crudController.js';
import { UsuarioModel } from '../models/UsuarioModel.js';
import { badge } from '../views/crudView.js';
import { esc, fmtDateTime, fmtDate } from '../utils/helpers.js';

export const usuariosController = {
  async render(body) {
    const crud = createCrudController({
      model: new UsuarioModel(),
      title: 'Usuarios',
      subtitle: 'Cuentas de la app CURSAR',
      allowAdd: false,
      autoTimestamp: false,
      filters: [
        { key: 'localidad', label: 'Localidad' },
        { key: 'rol', label: 'Rol', options: [{ value: 'usuario', label: 'Usuario' }, { value: 'admin', label: 'Admin' }] },
        { key: 'ultimoLogin', label: 'Último acceso', type: 'date' },
      ],
      banner: `
        <div class="banner banner--info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>El alta de usuarios se realiza desde la app móvil. Acá podés ver, editar perfil, cambiar el rol (usuario / admin) y eliminar cuentas.</span>
        </div>`,
      columns: [
        {
          key: 'nombreCompleto',
          label: 'Nombre',
          render: (r) => `<span class="cell-strong">${esc(`${r.nombre} ${r.apellido}`.trim() || r.email)}</span>`,
          export: (r) => `${r.nombre} ${r.apellido}`,
        },
        { key: 'email', label: 'Email' },
        { key: 'localidad', label: 'Localidad' },
        {
          key: 'rol',
          label: 'Rol',
          render: (r) => (r.rol === 'admin' ? badge('Admin', 'success') : badge('Usuario', 'neutral')),
        },
        { key: 'ultimoLogin', label: 'Último acceso', export: (r) => fmtDateTime(r.ultimoLogin) },
        { key: 'fechaNacimiento', label: 'Nacimiento', export: (r) => fmtDate(r.fechaNacimiento) },
      ],
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true },
        { name: 'localidad', label: 'Localidad', type: 'text' },
        { name: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
        {
          name: 'rol',
          label: 'Rol',
          type: 'select',
          options: [
            { value: 'usuario', label: 'Usuario' },
            { value: 'admin', label: 'Administrador' },
          ],
        },
        { name: 'modoOscuro', label: 'Tema oscuro', type: 'switch' },
      ],
      rowActions: [
        { action: 'edit', label: 'Editar', icon: 'edit', tone: 'secondary', title: 'Editar usuario' },
        { action: 'delete', label: 'Eliminar', icon: 'trash', tone: 'danger', title: 'Eliminar usuario' },
      ],
    });

    await crud.render(body);
  },
};