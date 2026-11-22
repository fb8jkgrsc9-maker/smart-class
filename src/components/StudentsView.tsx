import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Shield, Trash2, UserCheck, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { BADGE_DEFINITIONS } from '../data/initialData';
import { t } from '../i18n/translations';
import { Student } from '../types/classroom';
import { formatStudentMeta, getStudentAttendanceStats } from '../utils/helpers';

export const StudentsView: React.FC = () => {
  const { state, isAdmin, role, language, addStudent, updateStudent, deleteStudent } = useClassroom();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formState, setFormState] = useState({
    displayName: '',
    chineseName: '',
    pinyin: '',
    englishName: '',
    studentNumber: '',
    teamId: state.teams[0]?.id || 'team-1',
    isMonitor: false,
    excludedFromCleaning: false,
    notes: '',
  });

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.students.filter((s) => {
      if (teamFilter !== 'all' && s.teamId !== teamFilter) return false;
      if (!q) return true;
      return (
        s.displayName.toLowerCase().includes(q) ||
        s.chineseName.toLowerCase().includes(q) ||
        s.pinyin.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q)
      );
    });
  }, [state.students, search, teamFilter]);

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormState({
      displayName: st.displayName,
      chineseName: st.chineseName,
      pinyin: st.pinyin,
      englishName: st.englishName,
      studentNumber: st.studentNumber,
      teamId: st.teamId,
      isMonitor: st.isMonitor,
      excludedFromCleaning: st.excludedFromCleaning,
      notes: st.notes,
    });
  };

  const openAddModal = () => {
    const nextNum = String(state.students.length + 1).padStart(2, '0');
    setFormState({
      displayName: '',
      chineseName: '',
      pinyin: '',
      englishName: '',
      studentNumber: `LUT-${nextNum}`,
      teamId: state.teams[state.students.length % state.teams.length]?.id || 'team-1',
      isMonitor: false,
      excludedFromCleaning: false,
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formState.displayName.trim()) return;
    updateStudent(editingStudent.id, {
      displayName: formState.displayName.trim(),
      chineseName: formState.chineseName.trim(),
      pinyin: formState.pinyin.trim(),
      englishName: formState.englishName.trim(),
      studentNumber: formState.studentNumber.trim(),
      teamId: formState.teamId,
      isMonitor: formState.isMonitor,
      excludedFromCleaning: formState.excludedFromCleaning,
      notes: formState.notes.trim(),
    });
    setEditingStudent(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.displayName.trim()) return;
    addStudent({
      displayName: formState.displayName.trim(),
      chineseName: formState.chineseName.trim(),
      pinyin: formState.pinyin.trim(),
      englishName: formState.englishName.trim(),
      studentNumber: formState.studentNumber.trim(),
      isMonitor: formState.isMonitor,
      teamId: formState.teamId,
      excludedFromCleaning: formState.excludedFromCleaning,
      notes: formState.notes.trim(),
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navStudents')} ({state.students.length})
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Preserves supplied names verbatim. Monitor and Teacher can enter Chinese characters, Pinyin, and English spellings.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(language, 'searchPlaceholder')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 focus:border-[#0F2342] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTeamFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              teamFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            {t(language, 'all')}
          </button>
          {state.teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => setTeamFilter(team.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                teamFilter === team.id
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Chinese / Pinyin / English</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-right">Attendance</th>
                <th className="px-4 py-3 text-right">Cleaning</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const team = state.teams.find((tm) => tm.id === student.teamId);
                const att = getStudentAttendanceStats(student.id, state.attendanceHistory);
                const meta = formatStudentMeta(student);
                return (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-mono-tabular text-xs text-slate-500">
                      {String(student.orderIndex).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="text-left font-medium text-slate-900 hover:text-[#0F2342] hover:underline dark:text-white dark:hover:text-[#E8C872]"
                      >
                        {student.displayName}
                      </button>
                      {student.isMonitor && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-[#C9972C]">
                          <Shield className="h-3 w-3" />
                          Monitor (班长)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {meta || <span className="text-slate-400 italic">Pending entry</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
                      {team?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-tabular text-xs font-medium text-slate-700 dark:text-slate-200">
                      {att.rate}%
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {student.excludedFromCleaning ? (
                        <span className="text-amber-600 dark:text-amber-400">Excluded</span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400">Eligible</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Profile
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="Edit Student"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {role === 'monitor' && !student.isMonitor && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Remove ${student.displayName} from roster?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                            title="Delete Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit or Add Modal */}
      {(editingStudent || showAddModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Student Record' : 'Add New Student'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingStudent(null);
                  setShowAddModal(false);
                }}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={editingStudent ? handleSaveEdit : handleCreateStudent}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Primary Display Name (Supplied Name)
                </label>
                <input
                  type="text"
                  value={formState.displayName}
                  onChange={(e) => setFormState({ ...formState, displayName: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Chinese Characters (汉字)
                  </label>
                  <input
                    type="text"
                    value={formState.chineseName}
                    onChange={(e) => setFormState({ ...formState, chineseName: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Pinyin
                  </label>
                  <input
                    type="text"
                    value={formState.pinyin}
                    onChange={(e) => setFormState({ ...formState, pinyin: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    English Spelling
                  </label>
                  <input
                    type="text"
                    value={formState.englishName}
                    onChange={(e) => setFormState({ ...formState, englishName: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Team
                  </label>
                  <select
                    value={formState.teamId}
                    onChange={(e) => setFormState({ ...formState, teamId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {state.teams.map((tm) => (
                      <option key={tm.id} value={tm.id}>
                        {tm.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Student Code
                  </label>
                  <input
                    type="text"
                    value={formState.studentNumber}
                    onChange={(e) => setFormState({ ...formState, studentNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formState.excludedFromCleaning}
                    onChange={(e) =>
                      setFormState({ ...formState, excludedFromCleaning: e.target.checked })
                    }
                    className="rounded border-slate-300"
                  />
                  Temporarily exclude from weekly cleaning
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudent(null);
                    setShowAddModal(false);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {t(language, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
                >
                  {t(language, 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#C9972C]" />
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Student Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const latest =
                state.students.find((s) => s.id === selectedStudent.id) || selectedStudent;
              const att = getStudentAttendanceStats(latest.id, state.attendanceHistory);
              const team = state.teams.find((tm) => tm.id === latest.teamId);
              const txs = state.pointTransactions.filter((tx) => tx.studentId === latest.id);

              return (
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="text-xs font-mono-tabular text-slate-500">
                      {latest.studentNumber}
                    </div>
                    <h3 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
                      {latest.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {formatStudentMeta(latest) || 'Chinese/Pinyin/English pending confirmation'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <div className="text-xs text-slate-500">Points</div>
                      <div className="mt-1 font-mono-tabular text-xl font-bold text-slate-900 dark:text-white">
                        {latest.points}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Attendance</div>
                      <div className="mt-1 font-mono-tabular text-xl font-bold text-slate-900 dark:text-white">
                        {att.rate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Team</div>
                      <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                        {team?.name}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Achievement Badges
                    </h4>
                    {latest.badges.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">No badges earned yet.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {latest.badges.map((bid) => {
                          const def = BADGE_DEFINITIONS.find((b) => b.id === bid);
                          if (!def) return null;
                          return (
                            <div
                              key={bid}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800"
                            >
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {def.name} · {def.nameZh}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {def.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Recent Points History
                    </h4>
                    {txs.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">No point records yet.</p>
                    ) : (
                      <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                        {txs.slice(0, 8).map((tx) => (
                          <div key={tx.id} className="flex items-start justify-between py-2.5 text-xs">
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {tx.reason}
                              </div>
                              <div className="text-slate-500">
                                {tx.category} · {tx.createdAt.slice(0, 10)}
                              </div>
                            </div>
                            <span className="font-mono-tabular font-semibold text-emerald-700 dark:text-emerald-400">
                              +{tx.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
