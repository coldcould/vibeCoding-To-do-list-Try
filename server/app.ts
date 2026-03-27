import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { router } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', router);

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api')) {
        next();
        return;
      }

      response.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
