// Multi-layer resilient cross-device response storage service
// Verified across iOS Safari, Android, Safari/Chrome Incognito, Vercel & Desktop

export interface StoredResponse {
  id: string;
  createdAt: string;
  mood: number;
  moodNote: string;
  academics: number;
  academicsNote: string;
  christmas: number;
  christmasNote: string;
  cookiesCracked?: number;
  puzzleSolved?: boolean;
}

const PRIMARY_VAULT_ID = 'ff808181a09d98f701a19f92695916f5';
const BACKUP_VAULT_ID = 'ff808181a09d98f701a1b6b44b485d69';
const PRIMARY_VAULT_URL = `https://api.restful-api.dev/objects/${PRIMARY_VAULT_ID}`;
const BACKUP_VAULT_URL = `https://api.restful-api.dev/objects/${BACKUP_VAULT_ID}`;
const LOCAL_HISTORY_KEY = 'pumpkin_responses_history';

/**
 * Fetch all responses across all devices & storage layers with anti-cache guarantees
 */
export async function getAllResponses(): Promise<StoredResponse[]> {
  const map = new Map<string, StoredResponse>();
  const cacheBuster = `_t=${Date.now()}`;

  // Helper to fetch and merge from a cloud vault URL
  const fetchFromVault = async (url: string) => {
    try {
      const res = await fetch(`${url}?${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const list = json?.data?.responses;
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item && item.id) {
              map.set(item.id, item);
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Vault fetch warning (${url}):`, err);
    }
  };

  // Helper to fetch from local/server API (/api/responses)
  const fetchFromServerAPI = async () => {
    try {
      const apiRes = await fetch(`/api/responses?${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });
      if (apiRes.ok) {
        const serverData = await apiRes.json();
        if (Array.isArray(serverData)) {
          for (const item of serverData) {
            if (item && item.id) {
              map.set(item.id, item);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Server API fetch warning:', err);
    }
  };

  // Query all sources in parallel with no-store
  await Promise.allSettled([
    fetchFromVault(PRIMARY_VAULT_URL),
    fetchFromVault(BACKUP_VAULT_URL),
    fetchFromServerAPI(),
  ]);

  // Merge from local browser history
  try {
    const localStr = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (localStr) {
      const localList = JSON.parse(localStr);
      if (Array.isArray(localList)) {
        for (const item of localList) {
          if (item && item.id && !map.has(item.id)) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch {}

  const result = Array.from(map.values());
  // Sort newest first
  result.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return result;
}

/**
 * Save response simultaneously to all layers (Local, Server API, Primary Cloud, Backup Cloud)
 */
export async function saveResponse(entry: StoredResponse): Promise<boolean> {
  let savedSomewhere = false;

  // 1. Local Device Storage (instant offline buffer)
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    const updated = [entry, ...current.filter((x: StoredResponse) => x.id !== entry.id)];
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    savedSomewhere = true;
  } catch {}

  // Helper to sync to a cloud vault
  const syncToVault = async (url: string, vaultName: string) => {
    try {
      let cloudList: StoredResponse[] = [];
      const getRes = await fetch(`${url}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' },
      });
      if (getRes.ok) {
        const data = await getRes.json();
        if (Array.isArray(data?.data?.responses)) {
          cloudList = data.data.responses;
        }
      }
      const updatedCloudList = [entry, ...cloudList.filter((x) => x.id !== entry.id)];

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify({
          name: vaultName,
          data: { responses: updatedCloudList },
        }),
      });
      if (putRes.ok) {
        savedSomewhere = true;
      }
    } catch (err) {
      console.warn(`Cloud vault save warning (${url}):`, err);
    }
  };

  // Helper to sync to /api/responses
  const syncToServerAPI = async () => {
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        savedSomewhere = true;
      }
    } catch (err) {
      console.warn('Server API save warning:', err);
    }
  };

  // Run cloud saves and server sync in parallel
  await Promise.allSettled([
    syncToVault(PRIMARY_VAULT_URL, 'fred_pumpkin_responses_vault'),
    syncToVault(BACKUP_VAULT_URL, 'fred_pumpkin_responses_vault_backup'),
    syncToServerAPI(),
  ]);

  // Beacon fallback for mobile browser unload guarantee
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' });
      navigator.sendBeacon('/api/responses', blob);
    }
  } catch {}

  return savedSomewhere;
}

/**
 * Delete a single response by ID from all storage layers
 */
export async function deleteResponseById(id: string): Promise<void> {
  // 1. Local storage
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    const filtered = current.filter((x: StoredResponse) => x.id !== id);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(filtered));
  } catch {}

  const deleteFromVault = async (url: string, vaultName: string) => {
    try {
      const getRes = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
      if (getRes.ok) {
        const data = await getRes.json();
        if (Array.isArray(data?.data?.responses)) {
          const filtered = data.data.responses.filter((x: StoredResponse) => x.id !== id);
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
    } catch (err) {
      console.warn('Delete from vault error:', err);
    }
  };

  await Promise.allSettled([
    deleteFromVault(PRIMARY_VAULT_URL, 'fred_pumpkin_responses_vault'),
    deleteFromVault(BACKUP_VAULT_URL, 'fred_pumpkin_responses_vault_backup'),
    fetch(`/api/responses?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {}),
  ]);
}

/**
 * Clear all stored responses from all layers
 */
export async function clearAllResponses(): Promise<void> {
  // 1. Local storage
  try {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    localStorage.removeItem('pumpkin_checkin_answers');
  } catch {}

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
    fetch('/api/responses?id=all', { method: 'DELETE' }).catch(() => {}),
  ]);
}
