import { BaseModel } from './BaseModel.js';

/** Acceso a la colección `tags` (etiquetas de ofertas). No tiene fecha, se ordena por nombre. */
export class TagModel extends BaseModel {
  constructor() {
    super('tags', { sortField: 'nombre', sortDir: 'asc' });
  }
}