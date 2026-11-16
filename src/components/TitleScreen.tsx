import React from 'react';
import { Volume2, VolumeX, Play, Shield, Trophy } from 'lucide-react';
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
  const firstEmptySlot = slots.find((s) => s.empty)?.slotId ?? 'slot_1';
  const latestSaved = [...slots]
    .filter((s) => !s.empty)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0B0F14] text-slate-100 flex flex-col justify-between">
      {/* Floodlit Stadium Key-Art Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={stadiumHero}
          alt="Floodlit stadium pitch at night"
          className="h-full w-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/75 to-[#0B0F14]/55" />
      </div>

      {/* Minimal Top Utility Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tracking-wider text-slate-400">
            Master League · Become a Legend · Global Football Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
        <button type="button" onClick={onChangeOrientation} className="min-h-[44px] rounded-lg border border-white/10 bg-[#131A22]/85 px-3 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400/50">{orientation === 'portrait' ? 'Portrait' : 'Landscape'} · Change</button>
        <button
          type="button"
          onClick={onToggleMute}
          className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-[#131A22]/85 border border-white/10 text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2 text-xs font-medium whitespace-nowrap shrink-0"
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>{muted ? 'Audio Off' : 'Audio On'}</span>
        </button>
        </div>
      </div>

      {/* Main Hero & Mode Selection */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col gap-8">\n        <AccountPanel />
        {/* Bespoke SVG Title Lockup */}
        <div className="max-w-2xl">
          <svg
            viewBox="0 0 560 92"
            className="w-full max-w-[520px] h-auto mb-3"
            role="img"
            aria-label="Football Dynasty"
          >
            <defs>
              <linearGradient id="dynastyCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="68%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
            <path d="M4 18 L18 18 L14 74 L4 74 Z" fill="#06B6D4" />
            <path d="M22 18 L28 18 L24 74 L18 74 Z" fill="#F59E0B" />
            <text
              x="40"
              y="62"
              fill="url(#dynastyCyan)"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="800"
              fontSize="58"
              letterSpacing="2"
            >
              FOOTBALL DYNASTY
            </text>
          </svg>
          <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
            Command a football club across global leagues and continental cups, or forge your own player career from academy prospect to world icon.
          </p>

          {latestSaved && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onLoadCareer(latestSaved.slotId)}
                className="min-h-[44px] px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {latestSaved.hasHalfTimeMatch ? 'Resume Half-Time Match' : 'Continue Career'}
                </span>
              </button>
              <span className="text-xs text-slate-400 font-mono-num">
                {latestSaved.title} · Season {latestSaved.season} · Week {latestSaved.week}
              </span>
            </div>
          )}
        </div>

        {/* Two Career Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Manager Career Card */}
          <div className="group rounded-xl bg-[#131A22]/90 border border-white/10 hover:border-cyan-400/50 transition-colors overflow-hidden flex flex-col sm:flex-row">
            <div className="sm:w-40 h-40 sm:h-auto shrink-0 bg-[#0D131A] relative overflow-hidden">
              <img
                src={managerEmblem}
                alt="Manager Career tactical board"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex flex-col justify-between gap-4 flex-1">
              <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Master League Experience</span>
                </div>
                <h2 className="text-2xl font-bold tracking-wide text-white">Manager Career</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Build tactics, negotiate transfers and contracts, promote youth academy stars, and lead clubs and national teams to silverware.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartNewCareer('MANAGER', firstEmptySlot)}
                className="min-h-[44px] w-full sm:w-auto self-start px-5 py-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                New Manager Career
              </button>
            </div>
          </div>

          {/* Player Career Card */}
          <div className="group rounded-xl bg-[#131A22]/90 border border-white/10 hover:border-amber-400/50 transition-colors overflow-hidden flex flex-col sm:flex-row">
            <div className="sm:w-40 h-40 sm:h-auto shrink-0 bg-[#0D131A] relative overflow-hidden">
              <img
                src={legendEmblem}
                alt="Player Career golden boots and match ball"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex flex-col justify-between gap-4 flex-1">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Become a Legend Experience</span>
                </div>
                <h2 className="text-2xl font-bold tracking-wide text-white">Player Career</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Create your footballer, earn the manager&apos;s trust, decide pivotal key match moments, win international call-ups, and chase the Ballon d&apos;Or.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartNewCareer('PLAYER', firstEmptySlot)}
                className="min-h-[44px] w-full sm:w-auto self-start px-5 py-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                New Player Career
              </button>
            </div>
          </div>
        </div>

        <SaveSlotsScreen
          slots={slots}
          onLoad={onLoadCareer}
          onNewCareer={onStartNewCareer}
          onDelete={onDeleteSlot}
        />
      </main>

      {/* Flat Footer Hint */}
      <footer className="relative z-10 px-6 py-4 max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Click or tap to navigate · Select a career mode or load a saved slot</span>
        <span>Europe · Africa · South America · Asia · International</span>
      </footer>
    </div>
  );
};
