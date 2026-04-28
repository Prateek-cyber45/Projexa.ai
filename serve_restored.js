0const express = require('express');
const path = require('path');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

// App 1: Academy (Port 3001)
const academyApp = express();
academyApp.use('/academy', express.static(path.join(__dirname, 'html_stack/before_signup/academy')));
academyApp.use('/academy', express.static(path.join(__dirname, 'html_stack/after_signup/academy')));
academyApp.use(express.static(path.join(__dirname, 'html_stack/before_signup/academy')));
academyApp.use(express.static(path.join(__dirname, 'html_stack/after_signup/academy')));
academyApp.use('/common', express.static(path.join(__dirname, 'html_stack/common_pages')));
academyApp.use('/logo', express.static(path.join(__dirname, 'logo')));
academyApp.use('/assets', express.static(path.join(__dirname, 'assets')));

academyApp.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'html_stack/common_pages/404.html'));
});

academyApp.listen(3001, '0.0.0.0', () => {
    console.log('[ACADEMY SERVER] Serving Academy HTML on port 3001');
});

// App 2: Labs (Port 3002)
const labsApp = express();
labsApp.use('/labs', express.static(path.join(__dirname, 'html_stack/before_signup/lab')));
labsApp.use('/labs', express.static(path.join(__dirname, 'html_stack/after_signup/lab')));
labsApp.use(express.static(path.join(__dirname, 'html_stack/before_signup/lab')));
labsApp.use(express.static(path.join(__dirname, 'html_stack/after_signup/lab')));
labsApp.use('/common', express.static(path.join(__dirname, 'html_stack/common_pages')));
labsApp.use('/logo', express.static(path.join(__dirname, 'logo')));
labsApp.use('/assets', express.static(path.join(__dirname, 'assets')));

labsApp.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'html_stack/common_pages/404.html'));
});

labsApp.listen(3002, '0.0.0.0', () => {
    console.log('[LABS SERVER] Serving Labs HTML on port 3002');
});

// App 3: Main (Port 3003)
const mainApp = express();

// Explicit Routes for pretty URLs
mainApp.use(express.json());
mainApp.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'html_stack/common_pages/login.html')));
mainApp.get('/forgot-password', (req, res) => res.sendFile(path.join(__dirname, 'html_stack/common_pages/forgot_password.html')));
mainApp.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'html_stack/after_signup/services/register.html')));
mainApp.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'html_stack/after_signup/services/dashboard_pro.html')));

// API Proxies — forward to backend services
// Main API (FastAPI on port 8001)
mainApp.use('/api/main', (req, res, next) => {
    const mainApiUrl = process.env.MAIN_API_URL || 'http://localhost:8001';
    const targetUrl = `${mainApiUrl}/api/main${req.url}`;
    const urlObj = new URL(targetUrl);
    
    const proxyReq = require('http').request(targetUrl, {
        method: req.method,
        headers: { ...req.headers, host: urlObj.host }
    }, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
        // Backend is down — return offline fallback
        if (req.url.startsWith('/profile')) {
            const storedUser = req.headers.authorization ? 'Operator' : 'Guest';
            res.json({ id: 0, username: storedUser, email: 'offline@deephunt.io', tier: 'pro', profile: {} });
        } else if (req.url.startsWith('/scores')) {
            res.json([]);
        } else if (req.url.startsWith('/dashboard')) {
            res.json({ username: 'Operator', rolling_score: 42.5, skill_vectors: { soc_analysis: 0.72, forensics: 0.55, network_security: 0.68, incident_response: 0.40, threat_hunting: 0.81 } });
        } else {
            res.status(503).json({ detail: 'Backend offline' });
        }
    });
    if (req.body && Object.keys(req.body).length > 0) {
        proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
});

// Academy API
mainApp.use('/api/academy', (req, res, next) => {
    const academyApiUrl = process.env.ACADEMY_API_URL || 'http://localhost:8002';
    const targetUrl = `${academyApiUrl}/api/academy${req.url}`;
    const urlObj = new URL(targetUrl);

    const proxyReq = require('http').request(targetUrl, {
        method: req.method,
        headers: { ...req.headers, host: urlObj.host }
    }, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
        res.json([]);
    });
    if (req.body && Object.keys(req.body).length > 0) {
        proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
});

// Threat Intel API
mainApp.use('/api/threat-intel', (req, res) => {
    const mainApiUrl = process.env.MAIN_API_URL || 'http://localhost:8001';
    const targetUrl = `${mainApiUrl}/api/threat-intel`;
    const urlObj = new URL(targetUrl);

    const proxyReq = require('http').request(targetUrl, {
        method: 'GET',
        headers: { host: urlObj.host }
    }, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', () => res.json([]));
    proxyReq.end();
});

mainApp.use('/labs/soc-sim', express.static(path.join(__dirname, 'html_stack/after_signup/lab/soc_sim')));

mainApp.use('/academy', express.static(path.join(__dirname, 'html_stack/before_signup/academy')));
mainApp.use('/academy', express.static(path.join(__dirname, 'html_stack/after_signup/academy')));

mainApp.use('/labs', express.static(path.join(__dirname, 'html_stack/before_signup/lab')));
mainApp.use('/labs', express.static(path.join(__dirname, 'html_stack/after_signup/lab')));

mainApp.use(express.static(path.join(__dirname, 'html_stack/before_signup/main')));
mainApp.use(express.static(path.join(__dirname, 'html_stack/after_signup/main')));
mainApp.use(express.static(path.join(__dirname, 'html_stack/common_pages')));
mainApp.use('/common_pages', express.static(path.join(__dirname, 'html_stack/common_pages')));
mainApp.use('/main', express.static(path.join(__dirname, 'html_stack/after_signup/services')));
mainApp.use('/services', express.static(path.join(__dirname, 'html_stack/after_signup/services')));
mainApp.use('/common', express.static(path.join(__dirname, 'html_stack/common_pages')));
mainApp.use('/logo', express.static(path.join(__dirname, 'logo')));
mainApp.use('/assets', express.static(path.join(__dirname, 'assets')));

mainApp.use('/labs-ws', createProxyMiddleware({
    target: 'http://localhost:4000',
    changeOrigin: true,
    ws: true
}));

mainApp.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'html_stack/common_pages/404.html'));
});

const mainServer = http.createServer(mainApp);
mainServer.listen(3003, '0.0.0.0', () => {
    console.log('[MAIN SERVER] Serving Main/Common HTML on port 3003');
});
