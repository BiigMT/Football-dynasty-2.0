import React from 'react';
import { CareerSave } from '../types/football';
import { CAREER_PYRAMID, getCareerTier } from '../engine/careerPyramid';

interface Props { save: CareerSave; onClose: () => void; }
export const CareerPyramidPanel: React.FC<Props> = ({ save, onClose }) => {
  const club = save.clubs[save.userClubId];
  const currentTier = getCareerTier(club);
  const base = club?.leagueId.replace(/_tier_[1-4]$/, '') ?? '';
  const divisions = Object.values(save.leagues)
    .filter((league) => league.id.startsWith(base + '_tier_'))
    .sort((a, b) => a.tier - b.tier);
  const sorted = (league: typeof divisions[number]) => [...league.standings].sort((a, b) =>
    b.points - a.points ||
    (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
    b.goalsFor - a.goalsFor
  );
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#07111d] p-3 text-white sm:p-6" style={{paddingTop:'max(16px, env(safe-area-inset-top))',paddingBottom:'max(16px, env(safe-area-inset-bottom))'}}>
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between gap-3 border-b border-amber-300/20 pb-4">
        <div><div className="text-[10px] font-black tracking-[.28em] text-amber-300">FOOTBALL DYNASTY · PLAYER CAREER</div><h1 className="mt-1 text-2xl font-black sm:text-3xl">THE FOUR-TIER PYRAMID</h1><p className="mt-1 text-xs text-slate-400">{club?.name} · {divisions[0]?.country ?? 'Regional'} pathway</p></div>
        <button onClick={onClose} className="min-h-10 rounded border border-white/20 px-4 text-xs font-bold">CLOSE ✕</button>
      </header>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CAREER_PYRAMID.map((tier) => <div key={tier.tier} className={'rounded-xl border p-3 '+(currentTier===tier.tier?'border-amber-300 bg-[#17314a]':'border-white/10 bg-[#101c2a]')}>
          <div className="text-[10px] font-black tracking-widest text-amber-300">TIER {tier.tier}</div><div className="mt-1 text-xs font-black">{tier.name.split('·')[1]}</div><p className="mt-1 text-[10px] leading-relaxed text-slate-400">{tier.description}</p>{currentTier===tier.tier&&<div className="mt-2 text-[9px] font-black text-emerald-300">YOUR CURRENT DIVISION</div>}
        </div>)}
      </div>
      <div className="mt-5 space-y-3">
        {divisions.map((league) => <section key={league.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#101b29]">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3"><div><div className="text-sm font-black">{league.name}</div><div className="text-[10px] text-slate-400">{league.clubIds.length} clubs · {league.fixtures.length} scheduled fixtures</div></div><span className={'rounded px-2 py-1 text-[9px] font-black '+(league.tier===currentTier?'bg-amber-300 text-slate-950':'bg-white/10 text-slate-300')}>{league.tier===1?'PROMOTION TARGET':league.tier===4?'DEVELOPMENT':'DIVISION '+league.tier}</span></div>
          <div className="grid grid-cols-[28px_minmax(0,1fr)_32px_32px_32px_38px] gap-2 bg-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-500"><span>#</span><span>Club</span><span className="text-right">P</span><span className="text-right">W</span><span className="text-right">GD</span><span className="text-right">PTS</span></div>
          {sorted(league).map((row,index)=>{const team=save.clubs[row.clubId];return <div key={row.clubId} className={'grid grid-cols-[28px_minmax(0,1fr)_32px_32px_32px_38px] items-center gap-2 border-t border-white/5 px-3 py-2 text-xs '+(row.clubId===club?.id?'bg-[#235BA8]/30 font-black':'')}>
            <span className={index===0&&league.tier>1?'text-emerald-300':index===league.clubIds.length-1&&league.tier<4?'text-rose-300':'text-slate-500'}>{index+1}</span><span className="truncate">{team?.name??row.clubId}{row.clubId===club?.id?' · YOU':''}</span><span className="text-right tabular-nums">{row.played}</span><span className="text-right tabular-nums">{row.won}</span><span className="text-right tabular-nums">{row.goalsFor-row.goalsAgainst}</span><b className="text-right tabular-nums text-amber-300">{row.points}</b>
          </div>})}
          <div className="border-t border-white/10 px-3 py-2 text-[9px] text-slate-500"><span className="text-emerald-300">Green = promotion place</span> · <span className="text-rose-300">Red = relegation place</span> · 1 club moves each way between neighbouring tiers at season end.</div>
        </section>)}
      </div>
    </div>
  </div>;
};
export default CareerPyramidPanel;
