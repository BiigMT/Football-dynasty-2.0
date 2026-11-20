import assert from 'node:assert/strict';
import { resolveTeammateInteraction, getTeammateRelationship } from '../src/engine/careerRelationships';
import { negotiateTransferOffer } from '../src/engine/transferNegotiations';
import { resolveManagerConversation, publishCareerMediaResponse } from '../src/engine/playerCareerDecisions';
import type { CareerSave, Player, TransferOffer } from '../src/types/football';

const player = { id: 'p1', clubId: 'c1', form: 70, morale: 70, confidence: 70, name: 'Player One' } as Player;
const teammate = { id: 'p2', clubId: 'c1', form: 82, morale: 50, confidence: 60, name: 'Team Mate' } as Player;
const offer = { id: 'offer-1', playerId: 'p1', fromClubId: 'c1', toClubId: 'c2', status: 'PENDING', round: 1, fee: 1000000, proposedWage: 5000, contractYears: 3, signingBonus: 0, releaseClause: 0, message: '', isIncomingToUser: true } as TransferOffer;
const save = {
  mode: 'PLAYER', season: 1, currentWeek: 4,
  legend: { playerId: 'p1', managerTrust: 50, squadRole: 'FIRST_TEAM', internationalCallUp: false, individualAwards: [], trophies: [], retired: false, agentOffers: [] },
  players: { p1: player, p2: teammate }, transferOffers: [offer],
} as unknown as CareerSave;

const praised = resolveTeammateInteraction(save, 'p2', 'PRAISE');
assert.equal(getTeammateRelationship(praised, 'p2'), 55);
assert.equal(praised.players.p2.morale, 52);
assert.equal(save.playerRelationships, undefined, 'input save must not be mutated');
assert.equal(resolveTeammateInteraction(save, 'missing', 'ENCOURAGE'), save);

const countered = negotiateTransferOffer(save, 'offer-1', 'COUNTER', { fee: 1500000, proposedWage: 6500 });
assert.equal(countered.transferOffers[0].status, 'COUNTERED');
assert.equal(countered.transferOffers[0].round, 2);
assert.equal(countered.transferOffers[0].fee, 1500000);
assert.equal(save.transferOffers[0].status, 'PENDING', 'input offer must not be mutated');
assert.equal(negotiateTransferOffer(save, 'offer-1', 'ACCEPT').transferOffers[0].status, 'ACCEPTED');
assert.equal(negotiateTransferOffer(save, 'offer-1', 'REJECT').transferOffers[0].status, 'REJECTED');
console.log('Career relationship and transfer negotiation validations passed.');

const managerSave = resolveManagerConversation(save, 'PROMISE_LOYALTY');
assert.equal(managerSave.legend?.managerTrust, 52);
assert.equal(save.legend?.managerTrust, 50, 'manager conversation must not mutate input');
const mediaSave = publishCareerMediaResponse(save, 'THANK_FANS');
assert.equal(mediaSave.legend?.phoneFollowers, 12);
assert.equal(mediaSave.legend?.socialPosts?.[0]?.caption.includes('support'), true);

const agentSave = { ...save, legend: { ...save.legend!, agentOffers: [offer] } };
const agentCounter = negotiateTransferOffer(agentSave, 'offer-1', 'COUNTER', { proposedWage: 7000 });
assert.equal(agentCounter.legend?.agentOffers[0].status, 'COUNTERED');
assert.equal(agentCounter.legend?.agentOffers[0].proposedWage, 7000);
console.log('Manager conversation, media response and agent negotiation validations passed.');

import { declareCareerRivalry } from '../src/engine/careerRivalries';
const rivalryFixture = { id: 'fixture-rival', competitionId: 'league', competitionName: 'League', competitionType: 'LEAGUE' as const, round: 1, week: 4, homeClubId: 'c1', awayClubId: 'c2', played: false, homeGoals: 0, awayGoals: 0 };
const rival = { ...teammate, id: 'rival', clubId: 'c2', overall: 80 };
const rivalryBase = { ...save, clubs: { c1: { id: 'c1' }, c2: { id: 'c2', tactics: { startingXI: ['rival'] } } }, players: { ...save.players, rival }, leagues: { league: { fixtures: [rivalryFixture] } }, cupFixtures: [], continentalFixtures: [] } as unknown as CareerSave;
const declared = declareCareerRivalry(rivalryBase, 'rival', 'fixture-rival');
assert.equal(declared.legend?.rivalryPending, true);
assert.equal(declared.legend?.rivalryPlayerId, 'rival');
assert.equal(rivalryBase.legend?.rivalryPending, undefined, 'rivalry declaration must not mutate input');
console.log('Career rivalry declaration validation passed.');
