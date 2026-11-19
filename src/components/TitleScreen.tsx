import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Shield, Trophy, ChevronDown, Cloud, FolderOpen, Globe2 } from 'lucide-react';
import { CareerMode } from '../types/football';
import { SaveSlotSummary } from '../engine/storage';
import { SaveSlotsScreen } from './SaveSlotsScreen';
import { AccountPanel } from './AccountPanel';
import stadiumHero from '../assets/images/stadium_hero_backdrop_1794559201770.jpg';
import managerEmblem from '../assets/images/manager_mode_emblem_1794559202903.jpg';
import legendEmblem from '../assets/images/legend_mode_emblem_1794559202286.jpg';

interface TitleScreenProps {
  slots: SaveSlotSummary[];
  muted: boolean;
  onToggleMute: () => void;
  onStartNewCareer: (mode: CareerMode, slotId: string) => void;
  onLoadCareer: (slotId: string) => void;
  onDeleteSlot: (slotId: string) => void;
  orientation: 'portrait' | 'landscape';
  onChangeOrientation: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  slots,
  muted,
  onToggleMute,
  onStartNewCareer,
  onLoadCareer,
  onDeleteSlot,
  orientation,
  onChangeOrientation,
}) => {
  const [showSaves, setShowSaves] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const firstEmptySlot = slots.find((s) => s.empty)?.slotId ?? 'slot_1';
  const savedSlots = slots.filter((s) => !s.empty);
  const latestSaved = [...savedSlots].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#0D1B2A] text-[#E8EDF5]">
      <div className="pointer-events-none absolute inset-0">
        <img src={stadiumHero} alt="" className="h-full w-full object-cover object-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/80 to-[#0D1B2A]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-transparent to-[#0D1B2A]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(35,91,168,0.28),transparent_62%)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center border border-[#F6C21C]/60 bg-[#10243A] text-[#F6C21C]">
            <Shield size={19} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[10px] font-black tracking-[.24em] text-[#F6C21C]">FOOTBALL DYNASTY</div>
            <div className="hidden text-[9px] font-semibold tracking-[.16em] text-white/50 sm:block">MASTER LEAGUE · BECOME A LEGEND</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onChangeOrientation} className="min-h-10 rounded border border-white/15 bg-[#10243A]/85 px-3 text-[10px] font-bold tracking-wide text-white/80 transition hover:border-[#F6C21C]/70 hover:text-[#F6C21C]">
            {orientation === 'portrait' ? 'PORTRAIT' : 'LANDSCAPE'} · CHANGE
          </button>
          <button type="button" onClick={onToggleMute} aria-label={muted ? 'Unmute audio' : 'Mute audio'} className="flex min-h-10 items-center gap-2 rounded border border-white/15 bg-[#10243A]/85 px-3 text-[10px] font-bold tracking-wide text-white/85 transition hover:border-[#F6C21C]/70">
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-[#F6C21C]" />}
            <span className="hidden sm:inline">{muted ? 'AUDIO OFF' : 'AUDIO ON'}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center gap-5 px-4 py-5 sm:gap-6 sm:px-7 sm:py-7">
        <section className="grid items-end gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(250px,.75fr)] lg:gap-8">
          <div className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-black tracking-[.28em] text-[#F6C21C]">
              <span className="h-px w-8 bg-[#F6C21C]" /> THE NEXT ERA OF FOOTBALL
            </div>
            <h1 className="text-[clamp(2.5rem,7vw,5.8rem)] font-black uppercase leading-[.82] tracking-[-.045em] text-white">
              FOOTBALL <span className="text-[#F6C21C]">DYNASTY</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#D6E0ED]/85 sm:text-base">
              Build a football empire from the touchline or rise from academy prospect to global icon. Every decision shapes your legacy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {latestSaved ? (
              <button type="button" onClick={() => onLoadCareer(latestSaved.slotId)} className="flex min-h-12 items-center gap-3 rounded bg-[#F6C21C] px-5 text-left text-[#0D1B2A] shadow-[0_4px_0_#b88e0b] transition hover:brightness-110">
                <Play size={17} fill="currentColor" />
                <span><strong className="block text-xs font-black tracking-wider">{latestSaved.hasHalfTimeMatch ? 'RESUME MATCH' : 'CONTINUE CAREER'}</strong><small className="block max-w-[230px] truncate text-[10px] font-semibold opacity-75">{latestSaved.title} · Season {latestSaved.season} · Week {latestSaved.week}</small></span>
              </button>
            ) : (
              <div className="flex min-h-12 items-center gap-3 border border-white/15 bg-[#10243A]/75 px-4">
                <Globe2 size={17} className="text-[#F6C21C]" />
                <span><strong className="block text-[10px] font-black tracking-wider text-white">YOUR WORLD. YOUR DYNASTY.</strong><small className="block text-[10px] text-white/55">Ready for your first season</small></span>
              </div>
            )}
          </div>
        </section>

        <section aria-label="Choose career mode" className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <article className="group relative isolate flex min-h-[220px] overflow-hidden border border-[#4777AE]/70 bg-[#10243A]/90 shadow-[0_16px_36px_rgba(0,0,0,.28)] sm:min-h-[250px]">
            <img src={managerEmblem} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-55" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/90 to-[#13386C]/35" />
            <div className="absolute inset-y-0 left-0 w-1 bg-[#F6C21C]" />
            <div className="flex w-full flex-col justify-between gap-5 p-5 sm:p-6">
              <div className="max-w-[520px]">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[.2em] text-[#F6C21C]"><Shield size={14}/> MASTER LEAGUE</div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl">Manager Career</h2>
                <p className="mt-3 max-w-md text-xs leading-relaxed text-white/75 sm:text-sm">Build your squad, set your tactics, negotiate transfers and contracts, develop young talent, and lead your club to silverware.</p>
              </div>
              <button type="button" onClick={() => onStartNewCareer('MANAGER', firstEmptySlot)} className="flex min-h-11 w-full items-center justify-center gap-2 border border-[#F6C21C]/70 bg-[#F6C21C] px-5 text-xs font-black tracking-[.13em] text-[#0D1B2A] transition hover:brightness-110 sm:w-fit sm:min-w-[220px]">
                <Shield size={15}/> NEW MANAGER CAREER <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>

          <article className="group relative isolate flex min-h-[220px] overflow-hidden border border-[#4777AE]/70 bg-[#10243A]/90 shadow-[0_16px_36px_rgba(0,0,0,.28)] sm:min-h-[250px]">
            <img src={legendEmblem} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-55" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/90 to-[#13386C]/35" />
            <div className="absolute inset-y-0 left-0 w-1 bg-[#235BA8]" />
            <div className="flex w-full flex-col justify-between gap-5 p-5 sm:p-6">
              <div className="max-w-[520px]">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[.2em] text-[#F6C21C]"><Trophy size={14}/> BECOME A LEGEND</div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl">Player Career</h2>
                <p className="mt-3 max-w-md text-xs leading-relaxed text-white/75 sm:text-sm">Create your footballer, earn your place in the team, make key match decisions, win international call-ups, and chase the Ballon d'Or.</p>
              </div>
              <button type="button" onClick={() => onStartNewCareer('PLAYER', firstEmptySlot)} className="flex min-h-11 w-full items-center justify-center gap-2 border border-[#F6C21C]/60 bg-[#13386C] px-5 text-xs font-black tracking-[.13em] text-white transition hover:bg-[#235BA8] sm:w-fit sm:min-w-[220px]">
                <Trophy size={15}/> NEW PLAYER CAREER <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <button type="button" onClick={() => setShowSaves((value) => !value)} aria-expanded={showSaves} className="flex min-h-10 items-center gap-2 text-left text-xs font-black tracking-wider text-white/85 transition hover:text-[#F6C21C]">
            <FolderOpen size={16} className="text-[#F6C21C]"/>
            CAREER SAVES <span className="text-[#F6C21C]">{savedSlots.length}/5</span>
            <ChevronDown size={15} className={showSaves ? 'rotate-180 transition-transform' : 'transition-transform'}/>
          </button>
          <button type="button" onClick={() => setShowAccount((value) => !value)} aria-expanded={showAccount} className="flex min-h-10 items-center gap-2 text-xs font-bold text-white/65 transition hover:text-[#F6C21C]">
            <Cloud size={15} className="text-[#F6C21C]"/> CLOUD SYNC
            <ChevronDown size={14} className={showAccount ? 'rotate-180 transition-transform' : 'transition-transform'}/>
          </button>
        </section>

        {showSaves && (
          <section className="max-h-[42dvh] overflow-y-auto rounded border border-white/15 bg-[#0D1B2A]/95 p-2 sm:p-3">
            <SaveSlotsScreen slots={slots} onLoad={onLoadCareer} onNewCareer={onStartNewCareer} onDelete={onDeleteSlot}/>
          </section>
        )}
        {showAccount && (
          <section className="flex justify-end">
            <AccountPanel />
          </section>
        )}
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-[9px] font-bold tracking-[.12em] text-white/40 sm:px-7">
        <span>OFFLINE CAREER ENGINE <span className="mx-2 text-[#F6C21C]">◆</span> CLOUD SYNC OPTIONAL</span>
        <span className="hidden sm:inline">EUROPE · AFRICA · SOUTH AMERICA · ASIA · INTERNATIONAL</span>
      </footer>
    </div>
  );
};
