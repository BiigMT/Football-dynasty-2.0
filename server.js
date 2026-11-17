import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

// Railway health check: confirms the Node/Express server is responding.
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Football Dynasty',
    service: 'express',
    timestamp: new Date().toISOString()
  });
});

// Serve the production Vite build.
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (error) => {
    if (error && !res.headersSent) {
      res.status(503).send('Football Dynasty is starting. Production build not found.');
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Football Dynasty server running on http://${HOST}:${PORT}`);
});
