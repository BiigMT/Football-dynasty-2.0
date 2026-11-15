import { Club, League, Player } from '../types/football';
import { generateRoundRobinFixtures } from './database';

export type CareerTier = 1 | 2 | 3 | 4;
export const CAREER_PYRAMID = [
  { tier: 1 as CareerTier, name: 'TIER 1 · PREMIER DIVISION', description: 'The elite level: continental qualification and major honours.' },
  { tier: 2 as CareerTier, name: 'TIER 2 · CHAMPIONSHIP', description: 'Promotion contenders, established professionals and ambitious clubs.' },
  { tier: 3 as CareerTier, name: 'TIER 3 · NATIONAL LEAGUE', description: 'A competitive proving ground for rising players.' },
  { tier: 4 as CareerTier, name: 'TIER 4 · DEVELOPMENT LEAGUE', description: 'Academy graduates earn senior minutes and build their reputation.' },
];
export const SQUAD_LADDER = ['U-18 ACADEMY', 'RESERVE', 'IMPACT SUB', 'FIRST TEAM REGULAR', 'STAR PLAYER', 'CLUB CAPTAIN'] as const;

export function getCareerTier(club?: Club): CareerTier {
  if (!club) return 4;
  const match = club.leagueId.match(/_tier_([1-4])$/);
  if (match) return Number(match[1]) as CareerTier;
  return club.reputation >= 84 ? 1 : club.reputation >= 69 ? 2 : club.reputation >= 56 ? 3 : 4;
}

export function getAcademyStartingClub(
  clubs: Record<string, Club>,
  leagues: Record<string, League>,
  preferredClubId?: string
): Club | undefined {
  const preferred = preferredClubId ? clubs[preferredClubId] : undefined;
  const sourceLeague = preferred ? leagues[preferred.leagueId] : undefined;
  const candidates = Object.values(clubs)
    .filter((club) => !sourceLeague || club.leagueId === sourceLeague.id)
    .sort((a, b) => a.reputation - b.reputation);
  return candidates[Math.max(0, Math.floor(candidates.length * 0.75))] ??
    candidates[candidates.length - 1] ??
    Object.values(clubs).sort((a, b) => a.reputation - b.reputation)[0];
}

const blankRows = (clubIds: string[]) => clubIds.map((clubId) => ({
  clubId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
}));

/** Build four real, fixture-backed divisions for every existing league's club pool. */
export function initializeFourTierPyramid(
  clubs: Record<string, Club>,
  sourceLeagues: Record<string, League>
): { clubs: Record<string, Club>; leagues: Record<string, League> } {
  const nextClubs = { ...clubs };
  const nextLeagues: Record<string, League> = {};
  Object.values(sourceLeagues).forEach((source) => {
    const ranked = [...source.clubIds].sort((a, b) =>
      (clubs[b]?.reputation ?? 0) - (clubs[a]?.reputation ?? 0)
    );
    const buckets: string[][] = [[], [], [], []];
    ranked.forEach((clubId, index) => {
      const tierIndex = Math.min(3, Math.floor(index * 4 / Math.max(1, ranked.length)));
      buckets[tierIndex].push(clubId);
    });
    buckets.forEach((clubIds, index) => {
      const tier = (index + 1) as CareerTier;
      const id = source.id + '_tier_' + tier;
      const name = source.name + ' · Tier ' + tier;
      nextLeagues[id] = {
        id, name, country: source.country, region: source.region, tier,
        clubIds, standings: blankRows(clubIds),
        fixtures: generateRoundRobinFixtures(id, name, clubIds),
      };
      clubIds.forEach((clubId) => {
        const club = nextClubs[clubId];
        if (club) nextClubs[clubId] = { ...club, leagueId: id };
      });
    });
  });
  return { clubs: nextClubs, leagues: nextLeagues };
}

function sortedTable(league: League) {
  return [...league.standings].sort((a, b) =>
    b.points - a.points ||
    (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
    b.goalsFor - a.goalsFor
  );
}

/** Swap the bottom club in each upper tier with the champion of the tier below. */
export function applyPromotionRelegation(
  clubs: Record<string, Club>,
  leagues: Record<string, League>
): { clubs: Record<string, Club>; leagues: Record<string, League>; movements: string[] } {
  const nextClubs = { ...clubs };
  const nextLeagues = { ...leagues };
  const groups = new Map<string, League[]>();
  Object.values(leagues).forEach((league) => {
    const base = league.id.replace(/_tier_[1-4]$/, '');
    groups.set(base, [...(groups.get(base) ?? []), league]);
  });
  const movements: string[] = [];
  groups.forEach((divisions) => {
    divisions.sort((a, b) => a.tier - b.tier);
    for (let tier = 1; tier <= 3; tier += 1) {
      const upper = divisions.find((league) => league.tier === tier);
      const lower = divisions.find((league) => league.tier === tier + 1);
      if (!upper || !lower || upper.clubIds.length < 2 || lower.clubIds.length < 2) continue;
      const relegated = sortedTable(upper).slice(-1)[0]?.clubId;
      const promoted = sortedTable(lower)[0]?.clubId;
      if (!relegated || !promoted || relegated === promoted) continue;
      const upperIds = upper.clubIds.map((id) => id === relegated ? promoted : id);
      const lowerIds = lower.clubIds.map((id) => id === promoted ? relegated : id);
      nextLeagues[upper.id] = { ...upper, clubIds: upperIds, standings: blankRows(upperIds), fixtures: generateRoundRobinFixtures(upper.id, upper.name, upperIds) };
      nextLeagues[lower.id] = { ...lower, clubIds: lowerIds, standings: blankRows(lowerIds), fixtures: generateRoundRobinFixtures(lower.id, lower.name, lowerIds) };
      nextClubs[promoted] = { ...nextClubs[promoted], leagueId: upper.id };
      nextClubs[relegated] = { ...nextClubs[relegated], leagueId: lower.id };
      movements.push(nextClubs[promoted].name + ' promoted to Tier ' + tier, nextClubs[relegated].name + ' relegated to Tier ' + (tier + 1));
    }
  });
  return { clubs: nextClubs, leagues: nextLeagues, movements };
}

export function getSquadLadderIndex(player: Player, trust: number): number {
  if (trust >= 94 && player.overall >= 86) return 5;
  if (trust >= 86 && player.overall >= 82) return 4;
  if (trust >= 72 && player.overall >= 68) return 3;
  if (trust >= 58) return 2;
  if (trust >= 42) return 1;
  return 0;
}
export function getTierProgressionHint(tier: CareerTier): string {
  return tier === 4 ? 'Win promotion and earn your first senior breakthrough.' :
    tier === 3 ? 'Consistent starts attract second-tier scouts.' :
    tier === 2 ? 'Deliver in big fixtures to earn a top-flight place.' :
    'Build a legacy in domestic and continental competition.';
}
