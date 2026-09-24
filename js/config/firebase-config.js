/**
 * Conexión al proyecto Firebase compartido con la app móvil CURSAR.
 *
 * ESRIPE-ADMIN es una app Web registrada del MISMO proyecto
 * (projectId: 'proyecto-app-a77c8'): usa la MISMA base Firestore y la misma
 * Authentication que la app mobile Flutter.
 *
 * Estos valores NO son secretos. La seguridad depende de las Security
 * Rules de Firestore, no de ocultar esta config.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCxxHznw7qA_N5ZthZKMrHkBTKStyaeESA',
  authDomain: 'proyecto-app-a77c8.firebaseapp.com',
  projectId: 'proyecto-app-a77c8',
  storageBucket: 'proyecto-app-a77c8.firebasestorage.app',
  messagingSenderId: '642247955799',
  appId: '1:642247955799:web:21667c563fa15ff3475a12',
};

export const config = {
  /**
   * Registro de admin desde esta web (opción rápida para configurar la cuenta).
   *
   * RECOMENDACIÓN: registrate UNA vez con el botón "Registrarme" del login
   * (crea el doc en usuarios/{uid} con rol 'admin' automáticamente) y después
   * volvé a ponerlo en `false` para no dejar abierto el alta de admins.
   */
  permitirRegistro: true,
};