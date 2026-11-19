import assert from 'node:assert/strict';
import { advanceLivingWorld, createInitialLivingWorld } from '../src/engine/livingWorld';
import type { CareerSave, Club, League } from '../src/types/football';

const makeClub = (id: string, name: string): Club => ({
  id,
  name,
  shortName: id.toUpperCase(),
  country: 'Zambia',
  region: 'AFRICA',
  leagueId: 'test_league',
  primaryColor: '#111111',
  secondaryColor: '#FFFFFF',
  reputation: 65,
  stadiumName: `${name} Stadium`,
  stadiumCapacity: 12000,
  tactics: {
    formation: '4-3-3',
    mentality: 'BALANCED',
    pressing: 'MID_PRESS',
    passing: 'MIXED',
    tempo: 60,
    startingXI: [],
    bench: [],
    captainId: '',
  },
  finances: {
    transferBudget: 100000,
    wageBudgetWeekly: 50000,
    weeklyWageBill: 10000,
    cashBalance: 1000000,
    matchdayIncomePerHomeGame: 10000,
    sponsorAnnualIncome: 50000,
  },
  chemistry: 70,
  boardExpectation: 'Finish in the top half',
  targetPosition: 1,
});

const clubs: Record<string, Club> = {
  alpha: makeClub('alpha', 'Alpha FC'),
  beta: makeClub('beta', 'Beta United'),
};
const league: League = {
  id: 'test_league',
  name: 'Test Premier Division',
  country: 'Zambia',
  region: 'AFRICA',
  tier: 1,
  clubIds: ['alpha', 'beta'],
  standings: [
    { clubId: 'alpha', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    { clubId: 'beta', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  ],
  fixtures: [],
};
const leagues = { test_league: league };

const managerCareerState = createInitialLivingWorld(clubs, leagues, 'alpha', 1, 0);
assert.equal(Object.keys(managerCareerState.managersByClub).length, 1);
assert.equal(managerCareerState.managersByClub.alpha, undefined);
assert.ok(managerCareerState.managersByClub.beta);

const playerCareerState = createInitialLivingWorld(clubs, leagues, undefined, 1, 0);
assert.equal(Object.keys(playerCareerState.managersByClub).length, 2);

const strugglingManager = {
  ...playerCareerState.managersByClub.alpha,
  confidence: 19,
  weeksAtClub: 20,
  lastPlayed: 0,
  lastPoints: 0,
};
const save = {
  mode: 'PLAYER',
  season: 1,
  currentWeek: 6,
  userClubId: 'alpha',
  clubs,
  leagues: {
    test_league: {
      ...league,
      standings: [
        { clubId: 'alpha', played: 6, won: 0, drawn: 0, lost: 6, goalsFor: 1, goalsAgainst: 15, points: 0 },
        { clubId: 'beta', played: 6, won: 6, drawn: 0, lost: 0, goalsFor: 15, goalsAgainst: 1, points: 18 },
      ],
    },
  },
  players: {},
  nationalTeams: {},
  cupFixtures: [],
  continentalFixtures: [],
  transferOffers: [],
  news: [],
  trainingFocus: 'BALANCED',
  weekTrained: false,
  worldState: {
    ...playerCareerState,
    managersByClub: {
      ...playerCareerState.managersByClub,
      alpha: strugglingManager,
    },
  },
} as unknown as CareerSave;

const advanced = advanceLivingWorld(save, 7);
const replacement = advanced.worldState?.managersByClub.alpha;
assert.ok(replacement);
assert.notEqual(replacement.id, strugglingManager.id);
assert.notEqual(replacement.name, strugglingManager.name);
assert.equal(replacement.confidence, 74);
assert.ok(advanced.worldState?.history.some((event) => event.type === 'MANAGER_DISMISSED'));
assert.ok(advanced.worldState?.history.some((event) => event.type === 'MANAGER_APPOINTED'));
assert.ok(advanced.news.some((item) => item.headline.includes('dismissed by Alpha FC')));
assert.ok(advanced.news.some((item) => item.headline.includes('appointed at Alpha FC')));
assert.equal(advanced.clubs.alpha.tactics.pressing, 'MID_PRESS');

const retry = advanceLivingWorld(advanced, 7);
assert.deepEqual(retry.worldState, advanced.worldState);
assert.equal(retry.news.length, advanced.news.length);


const worldClubs = {
  alpha: { ...clubs.alpha, reputation: 60, finances: { ...clubs.alpha.finances, transferBudget: 1000000, cashBalance: 1000, wageBudgetWeekly: 1000, weeklyWageBill: 50000 } },
  beta: { ...clubs.beta, reputation: 90 },
};
const targetPlayer = {
  id: 'ai_target', name: 'AI Target', clubId: 'beta', position: 'GK', age: 22,
  overall: 72, potential: 80, marketValue: 100000, weeklyWage: 1000,
  morale: 50, transferRequestPending: true, seasonStats: { appearances: 0, starts: 0, minutes: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, averageRating: 0, ratingCount: 0, motm: 0 },
} as unknown as CareerSave['players'][string];
const unhappyPlayer = {
  ...targetPlayer, id: 'ai_unhappy', name: 'Unhappy Prospect', clubId: 'alpha',
  position: 'ST', morale: 24, transferRequestPending: false, squadRole: 'IMPORTANT',
} as unknown as CareerSave['players'][string];
const extendedSave = {
  ...save,
  clubs: worldClubs,
  players: { ai_target: targetPlayer, ai_unhappy: unhappyPlayer },
  worldState: {
    ...playerCareerState,
    managersByClub: {
      alpha: { ...playerCareerState.managersByClub.alpha, confidence: 90 },
      beta: { ...playerCareerState.managersByClub.beta, confidence: 20 },
    },
  },
} as unknown as CareerSave;
const transferWeek = advanceLivingWorld(extendedSave, 4);
assert.equal(transferWeek.players.ai_target.clubId, 'alpha');
assert.ok(transferWeek.worldState?.history.some((event) => event.type === 'AI_TRANSFER'));
assert.equal(transferWeek.players.ai_unhappy.transferRequestPending, true);
assert.ok(transferWeek.worldState?.history.some((event) => event.type === 'PLAYER_UNREST'));

const managerMarketWeek = advanceLivingWorld(extendedSave, 6);
assert.notEqual(managerMarketWeek.worldState?.managersByClub.beta.id, playerCareerState.managersByClub.beta.id);
assert.ok(managerMarketWeek.worldState?.history.some((event) => event.type === 'MANAGER_MOVED'));
assert.ok(managerMarketWeek.clubs.alpha.finances.cashBalance !== worldClubs.alpha.finances.cashBalance);
assert.ok(managerMarketWeek.worldState?.history.length > 0);

console.log('Living Football World validation passed: career setup, AI manager coverage, dismissal, appointment, tactics, AI transfers, player unrest, manager movement, finances, news and idempotent processing.');
