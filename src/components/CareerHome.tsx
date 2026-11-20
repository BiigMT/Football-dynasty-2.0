import React from 'react';
import './careerHome.css';

/* ---------- Types mapped from football.ts models ---------- */
export type DayItem = { label: string; sub: string; icon: string; active?: boolean };
export type MenuItem = { key: string; title: string; sub: string; icon: string; notify?: boolean };
export type TableRow = { pos: number; club: string; p: number; gd: number; pts: number; color?: string; me?: boolean };
export type CareerHomeNewsItem = { tag: string; headline: string; body: string };
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
          {m.notify && <span className="fd-notify" aria-label="Pending action" />}
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
export type ScorerRow = { name: string; club: string; goals: number };
export type CalendarCell = { label: string; detail: string; icon: string; active?: boolean; match?: boolean };

export type ManagerHomeProps = {
  club: string;
  clubColor?: string;
  clubSecondaryColor?: string;
  manager: string;
  days: DayItem[];
  transferBudget: string;
  wageBudget: string;
  news: CareerHomeNewsItem[];
  leagueName: string;
  table: TableRow[];
  scorers: ScorerRow[];
  calendar: CalendarCell[];
  seasonWeek: string;
  pendingTransfers?: boolean;
  trainingPending?: boolean;
  ticker: string[];
  forwardTitle?: string;
  forwardSub: string;
  onForward: () => void;
  onNavigate: (key: string) => void;
};

const MANAGER_MENU: MenuItem[] = [
  { key: 'team', title: 'TEAM MANAGEMENT', sub: 'Squad & Tactics', icon: '👥' },
  { key: 'transfers', title: 'TRANSFER MARKET', sub: 'Recruitment', icon: '🤝' },
  { key: 'office', title: 'MANAGER OFFICE', sub: 'Club & Finance', icon: '💼' },
  { key: 'competitions', title: 'COMPETITIONS', sub: 'League & Cups', icon: '🏆' },
  { key: 'calendar', title: 'SEASON CALENDAR', sub: 'Fixtures & weekly schedule', icon: '📅' },
  { key: 'clubs', title: 'CLUB DIRECTORY', sub: 'Explore Every Team', icon: '🏟' },
  { key: 'settings', title: 'SYSTEM', sub: 'Game Settings', icon: '⚙' },
];

export const ClubShieldWidget: React.FC<{ name: string; primary?: string; secondary?: string; size?: number }> = ({
  name, primary = '#235BA8', secondary = '#F6C21C', size = 34,
}) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg className="fd-shield" width={size} height={size * 1.12} viewBox="0 0 48 54" role="img" aria-label={name + ' shield'}>
      <defs>
        <clipPath id={id}><path d="M4 3H44V30Q44 42 24 51Q4 42 4 30Z" /></clipPath>
      </defs>
      <path d="M2 1H46V30Q46 45 24 53Q2 45 2 30Z" fill="#071629" stroke="#F6C21C" strokeWidth="1.5" />
      <g clipPath={`url(#${id})`}>
        <rect x="4" y="3" width="40" height="48" fill={primary} />
        <path d="M8 3H15V51H8ZM22 3H29V51H22ZM36 3H43V51H36Z" fill={secondary} opacity=".82" />
        <path d="M3 19L43 7V15L3 27Z" fill="#fff" opacity=".22" />
        <path d="M24 20L26.8 26L33 26.7L28.5 31L29.6 37L24 34L18.4 37L19.5 31L15 26.7L21.2 26Z" fill="#F6C21C" stroke="#fff" strokeWidth=".6" />
      </g>
      <path d="M2 1H46V30Q46 45 24 53Q2 45 2 30Z" fill="none" stroke="#F6C21C" strokeWidth="1.5" />
    </svg>
  );
};

export const ManagerHome: React.FC<ManagerHomeProps> = (p) => {
  const [slide, setSlide] = React.useState(0);
  const news = p.news.length ? p.news : [{ tag: 'CLUB NEWS', headline: 'A new chapter begins', body: 'Your decisions will shape the season ahead.' }];
  const n = news[slide % news.length];
  const menu = MANAGER_MENU.map((item) => ({
    ...item,
    notify: item.key === 'transfers' ? p.pendingTransfers : item.key === 'team' ? p.trainingPending : false,
  }));
  return (
    <Shell
      mode="manager"
      menu={menu}
      onMenu={p.onNavigate}
      onForward={p.onForward}
      forwardTitle={p.forwardTitle ?? 'PLAY MATCHDAY'}
      forwardSub={p.forwardSub}
      ticker={p.ticker}
      top={
        <>
          <div className="fd-club">
            <ClubShieldWidget name={p.club} primary={p.clubColor} secondary={p.clubSecondaryColor} size={44} />
            <div>
              <h1>{p.club.toUpperCase()}</h1>
              <small>MANAGER: {p.manager.toUpperCase()}</small>
            </div>
          </div>
          <div className="fd-seasonStamp"><b>{p.seasonWeek}</b><small>CAREER SEASON</small></div>
          <div className="fd-days">
            {p.days.slice(0, 3).map((d, i) => (
              <div key={i} className={'fd-day' + (d.active ? ' on' : '')}>
                <div><b>{d.label}</b><small>{d.sub}</small></div><span>{d.icon}</span>
              </div>
            ))}
          </div>
          <div className="fd-money"><span>€</span><div><b>{p.transferBudget}</b><small>TRANSFER BUDGET</small></div></div>
          <div className="fd-money"><span>€</span><div><b>{p.wageBudget}</b><small>WAGE / WEEK</small></div></div>
          <button type="button" className="fd-gear" onClick={() => p.onNavigate('settings')} aria-label="System settings">⚙</button>
        </>
      }
    >
      <section className="fd-showcase">
        {n && (
          <article className="fd-panel fd-hero" style={{ backgroundImage: "linear-gradient(0deg, rgba(5,16,34,.98) 0%, rgba(5,16,34,.78) 38%, rgba(5,16,34,.08) 100%), url('/media/game/team-talk.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="fd-showcasePattern" />
            <div className="fd-slideCount">{(slide % news.length) + 1} / {news.length}</div>
            <div className="fd-heroPortrait"><Portrait kit={p.clubColor ?? '#f4f4f4'} /></div>
            <div className="fd-heroText">
              <span className="fd-tag">{n.tag || 'CLUB NEWS'}</span>
              <h2>{n.headline}</h2>
              <p>{n.body}</p>
              {p.forwardTitle === 'PLAY MATCHDAY' && (
                <button type="button" className="fd-kickoff-cta" onClick={p.onForward}>
                  ⚽ KICK OFF MATCH
                </button>
              )}
              <button type="button" className="fd-ghost" onClick={() => p.onNavigate('office')}>READ STORY →</button>
            </div>
            <div className="fd-dots">
              {news.map((_, i) => <button type="button" aria-label={`Show story ${i + 1}`} key={i} className={i === slide % news.length ? 'on' : ''} onClick={() => setSlide(i)} />)}
            </div>
          </article>
        )}
      </section>
      <aside className="fd-sidebar">
        <section className="fd-panel fd-standings">
          <div className="fd-panelHead"><h3>{p.leagueName.toUpperCase()} · TOP 5</h3><button type="button" onClick={() => p.onNavigate('competitions')}>FULL TABLE →</button></div>
          <table>
            <thead><tr><th>#</th><th>CLUB</th><th>PTS</th></tr></thead>
            <tbody>{p.table.slice(0, 5).map((r) => <tr key={r.pos} className={r.me ? 'me' : ''}><td>{r.pos}</td><td><span className="fd-tableClub"><ClubShieldWidget name={r.club} primary={r.color} secondary="#F6C21C" size={21} />{r.club}</span></td><td>{r.pts}</td></tr>)}</tbody>
          </table>
          <div className="fd-scorerHead">GOAL RANKING</div>
          <div className="fd-scorers">{p.scorers.slice(0, 3).map((s, i) => <div className="fd-scorer" key={s.name}><b>{i + 1}</b><span>{s.name}<small>{s.club}</small></span><strong>{s.goals}</strong></div>)}</div>
        </section>
        <section className="fd-panel fd-calendar">
          <div className="fd-panelHead"><h3>FIXTURES & SCHEDULE</h3><span>{p.seasonWeek}</span></div>
          <div className="fd-calendarGrid">{p.calendar.slice(0, 10).map((d, i) => <div key={i} className={'fd-calendarCell' + (d.active ? ' today' : '') + (d.match ? ' match' : '')}><b>{d.label}</b><span>{d.icon}</span><small>{d.detail}</small></div>)}</div>
        </section>
      </aside>
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
