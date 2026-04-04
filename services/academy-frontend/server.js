const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const CONTENT_TYPES = {
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
};

function sendFile(res, absolutePath, statusCode = 200) {
  fs.readFile(absolutePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ service: 'academy-frontend', ok: true }));
    return;
  }

  // Block /api paths - these should be routed by nginx to backend
  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not Found', detail: 'API paths should be routed to backend' }));
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
    return;
  }

  if (pathname === '/course' || pathname.startsWith('/course/')) {
    sendFile(res, path.join(PUBLIC_DIR, 'course.html'));
    return;
  }

  const relativeStaticPath = pathname.replace(/^\//, '');
  const staticFilePath = path.join(PUBLIC_DIR, relativeStaticPath);
  if (staticFilePath.startsWith(PUBLIC_DIR) && fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    sendFile(res, staticFilePath);
    return;
  }

  sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`academy-frontend listening on port ${PORT}`);
});
