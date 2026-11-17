import type { MatchEvent, MatchSession, Player } from '../types/football';
import type { PitchCoord } from './matchEngine';

export interface MatchPresentationCue {
  actorTarget?: PitchCoord;
  targetPlayerId?: string;
  targetPlayerTarget?: PitchCoord;
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
    const to = { x: clamp(origin.x), y: clamp(origin.y) };
    const from = { x: clamp(origin.x - attackDirection * 9), y: clamp(origin.y - lateral * .6) };
    const receiver = Object.values(session.playerStates)
      .filter(st => st.side === side && st.onPitch && !st.redCard && st.playerId !== event.playerId)
      .map(st => {
        const point=formation[Math.max(0,Math.min(10,st.slotIndex))]??{x:50,y:50};
        const world={x:side==='HOME'?point.x:100-point.x,y:side==='HOME'?point.y:100-point.y};
        return {id:st.playerId,point:world,distance:Math.hypot(world.x-to.x,world.y-to.y)};
      })
      .sort((a,b)=>a.distance-b.distance)[0];
    return { actorTarget, targetPlayerId:receiver?.id, targetPlayerTarget:receiver?.point, ballFlight: { from, to, durationMs: 520, arc: 1.1 } };
  }
  if (event.type === 'SHOT') {
    const to = { x: clamp(origin.x), y: clamp(origin.y + lateral * .45) };
    const from = { x: side === 'HOME' ? Math.min(83,to.x-8) : Math.max(17,to.x+8), y: clamp(origin.y) };
    return { actorTarget, ballFlight: { from, to, durationMs: 760, arc: 3.4 } };
  }
  if (event.type === 'SAVE') {
    const keeperFormation = side === 'HOME' ? homeFormation : awayFormation;
    const keeper = keeperFormation[0] ?? { x: 6, y: 50 };
    const target = { x: side === 'HOME' ? keeper.x : 100 - keeper.x, y: side === 'HOME' ? keeper.y : 100 - keeper.y };
    const keeperId = event.playerId ?? (side === 'HOME' ? session.homeTactics.startingXI[0] : session.awayTactics.startingXI[0]);
    return { actorTarget: target, targetPlayerId: keeperId, targetPlayerTarget: target, ballFlight: { from: origin, to: { x: clamp(origin.x + attackDirection * 5), y: clamp(origin.y + lateral * .25) }, durationMs: 640, arc: .65 } };
  }
  if (event.type === 'TACKLE') {
    return { actorTarget: { x: clamp(origin.x - attackDirection * 1.5), y: clamp(origin.y + lateral * .35) } };
  }
  if (event.type === 'GOAL') {
    return { actorTarget: { x: clamp(origin.x + attackDirection * 2), y: clamp(origin.y) } };
  }
  return { actorTarget };
}
