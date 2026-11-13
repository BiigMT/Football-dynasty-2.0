import { useEffect, useState } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
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
type GameOrientation = 'portrait' | 'landscape';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('TITLE');
  const [orientation, setOrientation] = useState<GameOrientation | null>(() => {
    const saved = localStorage.getItem('fd-game-orientation');
    return saved === 'portrait' || saved === 'landscape' ? saved : null;
  });
  const [slots, setSlots] = useState<SaveSlotSummary[]>(() => listSaveSlots());
  const [setupTarget, setSetupTarget] = useState<{ mode: CareerMode; slotId: string }>({
    mode: 'MANAGER',
    slotId: 'slot_1',
  });
  const [activeSave, setActiveSave] = useState<CareerSave | null>(null);
  const [muted, setMuted] = useState<boolean>(false);

  const refreshSlots = () => setSlots(listSaveSlots());

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

  if (!orientation) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080d13] px-5 py-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(8,145,178,0.22),_transparent_55%)]" />
        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-3xl">⚽</div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Welcome to</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">FOOTBALL <span className="text-cyan-400">DYNASTY</span></h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400">Choose how you want to experience your football journey. You can change this later.</p>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => void chooseOrientation('portrait')} className="group rounded-2xl border border-white/10 bg-[#111a24] p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/70 hover:bg-[#142332]">
              <div className="mx-auto flex h-36 w-24 items-center justify-center rounded-[1.4rem] border-[3px] border-slate-500 bg-gradient-to-b from-cyan-950 to-slate-950 shadow-xl transition group-hover:border-cyan-300"><div className="flex h-20 w-16 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-3xl">⚽</div></div>
              <h2 className="mt-6 text-xl font-bold">Portrait</h2><p className="mt-1 text-sm text-slate-400">Vertical gameplay · Best for one-hand play</p>
              <span className="mt-5 inline-flex rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Choose Portrait</span>
            </button>
            <button type="button" onClick={() => void chooseOrientation('landscape')} className="group rounded-2xl border border-white/10 bg-[#111a24] p-6 text-left transition hover:-translate-y-1 hover:border-amber-400/70 hover:bg-[#241f18]">
              <div className="mx-auto flex h-24 w-40 items-center justify-center rounded-[1.4rem] border-[3px] border-slate-500 bg-gradient-to-r from-amber-950 to-slate-950 shadow-xl transition group-hover:border-amber-300"><div className="flex h-16 w-24 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/10 text-3xl">⚽</div></div>
              <h2 className="mt-6 text-xl font-bold">Landscape</h2><p className="mt-1 text-sm text-slate-400">Horizontal gameplay · More pitch width</p>
              <span className="mt-5 inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">Choose Landscape</span>
            </button>
          </div>
          <p className="mt-8 text-xs text-slate-600">Your choice is saved on this device.</p>
        </div>
      </div>
    );
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
