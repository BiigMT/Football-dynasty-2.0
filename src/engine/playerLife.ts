import { LegendProfile, Player } from '../types/football';

export type MatchFixingChoice = 'REJECT' | 'REPORT' | 'CONSULT' | 'ACCEPT';

export function resolveMatchFixingChoice(
  legend: LegendProfile,
  choice: MatchFixingChoice,
  week: number,
  season: number,
  opponentClubId?: string,
): LegendProfile {
  const existing = legend.matchFixing;
  if (existing && existing.status !== 'PENDING' && existing.status !== 'CONSULTED') return legend;
  const amount = existing?.amount ?? 35000;
  const base = existing ?? {
    status: 'PENDING' as const,
    offerId: `fixing_offer_s${season}_w${week}`,
    offeredWeek: week,
    offeredSeason: season,
    opponentClubId,
    amount,
    suspicion: 0,
  };
  if (choice === 'CONSULT') return { ...legend, matchFixing: { ...base, status: 'CONSULTED' } };
  if (choice === 'REJECT') return {
    ...legend,
    managerTrust: Math.min(100, legend.managerTrust + 2),
    matchFixing: { ...base, status: 'REJECTED', suspicion: 0 },
    phoneNotifications: [{ id: `fixing_rejected_${base.offerId}`, title: 'You protected your career', body: 'You turned down an illegal approach. The offer has been closed.', kind: 'CLUB' as const, week, season }, ...(legend.phoneNotifications ?? [])].slice(0, 20),
  };
  if (choice === 'REPORT') return {
    ...legend,
    managerTrust: Math.min(100, legend.managerTrust + 8),
    matchFixing: { ...base, status: 'REPORTED', suspicion: 0 },
    phoneNotifications: [{ id: `fixing_reported_${base.offerId}`, title: 'Approach reported', body: 'Your club has been alerted. The matter will be handled confidentially.', kind: 'CLUB' as const, week, season }, ...(legend.phoneNotifications ?? [])].slice(0, 20),
  };
  return {
    ...legend,
    personalBalance: (legend.personalBalance ?? 0) + amount,
    matchFixing: { ...base, status: 'ACCEPTED', suspicion: 35 },
    phoneNotifications: [{ id: `fixing_paid_${base.offerId}`, title: 'Unexplained payment received', body: `€${amount.toLocaleString()} has been added to your in-game personal balance. Your next performance may attract scrutiny.`, kind: 'CLUB' as const, week, season }, ...(legend.phoneNotifications ?? [])].slice(0, 20),
  };
}

export function applyMatchFixingConsequence(
  legend: LegendProfile,
  player: Player,
  fixtureId: string,
): { legend: LegendProfile; player: Player } | undefined {
  const fixing = legend.matchFixing;
  if (!fixing || fixing.status !== 'ACCEPTED' || fixing.lastFixtureId === fixtureId) return undefined;
  const nextPlayer: Player = {
    ...player,
    morale: Math.max(10, player.morale - 8),
    confidence: Math.max(10, player.confidence - 12),
    reputation: Math.max(1, player.reputation - 3),
    seasonStats: {
      ...player.seasonStats,
      averageRating: Math.max(1, Number((player.seasonStats.averageRating - 0.8).toFixed(2))),
    },
  };
  const nextLegend: LegendProfile = {
    ...legend,
    managerTrust: legend.managerTrust,
    matchFixing: { ...fixing, status: 'UNDER_INVESTIGATION', suspicion: 72, lastFixtureId: fixtureId },
    phoneNotifications: [{
      id: `fixing_investigation_${fixtureId}`,
      title: 'Integrity investigation opened',
      body: 'Your last performance has raised concerns. Club officials are reviewing the circumstances.',
      kind: 'CLUB' as const,
      week: fixing.offeredWeek,
      season: fixing.offeredSeason,
    }, ...(legend.phoneNotifications ?? [])].slice(0, 20),
  };
  return { legend: nextLegend, player: nextPlayer };
}
