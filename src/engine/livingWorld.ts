import type {
  CareerSave,
  Club,
  League,
  LivingWorldState,
  ManagerPhilosophy,
  WorldEvent,
  WorldManagerProfile,
} from '../types/football';

const FIRST_NAMES = [
  'Daniel', 'Michael', 'Samuel', 'David', 'Joseph', 'Patrick', 'André', 'Marco',
  'Thomas', 'Victor', 'Emmanuel', 'Carlos', 'Ibrahim', 'Kwame', 'Peter', 'Luka',
];
const LAST_NAMES = [
  'Mwamba', 'Banda', 'Tembo', 'Phiri', 'Dlamini', 'Mensah', 'Diallo', 'Okafor',
  'Silva', 'Costa', 'Novak', 'Müller', 'Petrov', 'Fernandes', 'Kamara', 'Ndlovu',
];

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function managerPhilosophy(club: Club): ManagerPhilosophy {
  if (club.tactics.pressing === 'GEGENPRESS') return 'Gegenpress';
  if (club.tactics.passing === 'SHORT_TIKI_TAKA') return 'Possession';
  if (club.tactics.mentality === 'DEFENSIVE' || club.tactics.pressing === 'LOW_BLOCK') return 'Counter-Attack';
  return 'Balanced';
}

function createManager(
  club: Club,
  season: number,
  week: number,
  serial: number,
  previousName?: string,
): WorldManagerProfile {
  const seed = stableHash(`${club.id}:${season}:${week}:${serial}`);
  let firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
  let lastName = LAST_NAMES[Math.floor(seed / 17) % LAST_NAMES.length];
  let name = `${firstName} ${lastName}`;
  if (name === previousName) {
    firstName = FIRST_NAMES[(seed + 3) % FIRST_NAMES.length];
    lastName = LAST_NAMES[(Math.floor(seed / 17) + 5) % LAST_NAMES.length];
    name = `${firstName} ${lastName}`;
  }

  return {
    id: `${club.id}_manager_${season}_${week}_${serial}`,
    name,
    nationality: club.country === 'Pan-Africa' ? 'Zambia' : club.country,
    age: 38 + (seed % 21),
    reputation: clamp(club.reputation + ((seed % 13) - 6), 25, 95),
    philosophy: managerPhilosophy(club),
    clubId: club.id,
    confidence: clamp(66 + Math.round(club.reputation * 0.12), 65, 84),
    weeksAtClub: serial === 0 ? 12 + (seed % 60) : 0,
    wins: 0,
    draws: 0,
    losses: 0,
    lastPlayed: 0,
    lastPoints: 0,
  };
}

function orderedStandings(league: League) {
  return [...league.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const goalDifference = (row: typeof a) => row.goalsFor - row.goalsAgainst;
    if (goalDifference(b) !== goalDifference(a)) return goalDifference(b) - goalDifference(a);
    return b.goalsFor - a.goalsFor;
  });
}

export function createInitialLivingWorld(
  clubs: Record<string, Club>,
  leagues: Record<string, League>,
  userManagedClubId: string | undefined,
  season: number,
  currentWeek: number,
): LivingWorldState {
  const managersByClub: Record<string, WorldManagerProfile> = {};
  Object.values(clubs).sort((a, b) => a.id.localeCompare(b.id)).forEach((club) => {
    if (club.id === userManagedClubId) return;
    const manager = createManager(club, season, 0, 0);
    const row = leagues[club.leagueId]?.standings.find((standing) => standing.clubId === club.id);
    manager.lastPlayed = row?.played ?? 0;
    manager.lastPoints = row?.points ?? 0;
    managersByClub[club.id] = manager;
  });

  return {
    managersByClub,
    history: [],
    lastProcessedSeason: season,
    lastProcessedWeek: currentWeek,
  };
}

function applyManagerTactics(club: Club, philosophy: ManagerPhilosophy): Club {
  const tacticalIdentity = {
    Possession: { pressing: 'MID_PRESS' as const, passing: 'SHORT_TIKI_TAKA' as const, mentality: 'BALANCED' as const, tempo: 64 },
    Gegenpress: { pressing: 'GEGENPRESS' as const, passing: 'MIXED' as const, mentality: 'ATTACKING' as const, tempo: 73 },
    'Counter-Attack': { pressing: 'LOW_BLOCK' as const, passing: 'DIRECT_LONG' as const, mentality: 'DEFENSIVE' as const, tempo: 70 },
    Balanced: { pressing: 'MID_PRESS' as const, passing: 'MIXED' as const, mentality: 'BALANCED' as const, tempo: 60 },
  }[philosophy];

  return {
    ...club,
    tactics: {
      ...club.tactics,
      ...tacticalIdentity,
    },
  };
}


function recordWorldEvent(
  events: WorldEvent[],
  news: CareerSave['news'],
  event: WorldEvent,
  category: CareerSave['news'][number]['category'],
): void {
  events.push(event);
  news.push({
    id: event.id,
    week: event.week,
    season: event.season,
    category,
    headline: event.headline,
    body: event.body,
  });
}

function moveSquadPlayer(
  clubs: Record<string, Club>,
  players: CareerSave['players'],
  playerId: string,
  buyerId: string,
  fee: number,
): void {
  const player = players[playerId];
  const seller = clubs[player?.clubId];
  const buyer = clubs[buyerId];
  if (!player || !seller || !buyer || seller.id === buyer.id) return;
  const nextSeller = {
    ...seller,
    tactics: {
      ...seller.tactics,
      startingXI: seller.tactics.startingXI.filter((id) => id !== playerId),
      bench: seller.tactics.bench.filter((id) => id !== playerId),
    },
    finances: {
      ...seller.finances,
      transferBudget: seller.finances.transferBudget + fee,
      cashBalance: seller.finances.cashBalance + fee,
      weeklyWageBill: Math.max(0, seller.finances.weeklyWageBill - player.weeklyWage),
    },
  };
  const nextBuyer = {
    ...buyer,
    tactics: {
      ...buyer.tactics,
      bench: buyer.tactics.bench.includes(playerId) ? buyer.tactics.bench : [...buyer.tactics.bench, playerId].slice(0, 7),
    },
    finances: {
      ...buyer.finances,
      transferBudget: Math.max(0, buyer.finances.transferBudget - fee),
      cashBalance: buyer.finances.cashBalance - fee,
      weeklyWageBill: buyer.finances.weeklyWageBill + player.weeklyWage,
    },
  };
  if (nextSeller.tactics.startingXI.length < 11) {
    const replacementId = nextSeller.tactics.bench[0] || Object.values(players).find((p) => p.clubId === seller.id && p.id !== playerId)?.id;
    if (replacementId) {
      nextSeller.tactics.startingXI.push(replacementId);
      nextSeller.tactics.bench = nextSeller.tactics.bench.filter((id) => id !== replacementId);
    }
  }
  clubs[seller.id] = nextSeller;
  clubs[buyer.id] = nextBuyer;
  players[playerId] = { ...player, clubId: buyerId, morale: clamp(player.morale + 8, 1, 100), transferRequestPending: false };
}

function processAITransferMarket(
  save: CareerSave,
  clubs: Record<string, Club>,
  players: CareerSave['players'],
  managersByClub: Record<string, WorldManagerProfile>,
  events: WorldEvent[],
  news: CareerSave['news'],
  week: number,
): void {
  // AI clubs only act at the opening and deadline weeks of the two transfer windows.
  if (![1, 4, 11].includes(week)) return;
  const buyers = Object.values(clubs)
    .filter((club) => !(save.mode === 'MANAGER' && club.id === save.userClubId))
    .sort((a, b) => a.id.localeCompare(b.id));
  for (const buyer of buyers) {
    const buyerSquad = Object.values(players).filter((player) => player.clubId === buyer.id);
    if (buyerSquad.length >= 28 || buyer.finances.transferBudget < 250000) continue;
    const counts = new Map<string, number>();
    buyerSquad.forEach((player) => counts.set(player.position, (counts.get(player.position) ?? 0) + 1));
    const neededPosition = (['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'] as const)
      .sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0))[0];
    const target = Object.values(players)
      .filter((player) => player.clubId !== buyer.id && player.clubId !== 'free_agent')
      .filter((player) => player.position === neededPosition && player.age <= 29 && player.overall >= 58)
      .filter((player) => {
        const seller = clubs[player.clubId];
        if (!seller || (save.mode === 'MANAGER' && seller.id === save.userClubId)) return false;
        const sellerSquad = Object.values(players).filter((p) => p.clubId === seller.id);
        return sellerSquad.length > 20 || player.transferRequestPending === true;
      })
      .filter((player) => player.marketValue <= buyer.finances.transferBudget * 0.42)
      .sort((a, b) => Number(b.transferRequestPending) - Number(a.transferRequestPending) || b.overall - a.overall || a.id.localeCompare(b.id))[0];
    if (!target) continue;
    const seller = clubs[target.clubId];
    if (!seller) continue;
    const fee = Math.min(buyer.finances.transferBudget, Math.max(100000, Math.round(target.marketValue * (target.transferRequestPending ? 0.82 : 1.08))));
    moveSquadPlayer(clubs, players, target.id, buyer.id, fee);
    const event: WorldEvent = {
      id: `world_${save.season}_${week}_transfer_${target.id}_${buyer.id}`,
      season: save.season, week, type: 'AI_TRANSFER', clubId: buyer.id,
      managerId: managersByClub[buyer.id]?.id ?? '', playerId: target.id, relatedClubId: seller.id,
      headline: `${buyer.name} sign ${target.name} from ${seller.name}`,
      body: `The deal is worth €${(fee / 1000000).toFixed(2)}M as ${buyer.name} strengthen their squad ahead of the next run of fixtures.`,
    };
    recordWorldEvent(events, news, event, 'TRANSFER');
    break; // Keep the transfer market active without flooding a single matchweek.
  }
}

function processPlayerMorale(
  save: CareerSave,
  players: CareerSave['players'],
  events: WorldEvent[],
  news: CareerSave['news'],
  week: number,
): void {
  if (week % 4 !== 0) return;
  Object.values(players).forEach((player) => {
    if (player.clubId === 'free_agent' || player.id === save.legend?.playerId) return;
    const appearances = player.seasonStats.appearances;
    const expectedStarts = Math.max(1, Math.floor(week * 0.42));
    const role = player.squadRole ?? 'ROTATION';
    const expected = role === 'CRUCIAL' || role === 'IMPORTANT' ? expectedStarts : role === 'PROSPECT' ? 1 : Math.ceil(expectedStarts * 0.45);
    const delta = appearances < expected - 2 ? -3 : appearances >= expected ? 2 : -1;
    const morale = clamp(player.morale + delta, 1, 100);
    const unrest = morale <= 24 && !player.transferRequestPending;
    players[player.id] = { ...player, morale, transferRequestPending: unrest ? true : player.transferRequestPending };
    if (unrest) {
      const event: WorldEvent = {
        id: `world_${save.season}_${week}_unrest_${player.id}`,
        season: save.season, week, type: 'PLAYER_UNREST', clubId: player.clubId,
        managerId: '', playerId: player.id,
        headline: `${player.name} unhappy with their role at ${save.clubs[player.clubId]?.name ?? 'the club'}`,
        body: `Limited first-team opportunities have affected the player's morale. The player has asked the club to consider a move.`,
      };
      recordWorldEvent(events, news, event, 'TRANSFER');
    }
  });
}

function processClubFinances(
  save: CareerSave,
  clubs: Record<string, Club>,
  managersByClub: Record<string, WorldManagerProfile>,
  events: WorldEvent[],
  news: CareerSave['news'],
  week: number,
): void {
  Object.values(clubs).forEach((club) => {
    const weeklyIncome = club.finances.sponsorAnnualIncome / 52 + club.finances.matchdayIncomePerHomeGame * 0.35;
    const weeklyOperatingCost = club.finances.weeklyWageBill * 0.9;
    const cashBalance = club.finances.cashBalance + weeklyIncome - weeklyOperatingCost;
    const underPressure = cashBalance < 0 || club.finances.weeklyWageBill > club.finances.wageBudgetWeekly * 1.15;
    clubs[club.id] = {
      ...club,
      finances: {
        ...club.finances,
        cashBalance,
        transferBudget: underPressure ? Math.max(0, Math.min(club.finances.transferBudget, Math.max(0, cashBalance * 0.12))) : club.finances.transferBudget,
      },
    };
    const manager = managersByClub[club.id];
    if (manager && underPressure) {
      managersByClub[club.id] = { ...manager, confidence: clamp(manager.confidence - 1, 0, 100) };
      if (week % 4 === 0) {
        const event: WorldEvent = {
          id: `world_${save.season}_${week}_finance_${club.id}`,
          season: save.season, week, type: 'FINANCIAL_PRESSURE', clubId: club.id,
          managerId: manager.id,
          headline: `${club.name} board reviews spending amid financial pressure`,
          body: `Rising wage commitments and operating costs have forced the board to review the club's transfer budget.`,
        };
        recordWorldEvent(events, news, event, 'BOARD');
      }
    }
  });
}

function processManagerMarket(
  save: CareerSave,
  clubs: Record<string, Club>,
  managersByClub: Record<string, WorldManagerProfile>,
  events: WorldEvent[],
  news: CareerSave['news'],
  week: number,
): void {
  if (week % 6 !== 0) return;
  const candidates = Object.values(managersByClub)
    .filter((manager) => manager.confidence >= 82 && !(save.mode === 'MANAGER' && manager.clubId === save.userClubId))
    .sort((a, b) => b.reputation - a.reputation || a.id.localeCompare(b.id));
  for (const candidate of candidates) {
    const source = clubs[candidate.clubId];
    if (!source) continue;
    const destination = Object.values(clubs)
      .filter((club) => club.id !== source.id && !(save.mode === 'MANAGER' && club.id === save.userClubId))
      .filter((club) => club.reputation >= source.reputation + 12)
      .filter((club) => (managersByClub[club.id]?.confidence ?? 100) <= 32)
      .sort((a, b) => b.reputation - a.reputation || a.id.localeCompare(b.id))[0];
    if (!destination) continue;
    const outgoing = managersByClub[destination.id];
    if (!outgoing) continue;
    managersByClub[destination.id] = { ...candidate, clubId: destination.id, confidence: 68, weeksAtClub: 0, lastPlayed: 0, lastPoints: 0 };
    const replacement = createManager(source, save.season, week, candidate.weeksAtClub + 1, candidate.name);
    const sourceRow = save.leagues[source.leagueId]?.standings.find((row) => row.clubId === source.id);
    replacement.lastPlayed = sourceRow?.played ?? 0;
    replacement.lastPoints = sourceRow?.points ?? 0;
    managersByClub[source.id] = replacement;
    const event: WorldEvent = {
      id: `world_${save.season}_${week}_manager_move_${candidate.id}`,
      season: save.season, week, type: 'MANAGER_MOVED', clubId: destination.id,
      managerId: candidate.id, relatedClubId: source.id,
      headline: `${candidate.name} leaves ${source.name} for ${destination.name}`,
      body: `The ambitious appointment sees ${candidate.name} take charge at ${destination.name}; ${source.name} have moved quickly to appoint ${replacement.name}.`,
    };
    recordWorldEvent(events, news, event, 'BOARD');
    clubs[destination.id] = applyManagerTactics(destination, candidate.philosophy);
    clubs[source.id] = applyManagerTactics(source, replacement.philosophy);
    break;
  }
}

export function advanceLivingWorld(save: CareerSave, nextWeek: number): CareerSave {
  const isManagerCareer = save.mode === 'MANAGER';
  const initialState = save.worldState ?? createInitialLivingWorld(
    save.clubs,
    save.leagues,
    isManagerCareer ? save.userClubId : undefined,
    save.season,
    save.currentWeek,
  );

  // The week guard makes retries safe: the same world week cannot trigger two sackings.
  if (
    initialState.lastProcessedSeason === save.season
    && initialState.lastProcessedWeek >= nextWeek
  ) {
    return save;
  }

  const managersByClub = { ...initialState.managersByClub };
  const clubs = { ...save.clubs };
  const history: WorldEvent[] = [];
  const generatedNews: CareerSave['news'] = [];

  Object.values(clubs).sort((a, b) => a.id.localeCompare(b.id)).forEach((club) => {
    if (isManagerCareer && club.id === save.userClubId) {
      delete managersByClub[club.id];
      return;
    }

    const league = save.leagues[club.leagueId];
    const row = league?.standings.find((standing) => standing.clubId === club.id);
    if (!row || !league) return;

    let manager = managersByClub[club.id];
    if (!manager) {
      manager = createManager(club, save.season, 0, 0);
      manager.lastPlayed = row.played;
      manager.lastPoints = row.points;
      managersByClub[club.id] = manager;
      return;
    }

    const position = orderedStandings(league).findIndex((standing) => standing.clubId === club.id) + 1;
    const playedDelta = Math.max(0, row.played - manager.lastPlayed);
    const pointsDelta = Math.max(0, row.points - manager.lastPoints);
    let confidence = manager.confidence;
    let wins = manager.wins;
    let draws = manager.draws;
    let losses = manager.losses;

    if (playedDelta > 0) {
      if (pointsDelta >= 3) wins += 1;
      else if (pointsDelta === 1) draws += 1;
      else losses += 1;

      const target = Math.max(1, club.targetPosition || 1);
      if (position <= target) confidence += 2;
      else if (position <= target + 2) confidence += 0;
      else if (position <= target + 5) confidence -= 2;
      else confidence -= 3;

      if (pointsDelta === 0) confidence -= 1;
    }

    confidence = clamp(confidence, 0, 100);
    manager = {
      ...manager,
      confidence,
      wins,
      draws,
      losses,
      weeksAtClub: manager.weeksAtClub + 1,
      lastPlayed: row.played,
      lastPoints: row.points,
    };

    const canBeDismissed = row.played >= 6 && manager.weeksAtClub >= 6;
    const poorPerformance = confidence <= 18;
    if (canBeDismissed && poorPerformance) {
      const dismissed: WorldEvent = {
        id: `world_${save.season}_${nextWeek}_${club.id}_dismissed`,
        season: save.season,
        week: nextWeek,
        type: 'MANAGER_DISMISSED',
        clubId: club.id,
        managerId: manager.id,
        headline: `${manager.name} dismissed by ${club.name}`,
        body: `The board has ended the manager's tenure after a difficult run. The club will appoint a replacement immediately.`,
      };
      history.push(dismissed);
      generatedNews.push({
        id: dismissed.id,
        week: nextWeek,
        season: save.season,
        category: 'BOARD',
        headline: dismissed.headline,
        body: dismissed.body,
      });

      const replacement = createManager(club, save.season, nextWeek, manager.weeksAtClub + 1, manager.name);
      replacement.lastPlayed = row.played;
      replacement.lastPoints = row.points;
      managersByClub[club.id] = replacement;
      clubs[club.id] = applyManagerTactics(club, replacement.philosophy);

      const appointed: WorldEvent = {
        id: `world_${save.season}_${nextWeek}_${club.id}_appointed`,
        season: save.season,
        week: nextWeek,
        type: 'MANAGER_APPOINTED',
        clubId: club.id,
        managerId: replacement.id,
        headline: `${replacement.name} appointed at ${club.name}`,
        body: `The new head coach arrives with a ${replacement.philosophy.toLowerCase()} philosophy and a mandate to improve results.`,
      };
      history.push(appointed);
      generatedNews.push({
        id: appointed.id,
        week: nextWeek,
        season: save.season,
        category: 'BOARD',
        headline: appointed.headline,
        body: appointed.body,
      });
      return;
    }

    managersByClub[club.id] = manager;
    if (playedDelta > 0 && confidence <= 32 && nextWeek % 4 === 0) {
      const warning: WorldEvent = {
        id: `world_${save.season}_${nextWeek}_${club.id}_warning`,
        season: save.season,
        week: nextWeek,
        type: 'BOARD_WARNING',
        clubId: club.id,
        managerId: manager.id,
        headline: `${club.name} board warns manager over poor results`,
        body: `Board confidence has fallen to ${confidence}%. The next run of fixtures could determine the manager's future.`,
      };
      history.push(warning);
      generatedNews.push({
        id: warning.id,
        week: nextWeek,
        season: save.season,
        category: 'BOARD',
        headline: warning.headline,
        body: warning.body,
      });
    }
  });

  // World simulation layers: AI recruitment, player morale, club finances and manager movement.
  const players = { ...save.players };
  processAITransferMarket(save, clubs, players, managersByClub, history, generatedNews, nextWeek);
  processPlayerMorale(save, players, history, generatedNews, nextWeek);
  processClubFinances(save, clubs, managersByClub, history, generatedNews, nextWeek);
  processManagerMarket(save, clubs, managersByClub, history, generatedNews, nextWeek);

  // AI transfer market: one deterministic AI-to-AI deal at most per week while the window is open.
  const players = { ...save.players };
  if (save.transferWindowOpen && nextWeek % 2 === 0) {
    const buyers = Object.values(clubs).filter((candidate) =>
      candidate.id !== save.userClubId && candidate.finances.transferBudget > 250_000
    ).sort((a, b) => stableHash(`${a.id}:${save.season}:${nextWeek}`) - stableHash(`${b.id}:${save.season}:${nextWeek}`));
    const sellers = Object.values(players).filter((player) =>
      player.clubId !== save.userClubId && player.clubId !== 'free_agent' &&
      !player.isYouth && player.age <= 32 && player.contractYears > 0
    ).sort((a, b) => (a.morale - b.morale) || (a.overall - b.overall));
    const buyer = buyers.find((candidate) => candidate.finances.transferBudget >= 500_000);
    const target = sellers.find((player) => {
      const owner = clubs[player.clubId];
      return owner && owner.id !== buyer?.id && (player.morale <= 58 || player.overall >= (buyer?.reputation ?? 0) + 8);
    });
    if (buyer && target) {
      const seller = clubs[target.clubId];
      const fee = Math.min(buyer.finances.transferBudget, Math.max(150_000, Math.round(target.marketValue * (target.morale <= 35 ? 0.72 : 0.94))));
      if (seller && buyer.id !== seller.id && fee >= 100_000) {
        players[target.id] = { ...target, clubId: buyer.id, morale: clamp(target.morale + 9, 1, 100), transferRequest: false };
        clubs[buyer.id] = { ...buyer, finances: { ...buyer.finances, transferBudget: buyer.finances.transferBudget - fee, cashBalance: buyer.finances.cashBalance - fee } };
        clubs[seller.id] = { ...seller, finances: { ...seller.finances, transferBudget: seller.finances.transferBudget + Math.round(fee * 0.72), cashBalance: seller.finances.cashBalance + fee } };
        const event: WorldEvent = {
          id: `world_${save.season}_${nextWeek}_ai_transfer_${target.id}`,
          season: save.season, week: nextWeek, type: 'AI_TRANSFER', clubId: buyer.id,
          managerId: managersByClub[buyer.id]?.id ?? 'board',
          headline: `${buyer.name} sign ${target.name} from ${seller.name}`,
          body: `The clubs agreed a €${fee.toLocaleString()} transfer for the ${target.position}. ${buyer.name} strengthen their squad ahead of the next run of fixtures.`,
        };
        history.push(event);
        generatedNews.push({ id: event.id, week: nextWeek, season: save.season, category: 'TRANSFER', headline: event.headline, body: event.body });
      }
    }
  }

  // Playing-time pressure affects morale and can create a persistent transfer request.
  Object.values(players).forEach((player) => {
    if (player.clubId === save.userClubId || player.clubId === 'free_agent' || player.isYouth) return;
    const appearancesExpected = Math.max(1, Math.floor((nextWeek / 38) * 8));
    const played = player.seasonStats.appearances;
    const nextMorale = clamp(player.morale + (played < appearancesExpected ? -2 : played >= appearancesExpected + 2 ? 1 : 0), 1, 100);
    const request = nextMorale <= 24;
    if (request && !player.transferRequest) {
      const event: WorldEvent = {
        id: `world_${save.season}_${nextWeek}_unrest_${player.id}`,
        season: save.season, week: nextWeek, type: 'PLAYER_UNREST', clubId: player.clubId,
        managerId: managersByClub[player.clubId]?.id ?? 'board',
        headline: `${player.name} unhappy with playing time`,
        body: `${player.name} is concerned about their role and is considering a move away unless their situation improves.`,
      };
      history.push(event);
      generatedNews.push({ id: event.id, week: nextWeek, season: save.season, category: 'TRANSFER', headline: event.headline, body: event.body });
    }
    if (nextMorale !== player.morale || request !== Boolean(player.transferRequest)) {
      players[player.id] = { ...player, morale: nextMorale, transferRequest: request };
    }
  });

  // Ambitious AI managers can move between clubs; the outgoing coaches exchange jobs.
  if (nextWeek % 6 === 0) {
    const profiles = Object.values(managersByClub);
    const mover = profiles.find((profile) => {
      const currentClub = clubs[profile.clubId];
      return currentClub && profile.confidence >= 82 && profiles.some((other) => {
        const destination = clubs[other.clubId];
        return other.id !== profile.id && destination && other.confidence <= 40 &&
          destination.reputation >= currentClub.reputation + 15 && destination.id !== save.userClubId;
      });
    });
    if (mover) {
      const currentClub = clubs[mover.clubId];
      const destinationManager = profiles.find((other) => {
        const destination = clubs[other.clubId];
        return other.id !== mover.id && destination && other.confidence <= 40 &&
          destination.reputation >= (currentClub?.reputation ?? 0) + 15 && destination.id !== save.userClubId;
      });
      const destinationClub = destinationManager ? clubs[destinationManager.clubId] : undefined;
      if (currentClub && destinationClub && destinationManager) {
        managersByClub[currentClub.id] = { ...destinationManager, clubId: currentClub.id, confidence: 62, weeksAtClub: 0 };
        managersByClub[destinationClub.id] = { ...mover, clubId: destinationClub.id, confidence: 68, weeksAtClub: 0 };
        clubs[currentClub.id] = applyManagerTactics(currentClub, destinationManager.philosophy);
        clubs[destinationClub.id] = applyManagerTactics(destinationClub, mover.philosophy);
        [currentClub, destinationClub].forEach((team) => {
          const incoming = managersByClub[team.id];
          const event: WorldEvent = {
            id: `world_${save.season}_${nextWeek}_manager_move_${team.id}`,
            season: save.season, week: nextWeek, type: 'MANAGER_MOVED', clubId: team.id, managerId: incoming.id,
            headline: `${incoming.name} takes charge at ${team.name}`,
            body: `A managerial switch reshapes the dugout as ${incoming.name} arrives with a ${incoming.philosophy.toLowerCase()} approach.`,
          };
          history.push(event);
          generatedNews.push({ id: event.id, week: nextWeek, season: save.season, category: 'BOARD', headline: event.headline, body: event.body });
        });
      }
    }
  }

  // Weekly operating costs and matchday revenue create meaningful board/finance pressure.
  Object.values(clubs).forEach((team) => {
    const homeMatch = Object.values(save.leagues).some((competition) =>
      competition.fixtures.some((fixture) => fixture.played && fixture.week === nextWeek && fixture.homeClubId === team.id)
    );
    const revenue = (team.finances.sponsorAnnualIncome / 52) + (homeMatch ? team.finances.matchdayIncomePerHomeGame : 0);
    const cashBalance = team.finances.cashBalance + revenue - team.finances.weeklyWageBill;
    const transferBudget = cashBalance < 0 ? Math.max(0, Math.min(team.finances.transferBudget, Math.round(cashBalance * -0.08))) : team.finances.transferBudget;
    clubs[team.id] = { ...team, finances: { ...team.finances, cashBalance, transferBudget } };
    if (cashBalance < -Math.max(500_000, team.finances.weeklyWageBill * 8) && nextWeek % 4 === 0) {
      const event: WorldEvent = {
        id: `world_${save.season}_${nextWeek}_finance_${team.id}`,
        season: save.season, week: nextWeek, type: 'FINANCIAL_WARNING', clubId: team.id,
        managerId: managersByClub[team.id]?.id ?? 'board',
        headline: `${team.name} face growing financial pressure`,
        body: `Operating costs are outpacing available income. The board may need to reduce spending or sell players.`,
      };
      history.push(event);
      generatedNews.push({ id: event.id, week: nextWeek, season: save.season, category: 'BOARD', headline: event.headline, body: event.body });
    }
  });

  const worldState: LivingWorldState = {
    managersByClub,
    history: [...initialState.history, ...history].slice(-500),
    lastProcessedSeason: save.season,
    lastProcessedWeek: nextWeek,
  };

  return {
    ...save,
    clubs,
    players,
    worldState,
    news: [...generatedNews.reverse(), ...save.news]
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 35),
  };
}
