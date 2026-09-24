import { BaseModel } from './BaseModel.js';

/**
 * Acceso a la colección `ofertas` (carreras/titulaciones).
 * El flujo clave para el admin: aprobar / desaprobar la oferta publicada.
 */
export class OfertaModel extends BaseModel {
  constructor() {
    super('ofertas', { sortField: 'createdAt', sortDir: 'desc' });
  }

  async setAprobada(id, aprobada) {
    await this.update(id, { aprobada });
  }
}