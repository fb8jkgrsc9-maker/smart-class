import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, ClipboardList, Plus, Trash2, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { getTodayISO } from '../data/initialData';
import { t } from '../i18n/translations';
import { ActivityCategory, Assignment } from '../types/classroom';

const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'competition', label: 'Weekly Competition' },
  { value: 'cultural', label: 'Cultural Event' },
  { value: 'challenge', label: 'Chinese Language Challenge' },
  { value: 'presentation', label: 'Student Presentation' },
  { value: 'announcement', label: 'Important Announcement' },
  { value: 'meeting', label: 'Classroom Meeting' },
];

export const ActivitiesView: React.FC = () => {
  const {
    state,
    isAdmin,
    role,
    language,
    addAssignment,
    updateAssignmentStatus,
    toggleAssignmentStudentCompletion,
    deleteAssignment,
    addActivity,
    deleteActivity,
  } = useClassroom();

  const [tab, setTab] = useState<'assignments' | 'calendar'>('assignments');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [checklistAssignment, setChecklistAssignment] = useState<Assignment | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');

  const [assignDraft, setAssignDraft] = useState({
    title: '',
    subject: 'Comprehensive Chinese (综合汉语)',
    description: '',
    teacher: state.settings.teacherName,
    deadline: getTodayISO(),
    status: 'pending' as Assignment['status'],
  });

  const [actDraft, setActDraft] = useState({
    title: '',
    category: 'competition' as ActivityCategory,
    date: getTodayISO(),
    time: '14:00',
    location: 'Room 304 · Lanzhou University of Technology',
    description: '',
    isPinnedAnnouncement: false,
  });

  // Calendar grid for current month
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-11

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    return cells;
  }, [calYear, calMonth]);

  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;

  const filteredActivities = useMemo(() => {
    return [...state.activities]
      .filter((a) => (categoryFilter === 'all' ? true : a.category === categoryFilter))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [state.activities, categoryFilter]);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDraft.title.trim()) return;
    addAssignment(assignDraft);
    setAssignDraft({
      title: '',
      subject: 'Comprehensive Chinese (综合汉语)',
      description: '',
      teacher: state.settings.teacherName,
      deadline: getTodayISO(),
      status: 'pending',
    });
    setShowAssignModal(false);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actDraft.title.trim()) return;
    addActivity({
      ...actDraft,
      createdBy: role === 'monitor' ? state.settings.monitorName : state.settings.teacherName,
    });
    setActDraft({
      title: '',
      category: 'competition',
      date: getTodayISO(),
      time: '14:00',
      location: 'Room 304 · Lanzhou University of Technology',
      description: '',
      isPinnedAnnouncement: false,
    });
    setShowActivityModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navActivities')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage homework deadlines, completion tracking, cultural events, competitions, and announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTab('assignments')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === 'assignments'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Assignments ({state.assignments.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Activities Calendar ({state.activities.length})
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                tab === 'assignments' ? setShowAssignModal(true) : setShowActivityModal(true)
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              {tab === 'assignments' ? 'New Assignment' : 'New Event / Notice'}
            </button>
          )}
        </div>
      </div>

      {tab === 'assignments' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {state.assignments.map((a) => {
            const pct = Math.round(
              (a.completedStudentIds.length / Math.max(1, state.students.length)) * 100
            );
            return (
              <div
                key={a.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-[#C9972C]">{a.subject}</div>
                      <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                        {a.title}
                      </h3>
                    </div>

                    {isAdmin ? (
                      <select
                        value={a.status}
                        onChange={(e) =>
                          updateAssignmentStatus(a.id, e.target.value as Assignment['status'])
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">
                        {a.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {a.description}
                  </p>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
                    <span>Teacher: {a.teacher}</span>
                    <span className="font-mono-tabular">
                      Created {a.createdAt} · Due {a.deadline}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#0F2342] dark:bg-[#C9972C]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono-tabular font-semibold text-slate-700 dark:text-slate-200">
                        {a.completedStudentIds.length}/{state.students.length}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setChecklistAssignment(a)}
                          className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                        >
                          Check Submissions
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAssignment(a.id)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Monthly Grid */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear((y) => y - 1);
                  } else {
                    setCalMonth((m) => m - 1);
                  }
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700"
              >
                Prev
              </button>
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {new Date(calYear, calMonth, 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear((y) => y + 1);
                  } else {
                    setCalMonth((m) => m + 1);
                  }
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700"
              >
                Next
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-10" />;
                const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
                const dayEvents = state.activities.filter((a) => a.date === dateStr);
                const isToday = dateStr === getTodayISO();
                return (
                  <div
                    key={dateStr}
                    className={`flex h-10 flex-col items-center justify-center rounded-lg border text-xs font-mono-tabular ${
                      isToday
                        ? 'border-[#C9972C] bg-[#0F2342] font-bold text-white'
                        : dayEvents.length > 0
                          ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'border-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-300'
                    }`}
                    title={dayEvents.map((e) => e.title).join(', ')}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] leading-none font-sans">
                        {dayEvents.length} evt
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Agenda & Announcements List */}
          <section className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  categoryFilter === 'all'
                    ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              {ACTIVITY_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategoryFilter(c.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    categoryFilter === c.value
                      ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold capitalize text-[#C9972C]">
                          {act.category}
                        </span>
                        <span>·</span>
                        <span className="font-mono-tabular">
                          {act.date} {act.time}
                        </span>
                        <span>·</span>
                        <span>{act.location}</span>
                      </div>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                        {act.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                        {act.description}
                      </p>
                      <div className="mt-2 text-xs text-slate-400">Posted by {act.createdBy}</div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => deleteActivity(act.id)}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Submission Checklist Modal */}
      {checklistAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Submissions: {checklistAssignment.title}
              </h3>
              <button
                type="button"
                onClick={() => setChecklistAssignment(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
              {state.students.map((s) => {
                const live =
                  state.assignments.find((x) => x.id === checklistAssignment.id) ||
                  checklistAssignment;
                const done = live.completedStudentIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                  >
                    <span className="text-slate-900 dark:text-slate-100">{s.displayName}</span>
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleAssignmentStudentCompletion(live.id, s.id)}
                    />
                  </label>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setChecklistAssignment(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Create Assignment
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-1 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Assignment title"
                value={assignDraft.title}
                onChange={(e) => setAssignDraft({ ...assignDraft, title: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Subject"
                value={assignDraft.subject}
                onChange={(e) => setAssignDraft({ ...assignDraft, subject: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Teacher name"
                value={assignDraft.teacher}
                onChange={(e) => setAssignDraft({ ...assignDraft, teacher: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div>
                <label className="mb-1 block text-xs font-medium">Deadline</label>
                <input
                  type="date"
                  value={assignDraft.deadline}
                  onChange={(e) => setAssignDraft({ ...assignDraft, deadline: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Instructions & details"
                value={assignDraft.description}
                onChange={(e) => setAssignDraft({ ...assignDraft, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Add Activity or Announcement
              </h3>
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="rounded-lg p-1 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Event or announcement title"
                value={actDraft.title}
                onChange={(e) => setActDraft({ ...actDraft, title: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <select
                value={actDraft.category}
                onChange={(e) =>
                  setActDraft({ ...actDraft, category: e.target.value as ActivityCategory })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={actDraft.date}
                  onChange={(e) => setActDraft({ ...actDraft, date: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <input
                  type="time"
                  value={actDraft.time}
                  onChange={(e) => setActDraft({ ...actDraft, time: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={actDraft.location}
                onChange={(e) => setActDraft({ ...actDraft, location: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <textarea
                rows={3}
                placeholder="Description"
                value={actDraft.description}
                onChange={(e) => setActDraft({ ...actDraft, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
