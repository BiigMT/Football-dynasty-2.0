import assert from 'node:assert/strict';
import {
  PREMIER_LEAGUE_2026_SQUADS,
  PREMIER_LEAGUE_SQUAD_SOURCE,
  PREMIER_LEAGUE_SQUAD_SNAPSHOT,
} from '../src/data/premierLeagueSquads2026';
import { AFRICAN_CLUB_SQUADS_2026, AFRICAN_SQUAD_EXPECTED_COUNTS, AFRICAN_SQUAD_SOURCES } from '../src/data/africanClubSquads2026';

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
assert.equal(AFRICAN_CLUB_SQUADS_2026.find(s=>s.clubId==='cairo_eagles')?.players.length,AFRICAN_SQUAD_EXPECTED_COUNTS.alAhly,'Al Ahly roster count must match the official squad page');
assert.equal(AFRICAN_CLUB_SQUADS_2026.find(s=>s.clubId==='tunis_esperance')?.players.length,AFRICAN_SQUAD_EXPECTED_COUNTS.esperance,'Espérance roster count must match the official squad page');
assert.equal(AFRICAN_CLUB_SQUADS_2026.find(s=>s.clubId==='enyimba_elephants')?.players.length,AFRICAN_SQUAD_EXPECTED_COUNTS.enyimba,'Enyimba roster count must match the official squad page');
console.log('Validated '+africanIds.size+' African club rosters against manually checked official source counts.');

import { EUROPEAN_CLUB_SQUADS_2026, EUROPEAN_SQUAD_SOURCES } from '../src/data/europeanClubSquads2026';
import { LEAGUE_BLUEPRINTS } from '../src/engine/database';

assert.ok(EUROPEAN_SQUAD_SOURCES.snapshot.startsWith('2026-') && EUROPEAN_SQUAD_SOURCES.snapshot.length === 10,'European snapshot date must be explicit');
for (const source of Object.values(EUROPEAN_SQUAD_SOURCES).filter(value => value !== EUROPEAN_SQUAD_SOURCES.snapshot)) {
  assert.ok(source.startsWith('https://'),'European squad source must be HTTPS');
}
const gameClubIds = new Set(LEAGUE_BLUEPRINTS.flatMap(league => league.clubs.map(club => club.id)));
const europeanClubIds = new Set<string>();
for (const squad of EUROPEAN_CLUB_SQUADS_2026) {
  assert.ok(gameClubIds.has(squad.clubId),'European roster must map to an existing in-game club: '+squad.clubId);
  assert.ok(!europeanClubIds.has(squad.clubId),'Duplicate European club mapping: '+squad.clubId);
  europeanClubIds.add(squad.clubId);
  assert.ok(squad.players.length >= 18,squad.clubName+' needs a complete first-team roster');
  const names = new Set<string>(), numbers = new Set<number>();
  for (const player of squad.players) {
    assert.ok(player.name.trim().length > 1,'European player name is required in '+squad.clubName);
    const normalized = player.name.trim().toLocaleLowerCase();
    assert.ok(!names.has(normalized),'Duplicate European player name '+player.name+' in '+squad.clubName);
    names.add(normalized);
    if (player.shirtNumber !== undefined) {
      assert.ok(Number.isInteger(player.shirtNumber) && player.shirtNumber >= 1 && player.shirtNumber <= 99,'Invalid European shirt number for '+player.name);
      assert.ok(!numbers.has(player.shirtNumber),'Duplicate European shirt number '+player.shirtNumber+' in '+squad.clubName);
      numbers.add(player.shirtNumber);
    }
  }
}
assert.equal(europeanClubIds.size,66,'Expected all LaLiga clubs, all Serie A clubs, all Bundesliga clubs and the existing Ligue 1 roster tranche');
const europeanPlayerCount = EUROPEAN_CLUB_SQUADS_2026.reduce((n,s)=>n+s.players.length,0);
assert.ok(europeanPlayerCount >= 1800,'Expected 1,800+ verified European player entries');
const serieAClubIds = LEAGUE_BLUEPRINTS.find(l=>l.id==='ita_serie')?.clubs.map(c=>c.id) ?? [];
assert.equal(serieAClubIds.length,20,'Serie A game database must contain 20 clubs');
assert.ok(serieAClubIds.every(id=>europeanClubIds.has(id)),'Every Serie A in-game club must have a verified roster mapping');
assert.equal(EUROPEAN_CLUB_SQUADS_2026.filter(s=>s.clubId.startsWith('ger_bundesliga_')).length,18,'Bundesliga must cover all 18 clubs');
assert.equal(EUROPEAN_CLUB_SQUADS_2026.find(s=>s.clubId==='esp_liga_elc')?.players.length,30,'Elche should include the 30 players individually confirmed from official match reports and signings');
console.log('Validated '+europeanClubIds.size+' European club mappings and '+europeanPlayerCount+' players.');
