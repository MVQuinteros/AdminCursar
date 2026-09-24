#!/usr/bin/env node
/**
 * Servidor de desarrollo local para la web admin CURSAR.
 * No requiere dependencias (node >= 14). Uso:
 *
 *   node dev.js            -> sirve en http://localhost:8090
 *   node dev.js 8080       -> sirve en otro puerto
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 8090);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function guard(root, rel) {
  const target = path.resolve(root, rel);
  return target.startsWith(root) ? target : null;
}

http
  .createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const file = guard(ROOT, rel);
      if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    }
  })
  .listen(PORT, () => {
    console.log('');
    console.log('  ✅ CURSAR Admin en:');
    console.log(`     http://localhost:${PORT}/`);
    console.log('');
    console.log('  Ctrl+C para detener.');
    console.log('');
  });