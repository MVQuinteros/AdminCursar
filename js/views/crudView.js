/**
 * Vistas CRUD reutilizables: toolbar, búsquedas, tablas, formularios y badges.
 * Todas devuelven HTML; los controladores se encargan de los eventos.
 */
import { esc, displayVal } from '../utils/helpers.js';

const ICONS = {
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  edit: '<path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
};

const svg = (name) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

export const actionIcons = { edit: svg('edit'), trash: svg('trash'), check: svg('check'), x: svg('x'), plus: svg('plus'), download: svg('download') };

/* ------------------------------------------------------------------ badges */
const BADGE_TONES = {
  success: 'badge--success',
  warning: 'badge--warning',
  danger: 'badge--danger',
  info: 'badge--info',
  neutral: 'badge--neutral',
  purple: 'badge--purple',
};

export function badge(text, tone = 'neutral') {
  return `<span class="badge ${BADGE_TONES[tone] || BADGE_TONES.neutral}">${esc(text)}</span>`;
}

/* ------------------------------------------------------------ loading/empty */
export function loadingHTML() {
  return `
    <div class="card" style="display:flex;align-items:center;gap:10px;color:var(--text-secondary)">
      <span class="spinner spinner--dark" style="border-color:var(--border-strong);border-top-color:var(--accent)"></span>
      Cargando datos…
    </div>`;
}

export function emptyHTML({ icon = '📄', title = 'Sin datos', text = 'Todavía no hay registros para mostrar.' } = {}) {
  return `
    <div class="table-wrap">
      <div class="empty">
        <div class="empty__icon">${icon}</div>
        <div class="empty__title">${esc(title)}</div>
        <div>${esc(text)}</div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- toolbar */
/**
 * @param {Object} opts
 * @param {Array}  opts.filters [{ key, label, type?: 'select'|'date', options?: [{value,label}] }]
 *   - select sin options: el controller las deriva de los datos (valores únicos).
 *   - date: renderiza Desde/Hasta (nativos); Desde vacío + Hasta = "…hasta ese día" y
 *     Desde fijo + Hasta vacío = "desde X hasta hoy" (ambos vacíos = sin filtro).
 */
export function toolbarHTML({ title, subtitle, actions = [], filters = [] }) {
  const buttons = actions
    .map(
      (a) => `
        <button type="button" class="btn btn--${a.tone || 'primary'} btn--sm" data-toolbar="${esc(a.action)}">
          ${a.icon === 'download' ? svg('download') : ''}${a.icon === 'plus' ? svg('plus') : ''}${esc(a.label)}
        </button>`
    )
    .join('');

  const filterHTML = filters
    .map((f) => {
      if (f.type === 'date') {
        return `
          <span class="filter-date-range" title="${esc(f.label)}">
            <span class="filter-date-range__label">${esc(f.label)}</span>
            <input type="date" class="input" data-filter-date="${esc(f.key)}-start" aria-label="${esc(f.label)} desde" />
            <span class="filter-date-range__sep">a</span>
            <input type="date" class="input" data-filter-date="${esc(f.key)}-end" aria-label="${esc(f.label)} hasta" />
          </span>`;
      }
      const options = (f.options || []).map(
        (o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`
      ).join('');
      return `
        <select class="input filter-select" data-filter-key="${esc(f.key)}" aria-label="${esc(f.label)}">
          <option value="">${esc(f.label)}: todas</option>
          ${options}
        </select>`;
    })
    .join('');

  return `
    <div class="toolbar">
      <div class="search">
        <svg class="search__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" class="input" id="search-input" placeholder="Buscar…" aria-label="Buscar" data-search />
      </div>
      ${filterHTML ? `<div class="toolbar__filters">${filterHTML}<button type="button" class="btn btn--secondary btn--sm" data-reset-filters hidden>Quitar filtros</button></div>` : ''}
      <div class="toolbar__actions">${buttons}</div>
    </div>`;
}

/* ------------------------------------------------------------ tablas ----- */
/**
 * @param {Object} opts
 * @param {Array}  opts.columns  [{key, label, render?(row)=>string(html seguro)}]
 * @param {Array}  opts.rows     datos (con .id cuando existe)
 * @param {Array}  opts.rowActions  [{action, label, tone, icon, visible?(row)=>boolean }]
 */
export function tableHTML({ columns, rows, rowActions = [] }) {
  if (!rows.length) return '';

  const hasActions = rowActions.length > 0;
  const thead = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
  const tbody = rows
    .map((row) => {
      const cells = columns
        .map((col) => {
          const value = col.render ? col.render(row) : esc(displayVal(row[col.key]));
          return `<td>${value}</td>`;
        })
        .join('');

      const actionsForRow = rowActions.filter((a) => !a.visible || a.visible(row));

      const actionsCell = actionsForRow.length
        ? `<td class="cell-actions"><div class="row-actions">${actionsForRow
            .map(
              (a) => `
                <button type="button" class="btn btn--${a.tone || 'secondary'} btn--sm"
                        data-action="${esc(a.action)}" data-id="${esc(row.id)}"
                        title="${esc(a.title || a.label)}">${a.icon ? actionIcons[a.icon] : ''}${esc(a.label)}</button>`
            )
            .join('')}</div></td>`
        : '';

      return `<tr data-id="${esc(row.id)}">${cells}${actionsCell}</tr>`;
    })
    .join('');

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${thead}${hasActions ? '<th class="cell-actions">Acciones</th>' : ''}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>`;
}

/* -------------------------------------------------------- formularios ----- */
/**
 * Genera un formulario a partir de una definición de campos.
 * @param {Array} fields [{name,label,type,options,required,hint,placeholder,step,full}]
 * @param {Object} values objeto con valores iniciales (camelCase/igual al name).
 */
export function formHTML({ fields, values = {}, submitLabel = 'Guardar', submitting = false }) {
  const body = fields
    .map((f) => {
      const val = values[f.name] !== undefined ? values[f.name] : '';
      const cls = f.full ? 'field field--full' : 'field';

      switch (f.type) {
        case 'textarea':
          return `
            <div class="${cls}"><label for="f-${f.name}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <textarea class="input" id="f-${f.name}" name="${esc(f.name)}" ${f.required ? 'required' : ''} rows="${f.rows || 3}">${esc(val)}</textarea>
              ${f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : ''}
            </div>`;
        case 'select':
          return `
            <div class="${cls}"><label for="f-${f.name}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <select class="input" id="f-${f.name}" name="${esc(f.name)}" ${f.required ? 'required' : ''}>
                <option value="">— Seleccionar —</option>
                ${(f.options || []).map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(val) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
              </select>
              ${f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : ''}
            </div>`;
        case 'switch':
          return `
            <div class="${cls}"><label class="switch">
              <input type="checkbox" name="${esc(f.name)}" ${val ? 'checked' : ''} />
              <span>${esc(f.label)}</span>
            </label></div>`;
        case 'datalist':
          return `
            <div class="${cls}"><label for="f-${f.name}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <input class="input" list="dl-${esc(f.name)}" id="f-${f.name}" name="${esc(f.name)}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''} />
              <datalist id="dl-${esc(f.name)}">${(f.options || []).map((o) => `<option value="${esc(o.value)}">`).join('')}</datalist>
              ${f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : ''}
            </div>`;
        case 'number':
          return `
            <div class="${cls}"><label for="f-${f.name}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <input class="input" id="f-${f.name}" name="${esc(f.name)}" type="number" step="${f.step || '1'}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''} />
              ${f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : ''}
            </div>`;
        default:
          return `
            <div class="${cls}"><label for="f-${f.name}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <input class="input" id="f-${f.name}" name="${esc(f.name)}" type="${f.type || 'text'}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''} />
              ${f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : ''}
            </div>`;
      }
    })
    .join('');

  return `
    <form id="crud-form">
      <div class="form-grid">${body}</div>
      <div class="modal__foot" style="border-top:0;padding:18px 0 0">
        <button type="submit" class="btn btn--primary" id="btn-submit">${esc(submitLabel)}</button>
      </div>
    </form>`;
}

/** Lee los valores de un formulario según la definición de campos. */
export function readForm(form, fields) {
  const data = {};
  for (const f of fields) {
    const el = form.elements[f.name];
    if (!el) continue;
    if (f.type === 'checkbox') data[f.name] = el.checked;
    else if (f.type === 'number') data[f.name] = el.value === '' ? '' : Number(el.value);
    else data[f.name] = el.value.trim ? el.value.trim() : el.value;
  }
  return data;
}