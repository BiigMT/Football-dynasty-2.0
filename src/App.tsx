import { useEffect, useState } from 'react';
import { CareerMode, CareerSave, Club, Fixture, MatchSession } from './types/football';
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
import { LegendHub } from './components/LegendHub';
import { MatchCenter } from './components/MatchCenter';

type AppScreen = 'TITLE' | 'SETUP' | 'CAREER' | 'MATCH';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('TITLE');
  const [slots, setSlots] = useState<SaveSlotSummary[]>(() => listSaveSlots());
  const [setupTarget, setSetupTarget] = useState<{ mode: CareerMode; slotId: string }>({
    mode: 'MANAGER',
    slotId: 'slot_1',
  });
  const [activeSave, setActiveSave] = useState<CareerSave | null>(null);
  const [muted, setMuted] = useState<boolean>(false);

  const refreshSlots = () => setSlots(listSaveSlots());

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
  };

  const updateAndPersistSave = (next: CareerSave) => {
    setActiveSave(next);
    saveCareer(next);
    refreshSlots();
  };

  const handleStartNewCareer = (mode: CareerMode, slotId: string) => {
    soundEngine.playClick();
    setSetupTarget({ mode, slotId });
    setScreen('SETUP');
  };

  const handleLoadCareer = (slotId: string) => {
    soundEngine.playClick();
    const loaded = loadCareer(slotId);
    if (!loaded) return;
    setActiveSave(loaded);
    if (loaded.activeMatch && loaded.activeMatch.phase !== 'FULL_TIME') {
      setScreen('MATCH');
    } else {
      setScreen('CAREER');
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    soundEngine.playClick();
    deleteCareer(slotId);
    refreshSlots();
  };

  const handleConfirmManager = (data: {
    slotId: string;
    managerName: string;
    nationality: string;
    philosophy: 'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced';
    clubId: string;
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
    const nextWorld = advanceWeek(withResult);
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

  if (screen === 'TITLE') {
    return (
      <TitleScreen
        slots={slots}
        muted={muted}
        onToggleMute={handleToggleMute}
        onStartNewCareer={handleStartNewCareer}
        onLoadCareer={handleLoadCareer}
        onDeleteSlot={handleDeleteSlot}
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
      <MatchCenter
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
      <LegendHub
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
