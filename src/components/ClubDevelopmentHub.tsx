import React, { useMemo, useState } from 'react';
import { CareerSave, Player } from '../types/football';
import { promoteYouthProspect } from '../engine/careerEngine';
import { calculateMarketValue, calculateOverall } from '../engine/database';
import { PlayerAttributes } from '../types/football';
import { ManagerPressConference } from './ManagerPressConference';

interface Props {
  save: CareerSave;
  onUpdateSave: (next: CareerSave) => void;
}

const clamp = (n: number) => Math.max(1, Math.min(100, n));

export const ClubDevelopmentHub: React.FC<Props> = ({ save, onUpdateSave }) => {
  const [scoutId, setScoutId] = useState('');
  const [conferenceOpen, setConferenceOpen] = useState(false);
  const club = save.clubs[save.userClubId];
  const manager = save.manager!;
  const squad = useMemo(() => Object.values(save.players)
    .filter((p) => p.clubId === club.id)
    .sort((a, b) => b.overall - a.overall), [save.players, club.id]);
  const youth = squad.filter((p) => p.isYouth || p.age <= 20);
  const scoutTargets = useMemo(() => Object.values(save.players)
    .filter((p) => p.clubId !== club.id && p.clubId !== 'free_agent' && p.age <= 25)
    .sort((a, b) => (b.potential - b.overall) - (a.potential - a.overall))
    .slice(0, 18), [save.players, club.id]);
  const reports = save.scoutingReports ?? [];
  const relationships = save.playerRelationships ?? {};
  const recruitmentCost = 250000;
  const canRecruit = club.finances.cashBalance >= recruitmentCost;
  const alreadyScouted = (id: string) => reports.some((r) => r.playerId === id && r.season === save.season && r.week === save.currentWeek);

  const trainYouth = (player: Player) => {
    if (!(player.isYouth || player.age <= 20) || player.academyTrainingWeek === save.currentWeek) return;
    const focus: keyof PlayerAttributes = player.position === 'GK' ? 'goalkeeping'
      : player.position === 'ST' ? 'finishing'
      : ['LW', 'RW'].includes(player.position) ? 'dribbling'
      : ['CB', 'LB', 'RB', 'CDM'].includes(player.position) ? 'tackling'
      : 'passing';
    const attributes = { ...player.attributes };
    attributes[focus] = Math.min(88, attributes[focus] + 1);
    const overall = calculateOverall(player.position, attributes);
    const potential = Math.max(overall, player.potential);
    onUpdateSave({
      ...save,
      players: { ...save.players, [player.id]: {
        ...player, attributes, overall, potential,
        marketValue: calculateMarketValue(overall, player.age, potential),
        academyTrainingWeek: save.currentWeek,
      }},
      news: [{
        id: 'academy_training_' + player.id + '_' + save.season + '_' + save.currentWeek,
        week: save.currentWeek, season: save.season, category: 'ACADEMY' as const,
        headline: player.name + ' completes an academy development session',
        body: player.name + ' improved ' + focus + ' by one point through focused coaching.',
      }, ...save.news].slice(0, 35),
    });
  };

  const recruit = () => {
    if (!canRecruit) return;
    const recruited = promoteYouthProspect(save);
    const nextClub = recruited.clubs[club.id];
    onUpdateSave({
      ...recruited,
      clubs: { ...recruited.clubs, [club.id]: {
        ...nextClub,
        finances: { ...nextClub.finances, cashBalance: nextClub.finances.cashBalance - recruitmentCost },
      }},
      news: [{
        id: 'academy_scout_' + Date.now(), week: save.currentWeek, season: save.season,
        category: 'ACADEMY' as const, headline: club.name + ' welcomes a new academy prospect',
        body: 'The youth recruitment network has identified and signed a promising young player.',
      }, ...recruited.news].slice(0, 35),
    });
  };

  const scout = (player: Player) => {
    if (alreadyScouted(player.id)) return;
    const fee = 50000;
    if (club.finances.cashBalance < fee) return;
    const gap = Math.max(0, player.potential - player.overall);
    const level = gap >= 18 ? 'Exceptional upside' : gap >= 10 ? 'Strong development potential' : gap >= 5 ? 'Room to improve' : 'Near current ceiling';
    // Reports estimate a range; the hidden database potential is not shown as certainty.
    const scoutAccuracy = Math.max(55, Math.min(88, 48 + Math.round(club.reputation * 0.35)));
    const uncertainty = Math.max(3, Math.round((100 - scoutAccuracy) / 4));
    const report = {
      id: 'scout_' + player.id + '_' + save.season + '_' + save.currentWeek,
      playerId: player.id, playerName: player.name, clubName: save.clubs[player.clubId]?.name ?? 'Unknown club',
      position: player.position, age: player.age, overall: player.overall,
      potential: Math.round((Math.max(player.overall, player.potential - uncertainty) + Math.min(95, player.potential + uncertainty)) / 2),
      potentialMin: Math.max(player.overall, player.potential - uncertainty),
      potentialMax: Math.min(95, player.potential + uncertainty),
      confidence: scoutAccuracy >= 80 ? 'High' as const : scoutAccuracy >= 68 ? 'Medium' as const : 'Low' as const,
      assessment: level, season: save.season, week: save.currentWeek,
    };
    onUpdateSave({
      ...save,
      clubs: { ...save.clubs, [club.id]: { ...club, finances: { ...club.finances, cashBalance: club.finances.cashBalance - fee } } },
      players: { ...save.players, [player.id]: { ...player, scouted: true } },
      scoutingReports: [report, ...reports].slice(0, 30),
    });
    setScoutId(player.id);
  };

  const teamTalk = (player: Player, tone: 'SUPPORT' | 'CHALLENGE' | 'MENTOR') => {
    const morale = tone === 'SUPPORT' ? 5 : tone === 'CHALLENGE' ? (player.form >= 70 ? 2 : -2) : 3;
    const chemistry = tone === 'MENTOR' ? 2 : 1;
    const partner = tone === 'MENTOR'
      ? (player.age <= 20
          ? squad.filter(p => p.id !== player.id && p.age >= player.age + 3).sort((a, b) => b.overall - a.overall)[0]
          : squad.filter(p => p.id !== player.id && p.age <= 20 && p.age < player.age).sort((a, b) => a.age - b.age)[0])
      : undefined;
    const pairKey = partner ? [player.id, partner.id].sort().join('__') : '';
    const pairLinks = save.squadChemistryLinks ?? {};
    onUpdateSave({
      ...save,
      players: {
        ...save.players,
        [player.id]: {
          ...player, morale: clamp(player.morale + morale),
          confidence: clamp(player.confidence + (tone === 'SUPPORT' ? 3 : 1)),
        },
        ...(partner ? { [partner.id]: {
          ...partner, morale: clamp(partner.morale + 2), confidence: clamp(partner.confidence + 2),
        }} : {}),
      },
      clubs: { ...save.clubs, [club.id]: { ...club, chemistry: clamp(club.chemistry + chemistry) } },
      playerRelationships: { ...relationships, [player.id]: clamp((relationships[player.id] ?? 50) + 4) },
      squadChemistryLinks: partner ? { ...pairLinks, [pairKey]: clamp((pairLinks[pairKey] ?? 50) + 5) } : pairLinks,
      news: [{
        id: 'dressing_room_' + Date.now(), week: save.currentWeek, season: save.season,
        category: 'BOARD' as const, headline: manager.name + ' holds a one-to-one with ' + player.name,
        body: tone === 'SUPPORT' ? 'The manager offered personal support and confidence.' : tone === 'CHALLENGE' ? 'The manager challenged the player to raise their standards.' : partner ? player.name + ' begins a mentoring partnership with ' + partner.name + '. Both players gained morale and their squad bond improved.' : 'The manager discussed mentoring, but no suitable senior-young player pairing was available.',
      }, ...save.news].slice(0, 35),
    });
  };

  if (conferenceOpen) {
    return <ManagerPressConference
      managerName={manager.name}
      clubName={club.name}
      recentNews={save.news.slice(0, 12)}
      onAnswer={(board, chemistry, reputation, response) => onUpdateSave({
        ...save,
        manager: { ...manager, boardConfidence: clamp(manager.boardConfidence + board), reputation: clamp(manager.reputation + reputation), pressConferenceWeek: save.currentWeek },
        clubs: { ...save.clubs, [club.id]: { ...club, chemistry: clamp(club.chemistry + chemistry) } },
        news: [{ id: 'media_' + Date.now(), week: save.currentWeek, season: save.season, category: 'BOARD' as const, headline: manager.name + ' faces the media', body: response }, ...save.news].slice(0, 35),
      })}
      onContinue={() => setConferenceOpen(false)}
    />;
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-black text-white">Youth Academy & Recruitment</h3><p className="text-xs text-slate-400">Find the next generation and build them into first-team players.</p></div>
          <button type="button" disabled={!canRecruit} onClick={recruit} className="min-h-10 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">Recruit prospect · €250K</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-cyan-300">{youth.length}</div><div className="text-[10px] text-slate-400">Young players</div></div>
          <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-white">{youth.filter(p => p.potential - p.overall >= 10).length}</div><div className="text-[10px] text-slate-400">High-upside prospects</div></div>
          <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-white">€{(club.finances.cashBalance / 1000000).toFixed(2)}M</div><div className="text-[10px] text-slate-400">Club cash</div></div>
          <div className="rounded-lg bg-[#0B0F14] p-3"><div className="text-xl font-black text-white">{club.chemistry}%</div><div className="text-[10px] text-slate-400">Squad chemistry</div></div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {youth.slice(0, 8).map(p => <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#0B0F14] px-3 py-2 text-xs"><div className="min-w-0"><div className="font-bold text-white">{p.name}</div><div className="text-slate-400">{p.position} · Age {p.age}</div></div><div className="shrink-0 text-right"><div className="font-black text-cyan-300">{p.overall} OVR</div><div className="text-slate-500">Potential {p.potential}</div><button disabled={p.academyTrainingWeek === save.currentWeek} onClick={() => trainYouth(p)} className="mt-1 rounded bg-cyan-500/15 px-2 py-1 text-[10px] font-bold text-cyan-200 disabled:text-slate-500">{p.academyTrainingWeek === save.currentWeek ? 'Trained this week' : 'Train prospect'}</button></div></div>)}
          {youth.length === 0 && <p className="text-xs text-slate-500">No academy players yet. Recruit your first prospect.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-white">Dressing-Room Relationships</h3><p className="text-xs text-slate-400">One-to-one conversations influence morale, confidence and team unity.</p></div><span className="text-xs text-cyan-300">Chemistry {club.chemistry}/100</span></div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {squad.slice(0, 8).map(p => <div key={p.id} className="rounded-lg bg-[#0B0F14] p-3"><div className="flex items-center justify-between"><div className="text-xs font-bold text-white">{p.name}</div><div className="text-[10px] text-slate-400">Morale {p.morale} · Bond {relationships[p.id] ?? 50}</div></div><div className="mt-2 grid grid-cols-3 gap-1"><button onClick={() => teamTalk(p, 'SUPPORT')} className="rounded bg-cyan-500/15 px-2 py-2 text-[10px] font-bold text-cyan-200">Support</button><button onClick={() => teamTalk(p, 'CHALLENGE')} className="rounded bg-amber-500/15 px-2 py-2 text-[10px] font-bold text-amber-200">Challenge</button><button onClick={() => teamTalk(p, 'MENTOR')} className="rounded bg-violet-500/15 px-2 py-2 text-[10px] font-bold text-violet-200">Mentor</button></div></div>)}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#131A22] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-white">Worldwide Scouting Network</h3><p className="text-xs text-slate-400">Scout emerging talent and save detailed reports. Each report costs €50K.</p></div><select value={scoutId} onChange={e => setScoutId(e.target.value)} className="min-h-10 max-w-full rounded-lg border border-white/15 bg-[#0B0F14] px-2 text-xs text-white"><option value="">Choose a prospect…</option>{scoutTargets.map(p => <option key={p.id} value={p.id}>{p.name} · {p.position} · {p.age}</option>)}</select></div>
        {scoutId && save.players[scoutId] && <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#0B0F14] p-3"><div className="text-xs"><div className="font-bold text-white">{save.players[scoutId].name}</div><div className="text-slate-400">{save.players[scoutId].position} · {save.players[scoutId].age} years · {save.players[scoutId].overall} OVR</div></div><button disabled={alreadyScouted(scoutId) || club.finances.cashBalance < 50000} onClick={() => scout(save.players[scoutId])} className="min-h-10 rounded-lg bg-cyan-400 px-4 text-xs font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">{alreadyScouted(scoutId) ? 'Report filed' : 'Scout · €50K'}</button></div>}
        <div className="mt-3 flex flex-col gap-2">{reports.slice(0, 5).map(r => <div key={r.id} className="flex items-center justify-between rounded-lg bg-[#0B0F14] px-3 py-2 text-xs"><div><div className="font-bold text-white">{r.playerName} · {r.position}</div><div className="text-slate-400">{r.clubName} · Age {r.age} · S{r.season} W{r.week}</div></div><div className="text-right"><div className="font-black text-cyan-300">{r.overall} OVR · {r.potentialMin ?? r.potential}–{r.potentialMax ?? r.potential} POT</div><div className="text-[10px] text-amber-300">{r.assessment} · {r.confidence ?? 'Legacy'} confidence</div></div></div>)}</div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/25 bg-[#131A22] p-4">
        <div><h3 className="font-black text-white">Media Room</h3><p className="text-xs text-slate-400">Answer journalists, shape expectations and manage the club's public image.</p></div>
        <button type="button" disabled={manager.pressConferenceWeek === save.currentWeek} onClick={() => setConferenceOpen(true)} className="min-h-10 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">{manager.pressConferenceWeek === save.currentWeek ? 'Conference completed this week' : 'Face the journalists'}</button>
      </section>
    </div>
  );
};
