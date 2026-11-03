import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function responsesApiPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const responsesFile = path.resolve(dataDir, 'responses.json');

  const ensureFileExists = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(responsesFile)) {
      fs.writeFileSync(responsesFile, JSON.stringify([], null, 2), 'utf-8');
    }
  };

  return {
    name: 'responses-api',
    configureServer(server) {
      server.middlewares.use('/api/responses', (req, res) => {
        ensureFileExists();

        if (req.method === 'GET') {
          try {
            const data = fs.readFileSync(responsesFile, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read responses' }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const newEntry = JSON.parse(body);
              const existing = JSON.parse(fs.readFileSync(responsesFile, 'utf-8') || '[]');
              existing.unshift({
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...newEntry,
              });
              fs.writeFileSync(responsesFile, JSON.stringify(existing, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: existing.length }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          try {
            fs.writeFileSync(responsesFile, JSON.stringify([], null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: 0 }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to clear responses' }));
          }
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), responsesApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
