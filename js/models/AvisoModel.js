import { serverTimestamp } from 'firebase/firestore';

import { BaseModel } from './BaseModel.js';

/**
 * Acceso a la colección `avisos` (noticias/campañas visibles en la app).
 */
export class AvisoModel extends BaseModel {
  constructor() {
    super('avisos', { sortField: 'publicado', sortDir: 'desc' });
  }

  async add(data) {
    return super.add({ ...data, publicado: serverTimestamp() });
  }
}