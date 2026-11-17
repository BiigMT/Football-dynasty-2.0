import assert from 'node:assert/strict';
import { getPlayerSeparationOffset, steerPlayerVelocity } from '../src/engine/matchPhysics';

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
