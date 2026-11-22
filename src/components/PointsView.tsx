import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Edit3, Plus, ShieldCheck, Star, Trophy } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { BADGE_DEFINITIONS, COMPETITION_CATEGORIES } from '../data/initialData';
import { t } from '../i18n/translations';
import { CompetitionCategory } from '../types/classroom';
import { getTeamTotalScore } from '../utils/helpers';

export const PointsView: React.FC = () => {
  const {
    state,
    isAdmin,
    language,
    awardPoints,
    updatePointPreset,
    addPointPreset,
    setStudentOfTheWeek,
  } = useClassroom();

  const [tab, setTab] = useState<'honor' | 'award' | 'history' | 'presets'>('honor');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const [selectedStudentId, setSelectedStudentId] = useState(state.students[0]?.id || '');
  const [selectedPresetId, setSelectedPresetId] = useState(state.pointPresets[0]?.id || 'custom');
  const [customPoints, setCustomPoints] = useState(2);
  const [customCategory, setCustomCategory] = useState<CompetitionCategory>('Chinese speaking');
  const [reason, setReason] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [feedback, setFeedback] = useState('');

  const [sotwStudentId, setSotwStudentId] = useState(state.settings.studentOfTheWeekId);
  const [sotwReason, setSotwReason] = useState(state.settings.studentOfTheWeekReason);

  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetPoints, setNewPresetPoints] = useState(2);
  const [newPresetCat, setNewPresetCat] = useState<CompetitionCategory>('Participation');

  // Ethical leaderboard: show Top 6 Honor Roll (never publicly shame lower-scoring students)
  const honorRoll = useMemo(() => {
    const daysWindow = period === 'weekly' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysWindow);

    const periodScores: Record<string, number> = {};
    state.students.forEach((s) => (periodScores[s.id] = 0));
    state.pointTransactions.forEach((tx) => {
      if (tx.studentId && new Date(tx.createdAt) >= cutoff) {
        periodScores[tx.studentId] = (periodScores[tx.studentId] || 0) + tx.points;
      }
    });

    return [...state.students]
      .filter((s) => s.active)
      .map((s) => ({
        ...s,
        periodPoints: periodScores[s.id] || 0,
      }))
      .sort((a, b) => b.points + b.periodPoints - (a.points + a.periodPoints))
      .slice(0, 6);
  }, [state.students, state.pointTransactions, period]);

  const rankedTeams = useMemo(
    () =>
      [...state.teams]
        .map((tm) => ({ ...tm, total: getTeamTotalScore(tm, state.students) }))
        .sort((a, b) => b.total - a.total),
    [state.teams, state.students]
  );

  const handleAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedStudentId || !reason.trim()) return;
    const preset = state.pointPresets.find((p) => p.id === selectedPresetId);
    const pts = preset ? preset.points : customPoints;
    const cat = preset ? preset.category : customCategory;

    awardPoints({
      studentId: selectedStudentId,
      points: pts,
      reason: reason.trim(),
      category: cat,
      badgeId: selectedBadge || undefined,
    });
    setReason('');
    setSelectedBadge('');
    setFeedback('Points approved and recorded.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSotwSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setStudentOfTheWeek(sotwStudentId, sotwReason);
    setFeedback('Student of the Week updated.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const sotwStudent = state.students.find((s) => s.id === state.settings.studentOfTheWeekId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navPoints')} · 积分系统
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Positive recognition with administrative approval, recorded reasons, badges, and team impact.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['honor', 'award', 'history', 'presets'] as const).map((k) => {
            if ((k === 'award' || k === 'presets') && !isAdmin) return null;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  tab === k
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                {k === 'honor'
                  ? 'Honor Roll & Badges'
                  : k === 'award'
                    ? 'Award Points'
                    : k === 'history'
                      ? 'Points Ledger'
                      : 'Reward Rules'}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          {feedback}
        </div>
      )}

      {tab === 'honor' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Top Performers Honor Roll */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Honor Roll Leaders
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Celebrating top contributors without publicly ranking lower scores.
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setPeriod('weekly')}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    period === 'weekly'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('monthly')}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    period === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {honorRoll.map((st, idx) => {
                const tm = state.teams.find((x) => x.id === st.teamId);
                return (
                  <div key={st.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F2342] font-mono-tabular text-xs font-bold text-[#E8C872]">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {st.displayName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {tm?.name} · {st.badges.length} badges
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-tabular text-sm font-bold text-slate-900 dark:text-white">
                        {st.points} pts
                      </div>
                      <div className="font-mono-tabular text-xs text-emerald-700 dark:text-emerald-400">
                        +{st.periodPoints} this {period === 'weekly' ? 'week' : 'month'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Student of the Week & Team Standings & Badges */}
          <div className="space-y-6 lg:col-span-5">
            <section className="rounded-xl border border-slate-200 bg-[#0F2342] p-6 text-white dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E8C872]">
                <Star className="h-4 w-4" />
                {t(language, 'studentOfTheWeek')}
              </div>
              <div className="mt-3 font-display text-2xl font-bold">
                {sotwStudent?.displayName || 'Select Student'}
              </div>
              <p className="mt-2 text-sm text-slate-200">
                {state.settings.studentOfTheWeekReason}
              </p>

              {isAdmin && (
                <form onSubmit={handleSotwSave} className="mt-4 space-y-2 border-t border-white/15 pt-4">
                  <select
                    value={sotwStudentId}
                    onChange={(e) => setSotwStudentId(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-[#16325C] px-3 py-2 text-xs text-white"
                  >
                    {state.students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={sotwReason}
                    onChange={(e) => setSotwReason(e.target.value)}
                    placeholder="Reason for Student of the Week"
                    className="w-full rounded-lg border border-white/20 bg-[#16325C] px-3 py-2 text-xs text-white placeholder:text-slate-300"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#C9972C] px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-[#d8a73d]"
                  >
                    Update Spotlight
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Trophy className="h-4 w-4 text-[#C9972C]" />
                Team Rankings
              </div>
              <div className="mt-3 space-y-2">
                {rankedTeams.map((tm, idx) => (
                  <div key={tm.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      #{idx + 1} {tm.name}
                    </span>
                    <span className="font-mono-tabular font-bold text-slate-900 dark:text-white">
                      {tm.total} pts
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Award className="h-4 w-4 text-[#C9972C]" />
                Achievement Badges
              </div>
              <div className="mt-3 space-y-2.5">
                {BADGE_DEFINITIONS.map((b) => {
                  const holders = state.students.filter((s) => s.badges.includes(b.id)).length;
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs last:border-0 last:pb-0 dark:border-slate-800"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {b.name} · {b.nameZh}
                        </div>
                        <div className="text-slate-500">{b.description}</div>
                      </div>
                      <span className="font-mono-tabular text-slate-600 dark:text-slate-300">
                        {holders} earned
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'award' && isAdmin && (
        <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <ShieldCheck className="h-5 w-5 text-[#C9972C]" />
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Approve & Record Individual Points
            </h2>
          </div>

          <form onSubmit={handleAwardSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {state.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {String(s.orderIndex).padStart(2, '0')} · {s.displayName} ({s.points} pts)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Reward Preset
              </label>
              <select
                value={selectedPresetId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPresetId(val);
                  const found = state.pointPresets.find((p) => p.id === val);
                  if (found && !reason) setReason(found.label);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {state.pointPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.labelZh}) — +{p.points} pts
                  </option>
                ))}
                <option value="custom">Custom Points & Category</option>
              </select>
            </div>

            {selectedPresetId === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Points
                  </label>
                  <input
                    type="number"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as CompetitionCategory)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {COMPETITION_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Optional Achievement Badge
              </label>
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">No additional badge</option>
                {BADGE_DEFINITIONS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.nameZh})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Recorded Reason (Mandatory)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State exact academic or classroom reason..."
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0F2342] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
            >
              Approve & Award Points
            </button>
          </form>
        </section>
      )}

      {tab === 'history' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Approved By</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.pointTransactions.map((tx) => {
                  const st = state.students.find((s) => s.id === tx.studentId);
                  const tm = state.teams.find((t) => t.id === tx.teamId);
                  return (
                    <tr key={tx.id}>
                      <td className="px-4 py-3 font-mono-tabular text-xs text-slate-500">
                        {tx.createdAt.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {st ? st.displayName : tm?.name || 'Classroom'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        {tx.category}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
                        {tx.reason}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{tx.awardedByName}</td>
                      <td className="px-4 py-3 text-right font-mono-tabular text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {tx.points >= 0 ? `+${tx.points}` : tx.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'presets' && isAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Customize Reward Point Values
            </h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {state.pointPresets.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {p.label} · {p.labelZh}
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.labelAr} · {p.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={p.points}
                      onChange={(e) =>
                        updatePointPreset(p.id, { points: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-16 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-center font-mono-tabular text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Add Custom Reward Rule
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPresetLabel.trim()) return;
                addPointPreset({
                  label: newPresetLabel.trim(),
                  labelZh: newPresetLabel.trim(),
                  labelAr: newPresetLabel.trim(),
                  points: newPresetPoints,
                  category: newPresetCat,
                });
                setNewPresetLabel('');
              }}
              className="mt-4 space-y-3"
            >
              <input
                type="text"
                value={newPresetLabel}
                onChange={(e) => setNewPresetLabel(e.target.value)}
                placeholder="Reward title"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newPresetPoints}
                  onChange={(e) => setNewPresetPoints(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <select
                  value={newPresetCat}
                  onChange={(e) => setNewPresetCat(e.target.value as CompetitionCategory)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {COMPETITION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Add Preset
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
