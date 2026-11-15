import type { Position } from '../types/football';

export type OfflineTacticalIdentity = 'Possession' | 'Gegenpress' | 'Counter-Attack';
export interface OfflineAttributes { pace:number; shooting:number; passing:number; dribbling:number; defending:number; physical:number; goalkeeping:number; stamina:number; weakFoot:number; skillMoves:number; }
export interface OfflinePlayer {
  id:string; name:string; nationality:string; age:number; heightCm:number; preferredFoot:'Left'|'Right';
  squadNumber:number; primaryPos:Position; secondaryPos:Position[]; attributes:OfflineAttributes;
  ovr:number; potential:number; potentialRange:[number,number]; marketValue:number; weeklyWage:number;
  contractExpiryYear:number; isAcademyProspect:boolean;
}
export interface OfflineClub {
  id:string; fullName:string; name:string; shortCode:string; country:string; leagueName:string; division:1|2;
  stadiumName:string; stadiumCapacity:number; primaryColor:string; secondaryColor:string; shieldStyle:'classic'|'modern'|'round';
  transferBudget:number; wageBudget:number; clubPrestige:1|2|3|4|5; tacticalIdentity:OfflineTacticalIdentity;
  players:OfflinePlayer[];
}
const clubSeeds = [
  ['northbridge-city','Northbridge City','NBC','England','Crownfield Park',61200,'#13386C','#F6C21C',5,'Possession',1],
  ['meridian-athletic','Meridian Athletic','MEA','England','Meridian Stadium',48700,'#235BA8','#E8EDF5',4,'Gegenpress',1],
  ['royal-harbour','Royal Harbour FC','RHF','England','Harbour Ground',53200,'#102B4E','#D94A4A',4,'Counter-Attack',1],
  ['ironford-united','Ironford United','IFU','England','Ironworks Arena',42100,'#6B1D2A','#E8EDF5',4,'Gegenpress',1],
  ['catalan-athletic','Catalan Athletic','CAA','Spain','Estadi Catalunya',79500,'#173A78','#C83B4B',5,'Possession',1],
  ['capital-real','Capital Real','CPR','Spain','Royal Capital Stadium',81300,'#E8EDF5','#D6AE43',5,'Possession',1],
  ['valencia-coast','Valencia Coast','VCC','Spain','Mediterranean Park',51300,'#F28C28','#173A78',3,'Counter-Attack',1],
  ['basque-union','Basque Union','BSU','Spain','Northern Cathedral',48200,'#B32632','#E8EDF5',3,'Gegenpress',1],
  ['bavarian-royals','Bavarian Royals','BVR','Germany','Bavaria Arena',75200,'#B91C35','#E8EDF5',5,'Possession',1],
  ['rhine-sporting','Rhine Sporting','RHS','Germany','Rhine Stadion',55200,'#111827','#E84A4A',4,'Gegenpress',1],
  ['paris-metropole','Paris Metropole','PAM','France','Metropole Parc',62200,'#173A78','#E8EDF5',5,'Possession',1],
  ['riviera-olympique','Riviera Olympique','RVO','France','Riviera Arena',48300,'#1C4E91','#F6C21C',3,'Counter-Attack',1],
  ['milan-heritage','Milan Heritage','MIH','Italy','Heritage San Siro',74800,'#15191F','#C93A43',5,'Counter-Attack',1],
  ['turin-athletic','Turin Athletic','TUA','Italy','Turin Arena',41200,'#E8EDF5','#111827',4,'Gegenpress',1],
  ['lisbon-sporting','Lisbon Sporting','LIS','Portugal','Lisbon National',65400,'#176B4B','#E8EDF5',4,'Possession',1],
  ['porto-norte','Porto Norte','PON','Portugal','Norte Stadium',50300,'#17447D','#E8EDF5',4,'Counter-Attack',1],
  ['copperbelt-fc','Copperbelt FC','CPF','Zambia','Copper Arena',32000,'#13386C','#F6C21C',2,'Gegenpress',2],
  ['lusaka-athletic','Lusaka Athletic','LUA','Zambia','Independence Ground',28500,'#176B4B','#E8EDF5',2,'Possession',2],
  ['coastal-rangers','Coastal Rangers','COR','South Africa','Coastal Park',35000,'#0E4B70','#E8EDF5',2,'Counter-Attack',2],
  ['highland-rovers','Highland Rovers','HIR','Scotland','Highland Stadium',27000,'#6D1D32','#E8EDF5',2,'Gegenpress',2],
] as const;
const firstNames = ['Aiden','Mateo','Noah','Elias','Luca','Milan','Theo','Amir','Daniel','Jonas','Kofi','Tariq','Santiago','Rafael','Nico','Musa','Jamal','Ethan','Ibrahim','Felix','Andre','Samuel','Leo','Kai','Omar','Dario','Victor','Bastien','Malik','Enzo'];
const surnames = ['Bennett','Silva','Mensah','Okafor','Moretti','Hansen','Diallo','Costa','Meyer','Ndlovu','Rossi','Adeyemi','Fernandez','Kamara','Pereira','Banda','Mokoena','Santos','Kovac','Traore','Mills','Duarte','Mwamba','Petrov','Clarke','Sarr','Mendes','Nkosi','Jensen','Moyo'];
const positions:Position[] = ['GK','GK','CB','CB','CB','LB','RB','CB','CDM','CDM','CM','CM','CM','CAM','CAM','LW','RW','LW','ST','ST','ST','ST'];
const nations = ['England','Spain','Ghana','Nigeria','Italy','Germany','Senegal','Portugal','France','Zambia','Brazil','Morocco','Netherlands','South Africa'];
const hash=(s:string)=>Array.from(s).reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),7);
const clamp=(n:number,min=1,max=99)=>Math.max(min,Math.min(max,Math.round(n)));
function makePlayer(seed:string, clubId:string, rep:number, index:number, division:number):OfflinePlayer {
  const h=hash(seed+'-'+index), pos=positions[index], age=17+(h%19), base=clamp(rep-(division===2?12:0)+(h%15)-7,48,91);
  const gk=pos==='GK', def=['CB','LB','RB','CDM'].includes(pos), mid=['CM','CAM'].includes(pos), wing=['LW','RW'].includes(pos);
  const attrs:OfflineAttributes={
    pace:clamp(base+(wing?9:def?-5:0)+(h%9)-4), shooting:clamp(base+(gk?-55:wing?2:0)+(h%11)-5),
    passing:clamp(base+(mid?8:gk?-55:0)+(h%9)-4), dribbling:clamp(base+(wing||mid?7:0)+(h%9)-4),
    defending:clamp(base+(def?10:gk?-55:-10)+(h%9)-4), physical:clamp(base+(def?5:0)+(h%11)-5),
    goalkeeping:gk?clamp(base+14):clamp(5+(h%8)), stamina:clamp(base+4+(h%9)-4),
    weakFoot:1+(h%5), skillMoves:gk?1:1+(Math.floor(h/7)%5)
  };
  const ovr=gk?clamp(attrs.goalkeeping*.48+attrs.passing*.08+attrs.physical*.12+attrs.stamina*.08+attrs.defending*.12+attrs.pace*.12):clamp((attrs.pace+attrs.shooting+attrs.passing+attrs.dribbling+attrs.defending+attrs.physical)/6);
  const potential=clamp(Math.max(ovr+2,Math.min(94,ovr+(age<22?8+(h%9):age<26?4+(h%5):2+(h%4)))));
  const value=Math.round(Math.pow(Math.max(1,ovr-35),2.35)*(age<23?1.5:age>30?.55:1.05)*18000/10000)*10000;
  return {id:clubId+'-p'+String(index+1).padStart(2,'0'),name:firstNames[h%firstNames.length]+' '+surnames[Math.floor(h/11)%surnames.length],nationality:nations[h% nations.length],age,heightCm:pos==='GK'?188+h%10:170+h%24,preferredFoot:h%3===0?'Left':'Right',squadNumber:index+1,primaryPos:pos,secondaryPos:pos==='GK'?[]:pos==='CB'?['LB']:pos==='CM'?['CDM','CAM']:pos==='LW'?['RW','ST']:pos==='ST'?['CAM','LW']:['CM'],attributes:attrs,ovr,potential,potentialRange:[Math.max(ovr,potential-5),potential],marketValue:Math.max(25000,value),weeklyWage:Math.max(350,Math.round(value*.00035/50)*50),contractExpiryYear:2027+(h%5),isAcademyProspect:age<=19};
}
export const OFFLINE_CLUBS:OfflineClub[]=clubSeeds.map((s)=>{const [id,name,code,country,stadium,capacity,primary,secondary,prestige,tactic,division]=s;const rep=prestige*17+10;return {id,fullName:name+' Football Club',name,shortCode:code,country,leagueName:division===1?'Dynasty Premier Division':'Dynasty Development League',division,stadiumName:stadium,stadiumCapacity:capacity,primaryColor:primary,secondaryColor:secondary,shieldStyle:hash(id)%3===0?'round':hash(id)%3===1?'classic':'modern',transferBudget:division===1?rep*rep*24000:rep*rep*3200,wageBudget:division===1?rep*rep*900:rep*rep*160,clubPrestige:prestige,tacticalIdentity:tactic,players:Array.from({length:22},(_,i)=>makePlayer(id,id,rep,i,division))};});
export const OFFLINE_PLAYERS:OfflinePlayer[]=OFFLINE_CLUBS.flatMap(c=>c.players);
export const getOfflineClub=(id:string)=>OFFLINE_CLUBS.find(c=>c.id===id);
export const getOfflinePlayers=(clubId:string)=>getOfflineClub(clubId)?.players??[];
export const OFFLINE_DATABASE_VERSION='1.0.0';
