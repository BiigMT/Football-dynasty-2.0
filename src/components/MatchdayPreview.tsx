import React, { useMemo, useState } from 'react';
import { ArrowLeft, CloudRain, Play, Sun } from 'lucide-react';
import { Club, Fixture, Player } from '../types/football';
import { ClubBadge, KitPreview } from './ClubBadge';
import { RealisticAvatar } from './RealisticAvatar';

interface Props {
 fixture: Fixture; clubs: Record<string,Club>; players: Record<string,Player>;
 onKickoff:()=>void; onBack:()=>void;
}
const formColors:Record<string,string>={W:'bg-emerald-500',D:'bg-slate-500',L:'bg-rose-500'};
export const MatchdayPreview:React.FC<Props>=({fixture,clubs,players,onKickoff,onBack})=>{
 const home=clubs[fixture.homeClubId],away=clubs[fixture.awayClubId];
 const [homeKit,setHomeKit]=useState(0),[awayKit,setAwayKit]=useState(0);
 const kits=[['HOME','AWAY','THIRD'],['HOME','AWAY','THIRD']];
 const homeXI=home?.tactics.startingXI??[],awayXI=away?.tactics.startingXI??[];
 const stars=(ids:string[])=>ids.map(id=>players[id]).filter(Boolean).sort((a,b)=>b.overall-a.overall);
 const homeStar=stars(homeXI)[0],awayStar=stars(awayXI)[0];
 const avg=(ids:string[])=>{const list=ids.map(id=>players[id]).filter(Boolean);return list.length?Math.round(list.reduce((s,p)=>s+p.overall,0)/list.length):0};
 const [formSeed]=useState(()=>fixture.id.length);
 const form=useMemo(()=>Array.from({length:5},(_,i)=>['W','W','D','L','W'][(i+formSeed)%5]),[formSeed]);
 if(!home||!away)return <div className="min-h-dvh bg-[#07111f] text-white p-6">Match data unavailable. <button onClick={onBack}>Go back</button></div>;
 const spotlight=(p:Player|undefined,c:Club)=>p?<div className="flex items-center gap-3 min-w-0"><RealisticAvatar seed={p.id} name={p.name} size={76} primaryColor={c.primaryColor} secondaryColor={c.secondaryColor} shirtNumber={p.shirtNumber}/><div className="min-w-0"><div className="text-[9px] tracking-[.2em] text-[#F6C21C]">PLAYER TO WATCH</div><div className="font-black text-base truncate">{p.name}</div><div className="text-[10px] text-slate-400">{p.position} · OVR {p.overall}</div><div className="text-[10px] text-slate-300">{p.seasonStats.goals} G · {p.seasonStats.assists} A · {p.seasonStats.averageRating.toFixed(1)} AVG</div></div></div>:<div className="text-xs text-slate-500">Line-up pending</div>;
 return <div className="min-h-dvh w-full bg-[#07111f] text-[#E8EDF5] flex flex-col overflow-hidden" style={{paddingTop:'env(safe-area-inset-top)',paddingBottom:'env(safe-area-inset-bottom)'}}>
  <header className="shrink-0 px-4 py-3 bg-[#0D1B2A] border-b border-[#235BA8]/50 flex items-center justify-between"><button onClick={onBack} className="p-2 bg-white/5 rounded"><ArrowLeft size={18}/></button><div className="text-center"><div className="text-[9px] tracking-[.3em] text-[#F6C21C]">MATCHDAY · BROADCAST PRESENTATION</div><div className="font-black text-sm sm:text-lg">{fixture.competitionName.toUpperCase()}</div></div><div className="text-right text-[9px] text-slate-400">SEASON FIXTURE<br/>WEEK {fixture.week}</div></header>
  <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5"><div className="max-w-5xl mx-auto space-y-4">
   <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#13386C] via-[#0D1B2A] to-[#13386C] p-4 sm:p-6"><div className="text-center text-[9px] tracking-[.25em] text-slate-300 mb-4">{home.stadiumName} · KICK-OFF TO BE CONFIRMED · PITCH: {fixture.week%2?'GOOD':'EXCELLENT'}</div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6"><div className="flex flex-col items-center gap-2"><ClubBadge shortName={home.shortName} primaryColor={home.primaryColor} secondaryColor={home.secondaryColor} size={72}/><div className="font-black text-center text-sm sm:text-xl">{home.name}</div><div className="text-[10px] text-slate-300">TEAM OVR {avg(homeXI)}</div></div><div className="text-2xl sm:text-4xl font-black italic text-[#F6C21C]">VS</div><div className="flex flex-col items-center gap-2"><ClubBadge shortName={away.shortName} primaryColor={away.primaryColor} secondaryColor={away.secondaryColor} size={72}/><div className="font-black text-center text-sm sm:text-xl">{away.name}</div><div className="text-[10px] text-slate-300">TEAM OVR {avg(awayXI)}</div></div></div></div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><section className="rounded-xl bg-[#0D1B2A] border border-white/10 p-3"><div className="text-[9px] tracking-widest text-slate-500 mb-2">HOME KEY PLAYER</div>{spotlight(homeStar,home)}</section><section className="rounded-xl bg-[#0D1B2A] border border-white/10 p-3"><div className="text-[9px] tracking-widest text-slate-500 mb-2">AWAY KEY PLAYER</div>{spotlight(awayStar,away)}</section></div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><section className="rounded-xl bg-[#0D1B2A] border border-white/10 p-3"><div className="font-bold text-xs mb-3">HOME KIT</div><div className="flex gap-2">{kits[0].map((k,i)=><button key={k} onClick={()=>setHomeKit(i)} className={`flex-1 p-2 rounded border ${homeKit===i?'border-[#F6C21C] bg-[#F6C21C]/10':'border-white/10'}`}><KitPreview primaryColor={i===1?home.secondaryColor:home.primaryColor} secondaryColor={i===2?'#F6C21C':home.secondaryColor} size={40}/><div className="text-[9px] mt-1">{k}</div></button>)}</div></section><section className="rounded-xl bg-[#0D1B2A] border border-white/10 p-3"><div className="font-bold text-xs mb-3">AWAY KIT</div><div className="flex gap-2">{kits[1].map((k,i)=><button key={k} onClick={()=>setAwayKit(i)} className={`flex-1 p-2 rounded border ${awayKit===i?'border-[#F6C21C] bg-[#F6C21C]/10':'border-white/10'}`}><KitPreview primaryColor={i===1?away.secondaryColor:away.primaryColor} secondaryColor={i===2?'#F6C21C':away.secondaryColor} size={40}/><div className="text-[9px] mt-1">{k}</div></button>)}</div></section></div>
   <div className="rounded-xl bg-[#0D1B2A] border border-white/10 p-3 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[9px] tracking-widest text-slate-500 mb-2">RECENT FORM · ILLUSTRATIVE PLACEHOLDER</div><div className="flex gap-1">{form.map((f,i)=><span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${formColors[f]}`}>{f}</span>)}</div></div><div className="text-xs text-slate-400">{home.tactics.formation} <span className="text-[#F6C21C] mx-2">vs</span> {away.tactics.formation}</div></div>
  </div></main>
  <footer className="shrink-0 p-3 bg-[#0D1B2A] border-t border-white/10 flex justify-center"><button onClick={onKickoff} className="w-full max-w-xl min-h-[52px] rounded-lg bg-[#F6C21C] text-[#111827] font-black tracking-[.18em] shadow-[0_0_24px_rgba(246,194,28,.22)] flex items-center justify-center gap-2"><Play size={18} fill="currentColor"/> KICK OFF MATCH</button></footer>
 </div>;
};
