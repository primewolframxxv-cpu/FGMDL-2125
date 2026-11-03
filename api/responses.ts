// Serverless handler for Vercel deployment with Cloud Sync
const CLOUD_VAULT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a19f92695916f5';
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    try {
      const cloudRes = await fetch(CLOUD_VAULT_URL);
      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (Array.isArray(cloudData?.data?.responses)) {
          return res.status(200).json(cloudData.data.responses);
        }
      }
    } catch {}
    return res.status(200).json(inMemoryCache);
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

    inMemoryCache.unshift(newRecord);

    // Sync to Cloud Vault
    try {
      const getRes = await fetch(CLOUD_VAULT_URL);
      let list: Record<string, unknown>[] = [];
      if (getRes.ok) {
        const data = await getRes.json();
        if (Array.isArray(data?.data?.responses)) {
          list = data.data.responses;
        }
      }
      const updated = [newRecord, ...list.filter((x) => x.id !== newRecord.id)];
      await fetch(CLOUD_VAULT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'fred_pumpkin_responses_vault',
          data: { responses: updated },
        }),
      });
      return res.status(200).json({ success: true, count: updated.length, record: newRecord });
    } catch {
      return res.status(200).json({ success: true, count: inMemoryCache.length, record: newRecord });
    }
  }

  if (req.method === 'DELETE') {
    let targetId = req.query?.id as string | undefined;
    if (!targetId && req.body) {
      try {
        const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        targetId = parsed?.id;
      } catch {}
    }

    try {
      if (targetId && targetId !== 'all') {
        inMemoryCache = inMemoryCache.filter((item) => item.id !== targetId);
        const getRes = await fetch(CLOUD_VAULT_URL);
        if (getRes.ok) {
          const data = await getRes.json();
          if (Array.isArray(data?.data?.responses)) {
            const filtered = data.data.responses.filter((x: { id?: string }) => x.id !== targetId);
            await fetch(CLOUD_VAULT_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'fred_pumpkin_responses_vault',
                data: { responses: filtered },
              }),
            });
          }
        }
        return res.status(200).json({ success: true, deletedId: targetId });
      } else {
        inMemoryCache = [];
        await fetch(CLOUD_VAULT_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'fred_pumpkin_responses_vault',
            data: { responses: [] },
          }),
        });
        return res.status(200).json({ success: true, count: 0 });
      }
    } catch {
      return res.status(200).json({ success: true, count: inMemoryCache.length });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
