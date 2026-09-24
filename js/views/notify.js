/**
 * Vistas de feedback al usuario: toasts y modales de confirmación.
 * Crea el DOM por sí mismas; cada llamada es imperativa y simple.
 */
import { esc } from '../utils/helpers.js';

const TOAST_LIFETIME = 4200;

export function toast(message, type = 'info') {
  const region = document.getElementById('toast-region');
  if (!region) return;

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast__dot"></span><span>${esc(message)}</span>`;

  region.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => el.remove(), 260);
  }, TOAST_LIFETIME);
}

/**
 * Diálogo de confirmación. Devuelve una promesa que resuelve true/false.
 * @param {{title: string, message: string, confirmLabel?: string, danger?: boolean}}
 */
export function confirmDialog({ title, message, confirmLabel = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal modal--sm" role="dialog" aria-modal="true">
        <div class="modal__head"><h3>${esc(title)}</h3></div>
        <div class="modal__body" style="color:var(--text-secondary)">${esc(message)}</div>
        <div class="modal__foot">
          <button type="button" class="btn btn--secondary" data-act="cancel">Cancelar</button>
          <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-act="ok">${esc(confirmLabel)}</button>
        </div>
      </div>`;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(false);
    });
    backdrop.querySelector('[data-act="cancel"]').addEventListener('click', () => close(false));
    backdrop.querySelector('[data-act="ok"]').addEventListener('click', () => close(true));

    document.body.appendChild(backdrop);

    function close(result) {
      backdrop.remove();
      resolve(result);
    }
  });
}

/** Abre un modal genérico y devuelve la referencia al backdrop (para cerrarlo). */
export function openModal({ title, bodyHTML, footerHTML = '' }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__head"><h3>${esc(title)}</h3></div>
      <div class="modal__body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal__foot">${footerHTML}</div>` : ''}
    </div>`;

  const close = () => {
    backdrop.remove();
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  document.body.appendChild(backdrop);
  return { backdrop, close };
}