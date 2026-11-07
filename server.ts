import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a19f92695916f5';
const BACKUP_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1b6b44b485d69';

app.use(express.json());

// Enable CORS and anti-cache for all incoming requests (iOS Safari, Vercel, Incognito, etc.)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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

  const fetchVault = async (url: string) => {
    try {
      const cloudRes = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        const list = json?.data?.responses;
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item && item.id) map.set(item.id as string, item);
          }
        }
      }
    } catch {}
  };

  await Promise.allSettled([
    fetchVault(PRIMARY_VAULT_URL),
    fetchVault(BACKUP_VAULT_URL),
  ]);

  const combined = Array.from(map.values());
  combined.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
    return timeB - timeA;
  });

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

  const syncVault = async (url: string, vaultName: string) => {
    try {
      const getRes = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
      let cloudList: Record<string, unknown>[] = [];
      if (getRes.ok) {
        const data = await getRes.json();
        if (Array.isArray(data?.data?.responses)) {
          cloudList = data.data.responses;
        }
      }
      const updatedCloud = [newEntry, ...cloudList.filter((item) => item.id !== newEntry.id)];
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vaultName,
          data: { responses: updatedCloud },
        }),
      });
    } catch (err) {
      console.error(`Failed to sync to vault (${url}):`, err);
    }
  };

  await Promise.allSettled([
    syncVault(PRIMARY_VAULT_URL, 'fred_pumpkin_responses_vault'),
    syncVault(BACKUP_VAULT_URL, 'fred_pumpkin_responses_vault_backup'),
  ]);

  res.json({ success: true, count: updatedLocal.length, entry: newEntry });
});

// DELETE /api/responses
app.delete('/api/responses', async (req, res) => {
  const targetId = (req.query.id as string) || req.body?.id;

  if (targetId && targetId !== 'all') {
    const localList = readLocalResponses();
    const filtered = localList.filter((item) => item.id !== targetId);
    writeLocalResponses(filtered);

    const deleteVault = async (url: string, vaultName: string) => {
      try {
        const getRes = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
        if (getRes.ok) {
          const data = await getRes.json();
          if (Array.isArray(data?.data?.responses)) {
            const cloudFiltered = data.data.responses.filter((item: { id?: string }) => item.id !== targetId);
            await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: vaultName,
                data: { responses: cloudFiltered },
              }),
            });
          }
        }
      } catch {}
    };

    await Promise.allSettled([
      deleteVault(PRIMARY_VAULT_URL, 'fred_pumpkin_responses_vault'),
      deleteVault(BACKUP_VAULT_URL, 'fred_pumpkin_responses_vault_backup'),
    ]);

    res.json({ success: true, deletedId: targetId, count: filtered.length });
  } else {
    writeLocalResponses([]);

    const clearVault = async (url: string, vaultName: string) => {
      try {
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: vaultName,
            data: { responses: [] },
          }),
        });
      } catch {}
    };

    await Promise.allSettled([
      clearVault(PRIMARY_VAULT_URL, 'fred_pumpkin_responses_vault'),
      clearVault(BACKUP_VAULT_URL, 'fred_pumpkin_responses_vault_backup'),
    ]);

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
