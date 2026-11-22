import React, { useState } from 'react';
import { Award, Edit3, Shuffle, Users, X } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useClassroom } from '../context/ClassroomContext';
import { COMPETITION_CATEGORIES } from '../data/initialData';
import { t } from '../i18n/translations';
import { CompetitionCategory, Team } from '../types/classroom';
import { getTeamTotalScore } from '../utils/helpers';

export const TeamsView: React.FC = () => {
  const {
    state,
    isAdmin,
    language,
    randomizeBalancedTeams,
    assignStudentToTeam,
    updateTeam,
    awardTeamCategoryPoints,
  } = useClassroom();

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamDraft, setTeamDraft] = useState({ name: '', chineseName: '', motto: '' });
  const [scoreModalTeam, setScoreModalTeam] = useState<Team | null>(null);
  const [scoreCategory, setScoreCategory] = useState<CompetitionCategory>('Chinese speaking');
  const [scoreAmount, setScoreAmount] = useState(5);
  const [scoreReason, setScoreReason] = useState('');

  const rankedTeams = [...state.teams]
    .map((team) => ({
      ...team,
      totalScore: getTeamTotalScore(team, state.students),
      members: state.students.filter((s) => s.active && s.teamId === team.id),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const chartData = COMPETITION_CATEGORIES.map((cat) => {
    const row: Record<string, string | number> = {
      category: cat.replace('Classroom ', ''),
    };
    state.teams.forEach((tm) => {
      row[tm.name] = tm.categoryScores[cat] || 0;
    });
    return row;
  });

  const handleSaveTeamEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !teamDraft.name.trim()) return;
    updateTeam(editingTeam.id, {
      name: teamDraft.name.trim(),
      chineseName: teamDraft.chineseName.trim(),
      motto: teamDraft.motto.trim(),
    });
    setEditingTeam(null);
  };

  const handleAwardTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreModalTeam || !scoreReason.trim()) return;
    awardTeamCategoryPoints(scoreModalTeam.id, scoreCategory, scoreAmount, scoreReason);
    setScoreReason('');
    setScoreModalTeam(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navTeams')} · 小组比赛
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Three balanced teams (Team 1: 6, Team 2: 6, Team 3: 5) competing across speaking, vocabulary, grammar, cleanliness, and cooperation.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Randomly redistribute all students evenly into 3 balanced teams?')) {
                randomizeBalancedTeams();
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
          >
            <Shuffle className="h-4 w-4" />
            Balanced Random Shuffle
          </button>
        )}
      </div>

      {/* Live Team Scoreboard Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {rankedTeams.map((team, rank) => (
          <section
            key={team.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="font-mono-tabular text-xs font-semibold text-[#C9972C]">
                    Rank #{rank + 1} · {team.members.length} Members
                  </div>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                    {team.name}
                  </h2>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {team.chineseName} · {team.motto}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold tabular-nums text-[#0F2342] dark:text-[#E8C872]">
                    {team.totalScore}
                  </div>
                  <div className="text-xs text-slate-500">Total Points</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  Roster
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                        {member.displayName}
                      </span>
                      {isAdmin ? (
                        <select
                          value={member.teamId}
                          onChange={(e) => assignStudentToTeam(member.id, e.target.value)}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                        >
                          {state.teams.map((tm) => (
                            <option key={tm.id} value={tm.id}>
                              {tm.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-mono-tabular text-xs text-slate-500">
                          {member.studentNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeam(team);
                    setTeamDraft({
                      name: team.name,
                      chineseName: team.chineseName,
                      motto: team.motto,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Team
                </button>
                <button
                  type="button"
                  onClick={() => setScoreModalTeam(team)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
                >
                  <Award className="h-3.5 w-3.5" />
                  Award Team
                </button>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Category Comparison Chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Competition Category Breakdown
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Comparison across speaking, vocabulary, grammar, attendance, cleanliness, cooperation, and participation.
        </p>
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {state.teams.map((tm) => (
                <Bar key={tm.id} dataKey={tm.name} fill={tm.accentColor} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Edit Team Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTeamEdit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamDraft.name}
                  onChange={(e) => setTeamDraft({ ...teamDraft, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Chinese Name
                </label>
                <input
                  type="text"
                  value={teamDraft.chineseName}
                  onChange={(e) => setTeamDraft({ ...teamDraft, chineseName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Team Motto
                </label>
                <input
                  type="text"
                  value={teamDraft.motto}
                  onChange={(e) => setTeamDraft({ ...teamDraft, motto: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Team Modal */}
      {scoreModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Award Points: {scoreModalTeam.name}
              </h3>
              <button
                type="button"
                onClick={() => setScoreModalTeam(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAwardTeam} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Competition Category
                </label>
                <select
                  value={scoreCategory}
                  onChange={(e) => setScoreCategory(e.target.value as CompetitionCategory)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {COMPETITION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Points
                </label>
                <input
                  type="number"
                  value={scoreAmount}
                  onChange={(e) => setScoreAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Recorded Reason (Required)
                </label>
                <input
                  type="text"
                  value={scoreReason}
                  onChange={(e) => setScoreReason(e.target.value)}
                  placeholder="e.g., Won Friday Chinese speaking relay"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScoreModalTeam(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                >
                  Approve & Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
