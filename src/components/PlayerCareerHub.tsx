import React, { Component, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { CareerSave, Fixture } from '../types/football';
import { GameOrientation } from './OrientationSelect';
import { LegendHub } from './LegendHub';
import { NationalTeamHub } from './NationalTeamHub';
import { TrophyRoom } from './TrophyRoom';
import { CareerPyramidPanel } from './CareerPyramidPanel';
import { ClubDirectory } from './ClubDirectory';
import { PlayerCareerShell } from './PlayerCareerShell';
import { CAREER_PYRAMID, getCareerTier, getTierProgressionHint } from '../engine/careerPyramid';

interface Props {
  save: CareerSave;
  orientation: GameOrientation;
  onOrientationChange: (next: GameOrientation) => void;
  muted: boolean;
  onToggleMute: () => void;
  onUpdateSave: (next: CareerSave) => void;
  onLaunchMatch: (fixture: Fixture) => void;
  onExitToTitle: () => void;
}

class PlayerCareerErrorBoundary extends Component<
  { children: ReactNode; onExitToTitle: () => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Player Career screen failed to render:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen w-full bg-[#0B101B] text-white flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-xl border border-red-400/40 bg-[#151E2E] p-6">
            <p className="text-xs font-black tracking-widest text-red-300">PLAYER CAREER ERROR</p>
            <h1 className="mt-2 text-2xl font-black">Your career screen hit a problem</h1>
            <p className="mt-3 text-sm text-slate-300">Your save has not been deleted. Return to the title screen and try loading the career again.</p>
            <p className="mt-3 rounded bg-black/30 p-3 text-xs text-red-200 break-words">{this.state.error.message}</p>
            <button type="button" onClick={this.props.onExitToTitle} className="mt-5 min-h-11 w-full rounded-lg bg-amber-400 px-4 font-black text-slate-950">RETURN TO TITLE SCREEN</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const PlayerCareerHub: React.FC<Props> = (props) => {
  const [overlay, setOverlay] = useState<'NATIONAL' | 'TROPHIES' | 'PYRAMID' | 'CLUBS' | null>(null);
  const legend = props.save.legend;
  const player = legend ? props.save.players[legend.playerId] : undefined;
  const club = props.save.clubs[props.save.userClubId];
  const league = club ? props.save.leagues[club.leagueId] : undefined;

  const missingData = [
    !legend ? 'player career profile' : '',
    !player ? 'player record' : '',
    !club ? 'selected club' : '',
    !league ? 'club league and fixtures' : '',
  ].filter(Boolean);

  if (missingData.length) {
    return (
      <PlayerCareerShell>
        <div className="min-h-[100dvh] w-full bg-[#0B101B] text-white flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-xl border border-amber-400/40 bg-[#151E2E] p-6">
            <p className="text-xs font-black tracking-widest text-amber-300">PLAYER CAREER SAVE CHECK</p>
            <h1 className="mt-2 text-2xl font-black">This career is missing required data</h1>
            <p className="mt-3 text-sm text-slate-300">The save is still intact. The Player Career screen cannot open because it is missing:</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-amber-100">{missingData.map((item) => <li key={item}>{item}</li>)}</ul>
            <button type="button" onClick={props.onExitToTitle} className="mt-5 min-h-11 w-full rounded-lg bg-amber-400 px-4 font-black text-slate-950">RETURN TO TITLE SCREEN</button>
          </div>
        </div>
      </PlayerCareerShell>
    );
  }

  const tier = getCareerTier(club);
  const tierInfo = CAREER_PYRAMID.find((item) => item.tier === tier) ?? CAREER_PYRAMID[3];

  return (
    <PlayerCareerErrorBoundary onExitToTitle={props.onExitToTitle}>
      <PlayerCareerShell>
        <div className="fixed z-30 top-2 right-2 flex gap-2">
          <button type="button" onClick={() => setOverlay('CLUBS')} className="px-3 py-2 rounded bg-[#151E2E] border border-cyan-300/30 text-cyan-200 text-[10px] font-black">CLUB DIRECTORY</button>
          <button type="button" onClick={() => setOverlay('PYRAMID')} className="px-3 py-2 rounded bg-[#151E2E] border border-emerald-300/30 text-emerald-200 text-[10px] font-black">LEAGUE PYRAMID</button>
          <button type="button" onClick={() => setOverlay('NATIONAL')} className="px-3 py-2 rounded bg-[#151E2E] border border-cyan-300/30 text-cyan-200 text-[10px] font-black">NATIONAL TEAM</button>
          <button type="button" onClick={() => setOverlay('TROPHIES')} className="px-3 py-2 rounded bg-[#151E2E] border border-amber-300/30 text-amber-200 text-[10px] font-black">TROPHY ROOM</button>
        </div>
        <span className="sr-only">{tierInfo.name} · {getTierProgressionHint(tier)} · Age {player?.age || 17}</span>
        <LegendHub {...props} />
        {overlay === 'CLUBS' && <ClubDirectory save={props.save} onClose={() => setOverlay(null)} />}
        {overlay === 'PYRAMID' && <CareerPyramidPanel save={props.save} onClose={() => setOverlay(null)} />}
        {overlay === 'NATIONAL' && <NationalTeamHub save={props.save} onClose={() => setOverlay(null)} />}
        {overlay === 'TROPHIES' && <TrophyRoom save={props.save} onClose={() => setOverlay(null)} />}
      </PlayerCareerShell>
    </PlayerCareerErrorBoundary>
  );
};

export default PlayerCareerHub;
