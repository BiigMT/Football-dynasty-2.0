import React, { useState } from 'react';
import { CareerSave } from '../types/football';
import { sortStandings } from '../engine/careerEngine';
import { ClubBadge, CountryFlag } from './ClubBadge';

interface CompetitionsViewProps {
  save: CareerSave;
}

export const CompetitionsView: React.FC<CompetitionsViewProps> = ({ save }) => {
  const userClub = save.clubs[save.userClubId];
  const [tab, setTab] = useState<'LEAGUE' | 'CUPS' | 'INTERNATIONAL'>('LEAGUE');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(userClub?.leagueId ?? 'eng_prem');

  const league = save.leagues[selectedLeagueId] ?? Object.values(save.leagues)[0];
  const standings = league ? sortStandings(league.standings) : [];
  const leagueScorers = Object.values(save.players)
    .filter((p) => save.clubs[p.clubId]?.leagueId === league?.id)
    .sort((a, b) => b.seasonStats.goals - a.seasonStats.goals || b.seasonStats.assists - a.seasonStats.assists)
    .slice(0, 8);

  const rankedNations = Object.values(save.nationalTeams).sort((a, b) => a.worldRank - b.worldRank);

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#131A22] border border-white/10">
          {[
            { id: 'LEAGUE', label: 'World Leagues' },
            { id: 'CUPS', label: 'Cups & Continental' },
            { id: 'INTERNATIONAL', label: 'International & Rankings' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`min-h-[40px] px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                tab === item.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'LEAGUE' && (
          <select
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value)}
            className="min-h-[40px] px-3 rounded-lg bg-[#131A22] border border-white/15 text-xs text-white"
          >
            {Object.values(save.leagues).map((lg) => (
              <option key={lg.id} value={lg.id}>
                {lg.name} ({lg.country})
              </option>
            ))}
          </select>
        )}
      </div>

      {tab === 'LEAGUE' && league && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Standings Table */}
          <div className="lg:col-span-8 rounded-xl bg-[#131A22] border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{league.name}</h3>
              <span className="text-xs text-slate-400">{league.country} · Season {save.season}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0E141B] text-slate-400 font-mono-num">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Club</th>
                    <th className="py-2.5 px-2 text-right">P</th>
                    <th className="py-2.5 px-2 text-right">W</th>
                    <th className="py-2.5 px-2 text-right">D</th>
                    <th className="py-2.5 px-2 text-right">L</th>
                    <th className="py-2.5 px-2 text-right">GD</th>
                    <th className="py-2.5 px-3 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num">
                  {standings.map((row, idx) => {
                    const club = save.clubs[row.clubId];
                    if (!club) return null;
                    const isUser = club.id === save.userClubId;
                    const gd = row.goalsFor - row.goalsAgainst;
                    return (
                      <tr key={club.id} className={isUser ? 'bg-cyan-500/10' : 'hover:bg-white/[0.02]'}>
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-2.5">
                            <ClubBadge
                              shortName={club.shortName}
                              primaryColor={club.primaryColor}
                              secondaryColor={club.secondaryColor}
                              country={club.country}
                              size={24}
                            />
                            <span className={`font-medium ${isUser ? 'text-cyan-300 font-semibold' : 'text-white'}`}>
                              {club.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{row.played}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{row.won}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{row.drawn}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{row.lost}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{gd > 0 ? `+${gd}` : gd}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Scorers */}
          <div className="lg:col-span-4 rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Golden Boot Race</h3>
            <div className="flex flex-col gap-2">
              {leagueScorers.map((p, idx) => {
                const c = save.clubs[p.clubId];
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      p.isUserPlayer ? 'bg-amber-500/15 border border-amber-400/40' : 'bg-[#0E141B]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        {idx + 1}. {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c?.shortName} · {p.position} · {p.seasonStats.assists} ast
                      </div>
                    </div>
                    <span className="font-mono-num font-bold text-cyan-400 text-sm">
                      {p.seasonStats.goals} G
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'CUPS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Domestic Cup */}
          <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Domestic National Cup</h3>
            <div className="flex flex-col gap-2">
              {save.cupFixtures.map((f) => {
                const h = save.clubs[f.homeClubId];
                const a = save.clubs[f.awayClubId];
                return (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0E141B] text-xs">
                    <span className="text-slate-400 font-mono-num">R{f.round} · W{f.week}</span>
                    <span className="font-medium text-white">
                      {h?.shortName} {f.played ? `${f.homeGoals} - ${f.awayGoals}` : 'vs'} {a?.shortName}
                    </span>
                    <span className="text-slate-400">
                      {f.played ? `Adv: ${save.clubs[f.winnerId ?? '']?.shortName ?? '-'}` : 'Upcoming'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continental Champions Cup */}
          <div className="rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Dynasty Champions Cup</h3>
            <div className="flex flex-col gap-2">
              {save.continentalFixtures.map((f) => {
                const h = save.clubs[f.homeClubId];
                const a = save.clubs[f.awayClubId];
                return (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0E141B] text-xs">
                    <span className="text-slate-400 font-mono-num">R{f.round} · W{f.week}</span>
                    <span className="font-medium text-white">
                      {h?.name} {f.played ? `${f.homeGoals} - ${f.awayGoals}` : 'vs'} {a?.name}
                    </span>
                    <span className="text-cyan-400 font-mono-num">
                      {f.played ? save.clubs[f.winnerId ?? '']?.shortName : 'Scheduled'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'INTERNATIONAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active International Tournament */}
          <div className="lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-lg font-bold text-white">
                {save.internationalTournament?.name ?? 'International Window'}
              </h3>
              <span className="text-xs text-amber-400 font-mono-num">
                Season {save.season}
              </span>
            </div>
            {save.internationalTournament?.championTeamId && (
              <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-400/40 text-xs text-amber-200 font-semibold">
                Champions: {save.nationalTeams[save.internationalTournament.championTeamId]?.name}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {save.internationalTournament?.fixtures.map((f) => {
                const h = save.nationalTeams[f.homeClubId];
                const a = save.nationalTeams[f.awayClubId];
                return (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0E141B] text-xs">
                    <span className="text-slate-400 font-mono-num">R{f.round} · W{f.week}</span>
                    <span className="font-medium text-white">
                      {h?.name} {f.played ? `${f.homeGoals} - ${f.awayGoals}` : 'vs'} {a?.name}
                    </span>
                    <span className="text-slate-400">
                      {f.played ? save.nationalTeams[f.winnerId ?? '']?.code : 'Upcoming'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* World Rankings */}
          <div className="lg:col-span-6 rounded-xl bg-[#131A22] border border-white/10 p-4 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">World National Rankings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rankedNations.map((nt) => (
                <div key={nt.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0E141B] text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-num text-slate-500 w-5">#{nt.worldRank}</span>
                    <ClubBadge
                      shortName={nt.code}
                      primaryColor={nt.primaryColor}
                      secondaryColor={nt.secondaryColor}
                      country={nt.name}
                      size={24}
                    />
                    <span className="font-medium text-white">{nt.name}</span>
                  </div>
                  <span className="font-mono-num text-slate-400">{nt.rankingPoints}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
