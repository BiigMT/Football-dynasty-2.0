import assert from 'node:assert/strict';
import {
  PREMIER_LEAGUE_2026_SQUADS,
  PREMIER_LEAGUE_SQUAD_SOURCE,
  PREMIER_LEAGUE_SQUAD_SNAPSHOT,
} from '../src/data/premierLeagueSquads2026';
import { AFRICAN_CLUB_SQUADS_2026, AFRICAN_SQUAD_SOURCES } from '../src/data/africanClubSquads2026';

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

assert.match(AFRICAN_SQUAD_SOURCES.snapshot,/^2026-\d{2}-\d{2}$/,'African squad snapshot date must be explicit');
for(const source of [AFRICAN_SQUAD_SOURCES.alAhly,AFRICAN_SQUAD_SOURCES.esperance,AFRICAN_SQUAD_SOURCES.enyimba]){
  assert.match(source,/^https:\/\//,'African squad sources must be HTTPS');
}
const africanIds=new Set<string>();
for(const squad of AFRICAN_CLUB_SQUADS_2026){
  assert.ok(squad.clubId&&squad.clubName,'African club needs a stable ID and name');
  assert.ok(!africanIds.has(squad.clubId),'Duplicate African club ID: '+squad.clubId);
  africanIds.add(squad.clubId);
  assert.ok(squad.players.length>=18,squad.clubName+' needs a complete first-team roster');
  const names=new Set<string>(),numbers=new Set<number>();
  for(const player of squad.players){
    assert.ok(player.name.trim().length>1,'African player name is required in '+squad.clubName);
    const normalized=player.name.trim().toLocaleLowerCase();
    assert.ok(!names.has(normalized),'Duplicate African player name '+player.name+' in '+squad.clubName);
    names.add(normalized);
    if(player.shirtNumber!==undefined){
      assert.ok(Number.isInteger(player.shirtNumber)&&player.shirtNumber>=1&&player.shirtNumber<=99,'Invalid shirt number for '+player.name);
      assert.ok(!numbers.has(player.shirtNumber),'Duplicate shirt number '+player.shirtNumber+' in '+squad.clubName);
      numbers.add(player.shirtNumber);
    }
  }
}
console.log('Validated '+africanIds.size+' source-verified African club squads.');
