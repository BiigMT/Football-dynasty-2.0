import React from 'react';
import { CareerSave, ClubStaffRole, ClubStaffMember, ClubOperations } from '../types/football';

interface Props { save: CareerSave; onUpdateSave: (next: CareerSave) => void; }
const ROLES: { id: ClubStaffRole; label: string; benefit: string; baseWage: number }[] = [
  { id: 'HEAD_COACH', label: 'Head Coach', benefit: 'Improves overall player development', baseWage: 42000 },
  { id: 'ASSISTANT', label: 'Assistant Manager', benefit: 'Improves training consistency and squad preparation', baseWage: 28000 },
  { id: 'ATTACKING_COACH', label: 'Attacking Coach', benefit: 'Boosts finishing, shooting and attacking drills', baseWage: 24000 },
  { id: 'DEFENDING_COACH', label: 'Defending Coach', benefit: 'Boosts tackling, marking and defensive drills', baseWage: 24000 },
  { id: 'FITNESS_COACH', label: 'Fitness Coach', benefit: 'Improves stamina work and weekly fitness recovery', baseWage: 22000 },
  { id: 'GOALKEEPING_COACH', label: 'Goalkeeping Coach', benefit: 'Improves goalkeeper development', baseWage: 20000 },
  { id: 'SCOUT', label: 'Chief Scout', benefit: 'Improves scouting report accuracy', baseWage: 18000 },
  { id: 'PHYSIO', label: 'Head Physio', benefit: 'Improves injured-player recovery', baseWage: 21000 },
];
const NAMES = ['Daniel Mwansa','Patrick Banda','Joseph Tembo','Michael Phiri','Andrew Zulu','Samuel Mbewe','David Chileshe','Francis Lungu','Peter Ndlovu','Martin Sakala'];
const DEFAULTS: ClubOperations = { staff: {}, facilities: { training: 1, medical: 1, academy: 1, scouting: 1, stadium: 1 }, ticketPrice: 18, supporterMood: 68 };
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const money = (v: number) => '€' + Math.round(v).toLocaleString();
const NEWS = (save: CareerSave, headline: string, body: string) => ({
  id: 'club_ops_' + save.season + '_' + save.currentWeek + '_' + Math.random().toString(36).slice(2, 8),
  week: save.currentWeek, season: save.season, category: 'BOARD' as const, headline, body,
});

export const ClubOperationsPanel: React.FC<Props> = ({ save, onUpdateSave }) => {
  const club = save.clubs[save.userClubId];
  const manager = save.manager;
  const ops = save.clubOperations ?? DEFAULTS;
  const staff = ops.staff ?? {};
  const facilities = { ...DEFAULTS.facilities, ...ops.facilities, training: Math.max(ops.facilities?.training ?? 1, club.facilitiesLevel ?? 1) };
  const payroll = Object.values(staff).reduce((sum, member) => sum + (member?.weeklyWage ?? 0), 0);
  const currentLeague = save.leagues[club.leagueId];
  const position = currentLeague?.standings.slice().sort((a,b) => b.points-a.points || (b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)).findIndex(row => row.clubId === club.id) + 1 || 1;
  const rival = currentLeague?.clubIds.filter(id => id !== club.id).map(id => save.clubs[id]).filter(Boolean).sort((a,b) => Math.abs(a.reputation-club.reputation)-Math.abs(b.reputation-club.reputation))[0];

  const persist = (nextOps: ClubOperations, nextClub = club, headline?: string, body?: string, nextManager = manager) => {
    onUpdateSave({
      ...save, clubOperations: nextOps,
      clubs: { ...save.clubs, [club.id]: nextClub },
      ...(nextManager ? { manager: nextManager } : {}),
      ...(headline && body ? { news: [NEWS(save, headline, body), ...save.news].slice(0, 35) } : {}),
    });
  };

  const hire = (role: ClubStaffRole) => {
    if (staff[role]) return;
    const spec = ROLES.find(item => item.id === role)!;
    const rating = clamp(58 + Math.round(club.reputation * 0.28) + Math.floor(Math.random() * 13), 55, 92);
    const weeklyWage = Math.round(spec.baseWage * (0.72 + rating / 100));
    const signingCost = weeklyWage * 3;
    if (club.finances.cashBalance < signingCost) return;
    const member: ClubStaffMember = { id: 'staff_' + role.toLowerCase(), role, name: NAMES[Math.floor(Math.random() * NAMES.length)], rating, weeklyWage, contractWeeks: 40 };
    persist({ ...ops, staff: { ...staff, [role]: member } }, {
      ...club, finances: { ...club.finances, cashBalance: club.finances.cashBalance - signingCost },
    }, spec.label + ' appointed', member.name + ' joins ' + club.name + ' on a 40-week contract. The club paid ' + money(signingCost) + ' in signing costs.');
  };

  const releaseStaff = (role: ClubStaffRole) => {
    const member = staff[role];
    if (!member) return;
    const nextStaff = { ...staff };
    delete nextStaff[role];
    persist({ ...ops, staff: nextStaff }, club, member.name + ' leaves the club', 'The club and ' + member.name + ' mutually ended the staff contract. Weekly payroll falls by ' + money(member.weeklyWage) + '.');
  };

  const upgrade = (key: keyof ClubOperations['facilities']) => {
    const level = facilities[key];
    if (level >= 5) return;
    const cost = Math.round((key === 'stadium' ? 1_500_000 : 850_000) * level * (1 + (club.reputation / 250)));
    if (club.finances.cashBalance < cost) return;
    const nextFacilities = { ...facilities, [key]: level + 1 };
    const nextClub = key === 'training' ? { ...club, facilitiesLevel: level + 1, finances: { ...club.finances, cashBalance: club.finances.cashBalance - cost } }
      : key === 'stadium' ? { ...club, stadiumCapacity: Math.round(club.stadiumCapacity * 1.08), finances: { ...club.finances, cashBalance: club.finances.cashBalance - cost } }
      : { ...club, finances: { ...club.finances, cashBalance: club.finances.cashBalance - cost } };
    persist({ ...ops, facilities: nextFacilities }, nextClub, key.charAt(0).toUpperCase() + key.slice(1) + ' facilities upgraded', club.name + ' invested ' + money(cost) + ' in its ' + key + ' facilities. The new level is ' + (level + 1) + '/5.');
  };

  const signSponsor = (tier: 'LOCAL' | 'REGIONAL' | 'GLOBAL') => {
    if (ops.sponsor && ops.sponsor.weeksRemaining > 0) return;
    const factor = tier === 'LOCAL' ? 0.7 : tier === 'REGIONAL' ? 1.1 : 1.6;
    const weeklyIncome = Math.round((club.reputation * 450 + club.finances.matchdayIncomePerHomeGame * 0.18) * factor);
    const name = tier === 'LOCAL' ? 'Copperbelt Community Partners' : tier === 'REGIONAL' ? 'Continental Sports Group' : 'Dynasty Global Holdings';
    persist({ ...ops, sponsor: { name, weeklyIncome, weeksRemaining: 20 } }, club, 'New sponsorship secured', name + ' signs a 20-week deal worth ' + money(weeklyIncome) + ' per week. Staff payroll and club expenses are still payable.');
  };

  const setTicketPrice = (delta: number) => {
    const price = clamp(ops.ticketPrice + delta, 5, 60);
    if (price === ops.ticketPrice) return;
    const moodDelta = delta > 0 ? -2 : 2;
    persist({ ...ops, ticketPrice: price, supporterMood: clamp(ops.supporterMood + moodDelta) }, club, 'Ticket pricing reviewed', 'The club sets match tickets at ' + money(price) + '. Supporter sentiment is now ' + clamp(ops.supporterMood + moodDelta) + '/100.');
  };

  const boardChoice = (choice: 'YOUTH' | 'UNITY' | 'RESULTS') => {
    if (!manager || save.clubOperations?.boardCommitment) return;
    const commitment = { type: choice, season: save.season, deadlineWeek: Math.min(38, save.currentWeek + (choice === 'UNITY' ? 6 : 8)) };
    const descriptions = { YOUTH: 'Upgrade the youth academy by at least one level within eight weeks.', UNITY: 'Raise supporter mood to 75 or higher within six weeks.', RESULTS: 'Reach the board target position or better within eight weeks.' };
    persist({ ...ops, boardCommitment: commitment }, club,
      'Board commitment accepted', descriptions[choice]);
  };

  const fanEvent = (kind: 'FORUM' | 'COMMUNITY' | 'DERBY') => {
    const cost = kind === 'COMMUNITY' ? 90000 : kind === 'FORUM' ? 15000 : 0;
    if (club.finances.cashBalance < cost) return;
    const delta = kind === 'COMMUNITY' ? 12 : kind === 'FORUM' ? 7 : -2;
    const headline = kind === 'COMMUNITY' ? 'Club hosts a community open day' : kind === 'FORUM' ? 'Supporters meet the club leadership' : 'Rivalry week is approaching';
    const body = kind === 'COMMUNITY' ? 'Players and staff meet local supporters. The event costs ' + money(cost) + ' and lifts supporter confidence.' : kind === 'FORUM' ? 'The manager answers supporter questions and listens to concerns.' : rival ? club.name + ' supporters are preparing for the fixture against ' + rival.name + '. The local media is building anticipation.' : 'Supporters are discussing the club’s next challenge.';
    persist({ ...ops, supporterMood: clamp(ops.supporterMood + delta) }, { ...club, finances: { ...club.finances, cashBalance: club.finances.cashBalance - cost } }, headline, body);
  };

  return <div className="flex flex-col gap-4">
    <section className="rounded-xl border border-cyan-400/20 bg-[#101923] p-4">
      <div className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">Club operations</div>
      <h3 className="mt-1 text-xl font-black text-white">Build a stronger club off the pitch</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-cyan-300">{Object.keys(staff).length}/8</div><div className="text-[10px] text-slate-400">Staff hired</div></div>
        <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-white">{money(payroll)}</div><div className="text-[10px] text-slate-400">Weekly staff payroll</div></div>
        <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-white">{ops.supporterMood}/100</div><div className="text-[10px] text-slate-400">Supporter mood</div></div>
        <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-white">{position || '—'}</div><div className="text-[10px] text-slate-400">League position</div></div>
      </div>
    </section>

    <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
      <h3 className="text-lg font-black text-white">1. Hire your backroom staff</h3>
      <p className="mb-3 text-xs text-slate-400">Staff have ratings, wages and 40-week contracts. Hiring costs three weeks of wages up front.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ROLES.map(role => {
          const member = staff[role.id];
          const rating = member?.rating ?? clamp(58 + Math.round(club.reputation * .28),55,92);
          const wage = member?.weeklyWage ?? Math.round(role.baseWage * (.72 + rating / 100));
          return <div key={role.id} className="rounded-lg bg-[#0B0F14] p-3">
            <div className="flex items-center justify-between gap-2"><div className="text-sm font-bold text-white">{role.label}</div><span className="text-xs font-black text-cyan-300">{member ? member.rating + ' OVR' : 'Available'}</span></div>
            <p className="mt-1 text-[11px] text-slate-400">{role.benefit}</p>
            {member ? <><div className="mt-2 flex justify-between text-xs text-slate-300"><span>{member.name}</span><span>{money(member.weeklyWage)}/wk · {member.contractWeeks} wks</span></div><button onClick={() => releaseStaff(role.id)} className="mt-2 rounded bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-300">Release staff member</button></>
              : <button disabled={club.finances.cashBalance < wage * 3} onClick={() => hire(role.id)} className="mt-3 min-h-9 w-full rounded bg-cyan-400 px-3 text-xs font-black text-slate-950 disabled:opacity-40">Hire · {money(wage)}/wk + {money(wage*3)} signing</button>}
          </div>;
        })}
      </div>
    </section>

    <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
      <h3 className="text-lg font-black text-white">2. Upgrade club facilities</h3>
      <p className="mb-3 text-xs text-slate-400">Every level improves the related club system. Stadium upgrades add 8% capacity.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {([
          ['training','Training complex','Better training growth and sharpness'],
          ['medical','Medical centre','Faster recovery from injuries'],
          ['academy','Youth academy','Improves youth development opportunities'],
          ['scouting','Scouting department','More accurate talent assessments'],
          ['stadium','Stadium','Increases capacity and matchday income'],
        ] as [keyof ClubOperations['facilities'],string,string][]).map(([key,label,desc]) => {
          const level = facilities[key]; const cost = Math.round((key === 'stadium' ? 1_500_000 : 850_000) * level * (1 + club.reputation/250));
          return <div key={key} className="rounded-lg bg-[#0B0F14] p-3"><div className="flex justify-between gap-2"><span className="text-sm font-bold text-white">{label}</span><span className="text-xs font-black text-cyan-300">LV {level}/5</span></div><p className="mt-1 text-[11px] text-slate-400">{desc}</p><button disabled={level >= 5 || club.finances.cashBalance < cost} onClick={() => upgrade(key)} className="mt-3 min-h-9 w-full rounded bg-white/10 px-3 text-xs font-bold text-white disabled:opacity-40">{level >= 5 ? 'Fully upgraded' : 'Upgrade · ' + money(cost)}</button></div>;
        })}
      </div>
    </section>

    <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
      <h3 className="text-lg font-black text-white">3. Commercial deals & matchday revenue</h3>
      <p className="text-xs text-slate-400">One main sponsor at a time. Deals run for 20 weeks; new negotiations open after expiry.</p>
      <div className="mt-3 rounded-lg bg-[#0B0F14] p-3">
        {ops.sponsor ? <><div className="font-bold text-white">{ops.sponsor.name}</div><div className="mt-1 text-xs text-cyan-300">{money(ops.sponsor.weeklyIncome)}/week · {ops.sponsor.weeksRemaining} weeks remaining</div></>
          : <div className="text-xs text-slate-400">No active main sponsor.</div>}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(['LOCAL','REGIONAL','GLOBAL'] as const).map(tier => <button key={tier} disabled={!!ops.sponsor && ops.sponsor.weeksRemaining > 0} onClick={() => signSponsor(tier)} className="min-h-9 rounded bg-cyan-400 px-2 text-xs font-black text-slate-950 disabled:opacity-40">{tier} sponsor offer</button>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0B0F14] p-3"><div><div className="text-sm font-bold text-white">Ticket price</div><div className="text-xs text-slate-400">Current price: {money(ops.ticketPrice)} · Capacity: {club.stadiumCapacity.toLocaleString()}</div></div><div className="flex gap-2"><button onClick={() => setTicketPrice(-2)} className="rounded bg-white/10 px-3 py-2 text-xs text-white">− €2</button><button onClick={() => setTicketPrice(2)} className="rounded bg-white/10 px-3 py-2 text-xs text-white">+ €2</button></div></div>
    </section>

    <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
      <h3 className="text-lg font-black text-white">4. Boardroom & seasonal objectives</h3>
      <p className="text-xs text-slate-400">The board expects a finish near position {club.targetPosition}. Your current position is {position || 'unranked'}; board confidence is {manager?.boardConfidence ?? '—'}%.</p>
      {ops.boardCommitment ? <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-100">Active commitment: {ops.boardCommitment.type}. Deadline: week {ops.boardCommitment.deadlineWeek}. The board will assess the result automatically.</div> : <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <button onClick={() => boardChoice('YOUTH')} className="rounded-lg bg-[#0B0F14] p-3 text-left text-xs text-white"><b className="block text-cyan-300">Invest in youth</b>Commit to developing academy players.</button>
        <button onClick={() => boardChoice('UNITY')} className="rounded-lg bg-[#0B0F14] p-3 text-left text-xs text-white"><b className="block text-cyan-300">Unite the club</b>Prioritise supporters and dressing-room unity.</button>
        <button onClick={() => boardChoice('RESULTS')} className="rounded-lg bg-[#0B0F14] p-3 text-left text-xs text-white"><b className="block text-cyan-300">Demand results</b>Make an ambitious promise to the board.</button>
      </div>}
    </section>

    <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
      <h3 className="text-lg font-black text-white">5. Supporters, media & rivalries</h3>
      <p className="text-xs text-slate-400">Supporter sentiment: {ops.supporterMood}/100. {rival ? 'Closest reputation rival: ' + rival.name + '.' : 'Your rivalry network is developing.'}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <button disabled={club.finances.cashBalance < 15000} onClick={() => fanEvent('FORUM')} className="rounded-lg bg-[#0B0F14] p-3 text-left text-xs text-white disabled:opacity-40"><b className="block text-cyan-300">Hold fan forum</b>Cost €15K · Improve supporter trust.</button>
        <button disabled={club.finances.cashBalance < 90000} onClick={() => fanEvent('COMMUNITY')} className="rounded-lg bg-[#0B0F14] p-3 text-left text-xs text-white disabled:opacity-40"><b className="block text-cyan-300">Community open day</b>Cost €90K · Stronger community support.</button>
        <button onClick={() => fanEvent('DERBY')} className="rounded-lg bg-[#0B0F14] p-3 text-left text-xs text-white"><b className="block text-amber-300">Rivalry week</b>Build anticipation around your closest rival.</button>
      </div>
    </section>
  </div>;
};
