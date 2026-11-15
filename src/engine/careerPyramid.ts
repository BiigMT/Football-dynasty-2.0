import { Club, League, Player } from '../types/football';
export type CareerTier = 1 | 2 | 3 | 4;
export const CAREER_PYRAMID = [
 {tier:4 as CareerTier,name:'FOURTH TIER · DEVELOPMENT LEAGUE',description:'Academy football, reserve minutes and the first senior breakthrough.'},
 {tier:3 as CareerTier,name:'THIRD TIER · NATIONAL LEAGUE',description:'Regular senior football, loan spells and scouting attention.'},
 {tier:2 as CareerTier,name:'SECOND TIER · CHAMPIONSHIP',description:'A demanding step-up with promotion races and bigger contracts.'},
 {tier:1 as CareerTier,name:'TOP FLIGHT · CONTINENTAL ELITE',description:'Elite domestic football, continental nights and global honours.'}
];
export const SQUAD_LADDER=['U-18 ACADEMY','RESERVE','IMPACT SUB','FIRST TEAM REGULAR','STAR PLAYER','CLUB CAPTAIN'] as const;
export const getCareerTier=(club?:Club):CareerTier=>!club?4:club.reputation>=84?1:club.reputation>=69?2:club.reputation>=56?3:4;
export function getAcademyStartingClub(clubs:Record<string,Club>,leagues:Record<string,League>,preferredClubId?:string):Club|undefined {
 const preferred=preferredClubId?clubs[preferredClubId]:undefined; const league=preferred?leagues[preferred.leagueId]:undefined;
 const candidates=Object.values(clubs).filter(c=>!league||c.leagueId===league.id).sort((a,b)=>a.reputation-b.reputation);
 return candidates.find(c=>getCareerTier(c)===4)||candidates[0]||Object.values(clubs).sort((a,b)=>a.reputation-b.reputation)[0];
}
export function getSquadLadderIndex(player:Player,trust:number):number {
 if(trust>=94&&player.squadRole==='CAPTAIN')return 5;
 if(trust>=86&&player.overall>=82)return 4;
 if(trust>=72&&player.overall>=68)return 3;
 if(trust>=58)return 2;
 if(trust>=42)return 1;
 return 0;
}
export function getTierProgressionHint(tier:CareerTier):string {
 return tier===4?'Earn your reserve promotion, then make a senior debut.':tier===3?'Consistent starts attract second-tier scouts.':tier===2?'Deliver in big fixtures to earn a top-flight move.':'Build a legacy in domestic and continental competition.';
}