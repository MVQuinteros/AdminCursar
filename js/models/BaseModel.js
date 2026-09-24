/**
 * Modelo base genérico: operaciones CRUD sobre una colección de Firestore.
 * Cada modelo del dominio extiende esta clase configurando su colección.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import { db } from './db.js';

export class BaseModel {
  constructor(collectionName, { sortField = 'createdAt', sortDir = 'desc' } = {}) {
    this.collectionName = collectionName;
    this.sortField = sortField;
    this.sortDir = sortDir;
  }

  ref() {
    return collection(db, this.collectionName);
  }

  docRef(id) {
    return doc(db, this.collectionName, id);
  }

  /** Obtiene todos los documentos de la colección. */
  async list() {
    const q = query(this.ref(), orderBy(this.sortField, this.sortDir));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  /** Obtiene un documento por su id. */
  async get(id) {
    const snap = await getDoc(this.docRef(id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }

  /** Crea un documento; retorna el id asignado. */
  async add(data) {
    const ref = await addDoc(this.ref(), data);
    return ref.id;
  }

  /** Actualiza (mezcla) los campos pasados. */
  async update(id, data) {
    await updateDoc(this.docRef(id), data);
  }

  /** Elimina el documento. */
  async remove(id) {
    await deleteDoc(this.docRef(id));
  }
}