import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fetchCifraHandler from './api/fetch-cifra.js'
import googleDocsHandler from './api/google-docs.js'
import stateHandler from './api/state.js'

function wrapHandler(handler) {
  return async (req, res) => {
    try {
      const urlObj = new URL(req.url, 'http://localhost:5173');
      req.query = Object.fromEntries(urlObj.searchParams.entries());

      if (req.method === 'POST' || req.method === 'PUT') {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch (_) {
          req.body = rawBody;
        }
      }

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
      await handler(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  };
}

function localApiMiddleware() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use('/api/fetch-cifra', wrapHandler(fetchCifraHandler));
      server.middlewares.use('/api/google-docs', wrapHandler(googleDocsHandler));
      server.middlewares.use('/api/state', wrapHandler(stateHandler));
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiMiddleware()],
  server: {
    port: 5173,
    open: true
  }
})
