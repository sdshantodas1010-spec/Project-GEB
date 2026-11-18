const express = require('express');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/data', (_req, res) => {
    const dataPath = path.join(PUBLIC_DIR, 'data.json');
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'data.json not built yet' });
    }
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(dataPath);
  });

  app.get('/api/grade-status', (_req, res) => {
    res.json({ on: false });
  });

  app.post('/api/grade', (_req, res) => {
    res.status(501).json({ error: 'AI grading is not configured in this static hub.' });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  app.use((req, res, next) => {
    if (req.path === '/sw.js' || req.path === '/data.json') {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(req.path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    next();
  });

  app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

  app.use((_req, res) => {
    const notFound = path.join(PUBLIC_DIR, '404.html');
    if (fs.existsSync(notFound)) {
      return res.status(404).sendFile(notFound);
    }
    return res.status(404).send('Not Found');
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const app = createApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`GENESIS 22 server listening on http://0.0.0.0:${port}`);
  });
}

module.exports = { createApp };
