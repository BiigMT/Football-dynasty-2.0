import React, { useState } from 'react';
import { MatchCenter } from './MatchCenter';
import { MatchSession, Player, Club } from '../types/football';

export type PlayerMatchModeProps = React.ComponentProps<typeof MatchCenter>;

/**
 * Dedicated Become-a-Legend matchday entry. The live match engine remains shared
 * with Manager Mode, while player sessions retain player objectives, ratings,
 * key-moment decisions and player-specific match state.
 */
export const PlayerMatchMode: React.FC<PlayerMatchModeProps> = (props) => {
  const [briefingAccepted, setBriefingAccepted] = useState(props.initialSession.phase !== 'PRE_MATCH');
  const session: MatchSession = props.initialSession;
  const user = session.userPlayerId ? props.players[session.userPlayerId] : undefined;
  const home = props.clubs[session.homeClubId];
  const away = props.clubs[session.awayClubId];
  if (briefingAccepted) return <div className="fd-player-match-mode min-h-[100dvh] bg-[#07111d]"><MatchCenter {...props}/></div>;
  return <div className="fd-player-match-mode fixed inset-0 z-[80] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#07111d] p-3 text-white" style={{paddingTop:'max(16px,env(safe-area-inset-top))',paddingBottom:'max(16px,env(safe-area-inset-bottom))'}}>
    <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#F6C21C]/30 bg-[#101b29] shadow-2xl">
      <div className="bg-gradient-to-r from-[#13386C] via-[#235BA8] to-[#13386C] px-4 py-4 sm:px-7">
        <div className="text-[9px] font-black tracking-[.3em] text-amber-200">FOOTBALL DYNASTY · BECOME A LEGEND</div>
        <h1 className="mt-1 text-2xl font-black sm:text-4xl">MATCHDAY</h1>
        <p className="mt-1 text-xs text-blue-100">{session.competitionName} · Season fixture {session.minute ? 'in progress' : 'pre-match briefing'}</p>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-7 sm:px-8">
        <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/20 text-lg font-black">{home?.shortName??'HOM'}</div><div className="mt-2 text-sm font-black sm:text-lg">{home?.name??'Home'}</div><div className="text-[9px] uppercase tracking-widest text-slate-500">Home</div></div>
        <div className="text-center"><div className="text-2xl font-black text-amber-300">VS</div><div className="mt-1 text-[9px] font-bold tracking-widest text-slate-500">KICK-OFF</div></div>
        <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/20 text-lg font-black">{away?.shortName??'AWY'}</div><div className="mt-2 text-sm font-black sm:text-lg">{away?.name??'Away'}</div><div className="text-[9px] uppercase tracking-widest text-slate-500">Away</div></div>
      </div>
      <div className="mx-4 grid gap-3 border-t border-white/10 py-4 sm:mx-8 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-amber-300/20 bg-black/20 p-3">
          <div className="text-[9px] font-black tracking-widest text-amber-300">YOUR PLAYER</div>
          <div className="mt-1 text-lg font-black">{user?.name??'Player Career'}</div>
          <div className="text-xs text-slate-400">{user?user.position+' · '+user.overall+' OVR · '+user.playingStyle:'Player objectives and performance tracking active'}</div>
          <div className="mt-2 flex gap-3 text-xs"><span>Fitness <b className="text-emerald-300">{user?.fitness??'—'}</b></span><span>Form <b className="text-amber-300">{user?.form??'—'}</b></span></div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-[9px] font-black tracking-widest text-sky-300">MATCH OBJECTIVES</div>
          <div className="mt-2 space-y-2">{session.userObjectives.map((objective) => <div key={objective.id} className="flex items-center justify-between gap-2 text-xs"><span className="text-slate-300">{objective.label}</span><b className={objective.completed?'text-emerald-300':'text-white'}>{objective.current}/{objective.target}</b></div>)}</div>
        </div>
      </div>
      <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 sm:mx-8 sm:mb-7"><p className="max-w-xl text-[10px] leading-relaxed text-slate-500">Your performance, match rating, objectives and key-moment decisions will influence manager trust, development and selection. The live 2D match engine is shared with the game's tactical simulation.</p><button onClick={()=>setBriefingAccepted(true)} className="min-h-12 rounded-lg bg-gradient-to-r from-[#F6C21C] to-[#dca90e] px-7 text-xs font-black tracking-widest text-[#101722]">ENTER MATCHDAY →</button></div>
    </div>
  </div>;
};
export default PlayerMatchMode;
