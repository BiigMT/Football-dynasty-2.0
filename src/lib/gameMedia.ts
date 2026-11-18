import { useEffect, useSyncExternalStore } from 'react';

type GameMediaType = 'player' | 'club';
type MediaRow = { entity_type: GameMediaType; entity_id: string; storage_path: string };
const media = new Map<string, string>();
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;
const keyFor = (type: GameMediaType, id: string) => `${type}:${id}`;

export function getGameMediaUrl(type: GameMediaType, id?: string): string | null {
  return id ? media.get(keyFor(type, id)) ?? null : null;
}
export function subscribeGameMedia(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function notify() { listeners.forEach((listener) => listener()); }

export function loadGameMedia(): Promise<void> {
  if (loadPromise) return loadPromise;
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) return Promise.resolve();
  loadPromise = fetch(`${url}/rest/v1/game_media?select=entity_type,entity_id,storage_path`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Photo manifest request failed (${response.status})`);
    const rows = await response.json() as MediaRow[];
    for (const row of rows) {
      if (!row.entity_id || !row.storage_path) continue;
      const bucket = row.entity_type === 'player' ? 'player-photos' : row.entity_type === 'club' ? 'club-photos' : null;
      if (!bucket) continue;
      const path = row.storage_path.split('/').map(encodeURIComponent).join('/');
      media.set(keyFor(row.entity_type, row.entity_id), `${url}/storage/v1/object/public/${bucket}/${path}`);
    }
    notify();
  }).catch((error) => {
    console.warn('[Football Dynasty] Photo sync unavailable; using built-in artwork.', error);
  });
  return loadPromise;
}
export function useGameMedia(type: GameMediaType, id?: string): string | null {
  const imageUrl = useSyncExternalStore(subscribeGameMedia, () => getGameMediaUrl(type, id), () => null);
  useEffect(() => { void loadGameMedia(); }, []);
  return imageUrl;
}
