/** Utilidades puras: escape, fechas, valores y debounce. */

/** Escapa texto para mostrarlo como HTML seguro (evita inyección XSS). */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Normaliza cualquier valor tipo fecha (Timestamp de Firestore, Date, ISO) a Date. */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formatea una fecha a dd/mm/yyyy. Devuelve '—' si viene vacía. */
export function fmtDate(value) {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('es-AR');
}

/** Formatea fecha + hora corta. */
export function fmtDateTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

/** Texto seguro para mostrar en una celda de tabla (sin HTML). */
export function displayVal(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value.toDate === 'function') return fmtDate(value);
  if (typeof value.latitude === 'number') return `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`;
  return String(value);
}

/** Retorna las iniciales de un nombre (para avatares). */
export function initials(nombre = '', apellido = '') {
  return `${nombre.charAt(0) || ''}${apellido.charAt(0) || ''}`.toUpperCase() || '?';
}

/** Debounce simple para inputs de búsqueda. */
export function debounce(fn, wait = 180) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function formatNumber(n) {
  return Number(n ?? 0).toLocaleString('es-AR');
}