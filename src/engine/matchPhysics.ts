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


export interface BallPresentationState {
  position: { x:number; y:number; z:number };
  velocity: { x:number; y:number; z:number };
}
export interface BallPresentationStep extends BallPresentationState {
  spin:number;
  contacts:number;
}

/**
 * Presentation-only ball dynamics. The authoritative match engine still owns
 * the ball target and all outcomes; this adds momentum, ground friction,
 * player-body contact and a small impact bounce between authoritative updates.
 */
export function advanceBallPresentation(
  state:BallPresentationState,
  target:{x:number;z:number},
  players:PitchVector2[],
  deltaSeconds:number,
):BallPresentationStep {
  const dt=Math.max(0,Math.min(.05,deltaSeconds));
  let {x,y,z}=state.position;
  let vx=state.velocity.x, vy=state.velocity.y, vz=state.velocity.z;
  const dx=target.x-x,dz=target.z-z;
  const distance=Math.hypot(dx,dz);
  if(distance>.0001){
    const brakingSpeed=Math.sqrt(Math.max(0,2*22*distance));
    const desiredSpeed=Math.min(24,brakingSpeed);
    const desiredX=dx/distance*desiredSpeed, desiredZ=dz/distance*desiredSpeed;
    const blend=1-Math.exp(-22*dt/24);
    vx+=(desiredX-vx)*blend;
    vz+=(desiredZ-vz)*blend;
  }else{
    const friction=Math.exp(-4.8*dt);
    vx*=friction; vz*=friction;
  }
  x+=vx*dt; z+=vz*dt;

  let contacts=0;
  for(const player of players){
    let px=x-player.x,pz=z-player.z;
    let separation=Math.hypot(px,pz);
    const contactRadius=.62;
    if(separation>=contactRadius)continue;
    if(separation<.0001){px=1;pz=0;separation=1;}
    const nx=px/separation,nz=pz/separation;
    x=player.x+nx*contactRadius;
    z=player.z+nz*contactRadius;
    const normalSpeed=vx*nx+vz*nz;
    if(normalSpeed<0){
      const restitution=.34;
      vx-=(1+restitution)*normalSpeed*nx;
      vz-=(1+restitution)*normalSpeed*nz;
      vy=Math.max(vy,Math.min(1.35,Math.abs(normalSpeed)*.12));
    }
    contacts++;
  }

  vy-=9.81*dt;
  y+=vy*dt;
  if(y<.34){
    y=.34;
    if(vy<0)vy=-vy*.28;
    if(vy<.55)vy=0;
  }
  if(x < -52.3){x=-52.3;vx=Math.abs(vx)*.25;}
  if(x > 52.3){x=52.3;vx=-Math.abs(vx)*.25;}
  if(z < -33.8){z=-33.8;vz=Math.abs(vz)*.25;}
  if(z > 33.8){z=33.8;vz=-Math.abs(vz)*.25;}
  const speed=Math.hypot(vx,vz);
  return {
    position:{x,y,z},
    velocity:{x,y:vy,z},
    spin:speed,
    contacts,
  };
}
