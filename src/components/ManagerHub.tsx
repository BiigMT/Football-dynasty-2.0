import React, { useMemo, useState } from 'react';
import {
  Play,
  FastForward,
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
} from '../engine/careerEngine';
import { getFormationSlots } from '../engine/database';
import { getFormationCoordinates } from '../engine/matchEngine';
import { soundEngine } from '../engine/audio';
import { ClubBadge } from './ClubBadge';
import { PlayerPortrait } from './PlayerPortrait';
import { CompetitionsView } from './CompetitionsView';

interface ManagerHubProps {
  save: CareerSave;
  muted: boolean;
  onToggleMute: () => void;
  onUpdateSave: (next: CareerSave) => void;
  onLaunchMatch: (fixture: Fixture) => void;
  onExitToTitle: () => void;
}

export const ManagerHub: React.FC<ManagerHubProps> = ({
  save,
  muted,
  onToggleMute,
  onUpdateSave,
  onLaunchMatch,
  onExitToTitle,
}) => {
  const [tab, setTab] = useState<'DASHBOARD' | 'SQUAD' | 'TRANSFERS' | 'TRAINING' | 'COMPETITIONS' | 'CLUB'>('DASHBOARD');
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [negTarget, setNegTarget] = useState<Player | null>(null);
  const [dealType, setDealType] = useState<TransferDealType>('PERMANENT');
  const [offerFee, setOfferFee] = useState<number>(0);
  const [offerWage, setOfferWage] = useState<number>(0);
  const [offerYears, setOfferYears] = useState<number>(3);
  const [exchangeId, setExchangeId] = useState<string>('');
  const [negFeedback, setNegFeedback] = useState<string>('');

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
      setTimeout(() => setNegTarget(null), 900);
    }
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

  const formationCoords = getFormationCoordinates(club.tactics.formation);
  const formationSlots = getFormationSlots(club.tactics.formation);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col">
      {/* Top Club Header */}
      <header className="sticky top-0 z-30 bg-[#0E141B]/95 border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClubBadge
              shortName={club.shortName}
              primaryColor={club.primaryColor}
              secondaryColor={club.secondaryColor}
              size={38}
            />
            <div>
              <div className="text-base sm:text-lg font-bold text-white leading-tight">{club.name}</div>
              <div className="text-xs text-slate-400 font-mono-num">
                {manager.name} · Season {save.season} · Week {save.currentWeek} · Pos #{leaguePos}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block text-right font-mono-num">
              <div className="text-xs text-slate-400">Transfer Budget</div>
              <div className="text-sm font-bold text-cyan-400">
                €{(club.finances.transferBudget / 1000000).toFixed(2)}M
              </div>
            </div>
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
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#131A22] border-b border-white/10 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1">
          {[
            { id: 'DASHBOARD', label: 'Matchday Hub', icon: Play },
            { id: 'SQUAD', label: 'Squad & Tactics', icon: Users },
            { id: 'TRANSFERS', label: 'Transfers', icon: ArrowLeftRight },
            { id: 'TRAINING', label: 'Training & Academy', icon: Dumbbell },
            { id: 'COMPETITIONS', label: 'Competitions', icon: Trophy },
            { id: 'CLUB', label: 'Board & Legacy', icon: Building2 },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTab(item.id as typeof tab);
                }}
                className={`min-h-[46px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {tab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Next Match Focal Card */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="rounded-xl bg-[#131A22] border border-cyan-500/30 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400">
                    {nextFixture ? nextFixture.competitionName : leagueFinished ? 'Season Complete' : 'Rest Week'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-num">
                    {save.transferWindowOpen ? 'Transfer Window Open' : 'Window Closed'}
                  </span>
                </div>

                {nextFixture ? (
                  <>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3">
                        <ClubBadge
                          shortName={save.clubs[nextFixture.homeClubId]?.shortName ?? save.nationalTeams[nextFixture.homeClubId]?.code ?? 'HOM'}
                          primaryColor={save.clubs[nextFixture.homeClubId]?.primaryColor ?? '#06B6D4'}
                          secondaryColor={save.clubs[nextFixture.homeClubId]?.secondaryColor ?? '#FFFFFF'}
                          size={48}
                        />
                        <div>
                          <div className="text-base sm:text-lg font-bold text-white">
                            {save.clubs[nextFixture.homeClubId]?.name ?? save.nationalTeams[nextFixture.homeClubId]?.name}
                          </div>
                          <div className="text-xs text-slate-400">Home</div>
                        </div>
                      </div>
                      <span className="text-xl font-display font-bold text-slate-500">VS</span>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-base sm:text-lg font-bold text-white">
                            {save.clubs[nextFixture.awayClubId]?.name ?? save.nationalTeams[nextFixture.awayClubId]?.name}
                          </div>
                          <div className="text-xs text-slate-400">Away</div>
                        </div>
                        <ClubBadge
                          shortName={save.clubs[nextFixture.awayClubId]?.shortName ?? save.nationalTeams[nextFixture.awayClubId]?.code ?? 'AWY'}
                          primaryColor={save.clubs[nextFixture.awayClubId]?.primaryColor ?? '#EF4444'}
                          secondaryColor={save.clubs[nextFixture.awayClubId]?.secondaryColor ?? '#FFFFFF'}
                          size={48}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onLaunchMatch(nextFixture);
                        }}
                        className="min-h-[46px] px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Play Matchday</span>
                      </button>
                      <span className="text-xs text-slate-400">
                        Formation {club.tactics.formation} · {club.tactics.mentality}
                      </span>
                    </div>
                  </>
                ) : leagueFinished ? (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-bold text-white">End of Season {save.season}</h2>
                    <p className="text-sm text-slate-300">
                      All league fixtures are complete. Finalize Season {save.season} awards, age progression, and roll into Season {save.season + 1}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playWhistle('FULL_TIME');
                        onUpdateSave(advanceToNextSeason(save));
                      }}
                      className="min-h-[46px] self-start px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
                    >
                      Start Season {save.season + 1}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-300">
                      No club fixture scheduled this week. Advance the calendar to simulate world fixtures and continue.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onUpdateSave(advanceWeek(save));
                      }}
                      className="min-h-[44px] self-start px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>Advance Week</span>
                    </button>
                  </div>
                )}
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'League Rank', val: `#${leaguePos}`, sub: league.name },
                  { label: 'Board Trust', val: `${manager.boardConfidence}%`, sub: `Target #${club.targetPosition}` },
                  { label: 'Squad Avg', val: Math.round(squad.reduce((s, p) => s + p.overall, 0) / Math.max(1, squad.length)), sub: `${squad.length} Players` },
                  { label: 'Record', val: `${manager.wins}-${manager.draws}-${manager.losses}`, sub: `${manager.trophies.length} Trophies` },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-[#131A22] border border-white/10 p-3.5">
                    <div className="text-xs text-slate-400">{kpi.label}</div>
                    <div className="text-xl font-bold font-mono-num text-white mt-0.5">{kpi.val}</div>
                    <div className="text-[11px] text-slate-500 truncate">{kpi.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: News & Incoming Bids */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {save.transferOffers.length > 0 && (
                <div className="rounded-xl bg-[#131A22] border border-amber-400/40 p-4 flex flex-col gap-3">
                  <div className="text-sm font-bold text-amber-300">Incoming Transfer Bids</div>
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
              )}

              <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3 flex-1">
                <h3 className="text-base font-bold text-white border-b border-white/10 pb-2">Club & World Feed</h3>
                <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {save.news.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-[#0E141B] border border-white/5">
                      <div className="text-[11px] text-cyan-400 font-mono-num">
                        S{n.season} · Week {n.week} · {n.category}
                      </div>
                      <div className="text-xs font-semibold text-white mt-0.5">{n.headline}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{n.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'SQUAD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tactical Pitch Board */}
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

              {/* Visual Formation Pitch */}
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

              {selectedSlotIdx !== null && (
                <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3 py-2 rounded-lg">
                  Slot {selectedSlotIdx + 1} ({formationSlots[selectedSlotIdx]}) selected — click any player on the right to swap into this position.
                </div>
              )}

              {/* Tactical Instructions */}
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

            {/* Squad List */}
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
                          <div className="text-[11px] text-slate-500">{p.seasonStats.goals}G {p.seasonStats.assists}A</div>
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
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search global players..."
                    className="min-h-[42px] w-full pl-9 pr-3 rounded-lg bg-[#0B0F14] border border-white/15 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <select
                  value={posFilter}
                  onChange={(e) => setPosFilter(e.target.value as Position | 'ALL')}
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
                Budget: <span className="text-cyan-400 font-bold">€{(club.finances.transferBudget / 1000000).toFixed(2)}M</span> · {save.transferWindowOpen ? 'Window Open' : 'Window Closed'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {marketPlayers.map((p) => {
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

            {/* Transfer Negotiation Modal */}
            {negTarget && (
              <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
                <div className="max-w-lg w-full rounded-xl bg-[#131A22] border border-cyan-400/50 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="text-xs text-cyan-400 font-semibold">Transfer & Contract Negotiation</div>
                      <h3 className="text-xl font-bold text-white">
                        {negTarget.name} ({negTarget.position} · {negTarget.overall} OVR)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNegTarget(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex flex-col gap-1 text-slate-400">
                      <span>Deal Type</span>
                      <select
                        value={dealType}
                        onChange={(e) => setDealType(e.target.value as TransferDealType)}
                        className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-white"
                      >
                        <option value="PERMANENT">Permanent Buy</option>
                        <option value="LOAN">Season Loan</option>
                        <option value="LOAN_TO_BUY">Loan-to-Buy</option>
                        <option value="EXCHANGE">Cash + Player Exchange</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-slate-400">
                      <span>Transfer Fee (€)</span>
                      <input
                        type="number"
                        step={100000}
                        value={offerFee}
                        onChange={(e) => setOfferFee(Number(e.target.value))}
                        className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-white font-mono-num"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-slate-400">
                      <span>Weekly Wage (€)</span>
                      <input
                        type="number"
                        step={500}
                        value={offerWage}
                        onChange={(e) => setOfferWage(Number(e.target.value))}
                        className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-white font-mono-num"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-slate-400">
                      <span>Contract Length (Years)</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={offerYears}
                        onChange={(e) => setOfferYears(Number(e.target.value))}
                        className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-white font-mono-num"
                      />
                    </label>
                  </div>

                  {dealType === 'EXCHANGE' && (
                    <label className="flex flex-col gap-1 text-xs text-slate-400">
                      <span>Offer Player in Exchange</span>
                      <select
                        value={exchangeId}
                        onChange={(e) => setExchangeId(e.target.value)}
                        className="min-h-[40px] px-2.5 rounded bg-[#0B0F14] border border-white/15 text-white"
                      >
                        <option value="">None</option>
                        {squad.map((sp) => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} ({sp.position} · €{(sp.marketValue / 1000000).toFixed(1)}M)
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {negFeedback && (
                    <div className="p-3 rounded-lg bg-[#0B0F14] border border-white/10 text-xs text-amber-300">
                      {negFeedback}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={submitNegotiation}
                    className="min-h-[44px] w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer"
                  >
                    Submit Official Offer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'TRAINING' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4">
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

            <div className="lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4">
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
              <div className="flex flex-col gap-2">
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
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">
                Managerial Legacy & Job Offers
              </h3>
              <div className="text-xs text-slate-300">
                Reputation: <span className="font-mono-num font-bold text-cyan-400">{manager.reputation}</span> ·
                Philosophy: {manager.philosophy}
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
                        <div className="text-slate-400">{jo.leagueName} · €{jo.wage.toLocaleString()}/wk</div>
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
      </main>
    </div>
  );
};
