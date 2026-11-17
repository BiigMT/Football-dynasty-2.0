import React from 'react';

export type GameOrientation = 'landscape' | 'portrait';
interface OrientationSelectProps {
  initialValue?: GameOrientation | null;
  onConfirm: (orientation: GameOrientation) => void;
}

export const OrientationSelect: React.FC<OrientationSelectProps> = ({ onConfirm }) => (
  <main className="fd-orientation-screen">
    <header className="fd-orientation-header">
      <span className="fd-kicker">FOOTBALL DYNASTY · SYSTEM SETTINGS</span>
      <h1>BUILT FOR LANDSCAPE</h1>
      <p>Football Dynasty is designed for a full-screen, console-style mobile experience.</p>
    </header>
    <section className="fd-orientation-options">
      <div className="fd-orientation-card selected">
        <span className="fd-choice-label">GAME DISPLAY</span>
        <div className="fd-phone landscape">
          <div className="fd-phone-top">FOOTBALL DYNASTY</div>
          <div className="fd-phone-columns"><i/><i/><i/><i/></div>
          <div className="fd-phone-bottom"/>
        </div>
        <strong>LANDSCAPE MODE</strong>
        <span>16:9 · Console Broadcast View</span>
        <small>Wider tactical hub · Full match presentation · Touch-first controls</small>
      </div>
    </section>
    <footer className="fd-orientation-footer">
      <p>Rotate your device horizontally for the intended experience.</p>
      <button type="button" onClick={() => onConfirm('landscape')}>ENTER FOOTBALL DYNASTY <span>›</span></button>
    </footer>
    <style>{`
      .fd-orientation-screen{box-sizing:border-box;position:fixed;inset:0;min-height:100dvh;width:100%;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(14px,3vh,28px);padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));background:radial-gradient(ellipse at 50% 0%,#235ba8 0%,#13386c 48%,#08182c 100%);color:#e8edf5;font-family:'Barlow Condensed',sans-serif}
      .fd-orientation-header{text-align:center;background:#e8edf5;color:#13386c;width:min(100%,920px);padding:12px 18px;border-top:4px solid #f6c21c;box-shadow:0 12px 32px #0004}
      .fd-kicker{font-size:10px;letter-spacing:.22em;font-weight:800;opacity:.7}.fd-orientation-header h1{font-size:clamp(22px,4vw,36px);font-weight:900;letter-spacing:.045em;margin:2px 0}.fd-orientation-header p{font:600 12px system-ui;margin:0;color:#40536a}
      .fd-orientation-options{width:min(100%,620px)}
      .fd-orientation-card{position:relative;min-width:0;min-height:clamp(220px,43vh,370px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:9px;padding:20px 14px;background:#0d1b2ae8;border:2px solid #f6c21c;color:#e8edf5;text-align:center;box-shadow:0 0 0 3px #f6c21222,0 12px 32px #0004}
      .fd-choice-label{position:absolute;top:12px;left:14px;font-size:10px;letter-spacing:.15em;color:#c4d2e4;font-weight:800}
      .fd-phone{position:relative;border:4px solid #9aaec4;border-radius:14px;background:#06101d;box-shadow:0 9px 22px #0008;padding:7px;display:flex;flex-direction:column;gap:5px}
      .fd-phone.landscape{width:min(66%,260px);aspect-ratio:1.8}
      .fd-phone-top{height:15%;font-size:7px;letter-spacing:.1em;color:#f6c21c;text-align:left;border-bottom:1px solid #ffffff30}
      .fd-phone-columns{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;flex:1}
      .fd-phone-columns i{display:block;border:1px solid #ffffff25;background:linear-gradient(145deg,#235ba8,#13386c);border-radius:2px}.fd-phone-bottom{height:8%;background:#ffffff16}
      .fd-orientation-card strong{font-size:clamp(17px,2.5vw,24px);letter-spacing:.07em}.fd-orientation-card>span:not(.fd-choice-label){font-size:13px;color:#f6c21c}.fd-orientation-card small{font:10px system-ui;color:#aebed0}
      .fd-orientation-footer{width:min(100%,920px);display:flex;align-items:center;justify-content:space-between;gap:12px}.fd-orientation-footer p{font:11px system-ui;color:#b8c8dc}.fd-orientation-footer button{min-height:48px;padding:0 25px;background:#f6c21c;color:#101a28;font-weight:900;letter-spacing:.08em;border:0;box-shadow:0 5px 0 #b78b05;white-space:nowrap}.fd-orientation-footer button span{font-size:20px;margin-left:12px}
      @media(max-width:600px){.fd-orientation-screen{justify-content:flex-start}.fd-orientation-card{min-height:260px;padding:16px 10px}.fd-orientation-footer{flex-direction:column;text-align:center}.fd-orientation-footer button{width:100%}}
      @media(max-height:520px) and (orientation:landscape){.fd-orientation-screen{gap:8px}.fd-orientation-header{padding:5px 12px}.fd-orientation-header h1{font-size:21px}.fd-orientation-card{min-height:175px}.fd-phone.landscape{width:150px}.fd-orientation-footer p{display:none}}
    `}</style>
  </main>
);
