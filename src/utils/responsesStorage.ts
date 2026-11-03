// Cross-device, cross-browser response storage service
// Works across iOS Safari, Incognito, Android, Desktop, Vercel, and Cloud instances

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

const CLOUD_VAULT_ID = 'ff808181a09d98f701a19f92695916f5';
const CLOUD_VAULT_URL = `https://api.restful-api.dev/objects/${CLOUD_VAULT_ID}`;
const LOCAL_HISTORY_KEY = 'pumpkin_responses_history';

/**
 * Fetch all responses across all devices & storage layers (Cloud Vault + Local API + LocalStorage)
 */
export async function getAllResponses(): Promise<StoredResponse[]> {
  const map = new Map<string, StoredResponse>();

  // 1. Try fetching from Cloud Vault (Guaranteed cross-device sync for iOS / Safari / Incognito)
  try {
    const cloudRes = await fetch(CLOUD_VAULT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      const cloudList = json?.data?.responses;
      if (Array.isArray(cloudList)) {
        for (const item of cloudList) {
          if (item && item.id) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Cloud vault fetch warning:', err);
  }

  // 2. Try fetching from local/server API
  try {
    const apiRes = await fetch('/api/responses', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
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
    console.warn('Local API fetch warning:', err);
  }

  // 3. Merge from local device history
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
 * Save response to all layers so Fred receives it regardless of device/browser
 */
export async function saveResponse(entry: StoredResponse): Promise<boolean> {
  let savedSomewhere = false;

  // 1. Save to Local Device Storage
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    const updated = [entry, ...current.filter((x: StoredResponse) => x.id !== entry.id)];
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    savedSomewhere = true;
  } catch {}

  // 2. Save directly to Cloud Vault (bypasses any hosting/serverless cold start issues)
  try {
    // Fetch latest cloud list, prepend, and write back
    let cloudList: StoredResponse[] = [];
    const getRes = await fetch(CLOUD_VAULT_URL);
    if (getRes.ok) {
      const data = await getRes.json();
      if (Array.isArray(data?.data?.responses)) {
        cloudList = data.data.responses;
      }
    }
    const updatedCloudList = [entry, ...cloudList.filter((x) => x.id !== entry.id)];

    const putRes = await fetch(CLOUD_VAULT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'fred_pumpkin_responses_vault',
        data: { responses: updatedCloudList },
      }),
    });
    if (putRes.ok) {
      savedSomewhere = true;
    }
  } catch (err) {
    console.warn('Cloud vault save warning:', err);
  }

  // 3. Save to local / Express / Vercel API
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

  // 2. Cloud Vault
  try {
    const getRes = await fetch(CLOUD_VAULT_URL);
    if (getRes.ok) {
      const data = await getRes.json();
      if (Array.isArray(data?.data?.responses)) {
        const filtered = data.data.responses.filter((x: StoredResponse) => x.id !== id);
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
  } catch {}

  // 3. Local API
  try {
    await fetch(`/api/responses?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {}
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

  // 2. Cloud Vault
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

  // 3. Local API
  try {
    await fetch('/api/responses', { method: 'DELETE' });
  } catch {}
}
