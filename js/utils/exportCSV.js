/** Exportación a CSV compatible con Excel (UTF-8 con BOM). */
import { displayVal } from './helpers.js';

function csvCell(value) {
  const text = String(value ?? '');
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * @param {Object}   opts
 * @param {string}   opts.filename   nombre del archivo (ej: 'usuarios')
 * @param {Array}    opts.columns    [{key, label, export?(row)=>string}]
 * @param {Array}    opts.rows       registros (objetos) ya filtrados
 */
export function exportCSV({ filename, columns, rows }) {
  const exportable = columns.filter((c) => c.key);
  const header = exportable.map((c) => csvCell(c.label)).join(';');
  const lines = rows.map((row) =>
    exportable.map((c) => csvCell(c.export ? c.export(row) : displayVal(row[c.key]))).join(';')
  );
  const csv = '\uFEFF' + [header, ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}