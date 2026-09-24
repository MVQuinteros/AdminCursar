/**
 * Capa Modelo - acceso a Firebase.
 * Inicializa la app, auth y firestore una sola vez y los exporta para todo el código.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '../config/firebase-config.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);