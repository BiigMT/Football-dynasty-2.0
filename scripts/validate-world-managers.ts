import assert from 'node:assert/strict';
import { buildWorldDatabase } from '../src/engine/database';
import { createManagerCareer } from '../src/engine/careerEngine';
import { simulateWorldManagers } from '../src/engine/worldSimulation';

const world = buildWorldDatabase();
const africanClub = Object.values(world.clubs).find((club) => club.region === 'AFRICA');
assert.ok(africanClub, 'Generated world must contain an African club');

const save = createManagerCareer({
  slotId: 'slot_1',
  managerName: 'Validation Manager',
  nationality: 'Zambia',
  philosophy: 'Balanced',
  clubId: africanClub.id,
});

assert.equal(
  Object.keys(save.worldManagers ?? {}).length,
  Object.keys(save.clubs).length,
  'Every generated club must start with a persistent manager identity',
);

const rivalClub = Object.values(save.clubs).find((club) => club.id !== save.userClubId);
assert.ok(rivalClub, 'Generated world must contain a rival club');
const rivalManager = save.worldManagers?.[rivalClub.id];
assert.ok(rivalManager, 'Rival club must have a manager');

const pressuredSave = {
  ...save,
  worldManagers: {
    ...save.worldManagers,
    [rivalClub.id]: {
      ...rivalManager,
      boardConfidence: 1,
      weeksInCharge: 20,
    },
  },
};
const advanced = simulateWorldManagers(pressuredSave, save.currentWeek + 1);
const replacement = advanced.worldManagers?.[rivalClub.id];

assert.ok(replacement, 'Replacement manager must be stored');
assert.notEqual(replacement.managerId, rivalManager.managerId, 'A dismissed manager must be replaced');
assert.equal(replacement.appointments, rivalManager.appointments + 1, 'Appointment history must increment');
assert.equal(replacement.lastChangeWeek, save.currentWeek + 1, 'Appointment week must persist');
assert.ok(
  advanced.news.some((item) => item.headline.includes(rivalClub.name) && item.headline.includes('appoint')),
  'Manager appointment must generate a news item',
);

// Older saves have no world-manager records. They must initialize safely on first simulation.
const legacySave = { ...save, worldManagers: undefined };
const migrated = simulateWorldManagers(legacySave, save.currentWeek + 1);
assert.equal(
  Object.keys(migrated.worldManagers ?? {}).length,
  Object.keys(legacySave.clubs).length,
  'Legacy careers must lazily initialize manager identities',
);

console.log('World manager simulation validation passed.');
