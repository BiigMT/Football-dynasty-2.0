import React, { useMemo, useState } from 'react';
import { Club, MatchSession, Mentality, Player } from '../types/football';
import { Stadium3D, StadiumCameraMode } from './Stadium3D';
import { MatchPitchCanvas } from './MatchPitchCanvas';

interface Props {
  session: MatchSession; homeClub: Club; awayClub: Club; players: Record<string,Player>;
  running: boolean; speedMs: number; userSide: 'HOME'|'AWAY'; subsUsed: number;
  onPause:()=>void; onSpeed:(ms:number)=>void; onMentality:(value:Mentality|'COUNTER')=>void;
  onShout:(value:'DEMAND_MORE'|'HIGH_PRESS'|'TIGHTEN_UP')=>void;
  onSubstitute:(outId:string,inId:string)=>void;
}
const fmt=(v:number)=>Number.isInteger(v)?String(v):v.toFixed(2);
export const ConsoleMatchday:React.FC<Props>=({session,homeClub,awayClub,players,running,speedMs,userSide,subsUsed,onPause,onSpeed,onMentality,onShout,onSubstitute})=>{
  const [camera,setCamera]=useState<StadiumCameraMode|'2D'>('TV');
  const [statsOpen,setStatsOpen]=useState(false);
  const [subsOpen,setSubsOpen]=useState(false);
  const [highlights,setHighlights]=useState(true);
  const [outId,setOutId]=useState('');
  const [inId,setInId]=useState('');
  const userTactics=userSide==='HOME'?session.homeTactics:session.awayTactics;
  const userClub=userSide==='HOME'?homeClub:awayClub;
  const userStates=useMemo(()=>Object.values(session.playerStates).filter(s=>s.clubId===userClub.id).sort((a,b)=>a.slotIndex-b.slotIndex),[session.playerStates,userClub.id]);
  const latest=[...session.events].reverse().find(e=>e.type!=='KICKOFF'&&e.type!=='HALF_TIME');
  const commentary=latest?.text??'Both teams are settling into their shape. The next opening could decide it.';
  const homePress=Math.max(0,Math.min(100,50+session.momentum/2));
  const handleSub=()=>{if(outId&&inId&&subsUsed<5){onSubstitute(outId,inId);setOutId('');setInId('');}};
  return <main className="fixed inset-0 grid h-[100dvh] w-screen place-items-center overflow-hidden bg-black text-white" style={{touchAction:'manipulation'}}>\n   <div className="relative h-[min(100dvh,56.25vw)] w-[min(100vw,177.78dvh)] overflow-hidden bg-[#080e1a]" style={{aspectRatio:'16 / 9'}}>
   <div className="relative h-[min(100dvh,56.25vw)] w-[min(100vw,177.78dvh)] overflow-hidden bg-[#080e1a]" style={{aspectRatio:'16 / 9'}}>
    <div className="absolute inset-0">{camera==='2D'?<MatchPitchCanvas session={session} homeClub={homeClub} awayClub={awayClub} players={players} lastGoalTimestamp={0}/>:<Stadium3D session={session} homeClub={homeClub} awayClub={awayClub} players={players} cameraMode={camera}/>}</div>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050b16]/50 via-transparent to-[#050b16]/70"/>
    <header className="absolute left-3 top-3 z-20 flex max-w-[min(60vw,620px)] items-center gap-2 rounded-xl border border-white/15 bg-[#111c33]/90 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <span className="rounded bg-white/10 px-2 py-1 text-[9px] font-black tracking-widest text-cyan-200">{session.competitionName.slice(0,12).toUpperCase()}</span>
      <div className="flex items-center gap-2"><span className="text-[11px] font-black" style={{color:homeClub.primaryColor}}>{homeClub.shortName}</span><b className="font-mono text-xl tabular-nums">{session.homeStats.goals}–{session.awayStats.goals}</b><span className="text-[11px] font-black" style={{color:awayClub.primaryColor}}>{awayClub.shortName}</span></div>
      <span className="rounded bg-cyan-400/15 px-2 py-1 font-mono text-xs font-bold tabular-nums text-[#00e5ff]">{session.minute}'</span>
      {session.phase==='HALF_TIME'?<span className="text-[9px] font-black text-amber-300">HALF TIME</span>:null}
    </header>
    <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-xl border border-white/15 bg-[#111c33]/90 p-1.5 backdrop-blur-xl">
      {[{label:'1x',ms:360},{label:'2x',ms:180},{label:'4x',ms:90}].map(s=><button key={s.label} onClick={()=>onSpeed(s.ms)} className={`min-h-9 min-w-9 rounded-lg px-2 text-[11px] font-black ${speedMs===s.ms?'bg-[#00e5ff] text-[#06111d]':'text-slate-300 hover:bg-white/10'}`}>{s.label}</button>)}
      <button onClick={onPause} className="min-h-9 rounded-lg bg-white/10 px-3 text-[10px] font-black">{running?'Ⅱ PAUSE':'▶ PLAY'}</button>
      <button onClick={()=>setHighlights(v=>!v)} className="min-h-9 rounded-lg border border-white/10 px-2 text-[9px] font-bold text-slate-200">{highlights?'KEY':'FULL'}</button>
      <button onClick={()=>setStatsOpen(v=>!v)} className="min-h-9 rounded-lg bg-[#ffc107] px-3 text-[9px] font-black text-[#17120a]">STATS</button>
    </div>
    <div className="absolute left-1/2 top-[68px] z-20 flex -translate-x-1/2 gap-1 rounded-full border border-white/15 bg-[#111c33]/80 p-1 backdrop-blur-xl">
      {([{id:'TV',label:'TV BROADCAST'},{id:'2D',label:'2D TACTICAL'},{id:'DUGOUT',label:'DUGOUT CAM'}] as {id:StadiumCameraMode|'2D';label:string}[]).map(m=><button key={m.id} onClick={()=>setCamera(m.id)} className={`rounded-full px-3 py-2 text-[9px] font-black tracking-wide ${camera===m.id?'bg-cyan-300 text-[#06111d]':'text-slate-200'}`}>{m.label}</button>)}
    </div>
    <div className="pointer-events-none absolute bottom-[100px] left-1/2 z-20 w-[min(660px,72vw)] -translate-x-1/2 rounded-xl border border-white/10 bg-[rgba(8,14,26,.88)] px-3 py-2 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3"><div className="min-w-0 truncate text-[10px] font-semibold text-slate-100">{session.minute}' · {commentary}</div><span className="shrink-0 text-[9px] font-black text-cyan-300">LIVE</span></div>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400 transition-all" style={{width:`${homePress}%`}}/><div className="h-full flex-1 bg-amber-400"/></div>
      <div className="mt-1 flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500"><span>{homeClub.shortName} pressure</span><span>{awayClub.shortName} pressure</span></div>
    </div>
    <footer className="absolute inset-x-3 bottom-3 z-20 flex min-h-[66px] items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#111c33]/92 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-1">
        {([{label:'PARK',v:'DEFENSIVE'},{label:'COUNTER',v:'COUNTER'},{label:'BALANCED',v:'BALANCED'},{label:'ATTACK',v:'ATTACKING'},{label:'ALL OUT',v:'ALL_OUT'}] as {label:string;v:Mentality|'COUNTER'}[]).map((m,i)=><button key={m.label} onClick={()=>onMentality(m.v)} className={`min-h-10 rounded-lg px-2 text-[8px] font-black ${userTactics.mentality===m.v?'bg-cyan-300 text-[#07111d]':'bg-white/5 text-slate-300'}`}>{m.label}</button>)}
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={()=>onShout('DEMAND_MORE')} className="min-h-10 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 text-[9px] font-black text-cyan-100">⚡ DEMAND MORE</button>
        <button onClick={()=>onShout('HIGH_PRESS')} className="min-h-10 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 text-[9px] font-black text-amber-100">🔥 HIGH PRESS</button>
        <button onClick={()=>onShout('TIGHTEN_UP')} className="min-h-10 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 text-[9px] font-black text-emerald-100">🛡 TIGHTEN UP</button>
      </div>
      <button onClick={()=>setSubsOpen(v=>!v)} className="min-h-11 shrink-0 rounded-xl bg-[#ffc107] px-3 text-[9px] font-black text-[#17120a]">SQUAD / SUBS ({Math.max(0,5-subsUsed)} LEFT)</button>
    </footer>
    {statsOpen&&<aside className="absolute right-3 top-[68px] z-30 w-[min(310px,32vw)] rounded-xl border border-white/15 bg-[#111c33]/95 p-3 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between"><b className="text-xs">MATCH TELEMETRY</b><button onClick={()=>setStatsOpen(false)} className="text-xs text-slate-400">CLOSE ×</button></div>
      {([{label:'POSSESSION',a:session.homeStats.possession,b:session.awayStats.possession,suffix:'%'},{label:'EXPECTED GOALS',a:session.homeStats.xG,b:session.awayStats.xG,suffix:''},{label:'SHOTS ON TARGET',a:session.homeStats.shotsOnTarget,b:session.awayStats.shotsOnTarget,suffix:''},{label:'SHOTS',a:session.homeStats.shots,b:session.awayStats.shots,suffix:''}] as const).map(s=><div key={s.label} className="mb-3"><div className="mb-1 flex justify-between text-[9px] font-bold text-slate-400"><span>{s.label}</span><span className="font-mono text-white">{fmt(s.a)}{s.suffix} · {fmt(s.b)}{s.suffix}</span></div><div className="flex h-1.5 overflow-hidden rounded-full bg-white/10"><div className="bg-cyan-400" style={{width:`${(s.a/(s.a+s.b||1))*100}%`}}/><div className="flex-1 bg-amber-400"/></div></div>)}
    </aside>}
    {subsOpen&&<aside className="absolute bottom-[84px] right-3 top-[68px] z-30 w-[28vw] min-w-[260px] rounded-xl border border-white/15 bg-[#111c33]/96 p-3 shadow-2xl backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between"><b className="text-xs">TOUCHLINE SQUAD</b><button onClick={()=>setSubsOpen(false)} className="text-xs text-slate-400">×</button></div>
      <div className="grid grid-cols-2 gap-2 text-[9px]"><label className="text-slate-400">SUB OFF<select value={outId} onChange={e=>setOutId(e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#080e1a] px-2 text-white"><option value="">Select player</option>{userTactics.startingXI.map(id=>{const p=players[id];const st=session.playerStates[id];return p?<option key={id} value={id}>{p.shirtNumber} · {p.name} ({Math.round(st?.stamina??0)}%)</option>:null;})}</select></label><label className="text-slate-400">SUB ON<select value={inId} onChange={e=>setInId(e.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#080e1a] px-2 text-white"><option value="">Select player</option>{userTactics.bench.map(id=>{const p=players[id];return p?<option key={id} value={id}>{p.shirtNumber} · {p.name}</option>:null;})}</select></label></div>
      <div className="mt-3 space-y-1.5">{userStates.map(st=>{const p=players[st.playerId];if(!p)return null;return <div key={st.playerId} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5"><span className="w-5 text-[9px] font-black text-cyan-300">{p.shirtNumber}</span><span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{p.name}</span><span className="text-[9px] tabular-nums text-slate-300">{Math.round(st.stamina)}%</span><span className={`text-[9px] font-black ${st.rating>=7.5?'text-emerald-400':st.rating>=6.5?'text-cyan-300':'text-amber-300'}`}>{st.rating.toFixed(1)}</span></div>;})}</div>
      <button disabled={!outId||!inId||subsUsed>=5} onClick={handleSub} className="mt-3 min-h-10 w-full rounded-lg bg-[#ffc107] text-[10px] font-black text-[#17120a] disabled:opacity-40">CONFIRM SUBSTITUTION</button>
    </aside>}
   </div>
  </main>;
};
