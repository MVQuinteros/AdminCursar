import { BaseModel } from './BaseModel.js';

/**
 * Acceso a la colección `soporte` (reportes enviados desde la app).
 * La app crea los reportes; esta web los lee y les cambia el estado.
 */
export class SoporteModel extends BaseModel {
  constructor() {
    super('soporte', { sortField: 'createdAt', sortDir: 'desc' });
  }

  async setEstado(id, estado /* 'nuevo' | 'resuelto' */) {
    await this.update(id, { estado });
  }
}