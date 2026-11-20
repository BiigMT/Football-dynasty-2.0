import React, { useMemo, useState } from 'react';
import { ArrowLeft, CloudRain, Home, Mail, Search, Settings, Shield, Sun, Users, Trophy, Globe2, Play } from 'lucide-react';
import { Club, Fixture, Player } from '../types/football';
import { ClubBadge, KitPreview } from './ClubBadge';
import { RealisticAvatar } from './RealisticAvatar';

interface Props {
  fixture: Fixture;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  onKickoff: () => void;
  onBack: () => void;
}
const formColors: Record<string, string> = { W: 'bg-emerald-500', D: 'bg-slate-500', L: 'bg-rose-500' };

export const MatchdayPreview: React.FC<Props> = ({ fixture, clubs, players, onKickoff, onBack }) => {
  const home = clubs[fixture.homeClubId], away = clubs[fixture.awayClubId];
  const [homeKit, setHomeKit] = useState(0), [awayKit, setAwayKit] = useState(0);
  const kits = [['HOME', 'AWAY', 'THIRD'], ['HOME', 'AWAY', 'THIRD']];
  const homeXI = home?.tactics.startingXI ?? [], awayXI = away?.tactics.startingXI ?? [];
  const stars = (ids: string[]) => ids.map(id => players[id]).filter(Boolean).sort((a, b) => b.overall - a.overall);
  const homeStar = stars(homeXI)[0], awayStar = stars(awayXI)[0];
  const avg = (ids: string[]) => {
    const list = ids.map(id => players[id]).filter(Boolean);
    return list.length ? Math.round(list.reduce((s, p) => s + p.overall, 0) / list.length) : 0;
  };
  const [formSeed] = useState(() => fixture.id.length);
  const form = useMemo(() => Array.from({ length: 5 }, (_, i) => ['W', 'W', 'D', 'L', 'W'][(i + formSeed) % 5]), [formSeed]);
  const awayLineup = awayXI.map(id => players[id]).filter(Boolean);
  const lineupRows = useMemo(() => {
    const groups = [
      { label: 'GK', test: (p: Player) => /GK|GOALKEEPER/i.test(String(p.position)) },
      { label: 'DEF', test: (p: Player) => /CB|LB|RB|WB|DEF/i.test(String(p.position)) },
      { label: 'MID', test: (p: Player) => /DM|CM|AM|MID/i.test(String(p.position)) },
      { label: 'ATT', test: (p: Player) => /LW|RW|ST|CF|FW|ATT/i.test(String(p.position)) },
    ];
    const assigned = new Set<string>();
    const rows = groups.map(group => ({
      label: group.label,
      players: awayLineup.filter(p => !assigned.has(p.id) && group.test(p)).map(p => { assigned.add(p.id); return p; }),
    })).filter(row => row.players.length);
    const remaining = awayLineup.filter(p => !assigned.has(p.id));
    if (remaining.length) rows.splice(2, 0, { label: 'LINE-UP', players: remaining });
    return rows;
  }, [awayLineup.map(p => p.id).join('|'), away?.tactics.formation]);
  if (!home || !away) return <div className="min-h-dvh bg-[#07111f] text-white p-6">Match data unavailable. <button onClick={onBack}>Go back</button></div>;
  const spotlight = (p: Player | undefined, c: Club) => p ? (
    <div className="flex items-center gap-3 min-w-0">
      <RealisticAvatar seed={p.id} name={p.name} size={58} primaryColor={c.primaryColor} secondaryColor={c.secondaryColor} shirtNumber={p.shirtNumber}/>
      <div className="min-w-0"><div className="text-[9px] tracking-[.16em] text-[#F6C21C]">PLAYER TO WATCH</div><div className="font-black text-sm truncate">{p.name}</div><div className="text-[10px] text-slate-400">{p.position} · OVR {p.overall}</div><div className="text-[10px] text-slate-300">{p.seasonStats.goals} G · {p.seasonStats.assists} A · {p.seasonStats.averageRating.toFixed(1)} AVG</div></div>
    </div>
  ) : <div className="text-xs text-slate-500">Line-up pending</div>;

  return (
    <div className="fd-matchhub fixed inset-0 z-[90] flex overflow-hidden bg-[#090d18] text-[#f0f2fa]" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <aside className="flex w-[58px] shrink-0 flex-col items-center gap-2 border-r border-white/10 bg-[#101322] py-2 sm:w-[72px] sm:py-3">
        <button onClick={onBack} aria-label="Back to career" className="grid h-10 w-10 place-items-center rounded-md text-slate-300 hover:bg-white/10"><ArrowLeft size={23}/></button>
        <div className="my-1 h-px w-8 bg-white/10"/>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-fuchsia-600 text-white"><Home size={21}/></div>
        <div className="grid h-10 w-10 place-items-center rounded-md text-slate-400"><Mail size={21}/></div>
        <div className="grid h-10 w-10 place-items-center rounded-md text-slate-400"><Shield size={21}/></div>
        <div className="grid h-10 w-10 place-items-center rounded-md text-slate-400"><Users size={21}/></div>
        <div className="grid h-10 w-10 place-items-center rounded-md text-slate-400"><Globe2 size={21}/></div>
        <div className="mt-auto grid h-10 w-10 place-items-center rounded-md text-slate-400"><Settings size={21}/></div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#111322] px-3 sm:h-[68px] sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <ClubBadge shortName={home.shortName} clubId={home.id} clubName={home.name} primaryColor={home.primaryColor} secondaryColor={home.secondaryColor} size={38}/>
            <div className="min-w-0"><div className="truncate text-sm font-black sm:text-base">{home.name}</div><div className="truncate text-[10px] text-slate-400 sm:text-xs">Pre-Match Hub</div></div>
          </div>
          <div className="hidden items-center gap-2 text-slate-500 sm:flex"><span>▪</span><span className="text-white">▪</span><span>▪</span></div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-md bg-[#202235] px-3 py-2 text-center text-[9px] font-bold leading-tight sm:block">SEASON<br/>WEEK {fixture.week}</div>
            <button onClick={onKickoff} className="min-h-[42px] rounded-md bg-[#9b5cf6] px-4 text-xs font-black tracking-wider text-white shadow-lg hover:bg-[#ad75ff] sm:min-w-[170px] sm:text-sm">CONTINUE</button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="grid min-h-full grid-cols-1 gap-2.5 lg:grid-cols-[1.08fr_.92fr]">
            <div className="flex min-h-0 flex-col gap-2.5">
              <section className="overflow-hidden border border-[#45445f] bg-[#1c1d30]">
                <div className="border-b border-white/10 px-3 py-2 text-center text-xs font-black tracking-wider sm:text-sm">{fixture.competitionName.toUpperCase()}</div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3 sm:px-5 sm:py-4">
                  <div className="flex min-w-0 flex-col items-center gap-1.5"><ClubBadge shortName={home.shortName} clubId={home.id} clubName={home.name} primaryColor={home.primaryColor} secondaryColor={home.secondaryColor} size={54}/><div className="max-w-full truncate text-center text-xs font-black sm:text-sm">{home.name}</div><div className="text-[9px] text-slate-400">TEAM OVR {avg(homeXI)}</div></div>
                  <div className="text-center"><div className="text-xl font-black text-[#c18bff] sm:text-3xl">VS</div><div className="text-[8px] font-bold tracking-widest text-slate-500">MATCHDAY</div></div>
                  <div className="flex min-w-0 flex-col items-center gap-1.5"><ClubBadge shortName={away.shortName} clubId={away.id} clubName={away.name} primaryColor={away.primaryColor} secondaryColor={away.secondaryColor} size={54}/><div className="max-w-full truncate text-center text-xs font-black sm:text-sm">{away.name}</div><div className="text-[9px] text-slate-400">TEAM OVR {avg(awayXI)}</div></div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[9px] text-slate-400"><span>{home.stadiumName}</span><span>WEEK {fixture.week} · PITCH {fixture.week % 2 ? 'GOOD' : 'EXCELLENT'}</span></div>
              </section>

              <section className="flex-1 border border-[#45445f] bg-[#1c1d30] p-3">
                <div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-black tracking-wider">TEAM NEWS & KEY PLAYERS</h2><span className="text-[9px] text-slate-500">MATCH PREVIEW</span></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><div className="mb-2 text-[9px] font-bold text-slate-500">HOME KEY PLAYER</div>{spotlight(homeStar, home)}</div><div><div className="mb-2 text-[9px] font-bold text-slate-500">AWAY KEY PLAYER</div>{spotlight(awayStar, away)}</div></div>
              </section>

              <section className="border border-[#45445f] bg-[#1c1d30] p-3">
                <div className="mb-2 text-[10px] font-black tracking-wider">RECENT FORM <span className="font-normal text-slate-500">· ILLUSTRATIVE PLACEHOLDER</span></div>
                <div className="flex items-center justify-between gap-3"><div className="flex gap-1">{form.map((f, i) => <span key={i} className={`grid h-6 w-6 place-items-center rounded-sm text-[9px] font-black ${formColors[f]}`}>{f}</span>)}</div><div className="text-right text-[10px] text-slate-300">{home.tactics.formation} <span className="px-1 text-[#c18bff]">vs</span> {away.tactics.formation}</div></div>
              </section>
            </div>

            <div className="flex min-h-0 flex-col gap-2.5">
              <section className="border border-[#45445f] bg-[#1c1d30] p-3">
                <div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-black tracking-wider">{away.name.toUpperCase()}</h2><span className="text-[9px] text-slate-500">OPPOSITION ANALYSIS</span></div>
                <div className="grid grid-cols-[1fr_1.1fr] gap-3">
                  <div className="space-y-2 text-[10px]"><div><div className="text-[9px] text-slate-500">STYLE</div><b>{away.tactics.formation}</b></div><div><div className="text-[9px] text-slate-500">MENTALITY</div><b>{away.tactics.mentality}</b></div><div><div className="text-[9px] text-slate-500">PRESSING</div><b>{away.tactics.pressing}</b></div><div><div className="text-[9px] text-slate-500">PASSING</div><b>{away.tactics.passing}</b></div></div>
                  <div className="relative min-h-[155px] overflow-hidden border border-white/15 bg-gradient-to-b from-[#31415c] to-[#1d3440] p-2">
                    <div className="pointer-events-none absolute inset-2 border border-white/30"/><div className="pointer-events-none absolute left-1/2 top-2 bottom-2 border-l border-white/25"/><div className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"/>
                    <div className="relative flex h-full min-h-[140px] flex-col justify-around gap-1">
                      {lineupRows.map(row => <div key={row.label} className="flex items-center justify-center gap-1"><span className="sr-only">{row.label}</span>{row.players.map(p => <div key={p.id} className="min-w-0 rounded-sm bg-[#7144b7] px-1 py-0.5 text-center text-[8px] font-bold text-white shadow" title={p.name}>{p.shirtNumber || p.name.split(' ').map(s => s[0]).join('').slice(0, 3)}</div>)}</div>)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-slate-400">Starting formation · {away.tactics.formation} · {awayLineup.length} selected</div>
              </section>

              <section className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="border border-[#45445f] bg-[#1c1d30] p-3"><div className="mb-2 text-[10px] font-black tracking-wider">HOME KIT</div><div className="flex gap-1">{kits[0].map((k, i) => <button key={k} onClick={() => setHomeKit(i)} className={`flex-1 rounded border p-1.5 ${homeKit === i ? 'border-[#a76bff] bg-[#a76bff]/15' : 'border-white/10'}`}><KitPreview primaryColor={i === 1 ? home.secondaryColor : home.primaryColor} secondaryColor={i === 2 ? '#c18bff' : home.secondaryColor} size={34}/><div className="mt-1 text-[8px]">{k}</div></button>)}</div></div>
                <div className="border border-[#45445f] bg-[#1c1d30] p-3"><div className="mb-2 text-[10px] font-black tracking-wider">AWAY KIT</div><div className="flex gap-1">{kits[1].map((k, i) => <button key={k} onClick={() => setAwayKit(i)} className={`flex-1 rounded border p-1.5 ${awayKit === i ? 'border-[#a76bff] bg-[#a76bff]/15' : 'border-white/10'}`}><KitPreview primaryColor={i === 1 ? away.secondaryColor : away.primaryColor} secondaryColor={i === 2 ? '#c18bff' : away.secondaryColor} size={34}/><div className="mt-1 text-[8px]">{k}</div></button>)}</div></div>
              </section>
              <section className="border border-[#45445f] bg-[#1c1d30] p-3 text-center text-[11px] leading-relaxed text-slate-300">“{home.name} {avg(homeXI) >= avg(awayXI) ? 'will look to control' : 'face a difficult test against'} {away.name} in the {fixture.competitionName} encounter.”</section>
            </div>
          </div>
        </main>

        <footer className="flex min-h-[54px] shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#111322] px-3 py-2 sm:px-5">
          <div className="hidden text-[10px] text-slate-400 sm:block">Review the opposition and line-ups before kickoff.</div>
          <button onClick={onKickoff} className="ml-auto flex min-h-[42px] min-w-[190px] items-center justify-center gap-2 rounded-md bg-[#9b5cf6] px-6 text-xs font-black tracking-[.16em] text-white shadow-[0_4px_16px_rgba(155,92,246,.3)] hover:bg-[#ad75ff] sm:min-h-[46px] sm:min-w-[230px] sm:text-sm"><Play size={16} fill="currentColor"/> CONTINUE TO MATCH</button>
        </footer>
      </div>
    </div>
  );
};
