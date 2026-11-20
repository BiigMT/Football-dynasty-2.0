import assert from 'node:assert/strict';
import { getCareerCalendarEvents, getCareerWeekDate } from '../src/engine/careerCalendar';
import type { CareerSave, Fixture } from '../src/types/football';

const leagueFixture: Fixture = { id: 'league-w1', competitionId: 'league', competitionName: 'Premier Division', competitionType: 'LEAGUE', round: 1, week: 1, homeClubId: 'club-user', awayClubId: 'club-away', played: false, homeGoals: 0, awayGoals: 0 };
const cupFixture: Fixture = { ...leagueFixture, id: 'cup-w2', competitionId: 'cup', competitionName: 'National Cup', competitionType: 'DOMESTIC_CUP', week: 2 };
const save = {
  season: 1, currentWeek: 1, userClubId: 'club-user', clubs: { 'club-user': { id: 'club-user', name: 'Dynasty FC' }, 'club-away': { id: 'club-away', name: 'Rivals FC' } },
  leagues: { league: { fixtures: [leagueFixture] } }, cupFixtures: [cupFixture], continentalFixtures: [],
  transferWindowOpen: true, news: [], players: {}, nationalTeams: {}, mode: 'MANAGER',
} as unknown as CareerSave;
const events = getCareerCalendarEvents(save);
assert.equal(events.some((event) => event.id === 'league-w1' && event.type === 'MATCH'), true);
assert.equal(events.some((event) => event.id === 'cup-w2' && event.type === 'MATCH'), true);
assert.equal(events.some((event) => event.id === 'training_s1_w1'), true);
assert.equal(events.some((event) => event.id === 'recovery_s1_w1'), true);
assert.equal(events.some((event) => event.id === 'transfer_s1_w1'), true);
assert.equal(events.some((event) => event.id === 'transfer_s1_w4'), true);
assert.equal(events.some((event) => event.id === 'league-w1' && event.date === getCareerWeekDate(1, 1, 5).toISOString().slice(0, 10)), true);
assert.equal(getCareerWeekDate(2, 1).getUTCFullYear(), 2027);
assert.equal(new Set(events.map((event) => event.id)).size, events.length, 'calendar event IDs must be unique');
assert.deepEqual(events.map((event) => event.date), [...events.map((event) => event.date)].sort(), 'events should be chronologically ordered');
console.log('Full-season calendar validation passed.');
