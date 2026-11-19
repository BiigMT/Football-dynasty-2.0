import React from 'react';
import { ArrowLeft, FolderOpen, Shield, UserRound, Trophy, ChevronRight } from 'lucide-react';
import type { CareerMode } from '../types/football';
import type { SaveSlotSummary } from '../engine/storage';
import { RealisticAvatar } from './RealisticAvatar';

interface Props {
  slots: SaveSlotSummary[];
  onStart: (mode: CareerMode) => void;
  onLoad: (slotId: string) => void;
  onBack: () => void;
}

export const CareerModeSelect: React.FC<Props> = ({ slots, onStart, onLoad, onBack }) => {
  const latest = [...slots]
    .filter((slot) => !slot.empty)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];

  return (
    <main
      className="relative flex h-[100dvh] min-h-[440px] w-full flex-col overflow-x-hidden overflow-y-auto bg-[#0D1B2A] p-3 text-[#E8EDF5] sm:p-4"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/media/game/phone-stadium.jpg"
          alt=""
          className="h-full w-full object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-[#0D1B2A]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(35,91,168,0.38),transparent_65%)]" />
      </div>

      <header className="relative z-10 grid min-h-[54px] grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[#235BA8]/60 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-10 w-fit items-center gap-2 rounded border border-[#235BA8]/70 bg-[#10243A]/90 px-3 text-[11px] font-black tracking-wider text-[#E8EDF5] transition hover:border-[#F6C21C] hover:text-[#F6C21C] sm:px-4 sm:text-xs"
        >
          <ArrowLeft size={15} /> <span className="hidden xs:inline">BACK TO TITLE</span><span className="xs:hidden">BACK</span>
        </button>

        <div className="text-center leading-none">
          <div className="text-[9px] font-black tracking-[.32em] text-[#F6C21C] sm:text-[10px]">FOOTBALL DYNASTY</div>
          <h1 className="mt-1 text-lg font-black tracking-wide text-white sm:text-2xl">CHOOSE YOUR CAREER</h1>
        </div>

        <button
          type="button"
          disabled={!latest}
          onClick={() => latest && onLoad(latest.slotId)}
          className="ml-auto flex min-h-10 items-center gap-2 rounded border border-[#F6C21C]/60 bg-[#10243A]/90 px-2.5 text-[10px] font-black tracking-wide text-[#F6C21C] transition hover:bg-[#F6C21C] hover:text-[#0D1B2A] disabled:cursor-not-allowed disabled:opacity-35 sm:px-4 sm:text-xs"
        >
          <FolderOpen size={15} /> <span className="hidden sm:inline">LOAD SAVED CAREER</span><span className="sm:hidden">LOAD</span>
        </button>
      </header>

      <section className="relative z-10 mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 landscape:grid-cols-2 landscape:gap-4">
        <article className="group relative isolate flex min-h-[330px] flex-col justify-between overflow-hidden rounded-md border border-[#235BA8] bg-[#10243A] shadow-[0_14px_36px_rgba(0,0,0,0.32)] landscape:min-h-0">
          <img
            src="/media/game/team-talk.jpg"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-65"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0D1B2A] via-[#10243A]/90 to-[#13386C]/45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0D1B2A] via-transparent to-[#0D1B2A]/20" />
          <div className="absolute left-0 top-0 h-full w-1 bg-[#F6C21C]" />
          <div className="absolute right-4 top-4 text-[9px] font-black tracking-[.24em] text-[#F6C21C]/90">01 / THE TOUCHLINE</div>

          <div className="relative flex min-h-0 flex-1 items-center justify-between gap-1 px-4 pb-2 pt-9 sm:px-6 landscape:px-5">
            <div className="relative z-10 min-w-0 max-w-[65%]">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[.22em] text-[#F6C21C] sm:text-xs">
                <Shield size={14} /> MASTER LEAGUE
              </div>
              <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[.82] tracking-tight text-white drop-shadow-lg">
                MANAGER<br />CAREER
              </h2>
              <p className="mt-3 max-w-[260px] text-xs leading-relaxed text-[#E8EDF5]/85 sm:text-sm">
                Build your club. Shape the squad. Make the decisions that define a dynasty.
              </p>
              <ul className="mt-3 hidden space-y-1.5 text-[11px] font-semibold text-[#E8EDF5]/90 sm:block sm:text-xs">
                <li className="flex items-center gap-2"><span className="text-[#F6C21C]">◆</span> Full squad and tactical control</li>
                <li className="flex items-center gap-2"><span className="text-[#F6C21C]">◆</span> Transfers, contracts and youth academy</li>
                <li className="flex items-center gap-2"><span className="text-[#F6C21C]">◆</span> Lead your club to silverware</li>
              </ul>
            </div>
            <div className="pointer-events-none relative flex h-full min-w-0 flex-1 items-end justify-end self-stretch">
              <RealisticAvatar
                seed="manager-career-mode"
                name="Manager career avatar"
                outfit="manager_suit"
                width="min(39vw, 250px)"
                height="100%"
                className="max-h-full w-auto drop-shadow-[0_12px_18px_rgba(0,0,0,0.45)]"
                primaryColor="#13386C"
                secondaryColor="#0D1B2A"
                tieColor="#F6C21C"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 border-t border-[#235BA8]/60 bg-[#0D1B2A]/90 px-4 py-3 sm:px-6">
            <div className="hidden text-[9px] font-bold tracking-[.2em] text-[#E8EDF5]/55 sm:block">TAKE THE HOT SEAT</div>
            <button
              type="button"
              onClick={() => onStart('MANAGER')}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded bg-[#F6C21C] px-4 text-xs font-black tracking-[.12em] text-[#0D1B2A] shadow-[0_4px_0_#b88e0b] transition hover:brightness-110 active:translate-y-0.5 active:shadow-none sm:flex-none sm:min-w-[220px]"
            >
              <Shield size={16} /> START MANAGER CAREER <ChevronRight size={16} />
            </button>
          </div>
        </article>

        <article className="group relative isolate flex min-h-[330px] flex-col justify-between overflow-hidden rounded-md border border-[#4777AE] bg-[#10243A] shadow-[0_14px_36px_rgba(0,0,0,0.32)] landscape:min-h-0">
          <img
            src="/media/game/player-action.jpg"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-65"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0D1B2A] via-[#10243A]/90 to-[#13386C]/45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0D1B2A] via-transparent to-[#0D1B2A]/20" />
          <div className="absolute left-0 top-0 h-full w-1 bg-[#235BA8]" />
          <div className="absolute right-4 top-4 text-[9px] font-black tracking-[.24em] text-[#F6C21C]/90">02 / THE PITCH</div>

          <div className="relative flex min-h-0 flex-1 items-center justify-between gap-1 px-4 pb-2 pt-9 sm:px-6 landscape:px-5">
            <div className="relative z-10 min-w-0 max-w-[65%]">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-[.22em] text-[#F6C21C] sm:text-xs">
                <UserRound size={14} /> BECOME A LEGEND
              </div>
              <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[.82] tracking-tight text-white drop-shadow-lg">
                PLAYER<br />CAREER
              </h2>
              <p className="mt-3 max-w-[260px] text-xs leading-relaxed text-[#E8EDF5]/85 sm:text-sm">
                Start with a dream. Earn your place. Write your name into football history.
              </p>
              <ul className="mt-3 hidden space-y-1.5 text-[11px] font-semibold text-[#E8EDF5]/90 sm:block sm:text-xs">
                <li className="flex items-center gap-2"><span className="text-[#F6C21C]">◆</span> Create your pro or choose a rising star</li>
                <li className="flex items-center gap-2"><span className="text-[#F6C21C]">◆</span> Fight for your place and transfers</li>
                <li className="flex items-center gap-2"><span className="text-[#F6C21C]">◆</span> Win trophies and earn international caps</li>
              </ul>
            </div>
            <div className="pointer-events-none relative flex h-full min-w-0 flex-1 items-end justify-end self-stretch">
              <RealisticAvatar
                seed="player-career-mode"
                name="Player career avatar"
                outfit="player_kit"
                width="min(39vw, 250px)"
                height="100%"
                className="max-h-full w-auto drop-shadow-[0_12px_18px_rgba(0,0,0,0.45)]"
                primaryColor="#235BA8"
                secondaryColor="#0D1B2A"
                shirtNumber={10}
              />
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 border-t border-[#235BA8]/60 bg-[#0D1B2A]/90 px-4 py-3 sm:px-6">
            <div className="hidden text-[9px] font-bold tracking-[.2em] text-[#E8EDF5]/55 sm:block">YOUR STORY STARTS HERE</div>
            <button
              type="button"
              onClick={() => onStart('PLAYER')}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded border border-[#F6C21C]/60 bg-[#13386C] px-4 text-xs font-black tracking-[.12em] text-white shadow-[0_4px_0_#0D1B2A] transition hover:bg-[#235BA8] active:translate-y-0.5 active:shadow-none sm:flex-none sm:min-w-[220px]"
            >
              <Trophy size={16} /> START PLAYER CAREER <ChevronRight size={16} />
            </button>
          </div>
        </article>
      </section>

      <footer className="relative z-10 mt-2 flex min-h-5 items-center justify-center text-center text-[8px] font-bold tracking-[.2em] text-[#E8EDF5]/45 sm:text-[9px]">
        OFFLINE CAREER ENGINE <span className="mx-2 text-[#F6C21C]">◆</span> YOUR LEGACY BEGINS HERE
      </footer>
    </main>
  );
};
