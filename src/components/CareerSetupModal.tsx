import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import {
  CareerMode,
  GameDifficulty,
  PlayerAppearance,
  PlayingStyle,
  Position,
  Region,
} from '../types/football';
import { buildWorldDatabase, LEAGUE_BLUEPRINTS } from '../engine/database';
import { ClubBadge } from './ClubBadge';
import { PlayerPortrait } from './PlayerPortrait';
import { OFFLINE_CLUBS, type OfflineClub } from '../data/offlineDatabase';
import { ClubPresentationModal } from './ClubPresentationModal';
import { NATIONS_DATABASE, CONFEDERATIONS, findNation, getNationFlagSvg } from '../data/nationsDatabase';

export interface CareerSetupModalProps {
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
    trialRating: number;
  }) => void;
}

const REGIONS: { id: Region; label: string }[] = [
  { id: 'AFRICA', label: 'Africa' },
  { id: 'EUROPE', label: 'Europe' },
  { id: 'SOUTH_AMERICA', label: 'South America' },
  { id: 'ASIA', label: 'Asia' },
  { id: 'NORTH_AMERICA', label: 'North America' },
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
  const careerWorld = useMemo(() => mode === 'PLAYER' ? buildWorldDatabase() : null, [mode]);
  const [selectedRegion, setSelectedRegion] = useState<Region>(mode === 'PLAYER' ? 'AFRICA' : 'EUROPE');
  const regionLeagues = LEAGUE_BLUEPRINTS.filter((l) => l.region === selectedRegion);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(regionLeagues[0]?.id ?? 'eng_prem');
  const activeLeague = LEAGUE_BLUEPRINTS.find((l) => l.id === selectedLeagueId) ?? regionLeagues[0] ?? LEAGUE_BLUEPRINTS[0];
  const [selectedClubId, setSelectedClubId] = useState<string>(activeLeague.clubs[0].id);

  // Manager fields
  const [managerName, setManagerName] = useState('Alex Mercer');
  const [nationality, setNationality] = useState('Zambia');
  const [nationQuery, setNationQuery] = useState('');
  const [nationConfederation, setNationConfederation] = useState<string>('ALL');
  const [philosophy, setPhilosophy] = useState<'Possession' | 'Gegenpress' | 'Counter-Attack' | 'Balanced'>('Gegenpress');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('NORMAL');
  const [trialRating, setTrialRating] = useState(65);
  const [trialStep, setTrialStep] = useState(0);
  const [trialScore, setTrialScore] = useState(0);
  const [trialComplete, setTrialComplete] = useState(false);
  const [showClubPresentation, setShowClubPresentation] = useState(false);
  const [originPathway, setOriginPathway] = useState<'TRIAL' | 'DOMESTIC' | 'GLOBAL'>('TRIAL');
  const [creationStep, setCreationStep] = useState<1 | 2 | 3>(1);
  const [clubSearch, setClubSearch] = useState('');

  // Legend fields
  const [playerName, setPlayerName] = useState('Kofi Mensah');
  const [age, setAge] = useState(16);
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

  const handlePlayerNationalityChange = (value: string) => {
    setNationality(value);
    const nation = findNation(value);
    if (!nation) return;
    const region: Region = nation.confederation === 'CAF' ? 'AFRICA' : nation.confederation === 'CONMEBOL' ? 'SOUTH_AMERICA' : nation.confederation === 'AFC' || nation.confederation === 'OFC' ? 'ASIA' : nation.confederation === 'CONCACAF' ? 'NORTH_AMERICA' : 'EUROPE';
    const league = LEAGUE_BLUEPRINTS.find((item) => item.clubs.some((team) => team.country === nation.name)) ?? LEAGUE_BLUEPRINTS.find((item) => item.region === region);
    if (league) {
      setSelectedRegion(region);
      setSelectedLeagueId(league.id);
      setSelectedClubId(league.clubs.find((team) => team.country === nation.name)?.id ?? league.clubs[0].id);
    }
  };
  const selectGlobalClub = (clubId: string) => {
    const league = LEAGUE_BLUEPRINTS.find((item) => item.clubs.some((team) => team.id === clubId));
    if (league) { setSelectedRegion(league.region); setSelectedLeagueId(league.id); setSelectedClubId(clubId); }
  };

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
  const selectedNation = findNation(nationality);
  const academyCandidates = [...activeLeague.clubs].sort((a, b) => a.reputation - b.reputation);
  const academyOffer = academyCandidates[Math.min(academyCandidates.length - 1, trialRating >= 88 ? 2 : trialRating >= 75 ? 1 : 0)] ?? selectedClub;
  const presentationSource = mode === 'MANAGER' ? selectedClub : originPathway === 'TRIAL' ? academyOffer : selectedClub;
  const rosterTemplate = OFFLINE_CLUBS.find((club) => club.division === 1) ?? OFFLINE_CLUBS[0];
  const presentationClub: OfflineClub = {
    ...rosterTemplate,
    id: presentationSource.id,
    fullName: presentationSource.name + ' Football Club',
    name: presentationSource.name,
    shortCode: presentationSource.shortName.slice(0, 3).toUpperCase(),
    country: presentationSource.country,
    leagueName: activeLeague.name,
    stadiumName: presentationSource.stadiumName,
    stadiumCapacity: presentationSource.stadiumCapacity,
    primaryColor: presentationSource.primaryColor,
    secondaryColor: presentationSource.secondaryColor,
    clubPrestige: Math.max(1, Math.min(5, Math.round(presentationSource.reputation / 20))) as 1|2|3|4|5,
    players: rosterTemplate.players.map((player) => ({ ...player, id: presentationSource.id + '-' + player.id })),
  };

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
        clubId: originPathway === 'TRIAL' ? academyOffer.id : selectedClub.id,
        difficulty,
        trialRating,
      });
    }
  };

  return (
    <div className={mode === 'PLAYER' ? "fd-player-creation-screen min-h-screen py-5 px-3 sm:px-5" : "min-h-screen bg-[#0D1B2A] text-slate-100 px-3 py-4 sm:px-6 sm:py-5"}>
      <form onSubmit={handleSubmit} className={mode === 'MANAGER' ? "mx-auto flex w-full max-w-[1440px] flex-col gap-4" : "max-w-5xl mx-auto flex flex-col gap-6"}>
        {/* Header */}
        <div className={mode === 'MANAGER' ? "flex items-center justify-between border-b border-[#4777AE]/50 pb-3" : "flex items-center justify-between border-b border-white/10 pb-4"}>
          <button
            type="button"
            onClick={onCancel}
            className={mode === 'MANAGER' ? "min-h-[42px] px-4 rounded border border-[#4777AE]/60 bg-[#10243A] text-[#E8EDF5] hover:border-[#F6C21C]/70 hover:text-white flex items-center gap-2 text-xs font-bold tracking-wide cursor-pointer" : "min-h-[44px] px-3 py-2 rounded-lg bg-[#131A22] border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-sm cursor-pointer"}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="text-right">
            <div className={`text-[10px] font-black uppercase tracking-[.24em] ${mode === 'MANAGER' ? 'text-[#F6C21C]' : 'text-amber-400'}`}>
              {mode === 'MANAGER' ? 'Master League Setup' : 'Become a Legend Creator'}
            </div>
            <h1 className={mode === 'MANAGER' ? "mt-1 text-xl font-black uppercase tracking-wide text-white sm:text-2xl" : "text-2xl sm:text-3xl font-bold tracking-wide text-white"}>
              {mode === 'MANAGER' ? 'Create Manager & Select Club' : 'Create Your Footballer'}
            </h1>
          </div>
        </div>

        {mode === 'PLAYER' && <div className="fd-player-creation-steps" aria-label="Player creation steps">{([{step:1,label:'IDENTITY'},{step:2,label:'ORIGIN'},{step:3,label:'INTERNATIONAL'}] as const).map(item=><button key={item.step} type="button" aria-current={creationStep===item.step?'step':undefined} className={creationStep===item.step?'is-active':creationStep>item.step?'is-complete':''} onClick={()=>{if(item.step<creationStep||item.step===2&&creationStep===1) setCreationStep(item.step);}}><b>0{item.step}</b><span>{item.label}</span></button>)}</div>}
        <div className={mode === 'MANAGER' ? "grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start" : "grid grid-cols-1 lg:grid-cols-12 gap-6"}>
          {/* Left Column: Profile & Customization */}
          <div className={mode === 'MANAGER' ? "lg:col-span-4 rounded-md border border-[#4777AE]/55 bg-[#10243A] p-4 flex flex-col gap-4 shadow-[0_12px_30px_rgba(0,0,0,.22)]" : "lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-5"} style={mode === 'PLAYER' && creationStep !== 1 ? {display:'none'} : undefined}>
            {mode === 'MANAGER' ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3"><div><div className="text-[9px] font-black tracking-[.22em] text-[#F6C21C]">YOUR TOUCHLINE IDENTITY</div><h2 className="mt-1 text-lg font-black uppercase text-white">Manager Profile</h2></div><span className="rounded border border-[#F6C21C]/30 bg-[#F6C21C]/10 px-2 py-1 text-[9px] font-black tracking-wider text-[#F6C21C]">01 / 02</span></div>
                <div className={mode === 'MANAGER' ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                  <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                    <span>Manager Name</span>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      maxLength={28}
                      required
                      className="min-h-[42px] px-3 rounded border border-white/15 bg-[#0B1725] text-sm text-white outline-none transition focus:border-[#F6C21C]"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-slate-400">Nationality</span>
                    <div className="flex flex-col gap-2">
                      <input value={nationQuery} onChange={(e) => setNationQuery(e.target.value)} placeholder="Search 79 nations..." className="min-h-[38px] px-3 rounded border border-white/15 bg-[#0B1725] text-sm text-white outline-none focus:border-[#F6C21C]" />
                      <select value={nationConfederation} onChange={(e) => setNationConfederation(e.target.value)} className="min-h-[36px] px-3 rounded border border-white/15 bg-[#0B1725] text-xs text-white outline-none focus:border-[#F6C21C]"><option value="ALL">All confederations</option>{CONFEDERATIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                      <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="min-h-[42px] px-3 rounded border border-white/15 bg-[#0B1725] text-sm text-white outline-none focus:border-[#F6C21C]">
                        {NATIONS_DATABASE.filter((n) => (nationConfederation === 'ALL' || n.confederation === nationConfederation) && n.name.toLowerCase().includes(nationQuery.toLowerCase())).map((n) => <option key={n.code} value={n.name}>{n.name} · {n.confederation} · U21 {n.u21OvrRequired} / Senior {n.seniorOvrRequired}</option>)}
                      </select>
                    </div>
                  </label>
                </div>
                {selectedNation && <div className="flex items-center justify-between rounded border border-[#4777AE]/40 bg-[#0B1725] px-3 py-2.5"><div className="flex items-center gap-2"><span dangerouslySetInnerHTML={{__html:getNationFlagSvg(selectedNation.code,30)}}/><div><b className="block text-xs text-white">{selectedNation.name}</b><span className="text-[10px] text-slate-400">{selectedNation.confederation} · National pathway</span></div></div><div className="text-right"><b className="block text-xs text-[#F6C21C]">U21 {selectedNation.u21OvrRequired}</b><span className="text-[9px] text-slate-400">Senior {selectedNation.seniorOvrRequired}</span></div></div>}

                <div>
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Career Difficulty</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([{ id: 'EASY', label: 'Easy', detail: 'More forgiving' }, { id: 'NORMAL', label: 'Normal', detail: 'Balanced challenge' }, { id: 'HARD', label: 'Hard', detail: 'Strict & demanding' }] as const).map((level) => (
                      <button key={level.id} type="button" onClick={() => setDifficulty(level.id)} className={`min-h-[68px] rounded border px-2 py-2.5 text-left transition ${difficulty === level.id ? 'border-[#F6C21C] bg-[#F6C21C]/10 text-white shadow-[inset_0_0_0_1px_rgba(246,194,28,.12)]' : 'border-white/10 bg-[#0B1725] text-slate-300 hover:border-white/25'}`}>
                        <strong className="block text-sm">{level.label}</strong><span className="text-[10px] text-slate-400">{level.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Tactical Philosophy</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Gegenpress', 'Possession', 'Counter-Attack', 'Balanced'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPhilosophy(p)}
                        className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                          philosophy === p
                            ? 'bg-[#235BA8]/45 border-[#F6C21C] text-[#F6C21C]'
                            : 'bg-[#0B1725] border-white/10 text-slate-300 hover:border-white/25'
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
                    <div className="flex flex-col gap-2">
                      <input value={nationQuery} onChange={(e) => setNationQuery(e.target.value)} placeholder="Search 79 nations..." className="min-h-[36px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white" />
                      <select value={nationConfederation} onChange={(e) => setNationConfederation(e.target.value)} className="min-h-[34px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-xs text-white"><option value="ALL">All confederations</option>{CONFEDERATIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                      <select value={nationality} onChange={(e) => handlePlayerNationalityChange(e.target.value)} className="min-h-[42px] px-3 rounded-lg bg-[#0B0F14] border border-white/15 text-sm text-white focus:border-amber-400 focus:outline-none">
                        {NATIONS_DATABASE.filter((n) => (nationConfederation === 'ALL' || n.confederation === nationConfederation) && n.name.toLowerCase().includes(nationQuery.toLowerCase())).map((n) => <option key={n.code} value={n.name}>{n.name} · {n.confederation} · U21 {n.u21OvrRequired} / Senior {n.seniorOvrRequired}</option>)}
                      </select>
                    </div>
                    {selectedNation && <div className="fd-nation-card"><div className="flex items-center gap-2"><span dangerouslySetInnerHTML={{__html:getNationFlagSvg(selectedNation.code,42)}}/><div><b>{selectedNation.name}</b><small>{selectedNation.confederation} · World ranking estimate #{selectedNation.worldRanking}</small></div></div><div className="fd-nation-thresholds"><span>U-21 OVR <b>{selectedNation.u21OvrRequired}</b></span><span>SENIOR OVR <b>{selectedNation.seniorOvrRequired}</b></span></div><small>Academy pathway: {selectedNation.localAcademies.slice(0,2).join(' · ')}</small></div>}
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
                      <span>Academy age (16–17)</span>
                      <input
                        type="number"
                        min={16}
                        max={17}
                        value={age}
                        onChange={(e) => setAge(Math.max(16, Math.min(17, Number(e.target.value))))}
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
            {mode === 'PLAYER' && <button type="button" onClick={() => setCreationStep(2)} className="min-h-[46px] rounded-lg bg-[#235BA8] text-white text-sm font-bold">CONTINUE TO ORIGIN PATHWAY →</button>}
          </div>

          {/* Right Column: World League & Club Selection */}
          <div className={mode === 'MANAGER' ? "lg:col-span-8 rounded-md border border-[#4777AE]/55 bg-[#10243A] p-4 flex flex-col gap-4 shadow-[0_12px_30px_rgba(0,0,0,.22)]" : "lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-5 flex flex-col gap-4"} style={mode === 'PLAYER' && creationStep !== 2 ? {display:'none'} : undefined}>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3"><div><div className="text-[9px] font-black tracking-[.22em] text-[#F6C21C]">CHOOSE YOUR DESTINATION</div><h2 className="mt-1 text-lg font-black uppercase text-white">Select Region, League & Club</h2></div><span className="text-[10px] font-bold tracking-wider text-slate-400">{activeLeague.clubs.length} CLUBS AVAILABLE</span></div>

            {/* Region Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-[#0B0F14] p-1 rounded-lg">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRegionChange(r.id)}
                  className={`min-h-[40px] flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedRegion === r.id
                      ? 'bg-[#F6C21C] text-[#0D1B2A] shadow-[0_2px_0_#b88e0b]'
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
                        ? 'border-[#F6C21C] bg-[#F6C21C]/10 text-[#F6C21C]'
                        : 'border-white/10 bg-[#0B0F14] text-slate-400 hover:text-white'
                    }`}
                  >
                    {lg.name}
                  </button>
                ))}
              </div>
            )}

            {mode === 'MANAGER' ? (
              <>
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Club directory</div><input value={clubSearch} onChange={(e) => setClubSearch(e.target.value)} placeholder="Search this league..." className="min-h-[36px] w-full max-w-[260px] rounded border border-white/15 bg-[#0B1725] px-3 text-xs text-white outline-none focus:border-[#F6C21C]" /></div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 max-h-[430px] overflow-y-auto pr-1">
                {activeLeague.clubs.filter((c) => c.name.toLowerCase().includes(clubSearch.toLowerCase()) || c.shortName.toLowerCase().includes(clubSearch.toLowerCase())).map((c) => {
                  const active = c.id === selectedClub.id;
                  return (
                    <button key={c.id} type="button" onClick={() => setSelectedClubId(c.id)} className={`min-h-[76px] rounded border p-3 text-left transition-all flex items-center gap-3 cursor-pointer ${active ? 'bg-[#235BA8]/35 border-[#F6C21C] shadow-[inset_0_0_0_1px_rgba(246,194,28,.14)]' : 'bg-[#0B1725] border-white/10 hover:border-[#4777AE]'}`}>
                      <ClubBadge shortName={c.shortName} primaryColor={c.primaryColor} secondaryColor={c.secondaryColor} size={38} />
                      <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-white truncate">{c.name}</div><div className="text-xs text-slate-400 font-mono-num">{c.country} · Rep {c.reputation} · {c.formation}</div></div>
                      {active && <Check className="w-4 h-4 shrink-0 text-[#F6C21C]" />}
                    </button>
                  );
                })}
              </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="fd-origin-pathways">
                  {[
                    {id:'TRIAL' as const,title:'GLOBAL YOUTH SHOWCASE',sub:'Play the academy exit trial',icon:'🏟️'},
                    {id:'DOMESTIC' as const,title:'HOMETOWN ACADEMY',sub:'Start in your nation’s football system',icon:'🏠'},
                    {id:'GLOBAL' as const,title:'CHOOSE A STARTER CLUB',sub:'Browse clubs across available leagues',icon:'🌍'}
                  ].map(path=><button key={path.id} type="button" onClick={()=>setOriginPathway(path.id)} className={originPathway===path.id?'is-selected':''}><span>{path.icon}</span><b>{path.title}</b><small>{path.sub}</small></button>)}
                </div>
                {originPathway === 'TRIAL' ? (
                  <>
                    <div className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-4"><div className="text-xs font-bold uppercase tracking-wider text-amber-300">Academy trial day</div><p className="mt-1 text-sm text-slate-300">Your three trial challenges determine the academy offer and squad entry level.</p><div className="mt-3 rounded-lg border border-white/10 bg-[#0B0F14] p-3"><div className="flex items-center justify-between text-xs"><b className="text-white">{trialComplete?'Scout assessment complete':['Round 1 · First touch','Round 2 · Passing drill','Round 3 · Finishing chance'][trialStep]}</b><span className="text-amber-300">{trialComplete?trialRating+'/100':'Challenge '+(trialStep+1)+'/3'}</span></div><p className="mt-2 text-xs text-slate-400">{trialComplete?'Your score determines the level of academy offer.':['A difficult ball arrives under pressure. Choose your first touch.','A teammate makes a run. Decide how to release the ball.','You get one chance in front of goal. Choose your finish.'][trialStep]}</p>{!trialComplete?<div className="mt-3 grid gap-2">{(trialStep===0?[{label:'Control into space',points:30},{label:'Shield and keep possession',points:24},{label:'Attempt an ambitious flick',points:18}]:trialStep===1?[{label:'Thread a through ball',points:30},{label:'Play a safe short pass',points:25},{label:'Switch play quickly',points:27}]:[{label:'Place the shot',points:30},{label:'Strike with power',points:26},{label:'Try a first-time finish',points:28}]).map(action=><button key={action.label} type="button" onClick={()=>{const total=trialScore+action.points;setTrialScore(total);if(trialStep===2){setTrialRating(Math.max(55,Math.min(96,Math.round(total/90*100))));setTrialComplete(true);}else setTrialStep(step=>step+1);}} className="min-h-[40px] rounded-md border border-white/10 px-3 py-2 text-left text-xs font-semibold text-white">{action.label}</button>)}</div>:<button type="button" onClick={()=>{setTrialStep(0);setTrialScore(0);setTrialRating(65);setTrialComplete(false);}} className="mt-3 text-xs text-amber-300 underline">Replay trial</button>}</div></div>
                    <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/5 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Your academy offer</div><div className="mt-2 flex items-center gap-3"><ClubBadge shortName={academyOffer.shortName} primaryColor={academyOffer.primaryColor} secondaryColor={academyOffer.secondaryColor} size={48}/><div><b className="text-white">{academyOffer.name}</b><div className="text-xs text-slate-400">{activeLeague.name} · Academy intake · Rep {academyOffer.reputation}</div></div></div></div>
                  </>
                ) : originPathway === 'DOMESTIC' ? (
                  <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/5 p-4"><div className="text-xs font-black uppercase tracking-wider text-emerald-300">Domestic academy pathway</div><p className="mt-1 text-xs text-slate-300">A home-country start for {selectedNation?.name??nationality}. Your regional league is selected where a domestic club is available.</p><div className="mt-3 flex flex-wrap gap-2">{(selectedNation?.localAcademies??[]).map(name=><span key={name} className="rounded-lg border border-emerald-300/20 bg-white/70 px-3 py-2 text-xs font-bold text-[#13386C]">{name}</span>)}</div><div className="mt-3 flex items-center gap-3"><ClubBadge shortName={selectedClub.shortName} primaryColor={selectedClub.primaryColor} secondaryColor={selectedClub.secondaryColor} size={44}/><div><b className="text-white">{selectedClub.name}</b><p className="text-xs text-slate-400">{selectedClub.country} · {activeLeague.name} · Youth entry</p></div></div></div>
                ) : (
                  <div className="rounded-xl border border-blue-300/30 bg-blue-500/5 p-4"><div className="text-xs font-black uppercase tracking-wider text-blue-200">Global starter club directory</div><input value={clubSearch} onChange={e=>setClubSearch(e.target.value)} placeholder="Search clubs worldwide..." className="mt-3 min-h-[40px] w-full rounded-lg px-3 text-sm"/><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">{LEAGUE_BLUEPRINTS.flatMap(l=>l.clubs.map(team=>({...team,leagueName:l.name,leagueTier:l.tier}))).filter(team=>team.leagueTier>=2&&team.leagueTier<=4&&(team.name.toLowerCase().includes(clubSearch.toLowerCase())||team.country.toLowerCase().includes(clubSearch.toLowerCase()))).slice(0,80).map(team=>{const depth=careerWorld?Object.values(careerWorld.players).filter(p=>p.clubId===team.id&&(p.position===position||p.secondaryPositions?.includes(position))).sort((a,b)=>b.overall-a.overall):[];return <button key={team.id} type="button" onClick={()=>selectGlobalClub(team.id)} className={selectedClub.id===team.id?'fd-global-club is-selected':'fd-global-club'}><ClubBadge shortName={team.shortName} primaryColor={team.primaryColor} secondaryColor={team.secondaryColor} size={32}/><span><b>{team.name}</b><small>{team.country} · Tier {team.leagueTier} · {team.leagueName}</small><small>{position} depth: {depth.length} player(s) · best OVR {depth[0]?.overall ?? '—'}</small></span><small>REP {team.reputation}</small></button>})}</div><p className="mt-2 text-[10px] text-slate-400">Position depth is calculated from the offline club roster for your selected role. You still begin as a youth prospect.</p></div>
                )}
              </div>
            )}

            {mode === 'MANAGER' && <div className="rounded border border-[#F6C21C]/35 bg-[#0B1725] p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><ClubBadge shortName={selectedClub.shortName} primaryColor={selectedClub.primaryColor} secondaryColor={selectedClub.secondaryColor} size={48}/><div className="min-w-0"><div className="text-[9px] font-black tracking-[.2em] text-[#F6C21C]">YOUR CLUB</div><div className="truncate text-base font-black text-white">{selectedClub.name}</div><div className="text-[10px] text-slate-400">{selectedClub.country} · {activeLeague.name}</div></div></div><div className="flex items-center gap-4 text-right"><div><b className="block text-sm text-white">{selectedClub.reputation}</b><span className="text-[9px] text-slate-400">REPUTATION</span></div><div><b className="block text-sm text-white">{selectedClub.formation}</b><span className="text-[9px] text-slate-400">FORMATION</span></div><button type="button" onClick={() => setShowClubPresentation(true)} className="min-h-[38px] rounded border border-[#4777AE] px-3 text-[10px] font-black tracking-wider text-[#E8EDF5] hover:border-[#F6C21C] hover:text-[#F6C21C]">SQUAD & STADIUM</button></div></div></div>}
            {mode === 'PLAYER' && <button type="button" onClick={() => setShowClubPresentation(true)} className="min-h-[40px] w-full rounded border border-[#F6C21C]/50 bg-[#13386C]/40 text-[#F6C21C] text-xs font-bold tracking-wider">VIEW CLUB PRESENTATION · 22-MAN SQUAD</button>}

            <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Selected: <span className="text-white font-semibold">{mode === 'MANAGER' ? selectedClub.name : originPathway === 'TRIAL' ? academyOffer.name : selectedClub.name}</span>
              </div>
              {mode === 'MANAGER' ? <button type="submit" className="min-h-[48px] rounded bg-[#F6C21C] px-6 py-2.5 text-xs font-black uppercase tracking-[.12em] text-[#0D1B2A] shadow-[0_4px_0_#b88e0b] transition hover:brightness-110 active:translate-y-0.5 active:shadow-none">Sign Contract & Start</button> : <button type="button" disabled={originPathway === 'TRIAL' && !trialComplete} onClick={() => setCreationStep(3)} className="min-h-[46px] px-6 py-2.5 rounded-lg bg-[#235BA8] hover:bg-[#13386C] text-white font-bold text-sm disabled:opacity-40">CONTINUE TO INTERNATIONAL →</button>}
            </div>
          </div>
        </div>
        {mode === 'PLAYER' && creationStep === 3 && <section className="fd-player-international-step rounded-xl border border-[#b9d2ee] bg-white/90 p-5 text-[#13386C]">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-black tracking-[.2em] text-[#235BA8]">STEP 03 · NATIONAL TEAM ROADMAP</div><h2 className="mt-1 text-xl font-black">Your international career</h2><p className="mt-1 text-sm text-[#526782]">Your nationality determines the national-team pathway and tournament calendar.</p></div><span className="rounded-lg bg-[#e5effb] px-3 py-2 text-xs font-bold">{selectedNation?.confederation ?? 'INTERNATIONAL'}</span></div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#d7e4f3] bg-white p-3"><small className="text-[10px] font-bold text-[#647b98]">U-21 SELECTION TARGET</small><div className="mt-1 text-3xl font-black">{selectedNation?.u21OvrRequired ?? 66} OVR</div><p className="mt-1 text-[11px] text-[#647b98]">Indicative game threshold for youth call-ups</p></div>
            <div className="rounded-lg border border-[#d7e4f3] bg-white p-3"><small className="text-[10px] font-bold text-[#647b98]">SENIOR SELECTION TARGET</small><div className="mt-1 text-3xl font-black">{selectedNation?.seniorOvrRequired ?? 76} OVR</div><p className="mt-1 text-[11px] text-[#647b98]">Indicative game threshold for senior selection</p></div>
            <div className="rounded-lg border border-[#d7e4f3] bg-white p-3"><small className="text-[10px] font-bold text-[#647b98]">FIRST TOURNAMENT WINDOW</small><div className="mt-1 text-2xl font-black">WEEK 15</div><p className="mt-1 text-[11px] text-[#647b98]">Season 1 international knockout window</p></div>
          </div>
          <div className="mt-4 rounded-lg border border-[#d7e4f3] bg-[#f5f9ff] p-3"><b className="text-sm">National pathway · {selectedNation?.name ?? nationality}</b><p className="mt-1 text-xs text-[#526782]">{selectedNation?.confederation === 'CAF' ? 'Africa Cup of Nations' : selectedNation?.confederation === 'UEFA' ? 'UEFA European Championship' : selectedNation?.confederation === 'CONMEBOL' ? 'Copa América' : selectedNation?.confederation === 'CONCACAF' ? 'CONCACAF Gold Cup' : selectedNation?.confederation === 'AFC' ? 'AFC Asian Cup' : 'OFC Nations Cup'} · Confederation tournament cycle with a global World Cup every fourth season. Call-ups depend on your overall rating, form and national-team eligibility.</p></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setCreationStep(2)} className="min-h-[44px] rounded-lg border border-[#b9cde4] bg-white px-4 text-sm font-bold text-[#235BA8]">← BACK TO ORIGIN</button><button type="submit" className="min-h-[46px] rounded-lg bg-[#13386C] px-6 text-sm font-black text-white">CREATE PLAYER & START CAREER</button></div>
        </section>}
      </form>
      {showClubPresentation && <ClubPresentationModal club={presentationClub} onClose={() => setShowClubPresentation(false)} />}
    </div>
  );
};
