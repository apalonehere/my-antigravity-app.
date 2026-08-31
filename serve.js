// Local dev server for the Green Rising site.
//
//   node serve.js            -> http://localhost:8080
//   node serve.js 3000       -> http://localhost:3000
//
// Mirrors the vercel.json rewrite: any extensionless path that is not a real
// file falls back to index.html, so the client-side router handles deep links
// like /programmes the same way it does in production.
//
// Replaces server.ps1, which had a hardcoded path to an old scratch directory.

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.argv[2]) || 8080;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  let filePath = path.join(root, urlPath || 'index.html');

  // Never serve anything outside the project directory
  if (!path.resolve(filePath).startsWith(path.resolve(root))) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (path.extname(filePath) === '') {
      filePath = path.join(root, 'index.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);

  // Range support so video scrubbing works the way it does on a real host
  if (ext === '.mp4' && req.headers.range) {
    const [startStr, endStr] = req.headers.range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': types[ext]
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`Green Rising dev server: http://localhost:${port}/`);
});
