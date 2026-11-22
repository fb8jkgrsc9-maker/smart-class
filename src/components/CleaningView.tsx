import React, { useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, Circle, Edit3, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { getMondayISO } from '../data/initialData';
import { t } from '../i18n/translations';
import { CleaningAssignment } from '../types/classroom';

export const CleaningView: React.FC = () => {
  const {
    state,
    isAdmin,
    language,
    generateWeeklyCleaning,
    toggleCleaningTaskDone,
    updateCleaningAssignmentStudents,
    updateStudent,
  } = useClassroom();

  const sortedSchedules = useMemo(
    () => [...state.cleaningSchedules].sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
    [state.cleaningSchedules]
  );

  const [selectedWeekId, setSelectedWeekId] = useState<string>(sortedSchedules[0]?.id || '');
  const [newWeekDate, setNewWeekDate] = useState(getMondayISO());
  const [editingTask, setEditingTask] = useState<CleaningAssignment | null>(null);
  const [draftStudentIds, setDraftStudentIds] = useState<string[]>([]);
  const [showExclusionsModal, setShowExclusionsModal] = useState(false);

  const activeWeek =
    sortedSchedules.find((w) => w.id === selectedWeekId) || sortedSchedules[0];

  const completedCount = activeWeek
    ? activeWeek.assignments.filter((a) => a.completed).length
    : 0;
  const totalCount = activeWeek ? activeWeek.assignments.length : 7;

  const monthlyPerformance = useMemo(() => {
    const counts: Record<string, { assigned: number; completed: number }> = {};
    state.students.forEach((s) => {
      counts[s.id] = { assigned: 0, completed: 0 };
    });
    const currentMonth = new Date().toISOString().slice(0, 7);
    const relevantWeeks = state.cleaningSchedules.filter((w) =>
      w.weekStart.startsWith(currentMonth)
    );
    const sourceWeeks = relevantWeeks.length > 0 ? relevantWeeks : state.cleaningSchedules;
    sourceWeeks.forEach((w) => {
      w.assignments.forEach((a) => {
        a.studentIds.forEach((sid) => {
          if (!counts[sid]) counts[sid] = { assigned: 0, completed: 0 };
          counts[sid].assigned += 1;
          if (a.completed) counts[sid].completed += 1;
        });
      });
    });
    return counts;
  }, [state.cleaningSchedules, state.students]);

  const openTaskEditor = (assignment: CleaningAssignment) => {
    setEditingTask(assignment);
    setDraftStudentIds(assignment.studentIds);
  };

  const handleToggleStudentDraft = (studentId: string) => {
    setDraftStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const saveTaskStudents = () => {
    if (!activeWeek || !editingTask) return;
    updateCleaningAssignmentStudents(activeWeek.id, editingTask.id, draftStudentIds);
    setEditingTask(null);
  };

  const getStudentName = (id: string) =>
    state.students.find((s) => s.id === id)?.displayName || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navCleaning')} · 值日生
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fair weekly rotation across all 7 classroom duties, avoiding consecutive identical tasks.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExclusionsModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              Exclusions ({state.students.filter((s) => s.excludedFromCleaning).length})
            </button>

            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
              <input
                type="date"
                value={newWeekDate}
                onChange={(e) => setNewWeekDate(e.target.value)}
                className="rounded px-2 py-1 font-mono-tabular text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  generateWeeklyCleaning(newWeekDate);
                  setSelectedWeekId(`week-${newWeekDate}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0F2342] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Generate Fair Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Week Selector & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-[#C9972C]" />
          <span className="text-xs font-medium text-slate-500">Select Week:</span>
          <select
            value={activeWeek?.id || ''}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono-tabular text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {sortedSchedules.map((w) => (
              <option key={w.id} value={w.id}>
                {w.weekLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
            {completedCount} / {totalCount} Tasks Completed
          </span>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7 Cleaning Tasks Grid */}
      {activeWeek && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeWeek.assignments.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleCleaningTaskDone(activeWeek.id, item.id)}
                    className={`mt-0.5 ${isAdmin ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                  <div>
                    <div className="text-xs font-mono-tabular text-slate-400">
                      Duty {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3
                      className={`font-display text-base font-semibold ${
                        item.completed
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {t(language, item.taskKey)}
                    </h3>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => openTaskEditor(item)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="inline h-3 w-3 mr-1" />
                    Assign
                  </button>
                )}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Assigned Students ({item.studentIds.length})
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {item.studentIds.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No students assigned</span>
                  ) : (
                    item.studentIds.map((sid) => <span key={sid}>{getStudentName(sid)}</span>)
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Performance Statistics */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Monthly Cleaning Participation & Fairness Statistics
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Tracks assigned duties and verified completion across recorded weeks.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4 text-right">Assigned Duties</th>
                <th className="py-2 pr-4 text-right">Completed</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.students.map((s) => {
                const stat = monthlyPerformance[s.id] || { assigned: 0, completed: 0 };
                return (
                  <tr key={s.id}>
                    <td className="py-2 pr-4 font-mono-tabular text-xs text-slate-400">
                      {String(s.orderIndex).padStart(2, '0')}
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      {s.displayName}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono-tabular text-xs">{stat.assigned}</td>
                    <td className="py-2 pr-4 text-right font-mono-tabular text-xs">{stat.completed}</td>
                    <td className="py-2 text-right text-xs">
                      {s.excludedFromCleaning ? (
                        <span className="text-amber-600 dark:text-amber-400">Temporarily Excluded</span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400">Active Rotation</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Multi-Student Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Assign Students: {t(language, editingTask.taskKey)}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {state.students.map((st) => (
                <label
                  key={st.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={draftStudentIds.includes(st.id)}
                      onChange={() => handleToggleStudentDraft(st.id)}
                    />
                    <span className="text-slate-900 dark:text-slate-100">{st.displayName}</span>
                  </div>
                  {st.excludedFromCleaning && (
                    <span className="text-xs text-amber-600">Excluded</span>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                {t(language, 'cancel')}
              </button>
              <button
                type="button"
                onClick={saveTaskStudents}
                className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
              >
                {t(language, 'save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exclusions Modal */}
      {showExclusionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Temporary Cleaning Exclusions
              </h3>
              <button
                type="button"
                onClick={() => setShowExclusionsModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Checked students are temporarily skipped when generating new weekly rotations.
            </p>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {state.students.map((st) => (
                <label
                  key={st.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <span className="text-slate-900 dark:text-slate-100">{st.displayName}</span>
                  <input
                    type="checkbox"
                    checked={st.excludedFromCleaning}
                    onChange={(e) =>
                      updateStudent(st.id, { excludedFromCleaning: e.target.checked })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExclusionsModal(false)}
                className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
