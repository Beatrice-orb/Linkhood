import path from 'node:path';
import express from 'express';
import { createApp } from './app.ts';
import { IS_PRODUCTION, PORT, ROOT_DIR } from './config.ts';

const app = createApp();

if (IS_PRODUCTION) {
  const dist = path.join(ROOT_DIR, 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Linkhood running at http://localhost:${PORT}/#/demo`);
});
