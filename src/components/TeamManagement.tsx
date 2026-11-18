import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Shield, SlidersHorizontal, Users } from 'lucide-react';
import { Club, ClubTactics, Formation, Player } from '../types/football';
import { ClubBadge, KitPreview } from './ClubBadge';
import { RealisticAvatar } from './RealisticAvatar';

interface Props {
  club: Club;
  players: Record<string, Player>;
  onSave: (tactics: ClubTactics) => void;
  onBack: () => void;
}

type Slot = { label: string; x: number; y: number };
const SHAPES: Record<Formation, Slot[]> = {
  '4-3-3': [
    {label:'GK',x:50,y:91},{label:'LB',x:15,y:72},{label:'CB',x:38,y:76},{label:'CB',x:62,y:76},{label:'RB',x:85,y:72},
    {label:'DM',x:50,y:58},{label:'CM',x:30,y:45},{label:'CM',x:70,y:45},{label:'LW',x:17,y:23},{label:'ST',x:50,y:17},{label:'RW',x:83,y:23}
  ],
  '4-2-3-1': [
    {label:'GK',x:50,y:91},{label:'LB',x:15,y:72},{label:'CB',x:38,y:76},{label:'CB',x:62,y:76},{label:'RB',x:85,y:72},
    {label:'CDM',x:37,y:59},{label:'CDM',x:63,y:59},{label:'LM',x:18,y:39},{label:'CAM',x:50,y:37},{label:'RM',x:82,y:39},{label:'ST',x:50,y:17}
  ],
  '4-4-2': [
    {label:'GK',x:50,y:91},{label:'LB',x:15,y:72},{label:'CB',x:38,y:76},{label:'CB',x:62,y:76},{label:'RB',x:85,y:72},
    {label:'LM',x:15,y:47},{label:'CM',x:39,y:53},{label:'CM',x:61,y:53},{label:'RM',x:85,y:47},{label:'ST',x:39,y:19},{label:'ST',x:61,y:19}
  ],
  '3-5-2': [
    {label:'GK',x:50,y:91},{label:'CB',x:25,y:75},{label:'CB',x:50,y:78},{label:'CB',x:75,y:75},{label:'LWB',x:12,y:48},
    {label:'CM',x:36,y:55},{label:'CM',x:64,y:55},{label:'RWB',x:88,y:48},{label:'CAM',x:50,y:36},{label:'ST',x:37,y:18},{label:'ST',x:63,y:18}
  ],
  '5-3-2': [
    {label:'GK',x:50,y:91},{label:'LWB',x:10,y:65},{label:'CB',x:30,y:76},{label:'CB',x:50,y:78},{label:'CB',x:70,y:76},{label:'RWB',x:90,y:65},
    {label:'CM',x:30,y:48},{label:'CM',x:50,y:53},{label:'CM',x:70,y:48},{label:'ST',x:38,y:19},{label:'ST',x:62,y:19}
  ]
};
const money = (n:number) => '€' + (n/1_000_000).toFixed(1) + 'm';

export const TeamManagement: React.FC<Props> = ({ club, players, onSave, onBack }) => {
  const [tactics,setTactics] = useState<ClubTactics>(club.tactics);
  const [selected,setSelected] = useState<string|null>(null);
  const [panel,setPanel] = useState<'SQUAD'|'TACTICS'>('SQUAD');
  const slots = SHAPES[tactics.formation];
  const xi = tactics.startingXI.slice(0,11);
  const bench = tactics.bench;
  const average = useMemo(() => {
    const list=xi.map(id=>players[id]).filter(Boolean);
    return list.length ? Math.round(list.reduce((s,p)=>s+p.overall,0)/list.length) : 0;
  },[xi,players]);
  const update=(patch:Partial<ClubTactics>)=>setTactics(prev=>({...prev,...patch}));
  const squadPlayers=useMemo(()=>Object.values(players).filter(p=>p.clubId===club.id).sort((a,b)=>b.overall-a.overall),[players,club.id]);
  const [squadView,setSquadView]=useState<'MATCHDAY'|'FULL_SQUAD'>('MATCHDAY');
  const [squadPage,setSquadPage]=useState(0);
  const squadPageSize=8;
  const squadPageCount=Math.max(1,Math.ceil(squadPlayers.length/squadPageSize));
  const displayedSquadPlayers=squadView==='MATCHDAY'?bench.map(id=>players[id]).filter(Boolean):squadPlayers.slice(squadPage*squadPageSize,(squadPage+1)*squadPageSize);
  const selectPlayer=(id:string)=>{
    if(!selected){setSelected(id);return;}
    if(selected===id){setSelected(null);return;}
    const nextXI=[...tactics.startingXI], nextBench=[...tactics.bench];
    const selectedXI=nextXI.indexOf(selected), tappedXI=nextXI.indexOf(id);
    const selectedBench=nextBench.indexOf(selected), tappedBench=nextBench.indexOf(id);
    const selectedReserve=selectedXI<0&&selectedBench<0;
    const tappedReserve=tappedXI<0&&tappedBench<0;
    if(selectedXI>=0&&tappedBench>=0){nextXI[selectedXI]=id;nextBench[tappedBench]=selected;}
    else if(selectedBench>=0&&tappedXI>=0){nextBench[selectedBench]=id;nextXI[tappedXI]=selected;}
    else if(selectedXI>=0&&tappedXI>=0){nextXI[selectedXI]=id;nextXI[tappedXI]=selected;}
    else if(selectedBench>=0&&tappedBench>=0){nextBench[selectedBench]=id;nextBench[tappedBench]=selected;}
    else if(selectedReserve&&tappedBench>=0){nextBench[tappedBench]=selected;}
    else if(selectedBench>=0&&tappedReserve){nextBench[selectedBench]=id;}
    else if(selectedReserve&&tappedXI>=0){
      nextXI[tappedXI]=selected;
      if(nextBench.length)nextBench[nextBench.length-1]=id;
      else nextBench.push(id);
    }
    else if(selectedXI>=0&&tappedReserve){
      nextXI[selectedXI]=id;
      if(nextBench.length)nextBench[nextBench.length-1]=selected;
      else nextBench.push(selected);
    }
    else {setSelected(id);return;}
    update({startingXI:nextXI,bench:nextBench});setSelected(null);
  };
  const rating=(id:string,index:number)=>{
    const p=players[id]; if(!p)return 0;
    const slot=slots[index]; if(!slot)return p.overall;
    const pos=p.position;
    const match=(slot.label==='GK'&&pos==='GK') || (['CB','LB','RB','LWB','RWB'].includes(slot.label)&&['CB','LB','RB'].includes(pos)) ||
      (['DM','CDM','CM','CAM','LM','RM'].includes(slot.label)&&['CDM','CM','CAM'].includes(pos)) ||
      (['LW','RW','ST'].includes(slot.label)&&['LW','RW','ST'].includes(pos));
    return Math.max(40,p.overall+(match?0:-3));
  };
  const choices:Formation[]=['4-3-3','4-2-3-1','4-4-2','3-5-2','5-3-2'];
  return <div className="min-h-[100dvh] w-full bg-[#07111f] text-[#E8EDF5] flex flex-col overflow-x-hidden overflow-y-auto" style={{paddingTop:'env(safe-area-inset-top)',paddingBottom:'env(safe-area-inset-bottom)'}}>
    <header className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-3 border-b border-[#235BA8]/50 bg-[#0D1B2A]">
      <div className="flex items-center gap-3"><button onClick={onBack} className="p-2 rounded-lg bg-white/5"><ArrowLeft size={18}/></button><ClubBadge clubId={club.id} shortName={club.shortName} primaryColor={club.primaryColor} secondaryColor={club.secondaryColor} size={38}/><div><div className="font-black tracking-wide">{club.name}</div><div className="text-[11px] tracking-[.2em] text-slate-400">PES GAME PLAN · FIRST TEAM</div></div></div>
      <div className="text-right"><div className="text-2xl font-black text-[#F6C21C]">{average}</div><div className="text-[9px] tracking-widest text-slate-400">TEAM OVR</div></div>
    </header>
    <nav className="flex gap-2 px-3 py-2 bg-[#0D1B2A] border-b border-white/10"><button onClick={()=>setPanel('SQUAD')} className={`px-4 py-2 text-xs font-bold rounded ${panel==='SQUAD'?'bg-[#235BA8] text-white':'bg-white/5 text-slate-400'}`}><Users className="inline mr-2" size={14}/>SQUAD</button><button onClick={()=>setPanel('TACTICS')} className={`px-4 py-2 text-xs font-bold rounded ${panel==='TACTICS'?'bg-[#235BA8] text-white':'bg-white/5 text-slate-400'}`}><SlidersHorizontal className="inline mr-2" size={14}/>TACTICAL INSTRUCTIONS</button></nav>
    <main className="w-full flex-1 overflow-visible p-3 sm:p-4">
      {panel==='SQUAD' ? <div className="grid min-h-[520px] grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)] gap-4 max-w-7xl mx-auto items-stretch">
        <section className="flex min-h-[480px] flex-col rounded-xl border border-white/10 bg-[#0D1B2A]/90 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-3"><div className="font-bold">TACTICAL BOARD <span className="text-xs text-slate-500 ml-2">{xi.length}/11 STARTERS</span></div><select value={tactics.formation} onChange={e=>update({formation:e.target.value as Formation})} className="bg-[#07111f] border border-white/15 rounded px-3 py-2 text-xs">{choices.map(f=><option key={f}>{f}</option>)}</select></div>
          <div className="relative mx-auto min-h-[300px] flex-1 w-full max-w-none aspect-[16/9] rounded-lg overflow-hidden border border-white/30" style={{background:'repeating-linear-gradient(0deg,#17613e 0px,#17613e 42px,#1b6b45 42px,#1b6b45 84px)'}}>
            <div className="absolute inset-[3%] border border-white/60 rounded-sm"/><div className="absolute left-1/2 top-[3%] bottom-[3%] border-l border-white/40"/><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square rounded-full border border-white/50"/><div className="absolute left-[30%] right-[30%] top-[3%] h-[13%] border border-white/50"/><div className="absolute left-[30%] right-[30%] bottom-[3%] h-[13%] border border-white/50"/>
            {slots.map((slot,i)=>{const id=xi[i];const p=id?players[id]:undefined;return <button key={slot.label+i} onClick={()=>id&&selectPlayer(id)} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center min-w-[42px] ${selected===id?'z-20 scale-110':''}`} style={{left:slot.x+'%',top:slot.y+'%'}}><span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-lg ${selected===id?'border-[#F6C21C] bg-[#F6C21C] text-slate-950':'border-white bg-[#13386C] text-white'}`}>{p?.shirtNumber??'+'}</span><span className="mt-0.5 px-1 rounded bg-[#07111f]/90 text-[10px] font-bold whitespace-nowrap max-w-[100px] truncate">{p?.name.split(' ').slice(-1)[0]??slot.label}</span><span className="text-[11px] font-black text-[#F6C21C]">{p?rating(id,i):'—'}</span></button>})}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-400"><span>Tap a starter, then a bench player to make a substitution.</span><span className="text-[#F6C21C]">POSITION FIT · OVR</span></div>
        </section>
        <section className="flex min-h-[480px] flex-col rounded-xl border border-white/10 bg-[#0D1B2A]/90 p-3">
          <div className="flex justify-between items-center gap-2 mb-3"><div><h3 className="font-bold">SQUAD DEPTH</h3><span className="text-[11px] text-slate-500">{squadPlayers.length} REGISTERED PLAYERS · {xi.length} STARTERS</span></div><div className="text-right text-[11px] text-slate-500">OVR</div></div>
          <div className="grid shrink-0 grid-cols-2 gap-1 rounded-lg bg-[#07111f] p-1 mb-2">
            <button onClick={()=>setSquadView('MATCHDAY')} className={`py-2 rounded text-[11px] font-black tracking-wider ${squadView==='MATCHDAY'?'bg-[#235BA8] text-white':'text-slate-400'}`}>MATCHDAY · {bench.length}</button>
            <button onClick={()=>setSquadView('FULL_SQUAD')} className={`py-2 rounded text-[11px] font-black tracking-wider ${squadView==='FULL_SQUAD'?'bg-[#235BA8] text-white':'text-slate-400'}`}>FULL SQUAD · {squadPlayers.length}</button>
          </div>
          <div className="grid min-h-[220px] flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
            {displayedSquadPlayers.map(p=>{
              const status=xi.includes(p.id)?'STARTER':bench.includes(p.id)?'BENCH':'RESERVE';
              return <button key={p.id} onClick={()=>selectPlayer(p.id)} className={`w-full min-h-0 flex items-center gap-1.5 p-1 rounded border text-left ${selected===p.id?'border-[#F6C21C] bg-[#F6C21C]/10':'border-white/10 bg-[#07111f]/70'}`}>
                <RealisticAvatar seed={p.id} name={p.name} size={32} primaryColor={club.primaryColor} secondaryColor={club.secondaryColor} shirtNumber={p.shirtNumber}/>
                <div className="min-w-0 flex-1"><div className="font-bold text-[10px] leading-tight truncate">{p.name}</div><div className="text-[11px] text-slate-400">{p.position} · {p.fitness}% FIT</div></div>
                <div className="text-right shrink-0"><div className="text-sm leading-none font-black text-[#F6C21C]">{p.overall}</div><div className="text-[9px] tracking-wider text-slate-500">{status}</div></div>
              </button>;
            })}
          </div>
          <div className="mt-1 flex shrink-0 items-center justify-between gap-2 text-[11px] text-slate-500"><span>{squadView==='FULL_SQUAD'?`Page ${squadPage+1}/${squadPageCount} · ${squadPlayers.length} players`:'Matchday substitutes'}</span>{squadView==='FULL_SQUAD'&&<div className="flex gap-1"><button type="button" disabled={squadPage===0} onClick={()=>setSquadPage(p=>Math.max(0,p-1))} className="rounded border border-white/15 px-2 py-1 disabled:opacity-30">PREV</button><button type="button" disabled={squadPage+1>=squadPageCount} onClick={()=>setSquadPage(p=>Math.min(squadPageCount-1,p+1))} className="rounded border border-white/15 px-2 py-1 disabled:opacity-30">NEXT</button></div>}</div>
          <div className="mt-1 shrink-0 p-2 rounded-lg bg-black/20 border border-white/5"><div className="text-[11px] tracking-widest text-slate-500 mb-2">SET-PIECE RESPONSIBILITIES</div>{(['captainId'] as const).map(k=><label key={k} className="block text-xs text-slate-300">Captain<select value={tactics[k]} onChange={e=>update({captainId:e.target.value})} className="block w-full mt-1 mb-2 p-2 bg-[#07111f] rounded border border-white/10">{xi.map(id=><option key={id} value={id}>{players[id]?.name??id}</option>)}</select></label>)}</div>
        </section>
      </div> : <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="p-4 rounded-xl bg-[#0D1B2A] border border-white/10"><h3 className="font-black mb-4">ATTACKING PLAN</h3><label className="block text-xs mb-3">Mentality<select value={tactics.mentality} onChange={e=>update({mentality:e.target.value as ClubTactics['mentality']})} className="block w-full mt-1 p-3 rounded bg-[#07111f] border border-white/10">{[['DEFENSIVE','Defensive'],['BALANCED','Balanced'],['ATTACKING','Attacking'],['ALL_OUT','All-out attack']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="block text-xs mb-3">Passing style<select value={tactics.passing} onChange={e=>update({passing:e.target.value as ClubTactics['passing']})} className="block w-full mt-1 p-3 rounded bg-[#07111f] border border-white/10">{[['SHORT_TIKI_TAKA','Possession game'],['MIXED','Mixed build-up'],['DIRECT_LONG','Direct / long ball']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="block text-xs">Tempo · {tactics.tempo}<input type="range" min="1" max="100" value={tactics.tempo} onChange={e=>update({tempo:Number(e.target.value)})} className="w-full accent-[#F6C21C]"/></label></section>
        <section className="p-4 rounded-xl bg-[#0D1B2A] border border-white/10"><h3 className="font-black mb-4">DEFENSIVE PLAN</h3><label className="block text-xs mb-3">Pressing<select value={tactics.pressing} onChange={e=>update({pressing:e.target.value as ClubTactics['pressing']})} className="block w-full mt-1 p-3 rounded bg-[#07111f] border border-white/10">{[['LOW_BLOCK','Low block'],['MID_PRESS','Mid press'],['GEGENPRESS','Gegenpress']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><p className="text-xs text-slate-400">Tactical settings are saved to this career and used by the match simulation.</p></section>
      </div>}
    </main>
    <footer className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-[#0D1B2A] border-t border-white/10"><div className="text-[11px] text-slate-400 flex items-center gap-2"><Shield size={14}/>Changes are local until saved</div><button onClick={()=>onSave(tactics)} className="px-6 py-3 rounded bg-[#F6C21C] text-[#101827] font-black text-xs tracking-widest shadow-lg">SAVE GAME PLAN</button></footer>
  </div>;
};
