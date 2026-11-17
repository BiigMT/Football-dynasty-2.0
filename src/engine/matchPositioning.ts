import type { ClubTactics, Position } from '../types/football';
import type { PitchCoord } from './matchEngine';

type Side = 'HOME' | 'AWAY';

/**
 * Converts a formation slot into a restrained, ball-aware broadcast position.
 * Coordinates remain presentation-only: the authoritative match simulation
 * still owns possession, events and outcomes.
 */
export function getDynamicPlayerTarget(
  formationPoint: PitchCoord,
  ballPosition: PitchCoord,
  side: Side,
  position: Position,
  tactics: ClubTactics,
): PitchCoord {
  const clamp=(value:number)=>Math.max(3,Math.min(97,value));
  const toLocal=(point:PitchCoord):PitchCoord=>side==='HOME'
    ? {x:point.x,y:point.y}
    : {x:100-point.x,y:100-point.y};
  const toWorld=(point:PitchCoord):PitchCoord=>side==='HOME'
    ? point
    : {x:100-point.x,y:100-point.y};

  // Formation points are already expressed in each team's attacking frame.
  const base=formationPoint;
  const ball=toLocal(ballPosition);
  const isKeeper=position==='GK';
  const isDefender=['CB','LB','RB'].includes(position);
  const isMidfielder=['CDM','CM','CAM'].includes(position);
  const lineWeight=isKeeper ? 0.025 : isDefender ? 0.12 : isMidfielder ? 0.23 : 0.31;
  const pressWeight=tactics.pressing==='GEGENPRESS' ? 1.22 : tactics.pressing==='LOW_BLOCK' ? 0.72 : 1;
  const mentalityWeight=tactics.mentality==='DEFENSIVE' ? 0.78 : tactics.mentality==='ALL_OUT' ? 1.18 : tactics.mentality==='ATTACKING' ? 1.08 : 1;

  // Shift the team as a connected block, with less movement from the keeper
  // and back line. This creates believable compactness without teleporting.
  const longitudinalPull=lineWeight*pressWeight*mentalityWeight;
  const desiredX=base.x+(ball.x-50)*longitudinalPull;
  const lateralPull=isKeeper ? 0.035 : isDefender ? 0.11 : isMidfielder ? 0.2 : 0.27;
  const desiredY=base.y+(ball.y-50)*lateralPull;

  // Keep the defensive line from following the ball too far out of shape.
  const x=isDefender?Math.min(82,Math.max(12,desiredX)):desiredX;
  const y=clamp(desiredY);
  return toWorld({x:clamp(x),y});
}
