import assert from 'node:assert/strict';
import { createManagerCareer, applyMatchSessionToWorld } from '../src/engine/careerEngine';
import { createMatchSession } from '../src/engine/matchEngine';
import type { Fixture } from '../src/types/football';

const save = createManagerCareer({
  slotId: 'match-consequence-validation',
  managerName: 'World Manager',
  nationality: 'Zambia',
  philosophy: 'Balanced',
  clubId: 'man_sky',
});
const allClubs = Object.values(save.clubs);
const lowRep = { ...[...allClubs].sort((a, b) => a.reputation - b.reputation)[0], reputation: 40 };
const highRep = { ...[...allClubs].sort((a, b) => b.reputation - a.reputation)[0], reputation: 95 };
assert.ok(highRep.reputation - lowRep.reputation >= 10, 'Test league needs a meaningful reputation gap');

const fixture: Fixture = {
  id: 'world_consequence_upset_test',
  competitionId: 'validation_domestic_cup',
  competitionName: 'Validation Domestic Cup',
  competitionType: 'DOMESTIC_CUP',
  round: 1,
  week: save.currentWeek,
  homeClubId: lowRep.id,
  awayClubId: highRep.id,
  played: false,
  homeGoals: 0,
  awayGoals: 0,
};
const testSave = {
  ...save,
  players: { ...save.players },
  clubs: { ...save.clubs, [lowRep.id]: lowRep, [highRep.id]: highRep },
  cupFixtures: [fixture, ...save.cupFixtures],
};
const session = createMatchSession({
  fixture,
  homeClub: lowRep,
  awayClub: highRep,
  players: testSave.players,
});
const scorerId = lowRep.tactics.startingXI.find((id) => testSave.players[id]?.position === 'ST') ?? lowRep.tactics.startingXI[10];
const injuredId = lowRep.tactics.startingXI.find((id) => id !== scorerId && id !== lowRep.tactics.startingXI[0])!;
const sentOffId = lowRep.tactics.startingXI.find((id) => id !== scorerId && id !== injuredId && id !== lowRep.tactics.startingXI[0])!;
testSave.players[scorerId] = {
  ...testSave.players[scorerId],
  seasonStats: { ...testSave.players[scorerId].seasonStats, goals: 9 },
};
const preparedSession = {
  ...session,
  phase: 'FULL_TIME' as const,
  minute: 90,
  homeStats: { ...session.homeStats, goals: 2, shots: 3, shotsOnTarget: 2 },
  awayStats: { ...session.awayStats, goals: 0 },
  playerStates: {
    ...session.playerStates,
    [scorerId]: { ...session.playerStates[scorerId], goals: 1, rating: 8.6, minutesPlayed: 90, started: true },
    [injuredId]: { ...session.playerStates[injuredId], injured: true, onPitch: false, subbedOff: true, minutesPlayed: 40, started: true },
    [sentOffId]: { ...session.playerStates[sentOffId], redCard: true, onPitch: false, minutesPlayed: 25, started: true },
  },
};
const result = applyMatchSessionToWorld(testSave, preparedSession);

assert.ok(result.worldState?.history.some((event) => event.type === 'MATCH_UPSET' && event.clubId === lowRep.id), 'A major upset should enter Living World history');
assert.ok(result.news.some((item) => item.headline.includes('Shock result')), 'The upset should appear in the news feed');
assert.ok(result.worldState?.history.some((event) => event.type === 'PLAYER_MILESTONE' && event.playerId === scorerId), 'A player reaching ten goals should create a milestone');
assert.equal(result.players[scorerId].seasonStats.goals, 10);
assert.ok(result.players[injuredId].injuredWeeks >= 2, 'Match injuries must persist into the career');
assert.equal(result.players[sentOffId].suspendedMatches, 1, 'A red card must create a suspension');
assert.equal(result.players[scorerId].seasonStats.minutes, testSave.players[scorerId].seasonStats.minutes + 90, 'Match minutes must use actual minutes played');
assert.equal(result.players[injuredId].seasonStats.minutes, testSave.players[injuredId].seasonStats.minutes + 40, 'Substituted players must retain their actual minutes');
assert.equal(result.players[injuredId].seasonStats.starts, testSave.players[injuredId].seasonStats.starts + 1);
assert.equal(result.players[scorerId].seasonStats.starts, testSave.players[scorerId].seasonStats.starts + 1);

console.log('Match consequence validation passed: league result, upset history/news, player milestones, injuries, suspensions and accurate player minutes/starts.');
