import React, { useMemo, useState } from 'react';
import { Club, MatchSession, Player } from '../types/football';
import RealisticAvatar from './RealisticAvatar';

interface Props { session:MatchSession; homeClub:Club; awayClub:Club; players:Record<string,Player>; onContinue:()=>void; onReport?:()=>void; onReplay?:()=>void; boardTrustDelta?:number; xpGained?:number; }
const ratingTone=(v:number)=>v>=8?'text-emerald-300 bg-emerald-400/15 border-emerald-300/30':v>=7?'text-cyan-200 bg-cyan-400/15 border-cyan-300/25':v>=6?'text-amber-200 bg-amber-400/15 border-amber-300/25':'text-rose-200 bg-rose-400/15 border-rose-300/25';
const short=(name:string)=>name.trim().split(/\s+/).slice(-1)[0];
export const PostMatchBroadcast:React.FC<Props>=({session,homeClub,awayClub,players,onContinue,onReport,onReplay,boardTrustDelta,xpGained})=>{
 const [momentsOpen,setMomentsOpen]=useState(false);
 const ratings=useMemo(()=>Object.values(session.playerStates).filter(s=>s.clubId===session.homeClubId||s.clubId===session.awayClubId).sort((a,b)=>b.rating-a.rating),[session.playerStates,session.homeClubId,session.awayClubId]);
 const motm=ratings[0];const motmPlayer=motm?players[motm.playerId]:undefined;const motmClub=motm?.side==='AWAY'?awayClub:homeClub;
 const scorers=session.events.filter(e=>e.type==='GOAL');
 const goals=(side:'HOME'|'AWAY')=>scorers.filter(e=>e.teamSide===side).map(e=>`${short(e.playerName??'Scorer')} ${e.minute}'`).join(' · ')||'—';
 const statRows:{label:string;a:number;b:number;max:number;suffix?:string;subA?:number;subB?:number}[]=[{label:'EXPECTED GOALS',a:session.homeStats.xG,b:session.awayStats.xG,max:Math.max(session.homeStats.xG,session.awayStats.xG,1)},{label:'POSSESSION',a:session.homeStats.possession,b:session.awayStats.possession,max:100,suffix:'%'},{label:'SHOTS (ON TARGET)',a:session.homeStats.shots,b:session.awayStats.shots,max:Math.max(session.homeStats.shots,session.awayStats.shots,1),subA:session.homeStats.shotsOnTarget,subB:session.awayStats.shotsOnTarget},{label:'TACKLES',a:session.homeStats.tackles,b:session.awayStats.tackles,max:Math.max(session.homeStats.tackles,session.awayStats.tackles,1)}];
 const homeRows=ratings.filter(s=>s.side==='HOME'),awayRows=ratings.filter(s=>s.side==='AWAY');
 const teamRows=(rows:typeof ratings)=>rows.slice(0,11);
 const timeline=Array.from({length:11},(_,i)=>{const m=i*9;const ev=session.events.filter(e=>Math.abs(e.minute-m)<5);return {m,ev};});
 const RatingList=({rows}:{rows:typeof ratings})=><div className="space-y-1">{teamRows(rows).map(st=>{const p=players[st.playerId];if(!p)return null;return <div key={st.playerId} className="grid grid-cols-[20px_minmax(0,1fr)_28px_36px] items-center gap-1 rounded-md bg-white/[.035] px-1.5 py-1"><span className="text-[9px] font-black text-slate-500">{p.shirtNumber}</span><span className="truncate text-[10px] font-semibold text-slate-200">{short(p.name)}</span><span className={`text-[10px] font-black ${st.rating>=7.5?'text-emerald-300':st.rating>=6.5?'text-cyan-300':'text-amber-300'}`}>{st.rating>=7.5?'↑':st.rating>=6.5?'→':'↓'}</span><span className={`rounded border px-1 py-0.5 text-center font-mono text-[10px] font-black ${ratingTone(st.rating)}`}>{st.rating.toFixed(1)}</span></div>;})}</div>;
 return <main className="fixed inset-0 grid h-[100dvh] w-screen place-items-center overflow-hidden bg-black text-white"><div className="flex h-[min(100dvh,56.25vw)] w-[min(100vw,177.78dvh)] flex-col overflow-hidden bg-[#080e1a]" style={{aspectRatio:'16 / 9'}}>
  <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#111c33]/95 px-4">
   <div className="min-w-0"><div className="truncate text-[9px] font-black uppercase tracking-[.2em] text-cyan-300">{session.competitionName} · FULL TIME</div><div className="text-[9px] text-slate-500">FINAL MATCH REPORT</div></div>
   <div className="flex items-center gap-3"><div className="text-right"><div className="text-xs font-bold">{homeClub.name}</div><div className="text-[9px] text-slate-500">{goals('HOME')}</div></div><b className="rounded-lg border border-white/10 bg-black/25 px-4 py-1 font-mono text-2xl tabular-nums">{session.homeStats.goals} – {session.awayStats.goals}</b><div><div className="text-xs font-bold">{awayClub.name}</div><div className="text-[9px] text-slate-500">{goals('AWAY')}</div></div></div>
   <div className="flex gap-3 text-right"><div><div className="text-[9px] text-slate-500">BOARD TRUST</div><b className="text-sm text-emerald-300">{boardTrustDelta===undefined?'—':(boardTrustDelta>0?'+':'')+boardTrustDelta+'%'}</b></div><div><div className="text-[9px] text-slate-500">MANAGER XP</div><b className="text-sm text-amber-300">{xpGained===undefined?'—':'+'+xpGained+' XP'}</b></div></div>
  </header>
  <section className="grid min-h-0 flex-1 grid-cols-[32fr_34fr_34fr] gap-2 p-2">
   <article className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-amber-300/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,193,7,.2),transparent_60%),linear-gradient(160deg,#15263b,#0b1422)] p-3">
    <div className="text-[9px] font-black tracking-[.22em] text-amber-300">★ PLAYER OF THE MATCH</div>
    <div className="my-2 flex min-h-0 flex-1 flex-col items-center justify-center">
     <div className="relative grid aspect-square w-[min(38%,170px)] place-items-center rounded-full border border-amber-300/35 bg-gradient-to-br from-amber-300/20 to-cyan-300/10 shadow-[0_0_45px_rgba(0,229,255,.12)]"><RealisticAvatar seed={motmPlayer?.id??"motm"} name={motmPlayer?.name??"Player of the Match"} size={132} outfit="player_kit" primaryColor={motmClub.primaryColor} secondaryColor={motmClub.secondaryColor} shirtNumber={motmPlayer?.shirtNumber} className="h-full w-full rounded-full"/><span className="absolute -bottom-2 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">{motm?.rating.toFixed(1)??'—'} RATING</span></div>
     <div className="mt-4 text-center"><div className="text-xl font-black">{motmPlayer?.name??'Match award pending'}</div><div className="mt-1 text-[9px] font-bold tracking-[.18em] text-amber-200">MAN OF THE MATCH</div></div>
    </div>
    <div className="grid grid-cols-2 gap-1.5">{[{v:motm?.goals??0,l:'GOALS'},{v:motm?.assists??0,l:'ASSISTS'},{v:motm?.passes??0,l:'PASSES'},{v:motm?.tackles??0,l:'TACKLES'}].map(x=><div key={x.l} className="rounded-lg border border-white/10 bg-black/20 p-2"><div className="text-lg font-black tabular-nums">{x.v}</div><div className="text-[8px] font-bold tracking-widest text-slate-500">{x.l}</div></div>)}</div>
   </article>
   <article className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111c33]/85 p-3">
    <div className="mb-3 flex items-center justify-between"><b className="text-[10px] font-black tracking-[.18em]">MATCH TELEMETRY</b><span className="text-[9px] text-cyan-300">FULL TIME</span></div>
    <div className="mb-2 flex justify-between text-[9px] font-bold"><span style={{color:homeClub.primaryColor}}>{homeClub.shortName}</span><span className="text-slate-500">HOME · AWAY</span><span style={{color:awayClub.primaryColor}}>{awayClub.shortName}</span></div>
    <div className="space-y-4">{statRows.map(s=><div key={s.label}><div className="mb-1 flex justify-between text-[9px] font-bold text-slate-400"><span>{s.label}</span><span className="font-mono text-white">{s.a}{s.suffix??''}{s.subA!==undefined?` (${s.subA})`:''} <span className="text-slate-600">—</span> {s.b}{s.suffix??''}{s.subB!==undefined?` (${s.subB})`:''}</span></div><div className="flex h-2 overflow-hidden rounded-full bg-white/10"><div className="bg-cyan-400" style={{width:`${s.a/s.max*50}%`}}/><div className="flex-1 bg-amber-400" style={{maxWidth:`${s.b/s.max*50}%`}}/></div></div>)}</div>
    <div className="mt-auto rounded-lg border border-white/10 bg-black/20 p-2">
      <div className="mb-2 flex items-center justify-between text-[9px] font-black tracking-widest text-slate-400"><span>FINAL MOMENTUM</span><span className="text-cyan-200">{session.momentum>0?homeClub.shortName:awayClub.shortName}</span></div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10"><div className="bg-cyan-400" style={{width: `${Math.max(0,Math.min(100,50+session.momentum/2))}%`}}/><div className="flex-1 bg-amber-400"/></div>
      <div className="mb-1 mt-3 text-[9px] font-black tracking-widest text-slate-400">KEY EVENT TIMELINE</div>
      <div className="relative h-8 rounded border-b border-white/10">{session.events.filter(e=>['GOAL','YELLOW_CARD','RED_CARD'].includes(e.type)).map(e=><span key={e.id} title={e.text} className="absolute -translate-x-1/2 text-[10px]" style={{left: `${Math.max(0,Math.min(100,e.minute/90*100))}%`}}>{e.type==='GOAL'?'⚽':e.type==='RED_CARD'?'🟥':'🟨'}</span>)}</div>
      <div className="mt-1 flex justify-between text-[8px] text-slate-600"><span>0'</span><span>45'</span><span>90'</span></div>
     </div>
   </article>
   <article className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111c33]/85 p-3">
    <div className="mb-2 flex items-center justify-between"><b className="text-[10px] font-black tracking-[.18em]">SQUAD RATINGS</b><span className="text-[8px] text-slate-500">FORM · RATING</span></div>
    <div className="mb-1 text-[9px] font-black text-cyan-300">{homeClub.shortName}</div><RatingList rows={homeRows}/>
    <div className="my-2 border-t border-white/10"/>
    <div className="mb-1 text-[9px] font-black text-amber-300">{awayClub.shortName}</div><RatingList rows={awayRows}/>
   </article>
  </section>
  <footer className="flex h-12 shrink-0 items-center justify-between border-t border-white/10 bg-[#111c33]/95 px-3">
   <div className="flex gap-2"><button onClick={onReport} className="min-h-9 rounded-lg border border-white/15 px-3 text-[9px] font-black text-slate-200">MATCH REPORT</button><button onClick={onReplay??(()=>setMomentsOpen(true))} className="min-h-9 rounded-lg border border-white/15 px-3 text-[9px] font-black text-slate-200">KEY MOMENTS</button></div>
   <button onClick={onContinue} className="min-h-10 rounded-lg bg-[#ffc107] px-5 text-[10px] font-black tracking-wide text-[#17120a] shadow-[0_0_22px_rgba(255,193,7,.2)]">CONTINUE TO HUB ▶</button>
  </footer>
  {momentsOpen&&<div className='absolute inset-0 z-40 grid place-items-center bg-black/70 p-6 backdrop-blur-sm'><section className='w-[min(520px,90%)] rounded-xl border border-white/15 bg-[#111c33] p-4 shadow-2xl'><div className='mb-3 flex items-center justify-between'><b className='text-xs font-black tracking-widest'>KEY MATCH MOMENTS</b><button onClick={()=>setMomentsOpen(false)} className='text-xs text-slate-400'>CLOSE ×</button></div><div className='max-h-[55%] space-y-2 overflow-auto'>{session.events.filter(e=>!['KICKOFF','HALF_TIME','FULL_TIME'].includes(e.type)).map(e=><div key={e.id} className='flex gap-3 rounded-lg bg-white/5 p-2 text-[10px]'><b className='w-8 shrink-0 font-mono text-cyan-300'>{e.minute}&apos;</b><span className='font-bold text-amber-200'>{e.type.replace('_',' ')}</span><span className='min-w-0 text-slate-300'>{e.text}</span></div>)}</div><p className='mt-3 text-[9px] text-slate-500'>Event timeline only. Full 3D replay playback is not yet available in the match engine.</p></section></div>}
 </div></main>;
};
