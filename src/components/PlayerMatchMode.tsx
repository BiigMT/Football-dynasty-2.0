import React, { useState } from 'react';
import { MatchCenter } from './MatchCenter';
import { MatchSession } from '../types/football';
import { startMatchKickoff } from '../engine/matchEngine';
import { soundEngine } from '../engine/audio';

export type PlayerMatchModeProps = React.ComponentProps<typeof MatchCenter>;

/**
 * Dedicated Player Career matchday entry. The briefing is deliberately a
 * single-viewport landscape layout: the primary action never sits below the
 * fold and the page never depends on scrolling to start a fixture.
 */
export const PlayerMatchMode: React.FC<PlayerMatchModeProps> = (props) => {
  const [briefingAccepted, setBriefingAccepted] = useState(props.initialSession.phase !== 'PRE_MATCH');
  const [matchSession, setMatchSession] = useState<MatchSession>(props.initialSession);
  const session = matchSession;
  const user = session.userPlayerId ? props.players[session.userPlayerId] : undefined;
  const home = props.clubs[session.homeClubId];
  const away = props.clubs[session.awayClubId];

  if (briefingAccepted) {
    return <div className="fd-player-match-mode min-h-[100dvh] bg-[#07111d]"><MatchCenter {...props} initialSession={matchSession}/></div>;
  }

  const startLiveMatch = () => {
    if (session.phase !== 'PRE_MATCH') {
      setBriefingAccepted(true);
      return;
    }
    soundEngine.playWhistle('KICKOFF');
    setMatchSession((current) => current.phase === 'PRE_MATCH' ? startMatchKickoff(current) : current);
    setBriefingAccepted(true);
  };

  return (
    <main
      className="fd-player-match-mode fixed inset-0 z-[80] box-border flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#07111d] p-2 text-white sm:p-3"
      style={{ paddingTop: 'max(8px, env(safe-area-inset-top))', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <section className="flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#F6C21C]/30 bg-[#101b29] shadow-2xl">
        <header className="shrink-0 bg-gradient-to-r from-[#13386C] via-[#235BA8] to-[#13386C] px-4 py-2 sm:px-6">
          <div className="text-[8px] font-black tracking-[.24em] text-amber-200">FOOTBALL DYNASTY · BECOME A LEGEND</div>
          <div className="flex items-end justify-between gap-3">
            <h1 className="text-xl font-black leading-tight sm:text-2xl">MATCHDAY</h1>
            <p className="pb-0.5 text-[9px] text-blue-100 sm:text-[10px]">{session.competitionName} · SEASON FIXTURE</p>
          </div>
        </header>

        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/10 px-3 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-sm font-black sm:h-12 sm:w-12 sm:text-base">{home?.shortName ?? 'HOM'}</div>
            <div className="mt-1 truncate text-xs font-black sm:text-base">{home?.name ?? 'Home'}</div>
            <div className="text-[8px] uppercase tracking-widest text-slate-500">HOME</div>
          </div>
          <div className="px-2 text-center">
            <div className="text-xl font-black text-amber-300 sm:text-2xl">VS</div>
            <div className="text-[8px] font-bold tracking-widest text-slate-500">KICK-OFF</div>
          </div>
          <div className="min-w-0 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-sm font-black sm:h-12 sm:w-12 sm:text-base">{away?.shortName ?? 'AWY'}</div>
            <div className="mt-1 truncate text-xs font-black sm:text-base">{away?.name ?? 'Away'}</div>
            <div className="text-[8px] uppercase tracking-widest text-slate-500">AWAY</div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
          <article className="flex min-h-0 flex-col justify-center rounded-lg border border-amber-300/20 bg-black/20 p-2.5 sm:p-3">
            <div className="text-[8px] font-black tracking-widest text-amber-300 sm:text-[9px]">YOUR PLAYER</div>
            <div className="mt-1 truncate text-base font-black sm:text-lg">{user?.name ?? 'Player Career'}</div>
            <div className="truncate text-[10px] text-slate-400 sm:text-xs">{user ? user.position + ' · ' + user.overall + ' OVR · ' + user.playingStyle : 'Player objectives and performance tracking active'}</div>
            <div className="mt-2 flex flex-wrap gap-x-3 text-[10px] sm:text-xs">
              <span>Fitness <b className="text-emerald-300">{user?.fitness ?? '—'}</b></span>
              <span>Form <b className="text-amber-300">{user?.form ?? '—'}</b></span>
            </div>
          </article>

          <article className="flex min-h-0 flex-col justify-center rounded-lg border border-white/10 bg-black/20 p-2.5 sm:p-3">
            <div className="text-[8px] font-black tracking-widest text-sky-300 sm:text-[9px]">MATCH OBJECTIVES</div>
            <div className="mt-1.5 space-y-1.5">
              {session.userObjectives.slice(0, 4).map((objective) => (
                <div key={objective.id} className="flex items-center justify-between gap-2 text-[10px] sm:text-xs">
                  <span className="min-w-0 truncate text-slate-300">{objective.label}</span>
                  <b className={objective.completed ? 'shrink-0 text-emerald-300' : 'shrink-0 text-white'}>{objective.current}/{objective.target}</b>
                </div>
              ))}
            </div>
          </article>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#0b1521] px-3 py-2 sm:px-5 sm:py-3">
          <p className="hidden max-w-md text-[9px] leading-snug text-slate-400 sm:block">Your performance, objectives and key moments will shape your career.</p>
          <button
            type="button"
            onClick={startLiveMatch}
            className="min-h-12 w-full rounded-lg border-2 border-[#ffe17a] bg-gradient-to-r from-[#F6C21C] to-[#dca90e] px-5 py-2 text-sm font-black tracking-[.16em] text-[#101722] shadow-[0_5px_18px_rgba(246,194,28,.3)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:ml-auto sm:min-h-14 sm:w-auto sm:min-w-[230px]"
          >
            ▶ PLAY MATCH
          </button>
        </footer>
      </section>
    </main>
  );
};

export default PlayerMatchMode;
