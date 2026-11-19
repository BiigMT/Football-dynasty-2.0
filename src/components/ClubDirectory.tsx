import React, { useMemo, useState } from 'react';
import { ArrowLeft, Building2, Users, MapPin, Trophy } from 'lucide-react';
import type { CareerSave, Club } from '../types/football';
import { ClubBadge, CountryFlag } from './ClubBadge';
import { PlayerPortrait } from './PlayerPortrait';

interface Props { save: CareerSave; onClose: () => void; }

export const ClubDirectory: React.FC<Props> = ({ save, onClose }) => {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const clubs = useMemo(() => Object.values(save.clubs)
    .filter((club) => club.name.toLowerCase().includes(query.toLowerCase()) || club.country.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)), [save.clubs, query]);
  const selected = selectedClubId ? save.clubs[selectedClubId] : undefined;

  if (selected) {
    const squad = Object.values(save.players).filter((player) => player.clubId === selected.id)
      .sort((a, b) => b.overall - a.overall);
    const league = save.leagues[selected.leagueId];
    const aiManager = save.worldState?.managersByClub[selected.id];
    const userManager = save.mode === 'MANAGER' && save.userClubId === selected.id ? save.manager : undefined;
    const manager = userManager ?? aiManager;
    return <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#07111B] text-white">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <button onClick={() => setSelectedClubId(null)} className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-bold"><ArrowLeft size={16}/> All Clubs</button>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101C2A]">
          <div className="relative flex flex-wrap items-center gap-4 border-b border-white/10 p-5 sm:p-7" style={{background: `linear-gradient(110deg, ${selected.primaryColor}44, #101C2A 65%)`}}>
            <ClubBadge shortName={selected.shortName} clubId={selected.id} clubName={selected.name} primaryColor={selected.primaryColor} secondaryColor={selected.secondaryColor} country={selected.country} size={76}/>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-cyan-300"><CountryFlag country={selected.country} size={16}/> Club Profile</div><h1 className="mt-1 text-2xl font-black sm:text-3xl">{selected.name}</h1><p className="mt-1 text-sm text-slate-300">{selected.country} · {league?.name ?? 'Independent club'} · Reputation {selected.reputation}/100</p></div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center"><div className="text-[10px] font-bold tracking-widest text-slate-400">SQUAD SIZE</div><div className="text-2xl font-black">{squad.length}</div></div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            <div className="rounded-xl bg-[#0A1420] p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><Users size={15}/> Head Coach</div><div className="mt-2 text-lg font-black">{manager?.name ?? 'Manager information unavailable'}</div><div className="mt-1 text-xs text-slate-400">{manager ? ('philosophy' in manager ? manager.philosophy : manager.philosophy) : 'No manager profile recorded'}{manager && 'reputation' in manager ? ` · Reputation ${manager.reputation}` : ''}</div>{aiManager && <div className="mt-2 text-xs text-slate-400">Tenure: {aiManager.weeksAtClub} weeks · Record: {aiManager.wins}W {aiManager.draws}D {aiManager.losses}L · Board confidence {aiManager.confidence}%</div>}{userManager && <div className="mt-2 text-xs text-slate-400">Your managerial record: {userManager.wins}W {userManager.draws}D {userManager.losses}L · Board confidence {userManager.boardConfidence}%</div>}</div>
            <div className="rounded-xl bg-[#0A1420] p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><Building2 size={15}/> Stadium</div><div className="mt-2 text-lg font-black">{selected.stadiumName}</div><div className="mt-1 text-xs text-slate-400">Capacity {selected.stadiumCapacity.toLocaleString()}</div><div className="mt-2 text-xs text-slate-400">Home matchday income €{selected.finances.matchdayIncomePerHomeGame.toLocaleString()}</div></div>
            <div className="rounded-xl bg-[#0A1420] p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><Trophy size={15}/> Club Identity</div><div className="mt-2 text-sm font-bold">{selected.boardExpectation}</div><div className="mt-2 text-xs text-slate-400">Target league position: {selected.targetPosition} · Chemistry: {selected.chemistry}%</div><div className="mt-2 text-xs text-slate-400">Formation: {selected.tactics.formation} · {selected.tactics.mentality.toLowerCase()}</div></div>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-[1fr_300px] sm:p-5">
            <div className="min-w-0"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">First Team Squad</h2><span className="text-xs text-slate-400">{squad.length} players</span></div>
              <div className="grid gap-2 sm:grid-cols-2">{squad.map((player) => <div key={player.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#0A1420] p-2.5"><PlayerPortrait appearance={player.appearance} playerId={player.id} playerName={player.name} jerseyPrimary={selected.primaryColor} jerseySecondary={selected.secondaryColor} size={46}/><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{player.name}</div><div className="text-[11px] text-slate-400">{player.position} · Age {player.age} · {player.nationality}</div><div className="text-[11px] text-cyan-300">OVR {player.overall} · POT {player.potential}</div></div><div className="text-right"><div className="text-sm font-black">{player.shirtNumber}</div><div className="text-[10px] text-slate-500">#{player.shirtNumber}</div></div></div>)}</div>
              {squad.length === 0 && <div className="rounded-xl bg-[#0A1420] p-5 text-sm text-slate-400">No registered players are currently listed for this club.</div>}
            </div>
            <aside className="flex flex-col gap-3"><div className="rounded-xl bg-[#0A1420] p-4"><h3 className="text-sm font-black">Club Finances</h3><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between gap-2"><span className="text-slate-400">Transfer budget</span><b>€{(selected.finances.transferBudget / 1e6).toFixed(2)}M</b></div><div className="flex justify-between gap-2"><span className="text-slate-400">Cash balance</span><b>€{(selected.finances.cashBalance / 1e6).toFixed(2)}M</b></div><div className="flex justify-between gap-2"><span className="text-slate-400">Weekly wage bill</span><b>€{selected.finances.weeklyWageBill.toLocaleString()}</b></div></div></div><div className="rounded-xl bg-[#0A1420] p-4"><h3 className="text-sm font-black">Tactical Identity</h3><div className="mt-3 space-y-2 text-xs text-slate-300"><div className="flex justify-between"><span className="text-slate-400">Formation</span><b>{selected.tactics.formation}</b></div><div className="flex justify-between"><span className="text-slate-400">Pressing</span><b>{selected.tactics.pressing.replace('_',' ')}</b></div><div className="flex justify-between"><span className="text-slate-400">Passing</span><b>{selected.tactics.passing.replace('_',' ')}</b></div><div className="flex justify-between"><span className="text-slate-400">Tempo</span><b>{selected.tactics.tempo}/100</b></div></div></div></aside>
          </div>
        </section>
      </div>
    </div>;
  }

  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#07111B] text-white"><div className="mx-auto max-w-6xl p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[.25em] text-cyan-300">Football Dynasty · Global Database</div><h1 className="mt-1 text-2xl font-black">Club Directory</h1><p className="mt-1 text-xs text-slate-400">Select any club to inspect its squad, manager, stadium and finances.</p></div><button onClick={onClose} className="min-h-10 rounded-lg border border-white/15 bg-white/5 px-4 text-xs font-bold">Close</button></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clubs or countries..." className="my-4 min-h-11 w-full rounded-lg border border-white/15 bg-[#101C2A] px-4 text-sm outline-none focus:border-cyan-400"/><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{clubs.map((club: Club) => <button key={club.id} onClick={() => setSelectedClubId(club.id)} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#101C2A] p-3 text-left transition hover:border-cyan-400/70 hover:bg-[#142538]"><ClubBadge shortName={club.shortName} clubId={club.id} clubName={club.name} primaryColor={club.primaryColor} secondaryColor={club.secondaryColor} country={club.country} size={44}/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{club.name}</span><span className="mt-0.5 block truncate text-[11px] text-slate-400">{club.country} · {save.leagues[club.leagueId]?.name ?? 'Club'}</span></span><span className="text-cyan-300">›</span></button>)}</div></div></div>;
};
