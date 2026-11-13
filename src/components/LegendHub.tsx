import React, { useState } from 'react';
import {
  Play,
  FastForward,
  Dumbbell,
  ArrowLeftRight,
  Trophy,
  Award,
  BarChart3,
  LogOut,
  Volume2,
  VolumeX,
  Flag,
} from 'lucide-react';
import { CareerSave, Fixture, IndividualDrill, PlayerAttributes } from '../types/football';
import {
  advanceToNextSeason,
  advanceWeek,
  applyLegendDrill,
  executeTransfer,
  getClubStandingsPosition,
  getNextUserFixture,
} from '../engine/careerEngine';
import { soundEngine } from '../engine/audio';
import { ClubBadge } from './ClubBadge';
import { PlayerPortrait } from './PlayerPortrait';
import { CompetitionsView } from './CompetitionsView';

interface LegendHubProps {
  save: CareerSave;
  muted: boolean;
  onToggleMute: () => void;
  onUpdateSave: (next: CareerSave) => void;
  onLaunchMatch: (fixture: Fixture) => void;
  onExitToTitle: () => void;
}

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
  const [tab, setTab] = useState<'DASHBOARD' | 'ATTRIBUTES' | 'TRAINING' | 'AGENT' | 'COMPETITIONS' | 'LEGACY'>('DASHBOARD');
  const legend = save.legend!;
  const player = save.players[legend.playerId];
  const club = save.clubs[save.userClubId];
  const league = save.leagues[club.leagueId];
  const leaguePos = getClubStandingsPosition(save, club.id);
  const nextFixture = getNextUserFixture(save);
  const leagueFinished = league.fixtures.every((f) => f.played);

  const isStarter = club.tactics.startingXI.includes(player.id);
  const isBench = club.tactics.bench.includes(player.id);
  const natTeam = legend.nationalTeamId ? save.nationalTeams[legend.nationalTeamId] : undefined;

  const handleAcceptAgentOffer = (offerId: string) => {
    const offer = legend.agentOffers.find((o) => o.id === offerId);
    if (!offer) return;
    soundEngine.playClick();
    const updated = executeTransfer(
      save,
      player.id,
      offer.fromClubId,
      offer.fee,
      offer.proposedWage,
      offer.contractYears,
      offer.releaseClause
    );
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

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col">
      {/* Top Player Identity Bar */}
      <header className="sticky top-0 z-30 bg-[#0E141B]/95 border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PlayerPortrait
              appearance={player.appearance}
              jerseyPrimary={club.primaryColor}
              jerseySecondary={club.secondaryColor}
              size={44}
              className="border border-amber-400/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white">{player.name}</span>
                <span className="text-xs font-mono-num font-bold text-amber-400">
                  {player.overall} OVR · {player.position}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono-num">
                {club.name} · Season {save.season} · Week {save.currentWeek} · {legend.squadRole.replace('_', ' ')}
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
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#131A22] border-b border-white/10 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1">
          {[
            { id: 'DASHBOARD', label: 'Career Hub', icon: Play },
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
                  setTab(item.id as typeof tab);
                }}
                className={`min-h-[46px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-amber-400 text-amber-300'
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
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Next Matchday Selection Card */}
              <div className="rounded-xl bg-[#131A22] border border-amber-400/35 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400">
                    {nextFixture ? nextFixture.competitionName : leagueFinished ? 'Season Complete' : 'Between Matchdays'}
                  </span>
                  <span className="text-xs font-mono-num text-slate-400">
                    Selection: {isStarter ? 'Starting XI' : isBench ? 'Substitutes Bench' : 'Reserves'}
                  </span>
                </div>

                {nextFixture ? (
                  <>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3">
                        <ClubBadge
                          shortName={save.clubs[nextFixture.homeClubId]?.shortName ?? save.nationalTeams[nextFixture.homeClubId]?.code ?? 'HOM'}
                          primaryColor={save.clubs[nextFixture.homeClubId]?.primaryColor ?? '#F59E0B'}
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
                          primaryColor={save.clubs[nextFixture.awayClubId]?.primaryColor ?? '#38BDF8'}
                          secondaryColor={save.clubs[nextFixture.awayClubId]?.secondaryColor ?? '#FFFFFF'}
                          size={48}
                        />
                      </div>
                    </div>

                    {!isStarter && !isBench && (
                      <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-400/25 p-3 rounded-lg">
                        Manager left you out of the matchday squad. Complete training drills to raise sharpness and trust.
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onLaunchMatch(nextFixture);
                        }}
                        className="min-h-[46px] px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Play Matchday</span>
                      </button>
                      <span className="text-xs text-slate-400 font-mono-num">
                        Manager Trust {legend.managerTrust}% · Fitness {player.fitness}%
                      </span>
                    </div>
                  </>
                ) : leagueFinished ? (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-bold text-white">End of Season {save.season}</h2>
                    <p className="text-sm text-slate-300">
                      Season {save.season} is complete! Review awards and progress into Season {save.season + 1}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playWhistle('FULL_TIME');
                        onUpdateSave(advanceToNextSeason(save));
                      }}
                      className="min-h-[46px] self-start px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
                    >
                      Continue to Season {save.season + 1}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-300">No fixture this week. Advance to next matchweek.</p>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onUpdateSave(advanceWeek(save));
                      }}
                      className="min-h-[44px] self-start px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>Advance Week</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Season KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Apps / Goals', val: `${player.seasonStats.appearances} / ${player.seasonStats.goals}`, sub: `${player.seasonStats.assists} Assists` },
                  { label: 'Avg Rating', val: player.seasonStats.averageRating ? player.seasonStats.averageRating.toFixed(2) : '--', sub: `${player.seasonStats.motm} MOTM` },
                  { label: 'Market Value', val: `€${(player.marketValue / 1000000).toFixed(1)}M`, sub: `€${(player.weeklyWage / 1000).toFixed(1)}k/wk` },
                  { label: 'League Pos', val: `#${leaguePos}`, sub: club.name },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl bg-[#131A22] border border-white/10 p-3.5">
                    <div className="text-xs text-slate-400">{k.label}</div>
                    <div className="text-xl font-bold font-mono-num text-white mt-0.5">{k.val}</div>
                    <div className="text-[11px] text-slate-500 truncate">{k.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Manager Status & News */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
                <h3 className="text-base font-bold text-white border-b border-white/10 pb-2">Player Condition & Status</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0E141B]">
                    <div className="text-slate-400">Manager Trust</div>
                    <div className="text-lg font-mono-num font-bold text-amber-400">{legend.managerTrust}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E141B]">
                    <div className="text-slate-400">Confidence / Morale</div>
                    <div className="text-lg font-mono-num font-bold text-white">
                      {player.confidence}% / {player.morale}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E141B]">
                    <div className="text-slate-400">Form / Sharpness</div>
                    <div className="text-lg font-mono-num font-bold text-emerald-400">
                      {player.form} / {player.sharpness}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E141B]">
                    <div className="text-slate-400">International</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {legend.internationalCallUp ? `${natTeam?.name} (${player.internationalCaps} caps)` : 'Not Yet Called'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-2.5 flex-1">
                <h3 className="text-base font-bold text-white border-b border-white/10 pb-2">Career Feed</h3>
                <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {save.news.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-[#0E141B]">
                      <div className="text-[11px] text-amber-400 font-mono-num">
                        S{n.season} W{n.week} · {n.category}
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
                      <span className={`font-mono-num font-bold ${val >= 80 ? 'text-amber-400' : val >= 70 ? 'text-emerald-400' : 'text-white'}`}>
                        {val}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${val >= 80 ? 'bg-amber-400' : val >= 70 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

              <button
                type="button"
                onClick={handleRequestTransfer}
                className="min-h-[42px] w-full rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 text-xs font-bold transition-colors cursor-pointer"
              >
                Ask Agent to Explore Transfer Offers
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
                      <div className="flex items-center gap-3">
                        <ClubBadge
                          shortName={suitor.shortName}
                          primaryColor={suitor.primaryColor}
                          secondaryColor={suitor.secondaryColor}
                          size={40}
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{suitor.name}</div>
                          <div className="text-xs text-slate-400 font-mono-num">
                            €{off.proposedWage.toLocaleString()}/wk · {off.contractYears} yrs · Bonus €{off.signingBonus.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">{off.message}</div>
                        </div>
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
      </main>
    </div>
  );
};
