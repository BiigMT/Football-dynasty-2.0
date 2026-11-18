import React from 'react';

export type GameMediaEntityType = 'player' | 'club';

const SUPABASE_URL = 'https://vdpnmhqvnjskevlikqax.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w6FuTEPQNVJdSZYKqv9Low_r20RsxlR';
const requests = new Map<string, Promise<string | null>>();

async function requestGameMedia(type: GameMediaEntityType, id: string, name: string): Promise<string | null> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-game-media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ entity_type: type, entity_id: id, entity_name: name }),
  });
  if (!response.ok) return null;
  const result = await response.json();
  return typeof result.image_url === 'string' && (result.status === 'uploaded' || result.status === 'cached')
    ? result.image_url
    : null;
}

/** Looks up a licensed Commons image once, caches it in Supabase Storage, then reuses it. */
export function useGameMediaImage(type: GameMediaEntityType, id?: string, name?: string): string | null {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!id || !name) { setImageUrl(null); return; }
    let active = true;
    const key = `${type}:${id}`;
    let request = requests.get(key);
    if (!request) {
      request = requestGameMedia(type, id, name).catch(() => null);
      requests.set(key, request);
    }
    request.then((url) => { if (active) setImageUrl(url); });
    return () => { active = false; };
  }, [type, id, name]);
  return imageUrl;
}
