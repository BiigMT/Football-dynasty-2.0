import type { OfflineClub, OfflinePlayer } from './offlineDatabase';
export interface SquadPack { schemaVersion:string; packName:string; createdAt:string; clubs:OfflineClub[]; }
export interface SquadPackResult { pack:SquadPack; warnings:string[]; }
const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const validPlayer=(value:unknown):value is OfflinePlayer=>{
 if(!isRecord(value))return false;
 return typeof value.id==='string'&&typeof value.name==='string'&&typeof value.age==='number'&&value.age>=15&&value.age<=40&&typeof value.ovr==='number'&&value.ovr>=1&&value.ovr<=99&&typeof value.potential==='number'&&value.potential>=value.ovr&&value.potential<=99&&isRecord(value.attributes)&&typeof value.primaryPos==='string';
};
const validClub=(value:unknown):value is OfflineClub=>{
 if(!isRecord(value)||!Array.isArray(value.players))return false;
 return typeof value.id==='string'&&typeof value.name==='string'&&typeof value.shortCode==='string'&&typeof value.stadiumName==='string'&&typeof value.stadiumCapacity==='number'&&typeof value.primaryColor==='string'&&typeof value.secondaryColor==='string'&&value.players.length>=22&&value.players.length<=25&&value.players.every(validPlayer);
};
export function exportSquadPack(clubs:OfflineClub[],packName='Football Dynasty Community Squad Pack'):string {
 const pack:SquadPack={schemaVersion:'1.0.0',packName,createdAt:new Date().toISOString(),clubs};
 return JSON.stringify(pack,null,2);
}
export function importSquadPack(source:string):SquadPackResult {
 let raw:unknown;
 try{raw=JSON.parse(source);}catch{throw new Error('This squad pack is not valid JSON.');}
 if(!isRecord(raw)||raw.schemaVersion!=='1.0.0'||!Array.isArray(raw.clubs))throw new Error('Unsupported squad pack. Expected schema version 1.0.0.');
 const clubs=raw.clubs.filter(validClub);
 if(clubs.length===0)throw new Error('No valid clubs found. Each club must include a complete 22–25 player squad.');
 const warnings:string[]=[];
 if(clubs.length!==raw.clubs.length)warnings.push((raw.clubs.length-clubs.length)+' club record(s) were skipped because their metadata or squad was incomplete.');
 const ids=new Set<string>();
 for(const club of clubs)for(const player of club.players){if(ids.has(player.id))warnings.push('Duplicate player ID detected: '+player.id);ids.add(player.id);}
 return {pack:{schemaVersion:'1.0.0',packName:typeof raw.packName==='string'?raw.packName:'Imported Squad Pack',createdAt:typeof raw.createdAt==='string'?raw.createdAt:new Date().toISOString(),clubs},warnings};
}
