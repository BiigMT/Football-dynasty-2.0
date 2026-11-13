export type CareerMode = 'MANAGER' | 'PLAYER';
export type GameDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export type Position =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LW'
  | 'RW'
  | 'ST';

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT';

export type PlayingStyle =
  | 'Poacher'
  | 'Deep-Lying Forward'
  | 'Prolific Winger'
  | 'Creative Playmaker'
  | 'Box-to-Box'
  | 'Anchor Man'
  | 'Attacking Full-Back'
  | 'Build-Up Stopper'
  | 'Sweeper Keeper';

export type Formation = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2' | '5-3-2';

export type Mentality = 'DEFENSIVE' | 'BALANCED' | 'ATTACKING' | 'ALL_OUT';
export type PressingStyle = 'LOW_BLOCK' | 'MID_PRESS' | 'GEGENPRESS';
export type PassingStyle = 'SHORT_TIKI_TAKA' | 'MIXED' | 'DIRECT_LONG';

export type Region = 'EUROPE' | 'AFRICA' | 'SOUTH_AMERICA' | 'ASIA' | 'NORTH_AMERICA';

export type WeatherCondition = 'Clear Night' | 'Light Rain' | 'Warm Humid' | 'Breezy';

export interface PlayerAppearance {
  skinTone: string;
  hairStyle: 'SHORT' | 'FADE' | 'CURLY' | 'BRAIDS' | 'BUZZ' | 'SWEEP';
  hairColor: string;
  faceStyle: 'CLASSIC' | 'BEARD' | 'GOATEE' | 'YOUTHFUL';
}

export interface PlayerAttributes {
  speed: number;
  acceleration: number;
  shooting: number;
  finishing: number;
  passing: number;
  vision: number;
  dribbling: number;
  ballControl: number;
  crossing: number;
  tackling: number;
  marking: number;
  strength: number;
  stamina: number;
  jumping: number;
  heading: number;
  positioning: number;
  reactions: number;
  goalkeeping: number;
}

export interface PlayerSeasonStats {
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  averageRating: number;
  ratingCount: number;
  motm: number;
}

export interface CareerHistoryEntry {
  season: number;
  clubId: string;
  clubName: string;
  leagueName: string;
  appearances: number;
  goals: number;
  assists: number;
  averageRating: number;
  trophies: string[];
}

export interface Player {
  id: string;
  name: string;
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
  attributes: PlayerAttributes;
  overall: number;
  potential: number;
  form: number; // 1-100
  sharpness: number; // 1-100
  fitness: number; // 1-100
  morale: number; // 1-100
  confidence: number; // 1-100
  reputation: number; // 1-100
  marketValue: number; // in EUR
  weeklyWage: number; // in EUR
  contractYears: number;
  releaseClause: number;
  clubId: string;
  isYouth?: boolean;
  isUserPlayer?: boolean;
  injuredWeeks: number;
  suspendedMatches: number;
  scouted: boolean;
  seasonStats: PlayerSeasonStats;
  internationalCaps: number;
  internationalGoals: number;
  careerHistory: CareerHistoryEntry[];
}

export interface ClubTactics {
  formation: Formation;
  mentality: Mentality;
  pressing: PressingStyle;
  passing: PassingStyle;
  tempo: number; // 1-100
  startingXI: string[]; // 11 player IDs ordered by formation slots
  bench: string[]; // up to 7 player IDs
  captainId: string;
}

export interface ClubFinances {
  transferBudget: number;
  wageBudgetWeekly: number;
  weeklyWageBill: number;
  cashBalance: number;
  matchdayIncomePerHomeGame: number;
  sponsorAnnualIncome: number;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: Region;
  leagueId: string;
  primaryColor: string;
  secondaryColor: string;
  reputation: number; // 1-100
  stadiumName: string;
  stadiumCapacity: number;
  tactics: ClubTactics;
  finances: ClubFinances;
  chemistry: number; // 1-100
  boardExpectation: string;
  targetPosition: number;
}

export interface LeagueStandingRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Fixture {
  id: string;
  competitionId: string;
  competitionName: string;
  competitionType: 'LEAGUE' | 'DOMESTIC_CUP' | 'CONTINENTAL' | 'INTERNATIONAL';
  round: number;
  week: number;
  homeClubId: string;
  awayClubId: string;
  played: boolean;
  homeGoals: number;
  awayGoals: number;
  leg?: number;
  isKnockout?: boolean;
  winnerId?: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  region: Region;
  tier: number;
  clubIds: string[];
  standings: LeagueStandingRow[];
  fixtures: Fixture[];
}

export interface NationalTeam {
  id: string;
  name: string;
  code: string;
  region: Region;
  primaryColor: string;
  secondaryColor: string;
  rankingPoints: number;
  worldRank: number;
  reputation: number;
  formation: Formation;
  squadPlayerIds: string[];
}

export interface InternationalTournament {
  id: string;
  name: string;
  shortName: string;
  region: Region | 'WORLD';
  season: number;
  stage: 'GROUP' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL' | 'COMPLETED';
  userTeamId?: string;
  fixtures: Fixture[];
  championTeamId?: string;
}

export type MatchEventType =
  | 'KICKOFF'
  | 'GOAL'
  | 'ASSIST'
  | 'SAVE'
  | 'MISS'
  | 'WOODWORK'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'INJURY'
  | 'SUBSTITUTION'
  | 'CORNER'
  | 'OFFSIDE'
  | 'FOUL'
  | 'HALF_TIME'
  | 'FULL_TIME'
  | 'KEY_MOMENT';

export interface MatchEvent {
  id: string;
  minute: number;
  half: 1 | 2;
  type: MatchEventType;
  teamSide: 'HOME' | 'AWAY' | 'NEUTRAL';
  clubId?: string;
  playerId?: string;
  playerName?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  text: string;
}

export interface TeamMatchStats {
  goals: number;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  fouls: number;
  corners: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  xG: number;
}

export interface KeyMomentChoice {
  id: string;
  label: string;
  description: string;
  attributeKey: keyof PlayerAttributes;
  difficulty: number; // 1-100
  successOutcome: 'GOAL' | 'ASSIST' | 'SAVE' | 'TACKLE_WIN' | 'CHANCE_CREATED';
}

export interface KeyMomentPrompt {
  id: string;
  minute: number;
  title: string;
  scenario: string;
  zone: 'BOX' | 'WING' | 'MIDFIELD' | 'DEFENSE' | 'PENALTY';
  choices: KeyMomentChoice[];
}

export interface PlayerMatchState {
  playerId: string;
  clubId: string;
  side: 'HOME' | 'AWAY';
  slotIndex: number;
  onPitch: boolean;
  subbedOff: boolean;
  stamina: number;
  rating: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  tackles: number;
  saves: number;
  yellowCards: number;
  redCard: boolean;
  injured: boolean;
}

export interface MatchObjective {
  id: string;
  label: string;
  target: number;
  current: number;
  type: 'GOAL_OR_ASSIST' | 'RATING' | 'SHOTS_ON_TARGET' | 'PASSES' | 'TACKLES' | 'SAVES' | 'CLEAN_SHEET';
  completed: boolean;
}

export interface MatchSession {
  id: string;
  fixtureId: string;
  competitionName: string;
  competitionType: Fixture['competitionType'];
  homeClubId: string;
  awayClubId: string;
  isInternational: boolean;
  weather: WeatherCondition;
  phase: 'PRE_MATCH' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'FULL_TIME';
  difficulty?: GameDifficulty;
  minute: number;
  addedTimeFirstHalf: number;
  addedTimeSecondHalf: number;
  homeTactics: ClubTactics;
  awayTactics: ClubTactics;
  homeSubsUsed: number;
  awaySubsUsed: number;
  homeStats: TeamMatchStats;
  awayStats: TeamMatchStats;
  playerStates: Record<string, PlayerMatchState>;
  events: MatchEvent[];
  momentum: number; // -100 (away) to +100 (home)
  ballPos: { x: number; y: number }; // 0..100 pitch coords
  teamTalkApplied?: string;
  userClubSide?: 'HOME' | 'AWAY';
  userPlayerId?: string;
  userObjectives: MatchObjective[];
  pendingKeyMoment?: KeyMomentPrompt;
  halfTimeFeedback?: string;
}

export type TransferDealType = 'PERMANENT' | 'LOAN' | 'LOAN_TO_BUY' | 'EXCHANGE';

export interface TransferOffer {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  dealType: TransferDealType;
  fee: number;
  loanFee?: number;
  buyOptionFee?: number;
  exchangePlayerId?: string;
  proposedWage: number;
  contractYears: number;
  signingBonus: number;
  releaseClause: number;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED';
  round: number;
  message: string;
  isIncomingToUser: boolean;
}

export type TrainingFocus =
  | 'BALANCED'
  | 'ATTACKING'
  | 'POSSESSION'
  | 'DEFENDING'
  | 'FITNESS'
  | 'RECOVERY';

export type IndividualDrill =
  | 'FINISHING'
  | 'PACE_AGILITY'
  | 'VISION_PASSING'
  | 'DRIBBLING'
  | 'DEFENSIVE_DUELS'
  | 'STAMINA_STRENGTH'
  | 'GOALKEEPING';

export interface ManagerProfile {
  name: string;
  nationality: string;
  age: number;
  philosophy: 'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced';
  reputation: number;
  boardConfidence: number; // 0-100
  clubId: string;
  nationalTeamId?: string;
  wins: number;
  draws: number;
  losses: number;
  trophies: string[];
  jobOffers: { clubId: string; clubName: string; leagueName: string; wage: number; message: string }[];
}

export interface LegendProfile {
  playerId: string;
  managerTrust: number; // 0-100
  squadRole: 'ACADEMY_PROSPECT' | 'RESERVE' | 'ROTATION' | 'FIRST_TEAM' | 'KEY_STAR' | 'CAPTAIN';
  internationalCallUp: boolean;
  nationalTeamId?: string;
  individualAwards: { season: number; award: string }[];
  trophies: string[];
  retired: boolean;
  retirementSummary?: string;
  agentOffers: TransferOffer[];
}

export interface NewsItem {
  id: string;
  week: number;
  season: number;
  category: 'MATCH' | 'TRANSFER' | 'BOARD' | 'INTERNATIONAL' | 'AWARD' | 'ACADEMY';
  headline: string;
  body: string;
}

export interface CareerSave {
  slotId: string;
  mode: CareerMode;
  difficulty?: GameDifficulty;
  createdAt: number;
  updatedAt: number;
  season: number;
  currentWeek: number; // 1-38
  transferWindowOpen: boolean;
  userClubId: string;
  manager?: ManagerProfile;
  legend?: LegendProfile;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  leagues: Record<string, League>;
  nationalTeams: Record<string, NationalTeam>;
  cupFixtures: Fixture[];
  continentalFixtures: Fixture[];
  internationalTournament?: InternationalTournament;
  activeMatch?: MatchSession;
  transferOffers: TransferOffer[];
  news: NewsItem[];
  trainingFocus: TrainingFocus;
  weekTrained: boolean;
}
