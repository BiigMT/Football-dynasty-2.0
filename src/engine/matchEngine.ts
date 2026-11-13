import {
  Club,
  ClubTactics,
  GameDifficulty,
  Fixture,
  Formation,
  KeyMomentChoice,
  KeyMomentPrompt,
  MatchEvent,
  MatchObjective,
  MatchSession,
  Player,
  PlayerMatchState,
  Position,
  TeamMatchStats,
  WeatherCondition,
} from '../types/football';
import { getFormationSlots } from './database';

export interface PitchCoord {
  x: number; // 0..100 (left to right for home team)
  y: number; // 0..100 (top to bottom)
}

export function getFormationCoordinates(formation: Formation): PitchCoord[] {
  switch (formation) {
    case '4-3-3':
      return [
        { x: 6, y: 50 },
        { x: 22, y: 15 },
        { x: 19, y: 38 },
        { x: 19, y: 62 },
        { x: 22, y: 85 },
        { x: 35, y: 50 },
        { x: 43, y: 30 },
        { x: 43, y: 70 },
        { x: 66, y: 18 },
        { x: 74, y: 50 },
        { x: 66, y: 82 },
      ];
    case '4-2-3-1':
      return [
        { x: 6, y: 50 },
        { x: 22, y: 15 },
        { x: 19, y: 38 },
        { x: 19, y: 62 },
        { x: 22, y: 85 },
        { x: 34, y: 36 },
        { x: 34, y: 64 },
        { x: 54, y: 18 },
        { x: 55, y: 50 },
        { x: 54, y: 82 },
        { x: 75, y: 50 },
      ];
    case '4-4-2':
      return [
        { x: 6, y: 50 },
        { x: 22, y: 15 },
        { x: 19, y: 38 },
        { x: 19, y: 62 },
        { x: 22, y: 85 },
        { x: 45, y: 15 },
        { x: 42, y: 39 },
        { x: 42, y: 61 },
        { x: 45, y: 85 },
        { x: 72, y: 36 },
        { x: 72, y: 64 },
      ];
    case '3-5-2':
      return [
        { x: 6, y: 50 },
        { x: 20, y: 26 },
        { x: 18, y: 50 },
        { x: 20, y: 74 },
        { x: 42, y: 12 },
        { x: 36, y: 38 },
        { x: 44, y: 54 },
        { x: 56, y: 45 },
        { x: 42, y: 88 },
        { x: 73, y: 36 },
        { x: 73, y: 64 },
      ];
    case '5-3-2':
      return [
        { x: 6, y: 50 },
        { x: 25, y: 12 },
        { x: 18, y: 32 },
        { x: 17, y: 50 },
        { x: 18, y: 68 },
        { x: 25, y: 88 },
        { x: 43, y: 28 },
        { x: 40, y: 50 },
        { x: 43, y: 72 },
        { x: 72, y: 37 },
        { x: 72, y: 63 },
      ];
  }
}

function emptyTeamStats(): TeamMatchStats {
  return {
    goals: 0,
    shots: 0,
    shotsOnTarget: 0,
    possession: 50,
    passes: 0,
    passesCompleted: 0,
    tackles: 0,
    fouls: 0,
    corners: 0,
    offsides: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    xG: 0,
  };
}

function buildObjectivesForPlayer(player: Player): MatchObjective[] {
  const pos = player.position;
  if (pos === 'GK') {
    return [
      { id: 'obj_saves', label: 'Make 3+ saves', target: 3, current: 0, type: 'SAVES', completed: false },
      { id: 'obj_cs', label: 'Keep a clean sheet', target: 1, current: 1, type: 'CLEAN_SHEET', completed: true },
      { id: 'obj_rat', label: 'Earn 7.0+ match rating', target: 7.0, current: 6.3, type: 'RATING', completed: false },
    ];
  }
  if (['CB', 'LB', 'RB', 'CDM'].includes(pos)) {
    return [
      { id: 'obj_tck', label: 'Win 3+ tackles', target: 3, current: 0, type: 'TACKLES', completed: false },
      { id: 'obj_cs', label: 'Concede <= 1 goal', target: 1, current: 0, type: 'CLEAN_SHEET', completed: true },
      { id: 'obj_rat', label: 'Earn 7.0+ match rating', target: 7.0, current: 6.3, type: 'RATING', completed: false },
    ];
  }
  if (pos === 'CM' || pos === 'CAM') {
    return [
      { id: 'obj_pas', label: 'Complete 35+ passes', target: 35, current: 0, type: 'PASSES', completed: false },
      { id: 'obj_ga', label: 'Record a goal or assist', target: 1, current: 0, type: 'GOAL_OR_ASSIST', completed: false },
      { id: 'obj_rat', label: 'Earn 7.2+ match rating', target: 7.2, current: 6.3, type: 'RATING', completed: false },
    ];
  }
  return [
    { id: 'obj_ga', label: 'Score or assist in the match', target: 1, current: 0, type: 'GOAL_OR_ASSIST', completed: false },
    { id: 'obj_sot', label: 'Register 2+ shots on target', target: 2, current: 0, type: 'SHOTS_ON_TARGET', completed: false },
    { id: 'obj_rat', label: 'Earn 7.2+ match rating', target: 7.2, current: 6.3, type: 'RATING', completed: false },
  ];
}

export function createMatchSession(params: {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
  players: Record<string, Player>;
  userClubSide?: 'HOME' | 'AWAY';
  userPlayerId?: string;
  difficulty?: GameDifficulty;
}): MatchSession {
  const { fixture, homeClub, awayClub, players, userClubSide, userPlayerId } = params;
  const weathers: WeatherCondition[] = ['Clear Night', 'Light Rain', 'Warm Humid', 'Breezy'];
  const weather = weathers[Math.floor(Math.random() * weathers.length)];

  const homeTactics: ClubTactics = JSON.parse(JSON.stringify(homeClub.tactics));
  const awayTactics: ClubTactics = JSON.parse(JSON.stringify(awayClub.tactics));

  const playerStates: Record<string, PlayerMatchState> = {};

  const registerSide = (tactics: ClubTactics, clubId: string, side: 'HOME' | 'AWAY') => {
    tactics.startingXI.forEach((pid, idx) => {
      const p = players[pid];
      if (!p) return;
      playerStates[pid] = {
        playerId: pid,
        clubId,
        side,
        slotIndex: idx,
        onPitch: true,
        subbedOff: false,
        stamina: Math.max(60, p.fitness),
        rating: 6.3,
        goals: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        tackles: 0,
        saves: 0,
        yellowCards: 0,
        redCard: false,
        injured: false,
      };
    });
    tactics.bench.forEach((pid) => {
      const p = players[pid];
      if (!p) return;
      playerStates[pid] = {
        playerId: pid,
        clubId,
        side,
        slotIndex: -1,
        onPitch: false,
        subbedOff: false,
        stamina: Math.max(70, p.fitness),
        rating: 6.2,
        goals: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        tackles: 0,
        saves: 0,
        yellowCards: 0,
        redCard: false,
        injured: false,
      };
    });
  };

  registerSide(homeTactics, homeClub.id, 'HOME');
  registerSide(awayTactics, awayClub.id, 'AWAY');

  const userPlayer = userPlayerId ? players[userPlayerId] : undefined;

  return {
    id: `match_${fixture.id}_${Date.now()}`,
    fixtureId: fixture.id,
    competitionName: fixture.competitionName,
    competitionType: fixture.competitionType,
    homeClubId: homeClub.id,
    awayClubId: awayClub.id,
    isInternational: fixture.competitionType === 'INTERNATIONAL',
    weather,
    phase: 'PRE_MATCH',
    difficulty: params.difficulty ?? 'NORMAL',
    minute: 0,
    addedTimeFirstHalf: 1 + Math.floor(Math.random() * 3),
    addedTimeSecondHalf: 2 + Math.floor(Math.random() * 4),
    homeTactics,
    awayTactics,
    homeSubsUsed: 0,
    awaySubsUsed: 0,
    homeStats: emptyTeamStats(),
    awayStats: emptyTeamStats(),
    playerStates,
    events: [],
    momentum: 6, // slight home advantage
    ballPos: { x: 50, y: 50 },
    userClubSide,
    userPlayerId,
    userObjectives: userPlayer ? buildObjectivesForPlayer(userPlayer) : [],
  };
}

interface SectorRatings {
  attack: number;
  midfield: number;
  defense: number;
  gk: number;
}

function computeSectorRatings(
  tactics: ClubTactics,
  states: Record<string, PlayerMatchState>,
  players: Record<string, Player>,
  chemistry: number,
  isHome: boolean,
  weather: WeatherCondition
): SectorRatings {
  const slots = getFormationSlots(tactics.formation);
  let attSum = 0;
  let attCount = 0;
  let midSum = 0;
  let midCount = 0;
  let defSum = 0;
  let defCount = 0;
  let gkVal = 70;

  tactics.startingXI.forEach((pid, idx) => {
    const p = players[pid];
    const st = states[pid];
    if (!p || !st || !st.onPitch || st.redCard) return;

    const expectedPos: Position = slots[idx] ?? p.position;
    const posFit = p.position === expectedPos ? 1.0 : p.secondaryPositions.includes(expectedPos) ? 0.94 : 0.84;
    const staminaFactor = 0.72 + (st.stamina / 100) * 0.28;
    const moraleFactor = 0.92 + (p.morale / 100) * 0.14;
    const formFactor = 0.93 + (p.form / 100) * 0.12;
    const effective = p.overall * posFit * staminaFactor * moraleFactor * formFactor;

    if (expectedPos === 'GK') {
      gkVal = Math.max(gkVal, effective);
    } else if (['CB', 'LB', 'RB'].includes(expectedPos)) {
      defSum += effective;
      defCount++;
    } else if (['CDM', 'CM', 'CAM'].includes(expectedPos)) {
      midSum += effective;
      midCount++;
    } else {
      attSum += effective;
      attCount++;
    }
  });

  const chemMult = 0.93 + (chemistry / 100) * 0.12;
  const homeMult = isHome ? 1.035 : 1.0;
  const weatherAttMult = weather === 'Light Rain' ? 0.96 : weather === 'Warm Humid' ? 0.98 : 1.0;

  let mentAtt = 1.0;
  let mentDef = 1.0;
  if (tactics.mentality === 'DEFENSIVE') {
    mentAtt = 0.88;
    mentDef = 1.1;
  } else if (tactics.mentality === 'ATTACKING') {
    mentAtt = 1.09;
    mentDef = 0.93;
  } else if (tactics.mentality === 'ALL_OUT') {
    mentAtt = 1.18;
    mentDef = 0.82;
  }

  const pressBoost = tactics.pressing === 'GEGENPRESS' ? 1.05 : tactics.pressing === 'LOW_BLOCK' ? 0.96 : 1.0;

  return {
    attack: ((attCount ? attSum / attCount : 68) * chemMult * homeMult * weatherAttMult * mentAtt),
    midfield: ((midCount ? midSum / midCount : 68) * chemMult * homeMult * pressBoost),
    defense: ((defCount ? defSum / defCount : 68) * chemMult * homeMult * mentDef),
    gk: gkVal * chemMult,
  };
}

function pickWeightedPlayer(
  tactics: ClubTactics,
  states: Record<string, PlayerMatchState>,
  players: Record<string, Player>,
  preferredPositions: Position[]
): Player | null {
  const candidates = tactics.startingXI
    .map((id) => ({ p: players[id], st: states[id] }))
    .filter((x) => x.p && x.st && x.st.onPitch && !x.st.redCard);
  if (!candidates.length) return null;

  const weighted = candidates.map((c) => {
    const posBonus = preferredPositions.includes(c.p.position) ? 3.2 : 1;
    const starBoost = c.p.isUserPlayer ? 1.45 : 1;
    return { p: c.p, w: posBonus * starBoost * (c.p.overall / 70) };
  });
  const total = weighted.reduce((acc, x) => acc + x.w, 0);
  let r = Math.random() * total;
  for (const item of weighted) {
    r -= item.w;
    if (r <= 0) return item.p;
  }
  return weighted[0].p;
}

function buildUserKeyMoment(
  minute: number,
  userPlayer: Player,
  opponentName: string
): KeyMomentPrompt {
  const pos = userPlayer.position;
  if (pos === 'GK') {
    const choices: KeyMomentChoice[] = [
      { id: 'dive_left', label: 'Dive Low Left', description: 'Commit to the bottom-left corner', attributeKey: 'goalkeeping', difficulty: 68, successOutcome: 'SAVE' },
      { id: 'stand_tall', label: 'Stay Central & Spread', description: 'Use reactions to close the angle', attributeKey: 'reactions', difficulty: 66, successOutcome: 'SAVE' },
      { id: 'dive_right', label: 'Explode Top Right', description: 'Read the striker hips and parry wide', attributeKey: 'jumping', difficulty: 70, successOutcome: 'SAVE' },
    ];
    return {
      id: `km_${minute}_${Date.now()}`,
      minute,
      title: '1v1 Penalty-Area Showdown',
      scenario: `${opponentName}'s striker breaks the offside trap and winds up from 11 yards! Make the decisive stop.`,
      zone: 'PENALTY',
      choices,
    };
  }

  if (['CB', 'LB', 'RB', 'CDM'].includes(pos)) {
    return {
      id: `km_${minute}_${Date.now()}`,
      minute,
      title: 'Last-Ditch Defensive Duel',
      scenario: `${opponentName} drives toward your box on a rapid counter. Time your defensive intervention.`,
      zone: 'DEFENSE',
      choices: [
        { id: 'stand_tackle', label: 'Timed Standing Tackle', description: 'Step in cleanly and win possession', attributeKey: 'tackling', difficulty: 65, successOutcome: 'TACKLE_WIN' },
        { id: 'jockey_block', label: 'Jockey & Intercept Lane', description: 'Read the pass and spring a counter', attributeKey: 'positioning', difficulty: 63, successOutcome: 'CHANCE_CREATED' },
        { id: 'launch_counter', label: 'Win & Long Through-Ball', description: 'Win the duel and switch play diagonally', attributeKey: 'passing', difficulty: 71, successOutcome: 'ASSIST' },
      ],
    };
  }

  if (pos === 'CM' || pos === 'CAM') {
    return {
      id: `km_${minute}_${Date.now()}`,
      minute,
      title: 'Pocket of Space at 25 Yards',
      scenario: `You receive the ball between ${opponentName}'s midfield and back four with runners streaking ahead.`,
      zone: 'MIDFIELD',
      choices: [
        { id: 'killer_pass', label: 'Slide Killer Through-Ball', description: 'Thread a precision pass into the striker', attributeKey: 'vision', difficulty: 67, successOutcome: 'ASSIST' },
        { id: 'curler', label: 'Whip Top-Corner Strike', description: 'Bend a clean shot from outside the arc', attributeKey: 'shooting', difficulty: 72, successOutcome: 'GOAL' },
        { id: 'glide_past', label: 'Glide Past Marker', description: 'Beat the pressing midfielder into the box', attributeKey: 'dribbling', difficulty: 64, successOutcome: 'CHANCE_CREATED' },
      ],
    };
  }

  return {
    id: `km_${minute}_${Date.now()}`,
    minute,
    title: 'Clear Sight of Goal',
    scenario: `A sharp pass splits ${opponentName}'s centre-backs and finds you in stride on the edge of the six-yard box!`,
    zone: 'BOX',
    choices: [
      { id: 'finesse', label: 'Finesse Far Corner', description: 'Side-foot curl past the outstretched keeper', attributeKey: 'finishing', difficulty: 66, successOutcome: 'GOAL' },
      { id: 'power_lace', label: 'Unleash Power Drive', description: 'Strike through the ball toward the roof of the net', attributeKey: 'shooting', difficulty: 69, successOutcome: 'GOAL' },
      { id: 'square_assist', label: 'Square for Tap-In', description: 'Lay it across to your unmarked teammate', attributeKey: 'passing', difficulty: 60, successOutcome: 'ASSIST' },
    ],
  };
}

function updateUserObjectives(session: MatchSession): void {
  if (!session.userPlayerId) return;
  const st = session.playerStates[session.userPlayerId];
  if (!st) return;
  const oppGoals = session.userClubSide === 'HOME' ? session.awayStats.goals : session.homeStats.goals;

  session.userObjectives = session.userObjectives.map((obj) => {
    let current = obj.current;
    let completed = obj.completed;
    switch (obj.type) {
      case 'GOAL_OR_ASSIST':
        current = st.goals + st.assists;
        completed = current >= obj.target;
        break;
      case 'SHOTS_ON_TARGET':
        current = st.shotsOnTarget;
        completed = current >= obj.target;
        break;
      case 'PASSES':
        current = st.passes;
        completed = current >= obj.target;
        break;
      case 'TACKLES':
        current = st.tackles;
        completed = current >= obj.target;
        break;
      case 'SAVES':
        current = st.saves;
        completed = current >= obj.target;
        break;
      case 'CLEAN_SHEET':
        current = oppGoals === 0 ? 1 : 0;
        completed = obj.label.includes('<= 1') ? oppGoals <= 1 : oppGoals === 0;
        break;
      case 'RATING':
        current = Number(st.rating.toFixed(1));
        completed = current >= obj.target;
        break;
    }
    return { ...obj, current, completed };
  });
}

export function startMatchKickoff(session: MatchSession): MatchSession {
  const next: MatchSession = {
    ...session,
    phase: 'FIRST_HALF',
    minute: 0,
    events: [
      {
        id: `ev_kickoff_${Date.now()}`,
        minute: 1,
        half: 1,
        type: 'KICKOFF',
        teamSide: 'NEUTRAL',
        text: `Kickoff under ${session.weather.toLowerCase()} skies!`,
      },
    ],
  };
  return next;
}

export function resumeSecondHalf(session: MatchSession): MatchSession {
  if (session.phase !== 'HALF_TIME') return session;
  return {
    ...session,
    phase: 'SECOND_HALF',
    minute: 45,
    ballPos: { x: 50, y: 50 },
    events: [
      ...session.events,
      {
        id: `ev_2h_${Date.now()}`,
        minute: 46,
        half: 2,
        type: 'KICKOFF',
        teamSide: 'NEUTRAL',
        text: 'Second half underway from minute 46.',
      },
    ],
  };
}

export function applyTeamTalk(
  session: MatchSession,
  talkType: 'ENCOURAGE' | 'DEMAND_MORE' | 'TACTICAL_FOCUS' | 'PRAISE',
  players: Record<string, Player>
): MatchSession {
  const side = session.userClubSide ?? 'HOME';
  const nextStates = { ...session.playerStates };

  Object.values(nextStates).forEach((st) => {
    if (st.side !== side) return;
    if (talkType === 'ENCOURAGE') {
      st.rating = Math.min(10, st.rating + 0.15);
      st.stamina = Math.min(100, st.stamina + 3);
    } else if (talkType === 'DEMAND_MORE') {
      st.rating = Math.min(10, st.rating + (players[st.playerId]?.morale >= 65 ? 0.25 : -0.05));
    } else if (talkType === 'TACTICAL_FOCUS') {
      st.rating = Math.min(10, st.rating + 0.2);
    } else if (talkType === 'PRAISE') {
      st.stamina = Math.min(100, st.stamina + 5);
      st.rating = Math.min(10, st.rating + 0.1);
    }
  });

  const momentumDelta = talkType === 'DEMAND_MORE' ? 14 : talkType === 'ENCOURAGE' ? 10 : 8;
  return {
    ...session,
    playerStates: nextStates,
    momentum: Math.max(-100, Math.min(100, session.momentum + (side === 'HOME' ? momentumDelta : -momentumDelta))),
    teamTalkApplied: talkType,
    events: [
      ...session.events,
      {
        id: `ev_talk_${Date.now()}`,
        minute: 45,
        half: 1,
        type: 'HALF_TIME',
        teamSide: side,
        text:
          talkType === 'ENCOURAGE'
            ? 'Manager rallies the squad with calm belief at the interval.'
            : talkType === 'DEMAND_MORE'
            ? 'Fiery half-time demand — players emerge hungry to raise the tempo!'
            : talkType === 'TACTICAL_FOCUS'
            ? 'Tactical chalkboard adjustments sharpened shape for the second half.'
            : 'Manager praises the disciplined first-half display.',
      },
    ],
  };
}

export function makeMatchSubstitution(
  session: MatchSession,
  side: 'HOME' | 'AWAY',
  outPlayerId: string,
  inPlayerId: string
): MatchSession {
  const subsUsed = side === 'HOME' ? session.homeSubsUsed : session.awaySubsUsed;
  if (subsUsed >= 5) return session;

  const tactics = side === 'HOME' ? { ...session.homeTactics } : { ...session.awayTactics };
  const idx = tactics.startingXI.indexOf(outPlayerId);
  const benchIdx = tactics.bench.indexOf(inPlayerId);
  if (idx === -1 || benchIdx === -1) return session;

  const nextXI = [...tactics.startingXI];
  nextXI[idx] = inPlayerId;
  const nextBench = [...tactics.bench];
  nextBench[benchIdx] = outPlayerId;

  tactics.startingXI = nextXI;
  tactics.bench = nextBench;

  const nextStates = { ...session.playerStates };
  if (nextStates[outPlayerId]) {
    nextStates[outPlayerId] = { ...nextStates[outPlayerId], onPitch: false, subbedOff: true };
  }
  if (nextStates[inPlayerId]) {
    nextStates[inPlayerId] = {
      ...nextStates[inPlayerId],
      onPitch: true,
      slotIndex: idx,
      stamina: Math.max(85, nextStates[inPlayerId].stamina),
    };
  }

  return {
    ...session,
    homeTactics: side === 'HOME' ? tactics : session.homeTactics,
    awayTactics: side === 'AWAY' ? tactics : session.awayTactics,
    homeSubsUsed: side === 'HOME' ? subsUsed + 1 : session.homeSubsUsed,
    awaySubsUsed: side === 'AWAY' ? subsUsed + 1 : session.awaySubsUsed,
    playerStates: nextStates,
    events: [
      ...session.events,
      {
        id: `ev_sub_${Date.now()}_${inPlayerId}`,
        minute: Math.max(1, session.minute),
        half: session.phase === 'SECOND_HALF' ? 2 : 1,
        type: 'SUBSTITUTION',
        teamSide: side,
        playerId: inPlayerId,
        text: `Substitution (${side === 'HOME' ? 'Home' : 'Away'}): fresh legs introduced onto the pitch.`,
      },
    ],
  };
}

export function resolveKeyMomentChoice(
  session: MatchSession,
  choiceId: string,
  clubs: Record<string, Club>,
  players: Record<string, Player>
): MatchSession {
  const km = session.pendingKeyMoment;
  if (!km || !session.userPlayerId || !session.userClubSide) return session;

  const choice = km.choices.find((c) => c.id === choiceId) ?? km.choices[0];
  const userPlayer = players[session.userPlayerId];
  if (!userPlayer) return { ...session, pendingKeyMoment: undefined };

  const side = session.userClubSide;
  const userState = { ...session.playerStates[userPlayer.id] };
  const nextStates = { ...session.playerStates };
  const homeStats = { ...session.homeStats };
  const awayStats = { ...session.awayStats };
  const sideStats = side === 'HOME' ? homeStats : awayStats;
  const oppStats = side === 'HOME' ? awayStats : homeStats;
  const userClubName = clubs[side === 'HOME' ? session.homeClubId : session.awayClubId]?.shortName ?? 'TEAM';

  const attrVal = userPlayer.attributes[choice.attributeKey] ?? userPlayer.overall;
  const staminaMod = (userState.stamina - 65) * 0.18;
  const confMod = (userPlayer.confidence - 70) * 0.15;
  const successProb = Math.max(0.22, Math.min(0.88, 0.52 + (attrVal - choice.difficulty) * 0.014 + (staminaMod + confMod) * 0.01));
  const succeeded = Math.random() < successProb;

  const events = [...session.events];
  const half: 1 | 2 = session.minute <= 45 ? 1 : 2;
  let nextBall = { ...session.ballPos };

  if (succeeded) {
    if (choice.successOutcome === 'GOAL') {
      sideStats.goals += 1;
      sideStats.shots += 1;
      sideStats.shotsOnTarget += 1;
      sideStats.xG = Number((sideStats.xG + 0.38).toFixed(2));
      userState.goals += 1;
      userState.shots += 1;
      userState.shotsOnTarget += 1;
      userState.rating = Math.min(10, Number((userState.rating + 1.1).toFixed(1)));
      nextBall = side === 'HOME' ? { x: 96, y: 50 } : { x: 4, y: 50 };
      events.push({
        id: `ev_km_goal_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'GOAL',
        teamSide: side,
        playerId: userPlayer.id,
        playerName: userPlayer.name,
        text: `GOAL! ${userPlayer.name} (${userClubName}) executes "${choice.label}" with clinical precision!`,
      });
    } else if (choice.successOutcome === 'ASSIST') {
      const tactics = side === 'HOME' ? session.homeTactics : session.awayTactics;
      const scorer = pickWeightedPlayer(tactics, nextStates, players, ['ST', 'LW', 'RW', 'CAM']) ?? userPlayer;
      sideStats.goals += 1;
      sideStats.shots += 1;
      sideStats.shotsOnTarget += 1;
      sideStats.xG = Number((sideStats.xG + 0.35).toFixed(2));
      userState.assists += 1;
      userState.passes += 1;
      userState.rating = Math.min(10, Number((userState.rating + 0.85).toFixed(1)));
      if (scorer.id !== userPlayer.id && nextStates[scorer.id]) {
        nextStates[scorer.id] = {
          ...nextStates[scorer.id],
          goals: nextStates[scorer.id].goals + 1,
          rating: Math.min(10, nextStates[scorer.id].rating + 0.9),
        };
      }
      nextBall = side === 'HOME' ? { x: 96, y: 50 } : { x: 4, y: 50 };
      events.push({
        id: `ev_km_ast_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'GOAL',
        teamSide: side,
        playerId: scorer.id,
        playerName: scorer.name,
        assistPlayerId: userPlayer.id,
        assistPlayerName: userPlayer.name,
        text: `GOAL! ${userPlayer.name} threads an extraordinary pass for ${scorer.name} to finish!`,
      });
    } else if (choice.successOutcome === 'SAVE') {
      sideStats.saves += 1;
      oppStats.shots += 1;
      oppStats.shotsOnTarget += 1;
      userState.saves += 1;
      userState.rating = Math.min(10, Number((userState.rating + 0.65).toFixed(1)));
      events.push({
        id: `ev_km_save_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'SAVE',
        teamSide: side,
        playerId: userPlayer.id,
        playerName: userPlayer.name,
        text: `BRILLIANT SAVE! ${userPlayer.name} denies a certain goal with razor-sharp reflexes!`,
      });
    } else {
      userState.tackles += 1;
      userState.passes += 2;
      sideStats.tackles += 1;
      userState.rating = Math.min(10, Number((userState.rating + 0.5).toFixed(1)));
      events.push({
        id: `ev_km_win_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'KEY_MOMENT',
        teamSide: side,
        playerId: userPlayer.id,
        playerName: userPlayer.name,
        text: `Superb moment from ${userPlayer.name} — wins the key battle and lifts ${userClubName}!`,
      });
    }
  } else {
    if (choice.successOutcome === 'SAVE') {
      oppStats.goals += 1;
      oppStats.shots += 1;
      oppStats.shotsOnTarget += 1;
      userState.rating = Math.max(4.5, Number((userState.rating - 0.35).toFixed(1)));
      events.push({
        id: `ev_km_concede_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'GOAL',
        teamSide: side === 'HOME' ? 'AWAY' : 'HOME',
        text: `The striker beats ${userPlayer.name} at the near post!`,
      });
    } else if (choice.successOutcome === 'GOAL') {
      sideStats.shots += 1;
      sideStats.shotsOnTarget += 1;
      oppStats.saves += 1;
      sideStats.xG = Number((sideStats.xG + 0.18).toFixed(2));
      userState.shots += 1;
      userState.shotsOnTarget += 1;
      userState.rating = Math.min(10, Number((userState.rating + 0.1).toFixed(1)));
      events.push({
        id: `ev_km_miss_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'SAVE',
        teamSide: side === 'HOME' ? 'AWAY' : 'HOME',
        text: `${userPlayer.name}'s effort is parried away by a strong diving save!`,
      });
    } else {
      userState.rating = Math.max(4.5, Number((userState.rating - 0.2).toFixed(1)));
      events.push({
        id: `ev_km_fail_${Date.now()}`,
        minute: session.minute,
        half,
        type: 'KEY_MOMENT',
        teamSide: side,
        text: `${userPlayer.name} tries "${choice.label}" but the defender reads the play cleanly.`,
      });
    }
  }

  nextStates[userPlayer.id] = userState;

  const updated: MatchSession = {
    ...session,
    homeStats,
    awayStats,
    playerStates: nextStates,
    events,
    ballPos: nextBall,
    pendingKeyMoment: undefined,
  };
  updateUserObjectives(updated);
  return updated;
}

export function simulateNextMinute(
  session: MatchSession,
  clubs: Record<string, Club>,
  players: Record<string, Player>
): { session: MatchSession; soundCue?: 'WHISTLE' | 'GOAL' | 'KICK' } {
  if (
    session.phase === 'PRE_MATCH' ||
    session.phase === 'HALF_TIME' ||
    session.phase === 'FULL_TIME' ||
    session.pendingKeyMoment
  ) {
    return { session };
  }

  const nextMin = session.minute + 1;
  const half: 1 | 2 = session.phase === 'FIRST_HALF' ? 1 : 2;

  // Check Half-Time Transition
  if (session.phase === 'FIRST_HALF' && nextMin > 45 + session.addedTimeFirstHalf) {
    const userSt = session.userPlayerId ? session.playerStates[session.userPlayerId] : undefined;
    const halfTimeFeedback = userSt
      ? userSt.rating >= 7.0
        ? 'Coach: "Sharp first half! Keep finding pockets of space and trust your instincts."'
        : userSt.rating >= 6.3
        ? 'Coach: "Solid shift so far. Raise your work rate in the second 45 to tip the balance."'
        : 'Coach: "You need to get more involved on the ball — focus on clean first touches."'
      : undefined;

    return {
      soundCue: 'WHISTLE',
      session: {
        ...session,
        phase: 'HALF_TIME',
        minute: 45,
        ballPos: { x: 50, y: 50 },
        halfTimeFeedback,
        events: [
          ...session.events,
          {
            id: `ev_ht_${Date.now()}`,
            minute: 45,
            half: 1,
            type: 'HALF_TIME',
            teamSide: 'NEUTRAL',
            text: `Half-Time whistle! Score stands ${session.homeStats.goals} - ${session.awayStats.goals}.`,
          },
        ],
      },
    };
  }

  // Check Full-Time Transition
  if (session.phase === 'SECOND_HALF' && nextMin > 90 + session.addedTimeSecondHalf) {
    const updated: MatchSession = {
      ...session,
      phase: 'FULL_TIME',
      minute: 90,
      ballPos: { x: 50, y: 50 },
      events: [
        ...session.events,
        {
          id: `ev_ft_${Date.now()}`,
          minute: 90,
          half: 2,
          type: 'FULL_TIME',
          teamSide: 'NEUTRAL',
          text: `Full-Time! Final score ${session.homeStats.goals} - ${session.awayStats.goals}.`,
        },
      ],
    };
    updateUserObjectives(updated);
    return { session: updated, soundCue: 'WHISTLE' };
  }

  const homeClub = clubs[session.homeClubId];
  const awayClub = clubs[session.awayClubId];
  let homeRatings = computeSectorRatings(
    session.homeTactics,
    session.playerStates,
    players,
    homeClub?.chemistry ?? 75,
    true,
    session.weather
  );
  let awayRatings = computeSectorRatings(
    session.awayTactics,
    session.playerStates,
    players,
    awayClub?.chemistry ?? 75,
    false,
    session.weather
  );

  // Difficulty strengthens the opponent relative to the user's team.
  const challenge = session.difficulty === 'HARD' ? 1.08 : session.difficulty === 'EASY' ? 0.92 : 1;
  const scaleRatings = (ratings: SectorRatings, factor: number): SectorRatings => ({
    attack: ratings.attack * factor,
    midfield: ratings.midfield * factor,
    defense: ratings.defense * factor,
    gk: ratings.gk * factor,
  });
  if (session.userClubSide === 'HOME') awayRatings = scaleRatings(awayRatings, challenge);
  else if (session.userClubSide === 'AWAY') homeRatings = scaleRatings(homeRatings, challenge);

  // Opposition coaching reacts to the scoreline instead of keeping one static plan.
  // The non-user side raises its attacking output when chasing late in the match,
  // while protecting a narrow lead with a small defensive boost.
  const applyGameStateAdjustment = (ratings: SectorRatings, attacking: number, midfield: number, defending: number): SectorRatings => ({
    attack: ratings.attack * attacking,
    midfield: ratings.midfield * midfield,
    defense: ratings.defense * defending,
    gk: ratings.gk,
  });
  const homeIsUser = session.userClubSide === 'HOME';
  const awayIsUser = session.userClubSide === 'AWAY';
  const homeTrailing = session.homeStats.goals < session.awayStats.goals;
  const awayTrailing = session.awayStats.goals < session.homeStats.goals;
  const homeLeading = session.homeStats.goals > session.awayStats.goals;
  const awayLeading = session.awayStats.goals > session.homeStats.goals;
  if (nextMin >= 62 && !homeIsUser && homeTrailing) {
    const urgency = nextMin >= 78 ? 1.09 : 1.05;
    homeRatings = applyGameStateAdjustment(homeRatings, urgency, 1.035, 0.985);
  } else if (nextMin >= 62 && !awayIsUser && awayTrailing) {
    const urgency = nextMin >= 78 ? 1.09 : 1.05;
    awayRatings = applyGameStateAdjustment(awayRatings, urgency, 1.035, 0.985);
  }
  if (nextMin >= 76 && !homeIsUser && homeLeading && session.homeStats.goals - session.awayStats.goals === 1) {
    homeRatings = applyGameStateAdjustment(homeRatings, 0.985, 1, 1.045);
  } else if (nextMin >= 76 && !awayIsUser && awayLeading && session.awayStats.goals - session.homeStats.goals === 1) {
    awayRatings = applyGameStateAdjustment(awayRatings, 0.985, 1, 1.045);
  }

  const homeStats = { ...session.homeStats };
  const awayStats = { ...session.awayStats };
  const nextStates = { ...session.playerStates };
  const events = [...session.events];
  let soundCue: 'WHISTLE' | 'GOAL' | 'KICK' | undefined;

  // Stamina drain per minute
  Object.keys(nextStates).forEach((pid) => {
    const st = nextStates[pid];
    if (!st.onPitch || st.redCard) return;
    const p = players[pid];
    const tactics = st.side === 'HOME' ? session.homeTactics : session.awayTactics;
    const pressDrain = tactics.pressing === 'GEGENPRESS' ? 0.58 : tactics.pressing === 'MID_PRESS' ? 0.42 : 0.3;
    const staminaResist = p ? 1.25 - (p.attributes.stamina / 100) * 0.55 : 0.9;
    const drain = (p?.position === 'GK' ? 0.08 : pressDrain) * staminaResist;
    nextStates[pid] = {
      ...st,
      stamina: Math.max(12, Number((st.stamina - drain).toFixed(1))),
    };
  });

  // Possession calculation & passes
  const midDiff = homeRatings.midfield - awayRatings.midfield;
  const homeStyleMod = session.homeTactics.passing === 'SHORT_TIKI_TAKA' ? 4 : session.homeTactics.passing === 'DIRECT_LONG' ? -4 : 0;
  const awayStyleMod = session.awayTactics.passing === 'SHORT_TIKI_TAKA' ? 4 : session.awayTactics.passing === 'DIRECT_LONG' ? -4 : 0;
  const homePossShare = Math.max(28, Math.min(72, 50 + midDiff * 0.8 + homeStyleMod - awayStyleMod));
  homeStats.possession = Math.round(homeStats.possession * 0.92 + homePossShare * 0.08);
  awayStats.possession = 100 - homeStats.possession;

  const homeHasBall = Math.random() * 100 < homePossShare;
  const atkSide: 'HOME' | 'AWAY' = homeHasBall ? 'HOME' : 'AWAY';
  const defSide: 'HOME' | 'AWAY' = homeHasBall ? 'AWAY' : 'HOME';
  const atkStats = atkSide === 'HOME' ? homeStats : awayStats;
  const defStats = atkSide === 'HOME' ? awayStats : homeStats;
  const atkTactics = atkSide === 'HOME' ? session.homeTactics : session.awayTactics;
  const defTactics = atkSide === 'HOME' ? session.awayTactics : session.homeTactics;
  const atkRatings = atkSide === 'HOME' ? homeRatings : awayRatings;
  const defRatings = atkSide === 'HOME' ? awayRatings : homeRatings;
  const atkClubName = atkSide === 'HOME' ? homeClub?.shortName ?? 'HOM' : awayClub?.shortName ?? 'AWY';
  const defClubName = defSide === 'HOME' ? homeClub?.shortName ?? 'HOM' : awayClub?.shortName ?? 'AWY';

  // Accumulate passes
  const passesThisMin = 4 + Math.floor(Math.random() * 5);
  atkStats.passes += passesThisMin;
  atkStats.passesCompleted += Math.max(2, Math.round(passesThisMin * (0.76 + (atkRatings.midfield - 65) * 0.004)));

  if (session.userPlayerId && nextStates[session.userPlayerId]?.onPitch && nextStates[session.userPlayerId]?.side === atkSide) {
    if (Math.random() < 0.65) {
      nextStates[session.userPlayerId] = {
        ...nextStates[session.userPlayerId],
        passes: nextStates[session.userPlayerId].passes + 1,
      };
    }
  }

  // Ball position movement
  const ballX = atkSide === 'HOME' ? 52 + Math.random() * 38 : 10 + Math.random() * 38;
  const ballY = 14 + Math.random() * 72;
  let finalBall = { x: ballX, y: ballY };

  // Check Become a Legend Interactive Key Moment (3-4 per match)
  let pendingKeyMoment: KeyMomentPrompt | undefined;
  if (
    session.userPlayerId &&
    nextStates[session.userPlayerId]?.onPitch &&
    !nextStates[session.userPlayerId]?.redCard &&
    [18, 37, 63, 81].includes(nextMin)
  ) {
    const uPlayer = players[session.userPlayerId];
    const oppName = session.userClubSide === 'HOME' ? awayClub?.name ?? 'Opposition' : homeClub?.name ?? 'Opposition';
    if (uPlayer) {
      pendingKeyMoment = buildUserKeyMoment(nextMin, uPlayer, oppName);
    }
  }

  // Event resolution
  if (!pendingKeyMoment) {
    const chanceRoll = Math.random();
    const tempoBoost = ((atkTactics.tempo - 55) / 100) * 0.04;
    const attackEdge = (atkRatings.attack - defRatings.defense) * 0.0028;
    const shotThreshold = Math.max(0.11, Math.min(0.28, 0.165 + attackEdge + tempoBoost));

    if (chanceRoll < shotThreshold) {
      const shooter = pickWeightedPlayer(atkTactics, nextStates, players, ['ST', 'LW', 'RW', 'CAM', 'CM']);
      const gk = players[defTactics.startingXI[0]];
      if (shooter) {
        atkStats.shots += 1;
        soundCue = 'KICK';
        if (nextStates[shooter.id]) {
          nextStates[shooter.id] = { ...nextStates[shooter.id], shots: nextStates[shooter.id].shots + 1 };
        }
        finalBall = atkSide === 'HOME' ? { x: 89, y: 42 + Math.random() * 16 } : { x: 11, y: 42 + Math.random() * 16 };

        const shotAccuracy = 0.34 + (shooter.attributes.finishing - 68) * 0.006 + (shooter.attributes.shooting - 68) * 0.004;
        const onTarget = Math.random() < Math.max(0.22, Math.min(0.68, shotAccuracy));

        if (!onTarget) {
          atkStats.xG = Number((atkStats.xG + 0.06).toFixed(2));
          if (Math.random() < 0.16) {
            events.push({
              id: `ev_wood_${nextMin}_${Date.now()}`,
              minute: nextMin,
              half,
              type: 'WOODWORK',
              teamSide: atkSide,
              playerId: shooter.id,
              playerName: shooter.name,
              text: `${shooter.name} rattles the crossbar from 20 yards!`,
            });
          } else if (Math.random() < 0.45) {
            events.push({
              id: `ev_miss_${nextMin}_${Date.now()}`,
              minute: nextMin,
              half,
              type: 'MISS',
              teamSide: atkSide,
              playerId: shooter.id,
              playerName: shooter.name,
              text: `${shooter.name} (${atkClubName}) fires wide of the far post.`,
            });
          }
        } else {
          atkStats.shotsOnTarget += 1;
          if (nextStates[shooter.id]) {
            nextStates[shooter.id] = { ...nextStates[shooter.id], shotsOnTarget: nextStates[shooter.id].shotsOnTarget + 1 };
          }
          const xgVal = 0.18 + Math.random() * 0.28;
          atkStats.xG = Number((atkStats.xG + xgVal).toFixed(2));

          const gkFactor = (defRatings.gk - 70) * 0.008;
          const finishFactor = (shooter.attributes.finishing - 70) * 0.007;
          const goalProb = Math.max(0.16, Math.min(0.55, 0.31 + finishFactor - gkFactor));

          if (Math.random() < goalProb) {
            atkStats.goals += 1;
            soundCue = 'GOAL';
            finalBall = atkSide === 'HOME' ? { x: 97, y: 50 } : { x: 3, y: 50 };
            const assister = pickWeightedPlayer(atkTactics, nextStates, players, ['CAM', 'LW', 'RW', 'CM', 'LB', 'RB']);
            const validAssister = assister && assister.id !== shooter.id ? assister : null;

            if (nextStates[shooter.id]) {
              nextStates[shooter.id] = {
                ...nextStates[shooter.id],
                goals: nextStates[shooter.id].goals + 1,
                rating: Math.min(10, Number((nextStates[shooter.id].rating + 1.05).toFixed(1))),
              };
            }
            if (validAssister && nextStates[validAssister.id]) {
              nextStates[validAssister.id] = {
                ...nextStates[validAssister.id],
                assists: nextStates[validAssister.id].assists + 1,
                rating: Math.min(10, Number((nextStates[validAssister.id].rating + 0.65).toFixed(1))),
              };
            }
            if (gk && nextStates[gk.id]) {
              nextStates[gk.id] = {
                ...nextStates[gk.id],
                rating: Math.max(4.5, Number((nextStates[gk.id].rating - 0.25).toFixed(1))),
              };
            }

            events.push({
              id: `ev_goal_${nextMin}_${Date.now()}`,
              minute: nextMin,
              half,
              type: 'GOAL',
              teamSide: atkSide,
              clubId: atkSide === 'HOME' ? session.homeClubId : session.awayClubId,
              playerId: shooter.id,
              playerName: shooter.name,
              assistPlayerId: validAssister?.id,
              assistPlayerName: validAssister?.name,
              text: validAssister
                ? `GOAL! ${shooter.name} finishes cleanly for ${atkClubName} (assist: ${validAssister.name})!`
                : `GOAL! ${shooter.name} rifles it into the net for ${atkClubName}!`,
            });
          } else {
            defStats.saves += 1;
            if (gk && nextStates[gk.id]) {
              nextStates[gk.id] = {
                ...nextStates[gk.id],
                saves: nextStates[gk.id].saves + 1,
                rating: Math.min(10, Number((nextStates[gk.id].rating + 0.35).toFixed(1))),
              };
            }
            if (Math.random() < 0.4) {
              atkStats.corners += 1;
              events.push({
                id: `ev_save_${nextMin}_${Date.now()}`,
                minute: nextMin,
                half,
                type: 'SAVE',
                teamSide: defSide,
                playerId: gk?.id,
                playerName: gk?.name,
                text: `Strong save by ${gk?.name ?? 'the keeper'} (${defClubName}) to tip ${shooter.name}'s strike behind for a corner.`,
              });
            }
          }
        }
      }
    } else if (chanceRoll < shotThreshold + 0.08) {
      // Tackle / Foul / Card
      const tackler = pickWeightedPlayer(defTactics, nextStates, players, ['CB', 'CDM', 'LB', 'RB']);
      if (tackler && Math.random() < 0.68) {
        defStats.tackles += 1;
        if (nextStates[tackler.id]) {
          nextStates[tackler.id] = {
            ...nextStates[tackler.id],
            tackles: nextStates[tackler.id].tackles + 1,
            rating: Math.min(10, Number((nextStates[tackler.id].rating + 0.12).toFixed(1))),
          };
        }
      } else if (tackler) {
        defStats.fouls += 1;
        const cardRoll = Math.random();
        if (cardRoll < 0.14 && nextStates[tackler.id]) {
          const prevY = nextStates[tackler.id].yellowCards;
          if (prevY >= 1) {
            nextStates[tackler.id] = {
              ...nextStates[tackler.id],
              yellowCards: 2,
              redCard: true,
              onPitch: false,
              rating: Math.max(4.0, Number((nextStates[tackler.id].rating - 1.2).toFixed(1))),
            };
            defStats.redCards += 1;
            soundCue = 'WHISTLE';
            events.push({
              id: `ev_red_${nextMin}_${Date.now()}`,
              minute: nextMin,
              half,
              type: 'RED_CARD',
              teamSide: defSide,
              playerId: tackler.id,
              playerName: tackler.name,
              text: `RED CARD! ${tackler.name} (${defClubName}) receives a second booking and is sent off!`,
            });
          } else {
            nextStates[tackler.id] = {
              ...nextStates[tackler.id],
              yellowCards: 1,
              rating: Math.max(4.5, Number((nextStates[tackler.id].rating - 0.25).toFixed(1))),
            };
            defStats.yellowCards += 1;
            events.push({
              id: `ev_yel_${nextMin}_${Date.now()}`,
              minute: nextMin,
              half,
              type: 'YELLOW_CARD',
              teamSide: defSide,
              playerId: tackler.id,
              playerName: tackler.name,
              text: `Yellow card shown to ${tackler.name} (${defClubName}) for a late challenge.`,
            });
          }
        }
      }
    } else if (chanceRoll < shotThreshold + 0.115) {
      atkStats.offsides += 1;
    }

    // Rare injury check
    if (Math.random() < 0.004) {
      const victim = pickWeightedPlayer(atkTactics, nextStates, players, ['CM', 'LW', 'RW', 'CB']);
      if (victim && !victim.isUserPlayer && nextStates[victim.id]) {
        nextStates[victim.id] = { ...nextStates[victim.id], injured: true };
        events.push({
          id: `ev_inj_${nextMin}_${Date.now()}`,
          minute: nextMin,
          half,
          type: 'INJURY',
          teamSide: atkSide,
          playerId: victim.id,
          playerName: victim.name,
          text: `${victim.name} (${atkClubName}) pulls up with a muscle knock.`,
        });
      }
    }
  }

  // AI Tactical Substitutions in 2nd half (60' - 82')
  let updatedSession: MatchSession = {
    ...session,
    minute: nextMin,
    homeStats,
    awayStats,
    playerStates: nextStates,
    events,
    ballPos: finalBall,
    momentum: Math.max(-100, Math.min(100, session.momentum * 0.94 + (atkSide === 'HOME' ? 3 : -3))),
    pendingKeyMoment,
  };

  if (nextMin >= 60 && nextMin <= 82 && nextMin % 7 === 0) {
    for (const side of ['HOME', 'AWAY'] as const) {
      const isUserManaged = session.userClubSide === side && !session.userPlayerId;
      if (isUserManaged) continue; // Manager handles their own subs
      const subsUsed = side === 'HOME' ? updatedSession.homeSubsUsed : updatedSession.awaySubsUsed;
      if (subsUsed >= 3) continue;
      const tactics = side === 'HOME' ? updatedSession.homeTactics : updatedSession.awayTactics;
      const tiredOut = tactics.startingXI
        .slice(1)
        .filter((pid) => pid !== session.userPlayerId && updatedSession.playerStates[pid]?.onPitch)
        .sort((a, b) => (updatedSession.playerStates[a]?.stamina ?? 100) - (updatedSession.playerStates[b]?.stamina ?? 100))[0];
      const freshIn = tactics.bench.find((pid) => !updatedSession.playerStates[pid]?.subbedOff && !updatedSession.playerStates[pid]?.onPitch);
      if (tiredOut && freshIn && (updatedSession.playerStates[tiredOut]?.stamina ?? 100) < 62) {
        updatedSession = makeMatchSubstitution(updatedSession, side, tiredOut, freshIn);
      }
    }
  }

  updateUserObjectives(updatedSession);
  return { session: updatedSession, soundCue };
}

export function quickSimulateFullMatch(
  fixture: Fixture,
  homeClub: Club,
  awayClub: Club,
  players: Record<string, Player>
): MatchSession {
  let session = createMatchSession({ fixture, homeClub, awayClub, players });
  session = startMatchKickoff(session);
  const clubs = { [homeClub.id]: homeClub, [awayClub.id]: awayClub };

  let safety = 0;
  while (session.phase !== 'FULL_TIME' && safety < 140) {
    safety++;
    if (session.phase === 'HALF_TIME') {
      session = resumeSecondHalf(session);
    } else {
      session = simulateNextMinute(session, clubs, players).session;
    }
  }
  return session;
}
