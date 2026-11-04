/**
 * Serves the static web export (web-build/) with the same route resolution
 * the hosting layer needs: `/releases` -> `releases.html`, `/` -> `index.html`.
 *
 * Usage: node scripts/serve-web.js [port]
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.join(__dirname, '..', 'web-build');
const port = Number(process.argv[2] || process.env.PORT || 8080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const safe = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const base = path.join(root, safe);

  const candidates = [base, `${base}.html`, path.join(base, 'index.html')];
  return candidates.find((candidate) => {
    if (!candidate.startsWith(root)) return false;
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

if (!fs.existsSync(root)) {
  console.error(`Missing ${root}. Run: npx expo export --platform web --output-dir web-build`);
  process.exit(1);
}

http
  .createServer((req, res) => {
    const file = resolveFile(req.url || '/');
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Serving web-build on http://127.0.0.1:${port}`);
  });
