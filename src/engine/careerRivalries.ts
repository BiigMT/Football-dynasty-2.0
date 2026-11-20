import { CareerSave } from '../types/football';

/** Set a one-match individual duel against a named player in the next opponent's XI. */
export function declareCareerRivalry(save: CareerSave, rivalPlayerId: string, fixtureId: string): CareerSave {
  if (save.mode !== 'PLAYER' || !save.legend || save.legend.rivalryPending) return save;
  const player = save.players[save.legend.playerId];
  const rival = save.players[rivalPlayerId];
  if (!player || !rival || player.id === rival.id) return save;
  const fixtures = [
    ...Object.values(save.leagues).flatMap((league) => league.fixtures),
    ...save.cupFixtures,
    ...save.continentalFixtures,
  ];
  const fixture = fixtures.find((item) => item.id === fixtureId && !item.played);
  if (!fixture) return save;
  const opponentClubId = fixture.homeClubId === player.clubId ? fixture.awayClubId :
    fixture.awayClubId === player.clubId ? fixture.homeClubId : undefined;
  if (!opponentClubId || rival.clubId !== opponentClubId) return save;
  const opponent = save.clubs[opponentClubId];
  if (!opponent?.tactics.startingXI.includes(rivalPlayerId)) return save;
  const news = [{
    id: `rivalry_declared_${fixture.id}_${player.id}`,
    week: save.currentWeek,
    season: save.season,
    category: 'MATCH' as const,
    headline: `${player.name} targets an individual duel with ${rival.name}`,
    body: `The upcoming fixture has a personal edge. Both players will be judged on their match performances.`,
  }, ...(save.news ?? [])].slice(0, 35);
  return {
    ...save,
    legend: { ...save.legend, rivalryPlayerId: rivalPlayerId, rivalryFixtureId: fixture.id, rivalryPending: true },
    news,
  };
}
