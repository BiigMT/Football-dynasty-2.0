import { CareerSave } from '../types/football';

const STORAGE_KEY_PREFIX = 'football_dynasty_save_slot_';
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

export function saveCareer(save: CareerSave): void {
  try {
    const payload = JSON.stringify({ ...save, updatedAt: Date.now() });
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${save.slotId}`, payload);
  } catch (err) {
    console.error('Failed to persist career save:', err);
  }
}

export function loadCareer(slotId: string): CareerSave | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slotId}`);
    if (!raw) return null;
    return JSON.parse(raw) as CareerSave;
  } catch {
    return null;
  }
}

export function deleteCareer(slotId: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slotId}`);
}

export function listSaveSlots(): SaveSlotSummary[] {
  return SAVE_SLOTS.map((slotId) => {
    const data = loadCareer(slotId);
    if (!data) {
      return { slotId, empty: true };
    }
    const club = data.clubs[data.userClubId];
    if (data.mode === 'MANAGER' && data.manager) {
      return {
        slotId,
        empty: false,
        mode: 'MANAGER',
        title: `${data.manager.name} · ${club?.name ?? 'Club'}`,
        subtitle: `Master League · ${data.manager.trophies.length} Trophies`,
        season: data.season,
        week: data.currentWeek,
        updatedAt: data.updatedAt,
        hasHalfTimeMatch: data.activeMatch?.phase === 'HALF_TIME',
      };
    }
    const uPlayer = data.legend ? data.players[data.legend.playerId] : undefined;
    return {
      slotId,
      empty: false,
      mode: 'PLAYER',
      title: `${uPlayer?.name ?? 'Legend'} (${uPlayer?.overall ?? 70} OVR)`,
      subtitle: `Become a Legend · ${club?.name ?? 'Club'}`,
      season: data.season,
      week: data.currentWeek,
      updatedAt: data.updatedAt,
      hasHalfTimeMatch: data.activeMatch?.phase === 'HALF_TIME',
    };
  });
}
