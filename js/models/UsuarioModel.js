import { setDoc } from 'firebase/firestore';

import { BaseModel } from './BaseModel.js';

/**
 * Acceso a la colección `usuarios`.
 * Nota: el alta de usuarios se hace desde la app móvil (register), esta web
 * administra los existentes. El rol admin se otorga desde la consola o acá.
 */
export class UsuarioModel extends BaseModel {
  constructor() {
    super('usuarios', { sortField: 'ultimoLogin', sortDir: 'desc' });
  }

  async setRol(uid, rol) {
    await this.update(uid, { rol });
  }

  /** Crea el documento del usuario con su uid como id (usado en el registro admin). */
  async createWithUid(uid, data) {
    await setDoc(this.docRef(uid), data);
  }
}