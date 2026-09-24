/**
 * Controlador CRUD genérico (patrón de factoría).
 * Convierte una definición (modelo + columnas + campos) en un módulo
 * administrable completo: listado con búsqueda, alta, edición, borrado,
 * acciones extras y exportación a CSV.
 *
 * @param {Object}   opts
 * @param {Object}   opts.model             instancia de un BaseModel
 * @param {string}   opts.title             título del módulo
 * @param {string}   opts.subtitle          subtítulo
 * @param {Array}    opts.columns           [{key,label,render?,export?}]
 * @param {Array}    opts.fields            definición de campos del formulario
 * @param {Array}    opts.filters           [{key,label,type?,options?,match?}] filtros; `match` = (row,key,value)=>bool (default: String(row[key]) === value)
 * @param {Array}    opts.rowActions        [{action,label,tone,icon,title}]
 * @param {boolean}  opts.allowAdd          habilita el botón "+ Nuevo"
 * @param {string}   opts.banner            HTML de banner informativo (opcional)
 * @param {boolean}  opts.autoTimestamp     agrega createdAt al crear (default true)
 * @param {Function} opts.onRowAction       (action, row) => void (acciones custom)
 * @param {Function} opts.addValues         () => objeto (valores iniciales al crear)
 */
import { serverTimestamp } from 'firebase/firestore';

import { emptyHTML, formHTML, readForm, tableHTML, toolbarHTML } from '../views/crudView.js';
import { confirmDialog, openModal, toast } from '../views/notify.js';
import { debounce, toDate } from '../utils/helpers.js';
import { exportCSV } from '../utils/exportCSV.js';

export function createCrudController({
  model,
  title,
  subtitle = '',
  columns,
  fields,
  rowActions = [],
  allowAdd = true,
  banner = '',
  autoTimestamp = true,
  filters = [],
  onRowAction,
  addValues = () => ({}),
}) {
  let allData = [];
  let filtered = [];

  const searchText = (row) => JSON.stringify(row).toLowerCase();

  /** Convierte 'YYYY-MM-DD' (input date) a Date local, evitando saltos de zona horaria. */
  function parseDateInput(value) {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  /** Resuelve las opciones de un filtro: las sin `options` se derivan de los datos. */
  function resolveFilters() {
    return filters.map((f) => {
      if (f.type === 'date' || (f.options && f.options.length)) return f;
      const seen = new Set();
      const options = [];
      for (const row of allData) {
        const s = String(row[f.key] ?? '');
        if (s === '' || seen.has(s)) continue;
        seen.add(s);
        options.push({ value: s, label: s });
      }
      options.sort((a, b) => a.label.localeCompare(b.label, 'es'));
      return { ...f, options };
    });
  }

  async function render(body) {
    body.innerHTML = `
      <div id="crud-root">
        <div id="crud-toolbar"></div>
        ${banner ? `<div id="crud-banner">${banner}</div>` : ''}
        <div id="crud-table"></div>
      </div>`;

    await loadData();
  }

  async function loadData() {
    allData = await model.list();
    renderToolbar();
    applyFilters();
  }

  function renderToolbar() {
    const actions = [];
    if (allowAdd) actions.push({ action: 'add', label: 'Nuevo', icon: 'plus', tone: 'primary' });
    actions.push({ action: 'export', label: 'Exportar', icon: 'download', tone: 'secondary' });

    const slot = document.getElementById('crud-toolbar');
    slot.innerHTML = toolbarHTML({ title, subtitle, actions, filters: resolveFilters() });

    slot.querySelector('[data-toolbar="add"]')?.addEventListener('click', openAddModal);
    slot.querySelector('[data-toolbar="export"]')?.addEventListener('click', () => {
      exportCSV({ filename: title.toLowerCase().replace(/\s+/g, '-'), columns, rows: filtered });
    });

    const search = slot.querySelector('[data-search]');
    search.addEventListener('input', debounce(() => applyFilters(), 200));

    slot.querySelectorAll('[data-filter-key]').forEach((el) => el.addEventListener('change', applyFilters));
    slot.querySelectorAll('[data-filter-date]').forEach((el) => el.addEventListener('input', applyFilters));
    slot.querySelector('[data-reset-filters]')?.addEventListener('click', resetFilters);
  }

  function applyFilters() {
    const slot = document.getElementById('crud-toolbar');

    const query = slot.querySelector('[data-search]').value.trim().toLowerCase();
    const selects = [...slot.querySelectorAll('[data-filter-key]')].map((el) => ({
      key: el.dataset.filterKey,
      value: el.value,
    }));
    const matchByKey = new Map(filters.map((f) => [f.key, f.match]));
    const dates = new Map();
    for (const el of slot.querySelectorAll('[data-filter-date]')) {
      const [key, bound] = el.dataset.filterDate.split('-');
      if (!dates.has(key)) dates.set(key, {});
      dates.get(key)[bound] = el.value;
    }
    const dateFilters = [...dates.entries()].map(([key, { start, end }]) => {
      const from = parseDateInput(start);
      const to = parseDateInput(end);
      if (from) from.setHours(0, 0, 0, 0);
      if (to) to.setHours(23, 59, 59, 999);
      return { key, from, to };
    });

    filtered = allData.filter((row) => {
      if (query && !searchText(row).includes(query)) return false;
      for (const { key, value } of selects) {
        if (!value) continue;
        const match = matchByKey.get(key) || ((row, k, v) => String(row[k]) === v);
        if (!match(row, key, value)) return false;
      }
      for (const { key, from, to } of dateFilters) {
        if (!from && !to) continue;
        const d = toDate(row[key]);
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });

    const resetBtn = slot.querySelector('[data-reset-filters]');
    if (resetBtn) {
      const active = [query, ...selects.map((s) => s.value), ...[...dates.values()].flatMap((b) => Object.values(b))]
        .some(Boolean);
      resetBtn.hidden = !active;
    }

    renderTable();
  }

  function resetFilters() {
    const slot = document.getElementById('crud-toolbar');
    slot.querySelectorAll('[data-filter-key]').forEach((el) => (el.value = ''));
    slot.querySelectorAll('[data-filter-date]').forEach((el) => (el.value = ''));
    const search = slot.querySelector('[data-search]');
    if (search) search.value = '';
    applyFilters();
  }

  function renderTable() {
    const slot = document.getElementById('crud-table');
    slot.innerHTML =
      filtered.length === 0
        ? emptyHTML()
        : tableHTML({ columns, rows: filtered, rowActions });

    if (!filtered.length || !rowActions.length) return;

    slot.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = filtered.find((r) => String(r.id) === String(btn.dataset.id));
        if (!row) return;
        handleRowAction(btn.dataset.action, row);
      });
    });
  }

  async function handleRowAction(action, row) {
    if (action === 'edit') return openEditModal(row);
    if (action === 'delete') return removeRow(row);
    if (onRowAction) return onRowAction(action, row, { reload: loadData, refresh: loadData });
    throw new Error(`Acción desconocida: ${action}`);
  }

  function openAddModal() {
    const bodyHTML = formHTML({ fields, values: addValues(), submitLabel: 'Crear' });
    const modal = openModal({ title: `Nuevo ${title.toLowerCase().replace(/s$/, '')}`, bodyHTML });
    modal.backdrop.querySelector('#crud-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = readForm(e.target, fields);
      try {
        await model.add(autoTimestamp ? { ...data, createdAt: serverTimestamp() } : data);
        modal.close();
        toast(`${title} creado correctamente.`, 'success');
        await loadData();
      } catch (err) {
        toast(`No se pudo crear: ${err.message}`, 'error');
      }
    });
  }

  function openEditModal(row) {
    const values = {};
    for (const f of fields) {
      values[f.name] =
        f.type === 'date' && row[f.name]
          ? toDate(row[f.name]).toISOString().slice(0, 10)
          : row[f.name] ?? '';
    }

    const bodyHTML = formHTML({ fields, values, submitLabel: 'Guardar' });
    const modal = openModal({ title: `Editar ${title.toLowerCase().replace(/s$/, '')}`, bodyHTML });
    modal.backdrop.querySelector('#crud-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = readForm(e.target, fields);
      try {
        await model.update(row.id, data);
        modal.close();
        toast('Cambios guardados.', 'success');
        await loadData();
      } catch (err) {
        toast(`No se pudo guardar: ${err.message}`, 'error');
      }
    });
  }

  async function removeRow(row) {
    const ok = await confirmDialog({
      title: 'Eliminar registro',
      message:
        'Esta acción es irreversible. ¿Eliminar este registro y todos sus datos?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await model.remove(row.id);
      toast('Registro eliminado.', 'success');
      await loadData();
    } catch (err) {
      toast(`No se pudo eliminar: ${err.message}`, 'error');
    }
  }

  return { render };
}