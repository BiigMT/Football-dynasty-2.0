import React, { useEffect, useState } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
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
import { GameOrientation } from './OrientationSelect';
import {
  advanceToNextSeason,
  advanceWeek,
  applyLegendDrill,
  executeTransfer,
  getNextUserFixture,
  sortStandings,
} from '../engine/careerEngine';
import { soundEngine } from '../engine/audio';
import { calculateMarketValue, calculateOverall } from '../engine/database';
import { PlayerPortrait } from './PlayerPortrait';
import { resolveMatchFixingChoice } from '../engine/playerLife';
import { findNation } from '../data/nationsDatabase';
import { CompetitionsView } from './CompetitionsView';
import { DayItem, PlayerHome, TableRow } from './CareerHome';
import { PlayerPhone } from './PlayerPhone';
import { getCareerRecords } from '../engine/careerRecords';
import { resolveTeammateInteraction, getTeammateRelationship } from '../engine/careerRelationships';
import { resolveManagerConversation } from '../engine/playerCareerDecisions';

interface LegendHubProps {
  save: CareerSave;
  orientation: GameOrientation;
  onOrientationChange: (next: GameOrientation) => void;
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

const marketValueLabel = (value: number) => value >= 1000000 ? `€${(value / 1000000).toFixed(1)}M` : `€${Math.round(value / 1000)}K`;

export const LegendHub: React.FC<LegendHubProps> = ({
  save,
  orientation,
  onOrientationChange,
  muted,
  onToggleMute,
  onUpdateSave,
  onLaunchMatch,
  onExitToTitle,
}) => {
  const [tab, setTab] = useState<LegendSection>('DASHBOARD');
  const [contractNotice, setContractNotice] = useState('');
  
  const [negotiatingOfferId, setNegotiatingOfferId] = useState<string | null>(null);
  useEffect(() => {
    void ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => undefined);
  }, []);
  const legend = save.legend!;
  const player = save.players[legend.playerId];
  const club = save.clubs[save.userClubId];
  const league = save.leagues[club.leagueId];
  const nextFixture = getNextUserFixture(save);
  const leagueFinished = league.fixtures.every((f) => f.played);

  const isStarter = club.tactics.startingXI.includes(player.id);
  const isBench = club.tactics.bench.includes(player.id);
  const natTeam = legend.nationalTeamId ? save.nationalTeams[legend.nationalTeamId] : undefined;
  const nationProfile = findNation(player.nationality);
  const u21CallUpOvr = nationProfile?.u21OvrRequired ?? 66;
  const seniorCallUpOvr = nationProfile?.seniorOvrRequired ?? 76;
  const teammates = Object.values(save.players).filter((p) => p.clubId === club.id && p.id !== player.id).sort((a, b) => b.overall - a.overall).slice(0, 4);
  const positionDepth = Object.values(save.players)
    .filter((p) => p.clubId === club.id && (p.position === player.position || p.secondaryPositions.includes(player.position)))
    .sort((a, b) => b.overall - a.overall);
  const positionRank = Math.max(1, positionDepth.findIndex((p) => p.id === player.id) + 1);
  const positionLeader = positionDepth[0];
  const phoneMessages = legend.phoneMessages ?? [];
  const socialPosts = legend.socialPosts ?? [];
  const matchFixing = legend.matchFixing;
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
      onUpdateSave({ ...save, userClubId: destination.id, players: { ...save.players, [player.id]: { ...player, clubId: destination.id, loanParentClubId: parent.id, loanWeeksRemaining: 12, morale: Math.min(100, player.morale + 4) } }, clubs: { ...save.clubs, [parent.id]: { ...parent, tactics: { ...parent.tactics, startingXI: parentXI, bench: parentBench } }, [destination.id]: { ...destination, tactics: { ...destination.tactics, bench: destinationBench } } }, legend: { ...legend, agentOffers: legend.agentOffers.filter((o) => o.id !== offerId), loanRequestPending: false }, news: [{ id: 'loan_start_' + Date.now(), week: save.currentWeek, season: save.season, category: 'TRANSFER' as const, headline: player.name + ' joins ' + destination.name + ' on loan', body: 'The move lasts 12 in-game weeks, after which the player returns to ' + parent.name + '.' }, ...save.news].slice(0, 35) });
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
    onUpdateSave({ ...save, legend: { ...legend, loanRequestPending: true, managerTrust: Math.max(15, legend.managerTrust - 4), agentOffers: [...offers, ...legend.agentOffers].slice(0, 4), phoneNotifications: [{ id: 'loan_request_' + Date.now(), title: 'Loan request submitted', body: 'Your agent has arranged temporary opportunities. Review the clubs in Agent & Transfers.', kind: 'TRANSFER' as const, week: save.currentWeek, season: save.season }, ...(legend.phoneNotifications ?? [])].slice(0, 20) }, news: [{ id: 'loan_news_' + Date.now(), week: save.currentWeek, season: save.season, category: 'TRANSFER' as const, headline: player.name + ' asks for a loan move', body: 'The player wants regular minutes and has asked the club to consider a temporary move.' }, ...save.news].slice(0, 35) });
  };

  const spendSkillPoint = (attribute: keyof PlayerAttributes) => {
    const points = legend.skillPoints ?? 0;
    if (points < 1 || player.attributes[attribute] >= 99) return;
    const attributes = { ...player.attributes, [attribute]: Math.min(99, player.attributes[attribute] + 1) };
    const overall = calculateOverall(player.position, attributes);
    onUpdateSave({
      ...save,
      players: { ...save.players, [player.id]: { ...player, attributes, overall, marketValue: calculateMarketValue(overall, player.age, player.potential) } },
      legend: { ...legend, skillPoints: points - 1 },
    });
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
              playerId={player.id}
              playerName={player.name}
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

    const keyAttrs = [
      { label: 'PAC', value: player.attributes.speed },
      { label: 'SHO', value: player.attributes.shooting },
      { label: 'PAS', value: player.attributes.passing },
      { label: 'DRI', value: player.attributes.dribbling },
      { label: 'DEF', value: player.attributes.tackling },
      { label: 'PHY', value: player.attributes.strength },
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

    const upcomingFixtures = league.fixtures
      .filter((fixture) => !fixture.played && fixture.week >= save.currentWeek &&
        (fixture.homeClubId === club.id || fixture.awayClubId === club.id))
      .sort((a, b) => a.week - b.week)
      .slice(0, 5);

    return (
      <div className="fd-player-hub" data-player-hub="true">
        <header className="fd-player-head">
          <div className="fd-player-identity">
            <div className="fd-player-crest" style={{ background: club.primaryColor }}>
              <span>{club.shortName.slice(0, 3).toUpperCase()}</span>
            </div>
            <PlayerPortrait appearance={player.appearance}
              playerId={player.id}
              playerName={player.name} jerseyPrimary={club.primaryColor} jerseySecondary={club.secondaryColor} shirtNumber={player.shirtNumber} size={58} className="fd-player-headshot" />
            <div className="fd-player-headcopy">
              <div className="fd-player-kicker">FOOTBALL DYNASTY · BECOME A LEGEND</div>
              <h1>{player.name}</h1>
              <p>{player.position} · Age {player.age} · #{player.shirtNumber} · {club.name}</p>
            </div>
          </div>
          <div className="fd-player-meta">
            <div><strong>{player.overall}</strong><small>OVERALL</small></div>
            <div><strong>{player.potential}</strong><small>POTENTIAL</small></div>
            <div><strong>{marketValueLabel(player.marketValue)}</strong><small>MARKET VALUE</small></div>
            <div><strong>€{player.weeklyWage.toLocaleString()}</strong><small>WEEKLY WAGE</small></div>
            <div><strong>S{save.season} · W{save.currentWeek}</strong><small>SEASON / WEEK</small></div>
          </div>
          <div className="fd-player-head-actions">
            <button type="button" onClick={onToggleMute} aria-label="Toggle sound">{muted ? '♪ OFF' : '♪ ON'}</button>
            <button type="button" onClick={onExitToTitle}>EXIT</button>
          </div>
        </header>

        <nav className="fd-player-tabs" aria-label="Player career navigation">
          <button className={tab === 'DASHBOARD' ? 'is-active' : ''} aria-current={tab === 'DASHBOARD' ? 'page' : undefined} type="button" onClick={() => setTab('DASHBOARD')}><span>01</span> CENTRAL</button>
          <button type="button" onClick={() => setTab('PHONE')}><span>02</span> MY PHONE{(legend.phoneNotifications ?? []).length ? <i /> : null}</button>
          <button type="button" onClick={() => setTab('TRAINING')}><span>03</span> TRAINING & SKILLS{!save.weekTrained ? <i /> : null}</button>
          <button type="button" onClick={() => setTab('ATTRIBUTES')}><span>04</span> MY PROFILE</button>
          <button type="button" onClick={() => setTab('AGENT')}><span>05</span> AGENT & TRANSFERS{legend.agentOffers.length ? <i /> : null}</button>
          <button type="button" onClick={() => setTab('LEGACY')}><span>06</span> AWARDS & INTL</button>
          <button type="button" onClick={() => setTab('SETTINGS')}><span>07</span> SYSTEM</button>
        </nav>

        <div className="fd-player-matchbar">
          <div><small>{nextFixture ? 'NEXT FIXTURE READY' : 'CAREER PROGRESSION'}</small><strong>{nextFixture ? 'Your next match is waiting' : leagueFinished ? 'Season completed' : 'Continue your career'}</strong></div>
          <button type="button" className="fd-player-matchbar-cta" onClick={handleForwardTime}>{nextFixture ? '⚽ OPEN MATCHDAY' : leagueFinished ? 'START NEXT SEASON' : 'ADVANCE CAREER'} <span>→</span></button>
        </div>

        <main className="fd-player-layout">
          <section className="fd-player-showcase">
            <img className="fd-player-showcase-bg" src="/media/game/player-preparation.jpg" alt="" />
            <div className="fd-player-showcase-shade" />
            <div className="fd-player-watermark">{club.shortName}</div>
            <div className="fd-player-showcase-top">
              <span className="fd-player-pill">{legend.squadRole.replace(/_/g, ' ')}</span>
              <span className="fd-player-pill fd-player-gold">PLAYER SPOTLIGHT</span>
            </div>
            <div className="fd-player-portrait-stage">
              <PlayerPortrait appearance={player.appearance}
              playerId={player.id}
              playerName={player.name} jerseyPrimary={club.primaryColor} jerseySecondary={club.secondaryColor} shirtNumber={player.shirtNumber} size={210} className="fd-player-feature-portrait" />
              <div className="fd-player-rating"><strong>{player.overall}</strong><span>OVR</span><em>POT {player.potential}</em></div>
            </div>
            <div className="fd-player-showcase-copy">
              <div className="fd-player-kicker">THE ROAD TO GREATNESS · {club.name.toUpperCase()}</div>
              <h2>{player.name}</h2>
              <p>{player.position} · {player.playingStyle.replace(/_/g, ' ')} · Squad No. {player.shirtNumber}</p>
              <blockquote>“The next performance is the one that matters. Keep working, keep believing.”</blockquote>
              <div className="fd-player-condition">
                <span>FORM <b>{player.form}</b></span><span>MORALE <b>{player.morale}</b></span><span>FITNESS <b>{player.fitness}</b></span><span>TRUST <b>{legend.managerTrust}</b></span>
              </div>
              <button className="fd-player-match-cta" type="button" onClick={handleForwardTime}>{nextFixture ? 'KICK OFF MATCH' : leagueFinished ? 'START NEXT SEASON' : 'ADVANCE CAREER'} <span>→</span></button>
            </div>
          </section>

          <section className="fd-player-panel fd-player-objectives">
            <div className="fd-player-panel-title"><div><small>MANAGER & AGENT OBJECTIVES</small><h3>YOUR NEXT BREAKTHROUGH</h3></div><span className="fd-player-trust-score">{legend.managerTrust} TRUST</span></div>
            <div className="fd-player-objective-status"><b>{legend.managerTrust >= 65 ? 'IN THE FIRST-TEAM FRAME' : 'FIGHTING FOR BENCH SPOT'}</b><span>Manager confidence · {legend.managerTrust}%</span><div className="fd-player-stat-track"><i style={{width: legend.managerTrust + '%'}} /></div></div>
            <div className="fd-player-objective-list">
              <div><span>●</span><b>Earn a promotion</b><strong>{legend.managerTrust}/65</strong></div>
              <div><span>●</span><b>Score reserve goals</b><strong>{player.seasonStats.goals}/3</strong></div>
              <div><span>●</span><b>Average match rating 7.0+</b><strong>{player.seasonStats.averageRating ? player.seasonStats.averageRating.toFixed(1) : '—'}</strong></div>
            </div>
            <div className="fd-player-quick-actions"><button type="button" onClick={() => setTab('TRAINING')}>WEEKLY TRAINING DRILL <b>+1 SKILL POINT READY</b></button><button type="button" onClick={() => setTab('COMPETITIONS')}>NATIONAL TEAM TRACKER <b>{natTeam?.name ?? player.nationality + ' U-21'}</b></button></div>
          </section>

          <aside className="fd-player-sidebar">
            <section className="fd-player-panel fd-player-attributes">
              <div className="fd-player-panel-title"><div><small>PLAYER PERFORMANCE</small><h3>KEY ATTRIBUTES</h3></div><button type="button" onClick={() => setTab('ATTRIBUTES')}>FULL PROFILE ↗</button></div>
              {keyAttrs.map((attr) => <div className="fd-player-stat" key={attr.label}><div><span>{attr.label}</span><b>{attr.value}</b></div><div className="fd-player-stat-track"><i style={{ width: `${Math.max(0, Math.min(100, attr.value))}%` }} /></div></div>)}
            </section>
            <section className="fd-player-panel fd-player-attributes">
              <div className="fd-player-panel-title"><div><small>SQUAD COMPETITION</small><h3>POSITION DEPTH · {player.position}</h3></div><span>RANK {positionRank}/{positionDepth.length}</span></div>
              <div className="fd-player-depth-list">
                {positionDepth.slice(0, 4).map((peer, index) => <div className="fd-player-stat" key={peer.id}><div><span>{index + 1}. {peer.name}{peer.id === player.id ? ' · YOU' : ''}</span><b>{peer.overall} OVR</b></div><div className="fd-player-stat-track"><i style={{ width: peer.overall + '%' }} /></div></div>)}
                {!positionDepth.length && <p className="fd-player-empty">No direct positional competition found.</p>}
              </div>
              <p className="fd-player-empty">{positionLeader?.id === player.id ? 'You are currently the highest-rated option in your position.' : positionLeader ? positionLeader.name + ' leads the position group. Close the ' + Math.max(0, positionLeader.overall - player.overall) + '-point OVR gap to challenge.' : 'Position depth updates with the squad.'}</p>
            </section>
            <section className="fd-player-panel fd-player-attributes">
              <div className="fd-player-panel-title"><div><small>REAL-TIME CAREER SYSTEMS</small><h3>PLAYER CONDITION & MATCH INTELLIGENCE</h3></div><span className="text-emerald-300">LIVE</span></div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'FITNESS', value: player.fitness, detail: 'Rotation & workload' },
                  { label: 'FORM', value: player.form, detail: 'Recent performances' },
                  { label: 'SHARPNESS', value: player.sharpness, detail: 'Match readiness' },
                  { label: 'CONFIDENCE', value: player.confidence, detail: 'Player development' },
                ].map((metric) => <div key={metric.label} className="rounded-lg bg-[#0b1118] border border-white/10 p-2"><div className="flex items-center justify-between gap-2"><span className="text-[9px] text-slate-400 font-bold">{metric.label}</span><b className="text-xs text-white">{Math.round(metric.value)}</b></div><div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden"><i className="block h-full rounded-full bg-emerald-400" style={{ width: Math.max(0, Math.min(100, metric.value)) + '%' }} /></div><div className="text-[9px] text-slate-500 mt-1">{metric.detail}</div></div>)}
              </div>
              <div className="rounded-lg bg-[#0b1118] border border-white/10 p-2">
                <div className="flex items-center justify-between gap-2"><span className="text-[9px] text-slate-400 font-bold">MANAGER TRUST</span><b className="text-xs text-amber-300">{legend.managerTrust}/100</b></div>
                <div className="text-[10px] text-slate-400 mt-1">Development target: {player.overall}/{player.potential} OVR · {legend.skillPoints ?? 0} skill points available</div>
              </div>
              {nextFixture && <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-2"><div className="text-[9px] text-cyan-300 font-bold uppercase">Next opponent scouting</div><div className="text-[11px] text-white font-bold mt-1">{save.clubs[rivalClubId]?.name ?? save.nationalTeams[rivalClubId]?.name ?? 'Opposition'}</div><div className="text-[10px] text-slate-400 mt-0.5">{save.clubs[rivalClubId]?.tactics.formation ?? 'Formation data'} · {save.clubs[rivalClubId]?.tactics.mentality ?? 'Tactical plan'} · {isStarter ? 'You are currently selected' : isBench ? 'You are currently on the bench' : 'You are outside the matchday XI'}</div></div>}
              <div className="text-[9px] text-slate-500">AI managers adapt to scorelines and match momentum. AI clubs rotate tired players; training and match performances shape your growth and future selection.</div>
            </section>
            <section className="fd-player-panel fd-player-records">
              <div className="fd-player-panel-title"><div><small>THE CAREER SO FAR</small><h3>PLAYER RECORDS</h3></div><span>HISTORY</span></div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {getCareerRecords(player).map((record) => <div key={record.label} className="rounded-lg border border-white/10 bg-[#0b1118] p-2">
                  <small className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{record.label}</small>
                  <strong className="mt-1 block text-lg tabular-nums text-white">{record.value}</strong>
                  <span className="mt-1 block text-[9px] leading-snug text-slate-500">{record.detail}</span>
                </div>)}
              </div>
            </section>
            <section className="fd-player-panel fd-player-news-panel">
              <div className="fd-player-panel-title"><div><small>AROUND THE CLUB & THE FOOTBALL WORLD</small><h3>LATEST NEWS</h3></div><span>{save.news.length} STORIES</span></div>
              <div className="space-y-2">
                {save.news.slice(0, 4).map((item) => <article key={item.id} className="rounded-lg border border-white/10 bg-[#0b1118] px-3 py-2">
                  <div className="flex items-center justify-between gap-2"><span className="text-[9px] font-black uppercase tracking-wider text-cyan-300">{String(item.category).replace(/_/g, ' ')}</span><span className="text-[9px] text-slate-500">S{item.season} · W{item.week}</span></div>
                  <h4 className="mt-1 text-xs font-bold leading-snug text-white">{item.headline}</h4>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{item.body}</p>
                </article>)}
                {!save.news.length && <p className="fd-player-empty">Your career news will appear here as matches, transfers and club events unfold.</p>}
              </div>
            </section>
            <section className="fd-player-panel fd-player-table">
              <div className="fd-player-panel-title"><div><small>{league.name.toUpperCase()}</small><h3>LEAGUE TABLE</h3></div><span>TOP 5</span></div>
              <div className="fd-player-table-head"><span>#</span><span>CLUB</span><span>P</span><span>GD</span><span>PTS</span></div>
              {tableRows.slice(0, 5).map((row) => <div className={`fd-player-table-row${row.me ? ' is-user' : ''}`} key={row.club}><span>{row.pos}</span><span><i style={{ background: row.color || '#789' }} />{row.club}</span><span>{row.p}</span><span>{row.gd > 0 ? '+' : ''}{row.gd}</span><b>{row.pts}</b></div>)}
            </section>
            <section className="fd-player-panel fd-player-fixtures">
              <div className="fd-player-panel-title"><div><small>CAREER CALENDAR · SEASON {save.season}</small><h3>UPCOMING SCHEDULE</h3></div><span>5 EVENTS</span></div>
              <div className="fd-player-fixture-list">
                {upcomingFixtures.map((fixture) => {
                  const home = fixture.homeClubId === club.id;
                  const opponentId = home ? fixture.awayClubId : fixture.homeClubId;
                  const opponent = save.clubs[opponentId] ?? save.nationalTeams[opponentId];
                  return <div className="fd-player-fixture" key={fixture.id}><span className="fd-player-week">W{fixture.week}</span><div><b>{home ? 'VS' : '@'} {opponent?.name ?? 'TBC'}</b><small>{fixture.competitionName}</small></div><span className="fd-player-fixture-dot">●</span></div>;
                })}
                {!upcomingFixtures.length && <p className="fd-player-empty">No upcoming fixtures scheduled.</p>}
              </div>
            </section>
          </aside>
        </main>
        <footer className="fd-player-news"><b>DYNASTY NEWS</b><div>{ticker.slice(0, 5).map((item, index) => <span key={index}>{item}</span>)}</div><small>LIVE CAREER FEED</small></footer>
      </div>
    );
  }

  return (
    <div className="fd-realism-player min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col" data-layout={save.playerLayout ?? 'AUTO'}>
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
              playerId={player.id}
              playerName={player.name}
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
            <div className="hidden sm:flex items-center gap-3 rounded-lg border border-[#d5e3f4] bg-white/75 px-3 py-2"><span className="text-[10px] font-bold text-[#526782]">VALUE <b className="text-[#13386c]">{marketValueLabel(player.marketValue)}</b></span><span className="text-[10px] font-bold text-[#526782]">WAGE <b className="text-[#13386c]">€{player.weeklyWage.toLocaleString()}/wk</b></span></div>
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

      {/* Unified six-tab Player Career navigation */}
      <nav className="fd-player-tabs" aria-label="Player career navigation">
        {[
          { id: 'DASHBOARD', label: 'CENTRAL' },
          { id: 'TRAINING', label: 'TRAINING' },
          { id: 'ATTRIBUTES', label: 'PROFILE' },
          { id: 'AGENT', label: 'TRANSFERS' },
          { id: 'LEGACY', label: 'AWARDS' },
          { id: 'SETTINGS', label: 'SYSTEM' },
        ].map((item) => <button key={item.id} type="button" aria-current={tab === item.id ? 'page' : undefined} className={tab === item.id ? 'is-active' : ''} onClick={() => { soundEngine.playClick(); setTab(item.id as LegendSection); }}><span>{item.label}</span></button>)}
      </nav>

      {/* Main Content */}
      <main className="career-subpage-content fd-player-page-content flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-3">
        {tab === 'MANAGER' && (
          <section className="rounded-xl bg-[#131A22] border border-white/10 p-4 sm:p-5 flex flex-col gap-4">
            <div><h2 className="text-lg font-bold text-white">Manager’s Office</h2><p className="text-xs text-slate-400">Discuss your role, minutes and future with the coaching staff.</p></div>
            <div className="rounded-lg bg-[#0b1118] border border-white/10 p-3"><div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Current squad status</div><div className="text-sm font-bold text-white mt-1">{legend.squadRole.replace(/_/g, ' ')} · Trust {legend.managerTrust}/100</div><div className="text-[11px] text-slate-400 mt-1">{player.injuredWeeks > 0 ? `${player.injuryType ?? 'Injury'} · ${player.injuredWeeks} week(s) remaining` : isStarter ? 'You are currently in the starting XI.' : isBench ? 'You are currently among the substitutes.' : 'You are outside the matchday squad.'}</div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" onClick={() => { soundEngine.playClick(); const trust = Math.min(100, legend.managerTrust + (player.seasonStats.averageRating >= 7 ? 5 : 2)); onUpdateSave({ ...save, legend: { ...legend, managerTrust: trust }, players: { ...save.players, [player.id]: { ...player, morale: Math.min(100, player.morale + 3) } }, news: [{ id: 'manager_minutes_' + Date.now(), week: save.currentWeek, season: save.season, category: 'MATCH' as const, headline: player.name + ' asks the manager for more minutes', body: trust >= 65 ? 'The manager praised the player’s attitude and promised to consider more starts if performances continue.' : 'The manager asked the player to prove their quality in training before earning more minutes.' }, ...save.news].slice(0, 35) }); }} className="min-h-[46px] rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 text-xs font-bold text-amber-200">Ask for more playing time</button>
              <button type="button" onClick={() => { soundEngine.playClick(); onUpdateSave({ ...save, legend: { ...legend, managerTrust: Math.min(100, legend.managerTrust + 4) }, players: { ...save.players, [player.id]: { ...player, morale: Math.min(100, player.morale + 4), confidence: Math.min(100, player.confidence + 2) } }, news: [{ id: 'manager_promise_' + Date.now(), week: save.currentWeek, season: save.season, category: 'MATCH' as const, headline: player.name + ' commits to earning a place', body: 'The player has promised to work hard in training and fight for a starting position.' }, ...save.news].slice(0, 35) }); }} className="min-h-[46px] rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-200">Promise to fight for my place</button>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0b1118] p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Dressing room · Teammate relationships</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teammates.slice(0, 3).map((mate) => (
                  <div key={mate.id} className="rounded-md border border-white/10 bg-[#111a24] p-2">
                    <div className="flex items-center justify-between gap-2"><b className="text-xs text-white">{mate.name}</b><span className="text-[10px] text-cyan-200">REL {getTeammateRelationship(save, mate.id)}</span></div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(['PRAISE', 'ENCOURAGE', 'CHALLENGE', 'RECONCILE'] as const).map((action) => (
                        <button key={action} type="button" onClick={() => { soundEngine.playClick(); onUpdateSave(resolveTeammateInteraction(save, mate.id, action)); }} className="min-h-8 rounded border border-white/10 bg-white/5 px-2 text-[9px] font-bold text-slate-200 hover:border-cyan-300/50">{action}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0b1118] p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">Private meeting · Manager</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([{key:'ASK_FOR_MINUTES',label:'Ask for minutes'},{key:'PROMISE_LOYALTY',label:'Promise loyalty'},{key:'REQUEST_TRANSFER',label:'Request transfer'},{key:'APOLOGISE',label:'Apologise'}] as const).map((item) => (
                  <button key={item.key} type="button" onClick={() => { soundEngine.playClick(); onUpdateSave(resolveManagerConversation(save, item.key)); }} className="min-h-10 rounded-lg border border-amber-400/20 bg-amber-400/5 px-2 text-[10px] font-bold text-amber-100 hover:bg-amber-400/10">{item.label}</button>
                ))}
              </div>
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
              playerId={player.id}
              playerName={player.name}
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
                  {player.injuredWeeks > 0 && <div className="text-[11px] text-rose-300 mt-1">Injured: {player.injuryType ?? 'Injury'} · {player.injuredWeeks} week(s) remaining</div>}
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
          <PlayerPhone
            save={save}
            onUpdateSave={onUpdateSave}
            onBack={() => setTab('DASHBOARD')}
            onOpenTransfers={() => setTab('AGENT')}
            onOpenMatch={() => nextFixture ? onLaunchMatch(nextFixture) : setTab('COMPETITIONS')}
          />
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
            <div className="rounded-xl border border-amber-400/25 bg-[#0E141B] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs font-black uppercase tracking-wider text-amber-300">Development Skill Points</div><div className="text-[10px] text-slate-400">Earn one point for each weekly individual training session.</div></div><div className="text-2xl font-black text-amber-300">{legend.skillPoints ?? 0}</div></div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([{key:'speed',label:'Pace'},{key:'finishing',label:'Finishing'},{key:'passing',label:'Passing'},{key:'dribbling',label:'Dribbling'}] as Array<{key:keyof PlayerAttributes;label:string}>).map((item)=> <button key={item.key} type="button" disabled={(legend.skillPoints??0)<1 || player.attributes[item.key]>=99} onClick={()=>spendSkillPoint(item.key)} className="min-h-10 rounded-lg border border-white/10 bg-[#172b40] px-2 text-[10px] font-bold text-white disabled:opacity-35">+1 {item.label}</button>)}
              </div>
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
              <div className="rounded-lg border border-cyan-300/20 bg-[#0E141B] p-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-cyan-200">Choose your representative</div>
                <div className="mt-1 text-[10px] text-slate-400">A stronger agency improves the chance of receiving approaches during transfer windows.</div>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {[{name:'Independent Representative',rep:55,desc:'Personal attention · balanced network'},{name:'NextGen Sports Agency',rep:72,desc:'Youth development · emerging clubs'},{name:'Elite Global Agency',rep:90,desc:'Major clubs · stronger transfer network'}].map((agent)=> <button key={agent.name} type="button" onClick={()=>onUpdateSave({...save,legend:{...legend,agentName:agent.name,agentReputation:agent.rep}})} className={'rounded-lg border p-2 text-left '+((legend.agentName??'Independent Representative')===agent.name?'border-amber-300 bg-amber-300/10':'border-white/10 bg-[#101b29]')}><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-white">{agent.name}</span><span className="text-[10px] font-black text-amber-300">REP {agent.rep}</span></div><div className="text-[9px] text-slate-400">{agent.desc}</div></button>)}
                </div>
              </div>
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
                onClick={handleRequestLoan}
                disabled={Boolean(player.loanParentClubId || legend.loanRequestPending || legend.squadRole === 'KEY_STAR' || legend.squadRole === 'CAPTAIN')}
                className="min-h-[42px] w-full rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/35 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                {player.loanParentClubId ? `On Loan · ${player.loanWeeksRemaining ?? 0} Weeks Left` : legend.loanRequestPending ? 'Loan Request Submitted' : 'Ask Agent for a 12-Week Loan'}
              </button>
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
                          {off.dealType === 'LOAN' ? '12-week loan · temporary move' : `€${off.proposedWage.toLocaleString()}/wk · ${off.contractYears} yrs · Bonus €${off.signingBonus.toLocaleString()}`}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{off.message}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptAgentOffer(off.id)}
                        className="min-h-[42px] px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        {off.dealType === 'LOAN' ? 'Review Loan Terms' : 'Negotiate Contract'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {negotiatingOfferId && (() => { const offer = legend.agentOffers.find(o => o.id === negotiatingOfferId); const target = offer ? save.clubs[offer.fromClubId] : undefined; return offer && target ? <div className="fd-negotiation-overlay"><section className="fd-negotiation-room"><span className="fd-eyebrow">CONTRACT NEGOTIATION · ROUND {offer.round}</span><h2>{target.name} want to sign you</h2><p>Take a seat with the club representatives and review your proposed terms.</p><div className="fd-negotiation-terms"><div><span>WEEKLY WAGE</span><b>€{offer.proposedWage.toLocaleString()}</b></div><div><span>CONTRACT</span><b>{offer.contractYears} YEARS</b></div><div><span>SIGNING BONUS</span><b>€{offer.signingBonus.toLocaleString()}</b></div><div><span>TRANSFER FEE</span><b>€{offer.fee.toLocaleString()}</b></div></div><div className="fd-negotiation-actions"><button type="button" onClick={()=>setNegotiatingOfferId(null)}>DECLINE MEETING</button><button type="button" onClick={()=>{const nextWage=Math.round(offer.proposedWage*1.08/50)*50;onUpdateSave({...save,legend:{...legend,agentOffers:legend.agentOffers.map(o=>o.id===offer.id?{...o,proposedWage:nextWage,round:o.round+1,message:'Your agent countered the opening offer. The club has improved its wage proposal.'}:o)}});}}>COUNTER +8%</button><button type="button" onClick={()=>{handleAcceptAgentOffer(offer.id);setNegotiatingOfferId(null);}}>ACCEPT & SIGN</button></div></section></div> : null; })()}
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
          <div className="fd-system-console max-w-3xl mx-auto rounded-xl bg-[#131A22] border border-white/10 p-6 flex flex-col gap-4">
            <div><h3 className="text-xl font-bold text-white">Career Settings</h3><p className="text-xs text-slate-400 mt-1">These preferences are stored in this career save.</p></div>
            <section className="rounded-lg bg-[#0E141B] border border-white/10 p-3.5">
              <div className="flex items-center justify-between gap-3"><div><b className="text-sm text-slate-100">Career difficulty</b><p className="text-[11px] text-slate-500 mt-1">Affects development and match challenge where supported.</p></div><span className="text-xs font-bold text-[#235BA8]">{save.difficulty ?? 'NORMAL'}</span></div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {(['EASY', 'NORMAL', 'HARD'] as const).map(level => <button key={level} type="button" aria-pressed={(save.difficulty ?? 'NORMAL') === level} onClick={() => onUpdateSave({ ...save, difficulty: level })} className={`min-h-[40px] rounded-lg border text-xs font-bold ${(save.difficulty ?? 'NORMAL') === level ? 'bg-[#dcecff] border-[#235BA8] text-[#13386C]' : 'bg-white/5 border-white/10 text-slate-300'}`}>{level}</button>)}
              </div>
            </section>
            <section className="rounded-lg bg-[#0E141B] border border-white/10 p-3.5">
              <div><b className="text-sm text-slate-100">Device orientation</b><p className="text-[11px] text-slate-500 mt-1">Lock the phone display for Player Career. Auto restores system rotation.</p></div>
              <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-700">LANDSCAPE ONLY · Locked for gameplay</div>
            </section>
            <section className="rounded-lg bg-[#0E141B] border border-white/10 p-3.5">
              <div><b className="text-sm text-slate-100">Career layout</b><p className="text-[11px] text-slate-500 mt-1">Choose how wide the Player Career screens should appear.</p></div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {([{id:'AUTO',label:'AUTO'},{id:'COMPACT',label:'COMPACT'},{id:'WIDE',label:'WIDE'}] as const).map(layout => <button key={layout.id} type="button" aria-pressed={(save.playerLayout ?? 'AUTO') === layout.id} onClick={() => onUpdateSave({ ...save, playerLayout: layout.id })} className={`min-h-[40px] rounded-lg border text-xs font-bold ${(save.playerLayout ?? 'AUTO') === layout.id ? 'bg-[#dcecff] border-[#235BA8] text-[#13386C]' : 'bg-white/5 border-white/10 text-slate-300'}`}>{layout.label}</button>)}
              </div>
            </section>
            <section className="rounded-lg bg-[#0E141B] border border-white/10 p-3.5">
              <div><b className="text-sm text-slate-100">Screen orientation</b><p className="text-[11px] text-slate-500 mt-1">Saved on this device and applied when the platform supports rotation locking.</p></div>
              <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-700">LANDSCAPE ONLY · Portrait mode is disabled</div>
            </section>
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0E141B] border border-white/10">
              <span className="text-sm text-slate-200">Match Audio & Crowd FX</span>
              <button type="button" onClick={onToggleMute} className="min-h-[40px] px-4 rounded-lg bg-[#dcecff] text-[#13386C] text-xs font-semibold cursor-pointer">{muted ? 'Muted (Enable)' : 'Enabled (Mute)'}</button>
            </div>
            <button type="button" onClick={onExitToTitle} className="min-h-[44px] w-full rounded-lg bg-[#235BA8] hover:bg-[#13386C] text-white text-sm font-semibold cursor-pointer">Save & Return to Title Screen</button>
          </div>
        )}
      </main>
    </div>
  );
};
