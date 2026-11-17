import assert from 'node:assert/strict';
import { getDynamicPlayerTarget } from '../src/engine/matchPositioning';
import type { ClubTactics } from '../src/types/football';

const tactics=(pressing:ClubTactics['pressing'],mentality:ClubTactics['mentality']):ClubTactics=>({
  formation:'4-3-3',mentality,pressing,passing:'MIXED',tempo:60,
  startingXI:[],bench:[],captainId:'',
});
const base={x:22,y:35};
const ball={x:82,y:78};
const balanced=tactics('MID_PRESS','BALANCED');
const home=getDynamicPlayerTarget(base,ball,'HOME','CM',balanced);
const away=getDynamicPlayerTarget(base,{x:18,y:22},'AWAY','CM',balanced);
assert.ok(home.x>base.x,'Home midfield should move toward an advanced ball');
assert.ok(home.y>base.y,'Home midfield should shift toward the ball-side channel');
assert.ok(Math.abs(home.x-(100-away.x))<0.001,'Mirrored sides should produce mirrored x positions');
assert.ok(Math.abs(home.y-(100-away.y))<0.001,'Mirrored sides should produce mirrored y positions');
const lowBlock=getDynamicPlayerTarget(base,ball,'HOME','CB',tactics('LOW_BLOCK','DEFENSIVE'));
const gegenpress=getDynamicPlayerTarget(base,ball,'HOME','CB',tactics('GEGENPRESS','ALL_OUT'));
assert.ok(gegenpress.x>lowBlock.x,'Gegenpress/all-out should step the defensive line higher');
const keeper=getDynamicPlayerTarget({x:6,y:50},ball,'HOME','GK',balanced);
assert.ok(keeper.x<20,'Goalkeeper should remain close to goal');
for(const point of [home,away,lowBlock,gegenpress,keeper]){
  assert.ok(point.x>=3&&point.x<=97&&point.y>=3&&point.y<=97,'All targets must remain inside pitch bounds');
}
console.log('Validated ball-aware player positioning, side mirroring, tactical intensity and pitch bounds.');
