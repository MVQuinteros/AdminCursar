/**
 * Estado global de la sesión (única fuente de verdad de la app).
 */
export const state = {
  user: null,      // Usuario de Firebase Auth (viene de getAuth)
  adminDoc: null,  // Documento `usuarios/{uid}` del usuario logueado
  route: '/',
};

export function setAuth(user, adminDoc) {
  state.user = user;
  state.adminDoc = adminDoc;
}

export function clearAuth() {
  state.user = null;
  state.adminDoc = null;
}