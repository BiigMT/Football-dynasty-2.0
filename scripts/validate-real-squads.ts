import assert from 'node:assert/strict';
import { applyOfficialSquads } from '../src/data/applyOfficialSquads';
import type { Player } from '../src/types/football';
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
import { LEAGUE_BLUEPRINTS, buildWorldDatabase } from '../src/engine/database';

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
assert.equal(europeanClubIds.size,76,'Expected every club in LaLiga, Serie A, Bundesliga and Ligue 1 to have a roster mapping');
const europeanPlayerCount = EUROPEAN_CLUB_SQUADS_2026.reduce((n,s)=>n+s.players.length,0);
assert.ok(europeanPlayerCount >= 2100,'Expected 2,100+ verified European player entries');
const serieAClubIds = LEAGUE_BLUEPRINTS.find(l=>l.id==='ita_serie')?.clubs.map(c=>c.id) ?? [];
const bundesligaClubIds = LEAGUE_BLUEPRINTS.find(l=>l.id==='ger_bundesliga')?.clubs.map(c=>c.id) ?? [];
const ligue1ClubIds = LEAGUE_BLUEPRINTS.find(l=>l.id==='fra_ligue1')?.clubs.map(c=>c.id) ?? [];
assert.equal(serieAClubIds.length,20,'Serie A game database must contain 20 clubs');
assert.equal(bundesligaClubIds.length,18,'Bundesliga game database must contain 18 clubs');
assert.equal(ligue1ClubIds.length,18,'Ligue 1 game database must contain 18 clubs');
assert.ok(serieAClubIds.every(id=>europeanClubIds.has(id)),'Every Serie A in-game club must have a verified roster mapping');
assert.ok(bundesligaClubIds.every(id=>europeanClubIds.has(id)),'Every Bundesliga in-game club must have a verified roster mapping');
assert.ok(ligue1ClubIds.every(id=>europeanClubIds.has(id)),'Every Ligue 1 in-game club must have a verified roster mapping');
assert.equal(EUROPEAN_CLUB_SQUADS_2026.filter(s=>s.clubId.startsWith('ger_bundesliga_')).length,18,'Bundesliga must cover all 18 clubs');
assert.equal(EUROPEAN_CLUB_SQUADS_2026.find(s=>s.clubId==='esp_liga_elc')?.players.length,30,'Elche should include the 30 players individually confirmed from official match reports and signings');
console.log('Validated '+europeanClubIds.size+' European club mappings and '+europeanPlayerCount+' players.');


// Career import regression: real identities update without replacing player IDs
// or overwriting a saved player's simulation/progression fields.
const careerClub = PREMIER_LEAGUE_2026_SQUADS[0];
const careerIdentity = careerClub.players.find(player => player.shirtNumber !== undefined)!;
const preservedPlayer = {
  id:'career_player_preserved',
  name:'Generated Career Player',
  clubId:careerClub.clubId,
  shirtNumber:careerIdentity.shirtNumber!,
  overall:78,
  weeklyWage:12000,
  seasonStats:{appearances:17,goals:6,assists:4},
  careerHistory:[{season:2025,clubId:careerClub.clubId,appearances:17}],
} as unknown as Player;
const careerPlayerPool:Record<string,Player> = {[preservedPlayer.id]:preservedPlayer};
applyOfficialSquads(careerPlayerPool,[{
  clubId:careerClub.clubId,
  clubName:careerClub.clubName,
  players:[careerIdentity],
}]);
const updatedCareerPlayer=careerPlayerPool[preservedPlayer.id];
assert.equal(updatedCareerPlayer.id,'career_player_preserved','Career player IDs must remain stable');
assert.equal(updatedCareerPlayer.name,careerIdentity.name,'Career player identity should be updated from the verified roster');
assert.equal(updatedCareerPlayer.overall,78,'Career player overall must be preserved');
assert.equal(updatedCareerPlayer.weeklyWage,12000,'Career player wage must be preserved');
assert.deepEqual(updatedCareerPlayer.seasonStats,preservedPlayer.seasonStats,'Career season statistics must be preserved');
assert.deepEqual(updatedCareerPlayer.careerHistory,preservedPlayer.careerHistory,'Career history must be preserved');
console.log('Validated real-player identity import preserves career IDs, ratings, wages and progression.');

// Generated-world relationship audit: every club, league, squad and fixture
// must resolve to a matching record before a new career can be created.
const world = buildWorldDatabase();
const seenLeagueClubIds = new Set<string>();
for (const [leagueId, league] of Object.entries(world.leagues)) {
  assert.equal(league.id, leagueId, 'League key and ID must match: ' + leagueId);
  assert.ok(league.clubIds.length >= 2, 'League needs at least two clubs: ' + leagueId);
  assert.equal(new Set(league.clubIds).size, league.clubIds.length, 'Duplicate club membership in ' + leagueId);
  const standingIds = new Set(league.standings.map(row => row.clubId));
  assert.equal(standingIds.size, league.standings.length, 'Duplicate league standing row in ' + leagueId);
  assert.equal(standingIds.size, league.clubIds.length, 'Every league club needs one standing row in ' + leagueId);
  for (const clubId of league.clubIds) {
    assert.ok(!seenLeagueClubIds.has(clubId), 'Club must belong to exactly one league: ' + clubId);
    seenLeagueClubIds.add(clubId);
    const club = world.clubs[clubId];
    assert.ok(club, 'League references missing club: ' + clubId);
    assert.equal(club.id, clubId, 'Club key and ID must match: ' + clubId);
    assert.equal(club.leagueId, leagueId, 'Club league link must resolve: ' + clubId);
    assert.ok(standingIds.has(clubId), 'Club is missing a league standing row: ' + clubId);
    const squadIds = [...club.tactics.startingXI, ...club.tactics.bench];
    assert.equal(new Set(squadIds).size, squadIds.length, 'Club lineup contains duplicate player IDs: ' + clubId);
    assert.equal(club.tactics.startingXI.length, 11, 'Club must have an 11-player starting XI: ' + clubId);
    assert.ok(club.tactics.bench.length <= 7, 'Club bench exceeds seven players: ' + clubId);
    assert.ok(club.tactics.startingXI.includes(club.tactics.captainId), 'Club captain must be in the starting XI: ' + clubId);
    for (const playerId of squadIds) {
      assert.ok(world.players[playerId], 'Club lineup references missing player: ' + playerId);
      assert.equal(world.players[playerId].clubId, clubId, 'Club lineup player has the wrong club ID: ' + playerId);
    }
  }
  for (const fixture of league.fixtures) {
    assert.ok(world.clubs[fixture.homeClubId], 'Fixture has missing home club: ' + fixture.id);
    assert.ok(world.clubs[fixture.awayClubId], 'Fixture has missing away club: ' + fixture.id);
    assert.notEqual(fixture.homeClubId, fixture.awayClubId, 'Fixture cannot play a club against itself: ' + fixture.id);
    assert.equal(fixture.competitionId, leagueId, 'Fixture competition must match its league: ' + fixture.id);
  }
}
assert.equal(seenLeagueClubIds.size, Object.keys(world.clubs).length, 'Every generated club must belong to exactly one league');
for (const [playerId, player] of Object.entries(world.players)) {
  assert.equal(player.id, playerId, 'Player key and ID must match: ' + playerId);
  assert.ok(player.clubId === 'free_agent' || world.clubs[player.clubId], 'Player references an unknown club: ' + playerId);
}
for (const [teamId, team] of Object.entries(world.nationalTeams)) {
  assert.equal(team.id, teamId, 'National-team key and ID must match: ' + teamId);
  assert.ok(team.squadPlayerIds.length >= 16, 'National team needs at least 16 players: ' + teamId);
  assert.equal(new Set(team.squadPlayerIds).size, team.squadPlayerIds.length, 'National team contains duplicate players: ' + teamId);
  for (const playerId of team.squadPlayerIds) {
    assert.ok(world.players[playerId], 'National team references missing player: ' + playerId);
    assert.equal(world.players[playerId].nationality, team.name, 'National team player nationality mismatch: ' + playerId + ' / ' + team.name);
  }
}
console.log('Validated ' + Object.keys(world.clubs).length + ' club links, ' + Object.keys(world.players).length + ' player records, ' + Object.keys(world.leagues).length + ' leagues and ' + Object.keys(world.nationalTeams).length + ' national teams.');
