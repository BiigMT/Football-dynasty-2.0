import assert from 'node:assert/strict';
import {
  PREMIER_LEAGUE_2026_SQUADS,
  PREMIER_LEAGUE_SQUAD_SOURCE,
  PREMIER_LEAGUE_SQUAD_SNAPSHOT,
} from '../src/data/premierLeagueSquads2026';

assert.match(PREMIER_LEAGUE_SQUAD_SOURCE,/^https:\/\//,'Squad source must be HTTPS');
assert.match(PREMIER_LEAGUE_SQUAD_SNAPSHOT,/^2026-\d{2}-\d{2}$/,'Snapshot date must be explicit');
assert.equal(PREMIER_LEAGUE_2026_SQUADS.length,20,'Expected all 20 Premier League clubs');

const clubIds=new Set<string>();
let totalPlayers=0;
for(const club of PREMIER_LEAGUE_2026_SQUADS){
  assert.ok(club.clubId&&club.clubName,'Every club needs a stable ID and name');
  assert.ok(!clubIds.has(club.clubId),'Duplicate club ID: '+club.clubId);
  clubIds.add(club.clubId);
  assert.ok(club.players.length>=18,club.clubName+' needs a complete first-team squad');
  const numbers=new Set<number>();
  const names=new Set<string>();
  for(const player of club.players){
    assert.ok(player.name.trim().length>1,'Player name is required in '+club.clubName);
    assert.ok(Number.isInteger(player.shirtNumber)&&player.shirtNumber>=1&&player.shirtNumber<=99,'Invalid shirt number for '+player.name);
    assert.ok(!numbers.has(player.shirtNumber),'Duplicate shirt number '+player.shirtNumber+' in '+club.clubName);
    numbers.add(player.shirtNumber);
    const normalized=player.name.trim().toLocaleLowerCase();
    assert.ok(!names.has(normalized),'Duplicate player name '+player.name+' in '+club.clubName);
    names.add(normalized);
    totalPlayers++;
  }
}
assert.ok(totalPlayers>=500,'Expected a broad, complete league roster snapshot');
console.log('Validated '+clubIds.size+' Premier League clubs and '+totalPlayers+' player entries.');
