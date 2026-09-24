import { BaseModel } from './BaseModel.js';
import { UsuarioModel } from './UsuarioModel.js';

/**
 * Acceso a los resultados del test vocacional.
 * Viven en la subcolección `testVocacional/data/resultados` y los escribe la app móvil.
 * El admin solo lee y puede limpiar resultados (el alta/edición no corresponde).
 */
export class TestResultadoModel extends BaseModel {
  constructor() {
    super('testVocacional/data/resultados', { sortField: 'createdAt', sortDir: 'desc' });
  }

  /** Lista los resultados enriqueciéndolos con su usuario (join por uid). */
  async list() {
    const rows = await super.list();
    let usuarios = [];
    try {
      usuarios = await new UsuarioModel().list();
    } catch (err) {
      console.warn('[TestResultadoModel] No se pudo leer usuarios:', err);
    }
    const map = new Map(usuarios.map((u) => [u.id || u.uid, u]));
    return rows.map((row) => ({ ...row, _usuario: map.get(row.userUid) || null }));
  }
}