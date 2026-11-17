import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Club, MatchSession, Player } from '../types/football';
import { getFormationCoordinates } from '../engine/matchEngine';
import { getMatchPresentationCue } from '../engine/matchPresentation';

export type StadiumCameraMode = 'TV' | 'TACTICAL' | 'DUGOUT';
interface Stadium3DProps {
  session: MatchSession;
  homeClub: Club;
  awayClub: Club;
  players: Record<string, Player>;
  cameraMode?: StadiumCameraMode;
  onCameraModeChange?: (mode: StadiumCameraMode) => void;
  reducedMotion?: boolean;
  onFps?: (fps:number)=>void;
}

type Rig = { root: any; legs: any[]; arms: any[]; badge: any; id: string; side: 'HOME'|'AWAY'; base: any; phase: number; action?: 'PASS'|'TACKLE'|'SHOT'|'SAVE'|'CELEBRATE'; actionUntil?: number; presentationTarget?: {x:number;y:number}; presentationUntil?: number };
const FIELD_W = 105;
const FIELD_D = 68;
const mapPitch = (x:number,y:number) => new THREE.Vector3(((x/100)-.5)*FIELD_W,0,((y/100)-.5)*FIELD_D);
const surname = (name:string) => name.trim().split(/\s+/).slice(-1)[0] || name;

function makePlayerBadge(player: Player, stamina:number, shirt:number, color:string) {
  const canvas=document.createElement('canvas'); canvas.width=256; canvas.height=80;
  const c=canvas.getContext('2d')!;
  c.fillStyle='rgba(5,12,23,.88)'; c.beginPath(); c.roundRect(2,2,252,76,16); c.fill();
  c.strokeStyle=color; c.lineWidth=3; c.stroke();
  c.fillStyle=color; c.font='bold 22px Arial'; c.fillText(String(shirt).padStart(2,'0'),14,31);
  c.fillStyle='#fff'; c.font='bold 22px Arial'; c.fillText(surname(player.name).slice(0,13),52,31);
  c.fillStyle='rgba(255,255,255,.15)'; c.fillRect(14,48,226,10);
  c.fillStyle=stamina<30?'#ffb020':stamina<55?'#00e5ff':'#00e676'; c.fillRect(14,48,226*Math.max(0,Math.min(1,stamina/100)),10);
  const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sprite.scale.set(7.6,2.35,1); sprite.position.y=3.7; sprite.renderOrder=10;
  return sprite;
}

function makeAthlete(color:string, trim:string) {
  const group=new THREE.Group();
  const kit=new THREE.MeshStandardMaterial({color,roughness:.72});
  const accent=new THREE.MeshStandardMaterial({color:trim,roughness:.7});
  const skin=new THREE.MeshStandardMaterial({color:'#b98260',roughness:.9});
  const dark=new THREE.MeshStandardMaterial({color:'#111827',roughness:.8});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.78,4,8),kit); torso.position.y=1.48; group.add(torso);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(.72,.12,.06),accent); chest.position.set(0,1.62,.46); group.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),skin); head.position.y=2.18; group.add(head);
  const shorts=new THREE.Mesh(new THREE.BoxGeometry(.72,.42,.48),dark); shorts.position.y=.94; group.add(shorts);
  const legs:any[]=[];
  for(const x of [-.22,.22]){
    const leg=new THREE.Group(); leg.position.set(x,.78,0);
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.48,3,6),dark); thigh.position.y=-.28; leg.add(thigh);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.34),dark); boot.position.set(0,-.58,.1); leg.add(boot);
    group.add(leg); legs.push(leg);
  }
  const arms:any[]=[];
  for(const x of [-.52,.52]){
    const arm=new THREE.Group(); arm.position.set(x,1.78,0);
    const limb=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.55,3,6),kit); limb.rotation.z=x<0?-.12:.12; arm.add(limb); group.add(arm); arms.push(arm);
  }
  group.traverse((o:any)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  return {group,legs,arms};
}

export const Stadium3D: React.FC<Stadium3DProps> = ({session,homeClub,awayClub,players,cameraMode='TV',reducedMotion=false,onFps}) => {
  const hostRef=useRef<HTMLDivElement|null>(null);
  const liveRef=useRef({session,homeClub,awayClub,players,cameraMode,reducedMotion,onFps});
  useEffect(()=>{liveRef.current={session,homeClub,awayClub,players,cameraMode,reducedMotion,onFps};},[session,homeClub,awayClub,players,cameraMode,reducedMotion]);

  useEffect(()=>{
    const host=hostRef.current; if(!host)return;
    let renderer:any, scene:any, camera:any, raf=0, resizeObserver:ResizeObserver|undefined;
    const rigs=new Map<string,Rig>();
    let homeFormationName=session.homeTactics.formation, awayFormationName=session.awayTactics.formation;
    let homeFormation=getFormationCoordinates(homeFormationName), awayFormation=getFormationCoordinates(awayFormationName);
    let ball:any, ballShadow:any, lastBall=mapPitch(session.ballPos.x,session.ballPos.y), ballTarget=lastBall.clone(), ballVelocity=new THREE.Vector3();
    let activeBallFlight:{from:any;to:any;startedAt:number;duration:number;arc:number}|null=null;
    let cameraTarget=new THREE.Vector3(0,31,47), lookTarget=new THREE.Vector3(0,0,0);
    let lastFrame=performance.now(), elapsed=0, fpsFrames=0, fpsWindow=lastFrame;
    const processedEventIds=new Set<string>(session.events.map(event=>event.id));
    try{
      renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power'});
      const isMobileDevice=/Android|iPhone|iPad/i.test(navigator.userAgent||'');
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isMobileDevice?1:1.35));
      renderer.setSize(host.clientWidth,host.clientHeight);
      renderer.shadowMap.enabled=!isMobileDevice; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.15; host.appendChild(renderer.domElement);
    }catch{
      host.innerHTML='<div class="absolute inset-0 grid place-items-center bg-[#081321] p-6 text-center text-sm text-slate-300">3D graphics are unavailable on this device. Switch to 2D Tactical to continue watching the match.</div>';
      return;
    }
    scene=new THREE.Scene(); scene.background=new THREE.Color('#080e1a'); scene.fog=new THREE.Fog('#101e2d',75,175);
    camera=new THREE.PerspectiveCamera(39,host.clientWidth/Math.max(1,host.clientHeight),.1,300);
    camera.position.copy(cameraTarget); camera.lookAt(lookTarget);

    const hemi=new THREE.HemisphereLight('#dbeafe','#142b1c',2.0); scene.add(hemi);
    const key=new THREE.DirectionalLight('#fff3d1',3.2); key.position.set(-32,58,24); key.castShadow=!/Android|iPhone|iPad/i.test(navigator.userAgent||''); key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-70;key.shadow.camera.right=70;key.shadow.camera.top=55;key.shadow.camera.bottom=-55;scene.add(key);
    [[-54,30,-38],[54,30,-38],[-54,30,38],[54,30,38]].forEach(([x,y,z])=>{
      const lamp=new THREE.PointLight('#d9edff',850,105,2); lamp.position.set(x,y,z); scene.add(lamp);
      const mast=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,28,6),new THREE.MeshStandardMaterial({color:'#344457',metalness:.65,roughness:.4}));mast.position.set(x,14,z);scene.add(mast);
      const head=new THREE.Mesh(new THREE.BoxGeometry(2.2,.55,.8),new THREE.MeshBasicMaterial({color:'#fff7d6'}));head.position.set(x,28,z);scene.add(head);
    });

    // Pitch and alternating turf bands.
    const grass=new THREE.Mesh(new THREE.PlaneGeometry(FIELD_W,FIELD_D),new THREE.MeshStandardMaterial({color:'#176b3d',roughness:1}));grass.rotation.x=-Math.PI/2;grass.receiveShadow=true;scene.add(grass);
    for(let i=0;i<10;i++){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(FIELD_W/10,FIELD_D),new THREE.MeshBasicMaterial({color:i%2?'#ffffff':'#071b12',transparent:true,opacity:.055,depthWrite:false}));stripe.rotation.x=-Math.PI/2;stripe.position.set(-FIELD_W/2+FIELD_W/20+i*FIELD_W/10,.012,0);scene.add(stripe);}
    const lineMat=new THREE.MeshBasicMaterial({color:'#f4fbff'});
    const line=(points:any[],closed=false)=>{const geo=new THREE.BufferGeometry().setFromPoints(points);const obj=new THREE.Line(geo,lineMat);scene.add(obj);if(closed){const loop=new THREE.LineLoop(geo,lineMat);scene.add(loop);obj.visible=false;}};
    const rect=(x1:number,z1:number,x2:number,z2:number)=>line([new THREE.Vector3(x1,.035,z1),new THREE.Vector3(x2,.035,z1),new THREE.Vector3(x2,.035,z2),new THREE.Vector3(x1,.035,z2)],true);
    rect(-52.5,-34,52.5,34);line([new THREE.Vector3(0,.04,-34),new THREE.Vector3(0,.04,34)]);
    const circle=(radius:number,cx=0,cz=0)=>{const pts=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;pts.push(new THREE.Vector3(cx+Math.cos(a)*radius,.04,cz+Math.sin(a)*radius));}line(pts);};
    circle(9.15);circle(.65);
    rect(-52.5,-20.16,-36,20.16);
    rect(36,-20.16,52.5,20.16);
    rect(-52.5,-9.16,-41.5,9.16);
    rect(41.5,-9.16,52.5,9.16);
    circle(1, -41.5,0);circle(1,41.5,0);

    // Goals, posts and net grids.
    const postMat=new THREE.MeshStandardMaterial({color:'#f8fafc',metalness:.25,roughness:.28});
    [-1,1].forEach(side=>{const x=side*52.5,z=0;const frame=new THREE.Group();[[-3.66,0],[3.66,0]].forEach(([dz])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,2.44,8),postMat);p.position.set(x,1.22,z+dz);frame.add(p);});const bar=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,7.32,8),postMat);bar.rotation.x=Math.PI/2;bar.position.set(x,2.44,z);frame.add(bar);const net=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.4,7.32),new THREE.MeshBasicMaterial({color:'#dbeafe',wireframe:true,transparent:true,opacity:.16}));net.position.set(x-side*1.6,1.2,z);frame.add(net);scene.add(frame);});
    // Stadium bowl with tier bands and a crowd ring built as one instanced mesh.
    const standMat=new THREE.MeshStandardMaterial({color:'#17283a',roughness:.94});
    for(let tier=0;tier<3;tier++){const stand=new THREE.Mesh(new THREE.CylinderGeometry(61+tier*5,58+tier*5,5,64,1,true),standMat);stand.position.y=6+tier*5;scene.add(stand);}
    const crowdGeo=new THREE.SphereGeometry(.16,5,4), crowdMat=new THREE.MeshStandardMaterial({color:'#94a3b8',roughness:1});
    const crowdCount=/Android|iPhone|iPad/i.test(navigator.userAgent||'')?650:1250;
    const crowd=new THREE.InstancedMesh(crowdGeo,crowdMat,crowdCount);const dummy=new THREE.Object3D();
    for(let i=0;i<crowdCount;i++){const a=i*2.39996,r=63+(i%4)*1.8;dummy.position.set(Math.cos(a)*r,8+(i%3)*4,Math.sin(a)*r);dummy.scale.setScalar(.55+(i%5)*.12);dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);crowd.setColorAt(i,new THREE.Color(['#e2e8f0','#64748b','#0ea5e9','#f59e0b','#ef4444'][i%5]));}scene.add(crowd);

    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.15,20),new THREE.MeshBasicMaterial({color:'#020617',transparent:true,opacity:.34,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;scene.add(shadow);ballShadow=shadow;
    ball=new THREE.Mesh(new THREE.SphereGeometry(.34,18,14),new THREE.MeshStandardMaterial({color:'#f8fafc',roughness:.38}));ball.position.copy(lastBall).setY(.38);ball.castShadow=true;scene.add(ball);
    const seam=new THREE.Mesh(new THREE.TorusGeometry(.2,.018,4,16),new THREE.MeshBasicMaterial({color:'#111827'}));seam.rotation.x=Math.PI/2;ball.add(seam);

    const addRigs=(ids:string[],side:'HOME'|'AWAY',club:Club)=>{
      const formation=getFormationCoordinates(side==='HOME'?session.homeTactics.formation:session.awayTactics.formation);
      ids.forEach((id,index)=>{const p=players[id];if(!p)return;const st=session.playerStates[id];if(st?.redCard)return;const f=formation[index]??{x:50,y:50};let x=f.x,y=f.y;if(side==='AWAY'){x=100-x;y=100-y;}const pos=mapPitch(x,y);const colors=side==='HOME'?['#00a8e8','#f8fafc']:['#ffc107','#111827'];const athlete=makeAthlete(colors[0],colors[1]);athlete.group.position.copy(pos);scene.add(athlete.group);const badge=makePlayerBadge(p,st?.stamina??100,p.shirtNumber,colors[0]);athlete.group.add(badge);rigs.set(id,{root:athlete.group,legs:athlete.legs,arms:athlete.arms,badge,id,side,base:pos.clone(),phase:index*.8});});
    };
    addRigs(session.homeTactics.startingXI,'HOME',homeClub);addRigs(session.awayTactics.startingXI,'AWAY',awayClub);

    const resize=()=>{if(!host||!renderer)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
    const tick=(now:number)=>{
      raf=requestAnimationFrame(tick);const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;elapsed+=dt;fpsFrames++;if(now-fpsWindow>=1000){liveRef.current.onFps?.(Math.round(fpsFrames*1000/(now-fpsWindow)));fpsFrames=0;fpsWindow=now;}
      const live=liveRef.current,s=live.session;
      if(s.homeTactics.formation!==homeFormationName){homeFormationName=s.homeTactics.formation;homeFormation=getFormationCoordinates(homeFormationName);}
      if(s.awayTactics.formation!==awayFormationName){awayFormationName=s.awayTactics.formation;awayFormation=getFormationCoordinates(awayFormationName);}
      const freshEvents=s.events.filter(event=>!processedEventIds.has(event.id));
      freshEvents.forEach(event=>{
        processedEventIds.add(event.id);
        const cue=getMatchPresentationCue(event,s,live.players,homeFormation,awayFormation);
        const actor=event.playerId?rigs.get(event.playerId):undefined;
        const cueDuration=elapsed+Math.max(1,(cue.ballFlight?.durationMs??900)/1000);
        if(actor&&cue.actorTarget){
          actor.presentationTarget=cue.actorTarget;
          actor.presentationUntil=cueDuration;
        }
        const receiver=cue.targetPlayerId?rigs.get(cue.targetPlayerId):undefined;
        if(receiver&&cue.targetPlayerTarget){
          receiver.presentationTarget=cue.targetPlayerTarget;
          receiver.presentationUntil=cueDuration;
          if(event.type==='SAVE'){receiver.action='SAVE';receiver.actionUntil=elapsed+1.55;}
        }
        if(cue.ballFlight){
          activeBallFlight={
            from:mapPitch(cue.ballFlight.from.x,cue.ballFlight.from.y),
            to:mapPitch(cue.ballFlight.to.x,cue.ballFlight.to.y),
            startedAt:elapsed,
            duration:cue.ballFlight.durationMs/1000,
            arc:cue.ballFlight.arc,
          };
        }
        if(event.type==='GOAL'){
          rigs.forEach(r=>{if(r.side===event.teamSide){r.action='CELEBRATE';r.actionUntil=elapsed+3.8;}});
        } else if(['PASS','TACKLE','SHOT','SAVE'].includes(event.type) && actor){
          actor.action=event.type as Rig['action']; actor.actionUntil=elapsed+1.55;
        }
      });
      Object.values(s.playerStates).forEach(st=>{
        if(!st.onPitch||rigs.has(st.playerId))return;
        const p=live.players[st.playerId];if(!p)return;
        const side=st.side,club=side==='HOME'?live.homeClub:live.awayClub;
        const colors=side==='HOME'?['#00a8e8','#f8fafc']:['#ffc107','#111827'];
        const athlete=makeAthlete(colors[0],colors[1]);
        const formation=side==='HOME'?homeFormation:awayFormation;
        const f=formation[Math.max(0,Math.min(10,st.slotIndex))]??{x:50,y:50};
        const pos=mapPitch(side==='HOME'?f.x:100-f.x,side==='HOME'?f.y:100-f.y);
        athlete.group.position.copy(pos);scene.add(athlete.group);
        const badge=makePlayerBadge(p,st.stamina,p.shirtNumber,colors[0]);athlete.group.add(badge);
        rigs.set(st.playerId,{root:athlete.group,legs:athlete.legs,arms:athlete.arms,badge,id:st.playerId,side,base:pos.clone(),phase:rigs.size*.71});
      });
      const targetBall=mapPitch(s.ballPos.x,s.ballPos.y);
      if(activeBallFlight){
        const progress=Math.min(1,Math.max(0,(elapsed-activeBallFlight.startedAt)/activeBallFlight.duration));
        const eased=progress*progress*(3-2*progress);
        const flight=activeBallFlight;
        ball.position.lerpVectors(flight.from,flight.to,eased);
        ball.position.y=.34+Math.sin(progress*Math.PI)*flight.arc;
        if(progress>=1){activeBallFlight=null;ballTarget.copy(targetBall);}
      }else{
        ballVelocity.lerp(targetBall.clone().sub(ball.position),Math.min(1,dt*4));
        ballTarget.lerp(targetBall,Math.min(1,dt*3.2));
        const arc=Math.min(3.8,ballVelocity.length()*.11);
        ball.position.set(ballTarget.x, .34+Math.sin(Math.min(1,ballVelocity.length()*.07)*Math.PI)*arc, ballTarget.z);
      }
      ball.rotation.x+=dt*4;ball.rotation.z+=dt*3;ballShadow.position.set(ball.position.x,.03,ball.position.z);ballShadow.scale.setScalar(Math.max(.5,1.25-ball.position.y*.13));
      rigs.forEach((rig,id)=>{
        const p=live.players[id],st=s.playerStates[id];if(!p||!st)return;
        rig.root.visible=st.onPitch&&!st.redCard;
        const formation=rig.side==='HOME'?homeFormation:awayFormation;
        const f=formation[Math.max(0,Math.min(10,st.slotIndex))]??{x:50,y:50};
        let tx=f.x,ty=f.y;if(rig.side==='AWAY'){tx=100-tx;ty=100-ty;}
        const bx=s.ballPos.x,by=s.ballPos.y;
        const rolePull=rig.side==='HOME'?(tx<55?.16:.34):(tx>45?.16:.34);
        tx=THREE.MathUtils.lerp(tx,bx,rolePull);ty=THREE.MathUtils.lerp(ty,by,.18);
        if(rig.presentationTarget&&(rig.presentationUntil??0)>elapsed){tx=rig.presentationTarget.x;ty=rig.presentationTarget.y;}
        else{rig.presentationTarget=undefined;rig.presentationUntil=undefined;}
        const target=mapPitch(tx,ty);rig.root.position.lerp(target,Math.min(1,dt*(rig.presentationTarget?4.8:2.2)));
        const dx=ball.position.x-rig.root.position.x,dz=ball.position.z-rig.root.position.z;
        if(Math.hypot(dx,dz)>.15)rig.root.rotation.y=Math.atan2(dx,dz);
        const running= !live.reducedMotion && s.phase!=='HALF_TIME' && s.phase!=='FULL_TIME';
        const active=Boolean(rig.action && (rig.actionUntil??0)>elapsed);
        if(!active){rig.action=undefined;rig.root.rotation.z=0;rig.root.position.y=0;}
        const stride=running?Math.sin(elapsed*8+rig.phase)*.48:0;
        rig.legs[0].rotation.x=active&&rig.action==='SHOT'?-.95:active&&rig.action==='PASS'?-.62:active&&rig.action==='TACKLE'?-.85:stride;
        rig.legs[1].rotation.x=active&&rig.action==='TACKLE'?.7:active&&rig.action==='SAVE'?-.35:-stride;
        rig.arms[0].rotation.x=active&&rig.action==='CELEBRATE'?-2.25:active&&rig.action==='SAVE'?-.8:-stride*.55;
        rig.arms[1].rotation.x=active&&rig.action==='CELEBRATE'?-2.25:active&&rig.action==='SAVE'?.8:stride*.55;
        if(active&&rig.action==='SAVE'){rig.root.rotation.z=Math.sin(elapsed*10)*.48;rig.root.position.y=.12;}
        else if(active&&rig.action==='TACKLE'){rig.root.rotation.z=.28;rig.root.position.y=-.12;}
        else if(active&&rig.action==='CELEBRATE'){rig.root.position.y=Math.abs(Math.sin(elapsed*8+rig.phase))*.42;}
        rig.badge.visible=st.onPitch;rig.badge.position.y=3.55;

      });
      const mode=live.cameraMode;
      if(mode==='TACTICAL'){cameraTarget.set(0,93,.01);lookTarget.set(0,0,0);camera.fov=48;}
      else if(mode==='DUGOUT'){cameraTarget.set(-4,13,48);lookTarget.set(0,0,0);camera.fov=47;}
      else{cameraTarget.set(THREE.MathUtils.clamp(ball.position.x*.22,-12,12),31,47);lookTarget.set(ball.position.x*.22,0,0);camera.fov=39;}
      camera.position.lerp(cameraTarget,Math.min(1,dt*1.7));camera.lookAt(lookTarget);camera.updateProjectionMatrix();
      renderer.render(scene,camera);
    };
    raf=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(raf);resizeObserver?.disconnect();renderer?.dispose();scene?.traverse((o:any)=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach((m:any)=>m.dispose?.());else o.material?.dispose?.();});if(renderer?.domElement.parentNode===host)host.removeChild(renderer.domElement);};
  },[]);
  return <div ref={hostRef} className="absolute inset-0 h-full w-full overflow-hidden bg-[#080e1a]" aria-label="Live three-dimensional football stadium broadcast view" />;
};
