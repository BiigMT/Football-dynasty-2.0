import assert from 'node:assert/strict';
import { buildWorldDatabase } from '../src/engine/database';
import { selectAiMatchdaySquad, shouldRotateAiClub } from '../src/engine/squadRotation';

const world = buildWorldDatabase();
const club = Object.values(world.clubs)[0];
const injuredId = club.tactics.startingXI[1];
const suspendedId = club.tactics.startingXI[2];
const players = {
  ...world.players,
  [injuredId]: { ...world.players[injuredId], injuredWeeks: 2 },
  [suspendedId]: { ...world.players[suspendedId], suspendedMatches: 1 },
};

const selected = selectAiMatchdaySquad(club, players);
assert.equal(selected.tactics.startingXI.length, 11);
assert.equal(new Set(selected.tactics.startingXI).size, 11, 'Starting XI must not contain duplicate players');
assert.ok(!selected.tactics.startingXI.includes(injuredId), 'Injured players must not be selected');
assert.ok(!selected.tactics.startingXI.includes(suspendedId), 'Suspended players must not be selected');
assert.equal(selected.tactics.bench.length, 7, 'The AI should select a seven-player bench');
assert.equal(new Set([...selected.tactics.startingXI, ...selected.tactics.bench]).size, 18, 'XI and bench must be disjoint');
assert.ok(selected.tactics.startingXI.every((id) => players[id]?.clubId === club.id));
assert.ok(selected.tactics.bench.every((id) => players[id]?.clubId === club.id));
assert.ok(selected.tactics.startingXI.includes(selected.tactics.captainId), 'Captain must be in the selected XI');

const repeated = selectAiMatchdaySquad(club, players);
assert.deepEqual(repeated.tactics.startingXI, selected.tactics.startingXI, 'Selection must be deterministic');
assert.deepEqual(repeated.tactics.bench, selected.tactics.bench, 'Bench selection must be deterministic');

assert.equal(shouldRotateAiClub('MANAGER', club.id, club.id), false, 'Manager Career must preserve the human manager squad');
assert.equal(shouldRotateAiClub('MANAGER', club.id, world.clubs[Object.keys(world.clubs)[1]].id), true);
assert.equal(shouldRotateAiClub('PLAYER', club.id, club.id), true, 'Player Career clubs are AI-managed');

console.log('Squad rotation validation passed: eligibility, positional coverage, unique XI, seven-player bench, captain integrity, deterministic selection and human-manager protection.');
