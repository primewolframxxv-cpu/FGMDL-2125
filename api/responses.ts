// Serverless handler for Vercel deployment with Dual Cloud Vault Sync
const PRIMARY_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a19f92695916f5';
const BACKUP_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1b6b44b485d69';
let inMemoryCache: Record<string, unknown>[] = [];

export default async function handler(
  req: { method?: string; body?: unknown; url?: string; query?: Record<string, string | string[]> },
  res: {
    status: (code: number) => {
      json: (data: unknown) => void;
    };
    setHeader?: (name: string, value: string) => void;
  }
) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    const map = new Map<string, Record<string, unknown>>();

    for (const item of inMemoryCache) {
      if (item && item.id) map.set(item.id as string, item);
    }

    const fetchVault = async (url: string) => {
      try {
        const cloudRes = await fetch(`${url}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store' },
        });
        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (Array.isArray(cloudData?.data?.responses)) {
            for (const item of cloudData.data.responses) {
              if (item && item.id) map.set(item.id, item);
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

    inMemoryCache = combined;
    return res.status(200).json(combined);
  }

  if (req.method === 'POST') {
    let entry: Record<string, unknown> = {};
    try {
      entry = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as Record<string, unknown>);
    } catch {
      entry = {};
    }

    const newRecord = {
      id: (entry.id as string) || `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: (entry.createdAt as string) || new Date().toISOString(),
      ...entry,
    };

    inMemoryCache = [newRecord, ...inMemoryCache.filter((x) => x.id !== newRecord.id)];

    const syncVault = async (url: string, vaultName: string) => {
      try {
        const getRes = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
        let list: Record<string, unknown>[] = [];
        if (getRes.ok) {
          const data = await getRes.json();
          if (Array.isArray(data?.data?.responses)) {
            list = data.data.responses;
          }
        }
        const updated = [newRecord, ...list.filter((x) => x.id !== newRecord.id)];
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: vaultName,
            data: { responses: updated },
          }),
        });
      } catch {}
    };

    await Promise.allSettled([
      syncVault(PRIMARY_VAULT_URL, 'fred_pumpkin_responses_vault'),
      syncVault(BACKUP_VAULT_URL, 'fred_pumpkin_responses_vault_backup'),
    ]);

    return res.status(200).json({ success: true, count: inMemoryCache.length, record: newRecord });
  }

  if (req.method === 'DELETE') {
    let targetId = req.query?.id as string | undefined;
    if (!targetId && req.body) {
      try {
        const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        targetId = parsed?.id;
      } catch {}
    }

    if (targetId && targetId !== 'all') {
      inMemoryCache = inMemoryCache.filter((item) => item.id !== targetId);

      const deleteVault = async (url: string, vaultName: string) => {
        try {
          const getRes = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
          if (getRes.ok) {
            const data = await getRes.json();
            if (Array.isArray(data?.data?.responses)) {
              const filtered = data.data.responses.filter((x: { id?: string }) => x.id !== targetId);
              await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: vaultName,
                  data: { responses: filtered },
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

      return res.status(200).json({ success: true, deletedId: targetId });
    } else {
      inMemoryCache = [];

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

      return res.status(200).json({ success: true, count: 0 });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
