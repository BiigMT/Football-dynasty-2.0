import { resolveMatchFixingChoice, applyMatchFixingConsequence } from '../src/engine/playerLife';
import { LegendProfile, Player } from '../src/types/football';

const baseLegend = {
  playerId: 'p1', managerTrust: 60, squadRole: 'ROTATION' as const,
  internationalCallUp: false, individualAwards: [], trophies: [], retired: false,
  agentOffers: [],
} as LegendProfile;
const basePlayer = {
  id: 'p1', morale: 70, confidence: 70, reputation: 55,
  seasonStats: { averageRating: 6.8 },
} as unknown as Player;

const consulted = resolveMatchFixingChoice(baseLegend, 'CONSULT', 4, 1, 'rival');
if (consulted.matchFixing?.status !== 'CONSULTED') throw new Error('Agent consultation did not persist');
const rejected = resolveMatchFixingChoice(consulted, 'REJECT', 4, 1, 'rival');
if (rejected.matchFixing?.status !== 'REJECTED' || rejected.personalBalance) throw new Error('Reject path failed');
const reported = resolveMatchFixingChoice(baseLegend, 'REPORT', 4, 1, 'rival');
if (reported.matchFixing?.status !== 'REPORTED' || reported.managerTrust <= baseLegend.managerTrust) throw new Error('Report path failed');
const accepted = resolveMatchFixingChoice(baseLegend, 'ACCEPT', 4, 1, 'rival');
if (accepted.matchFixing?.status !== 'ACCEPTED' || accepted.personalBalance !== 35000) throw new Error('Accept path did not credit in-game funds');
const consequence = applyMatchFixingConsequence(accepted, basePlayer, 'fixture-1');
if (!consequence || consequence.legend.matchFixing?.status !== 'UNDER_INVESTIGATION') throw new Error('Investigation consequence did not trigger');
if (consequence.player.confidence >= basePlayer.confidence || consequence.player.morale >= basePlayer.morale) throw new Error('Performance consequences were not applied');
if (applyMatchFixingConsequence(consequence.legend, consequence.player, 'fixture-1')) throw new Error('Same fixture consequence was applied twice');
if (applyMatchFixingConsequence(rejected, basePlayer, 'fixture-2')) throw new Error('Rejected offer incorrectly affected match');
console.log('Player Career phone and integrity storyline validation passed.');
