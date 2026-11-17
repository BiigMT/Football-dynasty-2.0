import type { Player } from '../types/football';
import { PREMIER_LEAGUE_2026_SQUADS } from './premierLeagueSquads2026';

const slug = (value:string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/**
 * Reconciles official 2026/27 names and shirt numbers into the generated
 * player pool. Existing game IDs and all simulated attributes/contracts stay
 * intact; additional registered players receive deterministic IDs.
 *
 * Positions, nationality, DOB, ratings and contracts are intentionally not
 * overwritten because the squad-number source does not establish those facts.
 */
export function applyOfficialPremierLeagueSquads(players:Record<string,Player>):void {
  for(const squad of PREMIER_LEAGUE_2026_SQUADS){
    const existing=Object.values(players).filter(p=>p.clubId===squad.clubId).sort((a,b)=>a.shirtNumber-b.shirtNumber);
    if(!existing.length) continue;
    const byName=new Set<string>();
    squad.players.forEach((entry,index)=>{
      const key=slug(entry.name);
      if(byName.has(key)) return;
      byName.add(key);
      const current=existing[index];
      if(current){
        players[current.id]={...current,name:entry.name,shirtNumber:entry.shirtNumber};
        return;
      }
      const template=existing[index%existing.length];
      const id='real_'+squad.clubId+'_'+key;
      if(players[id]) return;
      players[id]={
        ...template,
        id,
        name:entry.name,
        shirtNumber:entry.shirtNumber,
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
