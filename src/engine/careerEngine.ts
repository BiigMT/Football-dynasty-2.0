import {
  CareerHistoryEntry,
  CareerSave,
  Club,
  Fixture,
  IndividualDrill,
  InternationalTournament,
  League,
  LeagueStandingRow,
  MatchSession,
  NationalTeam,
  NewsItem,
  Player,
  PlayerAppearance,
  PlayerAttributes,
  PlayingStyle,
  Position,
  TrainingFocus,
  TransferDealType,
  TransferOffer,
} from '../types/football';
import {
  buildWorldDatabase,
  calculateMarketValue,
  calculateOverall,
  generatePlayer,
  generateRoundRobinFixtures,
  getFormationSlots,
  pickPlayingStyle,
} from './database';
import { quickSimulateFullMatch } from './matchEngine';

export function sortStandings(rows: LeagueStandingRow[]): LeagueStandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

function generateCupRound(
  compId: string,
  compName: string,
  compType: 'DOMESTIC_CUP' | 'CONTINENTAL' | 'INTERNATIONAL',
  clubIds: string[],
  week: number,
  round: number
): Fixture[] {
  const shuffled = [...clubIds].sort(() => Math.random() - 0.5);
  const fixtures: Fixture[] = [];
  for (let i = 0; i + 1 < shuffled.length; i += 2) {
    fixtures.push({
      id: `${compId}_r${round}_${i / 2}`,
      competitionId: compId,
      competitionName: compName,
      competitionType: compType,
      round,
      week,
      homeClubId: shuffled[i],
      awayClubId: shuffled[i + 1],
      played: false,
      homeGoals: 0,
      awayGoals: 0,
      isKnockout: true,
    });
  }
  return fixtures;
}

function buildSeasonCupAndContinental(
  clubs: Record<string, Club>,
  leagues: Record<string, League>,
  userLeagueId: string
): { cupFixtures: Fixture[]; continentalFixtures: Fixture[] } {
  const userLeague = leagues[userLeagueId];
  const cupFixtures = generateCupRound(
    `${userLeagueId}_cup`,
    `${userLeague.country} National Cup`,
    'DOMESTIC_CUP',
    userLeague.clubIds,
    5,
    1
  );

  const topClubs: string[] = [];
  Object.values(leagues).forEach((l) => {
    const sorted = [...l.clubIds].sort((a, b) => clubs[b].reputation - clubs[a].reputation);
    topClubs.push(sorted[0], sorted[1]);
  });
  const eight = topClubs.slice(0, 8);
  const continentalFixtures = generateCupRound(
    'dynasty_continental',
    'Dynasty Champions Cup',
    'CONTINENTAL',
    eight,
    7,
    1
  );

  return { cupFixtures, continentalFixtures };
}

function buildNationalClubProxy(
  nt: NationalTeam,
  players: Record<string, Player>
): Club {
  const slots = getFormationSlots(nt.formation);
  const used = new Set<string>();
  const startingXI: string[] = [];

  slots.forEach((slotPos) => {
    const best = nt.squadPlayerIds
      .filter((pid) => !used.has(pid) && players[pid])
      .sort((a, b) => {
        const pa = players[a];
        const pb = players[b];
        const aFit = pa.position === slotPos ? 15 : 0;
        const bFit = pb.position === slotPos ? 15 : 0;
        return pb.overall + bFit - (pa.overall + aFit);
      })[0];
    if (best) {
      used.add(best);
      startingXI.push(best);
    }
  });
  const bench = nt.squadPlayerIds.filter((pid) => !used.has(pid)).slice(0, 7);

  return {
    id: nt.id,
    name: nt.name,
    shortName: nt.code,
    country: nt.name,
    region: nt.region,
    leagueId: 'international',
    primaryColor: nt.primaryColor,
    secondaryColor: nt.secondaryColor,
    reputation: nt.reputation,
    stadiumName: `${nt.name} National Arena`,
    stadiumCapacity: 65000,
    chemistry: 76,
    boardExpectation: 'Represent the nation with pride',
    targetPosition: 1,
    tactics: {
      formation: nt.formation,
      mentality: 'BALANCED',
      pressing: 'MID_PRESS',
      passing: 'MIXED',
      tempo: 62,
      startingXI,
      bench,
      captainId: startingXI[0],
    },
    finances: {
      transferBudget: 0,
      wageBudgetWeekly: 0,
      weeklyWageBill: 0,
      cashBalance: 0,
      matchdayIncomePerHomeGame: 0,
      sponsorAnnualIncome: 0,
    },
  };
}

function createInternationalTournament(
  season: number,
  nationalTeams: Record<string, NationalTeam>,
  userNatId?: string
): InternationalTournament {
  const isAfconYear = season % 2 === 1;
  const africanTeams = Object.values(nationalTeams).filter((t) => t.region === 'AFRICA');
  const pool = isAfconYear && africanTeams.length >= 4
    ? africanTeams.slice(0, 4).map((t) => t.id)
    : Object.values(nationalTeams)
        .sort((a, b) => a.worldRank - b.worldRank)
        .slice(0, 8)
        .map((t) => t.id);

  if (userNatId && !pool.includes(userNatId) && nationalTeams[userNatId]) {
    pool[pool.length - 1] = userNatId;
  }

  const name = isAfconYear ? 'African Cup of Nations' : 'Dynasty World Cup';
  const shortName = isAfconYear ? 'AFCON' : 'WORLD CUP';
  const fixtures = generateCupRound('intl_tourney', name, 'INTERNATIONAL', pool, 15, 1);

  return {
    id: `intl_s${season}`,
    name,
    shortName,
    region: isAfconYear ? 'AFRICA' : 'WORLD',
    season,
    stage: pool.length === 4 ? 'SEMIFINAL' : 'QUARTERFINAL',
    userTeamId: userNatId,
    fixtures,
  };
}

export function createManagerCareer(params: {
  slotId: string;
  managerName: string;
  nationality: string;
  philosophy: 'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced';
  clubId: string;
}): CareerSave {
  const world = buildWorldDatabase();
  const userClub = world.clubs[params.clubId];
  const { cupFixtures, continentalFixtures } = buildSeasonCupAndContinental(
    world.clubs,
    world.leagues,
    userClub.leagueId
  );

  const userNat = Object.values(world.nationalTeams).find((n) => n.name === params.nationality);
  const internationalTournament = createInternationalTournament(1, world.nationalTeams, userNat?.id);

  return {
    slotId: params.slotId,
    mode: 'MANAGER',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    season: 1,
    currentWeek: 1,
    transferWindowOpen: true,
    userClubId: params.clubId,
    manager: {
      name: params.managerName,
      nationality: params.nationality,
      age: 38,
      philosophy: params.philosophy,
      reputation: Math.max(55, userClub.reputation - 8),
      boardConfidence: 76,
      clubId: params.clubId,
      wins: 0,
      draws: 0,
      losses: 0,
      trophies: [],
      jobOffers: [],
    },
    clubs: world.clubs,
    players: world.players,
    leagues: world.leagues,
    nationalTeams: world.nationalTeams,
    cupFixtures,
    continentalFixtures,
    internationalTournament,
    transferOffers: [],
    news: [
      {
        id: `news_init_${Date.now()}`,
        week: 1,
        season: 1,
        category: 'BOARD',
        headline: `${params.managerName} unveiled at ${userClub.name}`,
        body: `Board expects: ${userClub.boardExpectation}. Summer transfer window is open for business.`,
      },
    ],
    trainingFocus: 'BALANCED',
    weekTrained: false,
  };
}

export function createLegendCareer(params: {
  slotId: string;
  playerName: string;
  nationality: string;
  age: number;
  heightCm: number;
  weightKg: number;
  preferredFoot: 'Right' | 'Left' | 'Both';
  position: Position;
  secondaryPositions: Position[];
  shirtNumber: number;
  playingStyle: PlayingStyle;
  appearance: PlayerAppearance;
  clubId: string;
}): CareerSave {
  const world = buildWorldDatabase();
  const club = world.clubs[params.clubId];
  const baseAttr = Math.max(66, Math.min(76, club.reputation - 8));
  const isGK = params.position === 'GK';
  const isDef = ['CB', 'LB', 'RB', 'CDM'].includes(params.position);
  const isAtt = ['ST', 'LW', 'RW', 'CAM'].includes(params.position);

  const attributes: PlayerAttributes = {
    speed: isGK ? 45 : isAtt ? baseAttr + 7 : baseAttr + 2,
    acceleration: isGK ? 46 : isAtt ? baseAttr + 8 : baseAttr + 2,
    shooting: isGK ? 28 : isAtt ? baseAttr + 7 : isDef ? baseAttr - 10 : baseAttr + 2,
    finishing: isGK ? 24 : params.position === 'ST' ? baseAttr + 9 : isAtt ? baseAttr + 5 : baseAttr - 12,
    passing: isGK ? 56 : ['CM', 'CAM', 'CDM'].includes(params.position) ? baseAttr + 8 : baseAttr + 1,
    vision: isGK ? 52 : ['CAM', 'CM'].includes(params.position) ? baseAttr + 8 : baseAttr,
    dribbling: isGK ? 32 : isAtt || params.position === 'CM' ? baseAttr + 7 : baseAttr - 6,
    ballControl: isGK ? 44 : baseAttr + 5,
    crossing: isGK ? 28 : ['LW', 'RW', 'LB', 'RB'].includes(params.position) ? baseAttr + 7 : baseAttr - 4,
    tackling: isGK ? 25 : isDef ? baseAttr + 8 : baseAttr - 14,
    marking: isGK ? 25 : isDef ? baseAttr + 7 : baseAttr - 16,
    strength: baseAttr + (['CB', 'ST'].includes(params.position) ? 6 : 0),
    stamina: baseAttr + 6,
    jumping: baseAttr + (['GK', 'CB', 'ST'].includes(params.position) ? 6 : 0),
    heading: isGK ? 30 : ['CB', 'ST'].includes(params.position) ? baseAttr + 7 : baseAttr - 5,
    positioning: baseAttr + 4,
    reactions: baseAttr + 5,
    goalkeeping: isGK ? baseAttr + 9 : 18,
  };

  const overall = calculateOverall(params.position, attributes);
  const potential = Math.min(95, Math.max(overall + 12, 88));
  const marketValue = calculateMarketValue(overall, params.age, potential);
  const userPlayerId = 'legend_user_player';

  const userPlayer: Player = {
    id: userPlayerId,
    name: params.playerName,
    nationality: params.nationality,
    age: params.age,
    heightCm: params.heightCm,
    weightKg: params.weightKg,
    preferredFoot: params.preferredFoot,
    position: params.position,
    secondaryPositions: params.secondaryPositions,
    shirtNumber: params.shirtNumber,
    playingStyle: params.playingStyle || pickPlayingStyle(params.position, Math.random),
    appearance: params.appearance,
    attributes,
    overall,
    potential,
    form: 76,
    sharpness: 78,
    fitness: 96,
    morale: 82,
    confidence: 78,
    reputation: 58,
    marketValue,
    weeklyWage: Math.max(4500, Math.round((marketValue * 0.002) / 500) * 500),
    contractYears: 3,
    releaseClause: marketValue * 2,
    clubId: params.clubId,
    isUserPlayer: true,
    injuredWeeks: 0,
    suspendedMatches: 0,
    scouted: true,
    seasonStats: {
      appearances: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      averageRating: 0,
      ratingCount: 0,
      motm: 0,
    },
    internationalCaps: 0,
    internationalGoals: 0,
    careerHistory: [],
  };

  world.players[userPlayerId] = userPlayer;
  // Place user player on bench or starting XI depending on overall
  const nextBench = [userPlayerId, ...club.tactics.bench.slice(0, 6)];
  club.tactics.bench = nextBench;

  const { cupFixtures, continentalFixtures } = buildSeasonCupAndContinental(
    world.clubs,
    world.leagues,
    club.leagueId
  );

  const natTeam = Object.values(world.nationalTeams).find((n) => n.name === params.nationality);
  const internationalTournament = createInternationalTournament(1, world.nationalTeams, natTeam?.id);

  return {
    slotId: params.slotId,
    mode: 'PLAYER',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    season: 1,
    currentWeek: 1,
    transferWindowOpen: true,
    userClubId: params.clubId,
    legend: {
      playerId: userPlayerId,
      managerTrust: 58,
      squadRole: 'ROTATION',
      internationalCallUp: false,
      nationalTeamId: natTeam?.id,
      individualAwards: [],
      trophies: [],
      retired: false,
      agentOffers: [],
    },
    clubs: world.clubs,
    players: world.players,
    leagues: world.leagues,
    nationalTeams: world.nationalTeams,
    cupFixtures,
    continentalFixtures,
    internationalTournament,
    transferOffers: [],
    news: [
      {
        id: `news_legend_${Date.now()}`,
        week: 1,
        season: 1,
        category: 'ACADEMY',
        headline: `${params.playerName} signs first senior deal with ${club.name}`,
        body: `Wearing #${params.shirtNumber}, the ${params.age}-year-old ${params.position} enters training determined to break into the Starting XI.`,
      },
    ],
    trainingFocus: 'BALANCED',
    weekTrained: false,
  };
}

export function getNextUserFixture(save: CareerSave): Fixture | null {
  const userClub = save.clubs[save.userClubId];
  if (!userClub) return null;

  // Check league fixtures for currentWeek
  const userLeague = save.leagues[userClub.leagueId];
  const leagueFix = userLeague?.fixtures.find(
    (f) =>
      !f.played &&
      f.week === save.currentWeek &&
      (f.homeClubId === save.userClubId || f.awayClubId === save.userClubId)
  );
  if (leagueFix) return leagueFix;

  const cupFix = save.cupFixtures.find(
    (f) =>
      !f.played &&
      f.week === save.currentWeek &&
      (f.homeClubId === save.userClubId || f.awayClubId === save.userClubId)
  );
  if (cupFix) return cupFix;

  const contFix = save.continentalFixtures.find(
    (f) =>
      !f.played &&
      f.week === save.currentWeek &&
      (f.homeClubId === save.userClubId || f.awayClubId === save.userClubId)
  );
  if (contFix) return contFix;

  // International fixture if called up / managing NT
  const userNatId = save.manager?.nationalTeamId ?? (save.legend?.internationalCallUp ? save.legend.nationalTeamId : undefined);
  if (userNatId && save.internationalTournament) {
    const intlFix = save.internationalTournament.fixtures.find(
      (f) =>
        !f.played &&
        f.week === save.currentWeek &&
        (f.homeClubId === userNatId || f.awayClubId === userNatId)
    );
    if (intlFix) return intlFix;
  }

  return null;
}

export function getClubStandingsPosition(save: CareerSave, clubId: string): number {
  const club = save.clubs[clubId];
  if (!club) return 1;
  const league = save.leagues[club.leagueId];
  if (!league) return 1;
  const sorted = sortStandings(league.standings);
  const idx = sorted.findIndex((r) => r.clubId === clubId);
  return idx === -1 ? 1 : idx + 1;
}

export function applyMatchSessionToWorld(save: CareerSave, session: MatchSession): CareerSave {
  const nextClubs = { ...save.clubs };
  const nextPlayers = { ...save.players };
  const nextLeagues = { ...save.leagues };
  let nextCup = [...save.cupFixtures];
  let nextCont = [...save.continentalFixtures];
  let nextIntl = save.internationalTournament ? { ...save.internationalTournament } : undefined;
  const nextNews = [...save.news];

  const homeGoals = session.homeStats.goals;
  const awayGoals = session.awayStats.goals;
  let winnerId: string | undefined;
  if (homeGoals > awayGoals) winnerId = session.homeClubId;
  else if (awayGoals > homeGoals) winnerId = session.awayClubId;
  else if (session.competitionType !== 'LEAGUE') {
    // Penalty shootout tie-breaker for knockout ties
    winnerId = Math.random() < 0.52 ? session.homeClubId : session.awayClubId;
  }

  // Publish a proper match report for the user's fixture so the career world
  // reacts to results instead of showing only generic dashboard headlines.
  if (session.userClubSide) {
    const homeName = save.clubs[session.homeClubId]?.name ?? save.nationalTeams[session.homeClubId]?.name ?? session.homeClubId;
    const awayName = save.clubs[session.awayClubId]?.name ?? save.nationalTeams[session.awayClubId]?.name ?? session.awayClubId;
    const userWon = winnerId === save.userClubId || winnerId === (save.manager?.nationalTeamId ?? save.legend?.nationalTeamId);
    const userDrew = homeGoals === awayGoals;
    const verdict = userDrew ? 'share the points' : userWon ? 'claim a huge victory' : 'suffer a disappointing defeat';
    const standout = Object.values(session.playerStates)
      .filter((st) => st.onPitch || st.subbedOff)
      .sort((a, b) => b.rating - a.rating)[0];
    const standoutPlayer = standout ? save.players[standout.playerId] : undefined;
    const keyEvents = session.events
      .filter((event) => event.type === 'GOAL' || event.type === 'RED_CARD' || event.type === 'INJURY')
      .slice(-3)
      .map((event) => `${event.minute}' ${event.text}`);
    const reportBody = [
      `${homeName} ${homeGoals}-${awayGoals} ${awayName} in the ${session.competitionName}.`,
      `Your side ${verdict}.`,
      standoutPlayer ? `Player of the Match: ${standoutPlayer.name} (${standout.rating.toFixed(1)}/10).` : '',
      keyEvents.length ? `Talking points: ${keyEvents.join(' · ')}.` : '',
    ].filter(Boolean).join(' ');
    nextNews.unshift({
      id: `news_match_report_${session.id}`,
      week: save.currentWeek,
      season: save.season,
      category: 'MATCH',
      headline: `FULL-TIME: ${homeName} ${homeGoals}-${awayGoals} ${awayName}`,
      body: reportBody,
    });
  }

  // Update player season stats & fitness
  Object.values(session.playerStates).forEach((st) => {
    const p = nextPlayers[st.playerId];
    if (!p) return;
    const played = st.onPitch || st.subbedOff;
    if (!played) return;

    const prevCount = p.seasonStats.ratingCount;
    const newAvg = Number(
      ((p.seasonStats.averageRating * prevCount + st.rating) / (prevCount + 1)).toFixed(2)
    );
    const conceded = st.side === 'HOME' ? awayGoals : homeGoals;
    const cleanSheet = conceded === 0 && (p.position === 'GK' || ['CB', 'LB', 'RB'].includes(p.position)) ? 1 : 0;

    nextPlayers[p.id] = {
      ...p,
      fitness: Math.max(45, Math.round(st.stamina)),
      form: Math.max(40, Math.min(99, Math.round(p.form * 0.75 + st.rating * 3.5))),
      sharpness: Math.min(100, p.sharpness + 5),
      injuredWeeks: st.injured ? 2 : p.injuredWeeks,
      suspendedMatches: st.redCard ? 1 : p.suspendedMatches,
      seasonStats: {
        ...p.seasonStats,
        appearances: p.seasonStats.appearances + 1,
        starts: st.slotIndex >= 0 ? p.seasonStats.starts + 1 : p.seasonStats.starts,
        minutes: p.seasonStats.minutes + (st.slotIndex >= 0 ? 82 : 24),
        goals: p.seasonStats.goals + st.goals,
        assists: p.seasonStats.assists + st.assists,
        cleanSheets: p.seasonStats.cleanSheets + cleanSheet,
        yellowCards: p.seasonStats.yellowCards + st.yellowCards,
        redCards: p.seasonStats.redCards + (st.redCard ? 1 : 0),
        averageRating: newAvg,
        ratingCount: prevCount + 1,
        motm: p.seasonStats.motm + (st.rating >= 8.4 ? 1 : 0),
      },
      internationalCaps: session.isInternational ? p.internationalCaps + 1 : p.internationalCaps,
      internationalGoals: session.isInternational ? p.internationalGoals + st.goals : p.internationalGoals,
    };
  });

  // Update League fixture & standings
  if (session.competitionType === 'LEAGUE') {
    const compId = nextClubs[session.homeClubId]?.leagueId;
    const league = compId ? nextLeagues[compId] : undefined;
    if (league) {
      const updatedFixtures = league.fixtures.map((f) =>
        f.id === session.fixtureId ? { ...f, played: true, homeGoals, awayGoals } : f
      );
      const updatedStandings = league.standings.map((row) => {
        if (row.clubId !== session.homeClubId && row.clubId !== session.awayClubId) return row;
        const isHome = row.clubId === session.homeClubId;
        const gf = isHome ? homeGoals : awayGoals;
        const ga = isHome ? awayGoals : homeGoals;
        const won = gf > ga ? 1 : 0;
        const drawn = gf === ga ? 1 : 0;
        const lost = gf < ga ? 1 : 0;
        return {
          ...row,
          played: row.played + 1,
          won: row.won + won,
          drawn: row.drawn + drawn,
          lost: row.lost + lost,
          goalsFor: row.goalsFor + gf,
          goalsAgainst: row.goalsAgainst + ga,
          points: row.points + won * 3 + drawn,
        };
      });
      nextLeagues[compId] = { ...league, fixtures: updatedFixtures, standings: updatedStandings };
    }
  } else if (session.competitionType === 'DOMESTIC_CUP') {
    nextCup = nextCup.map((f) =>
      f.id === session.fixtureId ? { ...f, played: true, homeGoals, awayGoals, winnerId } : f
    );
  } else if (session.competitionType === 'CONTINENTAL') {
    nextCont = nextCont.map((f) =>
      f.id === session.fixtureId ? { ...f, played: true, homeGoals, awayGoals, winnerId } : f
    );
  } else if (session.competitionType === 'INTERNATIONAL' && nextIntl) {
    nextIntl.fixtures = nextIntl.fixtures.map((f) =>
      f.id === session.fixtureId ? { ...f, played: true, homeGoals, awayGoals, winnerId } : f
    );
  }

  // Club Matchday Finances
  const homeClub = nextClubs[session.homeClubId];
  if (homeClub) {
    nextClubs[homeClub.id] = {
      ...homeClub,
      finances: {
        ...homeClub.finances,
        cashBalance: homeClub.finances.cashBalance + homeClub.finances.matchdayIncomePerHomeGame,
        transferBudget: homeClub.finances.transferBudget + Math.round(homeClub.finances.matchdayIncomePerHomeGame * 0.18),
      },
    };
  }

  // Manager / Legend Career updates
  let nextManager = save.manager ? { ...save.manager } : undefined;
  let nextLegend = save.legend ? { ...save.legend } : undefined;

  if (nextManager && session.userClubSide) {
    const userWon = winnerId === save.userClubId;
    const drew = homeGoals === awayGoals && session.competitionType === 'LEAGUE';
    nextManager.wins += userWon ? 1 : 0;
    nextManager.draws += drew ? 1 : 0;
    nextManager.losses += !userWon && !drew ? 1 : 0;
    nextManager.boardConfidence = Math.max(
      15,
      Math.min(100, nextManager.boardConfidence + (userWon ? 4 : drew ? 0 : -5))
    );
    nextManager.reputation = Math.max(
      40,
      Math.min(99, nextManager.reputation + (userWon ? 1 : 0))
    );
  }

  if (nextLegend && session.userPlayerId) {
    const userSt = session.playerStates[session.userPlayerId];
    const uPlayer = nextPlayers[session.userPlayerId];
    if (userSt && uPlayer) {
      const completedObjs = session.userObjectives.filter((o) => o.completed).length;
      const trustDelta = userSt.rating >= 7.5 ? 6 : userSt.rating >= 6.7 ? 2 : -4;
      const nextTrust = Math.max(15, Math.min(100, nextLegend.managerTrust + trustDelta + completedObjs));

      // Attribute XP progression from match rating
      const growthBoost = userSt.rating >= 7.2 && uPlayer.overall < uPlayer.potential ? 1 : 0;
      const updatedAttrs = { ...uPlayer.attributes };
      if (growthBoost > 0) {
        if (uPlayer.position === 'GK') {
          updatedAttrs.goalkeeping = Math.min(98, updatedAttrs.goalkeeping + 1);
          updatedAttrs.reactions = Math.min(98, updatedAttrs.reactions + 1);
        } else if (['ST', 'LW', 'RW'].includes(uPlayer.position)) {
          updatedAttrs.finishing = Math.min(98, updatedAttrs.finishing + 1);
          updatedAttrs.positioning = Math.min(98, updatedAttrs.positioning + 1);
        } else if (['CM', 'CAM', 'CDM'].includes(uPlayer.position)) {
          updatedAttrs.passing = Math.min(98, updatedAttrs.passing + 1);
          updatedAttrs.vision = Math.min(98, updatedAttrs.vision + 1);
        } else {
          updatedAttrs.tackling = Math.min(98, updatedAttrs.tackling + 1);
          updatedAttrs.marking = Math.min(98, updatedAttrs.marking + 1);
        }
      }
      const nextOvr = calculateOverall(uPlayer.position, updatedAttrs);
      nextPlayers[uPlayer.id] = {
        ...uPlayer,
        attributes: updatedAttrs,
        overall: nextOvr,
        reputation: Math.min(99, uPlayer.reputation + (userSt.rating >= 7.5 ? 2 : userSt.goals > 0 ? 1 : 0)),
        confidence: Math.max(30, Math.min(99, uPlayer.confidence + (userSt.rating >= 7.0 ? 4 : -2))),
        marketValue: calculateMarketValue(nextOvr, uPlayer.age, uPlayer.potential),
      };

      const squadRole =
        nextTrust >= 88
          ? 'CAPTAIN'
          : nextTrust >= 76
          ? 'KEY_STAR'
          : nextTrust >= 62
          ? 'FIRST_TEAM'
          : nextTrust >= 45
          ? 'ROTATION'
          : 'RESERVE';

      // Auto-adjust Starting XI placement based on Trust
      const userClub = nextClubs[save.userClubId];
      if (userClub && nextTrust >= 62 && !userClub.tactics.startingXI.includes(uPlayer.id)) {
        const slots = getFormationSlots(userClub.tactics.formation);
        const targetSlot = slots.findIndex((s) => s === uPlayer.position || uPlayer.secondaryPositions.includes(s));
        const replaceIdx = targetSlot >= 0 ? targetSlot : 10;
        const displaced = userClub.tactics.startingXI[replaceIdx];
        const newXI = [...userClub.tactics.startingXI];
        newXI[replaceIdx] = uPlayer.id;
        const newBench = [displaced, ...userClub.tactics.bench.filter((id) => id !== uPlayer.id)].slice(0, 7);
        userClub.tactics = { ...userClub.tactics, startingXI: newXI, bench: newBench };
        nextNews.unshift({
          id: `news_xi_${Date.now()}`,
          week: save.currentWeek,
          season: save.season,
          category: 'MATCH',
          headline: `${uPlayer.name} earns Starting XI promotion`,
          body: `Strong performances have convinced the ${userClub.name} boss to name ${uPlayer.name} a regular starter.`,
        });
      }

      // Check National Team Call-Up
      const natTeam = nextLegend.nationalTeamId ? save.nationalTeams[nextLegend.nationalTeamId] : undefined;
      let callUp = nextLegend.internationalCallUp;
      if (natTeam && !callUp && nextOvr >= natTeam.reputation - 8) {
        callUp = true;
        if (!natTeam.squadPlayerIds.includes(uPlayer.id)) {
          natTeam.squadPlayerIds = [uPlayer.id, ...natTeam.squadPlayerIds.slice(0, 17)];
        }
        nextNews.unshift({
          id: `news_nat_${Date.now()}`,
          week: save.currentWeek,
          season: save.season,
          category: 'INTERNATIONAL',
          headline: `INTERNATIONAL CALL-UP: ${natTeam.name} summon ${uPlayer.name}!`,
          body: `${uPlayer.name}'s club form has earned an official call-up to the ${natTeam.name} senior national squad.`,
        });
      }

      nextLegend = {
        ...nextLegend,
        managerTrust: nextTrust,
        squadRole,
        internationalCallUp: callUp,
      };
    }
  }

  return {
    ...save,
    updatedAt: Date.now(),
    clubs: nextClubs,
    players: nextPlayers,
    leagues: nextLeagues,
    cupFixtures: nextCup,
    continentalFixtures: nextCont,
    internationalTournament: nextIntl,
    manager: nextManager,
    legend: nextLegend,
    activeMatch: undefined,
    news: nextNews.slice(0, 30),
  };
}

export function advanceWeek(save: CareerSave): CareerSave {
  let nextSave: CareerSave = {
    ...save,
    clubs: { ...save.clubs },
    players: { ...save.players },
    leagues: { ...save.leagues },
    cupFixtures: [...save.cupFixtures],
    continentalFixtures: [...save.continentalFixtures],
    news: [...save.news],
  };

  // Simulate all unplayed fixtures for currentWeek across all leagues
  Object.keys(nextSave.leagues).forEach((lid) => {
    const league = nextSave.leagues[lid];
    const weekFixtures = league.fixtures.filter((f) => !f.played && f.week === save.currentWeek);
    weekFixtures.forEach((f) => {
      const h = nextSave.clubs[f.homeClubId];
      const a = nextSave.clubs[f.awayClubId];
      if (h && a) {
        const res = quickSimulateFullMatch(f, h, a, nextSave.players);
        nextSave = applyMatchSessionToWorld(nextSave, res);
      }
    });
  });

  // Simulate unplayed cup & continental fixtures for currentWeek
  const cupWeek = nextSave.cupFixtures.filter((f) => !f.played && f.week === save.currentWeek);
  cupWeek.forEach((f) => {
    const h = nextSave.clubs[f.homeClubId];
    const a = nextSave.clubs[f.awayClubId];
    if (h && a) {
      const res = quickSimulateFullMatch(f, h, a, nextSave.players);
      nextSave = applyMatchSessionToWorld(nextSave, res);
    }
  });

  const contWeek = nextSave.continentalFixtures.filter((f) => !f.played && f.week === save.currentWeek);
  contWeek.forEach((f) => {
    const h = nextSave.clubs[f.homeClubId];
    const a = nextSave.clubs[f.awayClubId];
    if (h && a) {
      const res = quickSimulateFullMatch(f, h, a, nextSave.players);
      nextSave = applyMatchSessionToWorld(nextSave, res);
    }
  });

  // Simulate unplayed international tournament fixtures for currentWeek
  if (nextSave.internationalTournament) {
    const intlWeek = nextSave.internationalTournament.fixtures.filter(
      (f) => !f.played && f.week === save.currentWeek
    );
    intlWeek.forEach((f) => {
      const hNat = nextSave.nationalTeams[f.homeClubId];
      const aNat = nextSave.nationalTeams[f.awayClubId];
      if (hNat && aNat) {
        const hProxy = buildNationalClubProxy(hNat, nextSave.players);
        const aProxy = buildNationalClubProxy(aNat, nextSave.players);
        const res = quickSimulateFullMatch(f, hProxy, aProxy, nextSave.players);
        nextSave = applyMatchSessionToWorld(nextSave, res);
      }
    });
  }

  // Advance Cup / Continental / International knockout rounds when current round completes
  const advanceKnockoutIfReady = (
    fixtures: Fixture[],
    compId: string,
    compName: string,
    compType: 'DOMESTIC_CUP' | 'CONTINENTAL' | 'INTERNATIONAL',
    nextWeekNum: number
  ): { fixtures: Fixture[]; championId?: string } => {
    if (!fixtures.length) return { fixtures };
    const maxRound = Math.max(...fixtures.map((f) => f.round));
    const currentRoundFixtures = fixtures.filter((f) => f.round === maxRound);
    if (currentRoundFixtures.every((f) => f.played)) {
      const winners = currentRoundFixtures.map((f) => f.winnerId || f.homeClubId);
      if (winners.length === 1) {
        return { fixtures, championId: winners[0] };
      }
      const nextRound = generateCupRound(compId, compName, compType, winners, nextWeekNum, maxRound + 1);
      return { fixtures: [...fixtures, ...nextRound] };
    }
    return { fixtures };
  };

  const cupAdv = advanceKnockoutIfReady(
    nextSave.cupFixtures,
    'dom_cup',
    `${nextSave.leagues[nextSave.clubs[nextSave.userClubId].leagueId]?.country ?? 'National'} Cup`,
    'DOMESTIC_CUP',
    save.currentWeek + 4
  );
  nextSave.cupFixtures = cupAdv.fixtures;
  if (cupAdv.championId && !nextSave.news.some((n) => n.headline.includes('lifts the National Cup') && n.season === save.season)) {
    const champ = nextSave.clubs[cupAdv.championId];
    if (champ) {
      nextSave.news.unshift({
        id: `news_cup_${Date.now()}`,
        week: save.currentWeek,
        season: save.season,
        category: 'AWARD',
        headline: `${champ.name} lifts the National Cup!`,
        body: `A memorable knockout triumph earns silverware for ${champ.name}.`,
      });
      if (nextSave.manager && champ.id === nextSave.userClubId) {
        nextSave.manager.trophies.push(`Season ${save.season} National Cup`);
      }
      if (nextSave.legend && champ.id === nextSave.userClubId) {
        nextSave.legend.trophies.push(`Season ${save.season} National Cup`);
      }
    }
  }

  const contAdv = advanceKnockoutIfReady(
    nextSave.continentalFixtures,
    'dynasty_continental',
    'Dynasty Champions Cup',
    'CONTINENTAL',
    save.currentWeek + 4
  );
  nextSave.continentalFixtures = contAdv.fixtures;
  if (contAdv.championId && !nextSave.news.some((n) => n.headline.includes('Champions Cup') && n.season === save.season)) {
    const champ = nextSave.clubs[contAdv.championId];
    if (champ) {
      nextSave.news.unshift({
        id: `news_cont_${Date.now()}`,
        week: save.currentWeek,
        season: save.season,
        category: 'AWARD',
        headline: `${champ.name} crowned Dynasty Champions Cup winners!`,
        body: `${champ.name} conquered the continental elite in a thrilling final.`,
      });
      if (nextSave.manager && champ.id === nextSave.userClubId) {
        nextSave.manager.trophies.push(`Season ${save.season} Dynasty Champions Cup`);
      }
      if (nextSave.legend && champ.id === nextSave.userClubId) {
        nextSave.legend.trophies.push(`Season ${save.season} Dynasty Champions Cup`);
      }
    }
  }

  if (nextSave.internationalTournament && !nextSave.internationalTournament.championTeamId) {
    const intlAdv = advanceKnockoutIfReady(
      nextSave.internationalTournament.fixtures,
      'intl_tourney',
      nextSave.internationalTournament.name,
      'INTERNATIONAL',
      save.currentWeek + 2
    );
    nextSave.internationalTournament = {
      ...nextSave.internationalTournament,
      fixtures: intlAdv.fixtures,
      championTeamId: intlAdv.championId,
      stage: intlAdv.championId ? 'COMPLETED' : nextSave.internationalTournament.stage,
    };
    if (intlAdv.championId) {
      const nt = nextSave.nationalTeams[intlAdv.championId];
      if (nt) {
        nextSave.news.unshift({
          id: `news_intl_champ_${Date.now()}`,
          week: save.currentWeek,
          season: save.season,
          category: 'INTERNATIONAL',
          headline: `${nt.name} win the ${nextSave.internationalTournament.name}!`,
          body: `Historic scenes as ${nt.name} claim international glory.`,
        });
        if (nextSave.legend && nextSave.legend.nationalTeamId === nt.id && nextSave.legend.internationalCallUp) {
          nextSave.legend.trophies.push(`Season ${save.season} ${nextSave.internationalTournament.shortName}`);
        }
      }
    }
  }

  // Weekly player recovery & injury/suspension ticks
  Object.keys(nextSave.players).forEach((pid) => {
    const p = nextSave.players[pid];
    nextSave.players[pid] = {
      ...p,
      fitness: Math.min(100, p.fitness + 14),
      injuredWeeks: Math.max(0, p.injuredWeeks - 1),
      suspendedMatches: Math.max(0, p.suspendedMatches - 1),
    };
  });

  // Deduct weekly wages for user club
  const userClub = nextSave.clubs[nextSave.userClubId];
  if (userClub) {
    userClub.finances.cashBalance -= userClub.finances.weeklyWageBill;
  }

  const nextWeek = save.currentWeek + 1;
  const transferWindowOpen = (nextWeek >= 1 && nextWeek <= 4) || (nextWeek >= 9 && nextWeek <= 11);

  // Generate Transfer Interest for Become a Legend if performing well
  if (nextSave.legend && transferWindowOpen && Math.random() < 0.55) {
    const uPlayer = nextSave.players[nextSave.legend.playerId];
    if (uPlayer && uPlayer.overall >= 72) {
      const suitor = Object.values(nextSave.clubs).find(
        (c) =>
          c.id !== nextSave.userClubId &&
          c.reputation >= userClub.reputation - 2 &&
          c.reputation <= uPlayer.overall + 8 &&
          !nextSave.legend?.agentOffers.some((o) => o.fromClubId === c.id)
      );
      if (suitor) {
        const offer: TransferOffer = {
          id: `leg_offer_${Date.now()}`,
          playerId: uPlayer.id,
          fromClubId: suitor.id,
          toClubId: nextSave.userClubId,
          dealType: 'PERMANENT',
          fee: uPlayer.marketValue,
          proposedWage: Math.round((uPlayer.weeklyWage * 1.35) / 500) * 500,
          contractYears: 4,
          signingBonus: Math.round(uPlayer.marketValue * 0.08),
          releaseClause: uPlayer.marketValue * 2,
          status: 'PENDING',
          round: 1,
          message: `${suitor.name} scouts have tracked your form and want to sign you as a key first-team starter.`,
          isIncomingToUser: true,
        };
        nextSave.legend = {
          ...nextSave.legend,
          agentOffers: [offer, ...nextSave.legend.agentOffers].slice(0, 4),
        };
        nextSave.news.unshift({
          id: `news_leg_offer_${Date.now()}`,
          week: nextWeek,
          season: save.season,
          category: 'TRANSFER',
          headline: `${suitor.name} approach ${uPlayer.name}'s agent`,
          body: `${suitor.name} are prepared to offer €${offer.proposedWage.toLocaleString()}/wk to lure ${uPlayer.name}.`,
        });
      }
    }
  }

  // Generate Incoming Bids for Manager Career during open window
  if (nextSave.manager && transferWindowOpen && Math.random() < 0.45) {
    const squad = Object.values(nextSave.players).filter((p) => p.clubId === nextSave.userClubId);
    const hotPlayer = squad.sort((a, b) => b.seasonStats.averageRating - a.seasonStats.averageRating)[0];
    const buyer = Object.values(nextSave.clubs).find((c) => c.id !== nextSave.userClubId && c.finances.transferBudget > (hotPlayer?.marketValue ?? 0));
    if (hotPlayer && buyer && !nextSave.transferOffers.some((o) => o.playerId === hotPlayer.id && o.status === 'PENDING')) {
      const bidFee = Math.round((hotPlayer.marketValue * (0.95 + Math.random() * 0.25)) / 50000) * 50000;
      nextSave.transferOffers = [
        {
          id: `bid_in_${Date.now()}`,
          playerId: hotPlayer.id,
          fromClubId: buyer.id,
          toClubId: nextSave.userClubId,
          dealType: 'PERMANENT',
          fee: bidFee,
          proposedWage: hotPlayer.weeklyWage,
          contractYears: 3,
          signingBonus: 0,
          releaseClause: hotPlayer.releaseClause,
          status: 'PENDING',
          round: 1,
          message: `${buyer.name} tabled an official €${(bidFee / 1000000).toFixed(1)}M bid for ${hotPlayer.name}.`,
          isIncomingToUser: true,
        },
        ...nextSave.transferOffers,
      ];
    }
  }

  // Managerial Job Offer / National Team Offer if reputation high
  if (nextSave.manager && nextWeek >= 10 && nextSave.manager.wins >= 6 && nextSave.manager.jobOffers.length < 2 && Math.random() < 0.35) {
    const bigClub = Object.values(nextSave.clubs).find(
      (c) => c.id !== nextSave.userClubId && c.reputation >= userClub.reputation + 2
    );
    if (bigClub) {
      nextSave.manager = {
        ...nextSave.manager,
        jobOffers: [
          ...nextSave.manager.jobOffers,
          {
            clubId: bigClub.id,
            clubName: bigClub.name,
            leagueName: nextSave.leagues[bigClub.leagueId]?.name ?? 'Top Division',
            wage: Math.round(bigClub.reputation * 950),
            message: `${bigClub.name} board admires your tactical identity and offers you the managerial hotseat.`,
          },
        ],
      };
    }
    if (!nextSave.manager.nationalTeamId && nextSave.manager.reputation >= 78) {
      const nat = Object.values(nextSave.nationalTeams).find((n) => n.name === nextSave.manager?.nationality) || Object.values(nextSave.nationalTeams)[0];
      if (nat) {
        nextSave.manager.nationalTeamId = nat.id;
        nextSave.news.unshift({
          id: `news_nt_mgr_${Date.now()}`,
          week: nextWeek,
          season: save.season,
          category: 'INTERNATIONAL',
          headline: `${nextSave.manager.name} appointed Head Coach of ${nat.name}!`,
          body: `You will now lead ${nat.name} in upcoming international tournaments alongside your club duties.`,
        });
      }
    }
  }

  return {
    ...nextSave,
    currentWeek: nextWeek,
    transferWindowOpen,
    weekTrained: false,
    news: nextSave.news.slice(0, 35),
  };
}

export function applyTeamTraining(save: CareerSave, focus: TrainingFocus): CareerSave {
  if (save.weekTrained) return save;
  const nextPlayers = { ...save.players };

  Object.values(nextPlayers)
    .filter((p) => p.clubId === save.userClubId)
    .forEach((p) => {
      const attrs = { ...p.attributes };
      let fitDelta = -4;
      let sharpDelta = 6;
      const canGrow = p.overall < p.potential && Math.random() < (p.age <= 22 ? 0.55 : 0.25);

      if (focus === 'RECOVERY') {
        fitDelta = 12;
        sharpDelta = 1;
      } else if (canGrow) {
        if (focus === 'ATTACKING') {
          attrs.finishing = Math.min(98, attrs.finishing + 1);
          attrs.shooting = Math.min(98, attrs.shooting + 1);
        } else if (focus === 'POSSESSION') {
          attrs.passing = Math.min(98, attrs.passing + 1);
          attrs.vision = Math.min(98, attrs.vision + 1);
        } else if (focus === 'DEFENDING') {
          attrs.tackling = Math.min(98, attrs.tackling + 1);
          attrs.marking = Math.min(98, attrs.marking + 1);
        } else if (focus === 'FITNESS') {
          attrs.stamina = Math.min(98, attrs.stamina + 1);
          attrs.speed = Math.min(98, attrs.speed + 1);
        } else {
          attrs.ballControl = Math.min(98, attrs.ballControl + 1);
        }
      }

      const ovr = calculateOverall(p.position, attrs);
      nextPlayers[p.id] = {
        ...p,
        attributes: attrs,
        overall: ovr,
        fitness: Math.max(55, Math.min(100, p.fitness + fitDelta)),
        sharpness: Math.min(100, p.sharpness + sharpDelta),
        marketValue: calculateMarketValue(ovr, p.age, p.potential),
      };
    });

  return {
    ...save,
    players: nextPlayers,
    trainingFocus: focus,
    weekTrained: true,
  };
}

export function applyLegendDrill(save: CareerSave, drill: IndividualDrill): CareerSave {
  if (save.weekTrained || !save.legend) return save;
  const uPlayer = save.players[save.legend.playerId];
  if (!uPlayer) return save;

  const attrs = { ...uPlayer.attributes };
  const bump = (k: keyof PlayerAttributes) => {
    attrs[k] = Math.min(98, attrs[k] + (uPlayer.overall < uPlayer.potential ? 1 : 0));
  };

  if (drill === 'FINISHING') {
    bump('finishing');
    bump('shooting');
  } else if (drill === 'PACE_AGILITY') {
    bump('speed');
    bump('acceleration');
  } else if (drill === 'VISION_PASSING') {
    bump('passing');
    bump('vision');
  } else if (drill === 'DRIBBLING') {
    bump('dribbling');
    bump('ballControl');
  } else if (drill === 'DEFENSIVE_DUELS') {
    bump('tackling');
    bump('marking');
  } else if (drill === 'STAMINA_STRENGTH') {
    bump('stamina');
    bump('strength');
  } else if (drill === 'GOALKEEPING') {
    bump('goalkeeping');
    bump('reactions');
  }

  const nextOvr = calculateOverall(uPlayer.position, attrs);
  const nextPlayers = {
    ...save.players,
    [uPlayer.id]: {
      ...uPlayer,
      attributes: attrs,
      overall: nextOvr,
      sharpness: Math.min(100, uPlayer.sharpness + 7),
      fitness: Math.max(65, uPlayer.fitness - 3),
      marketValue: calculateMarketValue(nextOvr, uPlayer.age, uPlayer.potential),
    },
  };

  return {
    ...save,
    players: nextPlayers,
    weekTrained: true,
    legend: {
      ...save.legend,
      managerTrust: Math.min(100, save.legend.managerTrust + 1),
    },
  };
}

export function promoteYouthProspect(save: CareerSave): CareerSave {
  const club = save.clubs[save.userClubId];
  if (!club) return save;
  const positions: Position[] = ['CB', 'CM', 'CAM', 'LW', 'ST', 'GK'];
  const pos = positions[Math.floor(Math.random() * positions.length)];
  const prospect = generatePlayer({
    id: `youth_${club.id}_${Date.now()}`,
    clubId: club.id,
    region: club.region,
    country: club.country === 'Pan-Africa' ? 'Egypt' : club.country,
    position: pos,
    targetOverall: Math.max(64, club.reputation - 15),
    shirtNumber: 30 + Math.floor(Math.random() * 20),
    age: 17,
    isYouth: true,
    seed: Date.now() % 999999,
  });
  prospect.potential = Math.min(94, prospect.overall + 14);

  return {
    ...save,
    players: { ...save.players, [prospect.id]: prospect },
    clubs: {
      ...save.clubs,
      [club.id]: {
        ...club,
        tactics: {
          ...club.tactics,
          bench: club.tactics.bench.length < 7 ? [...club.tactics.bench, prospect.id] : club.tactics.bench,
        },
      },
    },
    news: [
      {
        id: `news_acad_${Date.now()}`,
        week: save.currentWeek,
        season: save.season,
        category: 'ACADEMY' as const,
        headline: `Academy Graduate: ${prospect.name} (${prospect.position}, ${prospect.overall} OVR)`,
        body: `Promoted to the ${club.name} senior squad with ${prospect.potential} projected potential.`,
      },
      ...save.news,
    ].slice(0, 35),
  };
}

export function executeTransfer(
  save: CareerSave,
  playerId: string,
  buyerClubId: string,
  fee: number,
  proposedWage: number,
  contractYears: number,
  releaseClause: number,
  exchangePlayerId?: string
): CareerSave {
  const player = save.players[playerId];
  const buyer = save.clubs[buyerClubId];
  const seller = save.clubs[player?.clubId];
  if (!player || !buyer || !seller) return save;

  const nextClubs = { ...save.clubs };
  const nextPlayers = { ...save.players };

  // Remove from seller tactics
  const removeFromClub = (club: Club, pid: string): Club => ({
    ...club,
    tactics: {
      ...club.tactics,
      startingXI: club.tactics.startingXI.filter((id) => id !== pid),
      bench: club.tactics.bench.filter((id) => id !== pid),
    },
  });

  let updatedSeller = removeFromClub(seller, playerId);
  updatedSeller.finances = {
    ...updatedSeller.finances,
    transferBudget: updatedSeller.finances.transferBudget + fee,
    weeklyWageBill: Math.max(0, updatedSeller.finances.weeklyWageBill - player.weeklyWage),
  };

  let updatedBuyer = {
    ...buyer,
    finances: {
      ...buyer.finances,
      transferBudget: Math.max(0, buyer.finances.transferBudget - fee),
      weeklyWageBill: buyer.finances.weeklyWageBill + proposedWage,
    },
    tactics: {
      ...buyer.tactics,
      bench: [...buyer.tactics.bench, playerId].slice(0, 7),
    },
  };

  // Fill seller XI if needed
  if (updatedSeller.tactics.startingXI.length < 11) {
    const replacement = updatedSeller.tactics.bench[0] || Object.values(nextPlayers).find((p) => p.clubId === seller.id && p.id !== playerId)?.id;
    if (replacement) {
      updatedSeller.tactics.startingXI.push(replacement);
      updatedSeller.tactics.bench = updatedSeller.tactics.bench.filter((id) => id !== replacement);
    }
  }
  if (updatedBuyer.tactics.startingXI.length < 11) {
    updatedBuyer.tactics.startingXI.push(playerId);
    updatedBuyer.tactics.bench = updatedBuyer.tactics.bench.filter((id) => id !== playerId);
  }

  // Handle Player Exchange
  if (exchangePlayerId && nextPlayers[exchangePlayerId]) {
    const ex = nextPlayers[exchangePlayerId];
    updatedBuyer = removeFromClub(updatedBuyer, exchangePlayerId);
    updatedSeller.tactics.bench = [...updatedSeller.tactics.bench, exchangePlayerId].slice(0, 7);
    nextPlayers[exchangePlayerId] = { ...ex, clubId: seller.id };
  }

  nextPlayers[playerId] = {
    ...player,
    clubId: buyerClubId,
    weeklyWage: proposedWage,
    contractYears,
    releaseClause,
    morale: 85,
  };

  nextClubs[seller.id] = updatedSeller;
  nextClubs[buyer.id] = updatedBuyer;

  const isUserMoved = save.legend?.playerId === playerId;

  return {
    ...save,
    userClubId: isUserMoved ? buyerClubId : save.userClubId,
    clubs: nextClubs,
    players: nextPlayers,
    legend: isUserMoved && save.legend ? { ...save.legend, managerTrust: 65, squadRole: 'FIRST_TEAM', agentOffers: [] } : save.legend,
    news: [
      {
        id: `news_tx_${Date.now()}`,
        week: save.currentWeek,
        season: save.season,
        category: 'TRANSFER' as const,
        headline: `OFFICIAL: ${player.name} signs for ${buyer.name}`,
        body: `Completed move from ${seller.name} for €${(fee / 1000000).toFixed(1)}M on a ${contractYears}-year deal.`,
      },
      ...save.news,
    ].slice(0, 35),
  };
}

export function evaluateTransferBid(
  save: CareerSave,
  params: {
    playerId: string;
    dealType: TransferDealType;
    fee: number;
    proposedWage: number;
    contractYears: number;
    signingBonus: number;
    releaseClause: number;
    exchangePlayerId?: string;
  }
): { accepted: boolean; counterFee?: number; message: string; save: CareerSave } {
  const player = save.players[params.playerId];
  const buyer = save.clubs[save.userClubId];
  if (!player || !buyer) return { accepted: false, message: 'Invalid transfer target.', save };

  if (!save.transferWindowOpen) {
    return { accepted: false, message: 'Transfer window is currently closed.', save };
  }
  if (params.fee > buyer.finances.transferBudget) {
    return { accepted: false, message: 'Insufficient transfer budget for this fee.', save };
  }

  const exchangeVal = params.exchangePlayerId ? (save.players[params.exchangePlayerId]?.marketValue ?? 0) * 0.85 : 0;
  const totalValueOffered = params.fee + exchangeVal;
  const askingPrice = params.dealType === 'LOAN' ? Math.round(player.marketValue * 0.14) : Math.round(player.marketValue * 1.08);
  const wageOk = params.proposedWage >= player.weeklyWage * 0.92;

  if (!wageOk) {
    return {
      accepted: false,
      message: `${player.name}'s agent rejected the wage offer (expects at least €${Math.round(player.weeklyWage * 0.95).toLocaleString()}/wk).`,
      save,
    };
  }

  if (totalValueOffered >= askingPrice * 0.96) {
    const nextSave = executeTransfer(
      save,
      params.playerId,
      save.userClubId,
      params.fee,
      params.proposedWage,
      params.contractYears,
      params.releaseClause,
      params.exchangePlayerId
    );
    return {
      accepted: true,
      message: `Deal agreed! ${player.name} has joined ${buyer.name}.`,
      save: nextSave,
    };
  }

  const counterFee = Math.max(askingPrice, Math.round((askingPrice - exchangeVal) / 50000) * 50000);
  return {
    accepted: false,
    counterFee,
    message: `Counter-offer: ${save.clubs[player.clubId]?.name} demand €${(counterFee / 1000000).toFixed(2)}M for ${player.name}.`,
    save,
  };
}

export function advanceToNextSeason(save: CareerSave): CareerSave {
  const nextSeason = save.season + 1;
  const nextClubs = { ...save.clubs };
  const nextPlayers = { ...save.players };
  const nextLeagues = { ...save.leagues };
  const nextNews = [...save.news];

  // Determine League Champions & Awards
  const userClub = nextClubs[save.userClubId];
  const userLeague = nextLeagues[userClub.leagueId];
  const userSorted = sortStandings(userLeague.standings);
  const leagueChampId = userSorted[0]?.clubId;

  // Top scorer & MVP in user league
  const leaguePlayers = Object.values(nextPlayers).filter((p) => nextClubs[p.clubId]?.leagueId === userLeague.id);
  const goldenBoot = [...leaguePlayers].sort((a, b) => b.seasonStats.goals - a.seasonStats.goals)[0];
  const ballonDor = Object.values(nextPlayers).sort(
    (a, b) => b.overall * 0.6 + b.seasonStats.averageRating * 6 + b.seasonStats.goals * 0.8 - (a.overall * 0.6 + a.seasonStats.averageRating * 6 + a.seasonStats.goals * 0.8)
  )[0];

  if (leagueChampId) {
    nextNews.unshift({
      id: `news_champ_${nextSeason}`,
      week: 1,
      season: nextSeason,
      category: 'AWARD',
      headline: `${nextClubs[leagueChampId].name} crowned ${userLeague.name} Champions!`,
      body: `Golden Boot: ${goldenBoot?.name} (${goldenBoot?.seasonStats.goals} goals). World Player of the Year: ${ballonDor?.name}.`,
    });
  }

  let nextManager = save.manager ? { ...save.manager } : undefined;
  let nextLegend = save.legend ? { ...save.legend } : undefined;

  if (nextManager && leagueChampId === save.userClubId) {
    nextManager.trophies.push(`Season ${save.season} ${userLeague.name}`);
  }
  if (nextLegend) {
    const uP = nextPlayers[nextLegend.playerId];
    if (leagueChampId === save.userClubId) {
      nextLegend.trophies.push(`Season ${save.season} ${userLeague.name}`);
    }
    if (goldenBoot?.id === nextLegend.playerId) {
      nextLegend.individualAwards.push({ season: save.season, award: 'League Golden Boot' });
    }
    if (ballonDor?.id === nextLegend.playerId) {
      nextLegend.individualAwards.push({ season: save.season, award: 'Dynasty Ballon d\'Or' });
    }
    if (uP && uP.age >= 35) {
      // Optional auto-note near retirement age
      nextNews.unshift({
        id: `news_vet_${nextSeason}`,
        week: 1,
        season: nextSeason,
        category: 'AWARD',
        headline: `Veteran Icon: ${uP.name} enters Season ${nextSeason} at age ${uP.age + 1}`,
        body: 'You can continue playing or announce your retirement from the Career History panel anytime.',
      });
    }
  }

  // Archive career history, age players, reset season stats
  Object.keys(nextPlayers).forEach((pid) => {
    const p = nextPlayers[pid];
    const c = nextClubs[p.clubId];
    const l = c ? nextLeagues[c.leagueId] : undefined;
    const histEntry: CareerHistoryEntry | null =
      p.seasonStats.appearances > 0 && c
        ? {
            season: save.season,
            clubId: c.id,
            clubName: c.name,
            leagueName: l?.name ?? 'League',
            appearances: p.seasonStats.appearances,
            goals: p.seasonStats.goals,
            assists: p.seasonStats.assists,
            averageRating: p.seasonStats.averageRating,
            trophies: c.id === leagueChampId ? [userLeague.name] : [],
          }
        : null;

    const newAge = p.age + 1;
    const attrs = { ...p.attributes };
    if (newAge <= 23 && p.overall < p.potential) {
      attrs.speed = Math.min(97, attrs.speed + 1);
      attrs.ballControl = Math.min(97, attrs.ballControl + 1);
      attrs.reactions = Math.min(97, attrs.reactions + 1);
    } else if (newAge >= 32) {
      attrs.speed = Math.max(40, attrs.speed - 2);
      attrs.stamina = Math.max(42, attrs.stamina - 2);
    }
    const nextOvr = calculateOverall(p.position, attrs);
    nextPlayers[pid] = {
      ...p,
      age: newAge,
      attributes: attrs,
      overall: nextOvr,
      contractYears: Math.max(1, p.contractYears - 1),
      marketValue: calculateMarketValue(nextOvr, newAge, p.potential),
      fitness: 95,
      injuredWeeks: 0,
      suspendedMatches: 0,
      seasonStats: {
        appearances: 0,
        starts: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        yellowCards: 0,
        redCards: 0,
        averageRating: 0,
        ratingCount: 0,
        motm: 0,
      },
      careerHistory: histEntry ? [...p.careerHistory, histEntry] : p.careerHistory,
    };
  });

  // Reset all league standings & fixtures
  Object.keys(nextLeagues).forEach((lid) => {
    const l = nextLeagues[lid];
    nextLeagues[lid] = {
      ...l,
      standings: l.clubIds.map((id) => ({
        clubId: id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      })),
      fixtures: generateRoundRobinFixtures(l.id, l.name, l.clubIds),
    };
  });

  // Add annual sponsor income to clubs
  Object.keys(nextClubs).forEach((cid) => {
    const c = nextClubs[cid];
    nextClubs[cid] = {
      ...c,
      finances: {
        ...c.finances,
        transferBudget: c.finances.transferBudget + Math.round(c.finances.sponsorAnnualIncome * 0.4),
        cashBalance: c.finances.cashBalance + c.finances.sponsorAnnualIncome,
      },
    };
  });

  const { cupFixtures, continentalFixtures } = buildSeasonCupAndContinental(
    nextClubs,
    nextLeagues,
    userClub.leagueId
  );

  const userNatId = nextManager?.nationalTeamId ?? nextLegend?.nationalTeamId;
  const internationalTournament = createInternationalTournament(nextSeason, save.nationalTeams, userNatId);

  return {
    ...save,
    season: nextSeason,
    currentWeek: 1,
    transferWindowOpen: true,
    clubs: nextClubs,
    players: nextPlayers,
    leagues: nextLeagues,
    cupFixtures,
    continentalFixtures,
    internationalTournament,
    manager: nextManager,
    legend: nextLegend,
    weekTrained: false,
    news: nextNews.slice(0, 35),
  };
}
