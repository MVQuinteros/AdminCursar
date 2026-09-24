/**
 * Vista de autenticación: pantallas de carga, login, registro y acceso denegado.
 */
import { config } from '../config/firebase-config.js';
import { esc } from '../utils/helpers.js';

export function loadingScreen() {
  return `
    <div class="auth-screen">
      <div class="auth-card">
        <p style="text-align:center;color:var(--text-secondary)">
          <span class="spinner spinner--dark" style="border-color:var(--border-strong);border-top-color:var(--accent)"></span>
          Verificando sesión…
        </p>
      </div>
    </div>`;
}

export function loginScreen() {
  const allowRegister = config.permitirRegistro;
  const registerBlock = allowRegister
    ? `<p style="margin:14px 0 0;font-size:12.5px;color:var(--text-secondary);text-align:center">
         ¿No tenés cuenta? <button type="button" class="btn btn--link" id="btn-swap-auth" style="background:none;border:0;color:var(--accent);cursor:pointer;font-size:12.5px;padding:0">Registrarme</button>
       </p>`
    : '';

  return `
    <div class="auth-screen">
      <div class="auth-card" id="auth-card">
        <div class="auth-card__brand">
          <span class="auth-card__brand-mark">C</span>
          <span><strong>CURSAR</strong><span>Panel de administración</span></span>
        </div>
        <h1>Iniciar sesión</h1>
        <p class="auth-card__sub">Accedé con una cuenta con rol <strong>admin</strong>.</p>

        <div class="auth-error" id="auth-error" hidden></div>

        <form id="login-form">
          <div style="display:grid;gap:12px">
            <div class="field"><label for="login-email">Email</label>
              <input class="input" id="login-email" name="email" type="email" required autocomplete="username" placeholder="admin@cursar.com" />
            </div>
            <div class="field"><label for="login-pass">Contraseña</label>
              <input class="input" id="login-pass" name="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
            </div>
            <button type="submit" class="btn btn--primary btn--block">Entrar</button>
          </div>
        </form>

        <div class="auth-footer">
          <strong>¿Sos admin?</strong> Desde Firebase Console: <code>Authentication</code> → crear usuario, y luego en
          <code>Firestore</code> → <code>usuarios/{uid}</code> → <code>rol: "admin"</code>.
        </div>
        ${registerBlock}
      </div>
    </div>`;
}

export function registerScreen() {
  return `
    <div class="auth-screen">
      <div class="auth-card" id="auth-card">
        <div class="auth-card__brand">
          <span class="auth-card__brand-mark">C</span>
          <span><strong>CURSAR</strong><span>Panel de administración</span></span>
        </div>
        <h1>Registrar cuenta</h1>
        <p class="auth-card__sub">Se creará con rol <strong>admin</strong>.</p>

        <div class="auth-error" id="auth-error" hidden></div>

        <form id="register-form">
          <div style="display:grid;gap:12px">
            <div class="field" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <span><label for="reg-nombre">Nombre</label>
                <input class="input" id="reg-nombre" name="nombre" required placeholder="Nombre" /></span>
              <span><label for="reg-apellido">Apellido</label>
                <input class="input" id="reg-apellido" name="apellido" required placeholder="Apellido" /></span>
            </div>
            <div class="field"><label for="reg-email">Email</label>
              <input class="input" id="reg-email" name="email" type="email" required autocomplete="username" placeholder="admin@cursar.com" />
            </div>
            <div class="field"><label for="reg-pass">Contraseña</label>
              <input class="input" id="reg-pass" name="password" type="password" required minlength="6" autocomplete="new-password" placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" class="btn btn--primary btn--block">Crear cuenta admin</button>
          </div>
        </form>

        <p style="margin:14px 0 0;font-size:12.5px;color:var(--text-secondary);text-align:center">
          ¿Ya tenés cuenta? <button type="button" id="btn-swap-auth" style="background:none;border:0;color:var(--accent);cursor:pointer;font-size:12.5px;padding:0">Iniciar sesión</button>
        </p>
      </div>
    </div>`;
}

export function deniedScreen(email) {
  return `
    <div class="auth-screen">
      <div class="auth-card">
        <h1 style="margin-top:0">Acceso denegado</h1>
        <p class="auth-card__sub">
          La cuenta <strong>${esc(email || '')}</strong> no tiene rol de administrador.
          El acceso a este panel está limitado a cuentas con <code>rol: "admin"</code>.
        </p>
        <button type="button" class="btn btn--outline btn--block" id="btn-denied-logout">Cambiar de cuenta</button>
      </div>
    </div>`;
}