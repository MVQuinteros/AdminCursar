/**
 * Controlador de autenticación.
 * Decide qué pantalla mostrar según el estado de la sesión y verifica el rol admin.
 */
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

import { auth } from '../models/db.js';
import { UsuarioModel } from '../models/UsuarioModel.js';
import { state, setAuth, clearAuth } from '../state/appState.js';
import { loginScreen, registerScreen, deniedScreen, loadingScreen } from '../views/authView.js';
import { renderShell, bindNav, setActiveRoute } from '../views/layout.js';
import { toast } from '../views/notify.js';
import { esc } from '../utils/helpers.js';
import { navigate, startRouter, stopRouter, currentRoute } from './router.js';

const usuarioModel = new UsuarioModel();

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'El email no tiene un formato válido.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'El email o la contraseña son incorrectos.',
  'auth/invalid-login-credentials': 'El email o la contraseña son incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Esperá un momento y probá de nuevo.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/operation-not-allowed': 'El registro está deshabilitado en Firebase Authentication.',
};

function authErrorMessage(code) {
  return AUTH_ERROR_MESSAGES[code] || 'Ocurrió un error de autenticación. Reintentá.';
}

export function initAuth() {
  renderInto(loadingScreen());

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearAuth();
      showLogin();
      return;
    }

    try {
      const adminDoc = await usuarioModel.get(firebaseUser.uid);
      const isAdmin = adminDoc?.rol === 'admin';

      if (!isAdmin) {
        clearAuth();
        renderInto(deniedScreen(firebaseUser.email));
        bindOnce('#btn-denied-logout', 'click', logout);
        return;
      }

      setAuth(firebaseUser, adminDoc);
      showApp();
    } catch {
      clearAuth();
      renderInto(deniedScreen(firebaseUser.email));
      bindOnce('#btn-denied-logout', 'click', logout);
    }
  });
}

function showApp() {
  renderShell();
  bindNav((route) => navigate(route));
  startRouter(currentRoute() || '/dashboard');
  setActiveRoute(state.route);
}

function showLogin() {
  stopRouter();

  if (state._registerMode) {
    renderInto(registerScreen());
    bindRegisterScreen();
  } else {
    renderInto(loginScreen());
    bindLoginScreen();
  }
}

function renderInto(html) {
  document.getElementById('app').innerHTML = html;
}

function messageToUser(message) {
  const el = document.getElementById('auth-error');
  if (!el) return toast(message, 'error');
  el.hidden = false;
  el.textContent = esc(message);
}

/* ------------------------------------------------------------- login ----- */
function bindLoginScreen() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const swap = document.getElementById('btn-swap-auth');
  if (swap) swap.addEventListener('click', () => {
    state._registerMode = true;
    showLogin();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, form.email.value.trim(), form.password.value);
      toast('Sesión iniciada correctamente.', 'success');
    } catch (err) {
      messageToUser(authErrorMessage(err.code));
    } finally {
      btn.disabled = false;
    }
  });
}

/* -------------------------------------------------------- registro ------- */
function bindRegisterScreen() {
  const form = document.getElementById('register-form');
  if (!form) return;

  document.getElementById('btn-swap-auth').addEventListener('click', () => {
    state._registerMode = false;
    showLogin();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.value.trim(), form.password.value);
      await usuarioModel.createWithUid(cred.user.uid, {
        uid: cred.user.uid,
        nombre: form.nombre.value.trim(),
        apellido: form.apellido.value.trim(),
        email: form.email.value.trim(),
        rol: 'admin',
        localidad: '',
        createdAt: serverTimestamp(),
      });
      toast('Cuenta admin creada. Bienvenido.', 'success');
    } catch (err) {
      messageToUser(authErrorMessage(err.code));
    } finally {
      btn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------ logout ----- */
export async function logout() {
  try {
    await signOut(auth);
  } finally {
    clearAuth();
    state._registerMode = false;
    showLogin();
  }
}

/* ------------------------------------------------------------ utils ------ */
function bindOnce(selector, event, handler) {
  const el = document.querySelector(selector);
  if (el) el.addEventListener(event, handler);
}