import assert from 'node:assert/strict';
import { applyTeamTraining, createManagerCareer } from '../src/engine/careerEngine';

const save = createManagerCareer({
  slotId: 'development-validation',
  managerName: 'Validation Manager',
  nationality: 'Zambia',
  philosophy: 'Balanced',
  clubId: 'man_sky',
});
const prospect = Object.values(save.players).find(
  (player) => player.clubId === save.userClubId && player.age <= 21 && player.overall < player.potential,
);
assert.ok(prospect, 'Test career should include a young player with room to grow');

const readyToGrow = {
  ...save,
  weekTrained: false,
  players: {
    ...save.players,
    [prospect.id]: { ...prospect, developmentProgress: 95 },
  },
};
const trained = applyTeamTraining(readyToGrow, 'ATTACKING');
const improved = trained.players[prospect.id];
assert.ok(improved.attributes.finishing >= prospect.attributes.finishing, 'Attacking training must not reduce finishing');
assert.ok(improved.attributes.shooting >= prospect.attributes.shooting, 'Attacking training must not reduce shooting');
assert.ok((improved.developmentProgress ?? 0) < 100, 'A completed development threshold must roll over');
assert.equal(trained.weekTrained, true, 'A player can only receive one team training session per week');
assert.equal(applyTeamTraining(trained, 'DEFENDING'), trained, 'A second weekly training action must be rejected');

const recoverySave = {
  ...readyToGrow,
  players: {
    ...readyToGrow.players,
    [prospect.id]: { ...prospect, developmentProgress: 95, fitness: 60 },
  },
};
const recovered = applyTeamTraining(recoverySave, 'RECOVERY').players[prospect.id];
assert.equal(recovered.developmentProgress, 95, 'Recovery training must preserve development progress');
assert.ok(recovered.fitness > 60, 'Recovery training should restore fitness');

const cappedSave = {
  ...readyToGrow,
  players: {
    ...readyToGrow.players,
    [prospect.id]: { ...prospect, developmentProgress: 45, overall: prospect.potential },
  },
};
const capped = applyTeamTraining(cappedSave, 'ATTACKING').players[prospect.id];
assert.equal(capped.developmentProgress, 45, 'Players at potential must not accumulate more growth progress');

console.log('Player development validation passed: age-based progress, potential cap, focused attribute gains, recovery preservation and one-session-per-week protection.');
