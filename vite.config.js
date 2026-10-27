import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fetchCifraHandler from './api/fetch-cifra.js'

function localApiMiddleware() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use('/api/fetch-cifra', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          req.query = Object.fromEntries(urlObj.searchParams.entries());
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          await fetchCifraHandler(req, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ found: false, error: err.message }));
        }
      });
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
