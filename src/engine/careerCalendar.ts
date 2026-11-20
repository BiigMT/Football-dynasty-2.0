import type { CareerSave, Fixture } from '../types/football';

export type CareerCalendarEventType = 'MATCH' | 'TRAINING' | 'RECOVERY' | 'BRIEFING' | 'TRANSFER' | 'INTERNATIONAL';

export interface CareerCalendarEvent {
  id: string;
  date: string;
  week: number;
  type: CareerCalendarEventType;
  title: string;
  detail: string;
  fixture?: Fixture;
}

const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

export function getSeasonStartDate(season: number): Date {
  const start = new Date(Date.UTC(2026 + Math.max(0, season - 1), 6, 1));
  while (start.getUTCDay() !== 1) start.setUTCDate(start.getUTCDate() + 1);
  return start;
}

export function getCareerWeekDate(season: number, week: number, dayOffset = 0): Date {
  const date = getSeasonStartDate(season);
  date.setUTCDate(date.getUTCDate() + (Math.max(1, week) - 1) * 7 + dayOffset);
  return date;
}

function fixtureDayOffset(fixture: Fixture): number {
  if (fixture.competitionType === 'DOMESTIC_CUP') return 2;
  if (fixture.competitionType === 'CONTINENTAL') return 3;
  if (fixture.competitionType === 'INTERNATIONAL') return 6;
  return 5;
}

export function getCareerCalendarEvents(save: CareerSave): CareerCalendarEvent[] {
  const club = save.clubs[save.userClubId];
  const nationalTeamId = save.manager?.nationalTeamId ??
    (save.legend?.internationalCallUp ? save.legend.nationalTeamId : undefined);
  const fixtures: Fixture[] = [
    ...Object.values(save.leagues).flatMap((league) => league.fixtures),
    ...save.cupFixtures,
    ...save.continentalFixtures,
    ...(save.internationalTournament?.fixtures ?? []),
  ];
  const relevant = fixtures.filter((fixture) => {
    const isClubFixture = fixture.homeClubId === save.userClubId || fixture.awayClubId === save.userClubId;
    const isInternationalFixture = Boolean(nationalTeamId) &&
      (fixture.homeClubId === nationalTeamId || fixture.awayClubId === nationalTeamId);
    return isClubFixture || isInternationalFixture;
  });
  const maxFixtureWeek = Math.max(38, ...relevant.map((fixture) => fixture.week), save.currentWeek);
  const events: CareerCalendarEvent[] = [];

  for (let week = 1; week <= Math.min(52, maxFixtureWeek); week += 1) {
    const trainingDate = dateKey(getCareerWeekDate(save.season, week, 1));
    const recoveryDate = dateKey(getCareerWeekDate(save.season, week, 2));
    const briefingDate = dateKey(getCareerWeekDate(save.season, week, 4));
    events.push(
      { id: `training_s${save.season}_w${week}`, date: trainingDate, week, type: 'TRAINING', title: 'Team training', detail: 'Weekly training session and individual development' },
      { id: `recovery_s${save.season}_w${week}`, date: recoveryDate, week, type: 'RECOVERY', title: 'Recovery & analysis', detail: 'Fitness recovery, medical checks and performance review' },
      { id: `briefing_s${save.season}_w${week}`, date: briefingDate, week, type: 'BRIEFING', title: 'Squad briefing', detail: 'Tactical preparation and matchday planning' },
    );
  }

  relevant.forEach((fixture) => {
    const date = dateKey(getCareerWeekDate(save.season, fixture.week, fixtureDayOffset(fixture)));
    const home = fixture.homeClubId === save.userClubId || fixture.homeClubId === nationalTeamId;
    const opponentId = home ? fixture.awayClubId : fixture.homeClubId;
    const opponent = save.clubs[opponentId] ?? save.nationalTeams[opponentId];
    const opponentName = opponent?.name ?? 'Opponent';
    const result = fixture.played ? ` · ${fixture.homeGoals}-${fixture.awayGoals}` : '';
    const type: CareerCalendarEventType = fixture.competitionType === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'MATCH';
    events.push({
      id: fixture.id,
      date,
      week: fixture.week,
      type,
      title: fixture.played ? `${fixture.competitionName}: ${home ? 'vs' : '@'} ${opponentName}` : `${fixture.competitionName}: ${home ? 'vs' : '@'} ${opponentName}`,
      detail: `${home ? 'HOME' : 'AWAY'} · ${fixture.played ? 'FULL TIME' + result : '15:00 KO'}`,
      fixture,
    });
  });

  const transferMilestones = [
    { week: 1, title: 'Summer transfer window opens' },
    { week: 4, title: 'Summer transfer deadline' },
    { week: 9, title: 'Winter transfer window opens' },
    { week: 11, title: 'Winter transfer deadline' },
  ];
  transferMilestones.forEach(({ week, title }) => {
    events.push({
      id: `transfer_s${save.season}_w${week}`,
      date: dateKey(getCareerWeekDate(save.season, week, 0)),
      week,
      type: 'TRANSFER',
      title,
      detail: 'Registration window and squad planning milestone',
    });
  });

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
}

export function getCalendarDateForWeek(save: CareerSave, week: number): string {
  return dateKey(getCareerWeekDate(save.season, week, 0));
}
