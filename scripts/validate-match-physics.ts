import assert from 'node:assert/strict';
import { advanceBallPresentation, getPlayerSeparationOffset, steerPlayerVelocity } from '../src/engine/matchPhysics';

const offset=getPlayerSeparationOffset({x:0,z:0},[{x:.5,z:0}]);
assert.ok(offset.x<0,'A player should be pushed away from an overlapping teammate');
assert.ok(Math.abs(offset.z)<.001,'A directly horizontal overlap should not create lateral drift');
const velocity=steerPlayerVelocity({x:0,z:0},{x:0,z:0},{x:20,z:0},1,6.5,16);
assert.ok(velocity.x>0&&velocity.x<=6.5,'Player steering should accelerate toward the target within speed limits');
const braking=steerPlayerVelocity({x:19.9,z:0},{x:2,z:0},{x:20,z:0},.05,6.5,16);
assert.ok(braking.x<2,'Player steering should brake when close to the target');
const settled=steerPlayerVelocity({x:20,z:0},{x:2,z:0},{x:20,z:0},.05);
assert.ok(settled.x<2,'Velocity should decay when the target is reached');
console.log('Validated 3D player acceleration, braking and soft collision avoidance.');


const movingBall=advanceBallPresentation(
  {position:{x:0,y:.34,z:0},velocity:{x:0,y:0,z:0}},
  {x:10,z:0},[],.05,
);
assert.ok(movingBall.position.x>0&&movingBall.velocity.x>0,'Ball should accelerate toward the authoritative target');
assert.ok(movingBall.position.y>=.34,'Ball must remain above the turf');
const playerImpact=advanceBallPresentation(
  {position:{x:0,y:.34,z:0},velocity:{x:4,y:0,z:0}},
  {x:10,z:0},[{x:.3,z:0}],.016,
);
assert.equal(playerImpact.contacts,1,'Ball should register contact with a nearby player rig');
assert.ok(playerImpact.velocity.x<0,'Player contact should deflect an incoming ball');
assert.ok(playerImpact.position.y>.34,'A strong player impact should create a small bounce');
const rolling=advanceBallPresentation(
  {position:{x:0,y:.34,z:0},velocity:{x:2,y:0,z:0}},
  {x:0,z:0},[],.05,
);
assert.ok(Math.hypot(rolling.velocity.x,rolling.velocity.z)<2,'Ground friction should slow a rolling ball');
const sideline=advanceBallPresentation(
  {position:{x:52.25,y:.34,z:0},velocity:{x:8,y:0,z:0}},
  {x:60,z:0},[],.05,
);
console.log('Ball boundary response:',sideline.position,sideline.velocity);
assert.ok(sideline.position.x<=52.301&&sideline.velocity.x<0,'Ball should rebound inside the pitch boundary');
