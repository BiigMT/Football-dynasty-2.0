import React, { useEffect, useRef } from 'react';
import { Club, MatchSession, Player } from '../types/football';
import { getFormationCoordinates } from '../engine/matchEngine';

interface MatchPitchCanvasProps {
  session: MatchSession;
  homeClub: Club;
  awayClub: Club;
  players: Record<string, Player>;
  lastGoalTimestamp?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const MatchPitchCanvas: React.FC<MatchPitchCanvasProps> = ({
  session,
  homeClub,
  awayClub,
  players,
  lastGoalTimestamp = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    session,
    homeClub,
    awayClub,
    players,
    ballX: 50,
    ballY: 50,
    shake: 0,
    particles: [] as Particle[],
    lastGoalTs: 0,
    time: 0,
  });

  useEffect(() => {
    stateRef.current.session = session;
    stateRef.current.homeClub = homeClub;
    stateRef.current.awayClub = awayClub;
    stateRef.current.players = players;
  }, [session, homeClub, awayClub, players]);

  useEffect(() => {
    if (lastGoalTimestamp > stateRef.current.lastGoalTs) {
      stateRef.current.lastGoalTs = lastGoalTimestamp;
      stateRef.current.shake = 10;
      const bx = (stateRef.current.session.ballPos.x / 100) * 720;
      const by = (stateRef.current.session.ballPos.y / 100) * 420;
      for (let i = 0; i < 28; i++) {
        const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.3;
        const speed = 60 + Math.random() * 140;
        stateRef.current.particles.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.9,
          color: i % 2 === 0 ? '#06B6D4' : '#FACC15',
        });
      }
    }
  }, [lastGoalTimestamp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const st = stateRef.current;
      st.time += dt;

      const W = 720;
      const H = 420;
      const pad = 26;
      const pW = W - pad * 2;
      const pH = H - pad * 2;

      // Smoothly interpolate ball toward target
      const targetBX = st.session.ballPos.x;
      const targetBY = st.session.ballPos.y;
      st.ballX += (targetBX - st.ballX) * Math.min(1, dt * 5.5);
      st.ballY += (targetBY - st.ballY) * Math.min(1, dt * 5.5);

      if (st.shake > 0) {
        st.shake = Math.max(0, st.shake - dt * 24);
      }

      ctx.save();
      if (st.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * st.shake, (Math.random() - 0.5) * st.shake);
      }

      // Turf background + mowed vertical stripes
      ctx.fillStyle = '#0D2B1D';
      ctx.fillRect(0, 0, W, H);
      const stripes = 12;
      const stripeW = pW / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#11442B' : '#0F3B25';
        ctx.fillRect(pad + i * stripeW, pad, stripeW + 0.5, pH);
      }

      // Pitch boundary & markings
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, pad, pW, pH);

      // Halfway line & center circle
      ctx.beginPath();
      ctx.moveTo(pad + pW / 2, pad);
      ctx.lineTo(pad + pW / 2, pad + pH);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pad + pW / 2, pad + pH / 2, 46, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pad + pW / 2, pad + pH / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
      ctx.fill();

      // Penalty boxes
      const boxW = 92;
      const boxH = 186;
      const boxY = pad + (pH - boxH) / 2;
      ctx.strokeRect(pad, boxY, boxW, boxH);
      ctx.strokeRect(pad + pW - boxW, boxY, boxW, boxH);

      // 6-yard boxes
      const smallW = 34;
      const smallH = 88;
      const smallY = pad + (pH - smallH) / 2;
      ctx.strokeRect(pad, smallY, smallW, smallH);
      ctx.strokeRect(pad + pW - smallW, smallY, smallW, smallH);

      // Goals
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3;
      ctx.strokeRect(pad - 9, pad + pH / 2 - 30, 9, 60);
      ctx.strokeRect(pad + pW, pad + pH / 2 - 30, 9, 60);

      // Draw Players
      const homeCoords = getFormationCoordinates(st.session.homeTactics.formation);
      const awayCoords = getFormationCoordinates(st.session.awayTactics.formation);
      const ballShiftX = (st.ballX - 50) * 0.22;
      const ballShiftY = (st.ballY - 50) * 0.12;

      const drawTeam = (
        xi: string[],
        coords: { x: number; y: number }[],
        isHome: boolean,
        primary: string,
        secondary: string
      ) => {
        xi.forEach((pid, idx) => {
          const pState = st.session.playerStates[pid];
          if (pState && pState.redCard) return;
          const base = coords[idx] ?? { x: 50, y: 50 };
          const rawX = isHome ? base.x : 100 - base.x;
          const rawY = isHome ? base.y : 100 - base.y;

          const isGK = idx === 0;
          const swayX = isGK ? 0 : Math.sin(st.time * 2.1 + idx * 1.7) * 1.4 + ballShiftX * 0.7;
          const swayY = isGK
            ? Math.sin(st.time * 1.5) * 2
            : Math.cos(st.time * 1.8 + idx * 1.3) * 1.6 + ballShiftY * 0.7;

          const px = pad + (Math.max(3, Math.min(97, rawX + swayX)) / 100) * pW;
          const py = pad + (Math.max(5, Math.min(95, rawY + swayY)) / 100) * pH;

          const isUserPlayer = st.session.userPlayerId === pid;
          if (isUserPlayer) {
            ctx.beginPath();
            ctx.arc(px, py, 16, 0, Math.PI * 2);
            ctx.strokeStyle = '#FACC15';
            ctx.lineWidth = 2.2;
            ctx.stroke();
          }

          // Drop shadow
          ctx.beginPath();
          ctx.ellipse(px, py + 10, 9, 4, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.38)';
          ctx.fill();

          // Player marker
          ctx.beginPath();
          ctx.arc(px, py, 10.5, 0, Math.PI * 2);
          ctx.fillStyle = isGK ? '#F59E0B' : primary;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = secondary;
          ctx.stroke();

          // Shirt number
          const playerObj = st.players[pid];
          ctx.fillStyle =
            primary.toUpperCase() === '#F8FAFC' || primary.toUpperCase() === '#FACC15' || primary.toUpperCase() === '#EAB308'
              ? '#0F172A'
              : '#FFFFFF';
          ctx.font = '700 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(playerObj?.shirtNumber ?? idx + 1), px, py + 0.5);
        });
      };

      drawTeam(
        st.session.homeTactics.startingXI,
        homeCoords,
        true,
        st.homeClub.primaryColor,
        st.homeClub.secondaryColor
      );
      drawTeam(
        st.session.awayTactics.startingXI,
        awayCoords,
        false,
        st.awayClub.primaryColor,
        st.awayClub.secondaryColor
      );

      // Draw Ball
      const bx = pad + (st.ballX / 100) * pW;
      const by = pad + (st.ballY / 100) * pH;
      ctx.beginPath();
      ctx.ellipse(bx + 2, by + 5, 6, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Update & draw particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt * 1.1;
        if (pt.life <= 0) {
          st.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#0B1F16]">
      <canvas
        ref={canvasRef}
        width={720}
        height={420}
        className="block w-full h-auto aspect-[12/7]"
      />
    </div>
  );
};
