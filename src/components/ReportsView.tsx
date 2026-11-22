import React, { useMemo } from 'react';
import { FileSpreadsheet, FileText, Printer } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useClassroom } from '../context/ClassroomContext';
import { COMPETITION_CATEGORIES } from '../data/initialData';
import { t } from '../i18n/translations';
import {
  exportClassroomExcel,
  exportClassroomPdfSummary,
  getStudentAttendanceStats,
  getTeamTotalScore,
} from '../utils/helpers';

export const ReportsView: React.FC = () => {
  const { state, language } = useClassroom();

  const attendanceTrend = useMemo(() => {
    return [...state.attendanceHistory]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => {
        const vals = Object.values(day.records);
        const total = Math.max(1, vals.length);
        const present = vals.filter((v) => v === 'present' || v === 'late').length;
        return {
          date: day.date.slice(5),
          rate: Math.round((present / total) * 100),
        };
      });
  }, [state.attendanceHistory]);

  const cleaningRates = useMemo(() => {
    return [...state.cleaningSchedules]
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map((w) => {
        const total = Math.max(1, w.assignments.length);
        const done = w.assignments.filter((a) => a.completed).length;
        return {
          week: w.weekStart.slice(5),
          completion: Math.round((done / total) * 100),
        };
      });
  }, [state.cleaningSchedules]);

  const categoryTotals = useMemo(() => {
    return COMPETITION_CATEGORIES.map((cat) => ({
      category: cat.replace('Classroom ', ''),
      points: state.teams.reduce((sum, tm) => sum + (tm.categoryScores[cat] || 0), 0),
    }));
  }, [state.teams]);

  const overallAttendance = useMemo(() => {
    const rates = state.students.map((s) => getStudentAttendanceStats(s.id, state.attendanceHistory).rate);
    return Math.round(rates.reduce((a, b) => a + b, 0) / Math.max(1, rates.length));
  }, [state.students, state.attendanceHistory]);

  const overallCleaning = useMemo(() => {
    const all = state.cleaningSchedules.flatMap((w) => w.assignments);
    if (all.length === 0) return 100;
    return Math.round((all.filter((a) => a.completed).length / all.length) * 100);
  }, [state.cleaningSchedules]);

  const totalPointsAwarded = useMemo(
    () => state.pointTransactions.reduce((sum, tx) => sum + tx.points, 0),
    [state.pointTransactions]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navReports')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Attendance trends, cleaning completion, team rankings, and exportable Excel & PDF classroom reports.
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportClassroomExcel(state)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            {t(language, 'exportExcel')}
          </button>
          <button
            type="button"
            onClick={() => exportClassroomPdfSummary(state)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap"
          >
            <FileText className="h-4 w-4 text-[#C9972C]" />
            Download PDF Summary
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            {t(language, 'printPdf')}
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Average Attendance Rate</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {overallAttendance}%
          </div>
          <div className="text-xs text-slate-500">{state.attendanceHistory.length} days tracked</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Cleaning Completion Rate</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {overallCleaning}%
          </div>
          <div className="text-xs text-slate-500">{state.cleaningSchedules.length} weekly rotations</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Approved Recognition Points</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {totalPointsAwarded}
          </div>
          <div className="text-xs text-slate-500">{state.pointTransactions.length} logged awards</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Attendance Performance Trend (%)
          </h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#0F2342"
                  fill="#0F2342"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Weekly Cleaning Completion (%)
          </h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cleaningRates}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="completion" fill="#C9972C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Category Distribution + Team Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Classroom Participation & Category Progress
        </h2>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryTotals}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="points" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Team Summary Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Team Performance Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-right">Students</th>
                <th className="px-4 py-3 text-right">Bonus</th>
                <th className="px-4 py-3 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.teams.map((tm) => (
                <tr key={tm.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {tm.name} · {tm.chineseName}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-tabular text-xs">
                    {state.students.filter((s) => s.active && s.teamId === tm.id).length}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-tabular text-xs">{tm.bonusPoints}</td>
                  <td className="px-4 py-3 text-right font-mono-tabular text-xs font-bold text-slate-900 dark:text-white">
                    {getTeamTotalScore(tm, state.students)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
