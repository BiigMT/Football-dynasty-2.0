import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  FastForward,
  Save,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Circle,
  MessageSquare,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Club,
  Formation,
  MatchSession,
  Mentality,
  PassingStyle,
  Player,
  PressingStyle,
} from '../types/football';
import {
  applyTeamTalk,
  makeMatchSubstitution,
  resolveKeyMomentChoice,
  resumeSecondHalf,
  simulateNextMinute,
  startMatchKickoff,
} from '../engine/matchEngine';
import { soundEngine } from '../engine/audio';
import { ClubBadge } from './ClubBadge';
import { MatchPitchCanvas } from './MatchPitchCanvas';

interface MatchCenterProps {
  initialSession: MatchSession;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  muted: boolean;
  onToggleMute: () => void;
  onPersistMatchState: (session: MatchSession) => void;
  onFinishMatch: (finalSession: MatchSession) => void;
}

export const MatchCenter: React.FC<MatchCenterProps> = ({
  initialSession,
  clubs,
  players,
  muted,
  onToggleMute,
  onPersistMatchState,
  onFinishMatch,
}) => {
  const [session, setSession] = useState<MatchSession>(initialSession);
  const [running, setRunning] = useState<boolean>(
    initialSession.phase === 'FIRST_HALF' || initialSession.phase === 'SECOND_HALF'
  );
  const [speedMs, setSpeedMs] = useState<number>(360);
  const [lastGoalTs, setLastGoalTs] = useState<number>(0);
  const [subOutId, setSubOutId] = useState<string>('');
  const [subInId, setSubInId] = useState<string>('');
  const [interviewDone, setInterviewDone] = useState<boolean>(false);
  const [quickToolsOpen, setQuickToolsOpen] = useState<boolean>(false);

  const homeClub = clubs[session.homeClubId];
  const awayClub = clubs[session.awayClubId];
  const userSide = session.userClubSide ?? 'HOME';
  const userTactics = userSide === 'HOME' ? session.homeTactics : session.awayTactics;
  const userSubsUsed = userSide === 'HOME' ? session.homeSubsUsed : session.awaySubsUsed;
  const isManagerMode = !session.userPlayerId;
  const isLiveMatch = session.phase === 'FIRST_HALF' || session.phase === 'SECOND_HALF';
  const isHalfTime = session.phase === 'HALF_TIME';

  useEffect(() => {
    if (!running) return;
    if (
      session.phase !== 'FIRST_HALF' &&
      session.phase !== 'SECOND_HALF'
    ) {
      setRunning(false);
      return;
    }
    if (session.pendingKeyMoment) {
      setRunning(false);
      return;
    }

    const timer = window.setInterval(() => {
      setSession((prev) => {
        if (
          prev.phase === 'HALF_TIME' ||
          prev.phase === 'FULL_TIME' ||
          prev.phase === 'PRE_MATCH' ||
          prev.pendingKeyMoment
        ) {
          return prev;
        }
        const { session: next, soundCue } = simulateNextMinute(prev, clubs, players);
        if (soundCue === 'GOAL') {
          soundEngine.playGoalRoar();
          setLastGoalTs(Date.now());
        } else if (soundCue === 'WHISTLE') {
          soundEngine.playWhistle(next.phase === 'FULL_TIME' ? 'FULL_TIME' : 'SHORT');
        } else if (soundCue === 'KICK') {
          soundEngine.playKick(0.5);
        }

        if (next.phase === 'HALF_TIME') {
          onPersistMatchState(next);
          setRunning(false);
        } else if (next.phase === 'FULL_TIME') {
          setRunning(false);
        } else if (next.pendingKeyMoment) {
          soundEngine.playWhistle('SHORT');
          setRunning(false);
        }
        return next;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [running, speedMs, session.phase, session.pendingKeyMoment, clubs, players, onPersistMatchState]);

  const handleKickoff = () => {
    soundEngine.playWhistle('KICKOFF');
    const started = startMatchKickoff(session);
    setSession(started);
    setRunning(true);
  };

  const handleResumeSecondHalf = () => {
    soundEngine.playWhistle('KICKOFF');
    const resumed = resumeSecondHalf(session);
    setSession(resumed);
    onPersistMatchState(resumed);
    setRunning(true);
  };

  const handleTeamTalk = (talk: 'ENCOURAGE' | 'DEMAND_MORE' | 'TACTICAL_FOCUS' | 'PRAISE') => {
    soundEngine.playClick();
    const updated = applyTeamTalk(session, talk, players);
    setSession(updated);
    onPersistMatchState(updated);
  };

  const updateUserTactics = (patch: Partial<typeof userTactics>) => {
    soundEngine.playClick();
    setSession((prev) => {
      const next =
        userSide === 'HOME'
          ? { ...prev, homeTactics: { ...prev.homeTactics, ...patch } }
          : { ...prev, awayTactics: { ...prev.awayTactics, ...patch } };
      onPersistMatchState(next);
      return next;
    });
  };

  const handlePreMatchSwap = () => {
    if (!subOutId || !subInId || session.phase !== 'PRE_MATCH') return;
    const current = userSide === 'HOME' ? session.homeTactics : session.awayTactics;
    const xiIndex = current.startingXI.indexOf(subOutId);
    const benchIndex = current.bench.indexOf(subInId);
    if (xiIndex < 0 || benchIndex < 0) return;
    const nextXI = [...current.startingXI];
    const nextBench = [...current.bench];
    nextXI[xiIndex] = subInId;
    nextBench[benchIndex] = subOutId;
    const nextTactics = { ...current, startingXI: nextXI, bench: nextBench };
    const nextStates = { ...session.playerStates };
    if (nextStates[subOutId]) nextStates[subOutId] = { ...nextStates[subOutId], onPitch: false, subbedOff: false, slotIndex: -1 };
    if (nextStates[subInId]) nextStates[subInId] = { ...nextStates[subInId], onPitch: true, subbedOff: false, slotIndex: xiIndex };
    const nextSession = userSide === 'HOME'
      ? { ...session, homeTactics: nextTactics, playerStates: nextStates }
      : { ...session, awayTactics: nextTactics, playerStates: nextStates };
    setSession(nextSession);
    onPersistMatchState(nextSession);
    setSubOutId('');
    setSubInId('');
    soundEngine.playClick();
  };

  const handleMakeSub = () => {
    if (!subOutId || !subInId) return;
    soundEngine.playClick();
    const next = makeMatchSubstitution(session, userSide, subOutId, subInId);
    setSession(next);
    onPersistMatchState(next);
    setSubOutId('');
    setSubInId('');
  };

  const handleKeyMomentDecision = (choiceId: string) => {
    soundEngine.playKick(0.95);
    const next = resolveKeyMomentChoice(session, choiceId, clubs, players);
    if (
      next.homeStats.goals > session.homeStats.goals ||
      next.awayStats.goals > session.awayStats.goals
    ) {
      soundEngine.playGoalRoar();
      setLastGoalTs(Date.now());
    }
    setSession(next);
    setRunning(true);
  };

  const userPlayerState = session.userPlayerId ? session.playerStates[session.userPlayerId] : undefined;
  const userPlayer = session.userPlayerId ? players[session.userPlayerId] : undefined;

  return (
    <div className={`bg-[#0B0F14] text-slate-100 ${isLiveMatch ? 'match-live-screen' : isHalfTime ? 'match-halftime-screen' : 'min-h-screen px-4 py-4 sm:px-6'}`}>
      <div className={isLiveMatch ? 'match-live-content' : isHalfTime ? 'match-halftime-content' : 'max-w-6xl mx-auto flex flex-col gap-4'}>
        {/* Top Broadcast Scoreboard */}
        <header className={`rounded-xl bg-[#131A22] border border-white/10 flex flex-wrap items-center justify-between ${isLiveMatch ? 'match-live-scoreboard' : isHalfTime ? 'match-halftime-scoreboard' : 'p-4 gap-4'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <ClubBadge
              shortName={homeClub.shortName}
              primaryColor={homeClub.primaryColor}
              secondaryColor={homeClub.secondaryColor}
              size={40}
            />
            <div>
              <div className="text-sm sm:text-base font-bold text-white truncate">{homeClub.name}</div>
              <div className="text-xs text-slate-400">{session.homeTactics.formation} · Home</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-medium">
              {session.competitionName}
            </span>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono-num text-white">
                {session.homeStats.goals}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#0B0F14] border border-white/10 text-xs font-mono-num text-cyan-300">
                {session.phase === 'PRE_MATCH'
                  ? 'PRE'
                  : session.phase === 'HALF_TIME'
                  ? 'HT 45\''
                  : session.phase === 'FULL_TIME'
                  ? 'FT 90\''
                  : `${session.minute}'`}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold font-mono-num text-white">
                {session.awayStats.goals}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {homeClub.stadiumName} · {session.weather}
            </span>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="text-right">
              <div className="text-sm sm:text-base font-bold text-white truncate">{awayClub.name}</div>
              <div className="text-xs text-slate-400">{session.awayTactics.formation} · Away</div>
            </div>
            <ClubBadge
              shortName={awayClub.shortName}
              primaryColor={awayClub.primaryColor}
              secondaryColor={awayClub.secondaryColor}
              size={40}
            />
          </div>
        </header>

        {/* Playback Controls Bar */}
        <div className={`relative flex flex-wrap items-center justify-between rounded-xl bg-[#131A22] border border-white/10 ${isLiveMatch ? 'match-live-controls' : isHalfTime ? 'match-halftime-controls' : 'gap-3 px-4 py-2.5'}`}>
          <div className="flex items-center gap-2">
            {session.phase === 'PRE_MATCH' && (
              <button
                type="button"
                onClick={handleKickoff}
                className="min-h-[42px] px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Kickoff First Half</span>
              </button>
            )}

            {(session.phase === 'FIRST_HALF' || session.phase === 'SECOND_HALF') && (
              <>
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  className="min-h-[40px] px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{running ? 'Pause' : 'Resume'}</span>
                </button>
                {[
                  { label: '1x', ms: 420 },
                  { label: '2x', ms: 200 },
                  { label: '4x', ms: 80 },
                ].map((spd) => (
                  <button
                    key={spd.label}
                    type="button"
                    onClick={() => setSpeedMs(spd.ms)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold transition-colors cursor-pointer ${
                      speedMs === spd.ms
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#0B0F14] text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </>
            )}

            {session.phase === 'HALF_TIME' && (
              <button
                type="button"
                onClick={handleResumeSecondHalf}
                className="min-h-[42px] px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <FastForward className="w-4 h-4" />
                <span>Resume Second Half (46&apos;)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isManagerMode && session.phase !== 'FULL_TIME' && (
              <button type="button" onClick={() => setQuickToolsOpen((open) => !open)} className={`min-h-[40px] px-3 rounded-lg border text-xs font-semibold whitespace-nowrap ${quickToolsOpen ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-[#0B0F14] text-cyan-300 border-cyan-500/40'}`}>
                {quickToolsOpen ? 'Close Controls' : 'Quick Controls'}
              </button>
            )}
            {session.phase === 'HALF_TIME' && (
              <button
                type="button"
                onClick={() => {
                  onPersistMatchState(session);
                  onFinishMatch(session);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#0B0F14] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Half-Time & Exit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              className="min-h-[40px] min-w-[40px] px-3 rounded-lg bg-[#0B0F14] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="Toggle match sound"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {quickToolsOpen && isManagerMode && session.phase !== 'FULL_TIME' && (
          <section className="match-quick-tools absolute z-50 right-2 top-[calc(100%+6px)] w-[min(620px,calc(100vw-16px))] rounded-xl border border-cyan-400/40 bg-[#101923] p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div><div className="text-xs font-bold uppercase tracking-wider text-cyan-300">Touchline controls</div><div className="text-[10px] text-slate-400">Changes apply immediately · {userSubsUsed}/5 substitutions used</div></div>
              <span className="text-[10px] text-slate-500">{session.minute}'</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <label className="text-[10px] text-slate-400">Formation<select value={userTactics.formation} onChange={(e) => updateUserTactics({ formation: e.target.value as Formation })} className="mt-1 w-full min-h-[38px] px-2 rounded bg-[#080d13] border border-white/15 text-xs text-white">{(['4-3-3','4-2-3-1','4-4-2','3-5-2','5-3-2'] as Formation[]).map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
              <label className="text-[10px] text-slate-400">Mentality<select value={userTactics.mentality} onChange={(e) => updateUserTactics({ mentality: e.target.value as Mentality })} className="mt-1 w-full min-h-[38px] px-2 rounded bg-[#080d13] border border-white/15 text-xs text-white"><option value="DEFENSIVE">Defensive</option><option value="BALANCED">Balanced</option><option value="ATTACKING">Attacking</option><option value="ALL_OUT">All-Out Attack</option></select></label>
              <label className="text-[10px] text-slate-400">Pressing<select value={userTactics.pressing} onChange={(e) => updateUserTactics({ pressing: e.target.value as PressingStyle })} className="mt-1 w-full min-h-[38px] px-2 rounded bg-[#080d13] border border-white/15 text-xs text-white"><option value="LOW_BLOCK">Low block</option><option value="MID_PRESS">Mid press</option><option value="GEGENPRESS">Gegenpress</option></select></label>
              <label className="text-[10px] text-slate-400">Passing<select value={userTactics.passing} onChange={(e) => updateUserTactics({ passing: e.target.value as PassingStyle })} className="mt-1 w-full min-h-[38px] px-2 rounded bg-[#080d13] border border-white/15 text-xs text-white"><option value="SHORT_TIKI_TAKA">Short passing</option><option value="MIXED">Mixed</option><option value="DIRECT_LONG">Direct long</option></select></label>
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <select value={subOutId} onChange={(e) => setSubOutId(e.target.value)} className="min-w-0 min-h-[40px] px-2 rounded bg-[#080d13] border border-white/15 text-xs text-white"><option value="">Take off…</option>{userTactics.startingXI.map((pid) => { const p=players[pid]; return p ? <option key={pid} value={pid}>{p.name} · {p.position} · {Math.round(session.playerStates[pid]?.stamina ?? 100)}%</option> : null; })}</select>
              <select value={subInId} onChange={(e) => setSubInId(e.target.value)} className="min-w-0 min-h-[40px] px-2 rounded bg-[#080d13] border border-white/15 text-xs text-white"><option value="">Bring on…</option>{userTactics.bench.map((pid) => { const p=players[pid]; return p ? <option key={pid} value={pid}>{p.name} · {p.position}</option> : null; })}</select>
              <button type="button" disabled={!subOutId || !subInId || userSubsUsed >= 5 || session.phase === 'PRE_MATCH'} onClick={handleMakeSub} className="min-h-[40px] px-3 rounded bg-cyan-500 disabled:bg-slate-700 text-slate-950 disabled:text-slate-400 text-xs font-bold">Sub</button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {[{label:'Possession',a:session.homeStats.possession,b:session.awayStats.possession,suffix:'%'},{label:'Shots',a:session.homeStats.shots,b:session.awayStats.shots,suffix:''},{label:'On target',a:session.homeStats.shotsOnTarget,b:session.awayStats.shotsOnTarget,suffix:''},{label:'Expected goals',a:session.homeStats.xG,b:session.awayStats.xG,suffix:''}].map((stat) => <div key={stat.label} className="rounded-md bg-[#080d13] p-2 text-center"><div className="text-[9px] text-slate-500">{stat.label}</div><div className="text-xs font-mono-num text-white">{stat.a}{stat.suffix} <span className="text-slate-600">:</span> {stat.b}{stat.suffix}</div></div>)}
            </div>
          </section>
        )}

        {session.phase === 'PRE_MATCH' && isManagerMode && (
          <section className="rounded-xl bg-[#131A22] border border-cyan-500/30 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">Team sheet</div>
                <div className="text-[11px] text-slate-400">Make your final changes before kick-off</div>
              </div>
              <span className="text-[11px] text-slate-500">{userTactics.startingXI.length} starters · {userTactics.bench.length} subs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <select value={subOutId} onChange={(e) => setSubOutId(e.target.value)} className="min-h-[42px] min-w-0 px-2.5 rounded-lg bg-[#0B0F14] border border-white/15 text-xs text-white">
                <option value="">Player to replace…</option>
                {userTactics.startingXI.map((pid) => {
                  const p = players[pid];
                  return p ? <option key={pid} value={pid}>{p.name} · {p.position} · {p.overall}</option> : null;
                })}
              </select>
              <select value={subInId} onChange={(e) => setSubInId(e.target.value)} className="min-h-[42px] min-w-0 px-2.5 rounded-lg bg-[#0B0F14] border border-white/15 text-xs text-white">
                <option value="">Substitute to bring on…</option>
                {userTactics.bench.map((pid) => {
                  const p = players[pid];
                  return p ? <option key={pid} value={pid}>{p.name} · {p.position} · {p.overall}</option> : null;
                })}
              </select>
              <button type="button" disabled={!subOutId || !subInId} onClick={handlePreMatchSwap} className="min-h-[42px] px-4 rounded-lg bg-cyan-500 disabled:bg-slate-700 text-slate-950 disabled:text-slate-400 font-bold text-xs whitespace-nowrap">Swap players</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {userTactics.bench.map((pid) => {
                const p = players[pid];
                return p ? <span key={pid} className="px-2 py-1 rounded-md bg-[#0B0F14] border border-white/10 text-[10px] text-slate-300">{p.name} <span className="text-cyan-300">{p.position}</span></span> : null;
              })}
            </div>
          </section>
        )}

        {/* Main Grid: Pitch Canvas + Live Telemetry / Half-Time Controls */}
        <div className={isLiveMatch ? 'match-live-grid' : isHalfTime ? 'match-halftime-grid' : 'grid grid-cols-1 lg:grid-cols-12 gap-4'}>
          {/* Left: 2D Tactical Pitch + Key Moment / Half-Time Console */}
          <div className={isLiveMatch ? 'match-live-pitch-column' : isHalfTime ? 'match-halftime-pitch-column' : 'lg:col-span-7 flex flex-col gap-4'}>
            <MatchPitchCanvas
              session={session}
              homeClub={homeClub}
              awayClub={awayClub}
              players={players}
              lastGoalTimestamp={lastGoalTs}
            />

            {/* Become a Legend Key Moment Interactive Decision */}
            {session.pendingKeyMoment && (
              <div className="rounded-xl bg-[#161F2A] border border-amber-400/60 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Key Moment · {session.pendingKeyMoment.minute}&apos;
                  </span>
                  <span className="text-xs text-slate-400 font-mono-num">
                    {userPlayer?.name} ({userPlayer?.position})
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{session.pendingKeyMoment.title}</h3>
                  <p className="text-sm text-slate-300 mt-1">{session.pendingKeyMoment.scenario}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {session.pendingKeyMoment.choices.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleKeyMomentDecision(ch.id)}
                      className="min-h-[64px] p-3 rounded-lg bg-[#0B0F14] border border-amber-400/35 hover:border-amber-400 hover:bg-amber-500/15 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-sm font-bold text-amber-300">{ch.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ch.description}</div>
                      <div className="text-[11px] font-mono-num text-slate-500 mt-1.5">
                        Uses {ch.attributeKey.toUpperCase()} ({userPlayer?.attributes[ch.attributeKey]})
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GENUINE HALF-TIME CONSOLE */}
            {session.phase === 'HALF_TIME' && (
              <div className="match-halftime-console rounded-xl bg-[#131A22] border border-cyan-500/40 p-3 sm:p-4 flex flex-col gap-3">
                <div className="match-halftime-heading flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <div className="text-xs font-semibold text-cyan-400">Half-Time Interval (45&apos;)</div>
                    <h3 className="text-xl font-bold text-white">Tactical Adjustments & Team Talk</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono-num">
                    Subs: {userSubsUsed}/5
                  </span>
                </div>

                {session.halfTimeFeedback && (
                  <div className="match-halftime-feedback rounded-lg bg-[#0B0F14] border border-amber-400/30 p-2 text-xs text-amber-200">
                    {session.halfTimeFeedback}
                  </div>
                )}

                {/* Team Talk */}
                <div className="match-halftime-talk">
                  <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isManagerMode ? 'Deliver Half-Time Team Talk' : 'Second-Half Mentality Focus'}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'ENCOURAGE', label: 'Encourage' },
                      { id: 'DEMAND_MORE', label: 'Demand More' },
                      { id: 'TACTICAL_FOCUS', label: 'Tactical Focus' },
                      { id: 'PRAISE', label: 'Praise Display' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={Boolean(session.teamTalkApplied)}
                        onClick={() =>
                          handleTeamTalk(t.id as 'ENCOURAGE' | 'DEMAND_MORE' | 'TACTICAL_FOCUS' | 'PRAISE')
                        }
                        className={`min-h-[42px] px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          session.teamTalkApplied === t.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : session.teamTalkApplied
                            ? 'bg-[#0B0F14] border-white/5 text-slate-600 cursor-not-allowed'
                            : 'bg-[#0B0F14] border-white/10 text-slate-200 hover:border-cyan-400/50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manager Tactics & Substitutions */}
                {isManagerMode && (
                  <div className="match-halftime-tools grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-400">Live Tactics</span>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={userTactics.formation}
                          onChange={(e) => updateUserTactics({ formation: e.target.value as Formation })}
                          className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                        >
                          {(['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2'] as Formation[]).map((f) => (
                            <option key={f} value={f}>
                              Form: {f}
                            </option>
                          ))}
                        </select>
                        <select
                          value={userTactics.mentality}
                          onChange={(e) => updateUserTactics({ mentality: e.target.value as Mentality })}
                          className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                        >
                          <option value="DEFENSIVE">Defensive</option>
                          <option value="BALANCED">Balanced</option>
                          <option value="ATTACKING">Attacking</option>
                          <option value="ALL_OUT">All-Out Attack</option>
                        </select>
                        <select
                          value={userTactics.pressing}
                          onChange={(e) => updateUserTactics({ pressing: e.target.value as PressingStyle })}
                          className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                        >
                          <option value="LOW_BLOCK">Low Block</option>
                          <option value="MID_PRESS">Mid Press</option>
                          <option value="GEGENPRESS">Gegenpress</option>
                        </select>
                        <select
                          value={userTactics.passing}
                          onChange={(e) => updateUserTactics({ passing: e.target.value as PassingStyle })}
                          className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                        >
                          <option value="SHORT_TIKI_TAKA">Short Passing</option>
                          <option value="MIXED">Mixed</option>
                          <option value="DIRECT_LONG">Direct Long Ball</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-400">Make Substitution ({userSubsUsed}/5 used)</span>
                      <div className="flex flex-col gap-2">
                        <select
                          value={subOutId}
                          onChange={(e) => setSubOutId(e.target.value)}
                          className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                        >
                          <option value="">Select Player Off...</option>
                          {userTactics.startingXI.map((pid) => {
                            const p = players[pid];
                            const st = session.playerStates[pid];
                            if (!p || !st) return null;
                            return (
                              <option key={pid} value={pid}>
                                {p.name} ({p.position}) · {Math.round(st.stamina)}% stam · {st.rating.toFixed(1)}
                              </option>
                            );
                          })}
                        </select>
                        <div className="flex gap-2">
                          <select
                            value={subInId}
                            onChange={(e) => setSubInId(e.target.value)}
                            className="min-h-[40px] flex-1 px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                          >
                            <option value="">Select Bench In...</option>
                            {userTactics.bench.map((pid) => {
                              const p = players[pid];
                              const st = session.playerStates[pid];
                              if (!p || st?.subbedOff) return null;
                              return (
                                <option key={pid} value={pid}>
                                  {p.name} ({p.position} · {p.overall})
                                </option>
                              );
                            })}
                          </select>
                          <button
                            type="button"
                            disabled={!subOutId || !subInId || userSubsUsed >= 5}
                            onClick={handleMakeSub}
                            className="min-h-[40px] px-3 rounded bg-cyan-500 disabled:bg-slate-700 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Sub</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FULL-TIME SUMMARY */}
            {session.phase === 'FULL_TIME' && (
              <div className="rounded-xl bg-[#131A22] border border-emerald-400/50 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400">Full-Time Report</span>
                    <h3 className="text-2xl font-bold text-white">
                      {homeClub.shortName} {session.homeStats.goals} - {session.awayStats.goals} {awayClub.shortName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFinishMatch(session)}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm whitespace-nowrap cursor-pointer"
                  >
                    Continue Career
                  </button>
                </div>

                {userPlayer && userPlayerState && !interviewDone && (
                  <div className="rounded-lg bg-[#0B0F14] border border-white/10 p-4">
                    <div className="text-xs text-amber-400 font-semibold mb-1">Post-Match Mixed Zone Interview</div>
                    <p className="text-xs text-slate-300 mb-3">
                      You finished with a {userPlayerState.rating.toFixed(1)} rating ({userPlayerState.goals}G, {userPlayerState.assists}A). How do you address the media?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Credit the squad & stay humble', 'Promise even sharper finishing next week', 'Thank the manager for trusting me'].map(
                        (resp) => (
                          <button
                            key={resp}
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setInterviewDone(true);
                            }}
                            className="min-h-[40px] px-3 py-1.5 rounded bg-white/5 hover:bg-amber-500/20 border border-white/10 text-xs text-slate-200 cursor-pointer"
                          >
                            {resp}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
                {interviewDone && (
                  <div className="text-xs text-emerald-400">
                    Press response logged — morale and supporter reputation updated.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Stats, Player Objectives (Legend) & Live Commentary */}
          <div className={isLiveMatch ? 'match-live-info-column' : isHalfTime ? 'match-halftime-info-column' : 'lg:col-span-5 flex flex-col gap-4'}>
            {/* Become a Legend Match Objectives */}
            {userPlayer && userPlayerState && !isLiveMatch && (
              <div className="rounded-xl bg-[#131A22] border border-amber-400/30 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-amber-400 font-semibold">Player Focus · #{userPlayer.shirtNumber}</div>
                    <div className="text-base font-bold text-white">{userPlayer.name}</div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="text-2xl font-extrabold text-amber-300">
                      {userPlayerState.rating.toFixed(1)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Stamina {Math.round(userPlayerState.stamina)}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {session.userObjectives.map((obj) => (
                    <div key={obj.id} className="flex items-center justify-between text-xs bg-[#0B0F14] px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        {obj.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={obj.completed ? 'text-emerald-300' : 'text-slate-300'}>{obj.label}</span>
                      </div>
                      <span className="font-mono-num text-slate-400">
                        {obj.current}/{obj.target}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Statistics */}
            <div className={`rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-2.5 ${isLiveMatch ? 'match-live-stats' : ''}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-sm font-bold text-white">Match Statistics</span>
                <span className="text-xs text-slate-400 font-mono-num">
                  {homeClub.shortName} vs {awayClub.shortName}
                </span>
              </div>
              {[
                { label: 'Possession', h: `${session.homeStats.possession}%`, a: `${session.awayStats.possession}%` },
                { label: 'Expected Goals (xG)', h: session.homeStats.xG.toFixed(2), a: session.awayStats.xG.toFixed(2) },
                { label: 'Shots (On Target)', h: `${session.homeStats.shots} (${session.homeStats.shotsOnTarget})`, a: `${session.awayStats.shots} (${session.awayStats.shotsOnTarget})` },
                { label: 'Passes Completed', h: `${session.homeStats.passesCompleted}/${session.homeStats.passes}`, a: `${session.awayStats.passesCompleted}/${session.awayStats.passes}` },
                { label: 'Tackles Won', h: session.homeStats.tackles, a: session.awayStats.tackles },
                { label: 'Saves', h: session.homeStats.saves, a: session.awayStats.saves },
                { label: 'Corners / Offsides', h: `${session.homeStats.corners} / ${session.homeStats.offsides}`, a: `${session.awayStats.corners} / ${session.awayStats.offsides}` },
                { label: 'Cards (Y/R)', h: `${session.homeStats.yellowCards}/${session.homeStats.redCards}`, a: `${session.awayStats.yellowCards}/${session.awayStats.redCards}` },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-3 items-center text-xs py-1 border-b border-white/5 last:border-b-0">
                  <span className="font-mono-num font-semibold text-white">{row.h}</span>
                  <span className="text-center text-slate-400">{row.label}</span>
                  <span className="font-mono-num font-semibold text-white text-right">{row.a}</span>
                </div>
              ))}
            </div>

            {/* Live Match Event Timeline */}
            <div className={`rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-2 flex-1 min-h-[200px] ${isLiveMatch ? 'match-live-timeline' : ''}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-sm font-bold text-white">Match Timeline</span>
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${running ? 'animate-spin' : ''}`} />
              </div>
              <div className={`flex flex-col-reverse gap-2 max-h-[260px] overflow-y-auto pr-1 ${isLiveMatch ? 'match-live-events' : ''}`}>
                {session.events.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    Teams are in the tunnel. Click Kickoff to start the match.
                  </div>
                ) : (
                  (isLiveMatch ? session.events.slice(-5) : session.events).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        ev.type === 'GOAL'
                          ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                          : ev.type === 'RED_CARD'
                          ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                          : ev.type === 'YELLOW_CARD'
                          ? 'bg-amber-500/10 border-amber-400/30 text-amber-200'
                          : 'bg-[#0B0F14] border-white/5 text-slate-300'
                      }`}
                    >
                      <span className="font-mono-num font-bold text-cyan-400 mr-2">{ev.minute}&apos;</span>
                      <span>{ev.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
