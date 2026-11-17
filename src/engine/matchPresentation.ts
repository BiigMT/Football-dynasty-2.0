import type { MatchEvent, MatchSession, Player } from '../types/football';
import type { PitchCoord } from './matchEngine';

export interface MatchPresentationCue {
  actorTarget?: PitchCoord;
  ballFlight?: { from: PitchCoord; to: PitchCoord; durationMs: number; arc: number };
}

/** Presentation-only choreography. It never mutates or feeds back into match simulation. */
export function getMatchPresentationCue(
  event: MatchEvent,
  session: MatchSession,
  players: Record<string, Player>,
  homeFormation: PitchCoord[],
  awayFormation: PitchCoord[],
): MatchPresentationCue {
  const side = event.teamSide === 'AWAY' ? 'AWAY' : 'HOME';
  const formation = side === 'HOME' ? homeFormation : awayFormation;
  const state = event.playerId ? session.playerStates[event.playerId] : undefined;
  const slot = state?.slotIndex ?? -1;
  const base = slot >= 0 ? formation[Math.min(10, slot)] : undefined;
  const origin = { ...session.ballPos };
  const attackDirection = side === 'HOME' ? 1 : -1;
  const clamp = (n: number) => Math.max(2, Math.min(98, n));
  const actor = event.playerId ? players[event.playerId] : undefined;
  const lateral = actor ? ((actor.shirtNumber % 3) - 1) * 5 : 0;
  const actorTarget = base ? {
    x: clamp((side === 'HOME' ? base.x : 100 - base.x) * .35 + origin.x * .65),
    y: clamp((side === 'HOME' ? base.y : 100 - base.y) * .35 + origin.y * .65),
  } : undefined;

  if (event.type === 'PASS') {
    const to = { x: clamp(origin.x + attackDirection * 9), y: clamp(origin.y + lateral) };
    return { actorTarget, ballFlight: { from: origin, to, durationMs: 520, arc: 1.1 } };
  }
  if (event.type === 'SHOT') {
    const to = { x: side === 'HOME' ? 97 : 3, y: clamp(origin.y + lateral * .45) };
    return { actorTarget, ballFlight: { from: origin, to, durationMs: 760, arc: 3.4 } };
  }
  if (event.type === 'SAVE') {
    const keeperSide = event.teamSide === 'HOME' ? 'AWAY' : 'HOME';
    const keeperFormation = keeperSide === 'HOME' ? homeFormation : awayFormation;
    const keeper = keeperFormation[0] ?? { x: 6, y: 50 };
    const target = { x: keeperSide === 'HOME' ? keeper.x : 100 - keeper.x, y: keeperSide === 'HOME' ? keeper.y : 100 - keeper.y };
    return { actorTarget: target, ballFlight: { from: origin, to: { x: clamp(origin.x + attackDirection * 5), y: clamp(origin.y + lateral * .25) }, durationMs: 640, arc: .65 } };
  }
  if (event.type === 'TACKLE') {
    return { actorTarget: { x: clamp(origin.x - attackDirection * 1.5), y: clamp(origin.y + lateral * .35) } };
  }
  if (event.type === 'GOAL') {
    return { actorTarget: { x: clamp(origin.x + attackDirection * 2), y: clamp(origin.y) } };
  }
  return { actorTarget };
}
