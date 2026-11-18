import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Users,
  Briefcase,
  Trophy,
  Dumbbell,
  ArrowLeftRight,
  LogOut,
  Volume2,
  VolumeX,
  UserPlus,
  Building2,
} from 'lucide-react';
import {
  CareerSave,
  Fixture,
  Formation,
  Mentality,
  PassingStyle,
  Player,
  Position,
  PressingStyle,
  TrainingFocus,
  TransferDealType,
} from '../types/football';
import {
  advanceToNextSeason,
  advanceWeek,
  applyTeamTraining,
  evaluateTransferBid,
  executeTransfer,
  getClubStandingsPosition,
  getNextUserFixture,
  promoteYouthProspect,
  sortStandings,
} from '../engine/careerEngine';
import { getFormationSlots } from '../engine/database';
import { getFormationCoordinates } from '../engine/matchEngine';
import { soundEngine } from '../engine/audio';
import { ClubBadge, CountryFlag, KitPreview } from './ClubBadge';
import { PlayerPortrait } from './PlayerPortrait';
import { TransferNegotiationView } from './TransferNegotiationView';
import { CompetitionsView } from './CompetitionsView';
import { CareerHomeNewsItem, DayItem, ManagerHome, TableRow } from './CareerHome';
import { ManagerPressConference } from './ManagerPressConference';
import { ClubDevelopmentHub } from './ClubDevelopmentHub';
import { TeamManagement } from './TeamManagement';
import { MatchdayPreview } from './MatchdayPreview';

interface ManagerHubProps {
  save: CareerSave;
  muted: boolean;
  onToggleMute: () => void;
  onUpdateSave: (next: CareerSave) => void;
  onLaunchMatch: (fixture: Fixture) => void;
  onExitToTitle: () => void;
}

type ManagerSection = 'DASHBOARD' | 'SQUAD' | 'TRANSFERS' | 'TRAINING' | 'COMPETITIONS' | 'CLUB' | 'DEVELOPMENT' | 'SETTINGS';

export const ManagerHub: React.FC<ManagerHubProps> = ({
  save,
  muted,
  onToggleMute,
  onUpdateSave,
  onLaunchMatch,
  onExitToTitle,
}) => {
  const [tab, setTab] = useState<ManagerSection>('DASHBOARD');
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketPage, setMarketPage] = useState(0);
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [negTarget, setNegTarget] = useState<Player | null>(null);
  const [negotiationStage, setNegotiationStage] = useState<'ARRIVAL' | 'CLUB' | 'CONTRACT' | 'SIGNED'>('ARRIVAL');
  const [dealType, setDealType] = useState<TransferDealType>('PERMANENT');
  const [offerFee, setOfferFee] = useState<number>(0);
  const [offerWage, setOfferWage] = useState<number>(0);
  const [offerYears, setOfferYears] = useState<number>(3);
  const [exchangeId, setExchangeId] = useState<string>('');
  const [negFeedback, setNegFeedback] = useState<string>('');
  const [previewFixture, setPreviewFixture] = useState<Fixture | null>(null);

  const club = save.clubs[save.userClubId];
  const league = save.leagues[club.leagueId];
  const manager = save.manager!;
  const squad = useMemo(
    () =>
      Object.values(save.players)
        .filter((p) => p.clubId === club.id)
        .sort((a, b) => b.overall - a.overall),
    [save.players, club.id]
  );

  const transferDeadlineWeek = save.currentWeek <= 4 ? 4 : save.currentWeek <= 11 ? 11 : null;
  const transferWeeksRemaining = transferDeadlineWeek === null ? null : Math.max(0, transferDeadlineWeek - save.currentWeek);
  const nextFixture = getNextUserFixture(save);
  const leagueFinished = league.fixtures.every((f) => f.played);
  const leaguePos = getClubStandingsPosition(save, club.id);

  const marketPlayers = useMemo(() => {
    return Object.values(save.players)
      .filter((p) => p.clubId !== club.id && p.clubId !== 'free_agent')
      .filter((p) => (posFilter === 'ALL' ? true : p.position === posFilter))
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 36);
  }, [save.players, club.id, posFilter, searchTerm]);

  const visibleMarketPlayers = marketPlayers.slice(marketPage * 6, marketPage * 6 + 6);
  const marketPageCount = Math.max(1, Math.ceil(marketPlayers.length / 6));

  const handleForwardTime = () => {
    soundEngine.playClick();
    if (nextFixture) {
      setPreviewFixture(nextFixture);
    } else if (leagueFinished) {
      soundEngine.playWhistle('FULL_TIME');
      onUpdateSave(advanceToNextSeason(save));
    } else {
      onUpdateSave(advanceWeek(save));
    }
  };

  const handleHomeNavigate = (key: string) => {
    soundEngine.playClick();
    if (key === 'team') setTab('SQUAD');
    else if (key === 'transfers') setTab('TRANSFERS');
    else if (key === 'office' || key === 'news') setTab('CLUB');
    else if (key === 'competitions' || key === 'national') setTab('COMPETITIONS');
    else if (key === 'stats') setTab('TRAINING');
    else if (key === 'settings') setTab('SETTINGS');
  };

  // Build live ManagerHome props from CareerSave
  const oppClub = nextFixture
    ? save.clubs[nextFixture.homeClubId === club.id ? nextFixture.awayClubId : nextFixture.homeClubId] ??
      save.nationalTeams[nextFixture.homeClubId === club.id ? nextFixture.awayClubId : nextFixture.homeClubId]
    : undefined;

  const days: DayItem[] = [
    { label: `Week ${save.currentWeek}`, sub: '(Briefing)', icon: '📋', active: false },
    { label: 'Training', sub: save.weekTrained ? '(Done)' : '(Ready)', icon: '🏋', active: !save.weekTrained && !nextFixture },
    {
      label: nextFixture ? `vs ${'shortName' in (oppClub ?? {}) ? (oppClub as { shortName: string }).shortName : (oppClub as { code?: string })?.code ?? 'OPP'}` : 'Rest Day',
      sub: nextFixture ? '(Matchday)' : '(No Fixture)',
      icon: '⚽',
      active: Boolean(nextFixture),
    },
    { label: `Season ${save.season}`, sub: save.transferWindowOpen ? '(Window Open)' : '(Closed)', icon: '📅', active: false },
  ];

  const sortedStandings = sortStandings(league.standings);
  const tableRows: TableRow[] = sortedStandings.map((r, idx) => {
    const c = save.clubs[r.clubId];
    return {
      pos: idx + 1,
      club: c?.name ?? r.clubId,
      p: r.played,
      gd: r.goalsFor - r.goalsAgainst,
      pts: r.points,
      color: c?.primaryColor,
      me: r.clubId === club.id,
    };
  });

  const scorerRows = Object.values(save.players)
    .filter((player) => league.clubIds.includes(player.clubId) && player.seasonStats.goals > 0)
    .sort((a, b) => b.seasonStats.goals - a.seasonStats.goals || b.seasonStats.assists - a.seasonStats.assists)
    .slice(0, 3)
    .map((player) => ({ name: player.name, club: save.clubs[player.clubId]?.shortName ?? '—', goals: player.seasonStats.goals }));

  const calendarCells = Array.from({ length: 10 }, (_, index) => {
    const week = save.currentWeek + index;
    const fixture = league.fixtures.find((item) => !item.played && item.week === week &&
      (item.homeClubId === club.id || item.awayClubId === club.id));
    const opponentId = fixture ? (fixture.homeClubId === club.id ? fixture.awayClubId : fixture.homeClubId) : '';
    const opponent = opponentId ? save.clubs[opponentId] : undefined;
    return {
      label: `WK ${String(week).padStart(2, '0')}`,
      detail: fixture ? `vs ${opponent?.shortName ?? 'TBC'}` : index === 0 && save.weekTrained ? 'Training done' : 'Training',
      icon: fixture ? '⚽' : '🏋',
      active: index === 0,
      match: Boolean(fixture),
    };
  });

  const homeNews: CareerHomeNewsItem[] = save.news.slice(0, 4).map((n) => ({
    tag: n.category,
    headline: n.headline,
    body: n.body,
  }));
  if (nextFixture && oppClub) {
    homeNews.unshift({
      tag: 'MATCHDAY PREVIEW',
      headline: `${club.name} prepare for clash with ${oppClub.name}`,
      body: `${nextFixture.competitionName} · Currently #${leaguePos} in ${league.name} · Board trust at ${manager.boardConfidence}%.`,
    });
  }

  // Dashboard stories are generated from this offline career save; no social feed is simulated.

  const ticker = [
    ...save.news.slice(0, 5).map((n) => n.headline),
    `${league.name} Leader: ${save.clubs[sortedStandings[0]?.clubId]?.name ?? 'TBD'} (${sortedStandings[0]?.points ?? 0} pts)`,
  ];

  const updateTactics = (patch: Partial<typeof club.tactics>) => {
    soundEngine.playClick();
    onUpdateSave({
      ...save,
      clubs: {
        ...save.clubs,
        [club.id]: {
          ...club,
          tactics: { ...club.tactics, ...patch },
        },
      },
    });
  };

  const swapWithSlot = (playerId: string) => {
    if (selectedSlotIdx === null) return;
    soundEngine.playClick();
    const xi = [...club.tactics.startingXI];
    const bench = [...club.tactics.bench];
    const displaced = xi[selectedSlotIdx];
    const existingXiIdx = xi.indexOf(playerId);
    const existingBenchIdx = bench.indexOf(playerId);

    if (existingXiIdx !== -1) {
      xi[selectedSlotIdx] = playerId;
      xi[existingXiIdx] = displaced;
    } else if (existingBenchIdx !== -1) {
      xi[selectedSlotIdx] = playerId;
      bench[existingBenchIdx] = displaced;
    } else {
      xi[selectedSlotIdx] = playerId;
      if (bench.length < 7) bench.push(displaced);
    }
    updateTactics({ startingXI: xi, bench });
    setSelectedSlotIdx(null);
  };

  const openNegotiation = (p: Player) => {
    soundEngine.playClick();
    setNegTarget(p);
    setNegotiationStage('ARRIVAL');
    setDealType('PERMANENT');
    setOfferFee(p.marketValue);
    setOfferWage(Math.round(p.weeklyWage * 1.05));
    setOfferYears(3);
    setExchangeId('');
    setNegFeedback('');
  };

  const submitNegotiation = () => {
    if (!negTarget) return;
    soundEngine.playClick();
    const expectedWage = Math.ceil(negTarget.weeklyWage * 0.92 / 100) * 100;
    if (offerWage < expectedWage) {
      setOfferWage(expectedWage);
      setNegFeedback(`${negTarget.name}'s agent has pushed back. They want at least €${expectedWage.toLocaleString()} per week. The agent slides a revised salary demand across the table.`);
      return;
    }
    if (offerYears < 2) {
      setOfferYears(2);
      setNegFeedback(`${negTarget.name} wants security and has asked for a minimum two-year contract. The agent has amended the terms.`);
      return;
    }
    const res = evaluateTransferBid(save, {
      playerId: negTarget.id,
      dealType,
      fee: dealType === 'LOAN' ? Math.round(negTarget.marketValue * 0.15) : offerFee,
      proposedWage: offerWage,
      contractYears: offerYears,
      signingBonus: Math.round(offerFee * 0.05),
      releaseClause: offerFee * 2,
      exchangePlayerId: exchangeId || undefined,
    });
    setNegFeedback(res.message);
    if (res.counterFee) {
      setOfferFee(res.counterFee);
    }
    if (res.accepted) {
      onUpdateSave(res.save);
      setNegotiationStage('SIGNED');
    }
  };

  const submitClubOffer = () => {
    if (!negTarget) return;
    soundEngine.playClick();
    const exchangeValue = exchangeId ? (save.players[exchangeId]?.marketValue ?? 0) * 0.85 : 0;
    const askingPrice = dealType === 'LOAN' ? Math.round(negTarget.marketValue * 0.14) : Math.round(negTarget.marketValue * 1.08);
    const offerValue = (dealType === 'LOAN' ? Math.round(negTarget.marketValue * 0.15) : offerFee) + exchangeValue;
    if (!save.transferWindowOpen) {
      setNegFeedback('The transfer window is closed. The club cannot register this move yet.');
      return;
    }
    const cashFee = dealType === 'LOAN' ? Math.round(negTarget.marketValue * 0.15) : offerFee;
    if (cashFee > club.finances.transferBudget) {
      setNegFeedback('The club has rejected the offer: it exceeds your available transfer budget.');
      return;
    }
    if (offerValue >= askingPrice * 0.96) {
      setNegFeedback(`${save.clubs[negTarget.clubId]?.name ?? 'The club'} have accepted the transfer fee. Now meet ${negTarget.name} and their agent to agree personal terms.`);
      setNegotiationStage('CONTRACT');
      return;
    }
    const counter = Math.max(askingPrice, Math.round((askingPrice - exchangeValue) / 50000) * 50000);
    setOfferFee(counter);
    setNegFeedback(`The selling club has countered at €${(counter / 1000000).toFixed(2)}M. Improve your offer or walk away.`);
  };

  const handleScoutPlayer = (pid: string) => {
    soundEngine.playClick();
    const p = save.players[pid];
    if (!p) return;
    onUpdateSave({
      ...save,
      players: {
        ...save.players,
        [pid]: { ...p, scouted: true },
      },
    });
  };

  const handleAcceptIncomingBid = (offerId: string) => {
    const offer = save.transferOffers.find((o) => o.id === offerId);
    if (!offer) return;
    soundEngine.playClick();
    const updated = executeTransfer(
      save,
      offer.playerId,
      offer.fromClubId,
      offer.fee,
      offer.proposedWage,
      offer.contractYears,
      offer.releaseClause
    );
    onUpdateSave({
      ...updated,
      transferOffers: updated.transferOffers.filter((o) => o.id !== offerId),
    });
  };

  const handleRejectIncomingBid = (offerId: string) => {
    soundEngine.playClick();
    onUpdateSave({
      ...save,
      transferOffers: save.transferOffers.filter((o) => o.id !== offerId),
    });
  };

  const handleUpgradeFacilities = () => {
    const level = club.facilitiesLevel ?? 1;
    const cost = 1_250_000 * level;
    if (level >= 5 || club.finances.cashBalance < cost) return;
    soundEngine.playClick();
    onUpdateSave({
      ...save,
      clubs: {
        ...save.clubs,
        [club.id]: {
          ...club,
          facilitiesLevel: level + 1,
          finances: { ...club.finances, cashBalance: club.finances.cashBalance - cost },
        },
      },
      news: [{
        id: `news_facilities_${Date.now()}`,
        week: save.currentWeek,
        season: save.season,
        category: 'BOARD' as const,
        headline: `${club.name} upgrades its training facilities`,
        body: `The club invested €${cost.toLocaleString()} to improve its training complex. Future weekly training will be more effective.`,
      }, ...save.news].slice(0, 35),
    });
  };

  const handleBoardDecision = (label: string, boardDelta: number, chemistryDelta: number, reputationDelta: number) => {
    soundEngine.playClick();
    onUpdateSave({
      ...save,
      manager: {
        ...manager,
        boardConfidence: Math.max(15, Math.min(100, manager.boardConfidence + boardDelta)),
        reputation: Math.max(1, Math.min(100, manager.reputation + reputationDelta)),
      },
      clubs: {
        ...save.clubs,
        [club.id]: { ...club, chemistry: Math.max(1, Math.min(100, club.chemistry + chemistryDelta)) },
      },
      news: [{
        id: `news_board_meeting_${Date.now()}`,
        week: save.currentWeek,
        season: save.season,
        category: 'BOARD' as const,
        headline: `${manager.name} sets the tone in the board meeting`,
        body: label,
      }, ...save.news].slice(0, 35),
    });
  };
  const handleAcceptJobOffer = (offerClubId: string) => {
    const target = save.clubs[offerClubId];
    if (!target) return;
    soundEngine.playClick();
    onUpdateSave({
      ...save,
      userClubId: offerClubId,
      manager: {
        ...manager,
        clubId: offerClubId,
        boardConfidence: 78,
        jobOffers: [],
      },
      news: [
        {
          id: `news_job_${Date.now()}`,
          week: save.currentWeek,
          season: save.season,
          category: 'BOARD',
          headline: `${manager.name} appointed manager of ${target.name}`,
          body: `A high-profile switch sees ${manager.name} take the reins at ${target.stadiumName}.`,
        },
        ...save.news,
      ],
    });
  };

  if (previewFixture) {
    return <MatchdayPreview fixture={previewFixture} clubs={save.clubs} players={save.players} onBack={() => setPreviewFixture(null)} onKickoff={() => onLaunchMatch(previewFixture)} />;
  }

  if (manager.pressConferenceDone === false) {
    return (
      <div className="fd-manager-skin" data-manager-skin="true">
      <ManagerPressConference
        managerName={manager.name}
        clubName={club.name}
        onAnswer={(boardDelta, chemistryDelta, reputationDelta, response) => onUpdateSave({
          ...save,
          manager: {
            ...manager,
            boardConfidence: Math.max(15, Math.min(100, manager.boardConfidence + boardDelta)),
            reputation: Math.max(1, Math.min(100, manager.reputation + reputationDelta)),
          },
          clubs: {
            ...save.clubs,
            [club.id]: { ...club, chemistry: Math.max(1, Math.min(100, club.chemistry + chemistryDelta)) },
          },
          news: [{
            id: 'news_media_' + Date.now(),
            week: save.currentWeek,
            season: save.season,
            category: 'BOARD' as const,
            headline: manager.name + ' makes first impression at ' + club.name,
            body: response,
          }, ...save.news].slice(0, 35),
        })}
        onContinue={() => onUpdateSave({
          ...save,
          manager: { ...manager, pressConferenceDone: true },
        })}
      />
      </div>
    );
  }

  if (tab === 'DASHBOARD') {
    return (
      <ManagerHome
        club={club.name}
        clubColor={club.primaryColor}
        clubSecondaryColor={club.secondaryColor}
        manager={manager.name}
        days={days}
        scorers={scorerRows}
        calendar={calendarCells}
        seasonWeek={`SEASON ${save.season} · WEEK ${save.currentWeek}`}
        pendingTransfers={save.transferOffers.some((offer) => offer.isIncomingToUser)}
        trainingPending={!save.weekTrained}
        transferBudget={`€${(club.finances.transferBudget / 1000000).toFixed(1)}M`}
        wageBudget={`€${Math.round(club.finances.wageBudgetWeekly / 1000)}K/wk`}
        news={homeNews}
        leagueName={league.name}
        table={tableRows}
        ticker={ticker}
        forwardTitle={nextFixture ? 'PLAY MATCHDAY' : leagueFinished ? `SEASON ${save.season + 1}` : 'FORWARD TIME'}
        forwardSub={
          nextFixture
            ? `${nextFixture.competitionName}`
            : leagueFinished
            ? 'Finalize awards & start next season'
            : 'Advance to next matchweek'
        }
        onForward={handleForwardTime}
        onNavigate={handleHomeNavigate}
      />
    );
  }

  if (tab === 'SQUAD') {
    return <TeamManagement
      club={club}
      players={save.players}
      onBack={() => setTab('DASHBOARD')}
      onSave={(tactics) => {
        soundEngine.playClick();
        onUpdateSave({ ...save, clubs: { ...save.clubs, [club.id]: { ...club, tactics } } });
      }}
    />;
  }

  const formationCoords = getFormationCoordinates(club.tactics.formation);
  const formationSlots = getFormationSlots(club.tactics.formation);

  return (
    <div className="fd-manager-skin fd-realism-manager h-[100dvh] min-h-0 overflow-hidden flex flex-col" data-manager-skin="true">
      {/* Sub-page Header */}
      <header className="shrink-0 z-30 bg-[#0E141B]/95 border-b border-cyan-500/35 px-3 sm:px-5 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setTab('DASHBOARD');
              }}
              className="min-h-[42px] px-3.5 py-2 rounded-lg bg-[#131A22] border border-white/15 hover:border-cyan-400 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Career Home</span>
            </button>
            <ClubBadge
              shortName={club.shortName}
              primaryColor={club.primaryColor}
              secondaryColor={club.secondaryColor}
              country={club.country}
              size={36}
            />
            <div>
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-white leading-tight"><KitPreview primaryColor={club.primaryColor} secondaryColor={club.secondaryColor} size={30} /><span>{club.name}</span><CountryFlag country={club.country} size={15} /></div>
              <div className="text-xs text-slate-400 font-mono-num">
                {manager.name} · S{save.season} W{save.currentWeek} · Pos #{leaguePos}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onToggleMute}
              className="min-h-[40px] min-w-[40px] rounded-lg bg-[#131A22] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle sound"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={onExitToTitle}
              className="min-h-[40px] px-3 rounded-lg bg-[#131A22] border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Title Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-page Navigation */}
      <nav className="shrink-0 bg-[#131A22] border-b border-white/10 px-2 sm:px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1">
          {[
            { id: 'SQUAD', label: 'Squad & Tactics', icon: Users },
            { id: 'TRANSFERS', label: 'Transfer Market', icon: ArrowLeftRight },
            { id: 'TRAINING', label: 'Training & Academy', icon: Dumbbell },
            { id: 'COMPETITIONS', label: 'Competitions', icon: Trophy },
            { id: 'CLUB', label: 'Manager Office', icon: Building2 },
            { id: 'DEVELOPMENT', label: 'Development', icon: UserPlus },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTab(item.id as ManagerSection);
                }}
                className={`min-h-[42px] px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="career-subpage-content flex-1 min-h-0 max-w-7xl w-full mx-auto px-2 sm:px-3 py-2 overflow-hidden flex flex-col">
        <div className="relative mb-2 h-[54px] min-h-[54px] shrink-0 overflow-hidden rounded-lg border border-cyan-400/20 bg-[#101923]">
          <img src={tab === 'TRAINING' || tab === 'DEVELOPMENT' ? '/media/game/training-ground.jpg' : tab === 'TRANSFERS' || tab === 'CLUB' ? '/media/game/manager-tactics.jpg' : '/media/game/matchday-training.jpg'} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071019] via-[#071019]/75 to-transparent" />
          <div className="relative z-10 flex h-full min-h-0 flex-col justify-center px-3 py-1">
            <div className="text-[8px] font-bold uppercase tracking-[.18em] text-cyan-300">Football Dynasty · Manager Career</div>
            <h2 className="mt-0 text-base sm:text-lg font-black text-white leading-tight">{tab === 'TRANSFERS' ? 'Recruitment & negotiations' : tab === 'TRAINING' ? 'Training ground' : tab === 'COMPETITIONS' ? 'The football calendar' : tab === 'DEVELOPMENT' ? 'Academy & club development' : tab === 'CLUB' ? 'Club headquarters' : 'Manager dashboard'}</h2>
          </div>
        </div>
        {false && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Tactical Pitch</h3>
                <select
                  value={club.tactics.formation}
                  onChange={(e) => updateTactics({ formation: e.target.value as Formation })}
                  className="min-h-[38px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                >
                  {(['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2'] as Formation[]).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-xl bg-[#0E3622] border border-white/15 overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 border-t border-white/25" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/25" />
                {formationCoords.map((coord, idx) => {
                  const pid = club.tactics.startingXI[idx];
                  const p = save.players[pid];
                  const isSel = selectedSlotIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlotIdx(isSel ? null : idx)}
                      style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
                        isSel ? 'scale-115 z-10' : 'hover:scale-105'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-mono-num font-bold border-2 ${
                          isSel
                            ? 'bg-cyan-400 text-slate-950 border-white'
                            : 'bg-[#0B0F14] text-white border-cyan-400'
                        }`}
                      >
                        {p?.overall ?? '--'}
                      </span>
                      <span className="mt-0.5 px-1.5 py-0.2 rounded bg-black/75 text-[10px] text-white whitespace-nowrap">
                        {formationSlots[idx]} · {p?.name.split(' ').slice(-1)[0] ?? 'Empty'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedSlotIdx != null && (
                <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3 py-2 rounded-lg">
                  Slot {(selectedSlotIdx ?? 0) + 1} ({formationSlots[selectedSlotIdx ?? 0]}) selected — click any player on the right to swap.
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={club.tactics.mentality}
                  onChange={(e) => updateTactics({ mentality: e.target.value as Mentality })}
                  className="min-h-[40px] px-2 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                >
                  <option value="DEFENSIVE">Defensive</option>
                  <option value="BALANCED">Balanced</option>
                  <option value="ATTACKING">Attacking</option>
                  <option value="ALL_OUT">All-Out</option>
                </select>
                <select
                  value={club.tactics.pressing}
                  onChange={(e) => updateTactics({ pressing: e.target.value as PressingStyle })}
                  className="min-h-[40px] px-2 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                >
                  <option value="LOW_BLOCK">Low Block</option>
                  <option value="MID_PRESS">Mid Press</option>
                  <option value="GEGENPRESS">Gegenpress</option>
                </select>
                <select
                  value={club.tactics.passing}
                  onChange={(e) => updateTactics({ passing: e.target.value as PassingStyle })}
                  className="min-h-[40px] px-2 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                >
                  <option value="SHORT_TIKI_TAKA">Tiki-Taka</option>
                  <option value="MIXED">Mixed</option>
                  <option value="DIRECT_LONG">Long Ball</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl bg-[#131A22] border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Senior Squad ({squad.length})</h3>
                <span className="text-xs text-slate-400">Click a pitch slot then a player to swap</span>
              </div>
              <div className="divide-y divide-white/5 max-h-[540px] overflow-y-auto">
                {squad.map((p) => {
                  const inXI = club.tactics.startingXI.includes(p.id);
                  const inBench = club.tactics.bench.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => (selectedSlotIdx !== null ? swapWithSlot(p.id) : undefined)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                        selectedSlotIdx !== null ? 'hover:bg-cyan-500/15 cursor-pointer' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PlayerPortrait
                          appearance={p.appearance}
                          jerseyPrimary={club.primaryColor}
                          jerseySecondary={club.secondaryColor}
                          size={40}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {p.name}
                            {p.injuredWeeks > 0 ? ` (Inj ${p.injuredWeeks}w)` : ''}
                          </div>
                          <div className="text-xs text-slate-400 font-mono-num">
                            {p.position} · Age {p.age} · {inXI ? 'Starter' : inBench ? 'Bench' : 'Reserve'} · Fit {p.fitness}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 font-mono-num shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs text-slate-400">€{(p.weeklyWage / 1000).toFixed(1)}k/wk</div>
                          <div className="text-[11px] text-slate-500">
                            {p.seasonStats.goals}G {p.seasonStats.assists}A
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-[#0B0F14] border border-white/10 text-sm font-bold text-cyan-400">
                          {p.overall}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'TRANSFERS' && (
          <div className="manager-transfer-screen flex min-h-0 flex-col gap-2 overflow-hidden">
          <div className={`shrink-0 rounded-xl border p-2 flex flex-wrap items-center justify-between gap-2 ${save.transferWindowOpen ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/10 bg-[#131A22]'}`}>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-300">Transfer Deadline Watch</div>
              <div className="mt-1 text-xs text-slate-300">
                {save.transferWindowOpen
                  ? transferWeeksRemaining === 0
                    ? 'DEADLINE DAY — finalise offers before the window closes.'
                    : `${transferWeeksRemaining} week(s) until the transfer deadline. Negotiate early; clubs may reject late bids.`
                  : 'The transfer window is closed. Scouting remains available; official offers reopen in the next window.'}
              </div>
            </div>
            <span className="rounded-lg bg-black/20 px-3 py-2 text-[11px] font-bold text-slate-200">
              {save.transferWindowOpen ? `WEEK ${save.currentWeek} / ${transferDeadlineWeek}` : 'WINDOW CLOSED'}
            </span>
          </div>

            {save.transferOffers.length > 0 && (
              <div className="rounded-xl bg-[#131A22] border border-amber-400/40 p-4 flex flex-col gap-3">
                <div className="text-sm font-bold text-amber-300">Incoming Transfer Bids</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {save.transferOffers.map((off) => {
                    const p = save.players[off.playerId];
                    const buyer = save.clubs[off.fromClubId];
                    if (!p || !buyer) return null;
                    return (
                      <div key={off.id} className="p-3 rounded-lg bg-[#0E141B] flex flex-col gap-2">
                        <div className="text-xs text-white font-semibold">
                          {buyer.name} bid €{(off.fee / 1000000).toFixed(2)}M for {p.name} ({p.overall} OVR)
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptIncomingBid(off.id)}
                            className="min-h-[38px] flex-1 rounded bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectIncomingBid(off.id)}
                            className="min-h-[38px] flex-1 rounded bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setMarketPage(0); }}
                    placeholder="Search global players..."
                    className="min-h-[42px] w-full pl-9 pr-3 rounded-lg bg-[#0B0F14] border border-white/15 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <select
                  value={posFilter}
                  onChange={(e) => { setPosFilter(e.target.value as Position | 'ALL'); setMarketPage(0); }}
                  className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-xs text-white"
                >
                  <option value="ALL">All Positions</option>
                  {(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'] as Position[]).map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs font-mono-num text-slate-300">
                Budget: <span className="text-cyan-400 font-bold">€{(club.finances.transferBudget / 1000000).toFixed(2)}M</span> ·{' '}
                {save.transferWindowOpen ? 'Window Open' : 'Window Closed'}
              </div>
            </div>

            <div className="manager-market-grid grid min-h-0 flex-1 grid-cols-2 lg:grid-cols-3 gap-2 overflow-hidden">
              {visibleMarketPlayers.map((p) => {
                const pClub = save.clubs[p.clubId];
                return (
                  <div key={p.id} className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PlayerPortrait
                        appearance={p.appearance}
                        jerseyPrimary={pClub?.primaryColor}
                        jerseySecondary={pClub?.secondaryColor}
                        size={48}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{p.name}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {p.position} · {pClub?.name} · Age {p.age}
                        </div>
                        <div className="text-xs font-mono-num text-cyan-400 mt-0.5">
                          OVR {p.overall} {p.scouted ? `· POT ${p.potential}` : ''} · €{(p.marketValue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!p.scouted && (
                        <button
                          type="button"
                          onClick={() => handleScoutPlayer(p.id)}
                          className="min-h-[38px] px-3 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
                        >
                          Scout
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openNegotiation(p)}
                        className="min-h-[38px] flex-1 px-3 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Negotiate Transfer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2 px-1 text-[10px] text-slate-400">
              <span>Showing {marketPlayers.length ? marketPage * 6 + 1 : 0}–{Math.min(marketPlayers.length, marketPage * 6 + 6)} of {marketPlayers.length} players</span>
              <div className="flex items-center gap-2"><button type="button" disabled={marketPage === 0} onClick={() => setMarketPage(p => Math.max(0, p - 1))} className="rounded border border-white/15 px-3 py-1.5 disabled:opacity-30">Previous</button><span>{marketPage + 1}/{marketPageCount}</span><button type="button" disabled={marketPage + 1 >= marketPageCount} onClick={() => setMarketPage(p => Math.min(marketPageCount - 1, p + 1))} className="rounded border border-white/15 px-3 py-1.5 disabled:opacity-30">Next</button></div>
            </div>

            {negTarget && <TransferNegotiationView save={save} player={negTarget} onUpdateSave={onUpdateSave} managerName={manager.name} onClose={() => setNegTarget(null)} />}
          </div>
        )}

        {tab === 'TRAINING' && (
          <div className="manager-training-screen grid min-h-0 grid-cols-2 gap-2 overflow-hidden">
            <div className="min-h-0 rounded-xl bg-[#131A22] border border-white/10 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Weekly Team Training</h3>
                <span className="text-xs text-slate-400">
                  {save.weekTrained ? 'Completed This Week' : 'Ready to Train'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'BALANCED', label: 'Balanced Drills', desc: 'Ball control & tactical cohesion' },
                  { id: 'ATTACKING', label: 'Attacking Finishing', desc: 'Boosts Finishing & Shooting growth' },
                  { id: 'POSSESSION', label: 'Possession Rondo', desc: 'Boosts Passing & Vision growth' },
                  { id: 'DEFENDING', label: 'Defensive Shape', desc: 'Boosts Tackling & Marking growth' },
                  { id: 'FITNESS', label: 'High-Intensity Pace', desc: 'Boosts Stamina & Speed growth' },
                  { id: 'RECOVERY', label: 'Active Recovery', desc: 'Restores +12% Squad Fitness' },
                ].map((dr) => (
                  <button
                    key={dr.id}
                    type="button"
                    disabled={save.weekTrained}
                    onClick={() => {
                      soundEngine.playClick();
                      onUpdateSave(applyTeamTraining(save, dr.id as TrainingFocus));
                    }}
                    className={`min-h-[68px] p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      save.weekTrained
                        ? 'bg-[#0B0F14] border-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-[#0B0F14] border-white/10 hover:border-cyan-400 text-white'
                    }`}
                  >
                    <div className="text-sm font-bold text-cyan-300">{dr.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{dr.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 rounded-xl bg-[#131A22] border border-white/10 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Youth Academy Pipeline</h3>
                  <p className="text-xs text-slate-400">Scout and promote 17-year-old homegrown prospects.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSave(promoteYouthProspect(save));
                  }}
                  className="min-h-[42px] px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Promote Prospect</span>
                </button>
              </div>
              <div className="grid min-h-0 grid-cols-2 content-start gap-1 overflow-hidden">
                {squad
                  .filter((p) => p.age <= 20 || p.isYouth)
                  .map((yp) => (
                    <div key={yp.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0E141B] text-xs">
                      <div>
                        <div className="font-semibold text-white">{yp.name}</div>
                        <div className="text-slate-400">
                          {yp.position} · Age {yp.age} · {yp.playingStyle}
                        </div>
                      </div>
                      <div className="text-right font-mono-num">
                        <div className="text-cyan-400 font-bold">{yp.overall} OVR</div>
                        <div className="text-slate-500">POT {yp.potential}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'COMPETITIONS' && <CompetitionsView save={save} />}

        {tab === 'CLUB' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Finances & Boardroom</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono-num">
                <div className="p-3 rounded-lg bg-[#0E141B]">
                  <div className="text-slate-400 font-sans">Transfer Budget</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    €{(club.finances.transferBudget / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0E141B]">
                  <div className="text-slate-400 font-sans">Weekly Wage Bill</div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    €{club.finances.weeklyWageBill.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0E141B]">
                  <div className="text-slate-400 font-sans">Cash Reserves</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    €{(club.finances.cashBalance / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0E141B]">
                  <div className="text-slate-400 font-sans">Matchday Income</div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    €{club.finances.matchdayIncomePerHomeGame.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0E141B] text-xs text-slate-300">
                <span className="text-slate-400 block mb-1">Board Mandate:</span>
                {club.boardExpectation} (Confidence: {manager.boardConfidence}%)
              </div>
            </div>

            <div className="rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-3">
              <div className="overflow-hidden rounded-lg border border-white/10">
                <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=75" alt="Football stadium and pitch" className="h-28 w-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Club Facilities</h3>
                <span className="text-xs font-bold text-cyan-300">LEVEL {club.facilitiesLevel ?? 1}/5</span>
              </div>
              <p className="text-xs text-slate-400">Upgrade the training complex to improve player development, sharpness and recovery from weekly training.</p>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">Next upgrade</span>
                <span className="font-mono-num font-bold text-white">€{(1_250_000 * (club.facilitiesLevel ?? 1)).toLocaleString()}</span>
              </div>
              <button type="button" disabled={(club.facilitiesLevel ?? 1) >= 5 || club.finances.cashBalance < 1_250_000 * (club.facilitiesLevel ?? 1)} onClick={handleUpgradeFacilities} className="min-h-[42px] rounded-lg bg-cyan-500 px-3 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
                {(club.facilitiesLevel ?? 1) >= 5 ? 'Facilities fully upgraded' : club.finances.cashBalance < 1_250_000 * (club.facilitiesLevel ?? 1) ? 'Not enough cash reserves' : 'Upgrade training facilities'}
              </button>
            </div>
            <div className="rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-lg font-bold text-white">Board Meeting</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Choose your approach</span>
              </div>
              <p className="text-xs text-slate-400">Your leadership decisions affect board confidence, dressing-room chemistry and your reputation.</p>
              <button type="button" onClick={() => handleBoardDecision('The manager publicly backs the squad and promises to compete together.', 2, 4, 1)} className="min-h-[42px] rounded-lg bg-[#0E141B] px-3 text-left text-xs font-semibold text-white hover:border hover:border-cyan-400">Back the squad · Build unity</button>
              <button type="button" onClick={() => handleBoardDecision('The manager commits to giving academy graduates a genuine pathway into the first team.', 1, 3, 2)} className="min-h-[42px] rounded-lg bg-[#0E141B] px-3 text-left text-xs font-semibold text-white hover:border hover:border-cyan-400">Commit to youth development</button>
              <button type="button" onClick={() => handleBoardDecision('The manager demands higher standards and makes immediate results the priority.', 3, -2, 2)} className="min-h-[42px] rounded-lg bg-[#0E141B] px-3 text-left text-xs font-semibold text-white hover:border hover:border-cyan-400">Demand immediate results</button>
            </div>
            <div className="rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                Managerial Legacy & Job Offers
              </h3>
              <div className="text-xs text-slate-300">
                Reputation: <span className="font-mono-num font-bold text-cyan-400">{manager.reputation}</span> · Philosophy:{' '}
                {manager.philosophy} · Record: {manager.wins}W-{manager.draws}D-{manager.losses}L
                {manager.nationalTeamId && (
                  <span className="block text-amber-300 mt-1">
                    National Team Coach: {save.nationalTeams[manager.nationalTeamId]?.name}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {manager.trophies.length === 0 ? (
                  <div className="text-xs text-slate-500">No trophies won yet. Win a league or cup to fill the cabinet.</div>
                ) : (
                  manager.trophies.map((t, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-xs text-amber-300">
                      {t}
                    </div>
                  ))
                )}
              </div>

              {manager.jobOffers.length > 0 && (
                <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Incoming Managerial Offers</span>
                  </div>
                  {manager.jobOffers.map((jo) => (
                    <div key={jo.clubId} className="p-3 rounded-lg bg-[#0E141B] flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <div className="font-bold text-white">{jo.clubName}</div>
                        <div className="text-slate-400">
                          {jo.leagueName} · €{jo.wage.toLocaleString()}/wk
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptJobOffer(jo.clubId)}
                        className="min-h-[38px] px-3 py-1.5 rounded bg-cyan-500 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        Accept Job
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'DEVELOPMENT' && <ClubDevelopmentHub save={save} onUpdateSave={onUpdateSave} />}

        {tab === 'SETTINGS' && (
          <div className="max-w-lg mx-auto rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
            <h3 className="text-xl font-bold text-white">Career Settings</h3>
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0E141B]">
              <span className="text-sm text-slate-200">Match Audio & Crowd FX</span>
              <button
                type="button"
                onClick={onToggleMute}
                className="min-h-[40px] px-4 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                {muted ? 'Muted (Enable)' : 'Enabled (Mute)'}
              </button>
            </div>
            <button
              type="button"
              onClick={onExitToTitle}
              className="min-h-[44px] w-full rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold cursor-pointer"
            >
              Save & Return to Title Screen
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
