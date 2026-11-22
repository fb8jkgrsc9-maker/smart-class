import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCheck, Download } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { getTodayISO } from '../data/initialData';
import { t } from '../i18n/translations';
import { AttendanceStatus } from '../types/classroom';
import { exportClassroomExcel, getStudentAttendanceStats } from '../utils/helpers';

const STATUS_OPTIONS: { value: AttendanceStatus; labelKey: string; activeClass: string }[] = [
  {
    value: 'present',
    labelKey: 'present',
    activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  {
    value: 'late',
    labelKey: 'late',
    activeClass: 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    value: 'excused',
    labelKey: 'excused',
    activeClass: 'border-sky-600 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  },
  {
    value: 'absent',
    labelKey: 'absent',
    activeClass: 'border-red-600 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  },
];

export const AttendanceView: React.FC = () => {
  const { state, isAdmin, language, setAttendanceForDate, markAllPresentForDate } = useClassroom();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [tab, setTab] = useState<'daily' | 'individual' | 'history'>('daily');

  const activeStudents = state.students.filter((s) => s.active);
  const dayRecord = state.attendanceHistory.find((a) => a.date === selectedDate);

  const daySummary = useMemo(() => {
    const counts = { present: 0, late: 0, excused: 0, absent: 0 };
    activeStudents.forEach((s) => {
      const st = dayRecord?.records[s.id] || 'present';
      counts[st]++;
    });
    return counts;
  }, [activeStudents, dayRecord]);

  const weeklyStats = useMemo(() => {
    const last7 = state.attendanceHistory.slice(-7);
    let totalChecks = 0;
    let presentPlusLate = 0;
    last7.forEach((d) => {
      Object.values(d.records).forEach((status) => {
        totalChecks++;
        if (status === 'present' || status === 'late') presentPlusLate++;
      });
    });
    return {
      daysLogged: last7.length,
      rate: totalChecks === 0 ? 100 : Math.round((presentPlusLate / totalChecks) * 100),
    };
  }, [state.attendanceHistory]);

  const monthlyStats = useMemo(() => {
    const monthPrefix = selectedDate.slice(0, 7);
    const monthDays = state.attendanceHistory.filter((d) => d.date.startsWith(monthPrefix));
    let totalChecks = 0;
    let presentPlusLate = 0;
    monthDays.forEach((d) => {
      Object.values(d.records).forEach((status) => {
        totalChecks++;
        if (status === 'present' || status === 'late') presentPlusLate++;
      });
    });
    return {
      daysLogged: monthDays.length,
      rate: totalChecks === 0 ? 100 : Math.round((presentPlusLate / totalChecks) * 100),
    };
  }, [state.attendanceHistory, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navAttendance')} · 考勤管理
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Official attendance records can only be modified by the Class Monitor or Classroom Teacher.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportClassroomExcel(state)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            {t(language, 'exportExcel')}
          </button>
          {isAdmin && tab === 'daily' && (
            <button
              type="button"
              onClick={() => markAllPresentForDate(selectedDate)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Present
            </button>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Selected Day ({selectedDate})</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {daySummary.present} / {activeStudents.length}
          </div>
          <div className="text-xs text-slate-500">Present</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Late / Excused / Absent</div>
          <div className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
            {daySummary.late} · {daySummary.excused} · {daySummary.absent}
          </div>
          <div className="text-xs text-slate-500">Daily breakdown</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Weekly Attendance</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {weeklyStats.rate}%
          </div>
          <div className="text-xs text-slate-500 tabular-nums">{weeklyStats.daysLogged} recorded sessions</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Monthly Attendance</div>
          <div className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {monthlyStats.rate}%
          </div>
          <div className="text-xs text-slate-500 tabular-nums">{monthlyStats.daysLogged} days this month</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['daily', 'individual', 'history'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                tab === k
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {k === 'daily' ? 'Daily Sheet' : k === 'individual' ? 'Student Percentages' : 'History Log'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono-tabular text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {tab === 'daily' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeStudents.map((student) => {
              const currentStatus: AttendanceStatus = dayRecord?.records[student.id] || 'present';
              return (
                <div
                  key={student.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      <span className="mr-2 font-mono-tabular text-xs text-slate-400">
                        {String(student.orderIndex).padStart(2, '0')}
                      </span>
                      {student.displayName}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {STATUS_OPTIONS.map((opt) => {
                      const active = currentStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!isAdmin}
                          onClick={() => setAttendanceForDate(selectedDate, student.id, opt.value)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                            active
                              ? opt.activeClass
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400'
                          } ${!isAdmin ? 'cursor-default opacity-80' : ''}`}
                        >
                          {t(language, opt.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'individual' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-right">Present</th>
                  <th className="px-4 py-3 text-right">Late</th>
                  <th className="px-4 py-3 text-right">Excused</th>
                  <th className="px-4 py-3 text-right">Absent</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeStudents.map((s) => {
                  const st = getStudentAttendanceStats(s.id, state.attendanceHistory);
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-2.5 font-mono-tabular text-xs text-slate-500">
                        {String(s.orderIndex).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                        {s.displayName}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular text-xs">{st.present}</td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular text-xs">{st.late}</td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular text-xs">{st.excused}</td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular text-xs">{st.absent}</td>
                      <td className="px-4 py-2.5 text-right font-mono-tabular text-xs font-semibold text-slate-900 dark:text-white">
                        {st.rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {[...state.attendanceHistory]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((rec) => {
              const vals = Object.values(rec.records);
              const p = vals.filter((v) => v === 'present').length;
              const l = vals.filter((v) => v === 'late').length;
              const e = vals.filter((v) => v === 'excused').length;
              const ab = vals.filter((v) => v === 'absent').length;
              return (
                <div
                  key={rec.date}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="font-mono-tabular text-sm font-semibold text-slate-900 dark:text-white">
                      {rec.date}
                    </div>
                    <div className="text-xs text-slate-500">
                      Updated by {rec.updatedBy} · {new Date(rec.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 font-mono-tabular text-xs">
                    <span className="text-emerald-700 dark:text-emerald-400">Present: {p}</span>
                    <span className="text-amber-700 dark:text-amber-400">Late: {l}</span>
                    <span className="text-sky-700 dark:text-sky-400">Excused: {e}</span>
                    <span className="text-red-700 dark:text-red-400">Absent: {ab}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(rec.date);
                        setTab('daily');
                      }}
                      className="rounded-md border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
