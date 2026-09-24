/**
 * Vista Dashboard - tarjetas de estadísticas y contenedores de gráficos.
 * Los gráficos los construye el controller (Chart.js).
 */
import { esc, formatNumber } from '../utils/helpers.js';

export function statCardsHTML(stats = []) {
  const cards = stats
    .map((s) => {
      const tag = s.route ? 'button' : 'div';
      const attrs = s.route ? ` type="button" data-route="${esc(s.route)}"` : '';
      return `
        <${tag} class="stat stat--${s.tone || 'accent'}"${attrs}>
          ${s.route ? '<span class="stat__go" aria-hidden="true">&#8594;</span>' : ''}
          <div class="stat__label">${esc(s.label)}</div>
          <div class="stat__value">${formatNumber(s.value)}</div>
          ${s.sub ? `<div class="stat__sub">${esc(s.sub)}</div>` : ''}
        </${tag}>`;
    })
    .join('');
  return `<div class="stats-grid">${cards}</div>`;
}

export function chartBoxHTML({ title, subtitle = '', id, height = 260 }) {
  return `
    <div class="card chart-box">
      <h3>${esc(title)}</h3>
      ${subtitle ? `<p style="margin:0 0 12px;color:var(--text-secondary);font-size:12px">${esc(subtitle)}</p>` : ''}
      <div class="canvas-wrap" style="height:${height}px"><canvas id="${esc(id)}"></canvas></div>
    </div>`;
}