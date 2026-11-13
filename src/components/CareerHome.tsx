import React from 'react';
import './careerHome.css';

/* ---------- Types mapped from football.ts models ---------- */
export type DayItem = { label: string; sub: string; icon: string; active?: boolean };
export type MenuItem = { key: string; title: string; sub: string; icon: string };
export type TableRow = { pos: number; club: string; p: number; gd: number; pts: number; color?: string; me?: boolean };
export type CareerHomeNewsItem = { tag: string; headline: string; body: string };
export type FanPost = {
  name: string;
  handle: string;
  text: string;
  time: string;
  replies: number;
  shares: number;
  likes: number;
};

/* ---------- Small shared pieces ---------- */
export const Badge: React.FC<{ name: string; color?: string; size?: number }> = ({
  name,
  color = '#00d9ff',
  size = 44,
}) => (
  <div className="fd-badge" style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
    {name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase()}
  </div>
);

/** Generated portrait fallback (no licensed photos). */
export const Portrait: React.FC<{ skin?: string; hair?: string; kit?: string }> = ({
  skin = '#c68642',
  hair = '#1a1a1a',
  kit = '#ffffff',
}) => (
  <svg viewBox="0 0 200 240" className="fd-portrait" aria-hidden="true">
    <path d="M20 240 Q30 170 100 165 Q170 170 180 240Z" fill={kit} />
    <rect x="86" y="130" width="28" height="40" fill={skin} />
    <ellipse cx="100" cy="95" rx="42" ry="52" fill={skin} />
    <path d="M56 85 Q60 40 100 40 Q142 40 144 85 Q125 60 100 62 Q75 60 56 85Z" fill={hair} />
    <circle cx="84" cy="98" r="4" fill="#111" />
    <circle cx="116" cy="98" r="4" fill="#111" />
    <path d="M88 122 Q100 130 112 122" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Shell: React.FC<{
  mode: 'manager' | 'player';
  top: React.ReactNode;
  menu: MenuItem[];
  onMenu: (k: string) => void;
  onForward: () => void;
  forwardTitle?: string;
  forwardSub: string;
  ticker: string[];
  children: React.ReactNode;
}> = ({ mode, top, menu, onMenu, onForward, forwardTitle = 'FORWARD TIME', forwardSub, ticker, children }) => (
  <div className="fd-root" data-mode={mode}>
    <header className="fd-top">{top}</header>
    <aside className="fd-menu">
      <button type="button" className="fd-forward" onClick={onForward}>
        <span className="fd-play">▶</span>
        <span>
          <b>{forwardTitle}</b>
          <small>{forwardSub}</small>
        </span>
        <i>›</i>
      </button>
      {menu.map((m) => (
        <button type="button" key={m.key} className="fd-item" onClick={() => onMenu(m.key)}>
          <span className="fd-ico">{m.icon}</span>
          <span>
            <b>{m.title}</b>
            <small>{m.sub}</small>
          </span>
          <i>›</i>
        </button>
      ))}
    </aside>
    <main className="fd-main">{children}</main>
    <footer className="fd-ticker">
      <div className="fd-logo">
        FOOTBALL
        <br />
        DYNASTY
      </div>
      <span className="fd-newsTag">NEWS</span>
      <div className="fd-marquee">
        <div>
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>
              {t}
              <em>|</em>
            </span>
          ))}
        </div>
      </div>
    </footer>
  </div>
);

const LeagueTable: React.FC<{ title: string; rows: TableRow[]; onSee?: () => void }> = ({ title, rows, onSee }) => (
  <section className="fd-panel fd-table">
    <div className="fd-panelHead">
      <h3>{title}</h3>
      <button type="button" onClick={onSee}>
        See Table →
      </button>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Club</th>
          <th>P</th>
          <th>GD</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.pos} className={r.me ? 'me' : ''}>
            <td>{r.pos}</td>
            <td>
              <Badge name={r.club} color={r.color} size={22} /> {r.club}
            </td>
            <td>{r.p}</td>
            <td>
              {r.gd > 0 ? '+' : ''}
              {r.gd}
            </td>
            <td>{r.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

/* ======================= MANAGER CAREER HOME ======================= */
export type ManagerHomeProps = {
  club: string;
  clubColor?: string;
  manager: string;
  days: DayItem[];
  transferBudget: string;
  wageBudget: string;
  news: CareerHomeNewsItem[];
  fans: FanPost[];
  leagueName: string;
  table: TableRow[];
  ticker: string[];
  forwardTitle?: string;
  forwardSub?: string;
  onForward: () => void;
  onNavigate: (key: string) => void;
};

const MANAGER_MENU: MenuItem[] = [
  { key: 'team', title: 'TEAM MANAGEMENT', sub: 'Squad Selection & Tactics', icon: '👥' },
  { key: 'transfers', title: 'TRANSFER MARKET', sub: 'Buy, Sell & Scout Players', icon: '🤝' },
  { key: 'office', title: 'MANAGER OFFICE', sub: 'Contracts, Finances & Goals', icon: '💼' },
  { key: 'competitions', title: 'COMPETITIONS', sub: 'Leagues & Tournaments', icon: '🏆' },
  { key: 'national', title: 'NATIONAL TEAM', sub: 'Call-ups & International', icon: '🌍' },
  { key: 'stats', title: 'TRAINING & ACADEMY', sub: 'Drills & Youth Prospects', icon: '📊' },
];

export const ManagerHome: React.FC<ManagerHomeProps> = (p) => {
  const [slide, setSlide] = React.useState(0);
  const n = p.news[slide % Math.max(p.news.length, 1)];
  return (
    <Shell
      mode="manager"
      menu={MANAGER_MENU}
      onMenu={p.onNavigate}
      onForward={p.onForward}
      forwardTitle={p.forwardTitle ?? 'FORWARD TIME'}
      forwardSub={p.forwardSub ?? 'Continue to next event'}
      ticker={p.ticker}
      top={
        <>
          <div className="fd-club">
            <Badge name={p.club} color={p.clubColor} size={52} />
            <div>
              <h1>{p.club.toUpperCase()}</h1>
              <small>Manager: {p.manager}</small>
            </div>
          </div>
          <div className="fd-days">
            {p.days.map((d, i) => (
              <div key={i} className={'fd-day' + (d.active ? ' on' : '')}>
                <div>
                  <b>{d.label}</b>
                  <small>{d.sub}</small>
                </div>
                <span>{d.icon}</span>
              </div>
            ))}
          </div>
          <div className="fd-money">
            <span>🪙</span>
            <div>
              <b>{p.transferBudget}</b>
              <small>Transfer Budget</small>
            </div>
          </div>
          <div className="fd-money">
            <span>💰</span>
            <div>
              <b>{p.wageBudget}</b>
              <small>Wage Budget</small>
            </div>
          </div>
          <button type="button" className="fd-gear" onClick={() => p.onNavigate('settings')} aria-label="Settings">
            ⚙
          </button>
        </>
      }
    >
      {n && (
        <section className="fd-panel fd-hero">
          <div className="fd-heroText">
            <span className="fd-tag">{n.tag || 'BREAKING NEWS'}</span>
            <h2>{n.headline}</h2>
            <p>{n.body}</p>
            <button type="button" className="fd-ghost" onClick={() => p.onNavigate('office')}>
              Read More →
            </button>
          </div>
          <Portrait kit={p.clubColor ?? '#f4f4f4'} />
          <div className="fd-dots">
            {p.news.map((_, i) => (
              <i key={i} className={i === slide % p.news.length ? 'on' : ''} onClick={() => setSlide(i)} />
            ))}
          </div>
        </section>
      )}
      <section className="fd-panel fd-fans">
        <div className="fd-panelHead">
          <h3>Latest from Fans</h3>
          <button type="button" onClick={() => p.onNavigate('office')}>
            See all →
          </button>
        </div>
        {p.fans.map((f, i) => (
          <div className="fd-post" key={i}>
            <Portrait hair={i % 2 ? '#3a2a1a' : '#111'} skin={i % 2 ? '#e0ac69' : '#8d5524'} kit={p.clubColor ?? '#1e293b'} />
            <div>
              <b>{f.name}</b>{' '}
              <small>
                {f.handle} · {f.time}
              </small>
              <p>{f.text}</p>
              <small>
                💬 {f.replies} &nbsp; 🔁 {f.shares} &nbsp; ♥ {f.likes}
              </small>
            </div>
          </div>
        ))}
      </section>
      <LeagueTable title={p.leagueName} rows={p.table} onSee={() => p.onNavigate('competitions')} />
    </Shell>
  );
};

/* ======================= PLAYER CAREER HOME (Become a Legend) ======================= */
export type PlayerHomeProps = {
  name: string;
  position: string;
  age: number;
  club: string;
  clubColor?: string;
  number: number;
  overall: number;
  potential: number;
  skin?: string;
  hair?: string;
  form: number;
  morale: number;
  fitness: number;
  managerTrust: number; // 0-100
  attrs: { label: string; value: number }[];
  days: DayItem[];
  nextMatch: string;
  objectives: string[];
  marketValue: string;
  ticker: string[];
  table: TableRow[];
  leagueName: string;
  forwardTitle?: string;
  forwardSub?: string;
  onForward: () => void;
  onNavigate: (key: string) => void;
};

const PLAYER_MENU: MenuItem[] = [
  { key: 'matchday', title: 'MATCHDAY', sub: 'Selection & Objectives', icon: '⚽' },
  { key: 'training', title: 'TRAINING', sub: 'Drills & Development', icon: '🏋' },
  { key: 'agent', title: 'AGENT', sub: 'Transfers & Contracts', icon: '🤝' },
  { key: 'national', title: 'NATIONAL TEAM', sub: 'Call-ups & Caps', icon: '🌍' },
  { key: 'history', title: 'CAREER HISTORY', sub: 'Stats & Awards', icon: '🏅' },
  { key: 'profile', title: 'PLAYER PROFILE', sub: 'Attributes & Style', icon: '🧬' },
];

const Meter: React.FC<{ label: string; v: number }> = ({ label, v }) => (
  <div className="fd-meter">
    <span>{label}</span>
    <div>
      <i style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
    </div>
    <b>{v}</b>
  </div>
);

export const PlayerHome: React.FC<PlayerHomeProps> = (p) => (
  <Shell
    mode="player"
    menu={PLAYER_MENU}
    onMenu={p.onNavigate}
    onForward={p.onForward}
    forwardTitle={p.forwardTitle ?? 'FORWARD TIME'}
    forwardSub={p.forwardSub ?? 'Next matchday'}
    ticker={p.ticker}
    top={
      <>
        <div className="fd-club">
          <Badge name={p.club} color={p.clubColor} size={52} />
          <div>
            <h1>{p.name.toUpperCase()}</h1>
            <small>
              {p.position} · Age {p.age} · #{p.number} · {p.club}
            </small>
          </div>
        </div>
        <div className="fd-days">
          {p.days.map((d, i) => (
            <div key={i} className={'fd-day' + (d.active ? ' on' : '')}>
              <div>
                <b>{d.label}</b>
                <small>{d.sub}</small>
              </div>
              <span>{d.icon}</span>
            </div>
          ))}
        </div>
        <div className="fd-money">
          <span>💰</span>
          <div>
            <b>{p.marketValue}</b>
            <small>Market Value</small>
          </div>
        </div>
        <button type="button" className="fd-gear" onClick={() => p.onNavigate('settings')} aria-label="Settings">
          ⚙
        </button>
      </>
    }
  >
    <section className="fd-panel fd-hero fd-card">
      <div className="fd-ovr">
        <b>{p.overall}</b>
        <small>OVR</small>
        <em>POT {p.potential}</em>
      </div>
      <Portrait skin={p.skin} hair={p.hair} kit={p.clubColor ?? '#e8e8e8'} />
      <div className="fd-heroText">
        <span className="fd-tag">NEXT MATCH</span>
        <h2>{p.nextMatch}</h2>
        <Meter label="Form" v={p.form} />
        <Meter label="Morale" v={p.morale} />
        <Meter label="Fitness" v={p.fitness} />
        <Meter label="Manager Trust" v={p.managerTrust} />
      </div>
    </section>
    <section className="fd-panel fd-fans">
      <div className="fd-panelHead">
        <h3>Attributes</h3>
        <button type="button" onClick={() => p.onNavigate('profile')}>
          Details →
        </button>
      </div>
      {p.attrs.map((a) => (
        <Meter key={a.label} label={a.label} v={a.value} />
      ))}
      <div className="fd-panelHead" style={{ marginTop: 10 }}>
        <h3>Objectives</h3>
      </div>
      <ul className="fd-obj">
        {p.objectives.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
    </section>
    <LeagueTable title={p.leagueName} rows={p.table} onSee={() => p.onNavigate('history')} />
  </Shell>
);
