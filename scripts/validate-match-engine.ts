import assert from 'node:assert/strict';
import { buildWorldDatabase } from '../src/engine/database';
import {
  applyTeamTalk,
  createMatchSession,
  makeMatchSubstitution,
  resolveKeyMomentChoice,
  resumeSecondHalf,
  simulateNextMinute,
  startMatchKickoff,
} from '../src/engine/matchEngine';
import type { Fixture, MatchSession } from '../src/types/football';

function withSeed<T>(seed: number, run: () => T): T {
  const originalRandom = Math.random;
  let state = seed >>> 0;
  Math.random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  try {
    return run();
  } finally {
    Math.random = originalRandom;
  }
}

const world = buildWorldDatabase();
const clubs = Object.values(world.clubs);
const home = clubs[0];
const away = clubs.find((club) => club.id !== home.id && club.leagueId === home.leagueId) ?? clubs[1];
assert.ok(home && away, 'Validation needs two generated clubs');
assert.equal(home.tactics.startingXI.length, 11, 'Home team must have eleven starters');
assert.equal(away.tactics.startingXI.length, 11, 'Away team must have eleven starters');
assert.ok(home.tactics.bench.length >= 5, 'Home team must have a usable bench');

const fixture: Fixture = {
  id: 'validation_match_001',
  competitionId: home.leagueId,
  competitionName: 'Validation League',
  competitionType: 'LEAGUE',
  round: 1,
  week: 1,
  homeClubId: home.id,
  awayClubId: away.id,
  played: false,
  homeGoals: 0,
  awayGoals: 0,
};

const makeSession = (userPlayerId?: string) => withSeed(20261120, () => createMatchSession({
  fixture,
  homeClub: home,
  awayClub: away,
  players: world.players,
  userClubSide: userPlayerId ? 'HOME' : undefined,
  userPlayerId,
}));

// Match setup and kickoff invariants.
const preMatch = makeSession();
assert.equal(preMatch.phase, 'PRE_MATCH');
assert.equal(Object.values(preMatch.playerStates).filter((state) => state.side === 'HOME' && state.onPitch).length, 11);
assert.equal(Object.values(preMatch.playerStates).filter((state) => state.side === 'AWAY' && state.onPitch).length, 11);
assert.equal(preMatch.homeStats.goals, 0);
assert.equal(preMatch.awayStats.goals, 0);
assert.equal(startMatchKickoff(preMatch).phase, 'FIRST_HALF');
assert.equal(simulateNextMinute(preMatch, world.clubs, world.players).session, preMatch, 'Pre-match simulation must be a no-op');

// A substitution cannot happen before kickoff.
const preKickoffOut = home.tactics.startingXI[1];
const preKickoffIn = home.tactics.bench[0];
assert.equal(makeMatchSubstitution(preMatch, 'HOME', preKickoffOut, preKickoffIn), preMatch);

// Substitution legality, one-way player changes, and the five-player limit.
let subSession = startMatchKickoff(preMatch);
const firstOut = home.tactics.startingXI[1];
const firstIn = home.tactics.bench[0];
subSession = makeMatchSubstitution(subSession, 'HOME', firstOut, firstIn);
assert.equal(subSession.homeSubsUsed, 1);
assert.equal(subSession.playerStates[firstOut].onPitch, false);
assert.equal(subSession.playerStates[firstOut].subbedOff, true);
assert.equal(subSession.playerStates[firstIn].onPitch, true);
assert.equal(subSession.playerStates[firstIn].started, false, 'Substitutes must not be counted as match starters');
assert.ok(subSession.homeTactics.startingXI.includes(firstIn));
assert.ok(subSession.homeTactics.bench.includes(firstOut));
const afterFirstSub = subSession;
assert.equal(
  makeMatchSubstitution(subSession, 'HOME', firstIn, firstOut),
  afterFirstSub,
  'A player who has been substituted off must not be allowed back on',
);

for (let i = 1; i < 5; i++) {
  subSession = makeMatchSubstitution(
    subSession,
    'HOME',
    home.tactics.startingXI[i + 1],
    home.tactics.bench[i],
  );
}
assert.equal(subSession.homeSubsUsed, 5);
const afterFiveSubs = subSession;
assert.equal(
  makeMatchSubstitution(subSession, 'HOME', home.tactics.startingXI[6], home.tactics.bench[5]),
  afterFiveSubs,
  'A team cannot make a sixth substitution',
);
assert.equal(subSession.awaySubsUsed, 0, 'Home substitutions must not affect the away allowance');

// Half-time substitutions are legal and team-talk changes only the managed side.
let halfTimeSession: MatchSession = { ...startMatchKickoff(preMatch), phase: 'HALF_TIME', minute: 45 };
const halfTimeOut = home.tactics.startingXI[1];
const halfTimeIn = home.tactics.bench[0];
halfTimeSession = makeMatchSubstitution(halfTimeSession, 'HOME', halfTimeOut, halfTimeIn);
assert.equal(halfTimeSession.homeSubsUsed, 1, 'Half-time substitutions should be accepted');
const talked = applyTeamTalk(halfTimeSession, 'ENCOURAGE', world.players);
assert.ok(talked.playerStates[halfTimeIn].stamina >= halfTimeSession.playerStates[halfTimeIn].stamina);
assert.equal(talked.playerStates[away.tactics.startingXI[0]].stamina, halfTimeSession.playerStates[away.tactics.startingXI[0]].stamina);
assert.equal(resumeSecondHalf(talked).phase, 'SECOND_HALF');

// Player objectives must not be awarded before the final whistle; key moments must update stats/objectives.
const keeperId = home.tactics.startingXI[0];
const keeperSession = makeSession(keeperId);
const keeperCleanSheet = keeperSession.userObjectives.find((objective) => objective.type === 'CLEAN_SHEET');
assert.ok(keeperCleanSheet, 'Goalkeeper should receive a clean-sheet objective');
assert.equal(keeperCleanSheet.completed, false, 'A clean sheet cannot be completed before kickoff');

const strikerId = home.tactics.startingXI.find((id) => world.players[id]?.position === 'ST') ?? home.tactics.startingXI[10];
let playerSession = withSeed(77, () => createMatchSession({
  fixture,
  homeClub: home,
  awayClub: away,
  players: world.players,
  userClubSide: 'HOME',
  userPlayerId: strikerId,
}));
playerSession = startMatchKickoff(playerSession);
let promptGuard = 0;
while (!playerSession.pendingKeyMoment && promptGuard < 22) {
  playerSession = simulateNextMinute(playerSession, world.clubs, world.players).session;
  promptGuard++;
}
assert.ok(playerSession.pendingKeyMoment, 'Player Career should create its first interactive key moment');
const goalChoice = playerSession.pendingKeyMoment!.choices.find((choice) => choice.successOutcome === 'GOAL');
assert.ok(goalChoice, 'Striker key moment should offer a goal attempt');
playerSession = withSeed(1, () => resolveKeyMomentChoice(playerSession, goalChoice!.id, world.clubs, world.players));
assert.equal(playerSession.homeStats.goals, 1, 'A successful key-moment finish must update the team score');
assert.equal(playerSession.playerStates[strikerId].goals, 1, 'A successful key-moment finish must update the player line');
assert.equal(
  playerSession.userObjectives.find((objective) => objective.type === 'GOAL_OR_ASSIST')?.completed,
  true,
  'A goal must complete the goal-or-assist objective',
);

// AI tactical adaptation reacts to the scoreline and protects human manager control.
const chasing = {
  ...startMatchKickoff(makeSession()),
  phase: 'SECOND_HALF' as const,
  minute: 61,
  userClubSide: 'HOME' as const,
  homeStats: { ...preMatch.homeStats, goals: 1 },
  awayStats: { ...preMatch.awayStats, goals: 0 },
  awayTactics: { ...preMatch.awayTactics, mentality: 'BALANCED' as const, pressing: 'MID_PRESS' as const },
};
const chasingResult = withSeed(44, () => simulateNextMinute(chasing, world.clubs, world.players).session);
assert.equal(chasingResult.awayTactics.mentality, 'ATTACKING', 'AI should become more aggressive when trailing after 62 minutes');
assert.equal(chasingResult.awayTactics.pressing, 'GEGENPRESS');
assert.ok(chasingResult.events.some((event) => event.type === 'TACTICAL_CHANGE' && event.teamSide === 'AWAY'));

const protecting = {
  ...startMatchKickoff(makeSession()),
  phase: 'SECOND_HALF' as const,
  minute: 75,
  userClubSide: 'AWAY' as const,
  homeStats: { ...preMatch.homeStats, goals: 1 },
  homeTactics: { ...preMatch.homeTactics, mentality: 'ATTACKING' as const, pressing: 'GEGENPRESS' as const },
};
const protectingResult = withSeed(45, () => simulateNextMinute(protecting, world.clubs, world.players).session);
assert.equal(protectingResult.homeTactics.mentality, 'DEFENSIVE', 'AI should protect a one-goal lead late in the match');
assert.equal(protectingResult.homeTactics.pressing, 'LOW_BLOCK');

// Deterministic complete match: both halves, final whistle, valid stats and bounded stamina.
const fullMatch = withSeed(20261120, () => {
  let session = startMatchKickoff(createMatchSession({
    fixture,
    homeClub: home,
    awayClub: away,
    players: world.players,
  }));
  const startingKeeperStamina = session.playerStates[home.tactics.startingXI[0]].stamina;
  let guard = 0;
  while (session.phase !== 'FULL_TIME' && guard < 120) {
    guard++;
    if (session.phase === 'HALF_TIME') {
      session = resumeSecondHalf(session);
    } else {
      session = simulateNextMinute(session, world.clubs, world.players).session;
    }
  }
  assert.ok(guard < 120, 'A match must reach full-time within its safety bound');
  assert.equal(session.phase, 'FULL_TIME');
  assert.equal(session.minute, 90);
  const expectedMinutes = 90 + session.addedTimeFirstHalf + session.addedTimeSecondHalf;
  assert.equal(session.playerStates[home.tactics.startingXI[0]].minutesPlayed, expectedMinutes, 'An uninterrupted goalkeeper should record regulation and stoppage time');
  for (const state of Object.values(session.playerStates)) {
    assert.ok((state.minutesPlayed ?? 0) >= 0 && (state.minutesPlayed ?? 0) <= expectedMinutes, 'Individual minutes must remain within the match duration');
  }
  assert.ok(session.events.some((event) => event.type === 'HALF_TIME'));
  assert.ok(session.events.some((event) => event.type === 'FULL_TIME'));
  assert.ok(session.events.filter((event) => event.type === 'KICKOFF').length >= 2);
  assert.equal(session.homeStats.possession + session.awayStats.possession, 100);
  for (const stats of [session.homeStats, session.awayStats]) {
    assert.ok(stats.shotsOnTarget <= stats.shots, 'Shots on target cannot exceed total shots');
    assert.ok(stats.passesCompleted <= stats.passes, 'Completed passes cannot exceed attempted passes');
    assert.ok(stats.goals <= stats.shotsOnTarget, 'Goals cannot exceed shots on target');
    assert.ok(stats.xG >= 0);
  }
  assert.ok(session.playerStates[home.tactics.startingXI[0]].stamina < startingKeeperStamina, 'Players on the pitch must lose stamina over time');
  return session;
});

const finalGoalkeeperObjective = fullMatch.userObjectives.find((objective) => objective.type === 'CLEAN_SHEET');
assert.ok(!finalGoalkeeperObjective || fullMatch.phase === 'FULL_TIME');

console.log('Match engine validation passed: setup, kickoff, legal substitutions, one-way substitutions, five-sub limit, half-time changes, team talks, key moments, objectives, stamina, match phases and full-time statistics.');
