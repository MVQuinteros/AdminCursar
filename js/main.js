/**
 * Punto de entrada de la aplicación (bootstrap).
 * Inicializa Firebase (models/db) y arranca el flujo de autenticación.
 */
import './models/db.js';

import { initAuth } from './controllers/authController.js';

initAuth();