import React, { useMemo, useState } from 'react';
import type { CareerSave, Fixture } from '../types/football';
import { getCareerCalendarEvents, getCareerWeekDate } from '../engine/careerCalendar';

interface CareerCalendarProps {
  save: CareerSave;
  onBack?: () => void;
  onOpenFixture?: (fixture: Fixture) => void;
  compact?: boolean;
}

const monthLabel = (date: Date) => date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const prettyDate = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const addMonths = (date: Date, amount: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
const addDays = (key: string, amount: number) => {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return dateKey(date);
};

const TYPE_STYLE: Record<string, string> = {
  MATCH: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  INTERNATIONAL: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
  TRAINING: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  RECOVERY: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  BRIEFING: 'border-white/15 bg-white/5 text-slate-300',
  TRANSFER: 'border-violet-400/35 bg-violet-400/10 text-violet-200',
};

export const CareerCalendar: React.FC<CareerCalendarProps> = ({ save, onBack, onOpenFixture, compact = false }) => {
  const events = useMemo(() => getCareerCalendarEvents(save), [save]);
  const currentDate = getCareerWeekDate(save.season, save.currentWeek, 0);
  const currentKey = dateKey(currentDate);
  const [month, setMonth] = useState(() => new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1)));
  const [selectedDate, setSelectedDate] = useState(currentKey);
  const monthStart = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const offset = (monthStart.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= daysInMonth ? new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day)) : null;
  });
  const byDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((event) => map.set(event.date, [...(map.get(event.date) ?? []), event]));
    return map;
  }, [events]);
  const selectedEvents = byDate.get(selectedDate) ?? [];
  const nextMatch = events
    .filter((event) => event.fixture && !event.fixture.played)
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((event) => event.date >= currentKey) ??
    events.filter((event) => event.fixture && !event.fixture.played).sort((a, b) => a.date.localeCompare(b.date))[0];
  const club = save.clubs[save.userClubId];

  const selectDate = (key: string) => {
    setSelectedDate(key);
    const date = new Date(`${key}T12:00:00Z`);
    setMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
  };
  const moveDay = (amount: number) => selectDate(addDays(selectedDate, amount));
  const jumpToNextMatch = () => {
    if (nextMatch) selectDate(nextMatch.date);
  };

  return (
    <section className={`flex min-h-0 flex-col gap-3 rounded-xl border border-white/10 bg-[#0b1420] p-3 text-white ${compact ? 'h-full' : 'min-h-[70vh]'}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div><div className="text-[9px] font-black uppercase tracking-[.24em] text-cyan-300">Season planner · Football Dynasty</div><h2 className="mt-1 text-xl font-black">Season calendar</h2><p className="text-[10px] text-slate-400">{club?.name ?? 'Club'} · Season {save.season} · Week {save.currentWeek}</p></div>
        <div className="flex items-center gap-2">
          {onBack && <button type="button" onClick={onBack} className="min-h-9 rounded-md border border-white/15 px-3 text-[10px] font-bold text-slate-200">BACK</button>}
          <button type="button" onClick={() => selectDate(currentKey)} className="min-h-9 rounded-md border border-cyan-400/40 px-3 text-[10px] font-bold text-cyan-200">CURRENT DAY</button>
          <button type="button" onClick={jumpToNextMatch} disabled={!nextMatch} className="min-h-9 rounded-md bg-amber-400 px-3 text-[10px] font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">NEXT MATCH ↗</button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,.8fr)]">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between"><button type="button" aria-label="Previous month" onClick={() => setMonth((value) => addMonths(value, -1))} className="h-8 w-9 rounded border border-white/10 bg-white/5">‹</button><h3 className="text-sm font-black uppercase tracking-wider">{monthLabel(month)}</h3><button type="button" aria-label="Next month" onClick={() => setMonth((value) => addMonths(value, 1))} className="h-8 w-9 rounded border border-white/10 bg-white/5">›</button></div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase tracking-wider text-slate-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => <div key={day} className="py-1">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, index) => {
              if (!date) return <div key={index} className="min-h-[58px] rounded-md bg-white/[.015]" />;
              const key = dateKey(date);
              const dayEvents = byDate.get(key) ?? [];
              const isCurrent = key === currentKey;
              return <button type="button" key={key} onClick={() => setSelectedDate(key)} aria-pressed={selectedDate === key} className={`flex min-h-[58px] flex-col items-start rounded-md border p-1.5 text-left ${selectedDate === key ? 'border-cyan-300 bg-cyan-400/15' : isCurrent ? 'border-amber-300/60 bg-amber-400/10' : 'border-white/5 bg-[#111e2c] hover:border-white/20'}`}>
                <span className="text-[10px] font-bold">{date.getUTCDate()}</span>
                <span className="mt-auto flex flex-wrap gap-0.5">{dayEvents.slice(0, 3).map((event) => <i key={event.id} title={event.title} className={`h-1.5 w-1.5 rounded-full ${event.type === 'MATCH' ? 'bg-amber-300' : event.type === 'INTERNATIONAL' ? 'bg-cyan-300' : event.type === 'TRANSFER' ? 'bg-violet-300' : event.type === 'TRAINING' ? 'bg-emerald-300' : 'bg-slate-400'}`} />)}</span>
                {dayEvents.length > 0 && <small className="mt-1 text-[8px] text-slate-400">{dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}</small>}
              </button>;
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[9px] text-slate-400"><span>● Matchday</span><span>● Training</span><span>● Recovery</span><span>● Transfer window</span><span>● International</span></div>
        </div>
        <aside className="min-h-0 rounded-lg border border-white/10 bg-[#101b29] p-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="min-w-0"><div className="text-[9px] font-black uppercase tracking-wider text-cyan-300">Selected day</div><h3 className="mt-1 text-sm font-bold">{prettyDate(selectedDate)}</h3></div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" aria-label="Previous day" onClick={() => moveDay(-1)} className="h-8 w-8 rounded border border-white/15 bg-white/5 text-base">‹</button>
              <button type="button" aria-label="Next day" onClick={() => moveDay(1)} className="h-8 w-8 rounded border border-white/15 bg-white/5 text-base">›</button>
            </div>
          </div>
          <div className="mt-2 flex max-h-[45vh] flex-col gap-2 overflow-y-auto pr-1">
            {selectedEvents.length ? selectedEvents.map((event) => <article key={event.id} className={`rounded-lg border p-2 ${TYPE_STYLE[event.type]}`}><div className="flex items-center justify-between gap-2"><span className="text-[8px] font-black uppercase tracking-wider">{event.type} · WEEK {event.week}</span>{event.fixture?.played && <b className="text-[9px]">FT</b>}</div><h4 className="mt-1 text-[11px] font-bold">{event.title}</h4><p className="mt-1 text-[9px] opacity-75">{event.detail}</p>{event.fixture && !event.fixture.played && onOpenFixture && <button type="button" onClick={() => onOpenFixture(event.fixture!)} className="mt-2 min-h-8 rounded bg-amber-400 px-3 text-[9px] font-black text-slate-950">OPEN MATCHDAY →</button>}</article>) : <p className="py-6 text-center text-[10px] text-slate-500">No scheduled events on this day.</p>}
          </div>
          <div className="mt-3 border-t border-white/10 pt-2 text-[9px] text-slate-500">Use the arrows to move one day at a time. Select any date to see that day’s schedule, or use Next Match to jump to your next unplayed fixture.</div>
        </aside>
      </div>
    </section>
  );
};
