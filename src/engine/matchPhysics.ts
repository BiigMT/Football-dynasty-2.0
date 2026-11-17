export interface PitchVector2 { x:number; z:number; }

/** Smooth acceleration with braking near the target; used only by the 3D presentation layer. */
export function steerPlayerVelocity(
  position:PitchVector2,
  velocity:PitchVector2,
  target:PitchVector2,
  deltaSeconds:number,
  maxSpeed=6.5,
  acceleration=16,
):PitchVector2 {
  const dt=Math.max(0,Math.min(.05,deltaSeconds));
  const dx=target.x-position.x,dz=target.z-position.z;
  const distance=Math.hypot(dx,dz);
  if(distance<.035){
    const damping=Math.max(0,1-dt*9);
    return {x:velocity.x*damping,z:velocity.z*damping};
  }
  const brakingSpeed=Math.sqrt(Math.max(0,2*acceleration*distance));
  const speed=Math.min(maxSpeed,brakingSpeed);
  const desired={x:dx/distance*speed,z:dz/distance*speed};
  const blend=1-Math.exp(-acceleration*dt/Math.max(1,maxSpeed));
  return {x:velocity.x+(desired.x-velocity.x)*blend,z:velocity.z+(desired.z-velocity.z)*blend};
}

/** Small soft separation force to prevent presentation rigs occupying the same space. */
export function getPlayerSeparationOffset(
  position:PitchVector2,
  neighbours:PitchVector2[],
  radius=1.45,
):PitchVector2 {
  let x=0,z=0;
  for(const other of neighbours){
    const dx=position.x-other.x,dz=position.z-other.z;
    const distance=Math.hypot(dx,dz);
    if(distance<=.0001||distance>=radius)continue;
    const strength=((radius-distance)/radius)**2*.72;
    x+=(dx/distance)*strength;
    z+=(dz/distance)*strength;
  }
  const length=Math.hypot(x,z);
  if(length>.9){x=x/length*.9;z=z/length*.9;}
  return {x,z};
}
