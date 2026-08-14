/**
 * Servidor estático mínimo — zero dependências.
 * Serve os arquivos do portfólio e respeita a variável PORT do Railway.
 *
 *   npm start        → http://localhost:8080
 *   PORT=3000 npm start
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'X-Content-Type-Options': 'nosniff' }, headers || {}));
  res.end(body);
}

const server = http.createServer(function (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    return send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  if (pathname === '/health') {
    return send(res, 200, JSON.stringify({ status: 'ok' }), { 'Content-Type': MIME['.json'] });
  }

  if (pathname === '/') pathname = '/index.html';

  // resolve dentro de ROOT — bloqueia path traversal (../../etc/passwd)
  const filePath = path.join(ROOT, path.normalize(pathname));
  if (!filePath.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      // SPA-friendly: qualquer rota desconhecida cai no index
      return fs.readFile(path.join(ROOT, 'index.html'), function (e2, html) {
        if (e2) return send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
        send(res, 404, html, { 'Content-Type': MIME['.html'] });
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    // HTML sempre revalidado; estáticos com cache curto para facilitar troca de GIF
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=3600';

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff'
    });

    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('Portfólio no ar em http://localhost:' + PORT);
});
