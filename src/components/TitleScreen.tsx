import React, { useState } from 'react';
import {
  Volume2, VolumeX, Shield, Trophy, Cloud, FolderOpen, Play, X, ChevronRight,
} from 'lucide-react';
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
  const savedSlots = slots.filter((slot) => !slot.empty);
  const latestSaved = [...savedSlots].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];
  const firstEmptySlot = slots.find((slot) => slot.empty)?.slotId ?? 'slot_1';

  const closeOverlays = () => {
    setShowSaves(false);
    setShowAccount(false);
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#0D1B2A] text-[#E8EDF5]">
      <div className="pointer-events-none absolute inset-0">
        <img src={stadiumHero} alt="" className="h-full w-full object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/78 to-[#0D1B2A]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/15 to-[#0D1B2A]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_38%,rgba(35,91,168,0.30),transparent_62%)]" />
      </div>

      <header className="relative z-10 mx-auto flex min-h-[64px] w-full max-w-[1500px] items-center justify-between gap-3 border-b border-[#4777AE]/40 bg-[#0D1B2A]/35 px-4 py-2.5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center border border-[#F6C21C]/60 bg-[#10243A] text-[#F6C21C]">
            <Shield size={19} />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[11px] font-black tracking-[.24em] text-white">FOOTBALL <span className="text-[#F6C21C]">DYNASTY</span></div>
            <div className="hidden text-[9px] font-bold tracking-[.16em] text-white/45 sm:block">MASTER LEAGUE · BECOME A LEGEND</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={() => setShowAccount(true)} aria-label="Cloud account" title="Cloud account" className="grid h-10 w-10 place-items-center border border-[#4777AE]/40 bg-[#10243A]/90 text-[#E8EDF5]/80 transition hover:border-[#F6C21C] hover:text-[#F6C21C]">
            <Cloud size={17} />
          </button>
          <button type="button" onClick={onChangeOrientation} className="min-h-10 rounded border border-[#4777AE]/40 bg-[#10243A]/90 px-2.5 text-[9px] font-black tracking-wide text-white/75 transition hover:border-[#F6C21C]/70 hover:text-[#F6C21C] sm:px-3 sm:text-[10px]">
            {orientation === 'portrait' ? 'PORTRAIT' : 'LANDSCAPE'}
          </button>
          <button type="button" onClick={onToggleMute} aria-label={muted ? 'Unmute audio' : 'Mute audio'} title={muted ? 'Audio off' : 'Audio on'} className="grid h-10 w-10 place-items-center border border-[#4777AE]/40 bg-[#10243A]/90 text-white/80 transition hover:border-[#F6C21C]/70 hover:text-[#F6C21C]">
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} className="text-[#F6C21C]" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center gap-5 px-4 py-5 sm:gap-6 sm:px-7 sm:py-6">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-[9px] font-black tracking-[.3em] text-[#F6C21C]">
              <span className="h-px w-7 bg-[#F6C21C]" /> THE NEXT ERA OF FOOTBALL
            </div>
            <h1 className="text-[clamp(2.8rem,7vw,5.8rem)] font-black uppercase leading-[.8] tracking-[-.05em] text-white drop-shadow-[0_5px_24px_rgba(0,0,0,.35)]">
              FOOTBALL <span className="text-[#F6C21C]">DYNASTY</span>
            </h1>
            <p className="mt-4 max-w-xl border-l-2 border-[#F6C21C]/70 pl-3 text-xs leading-relaxed text-[#D6E0ED]/85 sm:text-sm">
              Build your empire from the touchline or make your name on the pitch. Your legacy starts here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {latestSaved && (
              <button type="button" onClick={() => onLoadCareer(latestSaved.slotId)} className="flex min-h-11 items-center gap-2.5 border border-[#F6C21C] bg-[#F6C21C] px-4 text-left text-[#0D1B2A] shadow-[0_3px_0_#b88e0b] transition hover:brightness-110">
                <Play size={16} fill="currentColor" />
                <span><strong className="block text-[10px] font-black tracking-wider">{latestSaved.hasHalfTimeMatch ? 'RESUME MATCH' : 'CONTINUE CAREER'}</strong><small className="block max-w-[190px] truncate text-[9px] font-semibold opacity-75">{latestSaved.title} · Season {latestSaved.season}</small></span>
              </button>
            )}
            <button type="button" onClick={() => setShowSaves(true)} className="flex min-h-11 items-center gap-2 border border-[#4777AE]/60 bg-[#10243A]/90 px-3.5 text-[10px] font-black tracking-wide text-white transition hover:border-[#F6C21C] hover:text-[#F6C21C]">
              <FolderOpen size={15} className="text-[#F6C21C]" /> {latestSaved ? 'LOAD CAREER' : 'CAREER SAVES'} <span className="text-[#F6C21C]">{savedSlots.length}/5</span>
            </button>
          </div>
        </section>

        <section aria-label="Choose career mode" className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <article className="group relative isolate flex min-h-[255px] overflow-hidden border border-[#4777AE]/65 bg-[#10243A]/90 shadow-[0_18px_42px_rgba(0,0,0,.38)] transition duration-300 hover:-translate-y-1 hover:border-[#F6C21C]/75 hover:shadow-[0_22px_48px_rgba(0,0,0,.48)] sm:min-h-[285px] landscape:min-h-[300px]">
            <img src={managerEmblem} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55 transition duration-700 group-hover:scale-[1.025] group-hover:opacity-65" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/78 to-[#13386C]/42" />
            <div className="absolute inset-y-0 left-0 w-1 bg-[#F6C21C]" />
            <div className="flex w-full flex-col justify-between gap-5 p-5 sm:p-7">
              <div className="max-w-[470px]">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[.2em] text-[#F6C21C]"><Shield size={14}/> MASTER LEAGUE</div>
                <h2 className="text-3xl font-black uppercase leading-[.9] tracking-[-.025em] text-white drop-shadow-md sm:text-[2.65rem]">Manager Career</h2>
                <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/80 sm:text-sm">Build your squad. Set your tactics. Win the trophies that define your club.</p>
              </div>
              <button type="button" onClick={() => onStartNewCareer('MANAGER', firstEmptySlot)} className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#F6C21C] bg-[#F6C21C] px-5 text-xs font-black tracking-[.14em] text-[#0D1B2A] shadow-[0_4px_0_#b88e0b] transition hover:brightness-110 active:translate-y-0.5 active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-fit sm:min-w-[230px]">
                NEW MANAGER CAREER <ChevronRight size={16}/>
              </button>
            </div>
          </article>

          <article className="group relative isolate flex min-h-[255px] overflow-hidden border border-[#4777AE]/65 bg-[#10243A]/90 shadow-[0_18px_42px_rgba(0,0,0,.38)] transition duration-300 hover:-translate-y-1 hover:border-[#F6C21C]/75 hover:shadow-[0_22px_48px_rgba(0,0,0,.48)] sm:min-h-[285px] landscape:min-h-[300px]">
            <img src={legendEmblem} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55 transition duration-700 group-hover:scale-[1.025] group-hover:opacity-65" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/75 to-[#13386C]/30" />
            <div className="absolute inset-y-0 left-0 w-1 bg-[#235BA8]" />
            <div className="flex w-full flex-col justify-between gap-4 p-5 sm:p-6">
              <div className="max-w-[470px]">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[.2em] text-[#F6C21C]"><Trophy size={14}/> BECOME A LEGEND</div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl">Player Career</h2>
                <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/80 sm:text-sm">Create your footballer. Earn your place. Chase the Ballon d'Or.</p>
              </div>
              <button type="button" onClick={() => onStartNewCareer('PLAYER', firstEmptySlot)} className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#F6C21C]/70 bg-[#13386C] px-5 text-xs font-black tracking-[.14em] text-white shadow-[0_4px_0_#0D1B2A] transition hover:bg-[#235BA8] active:translate-y-0.5 active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-fit sm:min-w-[230px]">
                NEW PLAYER CAREER <ChevronRight size={16}/>
              </button>
            </div>
          </article>
        </section>

        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[8px] font-bold tracking-[.17em] text-white/35 sm:text-[9px]">
          <span>OFFLINE CAREER ENGINE <span className="mx-1.5 text-[#F6C21C]">◆</span> CLOUD SYNC OPTIONAL</span>
          <span className="hidden sm:block">EUROPE · AFRICA · SOUTH AMERICA · ASIA · INTERNATIONAL</span>
        </div>
      </main>

      {(showSaves || showAccount) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B13]/85 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOverlays(); }}>
          <section role="dialog" aria-modal="true" aria-label={showSaves ? 'Career saves' : 'Cloud account'} className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden border border-[#4777AE]/60 bg-[#0D1B2A] shadow-2xl">
            <header className="flex min-h-12 items-center justify-between border-b border-[#4777AE]/35 bg-[#10243A] px-4">
              <div className="flex items-center gap-2 text-[11px] font-black tracking-[.16em] text-white">
                {showSaves ? <FolderOpen size={16} className="text-[#F6C21C]"/> : <Cloud size={16} className="text-[#F6C21C]"/>}
                {showSaves ? 'CAREER SAVE SLOTS' : 'FOOTBALL DYNASTY CLOUD ACCOUNT'}
              </div>
              <button type="button" onClick={closeOverlays} aria-label="Close" className="grid h-9 w-9 place-items-center text-white/65 transition hover:bg-white/10 hover:text-[#F6C21C]"><X size={18}/></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-4">
              {showSaves && <SaveSlotsScreen slots={slots} onLoad={onLoadCareer} onNewCareer={onStartNewCareer} onDelete={onDeleteSlot}/>}
              {showAccount && <div className="mx-auto w-full max-w-md py-3"><AccountPanel /></div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
