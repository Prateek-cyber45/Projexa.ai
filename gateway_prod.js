const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Proxy API requests to backend services
app.use('/api/main', createProxyMiddleware({ target: 'http://127.0.0.1:8001', changeOrigin: true }));
app.use('/api/academy', createProxyMiddleware({ target: 'http://127.0.0.1:8002', changeOrigin: true }));

// Serve legacy Marketing Pages statically
app.use('/web_flow', express.static(path.join(__dirname, 'web_flow')));

// Serve Production Builds of Frontends
app.use('/academy', express.static(path.join(__dirname, 'academy-ui', 'dist')));
app.use('/labs', express.static(path.join(__dirname, 'labs-ui', 'dist')));
app.use('/', express.static(path.join(__dirname, 'main-ui', 'dist')));

// Client-side routing fallbacks (Catch-all for SPA)
app.get('/academy/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'academy-ui', 'dist', 'index.html'));
});
app.get('/labs/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'labs-ui', 'dist', 'index.html'));
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'main-ui', 'dist', 'index.html'));
});

app.listen(3000, () => {
    console.log('[PROD GATEWAY] Deephunt Unified App Domain is running at http://localhost:3000');
});
