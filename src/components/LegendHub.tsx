import React, { useState } from 'react';
import {
  ArrowLeft,
  Dumbbell,
  ArrowLeftRight,
  Trophy,
  Award,
  BarChart3,
  LogOut,
  Volume2,
  VolumeX,
  Flag,
  Smartphone,
  MessageCircle,
  Heart,
  Send,
  Users,
} from 'lucide-react';
import { CareerSave, Fixture, IndividualDrill, PlayerAttributes } from '../types/football';
import {
  advanceToNextSeason,
  advanceWeek,
  applyLegendDrill,
  executeTransfer,
  getNextUserFixture,
  sortStandings,
} from '../engine/careerEngine';
import { soundEngine } from '../engine/audio';
import { PlayerPortrait } from './PlayerPortrait';
import { CompetitionsView } from './CompetitionsView';
import { DayItem, PlayerHome, TableRow } from './CareerHome';

interface LegendHubProps {
  save: CareerSave;
  muted: boolean;
  onToggleMute: () => void;
  onUpdateSave: (next: CareerSave) => void;
  onLaunchMatch: (fixture: Fixture) => void;
  onExitToTitle: () => void;
}

type LegendSection = 'DASHBOARD' | 'PHONE' | 'MANAGER' | 'ATTRIBUTES' | 'TRAINING' | 'AGENT' | 'COMPETITIONS' | 'LEGACY' | 'SETTINGS';

const ATTRIBUTE_LABELS: Array<{ key: keyof PlayerAttributes; label: string }> = [
  { key: 'speed', label: 'Speed' },
  { key: 'acceleration', label: 'Acceleration' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'passing', label: 'Passing' },
  { key: 'vision', label: 'Vision' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'ballControl', label: 'Ball Control' },
  { key: 'crossing', label: 'Crossing' },
  { key: 'tackling', label: 'Tackling' },
  { key: 'marking', label: 'Marking' },
  { key: 'strength', label: 'Strength' },
  { key: 'stamina', label: 'Stamina' },
  { key: 'jumping', label: 'Jumping' },
  { key: 'heading', label: 'Heading' },
  { key: 'positioning', label: 'Positioning' },
  { key: 'reactions', label: 'Reactions' },
  { key: 'goalkeeping', label: 'Goalkeeping' },
];

export const LegendHub: React.FC<LegendHubProps> = ({
  save,
  muted,
  onToggleMute,
  onUpdateSave,
  onLaunchMatch,
  onExitToTitle,
}) => {
  const [tab, setTab] = useState<LegendSection>('DASHBOARD');
  const [contractNotice, setContractNotice] = useState('');
  const [phoneMode, setPhoneMode] = useState<'SOCIAL' | 'MESSAGES'>('SOCIAL');
  const legend = save.legend!;
  const player = save.players[legend.playerId];
  const club = save.clubs[save.userClubId];
  const league = save.leagues[club.leagueId];
  const nextFixture = getNextUserFixture(save);
  const leagueFinished = league.fixtures.every((f) => f.played);

  const isStarter = club.tactics.startingXI.includes(player.id);
  const isBench = club.tactics.bench.includes(player.id);
  const natTeam = legend.nationalTeamId ? save.nationalTeams[legend.nationalTeamId] : undefined;
  const teammates = Object.values(save.players).filter((p) => p.clubId === club.id && p.id !== player.id).sort((a, b) => b.overall - a.overall).slice(0, 4);
  const phoneMessages = legend.phoneMessages ?? [];
  const socialPosts = legend.socialPosts ?? [];
  const rivalClubId = nextFixture ? (nextFixture.homeClubId === club.id ? nextFixture.awayClubId : nextFixture.homeClubId) : '';
  const rivalSquadIds = save.clubs[rivalClubId]?.tactics.startingXI ?? save.nationalTeams[rivalClubId]?.squadPlayerIds ?? [];
  const rivalPlayer = rivalSquadIds.map((id) => save.players[id]).filter(Boolean).sort((a, b) => b.overall - a.overall)[0];


  const handleForwardTime = () => {
    soundEngine.playClick();
    if (nextFixture) {
      onLaunchMatch(nextFixture);
    } else if (leagueFinished) {
      soundEngine.playWhistle('FULL_TIME');
      onUpdateSave(advanceToNextSeason(save));
    } else {
      onUpdateSave(advanceWeek(save));
    }
  };

  const handleHomeNavigate = (key: string) => {
    soundEngine.playClick();
    if (key === 'matchday') {
      if (nextFixture) onLaunchMatch(nextFixture);
      else setTab('COMPETITIONS');
    } else if (key === 'training') setTab('TRAINING');
    else if (key === 'agent') setTab('AGENT');
    else if (key === 'national') setTab('COMPETITIONS');
    else if (key === 'history') setTab('LEGACY');
    else if (key === 'profile') setTab('ATTRIBUTES');
    else if (key === 'settings') setTab('SETTINGS');
  };

  const handleAcceptAgentOffer = (offerId: string) => {
    const offer = legend.agentOffers.find((o) => o.id === offerId);
    if (!offer) return;
    soundEngine.playClick();
    if (offer.dealType === 'LOAN') {
      const parent = save.clubs[player.clubId];
      const destination = save.clubs[offer.fromClubId];
      if (!parent || !destination) return;
      const parentXI = parent.tactics.startingXI.filter((id) => id !== player.id);
      const parentBench = parent.tactics.bench.filter((id) => id !== player.id);
      const destinationBench = [...destination.tactics.bench.filter((id) => id !== player.id), player.id].slice(-7);
      onUpdateSave({ ...save, players: { ...save.players, [player.id]: { ...player, clubId: destination.id, loanParentClubId: parent.id, loanWeeksRemaining: 12, morale: Math.min(100, player.morale + 4) } }, clubs: { ...save.clubs, [parent.id]: { ...parent, tactics: { ...parent.tactics, startingXI: parentXI, bench: parentBench } }, [destination.id]: { ...destination, tactics: { ...destination.tactics, bench: destinationBench } } }, legend: { ...legend, agentOffers: legend.agentOffers.filter((o) => o.id !== offerId), loanRequestPending: false }, news: [{ id: 'loan_start_' + Date.now(), week: save.currentWeek, season: save.season, category: 'TRANSFER', headline: player.name + ' joins ' + destination.name + ' on loan', body: 'The move lasts 12 in-game weeks, after which the player returns to ' + parent.name + '.' }, ...save.news].slice(0, 35) });
      setTab('DASHBOARD');
      return;
    }
    const updated = executeTransfer(save, player.id, offer.fromClubId, offer.fee, offer.proposedWage, offer.contractYears, offer.releaseClause);
    onUpdateSave(updated);
    setTab('DASHBOARD');
  };

  const handleRequestTransfer = () => {
    soundEngine.playClick();
    const suitors = Object.values(save.clubs)
      .filter((c) => c.id !== club.id && c.reputation >= club.reputation - 4 && c.reputation <= player.overall + 10)
      .slice(0, 2);

    if (suitors.length === 0) return;

    const newOffers = suitors.map((s, idx) => ({
      id: `req_off_${Date.now()}_${idx}`,
      playerId: player.id,
      fromClubId: s.id,
      toClubId: club.id,
      dealType: 'PERMANENT' as const,
      fee: player.marketValue,
      proposedWage: Math.round((player.weeklyWage * 1.2) / 500) * 500,
      contractYears: 4,
      signingBonus: Math.round(player.marketValue * 0.06),
      releaseClause: player.marketValue * 2,
      status: 'PENDING' as const,
      round: 1,
      message: `${s.name} responded to your transfer request with an immediate contract offer.`,
      isIncomingToUser: true,
    }));

    onUpdateSave({
      ...save,
      legend: {
        ...legend,
        managerTrust: Math.max(25, legend.managerTrust - 8),
        agentOffers: [...newOffers, ...legend.agentOffers].slice(0, 4),
      },
    });
  };


  const handleRequestLoan = () => {
    soundEngine.playClick();
    if (player.loanParentClubId || legend.loanRequestPending || legend.squadRole === 'KEY_STAR' || legend.squadRole === 'CAPTAIN') return;
    const destinations = Object.values(save.clubs).filter((c) => c.id !== club.id && c.reputation <= club.reputation + 12 && c.reputation >= club.reputation - 25).sort((a,b) => Math.abs(a.reputation - player.overall) - Math.abs(b.reputation - player.overall)).slice(0, 2);
    if (!destinations.length) return;
    const offers = destinations.map((destination, index) => ({ id: 'loan_offer_' + Date.now() + '_' + index, playerId: player.id, fromClubId: destination.id, toClubId: club.id, dealType: 'LOAN' as const, fee: 0, loanFee: 0, proposedWage: player.weeklyWage, contractYears: 1, signingBonus: 0, releaseClause: player.releaseClause, status: 'PENDING' as const, round: 1, message: destination.name + ' can offer regular first-team football on a 12-week loan.', isIncomingToUser: true }));
    onUpdateSave({ ...save, legend: { ...legend, loanRequestPending: true, managerTrust: Math.max(15, legend.managerTrust - 4), agentOffers: [...offers, ...legend.agentOffers].slice(0, 4), phoneNotifications: [{ id: 'loan_request_' + Date.now(), title: 'Loan request submitted', body: 'Your agent has arranged temporary opportunities. Review the clubs in Agent & Transfers.', kind: 'TRANSFER' as const, week: save.currentWeek, season: save.season }, ...(legend.phoneNotifications ?? [])].slice(0, 20) }, news: [{ id: 'loan_news_' + Date.now(), week: save.currentWeek, season: save.season, category: 'TRANSFER', headline: player.name + ' asks for a loan move', body: 'The player wants regular minutes and has asked the club to consider a temporary move.' }, ...save.news].slice(0, 35) });
  };

  const handleRetire = () => {
    soundEngine.playWhistle('FULL_TIME');
    const totalApps = player.careerHistory.reduce((s, h) => s + h.appearances, player.seasonStats.appearances);
    const totalGoals = player.careerHistory.reduce((s, h) => s + h.goals, player.seasonStats.goals);
    const totalAssists = player.careerHistory.reduce((s, h) => s + h.assists, player.seasonStats.assists);
    onUpdateSave({
      ...save,
      legend: {
        ...legend,
        retired: true,
        retirementSummary: `${player.name} retired at age ${player.age} after ${totalApps} senior appearances, ${totalGoals} goals, ${totalAssists} assists, ${player.internationalCaps} international caps, and ${legend.trophies.length} major trophies.`,
      },
    });
  };

  if (legend.retired) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-xl bg-[#131A22] border border-amber-400/50 p-6 flex flex-col gap-5 text-center">
          <div className="mx-auto">
            <PlayerPortrait
              appearance={player.appearance}
              jerseyPrimary={club.primaryColor}
              jerseySecondary={club.secondaryColor}
              size={96}
              className="border-2 border-amber-400"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Hall of Fame Retirement</div>
            <h1 className="text-3xl font-bold text-white mt-1">{player.name}</h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">{legend.retirementSummary}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs font-mono-num">
            <div className="p-3 rounded-lg bg-[#0E141B]">
              <div className="text-slate-400">Peak OVR</div>
              <div className="text-xl font-bold text-amber-400">{player.overall}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0E141B]">
              <div className="text-slate-400">Trophies</div>
              <div className="text-xl font-bold text-white">{legend.trophies.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0E141B]">
              <div className="text-slate-400">Awards</div>
              <div className="text-xl font-bold text-white">{legend.individualAwards.length}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onExitToTitle}
            className="min-h-[46px] w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    );
  }

  if (tab === 'DASHBOARD') {
    const opp = nextFixture
      ? save.clubs[nextFixture.homeClubId === club.id ? nextFixture.awayClubId : nextFixture.homeClubId] ??
        save.nationalTeams[nextFixture.homeClubId === club.id ? nextFixture.awayClubId : nextFixture.homeClubId]
      : undefined;

    const days: DayItem[] = [
      { label: `Week ${save.currentWeek}`, sub: `(${legend.squadRole.replace('_', ' ')})`, icon: '📋', active: false },
      { label: 'Training', sub: save.weekTrained ? '(Done)' : '(Drill Ready)', icon: '🏋', active: !save.weekTrained && !nextFixture },
      {
        label: nextFixture ? `vs ${'shortName' in (opp ?? {}) ? (opp as { shortName: string }).shortName : (opp as { code?: string })?.code ?? 'OPP'}` : 'Rest Day',
        sub: nextFixture ? (isStarter ? '(Starter)' : isBench ? '(Bench)' : '(Reserves)') : '(Off)',
        icon: '⚽',
        active: Boolean(nextFixture),
      },
      {
        label: legend.internationalCallUp && natTeam ? natTeam.code : `Season ${save.season}`,
        sub: legend.internationalCallUp ? '(Called Up)' : `(${player.seasonStats.goals}G ${player.seasonStats.assists}A)`,
        icon: '🌍',
        active: false,
      },
    ];

    const keyAttrs =
      player.position === 'GK'
        ? [
            { label: 'Goalkeeping', value: player.attributes.goalkeeping },
            { label: 'Reactions', value: player.attributes.reactions },
            { label: 'Positioning', value: player.attributes.positioning },
            { label: 'Jumping', value: player.attributes.jumping },
            { label: 'Passing', value: player.attributes.passing },
          ]
        : ['CB', 'LB', 'RB', 'CDM'].includes(player.position)
        ? [
            { label: 'Tackling', value: player.attributes.tackling },
            { label: 'Marking', value: player.attributes.marking },
            { label: 'Positioning', value: player.attributes.positioning },
            { label: 'Speed', value: player.attributes.speed },
            { label: 'Stamina', value: player.attributes.stamina },
          ]
        : [
            { label: 'Finishing', value: player.attributes.finishing },
            { label: 'Dribbling', value: player.attributes.dribbling },
            { label: 'Passing', value: player.attributes.passing },
            { label: 'Speed', value: player.attributes.speed },
            { label: 'Vision', value: player.attributes.vision },
          ];

    const objectives = [
      `Selection: ${isStarter ? 'Starting XI' : isBench ? 'Bench Impact Sub' : 'Earn Starting Spot via Training'}`,
      player.position === 'GK' ? 'Target: Clean sheet & 7.0+ rating' : 'Target: Contribute goal/assist & 7.2+ rating',
      `Season Tally: ${player.seasonStats.goals}G · ${player.seasonStats.assists}A · ${player.seasonStats.averageRating ? player.seasonStats.averageRating.toFixed(1) : '--'} Avg`,
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

    const ticker = [
      ...save.news.slice(0, 5).map((n) => n.headline),
      `${player.name}: ${player.overall} OVR (${player.potential} POT) · Value €${(player.marketValue / 1000000).toFixed(1)}M`,
    ];

    return (
      <PlayerHome
        name={player.name}
        position={player.position}
        age={player.age}
        club={club.name}
        clubColor={club.primaryColor}
        number={player.shirtNumber}
        overall={player.overall}
        potential={player.potential}
        skin={player.appearance.skinTone}
        hair={player.appearance.hairColor}
        form={player.form}
        morale={player.morale}
        fitness={player.fitness}
        managerTrust={legend.managerTrust}
        attrs={keyAttrs}
        days={days}
        nextMatch={
          nextFixture && opp
            ? `${nextFixture.homeClubId === club.id ? 'vs' : '@'} ${opp.name}`
            : leagueFinished
            ? `Season ${save.season} Complete`
            : 'Midweek Recovery'
        }
        objectives={objectives}
        marketValue={`€${(player.marketValue / 1000000).toFixed(1)}M`}
        ticker={ticker}
        table={tableRows}
        leagueName={league.name}
        forwardTitle={nextFixture ? 'PLAY MATCHDAY' : leagueFinished ? `SEASON ${save.season + 1}` : 'FORWARD TIME'}
        forwardSub={
          nextFixture ? nextFixture.competitionName : leagueFinished ? 'Roll to next season' : 'Advance to next week'
        }
        onForward={handleForwardTime}
        onNavigate={handleHomeNavigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col">
      {/* Sub-page Header */}
      <header className="sticky top-0 z-30 bg-[#0E141B]/95 border-b border-amber-400/35 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setTab('DASHBOARD');
              }}
              className="min-h-[42px] px-3.5 py-2 rounded-lg bg-[#131A22] border border-white/15 hover:border-amber-400 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Career Home</span>
            </button>
            <PlayerPortrait
              appearance={player.appearance}
              jerseyPrimary={club.primaryColor}
              jerseySecondary={club.secondaryColor}
              size={40}
              className="border border-amber-400/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white">{player.name}</span>
                <span className="text-xs font-mono-num font-bold text-amber-400">
                  {player.overall} OVR · {player.position}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono-num">
                {club.name} · S{save.season} W{save.currentWeek}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {legend.internationalCallUp && natTeam && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 font-medium mr-2">
                <Flag className="w-3.5 h-3.5" />
                <span>{natTeam.name} International</span>
              </div>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              className="min-h-[40px] min-w-[40px] rounded-lg bg-[#131A22] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle sound"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
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
      <nav className="bg-[#131A22] border-b border-white/10 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1">
          {[
            { id: 'PHONE', label: 'My Phone', icon: Smartphone },
            { id: 'MANAGER', label: 'Manager Talks', icon: MessageCircle },
            { id: 'ATTRIBUTES', label: 'Player Profile', icon: BarChart3 },
            { id: 'TRAINING', label: 'Training Drills', icon: Dumbbell },
            { id: 'AGENT', label: 'Agent & Transfers', icon: ArrowLeftRight },
            { id: 'COMPETITIONS', label: 'Competitions', icon: Trophy },
            { id: 'LEGACY', label: 'Awards & History', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTab(item.id as LegendSection);
                }}
                className={`min-h-[46px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
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
      <main className="career-subpage-content flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-4 sm:py-5">
        {tab === 'MANAGER' && (
          <section className="rounded-xl bg-[#131A22] border border-white/10 p-4 sm:p-5 flex flex-col gap-4">
            <div><h2 className="text-lg font-bold text-white">Manager’s Office</h2><p className="text-xs text-slate-400">Discuss your role, minutes and future with the coaching staff.</p></div>
            <div className="rounded-lg bg-[#0b1118] border border-white/10 p-3"><div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Current squad status</div><div className="text-sm font-bold text-white mt-1">{legend.squadRole.replace(/_/g, ' ')} · Trust {legend.managerTrust}/100</div><div className="text-[11px] text-slate-400 mt-1">{player.injuredWeeks > 0 ? `${player.injuryType ?? 'Injury'} · ${player.injuredWeeks} week(s) remaining` : isStarter ? 'You are currently in the starting XI.' : isBench ? 'You are currently among the substitutes.' : 'You are outside the matchday squad.'}</div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" onClick={() => { soundEngine.playClick(); const trust = Math.min(100, legend.managerTrust + (player.seasonStats.averageRating >= 7 ? 5 : 2)); onUpdateSave({ ...save, legend: { ...legend, managerTrust: trust }, players: { ...save.players, [player.id]: { ...player, morale: Math.min(100, player.morale + 3) } }, news: [{ id: 'manager_minutes_' + Date.now(), week: save.currentWeek, season: save.season, category: 'MATCH', headline: player.name + ' asks the manager for more minutes', body: trust >= 65 ? 'The manager praised the player’s attitude and promised to consider more starts if performances continue.' : 'The manager asked the player to prove their quality in training before earning more minutes.' }, ...save.news].slice(0, 35) }); }} className="min-h-[46px] rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 text-xs font-bold text-amber-200">Ask for more playing time</button>
              <button type="button" onClick={() => { soundEngine.playClick(); onUpdateSave({ ...save, legend: { ...legend, managerTrust: Math.min(100, legend.managerTrust + 4) }, players: { ...save.players, [player.id]: { ...player, morale: Math.min(100, player.morale + 4), confidence: Math.min(100, player.confidence + 2) } }, news: [{ id: 'manager_promise_' + Date.now(), week: save.currentWeek, season: save.season, category: 'MATCH', headline: player.name + ' commits to earning a place', body: 'The player has promised to work hard in training and fight for a starting position.' }, ...save.news].slice(0, 35) }); }} className="min-h-[46px] rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-200">Promise to fight for my place</button>
            </div>
            <p className="text-[10px] text-slate-500">Your form, fitness, sharpness and positional rivals affect selection each week. Injuries reduce training recovery and can cost you your place.</p>
          </section>
        )}

        {tab === 'ATTRIBUTES' && (
          <div className="rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <PlayerPortrait
                  appearance={player.appearance}
                  jerseyPrimary={club.primaryColor}
                  jerseySecondary={club.secondaryColor}
                  size={72}
                  className="border border-amber-400/50"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                  <div className="text-xs text-slate-400">
                    {player.nationality} · Age {player.age} · {player.heightCm}cm · {player.weightKg}kg · {player.preferredFoot} Foot
                  </div>
                  <div className="text-xs text-amber-400 font-medium mt-1">
                    {player.position} ({player.playingStyle}) · Potential {player.potential}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-3xl font-extrabold text-amber-400">{player.overall}</div>
                <div className="text-xs text-slate-400">Overall Rating</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ATTRIBUTE_LABELS.map((item) => {
                const val = player.attributes[item.key];
                return (
                  <div key={item.key} className="p-3 rounded-lg bg-[#0E141B] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{item.label}</span>
                      <span
                        className={`font-mono-num font-bold ${
                          val >= 80 ? 'text-amber-400' : val >= 70 ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {val}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          val >= 80 ? 'bg-amber-400' : val >= 70 ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'PHONE' && (
          <section className="rounded-2xl border border-amber-400/25 bg-[#111923] p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-9 rounded-lg border-2 border-slate-500 bg-gradient-to-b from-slate-700 to-[#05080c] p-1 shadow-lg"><div className="h-full rounded bg-[#152a36] flex items-center justify-center"><Smartphone className="h-5 w-5 text-amber-300" /></div></div>
                <div><div className="text-xs uppercase tracking-[.2em] text-amber-400 font-bold">Player phone</div><h2 className="text-lg font-black text-white">Your life off the pitch</h2><p className="text-[11px] text-slate-400">Messages, teammates and your public profile</p></div>
              </div>
              <div className="text-right"><div className="text-lg font-bold text-white font-mono-num">{(legend.phoneFollowers ?? 1250).toLocaleString()}</div><div className="text-[10px] text-slate-500">Followers</div></div>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#080d13] p-1">
              <button type="button" onClick={() => setPhoneMode('SOCIAL')} className={`min-h-[40px] rounded-md text-xs font-bold flex items-center justify-center gap-2 ${phoneMode === 'SOCIAL' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}><Heart className="h-4 w-4" /> Social Feed</button>
              <button type="button" onClick={() => setPhoneMode('MESSAGES')} className={`min-h-[40px] rounded-md text-xs font-bold flex items-center justify-center gap-2 ${phoneMode === 'MESSAGES' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}><MessageCircle className="h-4 w-4" /> Teammates</button>
            </div>
            {phoneMode === 'SOCIAL' ? (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3">
              <div className="rounded-xl border border-rose-400/25 bg-[#0b1118] p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-full bg-rose-500/15 flex items-center justify-center text-lg">⚔️</div><div><div className="text-xs font-bold text-rose-300">Rival watch</div><div className="text-[11px] text-slate-300">{rivalPlayer && nextFixture ? `${rivalPlayer.name} · ${save.clubs[rivalClubId]?.name ?? save.nationalTeams[rivalClubId]?.name ?? 'Opposition'} · ${rivalPlayer.overall} OVR` : 'Your next opponent will appear here before matchday'}</div><div className="text-[10px] text-slate-500">Rivalry record: {legend.rivalryWins ?? 0} wins · {legend.rivalryLosses ?? 0} losses</div></div></div>
                {rivalPlayer && nextFixture && <button type="button" disabled={Boolean(legend.rivalryPending)} onClick={() => { soundEngine.playClick(); onUpdateSave({ ...save, legend: { ...legend, rivalryPlayerId: rivalPlayer.id, rivalryPending: true }, news: [{ id: 'rival_' + Date.now(), week: save.currentWeek, season: save.season, category: 'MATCH' as const, headline: player.name + ' accepts a personal rivalry challenge', body: player.name + ' has challenged ' + rivalPlayer.name + ' to settle who performs best in the upcoming match.' }, ...save.news].slice(0, 35) }); }} className="min-h-[38px] rounded-lg bg-rose-500/15 border border-rose-400/40 px-3 text-[11px] font-bold text-rose-200 disabled:opacity-60">{legend.rivalryPending && legend.rivalryPlayerId === rivalPlayer.id ? 'Challenge accepted' : 'Challenge rival'}</button>}
              </div>
                <div className="rounded-xl border border-white/10 bg-[#0b1118] p-3 flex flex-col gap-3">
                  <div><div className="text-sm font-bold text-white">Share an update</div><div className="text-[11px] text-slate-400">Your posts can lift your profile and attract attention</div></div>
                  {[
                    {caption:'Back on the training ground. Every session counts. 💪',label:'Post training update'},
                    {caption:'Proud to wear these colours. Time to give everything for the badge. 🏟️',label:'Show love for the club'},
                    {caption:'Big ambitions, one match at a time. The work never stops. ⚽',label:'Share your ambition'},
                  ].map((post) => <button key={post.label} type="button" onClick={() => { soundEngine.playClick(); const likes = Math.max(12, Math.round(player.reputation * 2 + player.overall * 1.4)); onUpdateSave({ ...save, legend: { ...legend, socialPosts: [{ id: 'post_' + Date.now(), caption: post.caption, likes, week: save.currentWeek, season: save.season, comments: ['Alex M.: Big things coming for you! 🔥', 'FootballDaily: Keep delivering on the pitch! ⚽'] }, ...socialPosts].slice(0, 20), phoneFollowers: (legend.phoneFollowers ?? 1250) + Math.max(3, Math.round(likes * 0.08)) }, players: { ...save.players, [player.id]: { ...player, morale: Math.min(100, player.morale + 1), reputation: Math.min(100, player.reputation + 1) } } }); }} className="min-h-[48px] rounded-lg border border-white/10 bg-[#141f2b] hover:border-amber-400/60 px-3 py-2 text-left"><span className="block text-xs font-semibold text-amber-200">{post.label}</span><span className="block text-[10px] text-slate-400 mt-0.5">{post.caption}</span></button>)}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Your timeline</div>
                  {socialPosts.length === 0 ? <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-xs text-slate-500">No posts yet. Share your first update to start building your profile.</div> : socialPosts.map((post) => <article key={post.id} className="rounded-xl border border-white/10 bg-[#0b1118] p-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-white">{player.name}</span><span className="text-[10px] text-slate-500">S{post.season} · W{post.week}</span></div><p className="text-xs text-slate-200 mt-2">{post.caption}</p><div className="flex items-center gap-1.5 mt-3 text-[11px] text-rose-300"><Heart className="h-3.5 w-3.5 fill-current" /> {post.likes.toLocaleString()} likes</div>{post.comments?.length ? <div className="mt-2 border-t border-white/10 pt-2 space-y-1">{post.comments.map((comment, index) => <p key={index} className="text-[10px] text-slate-400">{comment}</p>)}</div> : null}</article>)}
                  <div className="rounded-xl border border-amber-400/20 bg-[#0b1118] p-3"><div className="flex items-center justify-between mb-2"><div className="text-xs font-bold uppercase tracking-wider text-amber-300">Phone notifications</div><span className="text-[9px] text-slate-500">{(legend.phoneNotifications ?? []).length} updates</span></div>{(legend.phoneNotifications ?? []).length === 0 ? <p className="text-[11px] text-slate-500">Your matchday reactions and personal updates will appear here.</p> : <div className="space-y-2">{(legend.phoneNotifications ?? []).slice(0, 4).map((notice) => <div key={notice.id} className="rounded-lg bg-[#141f2b] p-2"><div className="text-[11px] font-bold text-white">{notice.title}</div><div className="text-[10px] text-slate-400 mt-0.5">{notice.body}</div></div>)}</div>}</div>{save.news.slice(0, 6).map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-[#0b1118] p-3"><div className="text-[10px] uppercase text-cyan-300 font-bold">{item.category === 'TRANSFER' ? 'Transfer news' : item.category === 'BOARD' ? 'Club announcement' : 'Football news'}</div><div className="text-xs text-white font-semibold mt-1">{item.headline}</div><div className="text-[11px] text-slate-400 mt-1">{item.body}</div></article>)}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teammates.length === 0 ? <div className="rounded-xl bg-[#0b1118] p-4 text-xs text-slate-400">Your teammate inbox will appear when you join a squad.</div> : teammates.map((mate, index) => {
                  const starter = [
                    `Good session today. We should link up more in training.`,
                    `How are you feeling about the next match? We need everyone switched on.`,
                    `Keep working like that and you'll be a big player for this club.`,
                    `Fancy staying after training for a few extra drills?`,
                  ][index];
                  const thread = phoneMessages.filter((message) => message.teammateId === mate.id);
                  const lastMessage = thread[thread.length - 1];
                  return <article key={mate.id} className="rounded-xl border border-white/10 bg-[#0b1118] p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-xs font-black text-amber-300">{mate.name.split(' ').map((part) => part[0]).slice(0,2).join('')}</div><div className="min-w-0"><div className="text-xs font-bold text-white truncate">{mate.name}</div><div className="text-[10px] text-slate-500">{mate.position} · {mate.overall} OVR</div></div><span className="ml-auto text-[9px] text-emerald-400">TEAMMATE</span></div>
                    <div className="rounded-lg bg-[#151f2a] p-2 text-[11px] text-slate-300">{lastMessage ? lastMessage.text : starter}</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {['Let’s keep pushing together.','I’m focused. Let’s win the next one.','Thanks, that means a lot.'].map((reply) => <button key={reply} type="button" onClick={() => { soundEngine.playClick(); const inbox = phoneMessages.length ? phoneMessages : teammates.map((teammate, idx) => ({ id: 'starter_' + teammate.id, teammateId: teammate.id, teammateName: teammate.name, from: 'TEAMMATE' as const, text: [`Good session today. We should link up more in training.`,`How are you feeling about the next match? We need everyone switched on.`,`Keep working like that and you'll be a big player for this club.`,`Fancy staying after training for a few extra drills?`][idx], week: save.currentWeek, season: save.season })); const nextInbox = [...inbox, { id: 'reply_' + Date.now(), teammateId: mate.id, teammateName: mate.name, from: 'PLAYER' as const, text: reply, week: save.currentWeek, season: save.season }, { id: 'answer_' + (Date.now()+1), teammateId: mate.id, teammateName: mate.name, from: 'TEAMMATE' as const, text: index === 1 ? 'That’s the spirit. Let’s make it happen on matchday.' : 'Respect. We’re stronger when we push each other.', week: save.currentWeek, season: save.season }]; onUpdateSave({ ...save, legend: { ...legend, phoneMessages: nextInbox.slice(-60) }, players: { ...save.players, [player.id]: { ...player, morale: Math.min(100, player.morale + 1) } }, clubs: { ...save.clubs, [club.id]: { ...club, chemistry: Math.min(100, club.chemistry + 1) } } }); }} className="min-h-[34px] rounded-md border border-white/10 px-2 py-1.5 text-left text-[10px] text-amber-200 hover:bg-amber-400/10">{reply}</button>)}
                    </div>
                  </article>;
                })}
              </div>
            )}
          </section>
        )}

        {tab === 'TRAINING' && (
          <div className="rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Individual Training Session</h3>
                <p className="text-xs text-slate-400">
                  Attend one focused drill per week to develop your attributes and impress the manager.
                </p>
              </div>
              <span className="text-xs font-mono-num text-amber-400">
                {save.weekTrained ? 'Trained This Week' : 'Session Available'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'FINISHING', label: 'Finishing & Shot Power', desc: '+Finishing, +Shooting' },
                { id: 'PACE_AGILITY', label: 'Sprint & Acceleration', desc: '+Speed, +Acceleration' },
                { id: 'VISION_PASSING', label: 'Playmaking Rondo', desc: '+Passing, +Vision' },
                { id: 'DRIBBLING', label: 'Close Control Slalom', desc: '+Dribbling, +Ball Control' },
                { id: 'DEFENSIVE_DUELS', label: '1v1 Tackling & Marking', desc: '+Tackling, +Marking' },
                { id: 'STAMINA_STRENGTH', label: 'Athletic Conditioning', desc: '+Stamina, +Strength' },
                { id: 'GOALKEEPING', label: 'Shot-Stopping & Reflexes', desc: '+Goalkeeping, +Reactions' },
              ].map((dr) => (
                <button
                  key={dr.id}
                  type="button"
                  disabled={save.weekTrained}
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSave(applyLegendDrill(save, dr.id as IndividualDrill));
                  }}
                  className={`min-h-[72px] p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                    save.weekTrained
                      ? 'bg-[#0B0F14] border-white/5 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0B0F14] border-white/10 hover:border-amber-400 text-white'
                  }`}
                >
                  <div className="text-sm font-bold text-amber-300">{dr.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{dr.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'AGENT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white">Contract & Agent</h3>
              <div className="text-xs text-slate-300 flex flex-col gap-2">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Current Club</span>
                  <span className="font-semibold text-white">{club.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Weekly Wage</span>
                  <span className="font-mono-num text-white">€{player.weeklyWage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Contract Remaining</span>
                  <span className="font-mono-num text-white">{player.contractYears} Years</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Release Clause</span>
                  <span className="font-mono-num text-white">€{(player.releaseClause / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {player.contractYears <= 1 && (
                <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">Contract entering its final season. Renew now to protect your future.</div>
              )}
              <button
                type="button"
                disabled={player.contractYears >= 3}
                onClick={() => {
                  const renewedWage = Math.round((player.weeklyWage * 1.18) / 500) * 500;
                  onUpdateSave({
                    ...save,
                    players: { ...save.players, [player.id]: { ...player, contractYears: 4, weeklyWage: renewedWage, releaseClause: Math.max(player.releaseClause, player.marketValue * 1.8), morale: Math.min(100, player.morale + 5) } },
                    clubs: { ...save.clubs, [club.id]: { ...club, finances: { ...club.finances, weeklyWageBill: Math.max(0, club.finances.weeklyWageBill + renewedWage - player.weeklyWage) } } },
                    legend: { ...legend, managerTrust: Math.min(100, legend.managerTrust + 2) },
                    news: [{ id: 'news_renew_' + Date.now(), week: save.currentWeek, season: save.season, category: 'TRANSFER' as const, headline: player.name + ' signs a new four-year contract', body: 'The new deal raises weekly wages to €' + renewedWage.toLocaleString() + ' and secures the player’s future.' }, ...save.news].slice(0, 35),
                  });
                  setContractNotice('New four-year deal agreed. Your wage has increased by 18%.');
                }}
                className="min-h-[42px] w-full rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/35 text-xs font-bold transition-colors cursor-pointer"
              >
                {player.contractYears >= 3 ? 'Contract Secure · ' + player.contractYears + ' Years Left' : 'Negotiate New 4-Year Contract (+18% wage)'}
              </button>
              {contractNotice && <p className="text-xs text-emerald-300">{contractNotice}</p>}
              <button
                type="button"
                onClick={handleRequestTransfer}
                disabled={legend.squadRole === 'ACADEMY_PROSPECT'}
                className="min-h-[42px] w-full rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {legend.squadRole === 'ACADEMY_PROSPECT' ? 'Earn Promotion Before Transfer Talks' : 'Ask Agent to Explore Transfer Offers'}
              </button>
            </div>

            <div className="lg:col-span-7 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white">Incoming Club Offers</h3>
              {legend.agentOffers.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">
                  No active transfer offers yet. Perform well in matches or ask your agent to seek offers.
                </div>
              ) : (
                legend.agentOffers.map((off) => {
                  const suitor = save.clubs[off.fromClubId];
                  if (!suitor) return null;
                  return (
                    <div key={off.id} className="p-4 rounded-lg bg-[#0E141B] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-white">{suitor.name}</div>
                        <div className="text-xs text-slate-400 font-mono-num">
                          €{off.proposedWage.toLocaleString()}/wk · {off.contractYears} yrs · Bonus €{off.signingBonus.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{off.message}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptAgentOffer(off.id)}
                        className="min-h-[42px] px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        Sign Contract
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === 'COMPETITIONS' && <CompetitionsView save={save} />}

        {tab === 'LEGACY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Career History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono-num">
                  <thead className="text-slate-400 bg-[#0E141B]">
                    <tr>
                      <th className="py-2 px-3">Season</th>
                      <th className="py-2 px-3">Club</th>
                      <th className="py-2 px-2 text-right">Apps</th>
                      <th className="py-2 px-2 text-right">G</th>
                      <th className="py-2 px-2 text-right">A</th>
                      <th className="py-2 px-3 text-right">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {player.careerHistory.map((h, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3">S{h.season}</td>
                        <td className="py-2 px-3 font-sans text-white">{h.clubName}</td>
                        <td className="py-2 px-2 text-right">{h.appearances}</td>
                        <td className="py-2 px-2 text-right">{h.goals}</td>
                        <td className="py-2 px-2 text-right">{h.assists}</td>
                        <td className="py-2 px-3 text-right">{h.averageRating.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-500/10">
                      <td className="py-2 px-3">S{save.season}*</td>
                      <td className="py-2 px-3 font-sans text-amber-300">{club.name}</td>
                      <td className="py-2 px-2 text-right">{player.seasonStats.appearances}</td>
                      <td className="py-2 px-2 text-right">{player.seasonStats.goals}</td>
                      <td className="py-2 px-2 text-right">{player.seasonStats.assists}</td>
                      <td className="py-2 px-3 text-right">
                        {player.seasonStats.averageRating ? player.seasonStats.averageRating.toFixed(2) : '--'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Trophies & Honours</h3>
              <div className="flex flex-col gap-2">
                {legend.trophies.length === 0 && legend.individualAwards.length === 0 ? (
                  <div className="text-xs text-slate-500">No major silverware or individual honours yet.</div>
                ) : (
                  <>
                    {legend.trophies.map((t, i) => (
                      <div key={`t_${i}`} className="px-3 py-2 rounded bg-amber-500/15 border border-amber-400/30 text-xs text-amber-300">
                        Trophy: {t}
                      </div>
                    ))}
                    {legend.individualAwards.map((a, i) => (
                      <div key={`a_${i}`} className="px-3 py-2 rounded bg-cyan-500/15 border border-cyan-400/30 text-xs text-cyan-300">
                        Season {a.season}: {a.award}
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleRetire}
                  className="min-h-[42px] w-full rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-xs text-slate-300 hover:text-rose-200 font-semibold transition-colors cursor-pointer"
                >
                  Announce Retirement & Enter Hall of Fame
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'SETTINGS' && (
          <div className="max-w-lg mx-auto rounded-xl bg-[#131A22] border border-white/10 p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white">Career Settings</h3>
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0E141B]">
              <span className="text-sm text-slate-200">Match Audio & Crowd FX</span>
              <button
                type="button"
                onClick={onToggleMute}
                className="min-h-[40px] px-4 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold cursor-pointer"
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
