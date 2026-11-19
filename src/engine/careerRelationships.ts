import { CareerSave } from '../types/football';

export type TeammateInteraction = 'PRAISE' | 'ENCOURAGE' | 'CHALLENGE' | 'RECONCILE';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

/** Resolve a Player Career dressing-room interaction without mutating the input save. */
export function resolveTeammateInteraction(
  save: CareerSave,
  teammateId: string,
  interaction: TeammateInteraction,
): CareerSave {
  if (save.mode !== 'PLAYER' || !save.legend) return save;
  const player = save.players[save.legend.playerId];
  const teammate = save.players[teammateId];
  if (!player || !teammate || player.id === teammate.id || player.clubId !== teammate.clubId) return save;

  const key = [player.id, teammate.id].sort().join(':');
  const current = save.playerRelationships?.[key] ?? 50;
  const delta: Record<TeammateInteraction, number> = {
    PRAISE: teammate.form >= player.form ? 5 : 2,
    ENCOURAGE: teammate.morale < 60 ? 7 : 3,
    CHALLENGE: teammate.form < 45 ? -2 : 2,
    RECONCILE: 8,
  };
  const nextRelationship = clamp(current + delta[interaction]);
  const nextPlayers = {
    ...save.players,
    [teammate.id]: {
      ...teammate,
      morale: clamp(teammate.morale + (interaction === 'ENCOURAGE' ? 3 : interaction === 'PRAISE' ? 2 : 0)),
      confidence: clamp(teammate.confidence + (interaction === 'ENCOURAGE' ? 2 : 1)),
    },
  };
  const messages = [
    ...(save.legend.phoneMessages ?? []),
    {
      id: `team-talk-${save.season}-${save.currentWeek}-${key}-${interaction}`,
      teammateId,
      teammateName: teammate.name,
      from: 'PLAYER' as const,
      text: interaction === 'PRAISE' ? 'Good performance. Keep that level up.' :
        interaction === 'ENCOURAGE' ? 'Keep your head up. We are in this together.' :
        interaction === 'CHALLENGE' ? 'I know you can give the team more.' :
        'Let’s put this behind us and focus on the team.',
      week: save.currentWeek,
      season: save.season,
    },
  ].slice(-40);
  return {
    ...save,
    players: nextPlayers,
    playerRelationships: { ...(save.playerRelationships ?? {}), [key]: nextRelationship },
    legend: { ...save.legend, phoneMessages: messages },
  };
}

export function getTeammateRelationship(save: CareerSave, teammateId: string): number {
  if (!save.legend) return 0;
  const key = [save.legend.playerId, teammateId].sort().join(':');
  return clamp(save.playerRelationships?.[key] ?? 50);
}
