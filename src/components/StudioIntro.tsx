import React, { useEffect, useState } from 'react';

interface StudioIntroProps { onComplete: () => void; durationMs?: number; }

export const StudioIntro: React.FC<StudioIntroProps> = ({ onComplete, durationMs = 3000 }) => {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const finish = () => { setLeaving(true); window.setTimeout(onComplete, 420); };
    const timer = window.setTimeout(finish, durationMs);
    const skip = () => { window.clearTimeout(timer); finish(); };
    window.addEventListener('pointerdown', skip, { once: true });
    return () => { window.clearTimeout(timer); window.removeEventListener('pointerdown', skip); };
  }, [durationMs, onComplete]);
  return <section className={`fd-studio-intro ${leaving ? 'is-leaving' : ''}`} aria-label="MT Games studio intro">
    <div className="fd-studio-lights" /><div className="fd-studio-grid" />
    <div className="fd-studio-lockup">
      <svg className="fd-studio-mark" viewBox="0 0 120 120" role="img" aria-label="MT geometric emblem">
        <path d="M12 20 60 4 108 20 108 100 60 116 12 100Z" fill="none" stroke="#F6C21C" strokeWidth="3"/>
        <path d="M25 34h70L60 91Z" fill="#235BA8" stroke="#E8EDF5" strokeWidth="2"/>
        <path d="M40 49h40L60 76Z" fill="#F6C21C"/>
        <path d="M60 25v22M28 94l32-18 32 18" fill="none" stroke="#E8EDF5" strokeWidth="3"/>
      </svg>
      <div className="fd-studio-wordmark"><span>MT</span> GAMES</div>
      <div className="fd-studio-rule" /><p>BUILT FOR THE BEAUTIFUL GAME</p>
    </div>
    <span className="fd-studio-skip">TAP ANYWHERE TO SKIP <b>›</b></span>
    <style>{`
      .fd-studio-intro{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 50% 38%,#235ba8 0%,#13386c 34%,#071323 78%);color:#e8edf5;transition:opacity .42s ease,transform .42s ease}
      .fd-studio-intro.is-leaving{opacity:0;transform:scale(1.035);pointer-events:none}
      .fd-studio-lights{position:absolute;inset:-30%;background:conic-gradient(from 30deg at 50% 35%,transparent 0 12%,#ffffff10 14%,transparent 19% 40%,#f6c21c12 43%,transparent 49%);animation:fd-lights 7s linear infinite}
      .fd-studio-grid{position:absolute;inset:0;opacity:.13;background:linear-gradient(#b8d4ff22 1px,transparent 1px),linear-gradient(90deg,#b8d4ff22 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(transparent,#000 30%,#000 75%,transparent)}
      .fd-studio-lockup{position:relative;text-align:center;animation:fd-reveal .9s cubic-bezier(.2,.8,.2,1) both}
      .fd-studio-mark{width:clamp(74px,13vw,118px);filter:drop-shadow(0 12px 30px #0009);margin:0 auto 18px}
      .fd-studio-wordmark{font-family:'Barlow Condensed',Impact,sans-serif;font-size:clamp(3.2rem,11vw,7.5rem);font-weight:900;letter-spacing:.14em;line-height:.95;background:linear-gradient(180deg,#fff 8%,#b9c4d2 45%,#fff 58%,#aab8c9 100%);color:transparent;background-clip:text;text-shadow:0 8px 34px #0008;white-space:nowrap}
      .fd-studio-wordmark span{color:#f6c21c;background:none}
      .fd-studio-rule{height:2px;width:62%;margin:22px auto 12px;background:linear-gradient(90deg,transparent,#f6c21c,transparent);animation:fd-rule 1.1s .3s both}
      .fd-studio-lockup p{font:700 10px 'Barlow Condensed',sans-serif;letter-spacing:.42em;color:#c8d6e8}
      .fd-studio-skip{position:absolute;right:max(22px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));font:700 10px 'Barlow Condensed',sans-serif;letter-spacing:.2em;color:#d9e4f2a8}
      .fd-studio-skip b{color:#f6c21c;font-size:18px;margin-left:8px}
      @keyframes fd-reveal{from{opacity:0;transform:translateY(24px) scale(.86);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
      @keyframes fd-lights{to{transform:rotate(360deg)}}@keyframes fd-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      @media(prefers-reduced-motion:reduce){.fd-studio-intro *{animation:none!important}}
    `}</style>
  </section>;
};
