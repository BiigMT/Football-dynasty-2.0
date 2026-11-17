export type RosterSourceKind = 'OFFICIAL_LEAGUE' | 'OFFICIAL_CLUB' | 'LICENSED_PROVIDER';
export interface RealWorldRosterEntry {
  playerId: string;
  fullName: string;
  clubId: string;
  season: string;
  shirtNumber: number;
  /** Real-world facts are optional until the source confirms them. */
  nationality?: string;
  dateOfBirth?: string;
  position?: 'GK'|'CB'|'LB'|'RB'|'CDM'|'CM'|'CAM'|'LW'|'RW'|'ST';
  loanStatus?: 'ON_LOAN'|'LOANED_OUT';
  sourceUrl: string;
  sourceCheckedAt: string;
}
export interface RealWorldClubRoster {
  clubId: string;
  clubName: string;
  leagueId: string;
  season: string;
  sourceKind: RosterSourceKind;
  sourceUrl: string;
  sourceCheckedAt: string;
  players: RealWorldRosterEntry[];
}
export interface RosterImportIssue { index: number; message: string; }
export interface RosterImportResult { accepted: RealWorldRosterEntry[]; issues: RosterImportIssue[]; }

/** Validates provider exports before they are allowed near career-save data. */
export function validateRealWorldRoster(input: unknown, expectedClubId?: string): RosterImportResult {
  const accepted: RealWorldRosterEntry[] = [];
  const issues: RosterImportIssue[] = [];
  if (!Array.isArray(input)) return { accepted, issues: [{ index: -1, message: 'Roster payload must be an array.' }] };
  const ids = new Set<string>();
  input.forEach((value, index) => {
    if (!value || typeof value !== 'object') { issues.push({ index, message: 'Player record must be an object.' }); return; }
    const p = value as Partial<RealWorldRosterEntry>;
    if (!p.playerId || !p.fullName || !p.clubId || !p.season || !p.sourceUrl || !p.sourceCheckedAt) {
      issues.push({ index, message: 'Missing stable ID, name, club, season or source metadata.' }); return;
    }
    if (expectedClubId && p.clubId !== expectedClubId) { issues.push({ index, message: 'Player belongs to a different club.' }); return; }
    if (!Number.isInteger(p.shirtNumber) || (p.shirtNumber as number) < 1 || (p.shirtNumber as number) > 99) {
      issues.push({ index, message: 'Shirt number must be an integer from 1 to 99.' }); return;
    }
    if (ids.has(p.playerId)) { issues.push({ index, message: 'Duplicate player ID.' }); return; }
    if (p.dateOfBirth && Number.isNaN(Date.parse(p.dateOfBirth))) { issues.push({ index, message: 'Invalid date of birth.' }); return; }
    if (!/^https:\/\//.test(p.sourceUrl)) { issues.push({ index, message: 'Source must be an HTTPS URL.' }); return; }
    ids.add(p.playerId);
    accepted.push(p as RealWorldRosterEntry);
  });
  return { accepted, issues };
}

/**
 * Match real identities to existing gameplay profiles without pretending that
 * simulated OVR, potential, wages or attributes are official real-world data.
 * Caller supplies an existing generated profile to preserve its gameplay stats.
 */
export function applyRealIdentity<T extends { id:string; name:string; squadNumber:number; nationality:string }>(
  gameplayProfile: T,
  rosterEntry: RealWorldRosterEntry
): T {
  return {
    ...gameplayProfile,
    id: rosterEntry.playerId,
    name: rosterEntry.fullName,
    squadNumber: rosterEntry.shirtNumber,
    nationality: rosterEntry.nationality ?? gameplayProfile.nationality,
  };
}
