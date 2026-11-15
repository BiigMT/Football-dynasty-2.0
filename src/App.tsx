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
import { deleteCareer, listSaveSlots, loadCareer, saveCareer, SaveSlotSummary } from './engine/storage';
import { soundEngine } from './engine/audio';
import { TitleScreen } from './components/TitleScreen';
import { CareerSetupModal } from './components/CareerSetupModal';
import { ManagerHub } from './components/ManagerHub';
import { PlayerCareerHub } from './components/PlayerCareerHub';
import { MatchCenter } from './components/MatchCenter';
import { PlayerMatchMode } from './components/PlayerMatchMode';
import { StudioIntro } from './components/StudioIntro';
import { OrientationSelect, GameOrientation } from './components/OrientationSelect';
import { CareerModeSelect } from './components/CareerModeSelect';

type AppScreen = 'TITLE' | 'MODE_SELECT' | 'SETUP' | 'CAREER' | 'MATCH';


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
    void saveCareer(next).then(refreshSlots).catch((error: unknown) => {
      console.error('Career save failed:', error);
      window.alert(error instanceof Error ? error.message : 'Could not save your career. Please try again.');
    });
  };

  const handleStartNewCareer = (mode: CareerMode, slotId: string) => {
    soundEngine.playClick();
    setSetupTarget({ mode, slotId });
    setScreen('MODE_SELECT');
  };

  const handleLoadCareer = async (slotId: string) => {
    soundEngine.playClick();
    const loaded = await loadCareer(slotId);
    if (!loaded) return;
    setActiveSave(loaded);
    if (loaded.activeMatch && loaded.activeMatch.phase !== 'FULL_TIME') {
      setScreen('MATCH');
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
    return (
      <CareerSetupModal
        mode={setupTarget.mode}
        slotId={setupTarget.slotId}
        onCancel={() => setScreen('TITLE')}
        onConfirmManager={handleConfirmManager}
        onConfirmLegend={handleConfirmLegend}
      />
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
