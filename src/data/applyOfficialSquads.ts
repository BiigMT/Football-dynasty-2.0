import type { Player } from '../types/football';
import { PREMIER_LEAGUE_2026_SQUADS } from './premierLeagueSquads2026';

export interface OfficialSquadPlayer { name:string; shirtNumber?:number; }
export interface OfficialClubSquad { clubId:string; clubName:string; players:OfficialSquadPlayer[]; }

const slug = (value:string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/**
 * Reconciles official 2026/27 names and shirt numbers into the generated
 * player pool. Exact shirt-number matches are preferred; remaining official
 * entries use an unused generated record. Existing IDs and simulated
 * attributes/contracts stay intact.
 *
 * Positions, nationality, DOB, ratings and contracts are intentionally not
 * overwritten because the squad-number source does not establish those facts.
 */
export function applyOfficialSquads(players:Record<string,Player>, squads:readonly OfficialClubSquad[]):void {
  for(const squad of squads){
    const existing=Object.values(players)
      .filter(p=>p.clubId===squad.clubId)
      .sort((a,b)=>a.shirtNumber-b.shirtNumber || a.id.localeCompare(b.id));
    if(!existing.length) continue;

    const exactByNumber=new Map<number,Player>();
    for(const player of existing){
      if(!exactByNumber.has(player.shirtNumber)) exactByNumber.set(player.shirtNumber,player);
    }
    const reservedIds=new Set(
      squad.players
        .map(entry=>entry.shirtNumber ? exactByNumber.get(entry.shirtNumber)?.id : undefined)
        .filter((id):id is string=>Boolean(id))
    );
    const usedIds=new Set<string>();
    const seenNames=new Set<string>();

    squad.players.forEach((entry,index)=>{
      const key=slug(entry.name);
      if(seenNames.has(key)) return;
      seenNames.add(key);

      // A shirt-number match is more reliable than assuming generated roster
      // order corresponds to official registration order.
      let current=entry.shirtNumber
        ? exactByNumber.get(entry.shirtNumber)
        : existing.find(p=>slug(p.name)===key && !usedIds.has(p.id));
      if(current && usedIds.has(current.id)) current=undefined;

      // For newly registered numbers, use an unused generated record without
      // stealing one already reserved for a later exact shirt-number match.
      if(!current){
        current=existing.find(p=>!usedIds.has(p.id) && !reservedIds.has(p.id));
      }

      if(current){
        usedIds.add(current.id);
        players[current.id]={...current,name:entry.name,shirtNumber:entry.shirtNumber ?? current.shirtNumber};
        return;
      }

      // The generated pool is smaller than the official list: clone a
      // simulation template but give the real player a deterministic ID.
      const template=existing[index%existing.length];
      const id='real_'+squad.clubId+'_'+key;
      if(players[id]) return;
      const occupiedNumbers=new Set(Object.values(players).filter(p=>p.clubId===squad.clubId).map(p=>p.shirtNumber));
      let shirtNumber=entry.shirtNumber;
      if(!shirtNumber || occupiedNumbers.has(shirtNumber)){
        shirtNumber=1;
        while(occupiedNumbers.has(shirtNumber) && shirtNumber<99) shirtNumber++;
      }
      players[id]={
        ...template,
        id,
        name:entry.name,
        shirtNumber,
        clubId:squad.clubId,
        seasonStats:{...template.seasonStats},
        careerHistory:[],
        injuredWeeks:0,
        suspendedMatches:0,
        isYouth:template.age<=21,
      };
    });
  }
}

/** Backwards-compatible entry point for the existing Premier League snapshot. */
export function applyOfficialPremierLeagueSquads(players:Record<string,Player>):void {
  applyOfficialSquads(players,PREMIER_LEAGUE_2026_SQUADS);
}
