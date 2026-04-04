const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Robust media route: allow earth.mp4 in either /public or service root
app.get('/earth.mp4', (req, res) => {
    const publicVideoPath = path.join(__dirname, 'public', 'earth.mp4');
    const rootVideoPath = path.join(__dirname, 'earth.mp4');

    res.sendFile(publicVideoPath, (publicErr) => {
        if (!publicErr) return;

        res.sendFile(rootVideoPath, (rootErr) => {
            if (rootErr) {
                res.status(404).send('earth.mp4 not found. Place it in services/main/public or services/main');
            }
        });
    });
});

// Fallback routing for HTML pages (allows /login instead of /login.html)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page && !page.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`), (err) => {
            if (err) {
                next(); // If not found, let it 404
            }
        });
    } else {
        next();
    }
});

// Any other route throws a simple 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
