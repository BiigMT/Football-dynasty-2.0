import { CareerSave } from '../types/football';

const STORAGE_KEY_PREFIX = 'football_dynasty_save_slot_';
const DB_NAME = 'football-dynasty-storage';
const STORE_NAME = 'career-saves';
export const SAVE_SLOTS = ['slot_1', 'slot_2', 'slot_3', 'slot_4'] as const;

export interface SaveSlotSummary {
  slotId: string;
  empty: boolean;
  mode?: CareerSave['mode'];
  title?: string;
  subtitle?: string;
  season?: number;
  week?: number;
  updatedAt?: number;
  hasHalfTimeMatch?: boolean;
}

function openSaveDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This device does not support the larger save storage.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open save storage.'));
    request.onblocked = () => reject(new Error('Save storage is busy. Close other game tabs and try again.'));
  });
}

async function readStoredSave(slotId: string): Promise<CareerSave | null> {
  const db = await openSaveDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(slotId);
      request.onsuccess = () => resolve((request.result as CareerSave | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error('Could not read career save.'));
    });
  } finally {
    db.close();
  }
}

export async function saveCareer(save: CareerSave): Promise<void> {
  const payload = { ...save, updatedAt: Date.now() };
  try {
    const db = await openSaveDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(payload, save.slotId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('Save transaction failed.'));
        tx.onabort = () => reject(tx.error ?? new Error('Save transaction was interrupted.'));
      });
    } finally {
      db.close();
    }
  } catch (error) {
    // Keep existing browser saves working if IndexedDB is unavailable.
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${save.slotId}`, JSON.stringify(payload));
    } catch {
      throw error instanceof Error ? error : new Error('Unable to save your career on this device.');
    }
  }
}

export async function loadCareer(slotId: string): Promise<CareerSave | null> {
  try {
    const stored = await readStoredSave(slotId);
    if (stored) return stored;
  } catch (error) {
    console.warn('IndexedDB save read unavailable; checking legacy save.', error);
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slotId}`);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as CareerSave;
    // Migrate without removing the original until the new copy is confirmed.
    try {
      await saveCareer(legacy);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slotId}`);
    } catch (error) {
      console.warn('Legacy save migration deferred.', error);
    }
    return legacy;
  } catch {
    return null;
  }
}

export async function deleteCareer(slotId: string): Promise<void> {
  try {
    const db = await openSaveDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(slotId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('Could not delete save.'));
      });
    } finally {
      db.close();
    }
  } finally {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slotId}`);
  }
}

export async function listSaveSlots(): Promise<SaveSlotSummary[]> {
  return Promise.all(SAVE_SLOTS.map(async (slotId) => {
    const data = await loadCareer(slotId);
    if (!data) return { slotId, empty: true };
    const club = data.clubs?.[data.userClubId];
    if (data.mode === 'MANAGER' && data.manager) {
      return {
        slotId, empty: false, mode: 'MANAGER',
        title: `${data.manager.name} · ${club?.name ?? 'Club'}`,
        subtitle: `Master League · ${data.manager.trophies.length} Trophies`,
        season: data.season, week: data.currentWeek, updatedAt: data.updatedAt,
        hasHalfTimeMatch: data.activeMatch?.phase === 'HALF_TIME',
      };
    }
    const uPlayer = data.legend ? data.players?.[data.legend.playerId] : undefined;
    return {
      slotId, empty: false, mode: 'PLAYER',
      title: `${uPlayer?.name ?? 'Legend'} (${uPlayer?.overall ?? 70} OVR)`,
      subtitle: `Become a Legend · ${club?.name ?? 'Club'}`,
      season: data.season, week: data.currentWeek, updatedAt: data.updatedAt,
      hasHalfTimeMatch: data.activeMatch?.phase === 'HALF_TIME',
    };
  }));
}
