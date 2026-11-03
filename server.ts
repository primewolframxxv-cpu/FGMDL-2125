import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CLOUD_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a19f92695916f5';

app.use(express.json());

// Enable CORS for all incoming requests (iOS Safari, Vercel, Incognito, etc.)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

const dataDir = path.resolve(__dirname, 'data');
const responsesFile = path.resolve(dataDir, 'responses.json');

const ensureDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(responsesFile)) {
    fs.writeFileSync(responsesFile, JSON.stringify([], null, 2), 'utf-8');
  }
};

const readLocalResponses = (): Record<string, unknown>[] => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(responsesFile, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
};

const writeLocalResponses = (data: Record<string, unknown>[]) => {
  ensureDataFile();
  fs.writeFileSync(responsesFile, JSON.stringify(data, null, 2), 'utf-8');
};

// GET /api/responses
app.get('/api/responses', async (req, res) => {
  const localList = readLocalResponses();
  const map = new Map<string, Record<string, unknown>>();

  for (const item of localList) {
    if (item && item.id) map.set(item.id as string, item);
  }

  // Also pull from Cloud Vault to merge cross-device submissions
  try {
    const cloudRes = await fetch(CLOUD_VAULT_URL);
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      const cloudList = json?.data?.responses;
      if (Array.isArray(cloudList)) {
        for (const item of cloudList) {
          if (item && item.id && !map.has(item.id)) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch {}

  const combined = Array.from(map.values());
  combined.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
    return timeB - timeA;
  });

  // Keep local file in sync
  writeLocalResponses(combined);
  res.json(combined);
});

// POST /api/responses
app.post('/api/responses', async (req, res) => {
  const body = req.body || {};
  const newEntry = {
    id: body.id || `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: body.createdAt || new Date().toISOString(),
    ...body,
  };

  const localList = readLocalResponses();
  const updatedLocal = [newEntry, ...localList.filter((item) => item.id !== newEntry.id)];
  writeLocalResponses(updatedLocal);

  // Sync to Cloud Vault
  try {
    const getRes = await fetch(CLOUD_VAULT_URL);
    let cloudList: Record<string, unknown>[] = [];
    if (getRes.ok) {
      const data = await getRes.json();
      if (Array.isArray(data?.data?.responses)) {
        cloudList = data.data.responses;
      }
    }
    const updatedCloud = [newEntry, ...cloudList.filter((item) => item.id !== newEntry.id)];
    await fetch(CLOUD_VAULT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'fred_pumpkin_responses_vault',
        data: { responses: updatedCloud },
      }),
    });
  } catch (err) {
    console.error('Failed to sync to cloud vault:', err);
  }

  res.json({ success: true, count: updatedLocal.length, entry: newEntry });
});

// DELETE /api/responses
app.delete('/api/responses', async (req, res) => {
  const targetId = (req.query.id as string) || req.body?.id;

  if (targetId && targetId !== 'all') {
    const localList = readLocalResponses();
    const filtered = localList.filter((item) => item.id !== targetId);
    writeLocalResponses(filtered);

    try {
      const getRes = await fetch(CLOUD_VAULT_URL);
      if (getRes.ok) {
        const data = await getRes.json();
        if (Array.isArray(data?.data?.responses)) {
          const cloudFiltered = data.data.responses.filter((item: { id?: string }) => item.id !== targetId);
          await fetch(CLOUD_VAULT_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'fred_pumpkin_responses_vault',
              data: { responses: cloudFiltered },
            }),
          });
        }
      }
    } catch {}

    res.json({ success: true, deletedId: targetId, count: filtered.length });
  } else {
    writeLocalResponses([]);
    try {
      await fetch(CLOUD_VAULT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'fred_pumpkin_responses_vault',
          data: { responses: [] },
        }),
      });
    } catch {}
    res.json({ success: true, count: 0 });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
