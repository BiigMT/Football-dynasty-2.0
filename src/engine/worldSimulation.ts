import { CareerSave, Club, WorldManagerState } from '../types/football';

const FIRST_NAMES = [
  'Daniel', 'Samuel', 'Michael', 'Patrick', 'Thomas', 'David', 'Joseph', 'Victor',
  'André', 'Marco', 'Luis', 'Rafael', 'Moussa', 'Kofi', 'Emmanuel', 'Peter',
  'James', 'Oliver', 'Carlos', 'Ibrahim', 'Kwame', 'Jean', 'Abdul', 'Felix',
];
const LAST_NAMES = [
  'Banda', 'Moyo', 'Tembo', 'Phiri', 'Dlamini', 'Mensah', 'Diallo', 'Silva',
  'Costa', 'Martin', 'Okafor', 'Kamara', 'Ndlovu', 'Mendes', 'Santos', 'Mwamba',
  'Nielsen', 'Petrov', 'Garcia', 'Boateng', 'Traoré', 'Mthembu', 'Chanda', 'Müller',
];
const PHILOSOPHIES: WorldManagerState['philosophy'][] = [
  'Possession', 'Gegenpress', 'Counter-Attack', 'Balanced',
];

function managerName(seed: number): string {
  return FIRST_NAMES[seed % FIRST_NAMES.length] + ' ' + LAST_NAMES[(seed * 7 + 3) % LAST_NAMES.length];
}

function philosophyForClub(club: Club): WorldManagerState['philosophy'] {
  if (club.tactics.pressing === 'GEGENPRESS') return 'Gegenpress';
  if (club.tactics.passing === 'SHORT_TIKI_TAKA') return 'Possession';
  if (club.tactics.passing === 'DIRECT_LONG') return 'Counter-Attack';
  return 'Balanced';
}

/** Creates persistent AI manager identities for every club in a new career. */
export function initializeWorldManagers(clubs: Record<string, Club>): Record<string, WorldManagerState> {
  return Object.values(clubs).reduce<Record<string, WorldManagerState>>((records, club, index) => {
    records[club.id] = {
      managerId: 'manager_' + club.id,
      name: managerName(index + club.name.length),
      age: 34 + ((index * 3) % 25),
      philosophy: philosophyForClub(club),
      reputation: Math.max(35, Math.min(92, club.reputation + ((index % 9) - 4))),
      boardConfidence: 62 + (index % 24),
      weeksInCharge: 1,
      appointments: 1,
      lastChangeWeek: 1,
    };
    return records;
  }, {});
}

function rankedPosition(save: CareerSave, club: Club): { position: number; played: number } {
  const league = save.leagues[club.leagueId];
  if (!league) return { position: 1, played: 0 };
  const rows = [...league.standings].sort((a, b) =>
    b.points - a.points ||
    (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
    b.goalsFor - a.goalsFor
  );
  const index = rows.findIndex((row) => row.clubId === club.id);
  return {
    position: index < 0 ? 1 : index + 1,
    played: league.standings.find((row) => row.clubId === club.id)?.played ?? 0,
  };
}

function applyManagerTactics(club: Club, philosophy: WorldManagerState['philosophy']): Club {
  const tactics = { ...club.tactics };
  if (philosophy === 'Possession') {
    tactics.passing = 'SHORT_TIKI_TAKA';
    tactics.pressing = 'MID_PRESS';
    tactics.tempo = Math.max(48, Math.min(78, tactics.tempo));
  } else if (philosophy === 'Gegenpress') {
    tactics.pressing = 'GEGENPRESS';
    tactics.tempo = Math.max(68, tactics.tempo);
  } else if (philosophy === 'Counter-Attack') {
    tactics.passing = 'DIRECT_LONG';
    tactics.pressing = 'LOW_BLOCK';
    tactics.tempo = Math.max(62, tactics.tempo);
  } else {
    tactics.passing = 'MIXED';
    tactics.pressing = 'MID_PRESS';
  }
  return { ...club, tactics };
}

/**
 * Weekly AI manager market simulation. A club's form, league position and finances
 * influence board confidence; a managerial change also changes the club's tactics.
 */
export function simulateWorldManagers(save: CareerSave, week: number): CareerSave {
  const managers = { ...(save.worldManagers ?? initializeWorldManagers(save.clubs)) };
  const clubs = { ...save.clubs };
  const headlines: CareerSave['news'] = [];

  Object.values(clubs).forEach((club, index) => {
    if (club.id === save.userClubId && save.mode === 'MANAGER') return;
    const current = managers[club.id];
    if (!current) return;

    const table = rankedPosition(save, club);
    const totalTeams = save.leagues[club.leagueId]?.clubIds.length ?? 20;
    const target = Math.max(1, Math.min(totalTeams, club.targetPosition || Math.ceil(totalTeams / 2)));
    const underPressure = table.played >= 6 && table.position >= Math.min(totalTeams, target + 4);
    const overperforming = table.played >= 6 && table.position <= Math.max(1, target - 2);
    const cash = club.finances.cashBalance;
    const confidenceDelta = table.played < 4 ? 0 : overperforming ? 2 : underPressure ? -3 : 0;
    const confidence = Math.max(0, Math.min(100,
      current.boardConfidence + confidenceDelta + (cash > 0 ? 0 : -1)
    ));
    const weeksInCharge = current.weeksInCharge + 1;
    const shouldDismiss = weeksInCharge >= 8 && confidence <= 22;
    const pressureDismissal = weeksInCharge >= 14 && confidence <= 34 && underPressure && Math.random() < 0.045;

    if (shouldDismiss || pressureDismissal) {
      const philosophy = PHILOSOPHIES[(index + week + current.appointments) % PHILOSOPHIES.length];
      const replacement: WorldManagerState = {
        managerId: 'manager_' + club.id + '_' + week + '_' + current.appointments,
        name: managerName(index + week * 3 + current.appointments * 5),
        age: 33 + ((index + week) % 27),
        philosophy,
        reputation: Math.max(38, Math.min(88, club.reputation + ((index % 11) - 5))),
        boardConfidence: 68,
        weeksInCharge: 0,
        appointments: current.appointments + 1,
        lastChangeWeek: week,
      };
      managers[club.id] = replacement;
      clubs[club.id] = applyManagerTactics(club, philosophy);
      headlines.push({
        id: 'world_manager_' + club.id + '_' + week,
        week,
        season: save.season,
        category: 'BOARD',
        headline: club.name + ' appoint ' + replacement.name,
        body: 'After a difficult run of results, the board has dismissed ' + current.name +
          ' and appointed ' + replacement.name + '. The new manager favours ' + philosophy + '.',
      });
    } else {
      managers[club.id] = {
        ...current,
        boardConfidence: confidence,
        weeksInCharge,
      };
    }
  });

  return {
    ...save,
    clubs,
    worldManagers: managers,
    news: [...headlines.slice(0, 3), ...save.news].slice(0, 35),
  };
}
