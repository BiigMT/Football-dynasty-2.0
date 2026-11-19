import { useEffect, useState } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { CareerMode, CareerSave, Club, Fixture, GameDifficulty, MatchSession } from './types/football';
import {
  advanceWeek,
  applyMatchSessionToWorld,
  createLegendCareer,
  createManagerCareer,
} from './engine/careerEngine';
import { getFormationSlots } from './engine/database';
import { createMatchSession } from './engine/matchEngine';
import { initializeFourTierPyramid } from './engine/careerPyramid';
import { deleteCareer, listSaveSlots, loadCareer, saveCareer, SaveSlotSummary } from './engine/storage';
import { saveCareerToCloud } from './engine/cloudStorage';
import { soundEngine } from './engine/audio';
import { TitleScreen } from './components/TitleScreen';
import { CareerSetupModal } from './components/CareerSetupModal';
import { PlayerCreationWizard } from './components/PlayerCreationWizard';
import { ManagerHub } from './components/ManagerHub';
import { PlayerCareerHub } from './components/PlayerCareerHub';
import { MatchCenter } from './components/MatchCenter';
import { PlayerMatchMode } from './components/PlayerMatchMode';
import { StudioIntro } from './components/StudioIntro';
import { OrientationSelect, GameOrientation } from './components/OrientationSelect';
import { CareerModeSelect } from './components/CareerModeSelect';

type AppScreen = 'TITLE' | 'MODE_SELECT' | 'SETUP' | 'CAREER' | 'MATCH_READY' | 'MATCH';


export default function App() {
  const [screen, setScreen] = useState<AppScreen>('TITLE');
  const [showStudioIntro, setShowStudioIntro] = useState(true);
  const [orientation, setOrientation] = useState<GameOrientation | null>(() => {
    const saved = localStorage.getItem('fd-game-orientation');
    return saved === 'portrait' || saved === 'landscape' ? saved : null;
  });
  const [slots, setSlots] = useState<SaveSlotSummary[]>([]);
  const [setupTarget, setSetupTarget] = useState<{ mode: CareerMode; slotId: string }>({
    mode: 'MANAGER',
    slotId: 'slot_1',
  });
  const [activeSave, setActiveSave] = useState<CareerSave | null>(null);
  const [muted, setMuted] = useState<boolean>(false);

  const refreshSlots = async () => setSlots(await listSaveSlots());

  useEffect(() => { void refreshSlots(); }, []);

  const chooseOrientation = async (next: GameOrientation) => {
    setOrientation(next);
    localStorage.setItem('fd-game-orientation', next);
    try {
      await ScreenOrientation.lock({ orientation: next });
    } catch (error) {
      // Browsers that do not support orientation locking still keep the saved preference.
      console.info('Orientation lock is unavailable on this device.', error);
    }
  };

  useEffect(() => {
    if (!orientation) return;
    ScreenOrientation.lock({ orientation }).catch(() => undefined);
  }, [orientation]);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
  };

  const updateAndPersistSave = (next: CareerSave) => {
    setActiveSave(next);
    void saveCareer(next).then(async () => {
      try {
        await saveCareerToCloud({ ...next, updatedAt: Date.now() });
      } catch (cloudError) {
        // Cloud failures never block or roll back the on-device career save.
        console.warn('Cloud save deferred; the local career is safe.', cloudError);
      }
      await refreshSlots();
    }).catch((error: unknown) => {
      console.error('Career save failed:', error);
      window.alert(error instanceof Error ? error.message : 'Could not save your career. Please try again.');
    });
  };

  const handleStartNewCareer = (mode: CareerMode, slotId: string) => {
    const targetSlot = slots.find((slot) => slot.slotId === slotId);
    if (!targetSlot || !targetSlot.empty) {
      window.alert('That save slot is unavailable. Open Career Saves and free an empty slot before starting a new career.');
      return;
    }
    soundEngine.playClick();
    setSetupTarget({ mode, slotId });
    // The title screen already asks the player to choose Manager or Player Career.
    // Go straight to that mode's setup instead of showing the duplicate mode selector.
    setScreen('SETUP');
  };

  const handleLoadCareer = async (slotId: string) => {
    soundEngine.playClick();
    let loaded = await loadCareer(slotId);
    if (!loaded) return;
    // Upgrade older Player Career saves without disturbing a match already in progress.
    const hasPyramid = Object.keys(loaded.leagues).some((id) => /_tier_[1-4]$/.test(id));
    if (loaded.mode === 'PLAYER' && !hasPyramid && !loaded.activeMatch) {
      const pyramid = initializeFourTierPyramid(loaded.clubs, loaded.leagues);
      loaded = { ...loaded, clubs: pyramid.clubs, leagues: pyramid.leagues, updatedAt: Date.now() };
      await saveCareer(loaded);
      await refreshSlots();
    }
    setActiveSave(loaded);
    if (loaded.activeMatch && loaded.activeMatch.phase !== 'FULL_TIME') {
      // Never drop a loaded career straight into the 3D match. Require an explicit resume action.
      setScreen('MATCH_READY');
    } else {
      setScreen('CAREER');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    soundEngine.playClick();
    await deleteCareer(slotId);
    await refreshSlots();
  };

  const handleConfirmManager = (data: {
    slotId: string;
    managerName: string;
    nationality: string;
    philosophy: 'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced';
    clubId: string;
    difficulty: GameDifficulty;
  }) => {
    soundEngine.playWhistle('SHORT');
    const created = createManagerCareer(data);
    updateAndPersistSave(created);
    setScreen('CAREER');
  };

  const handleConfirmLegend = (data: Parameters<typeof createLegendCareer>[0]) => {
    soundEngine.playWhistle('SHORT');
    const created = createLegendCareer(data);
    updateAndPersistSave(created);
    setScreen('CAREER');
  };

  const getMatchClubsMap = (save: CareerSave): Record<string, Club> => {
    const map: Record<string, Club> = { ...save.clubs };
    Object.values(save.nationalTeams).forEach((nt) => {
      const slots = getFormationSlots(nt.formation);
      const used = new Set<string>();
      const startingXI: string[] = [];
      slots.forEach((slotPos) => {
        const best = nt.squadPlayerIds
          .filter((pid) => !used.has(pid) && save.players[pid])
          .sort((a, b) => {
            const pa = save.players[a];
            const pb = save.players[b];
            return pb.overall + (pb.position === slotPos ? 15 : 0) - (pa.overall + (pa.position === slotPos ? 15 : 0));
          })[0];
        if (best) {
          used.add(best);
          startingXI.push(best);
        }
      });
      const bench = nt.squadPlayerIds.filter((pid) => !used.has(pid)).slice(0, 7);
      map[nt.id] = {
        id: nt.id,
        name: nt.name,
        shortName: nt.code,
        country: nt.name,
        region: nt.region,
        leagueId: 'international',
        primaryColor: nt.primaryColor,
        secondaryColor: nt.secondaryColor,
        reputation: nt.reputation,
        stadiumName: `${nt.name} National Arena`,
        stadiumCapacity: 65000,
        chemistry: 78,
        boardExpectation: 'Represent the nation',
        targetPosition: 1,
        tactics: {
          formation: nt.formation,
          mentality: 'BALANCED',
          pressing: 'MID_PRESS',
          passing: 'MIXED',
          tempo: 62,
          startingXI,
          bench,
          captainId: startingXI[0],
        },
        finances: {
          transferBudget: 0,
          wageBudgetWeekly: 0,
          weeklyWageBill: 0,
          cashBalance: 0,
          matchdayIncomePerHomeGame: 0,
          sponsorAnnualIncome: 0,
        },
      };
    });
    return map;
  };

  const handleLaunchMatch = (fixture: Fixture) => {
    if (!activeSave) return;
    const allClubs = getMatchClubsMap(activeSave);
    const homeClub = allClubs[fixture.homeClubId];
    const awayClub = allClubs[fixture.awayClubId];
    if (!homeClub || !awayClub) return;

    const userTeamId =
      fixture.competitionType === 'INTERNATIONAL'
        ? activeSave.manager?.nationalTeamId ?? activeSave.legend?.nationalTeamId
        : activeSave.userClubId;

    const userClubSide: 'HOME' | 'AWAY' = fixture.homeClubId === userTeamId ? 'HOME' : 'AWAY';

    const session = createMatchSession({
      fixture,
      homeClub,
      awayClub,
      players: activeSave.players,
      userClubSide,
      userPlayerId: activeSave.legend?.playerId,
      difficulty: activeSave.difficulty ?? 'NORMAL',
    });

    const updated: CareerSave = { ...activeSave, activeMatch: session };
    updateAndPersistSave(updated);
    setScreen('MATCH');
  };

  const handlePersistMatchState = (session: MatchSession) => {
    if (!activeSave) return;
    const updated: CareerSave = { ...activeSave, activeMatch: session };
    updateAndPersistSave(updated);
  };

  const handleFinishMatch = (finalSession: MatchSession) => {
    if (!activeSave) return;
    if (finalSession.phase === 'HALF_TIME') {
      // Saved mid-match at half-time; return to Title Screen cleanly
      const updated: CareerSave = { ...activeSave, activeMatch: finalSession };
      updateAndPersistSave(updated);
      setScreen('TITLE');
      return;
    }

    const withResult = applyMatchSessionToWorld(activeSave, finalSession);
    let resultSave = withResult;
    const careerLegend = withResult.legend;
    if (careerLegend?.rivalryPending && careerLegend.rivalryPlayerId && careerLegend.playerId) {
      const userRivalryState = finalSession.playerStates[careerLegend.playerId];
      const opponentRivalryState = finalSession.playerStates[careerLegend.rivalryPlayerId];
      if (userRivalryState && opponentRivalryState) {
        const wonRivalry = userRivalryState.rating > opponentRivalryState.rating;
        const lostRivalry = userRivalryState.rating < opponentRivalryState.rating;
        const currentPlayer = withResult.players[careerLegend.playerId];
        const rival = withResult.players[careerLegend.rivalryPlayerId];
        const resultText = wonRivalry
          ? `${currentPlayer?.name ?? 'You'} won the personal battle with ${rival?.name ?? 'the rival'} (${userRivalryState.rating.toFixed(1)} to ${opponentRivalryState.rating.toFixed(1)}).`
          : lostRivalry
          ? `${rival?.name ?? 'The rival'} edged the personal battle (${opponentRivalryState.rating.toFixed(1)} to ${userRivalryState.rating.toFixed(1)}).`
          : `The rivalry finished level at ${userRivalryState.rating.toFixed(1)}.`;
        resultSave = {
          ...withResult,
          legend: {
            ...careerLegend,
            rivalryPending: false,
            rivalryWins: (careerLegend.rivalryWins ?? 0) + (wonRivalry ? 1 : 0),
            rivalryLosses: (careerLegend.rivalryLosses ?? 0) + (lostRivalry ? 1 : 0),
          },
          players: currentPlayer ? {
            ...withResult.players,
            [careerLegend.playerId]: {
              ...currentPlayer,
              morale: Math.max(1, Math.min(100, currentPlayer.morale + (wonRivalry ? 3 : lostRivalry ? -2 : 1))),
              confidence: Math.max(1, Math.min(100, currentPlayer.confidence + (wonRivalry ? 2 : lostRivalry ? -2 : 0))),
              reputation: Math.max(1, Math.min(100, currentPlayer.reputation + (wonRivalry ? 2 : 0))),
            },
          } : withResult.players,
          news: [{
            id: 'rival_result_' + Date.now(),
            week: withResult.currentWeek,
            season: withResult.season,
            category: 'MATCH' as const,
            headline: wonRivalry ? 'Rivalry won on the pitch' : lostRivalry ? 'Rival gets the bragging rights' : 'Rivals share the honours',
            body: resultText,
          }, ...withResult.news].slice(0, 35),
        };
      } else {
        resultSave = { ...withResult, legend: { ...careerLegend, rivalryPending: false } };
      }
    }
    const nextWorld = advanceWeek(resultSave);
    updateAndPersistSave(nextWorld);
    setScreen('CAREER');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen === 'TITLE' && (e.key === 'Enter' || e.key === ' ')) {
        const latest = [...slots]
          .filter((s) => !s.empty)
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];
        if (latest) {
          e.preventDefault();
          handleLoadCareer(latest.slotId);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, slots]);

  if (showStudioIntro) {
    return <StudioIntro onComplete={() => setShowStudioIntro(false)} />;
  }

  if (!orientation) {
    return <OrientationSelect initialValue="landscape" onConfirm={(next) => void chooseOrientation(next)} />;
  }

  if (screen === 'TITLE') {
    return (
      <TitleScreen
        slots={slots}
        muted={muted}
        onToggleMute={handleToggleMute}
        onStartNewCareer={handleStartNewCareer}
        onLoadCareer={handleLoadCareer}
        onDeleteSlot={handleDeleteSlot}
        orientation={orientation}
        onChangeOrientation={() => setOrientation(null)}
      />
    );
  }

  if (screen === 'MODE_SELECT') {
    return (
      <CareerModeSelect
        slots={slots}
        onStart={(mode) => {
          setSetupTarget((current) => ({ ...current, mode }));
          setScreen('SETUP');
        }}
        onLoad={handleLoadCareer}
        onBack={() => setScreen('TITLE')}
      />
    );
  }

  if (screen === 'SETUP') {
    if (setupTarget.mode === 'PLAYER') {
      return <PlayerCreationWizard
        slotId={setupTarget.slotId}
        onCancel={() => setScreen('TITLE')}
        onConfirmManager={handleConfirmManager}
        onConfirmLegend={handleConfirmLegend}
      />;
    }
    return <CareerSetupModal
      mode="MANAGER"
      slotId={setupTarget.slotId}
      onCancel={() => setScreen('TITLE')}
      onConfirmManager={handleConfirmManager}
      onConfirmLegend={handleConfirmLegend}
    />;
  }

  if (screen === 'MATCH_READY' && activeSave?.activeMatch) {
    const allClubs = getMatchClubsMap(activeSave);
    const session = activeSave.activeMatch;
    const homeClub = allClubs[session.homeClubId];
    const awayClub = allClubs[session.awayClubId];
    return (
      <div className="min-h-[100dvh] w-full bg-[#07111f] text-[#E8EDF5] flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0D1B2A] p-6 sm:p-9 shadow-2xl">
          <div className="text-center text-[10px] font-black tracking-[.28em] text-[#F6C21C]">FOOTBALL DYNASTY · MATCHDAY</div>
          <h1 className="mt-3 text-center text-2xl sm:text-3xl font-black">Your match is waiting</h1>
          <p className="mt-2 text-center text-sm text-slate-400">This career has an unfinished match. Review the match state, then choose when to return to the 3D pitch.</p>
          <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-white/10 bg-[#07111f] p-5">
            <div className="text-center min-w-0"><div className="font-black text-lg sm:text-2xl truncate">{homeClub?.name ?? 'Home team'}</div><div className="mt-1 text-xs text-slate-400">HOME</div></div>
            <div className="text-center"><div className="text-2xl sm:text-4xl font-black tabular-nums">{session.homeStats.goals} – {session.awayStats.goals}</div><div className="mt-1 text-[10px] font-bold tracking-widest text-[#F6C21C]">{session.minute}' · {session.phase.replace('_',' ')}</div></div>
            <div className="text-center min-w-0"><div className="font-black text-lg sm:text-2xl truncate">{awayClub?.name ?? 'Away team'}</div><div className="mt-1 text-xs text-slate-400">AWAY</div></div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-400">{session.competitionName}</div>
          <button type="button" onClick={() => setScreen('MATCH')} className="mt-7 min-h-[54px] w-full rounded-lg bg-[#F6C21C] px-5 text-sm font-black tracking-[.18em] text-[#111827]">RESUME MATCH</button>
          <button type="button" onClick={() => setScreen('TITLE')} className="mt-3 min-h-[42px] w-full rounded-lg border border-white/15 bg-white/5 px-5 text-xs font-bold text-slate-300">RETURN TO TITLE SCREEN</button>
        </div>
      </div>
    );
  }

  if (screen === 'MATCH' && activeSave && activeSave.activeMatch) {
    const allClubs = getMatchClubsMap(activeSave);
    return (
      activeSave.mode === 'PLAYER' ? <PlayerMatchMode
        initialSession={activeSave.activeMatch}
        clubs={allClubs}
        players={activeSave.players}
        muted={muted}
        onToggleMute={handleToggleMute}
        onPersistMatchState={handlePersistMatchState}
        onFinishMatch={handleFinishMatch}
      /> : <MatchCenter
        initialSession={activeSave.activeMatch}
        clubs={allClubs}
        players={activeSave.players}
        muted={muted}
        onToggleMute={handleToggleMute}
        onPersistMatchState={handlePersistMatchState}
        onFinishMatch={handleFinishMatch}
      />
    );
  }

  if (screen === 'CAREER' && activeSave) {
    if (activeSave.mode === 'MANAGER') {
      return (
        <ManagerHub
          save={activeSave}
          muted={muted}
          onToggleMute={handleToggleMute}
          onUpdateSave={updateAndPersistSave}
          onLaunchMatch={handleLaunchMatch}
          onExitToTitle={() => {
            refreshSlots();
            setScreen('TITLE');
          }}
        />
      );
    }
    return (
      <PlayerCareerHub
        save={activeSave}
        orientation={orientation ?? 'landscape'}
        onOrientationChange={chooseOrientation}
        muted={muted}
        onToggleMute={handleToggleMute}
        onUpdateSave={updateAndPersistSave}
        onLaunchMatch={handleLaunchMatch}
        onExitToTitle={() => {
          refreshSlots();
          setScreen('TITLE');
        }}
      />
    );
  }

  return null;
}
