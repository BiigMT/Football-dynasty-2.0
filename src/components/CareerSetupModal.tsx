import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import {
  CareerMode,
  GameDifficulty,
  PlayerAppearance,
  PlayingStyle,
  Position,
  Region,
} from '../types/football';
import { LEAGUE_BLUEPRINTS, NATIONAL_TEAM_BLUEPRINTS } from '../engine/database';
import { ClubBadge } from './ClubBadge';
import { PlayerPortrait } from './PlayerPortrait';

interface CareerSetupModalProps {
  mode: CareerMode;
  slotId: string;
  onCancel: () => void;
  onConfirmManager: (data: {
    slotId: string;
    managerName: string;
    nationality: string;
    philosophy: 'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced';
    clubId: string;
    difficulty: GameDifficulty;
  }) => void;
  onConfirmLegend: (data: {
    slotId: string;
    playerName: string;
    nationality: string;
    age: number;
    heightCm: number;
    weightKg: number;
    preferredFoot: 'Right' | 'Left' | 'Both';
    position: Position;
    secondaryPositions: Position[];
    shirtNumber: number;
    playingStyle: PlayingStyle;
    appearance: PlayerAppearance;
    clubId: string;
    difficulty: GameDifficulty;
  }) => void;
}

const REGIONS: { id: Region; label: string }[] = [
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'SOUTH_AMERICA', label: 'South America' },
  { id: 'ASIA', label: 'Asia' },
];

const POSITIONS: Position[] = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'];

const STYLES_BY_POS: Record<Position, PlayingStyle> = {
  ST: 'Poacher',
  LW: 'Prolific Winger',
  RW: 'Prolific Winger',
  CAM: 'Creative Playmaker',
  CM: 'Box-to-Box',
  CDM: 'Anchor Man',
  LB: 'Attacking Full-Back',
  RB: 'Attacking Full-Back',
  CB: 'Build-Up Stopper',
  GK: 'Sweeper Keeper',
};

const SKIN_TONES = ['#F8D9C6', '#E8B896', '#C98C63', '#A66842', '#7B482B', '#542F1C'];
const HAIR_STYLES: PlayerAppearance['hairStyle'][] = ['SHORT', 'FADE', 'CURLY', 'BRAIDS', 'BUZZ', 'SWEEP'];
const HAIR_COLORS = ['#18181B', '#3F2718', '#78350F', '#D97706'];
const FACE_STYLES: PlayerAppearance['faceStyle'][] = ['YOUTHFUL', 'CLASSIC', 'BEARD', 'GOATEE'];

export const CareerSetupModal: React.FC<CareerSetupModalProps> = ({
  mode,
  slotId,
  onCancel,
  onConfirmManager,
  onConfirmLegend,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<Region>('EUROPE');
  const regionLeagues = LEAGUE_BLUEPRINTS.filter((l) => l.region === selectedRegion);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(regionLeagues[0]?.id ?? 'eng_prem');
  const activeLeague = LEAGUE_BLUEPRINTS.find((l) => l.id === selectedLeagueId) ?? regionLeagues[0] ?? LEAGUE_BLUEPRINTS[0];
  const [selectedClubId, setSelectedClubId] = useState<string>(activeLeague.clubs[0].id);

  // Manager fields
  const [managerName, setManagerName] = useState('Alex Mercer');
  const [nationality, setNationality] = useState('Nigeria');
  const [philosophy, setPhilosophy] = useState<'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced'>('Gegenpress');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('NORMAL');

  // Legend fields
  const [playerName, setPlayerName] = useState('Kofi Mensah');
  const [age, setAge] = useState(18);
  const [heightCm, setHeightCm] = useState(181);
  const [weightKg, setWeightKg] = useState(74);
  const [preferredFoot, setPreferredFoot] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [position, setPosition] = useState<Position>('ST');
  const [shirtNumber, setShirtNumber] = useState(19);
  const [appearance, setAppearance] = useState<PlayerAppearance>({
    skinTone: SKIN_TONES[3],
    hairStyle: 'FADE',
    hairColor: HAIR_COLORS[0],
    faceStyle: 'YOUTHFUL',
  });

  const handleRegionChange = (r: Region) => {
    setSelectedRegion(r);
    const firstLeague = LEAGUE_BLUEPRINTS.find((l) => l.region === r);
    if (firstLeague) {
      setSelectedLeagueId(firstLeague.id);
      setSelectedClubId(firstLeague.clubs[0].id);
    }
  };

  const handleLeagueChange = (lid: string) => {
    setSelectedLeagueId(lid);
    const lg = LEAGUE_BLUEPRINTS.find((l) => l.id === lid);
    if (lg) setSelectedClubId(lg.clubs[0].id);
  };

  const selectedClub = activeLeague.clubs.find((c) => c.id === selectedClubId) ?? activeLeague.clubs[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'MANAGER') {
      onConfirmManager({
        slotId,
        managerName: managerName.trim() || 'Alex Mercer',
        nationality,
        philosophy,
        clubId: selectedClub.id,
        difficulty,
      });
    } else {
      const secondary: Position[] =
        position === 'ST'
          ? ['LW', 'RW']
          : position === 'CAM'
          ? ['CM', 'LW']
          : position === 'GK'
          ? []
          : ['CM'];
      onConfirmLegend({
        slotId,
        playerName: playerName.trim() || 'Kofi Mensah',
        nationality,
        age,
        heightCm,
        weightKg,
        preferredFoot,
        position,
        secondaryPositions: secondary,
        shirtNumber,
        playingStyle: STYLES_BY_POS[position],
        appearance,
        clubId: selectedClub.id,
        difficulty,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 py-6 px-4 sm:px-6">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-[#131A22] border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="text-right">
            <div className={`text-xs font-medium ${mode === 'MANAGER' ? 'text-cyan-400' : 'text-amber-400'}`}>
              {mode === 'MANAGER' ? 'Master League Setup' : 'Become a Legend Creator'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-white">
              {mode === 'MANAGER' ? 'Create Manager & Select Club' : 'Create Your Footballer'}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile & Customization */}
          <div className="lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-5">
            {mode === 'MANAGER' ? (
              <>
                <h2 className="text-xl font-bold text-white">Manager Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                    <span>Manager Name</span>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      maxLength={28}
                      required
                      className="min-h-[44px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                    <span>Nationality</span>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="min-h-[44px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {NATIONAL_TEAM_BLUEPRINTS.map((n) => (
                        <option key={n.id} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <span className="block text-xs text-slate-400 mb-2">Career Difficulty</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([{ id: 'EASY', label: 'Easy', detail: 'More forgiving' }, { id: 'NORMAL', label: 'Normal', detail: 'Balanced challenge' }, { id: 'HARD', label: 'Hard', detail: 'Strict & demanding' }] as const).map((level) => (
                      <button key={level.id} type="button" onClick={() => setDifficulty(level.id)} className={`rounded-lg border px-2 py-3 text-left ${difficulty === level.id ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-[#0B0F14] text-slate-300'}`}>
                        <strong className="block text-sm">{level.label}</strong><span className="text-[10px] text-slate-400">{level.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 mb-2">Tactical Philosophy</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Gegenpress', 'Possession', 'Counter-Attack', 'Balanced'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPhilosophy(p)}
                        className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                          philosophy === p
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-[#0B0F14] border-white/10 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <PlayerPortrait
                    appearance={appearance}
                    jerseyPrimary={selectedClub.primaryColor}
                    jerseySecondary={selectedClub.secondaryColor}
                    shirtNumber={shirtNumber}
                    size={84}
                    className="border border-white/15"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white">{playerName || 'New Prospect'}</h2>
                    <div className="text-xs text-amber-400 font-medium mt-0.5">
                      {position} · {STYLES_BY_POS[position]} · #{shirtNumber}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Age {age} · {heightCm}cm · {weightKg}kg · {preferredFoot} Foot
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    <span>Player Name</span>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={28}
                      required
                      className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    <span>Nationality</span>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      {NATIONAL_TEAM_BLUEPRINTS.map((n) => (
                        <option key={n.id} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    <span>Position</span>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value as Position)}
                      className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      {POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos} ({STYLES_BY_POS[pos]})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs text-slate-400">
                      <span>Age (17–21)</span>
                      <input
                        type="number"
                        min={17}
                        max={21}
                        value={age}
                        onChange={(e) => setAge(Math.max(17, Math.min(21, Number(e.target.value))))}
                        className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white font-mono-num"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-slate-400">
                      <span>Shirt #</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={shirtNumber}
                        onChange={(e) => setShirtNumber(Math.max(1, Math.min(99, Number(e.target.value))))}
                        className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white font-mono-num"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    <span>Height ({heightCm} cm)</span>
                    <input
                      type="range"
                      min={166}
                      max={198}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="accent-amber-400 mt-2"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    <span>Preferred Foot</span>
                    <select
                      value={preferredFoot}
                      onChange={(e) => setPreferredFoot(e.target.value as 'Right' | 'Left' | 'Both')}
                      className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white"
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Both">Both</option>
                    </select>
                  </label>
                </div>

                {/* Appearance Customization */}
                <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Skin Tone</span>
                    <div className="flex items-center gap-2">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setAppearance({ ...appearance, skinTone: tone })}
                          style={{ backgroundColor: tone }}
                          className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                            appearance.skinTone === tone ? 'border-amber-400 scale-110' : 'border-transparent'
                          }`}
                          aria-label="Select skin tone"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={appearance.hairStyle}
                      onChange={(e) =>
                        setAppearance({ ...appearance, hairStyle: e.target.value as PlayerAppearance['hairStyle'] })
                      }
                      className="min-h-[40px] px-2 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                    >
                      {HAIR_STYLES.map((hs) => (
                        <option key={hs} value={hs}>
                          Hair: {hs}
                        </option>
                      ))}
                    </select>
                    <select
                      value={appearance.hairColor}
                      onChange={(e) => setAppearance({ ...appearance, hairColor: e.target.value })}
                      className="min-h-[40px] px-2 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                    >
                      <option value="#18181B">Jet Black</option>
                      <option value="#3F2718">Dark Brown</option>
                      <option value="#78350F">Chestnut</option>
                      <option value="#D97706">Blonde</option>
                    </select>
                    <select
                      value={appearance.faceStyle}
                      onChange={(e) =>
                        setAppearance({ ...appearance, faceStyle: e.target.value as PlayerAppearance['faceStyle'] })
                      }
                      className="min-h-[40px] px-2 rounded bg-[#0B0F14] border border-white/15 text-xs text-white"
                    >
                      {FACE_STYLES.map((fs) => (
                        <option key={fs} value={fs}>
                          Face: {fs}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: World League & Club Selection */}
          <div className="lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">Select Region, League & Club</h2>

            {/* Region Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-[#0B0F14] p-1 rounded-lg">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRegionChange(r.id)}
                  className={`min-h-[40px] flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedRegion === r.id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* League Selector */}
            {regionLeagues.length > 1 && (
              <div className="flex gap-2">
                {regionLeagues.map((lg) => (
                  <button
                    key={lg.id}
                    type="button"
                    onClick={() => handleLeagueChange(lg.id)}
                    className={`min-h-[40px] flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeLeague.id === lg.id
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                        : 'border-white/10 bg-[#0B0F14] text-slate-400 hover:text-white'
                    }`}
                  >
                    {lg.name}
                  </button>
                ))}
              </div>
            )}

            {/* Club List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {activeLeague.clubs.map((c) => {
                const active = c.id === selectedClub.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClubId(c.id)}
                    className={`min-h-[64px] p-3 rounded-lg border text-left transition-colors flex items-center gap-3 cursor-pointer ${
                      active
                        ? mode === 'MANAGER'
                          ? 'bg-cyan-500/15 border-cyan-400'
                          : 'bg-amber-500/15 border-amber-400'
                        : 'bg-[#0B0F14] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <ClubBadge
                      shortName={c.shortName}
                      primaryColor={c.primaryColor}
                      secondaryColor={c.secondaryColor}
                      size={38}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                      <div className="text-xs text-slate-400 font-mono-num">
                        {c.country} · Rep {c.reputation} · {c.formation}
                      </div>
                    </div>
                    {active && (
                      <Check
                        className={`w-4 h-4 shrink-0 ${mode === 'MANAGER' ? 'text-cyan-400' : 'text-amber-400'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Selected: <span className="text-white font-semibold">{selectedClub.name}</span> ({selectedClub.stadiumName})
              </div>
              <button
                type="submit"
                className={`min-h-[46px] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'MANAGER'
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {mode === 'MANAGER' ? 'Sign Contract & Start' : 'Begin Career'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
