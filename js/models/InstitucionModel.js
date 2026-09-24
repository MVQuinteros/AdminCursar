import { GeoPoint } from 'firebase/firestore';

import { BaseModel } from './BaseModel.js';

/**
 * Acceso a la colección `instituciones` (centros educativos).
 * Convierte lat/lng del formulario a un GeoPoint de Firestore, igual que el mobile.
 */
export class InstitucionModel extends BaseModel {
  constructor() {
    super('instituciones', { sortField: 'createdAt', sortDir: 'desc' });
  }

  _withGeo(data) {
    const { latitud, longitud, ...rest } = data;
    const hasLat = latitud !== undefined && latitud !== null && latitud !== '';
    const hasLng = longitud !== undefined && longitud !== null && longitud !== '';
    return hasLat && hasLng
      ? { ...rest, ubicacion: new GeoPoint(Number(latitud), Number(longitud)) }
      : rest;
  }

  async add(data) {
    return super.add(this._withGeo(data));
  }

  async update(id, data) {
    return super.update(id, this._withGeo(data));
  }
}