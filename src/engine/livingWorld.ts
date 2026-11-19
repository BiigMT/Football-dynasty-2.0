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

  const worldState: LivingWorldState = {
    managersByClub,
    history: [...initialState.history, ...history].slice(-500),
    lastProcessedSeason: save.season,
    lastProcessedWeek: nextWeek,
  };

  return {
    ...save,
    clubs,
    worldState,
    news: [...generatedNews.reverse(), ...save.news]
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 35),
  };
}
