import type { OfflinePlayer, OfflineAttributes } from '../data/offlineDatabase';
export type AcademyTier='SQUAD_PROSPECT'|'FIRST_TEAM_REGULAR'|'WONDERKID';
export type TrainingStyle='GOAL_POACHER'|'BOX_TO_BOX'|'BALL_PLAYING_DEFENDER';
export interface AcademyProspect extends OfflinePlayer { academyTier:AcademyTier; potentialScouted:boolean; developmentPoints:number; }
const clamp=(n:number,min=1,max=99)=>Math.max(min,Math.min(max,Math.round(n)));
const rand=(seed:string)=>{let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967295;};
export function generateAcademyProspect(seed:string, position:OfflinePlayer['primaryPos'], nationality='Zambia'):AcademyProspect {
 const r=rand(seed), tier:AcademyTier=r>.94?'WONDERKID':r>.62?'FIRST_TEAM_REGULAR':'SQUAD_PROSPECT';
 const ranges:Record<AcademyTier,[number,number]>={SQUAD_PROSPECT:[70,77],FIRST_TEAM_REGULAR:[78,84],WONDERKID:[85,91]};
 const [lo,hi]=ranges[tier],potential=lo+Math.floor(rand(seed+'-pot')*(hi-lo+1)),ovr=48+Math.floor(rand(seed+'-ovr')*17);
 const gk=position==='GK',base:OfflineAttributes={pace:ovr,shooting:gk?8:ovr-1,passing:gk?ovr-8:ovr,dribbling:gk?12:ovr+1,defending:gk?12:ovr-2,physical:ovr,goalkeeping:gk?ovr+10:8,stamina:ovr+2,weakFoot:2,skillMoves:gk?1:2};
 return {id:'academy-'+seed,name:'Academy Prospect '+seed.slice(-4),nationality,age:15+Math.floor(rand(seed+'-age')*4),heightCm:168+Math.floor(rand(seed+'-height')*25),preferredFoot:rand(seed+'-foot')>.5?'Right':'Left',squadNumber:99,primaryPos:position,secondaryPos:[],attributes:base,ovr,potential,potentialRange:[lo,hi],marketValue:Math.max(10000,ovr*ovr*900),weeklyWage:Math.max(150,ovr*18),contractExpiryYear:2030,isAcademyProspect:true,academyTier:tier,potentialScouted:false,developmentPoints:0};
}
export function scoutPotential(player:AcademyProspect, matchesPlayed:number):AcademyProspect {
 const progress=Math.min(1,Math.max(0,matchesPlayed)/18), width=Math.max(0,Math.ceil((player.potentialRange[1]-player.potentialRange[0])*(1-progress)));
 const center=player.potential; return {...player,potentialScouted:progress>=1,potentialRange:[Math.max(player.ovr,center-Math.ceil(width/2)),Math.min(99,center+Math.floor(width/2))]};
}
export function developPlayer(player:OfflinePlayer, options:{appearances?:number;averageRating?:number;training?:TrainingStyle;seasonal?:boolean}={}):OfflinePlayer {
 const apps=Math.max(0,options.appearances??0), rating=options.averageRating??6.5, attrs={...player.attributes}, age=player.age;
 const intensity=age<=22?1.15:age<=29?.42:age<=32?-.18:-.42;
 const minutesFactor=Math.min(1.35,.45+apps/24), performance=Math.max(.25,Math.min(1.4,(rating-5.5)/2.2));
 const gain=Math.max(-1,Math.min(2,intensity*minutesFactor*performance));
 if(age<=22&&player.ovr<player.potential){attrs.pace=clamp(attrs.pace+gain*.45);attrs.shooting=clamp(attrs.shooting+gain*.35);attrs.passing=clamp(attrs.passing+gain*.35);attrs.dribbling=clamp(attrs.dribbling+gain*.45);attrs.defending=clamp(attrs.defending+gain*.25);attrs.physical=clamp(attrs.physical+gain*.3);}
 if(age>=30){attrs.pace=clamp(attrs.pace-(age>=33?.8:.35));attrs.stamina=clamp(attrs.stamina-(age>=33?.7:.3));attrs.physical=clamp(attrs.physical-.2);}
 if(age>=23&&age<=29){attrs.passing=clamp(attrs.passing+.15);attrs.defending=clamp(attrs.defending+.1);}
 if(options.training==='GOAL_POACHER'&&['ST','CF'].includes(player.primaryPos))attrs.shooting=clamp(attrs.shooting+.55);
 if(options.training==='BOX_TO_BOX') {attrs.stamina=clamp(attrs.stamina+.45);attrs.passing=clamp(attrs.passing+.3);}
 if(options.training==='BALL_PLAYING_DEFENDER'&&['CB','CDM'].includes(player.primaryPos)){attrs.passing=clamp(attrs.passing+.5);attrs.defending=clamp(attrs.defending+.35);}
 const ovr=player.primaryPos==='GK'?clamp(attrs.goalkeeping*.5+attrs.passing*.1+attrs.physical*.15+attrs.stamina*.1+attrs.defending*.1+attrs.pace*.05):clamp((attrs.pace+attrs.shooting+attrs.passing+attrs.dribbling+attrs.defending+attrs.physical)/6);
 return {...player,attributes:attrs,ovr:Math.min(player.potential,ovr),age:options.seasonal?Math.min(40,age+1):age,marketValue:Math.max(10000,Math.round(Math.pow(Math.max(1,ovr-35),2.3)*(age>30?.6:1)*10000))};
}
