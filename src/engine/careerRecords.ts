import { Player } from '../types/football';

export interface CareerRecord {
  label: string;
  value: number;
  detail: string;
}

/** Derive a compact, deterministic career record sheet from persisted player history. */
export function getCareerRecords(player: Player): CareerRecord[] {
  const history = player.careerHistory ?? [];
  const seasons = [...history].sort((a, b) => a.season - b.season);
  const appearances = seasons.reduce((sum, row) => sum + row.appearances, player.seasonStats.appearances);
  const goals = seasons.reduce((sum, row) => sum + row.goals, player.seasonStats.goals);
  const assists = seasons.reduce((sum, row) => sum + row.assists, player.seasonStats.assists);
  const trophies = seasons.reduce((sum, row) => sum + row.trophies.length, 0);
  const bestSeason = seasons.reduce<(typeof seasons)[number] | undefined>((best, row) => {
    if (!best) return row;
    const score = row.goals * 4 + row.assists * 3 + row.appearances * row.averageRating;
    const bestScore = best.goals * 4 + best.assists * 3 + best.appearances * best.averageRating;
    return score > bestScore ? row : best;
  }, undefined);
  const currentRating = player.seasonStats.averageRating || 0;
  return [
    { label: 'Career appearances', value: appearances, detail: 'Competitive first-team matches' },
    { label: 'Career goals', value: goals, detail: 'All recorded seasons plus current season' },
    { label: 'Career assists', value: assists, detail: 'All recorded seasons plus current season' },
    { label: 'Honours', value: trophies + (player.seasonStats.trophies?.length ?? 0), detail: 'Recorded team trophies' },
    { label: 'Best season rating', value: Math.max(currentRating, bestSeason?.averageRating ?? 0), detail: bestSeason ? `Best recorded: Season ${bestSeason.season}` : 'Current season form' },
  ];
}
