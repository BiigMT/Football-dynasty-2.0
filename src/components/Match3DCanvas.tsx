import React, { useEffect, useRef, useState } from 'react';
import { Club, MatchSession, Player } from '../types/football';
import { getFormationCoordinates } from '../engine/matchEngine';

interface Props { session: MatchSession; homeClub: Club; awayClub: Club; players: Record<string, Player>; }

/**
 * Lightweight perspective match renderer. Uses Canvas 2D projection so it works
 * without a heavyweight WebGL dependency on entry-level Android devices.
 * The match simulation remains authoritative in matchEngine.ts.
 */
export const Match3DCanvas: React.FC<Props> = ({ session, homeClub, awayClub, players }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [camera, setCamera] = useState(0);
  const drag = useRef<{x:number; camera:number}|null>(null);
  const state = useRef({session,homeClub,awayClub,players,camera:0});
  useEffect(()=>{state.current={...state.current,session,homeClub,awayClub,players};},[session,homeClub,awayClub,players]);
  useEffect(()=>{state.current.camera=camera;},[camera]);

  useEffect(()=>{
    const canvas=canvasRef.current; const ctx=canvas?.getContext('2d'); if(!canvas||!ctx)return;
    let frame=0, last=performance.now();
    const project=(x:number,y:number,z:number,cam:number)=>{
      const angle=cam*Math.PI/180, rx=x*Math.cos(angle)-y*Math.sin(angle), ry=x*Math.sin(angle)+y*Math.cos(angle);
      const depth=1.15+ry*.42;
      return {x:canvas.width*.5+rx*canvas.width*.44/depth,y:canvas.height*.18+(z+ry*.22)*canvas.height*.74/depth,scale:1/depth};
    };
    const draw=(now:number)=>{
      last=now;
      const s=state.current, W=canvas.width,H=canvas.height;
      ctx.clearRect(0,0,W,H);
      const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#101d2b');sky.addColorStop(.48,'#263b4b');sky.addColorStop(1,'#0b241a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      // Stadium tiers and floodlights
      ctx.fillStyle='#172330';ctx.beginPath();ctx.moveTo(0,H*.25);ctx.lineTo(W*.5,H*.1);ctx.lineTo(W,H*.25);ctx.lineTo(W,H*.55);ctx.lineTo(0,H*.55);ctx.closePath();ctx.fill();
      for(let row=0;row<4;row++){ctx.strokeStyle='rgba(211,226,236,'+(0.12-row*.02)+')';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,H*(.29+row*.055));ctx.quadraticCurveTo(W*.5,H*(.15+row*.055),W,H*(.29+row*.055));ctx.stroke();}
      for(const x of [W*.12,W*.88]){const g=ctx.createRadialGradient(x,H*.19,2,x,H*.19,90);g.addColorStop(0,'rgba(255,245,205,.32)');g.addColorStop(1,'rgba(255,245,205,0)');ctx.fillStyle=g;ctx.fillRect(x-90,H*.08,180,180);}
      // Perspective pitch plane
      const corners=[project(-1,-1,0,s.camera),project(1,-1,0,s.camera),project(1,1,0,s.camera),project(-1,1,0,s.camera)];
      ctx.fillStyle='#17623a';ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
      for(let i=0;i<10;i++){const x=-1+i*.2,p1=project(x,-1,0,s.camera),p2=project(x+.2,-1,0,s.camera),p3=project(x+.2,1,0,s.camera),p4=project(x,1,0,s.camera);ctx.fillStyle=i%2?'rgba(255,255,255,.035)':'rgba(0,0,0,.035)';ctx.beginPath();[p1,p2,p3,p4].forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();}
      ctx.strokeStyle='rgba(255,255,255,.78)';ctx.lineWidth=2;
      const line=(a:{x:number,y:number},b:{x:number,y:number})=>{const p=project(a.x,a.y,0,s.camera),q=project(b.x,b.y,0,s.camera);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();};
      line({x:-1,y:-1},{x:1,y:-1});line({x:1,y:-1},{x:1,y:1});line({x:1,y:1},{x:-1,y:1});line({x:-1,y:1},{x:-1,y:-1});line({x:0,y:-1},{x:0,y:1});
      const center=project(0,0,0,s.camera);ctx.beginPath();ctx.ellipse(center.x,center.y,W*.085,H*.105,0,0,Math.PI*2);ctx.stroke();
      const box=(x:number)=>{line({x,y:-.48},{x:x===-1?-.48:.48,y:-.48});line({x:x===-1?-.48:.48,y:-.48},{x:x===-1?-.48:.48,y:.48});line({x:x===-1?-.48:.48,y:.48},{x,y:.48});};
      box(-1);box(1);
      const dots:{x:number;y:number;z:number;color:string;shirt:string;name:string;radius:number}[]=[];
      const addTeam=(xi:string[],side:'HOME'|'AWAY',club:Club)=>{
        const formation=getFormationCoordinates(side==='HOME'?s.session.homeTactics.formation:s.session.awayTactics.formation);
        xi.forEach((id,index)=>{const st=s.session.playerStates[id];if(st?.redCard)return;const f=formation[index]??{x:50,y:50};let x=(f.x-50)/50*.82,y=(f.y-50)/50*.78;if(side==='AWAY'){x=-x;y=-y;}const p=s.players[id];dots.push({x,y,z:.035,color:club.primaryColor,shirt:String(p?.shirtNumber??index+1),name:p?.name??'',radius:Math.max(5,10/(1+y*.18)),});});
      };
      addTeam(s.session.homeTactics.startingXI,'HOME',s.homeClub);addTeam(s.session.awayTactics.startingXI,'AWAY',s.awayClub);
      dots.sort((a,b)=>a.y-b.y);
      for(const d of dots){const p=project(d.x,d.y,d.z,s.camera),r=d.radius*p.scale;ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(p.x,p.y+r*1.8,r*1.1,r*.35,0,0,Math.PI*2);ctx.fill();const grad=ctx.createRadialGradient(p.x-r*.35,p.y-r*.4,1,p.x,p.y,r);grad.addColorStop(0,'#ffffff');grad.addColorStop(.2,d.color);grad.addColorStop(1,'#07111b');ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(p.x,p.y,r*.72,r*1.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f1f5f9';ctx.font='bold '+Math.max(8,10*p.scale)+'px sans-serif';ctx.textAlign='center';ctx.fillText(d.shirt,p.x,p.y+r*.35);}
      const ball=project((s.session.ballPos.x-50)/50*.85,(s.session.ballPos.y-50)/50*.8,.07,s.camera);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,Math.max(3,5*ball.scale),0,Math.PI*2);ctx.fill();ctx.strokeStyle='#17202b';ctx.lineWidth=1;ctx.stroke();
      // Broadcast overlay
      ctx.fillStyle='rgba(4,10,17,.78)';ctx.fillRect(18,16,260,54);ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.fillText(s.homeClub.shortName+'  '+s.session.homeStats.goals+' - '+s.session.awayStats.goals+'  '+s.awayClub.shortName,30,39);ctx.fillStyle='#8ed9e9';ctx.font='11px sans-serif';ctx.fillText(s.session.phase==='PRE_MATCH'?'MATCH PREVIEW':s.session.phase==='FULL_TIME'?'FULL TIME':s.session.minute+"'  LIVE",30,57);
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
  },[]);
  return <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#0b1722]">
    <canvas ref={canvasRef} width={960} height={540} className="block w-full aspect-video touch-pan-y" onPointerDown={e=>{drag.current={x:e.clientX,camera};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)setCamera(Math.max(-24,Math.min(24,drag.current.camera+(e.clientX-drag.current.x)*.08)));}} onPointerUp={()=>{drag.current=null;}} aria-label="Perspective 3D-style live football match view"/>
    <div className="absolute bottom-3 right-3 rounded bg-black/55 px-2 py-1 text-[10px] font-bold tracking-wider text-white/80">DRAG TO ROTATE CAMERA</div>
  </div>;
};
