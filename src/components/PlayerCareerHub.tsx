import React,{useState} from 'react';
import {CareerSave,Fixture} from '../types/football';
import {LegendHub} from './LegendHub';
import {NationalTeamHub} from './NationalTeamHub';
import {TrophyRoom} from './TrophyRoom';
import {CAREER_PYRAMID,getCareerTier,getTierProgressionHint} from '../engine/careerPyramid';
interface Props{save:CareerSave;muted:boolean;onToggleMute:()=>void;onUpdateSave:(next:CareerSave)=>void;onLaunchMatch:(fixture:Fixture)=>void;onExitToTitle:()=>void;}
export const PlayerCareerHub:React.FC<Props>=(props)=>{
 const [overlay,setOverlay]=useState<'NATIONAL'|'TROPHIES'|null>(null);
 const player=props.save.legend?props.save.players[props.save.legend.playerId]:undefined;
 const tier=getCareerTier(props.save.clubs[props.save.userClubId]);const tierInfo=CAREER_PYRAMID.find(t=>t.tier===tier)!;
 return <div className="fd-player-career-shell min-h-[100dvh] bg-[#0B101B] text-slate-100 relative"><div className="fixed z-30 top-2 right-2 flex gap-2"><button onClick={()=>setOverlay('NATIONAL')} className="px-3 py-2 rounded bg-[#151E2E] border border-cyan-300/30 text-cyan-200 text-[10px] font-black">NATIONAL TEAM</button><button onClick={()=>setOverlay('TROPHIES')} className="px-3 py-2 rounded bg-[#151E2E] border border-amber-300/30 text-amber-200 text-[10px] font-black">TROPHY ROOM</button></div><span className="sr-only">{tierInfo.name} · {getTierProgressionHint(tier)} · Age {player?.age||17}</span><LegendHub {...props}/>{overlay==='NATIONAL'&&<NationalTeamHub save={props.save} onClose={()=>setOverlay(null)}/ >}{overlay==='TROPHIES'&&<TrophyRoom save={props.save} onClose={()=>setOverlay(null)}/>}</div>;
};
export default PlayerCareerHub;