import type { Club, Player, Position } from '../types/football';
import { getFormationSlots } from './database';

function positionFit(player: Player, slot: Position): number {
  if (player.position === slot) return 18;
  if (player.secondaryPositions.includes(slot)) return 11;
  return 0;
}

function selectionScore(player: Player, currentStarters: Set<string>): number {
  const roleBonus = player.squadRole === 'CRUCIAL' ? 2.5
    : player.squadRole === 'IMPORTANT' ? 1.5
    : player.squadRole === 'PROSPECT' ? -0.5 : 0;
  const fatiguePenalty = player.fitness < 55 ? 8 : player.fitness < 68 ? 4 : 0;
  return player.overall * 0.58
    + player.form * 0.14
    + player.fitness * 0.16
    + player.sharpness * 0.07
    + player.morale * 0.05
    + roleBonus
    + (currentStarters.has(player.id) ? 1.25 : 0)
    - fatiguePenalty;
}

/**
 * Builds an AI-controlled matchday XI and bench from the club's eligible squad.
 * The user's Manager Career club is protected by the caller; this function is
 * deterministic so the same save always produces the same selection.
 */
export function selectAiMatchdaySquad(club: Club, players: Record<string, Player>): Club {
  const roster = Object.values(players).filter((player) => player.clubId === club.id);
  const eligible = roster.filter((player) => player.injuredWeeks <= 0 && player.suspendedMatches <= 0);
  if (eligible.length < 11) return club;

  const slots = getFormationSlots(club.tactics.formation);
  const currentStarters = new Set(club.tactics.startingXI);
  const remaining = new Map(eligible.map((player) => [player.id, player]));
  const startingXI: string[] = [];

  slots.forEach((slot) => {
    const candidates = [...remaining.values()].sort((a, b) => {
      const fitDifference = positionFit(b, slot) - positionFit(a, slot);
      if (fitDifference !== 0) return fitDifference;
      const scoreDifference = selectionScore(b, currentStarters) - selectionScore(a, currentStarters);
      return scoreDifference || a.id.localeCompare(b.id);
    });
    const selected = candidates[0];
    if (selected) {
      startingXI.push(selected.id);
      remaining.delete(selected.id);
    }
  });

  if (startingXI.length !== 11) return club;

  const bench = [...remaining.values()]
    .sort((a, b) => selectionScore(b, currentStarters) - selectionScore(a, currentStarters) || a.id.localeCompare(b.id))
    .slice(0, 7)
    .map((player) => player.id);
  const captainId = startingXI.includes(club.tactics.captainId)
    ? club.tactics.captainId
    : startingXI
        .map((id) => players[id])
        .filter((player) => player && player.position !== 'GK')
        .sort((a, b) => selectionScore(b, currentStarters) - selectionScore(a, currentStarters) || a.id.localeCompare(b.id))[0]?.id
      ?? startingXI[0];

  return {
    ...club,
    tactics: {
      ...club.tactics,
      startingXI,
      bench,
      captainId,
    },
  };
}

export function shouldRotateAiClub(mode: 'MANAGER' | 'PLAYER', userClubId: string, clubId: string): boolean {
  return mode === 'PLAYER' || clubId !== userClubId;
}
