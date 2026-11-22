import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActivityCategory,
  Assignment,
  AttendanceStatus,
  ChineseLesson,
  ClassActivity,
  ClassroomRule,
  ClassroomSettings,
  ClassroomState,
  CleaningTaskKey,
  CleaningWeekSchedule,
  CompetitionCategory,
  Language,
  NavSection,
  PickerHistoryItem,
  PickerMode,
  PointPreset,
  Student,
  SuggestionCategory,
  SuggestionItem,
  Team,
  ThemeMode,
  UserRole,
} from '../types/classroom';
import {
  CLEANING_TASKS,
  createInitialState,
  getMondayISO,
  getTodayISO,
} from '../data/initialData';

const STORAGE_KEY = 'smart_class_lut_state_v2';
const THEME_KEY = 'smart_class_lut_theme_v1';
const LANG_KEY = 'smart_class_lut_lang_v1';

interface ClassroomContextValue {
  state: ClassroomState;
  role: UserRole;
  isAdmin: boolean;
  language: Language;
  theme: ThemeMode;
  activeSection: NavSection;
  presentationMode: boolean;
  projectorSpotlight: PickerHistoryItem | null;
  lastSavedStatus: string;
  setActiveSection: (section: NavSection) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  setPresentationMode: (val: boolean) => void;
  setProjectorSpotlight: (item: PickerHistoryItem | null) => void;
  authenticateRole: (targetRole: 'monitor' | 'teacher', pin: string) => boolean;
  setupPin: (targetRole: 'monitor' | 'teacher', newPin: string) => boolean;
  switchToStudentRole: () => void;
  // Student actions
  addStudent: (payload: Omit<Student, 'id' | 'orderIndex' | 'points' | 'badges' | 'active'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  // Attendance actions
  setAttendanceForDate: (date: string, studentId: string, status: AttendanceStatus) => void;
  markAllPresentForDate: (date: string) => void;
  // Cleaning actions
  generateWeeklyCleaning: (weekStart?: string) => void;
  toggleCleaningTaskDone: (weekId: string, assignmentId: string) => void;
  updateCleaningAssignmentStudents: (weekId: string, assignmentId: string, studentIds: string[]) => void;
  // Teams actions
  randomizeBalancedTeams: () => void;
  assignStudentToTeam: (studentId: string, teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  awardTeamCategoryPoints: (teamId: string, category: CompetitionCategory, points: number, reason: string) => void;
  // Points & Rewards
  awardPoints: (payload: {
    studentId?: string;
    teamId?: string;
    points: number;
    reason: string;
    category: CompetitionCategory;
    badgeId?: string;
  }) => void;
  updatePointPreset: (presetId: string, updates: Partial<PointPreset>) => void;
  addPointPreset: (preset: Omit<PointPreset, 'id'>) => void;
  setStudentOfTheWeek: (studentId: string, reason: string) => void;
  // Picker
  recordPick: (item: Omit<PickerHistoryItem, 'id' | 'pickedAt'>) => PickerHistoryItem;
  clearPickerHistory: () => void;
  // Chinese Learning
  addLesson: (lesson: Omit<ChineseLesson, 'id'>) => void;
  setWordOfTheDay: (lessonId: string) => void;
  // Assignments & Activities
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'completedStudentIds'>) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  toggleAssignmentStudentCompletion: (assignmentId: string, studentId: string) => void;
  deleteAssignment: (id: string) => void;
  addActivity: (activity: Omit<ClassActivity, 'id'>) => void;
  deleteActivity: (id: string) => void;
  // Suggestions & Rules
  submitSuggestion: (category: SuggestionCategory, title: string, message: string) => void;
  updateSuggestionAdmin: (id: string, status: SuggestionItem['status'], adminReply?: string) => void;
  addRule: (rule: Omit<ClassroomRule, 'id' | 'order'>) => void;
  updateRule: (id: string, updates: Partial<ClassroomRule>) => void;
  deleteRule: (id: string) => void;
  // Settings & Backup
  updateSettings: (updates: Partial<ClassroomSettings>) => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonText: string) => { ok: boolean; error?: string };
  resetAllData: () => void;
}

const ClassroomContext = createContext<ClassroomContextValue | null>(null);

function loadInitialState(): ClassroomState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ClassroomState;
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.teams) && parsed.settings) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seeded state if corrupted
  }
  return createInitialState();
}

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ClassroomState>(() => loadInitialState());
  const [role, setRole] = useState<UserRole>('student');
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language | null;
    return saved === 'ar' || saved === 'zh' || saved === 'en' ? saved : 'en';
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [presentationMode, setPresentationMode] = useState(false);
  const [projectorSpotlight, setProjectorSpotlight] = useState<PickerHistoryItem | null>(null);
  const [lastSavedStatus, setLastSavedStatus] = useState<string>('');

  const isAdmin = role === 'monitor' || role === 'teacher';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  useEffect(() => {
    try {
      const toSave: ClassroomState = {
        ...state,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      setLastSavedStatus(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed saving classroom state to localStorage:', err);
    }
  }, [state]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const authenticateRole = (targetRole: 'monitor' | 'teacher', pin: string): boolean => {
    const expected = targetRole === 'monitor' ? state.settings.monitorPin : state.settings.teacherPin;
    if (!expected) return false;
    if (pin.trim() === expected) {
      setRole(targetRole);
      return true;
    }
    return false;
  };

  const setupPin = (targetRole: 'monitor' | 'teacher', newPin: string): boolean => {
    const trimmed = newPin.trim();
    if (trimmed.length < 4) return false;
    const existing = targetRole === 'monitor' ? state.settings.monitorPin : state.settings.teacherPin;
    if (existing) return false;
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...(targetRole === 'monitor' ? { monitorPin: trimmed } : { teacherPin: trimmed }),
      },
    }));
    setRole(targetRole);
    return true;
  };

  const switchToStudentRole = () => setRole('student');

  const addStudent: ClassroomContextValue['addStudent'] = (payload) => {
    if (!isAdmin) return;
    setState((prev) => {
      const nextOrder = prev.students.reduce((max, s) => Math.max(max, s.orderIndex), 0) + 1;
      const newStudent: Student = {
        ...payload,
        id: `stu-${Date.now()}`,
        orderIndex: nextOrder,
        points: 0,
        badges: [],
        active: true,
      };
      return { ...prev, students: [...prev.students, newStudent] };
    });
  };

  const updateStudent: ClassroomContextValue['updateStudent'] = (id, updates) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteStudent: ClassroomContextValue['deleteStudent'] = (id) => {
    if (role !== 'monitor') return;
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  const setAttendanceForDate: ClassroomContextValue['setAttendanceForDate'] = (date, studentId, status) => {
    if (!isAdmin) return;
    setState((prev) => {
      const idx = prev.attendanceHistory.findIndex((r) => r.date === date);
      const nextHistory = [...prev.attendanceHistory];
      if (idx >= 0) {
        nextHistory[idx] = {
          ...nextHistory[idx],
          records: { ...nextHistory[idx].records, [studentId]: status },
          updatedBy: role,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const defaultMap: Record<string, AttendanceStatus> = {};
        prev.students.forEach((s) => {
          defaultMap[s.id] = s.id === studentId ? status : 'present';
        });
        nextHistory.push({
          date,
          records: defaultMap,
          updatedBy: role,
          updatedAt: new Date().toISOString(),
        });
      }
      nextHistory.sort((a, b) => a.date.localeCompare(b.date));
      return { ...prev, attendanceHistory: nextHistory };
    });
  };

  const markAllPresentForDate: ClassroomContextValue['markAllPresentForDate'] = (date) => {
    if (!isAdmin) return;
    setState((prev) => {
      const records: Record<string, AttendanceStatus> = {};
      prev.students.filter((s) => s.active).forEach((s) => {
        records[s.id] = 'present';
      });
      const idx = prev.attendanceHistory.findIndex((r) => r.date === date);
      const nextHistory = [...prev.attendanceHistory];
      const entry = {
        date,
        records,
        updatedBy: role,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) nextHistory[idx] = entry;
      else nextHistory.push(entry);
      nextHistory.sort((a, b) => a.date.localeCompare(b.date));
      return { ...prev, attendanceHistory: nextHistory };
    });
  };

  const generateWeeklyCleaning: ClassroomContextValue['generateWeeklyCleaning'] = (weekStartInput) => {
    if (!isAdmin) return;
    setState((prev) => {
      const weekStart = weekStartInput || getMondayISO();
      const eligible = prev.students.filter((s) => s.active && !s.excludedFromCleaning);
      if (eligible.length === 0) return prev;

      // Count historical assignments per student for fairness
      const dutyCount: Record<string, number> = {};
      eligible.forEach((s) => (dutyCount[s.id] = 0));
      prev.cleaningSchedules.forEach((sched) => {
        if (sched.weekStart === weekStart) return;
        sched.assignments.forEach((a) => {
          a.studentIds.forEach((sid) => {
            if (dutyCount[sid] !== undefined) dutyCount[sid] += 1;
          });
        });
      });

      // Track last week's tasks to avoid consecutive identical task repeats
      const latestOther = [...prev.cleaningSchedules]
        .filter((s) => s.weekStart !== weekStart)
        .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
      const lastTaskByStudent: Record<string, CleaningTaskKey> = {};
      if (latestOther) {
        latestOther.assignments.forEach((a) => {
          a.studentIds.forEach((sid) => {
            lastTaskByStudent[sid] = a.taskKey;
          });
        });
      }

      // Sort students by lowest historical duties + small tie-break rotation
      const pool = [...eligible].sort((a, b) => {
        const diff = (dutyCount[a.id] || 0) - (dutyCount[b.id] || 0);
        if (diff !== 0) return diff;
        return Math.random() - 0.5;
      });

      const usedThisWeek = new Set<string>();
      const perTask = Math.max(2, Math.floor(eligible.length / CLEANING_TASKS.length));

      const assignments = CLEANING_TASKS.map((taskKey, idx) => {
        const chosen: string[] = [];
        // Prefer students who have not been used this week AND did not do this exact task last week
        for (let pass = 0; pass < 3 && chosen.length < perTask; pass++) {
          for (const st of pool) {
            if (chosen.length >= perTask) break;
            if (chosen.includes(st.id)) continue;
            if (pass === 0 && (usedThisWeek.has(st.id) || lastTaskByStudent[st.id] === taskKey)) continue;
            if (pass === 1 && usedThisWeek.has(st.id)) continue;
            chosen.push(st.id);
            usedThisWeek.add(st.id);
          }
        }
        return {
          id: `clean-${weekStart}-${idx}-${Date.now()}`,
          taskKey,
          studentIds: chosen,
          completed: false,
        };
      });

      // Distribute any remaining eligible students who weren't assigned yet
      let taskCursor = 0;
      for (const st of pool) {
        if (!usedThisWeek.has(st.id)) {
          assignments[taskCursor % assignments.length].studentIds.push(st.id);
          usedThisWeek.add(st.id);
          taskCursor++;
        }
      }

      const newSchedule: CleaningWeekSchedule = {
        id: `week-${weekStart}`,
        weekStart,
        weekLabel: `Week of ${weekStart}`,
        assignments,
        notes: 'Fairly rotated based on historical duty counts.',
      };

      const existingIdx = prev.cleaningSchedules.findIndex((w) => w.weekStart === weekStart);
      const nextSchedules = [...prev.cleaningSchedules];
      if (existingIdx >= 0) nextSchedules[existingIdx] = newSchedule;
      else nextSchedules.push(newSchedule);
      nextSchedules.sort((a, b) => a.weekStart.localeCompare(b.weekStart));

      return { ...prev, cleaningSchedules: nextSchedules };
    });
  };

  const toggleCleaningTaskDone: ClassroomContextValue['toggleCleaningTaskDone'] = (weekId, assignmentId) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      cleaningSchedules: prev.cleaningSchedules.map((w) =>
        w.id !== weekId
          ? w
          : {
              ...w,
              assignments: w.assignments.map((a) =>
                a.id !== assignmentId
                  ? a
                  : {
                      ...a,
                      completed: !a.completed,
                      completedAt: !a.completed ? new Date().toISOString() : undefined,
                    }
              ),
            }
      ),
    }));
  };

  const updateCleaningAssignmentStudents: ClassroomContextValue['updateCleaningAssignmentStudents'] = (
    weekId,
    assignmentId,
    studentIds
  ) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      cleaningSchedules: prev.cleaningSchedules.map((w) =>
        w.id !== weekId
          ? w
          : {
              ...w,
              assignments: w.assignments.map((a) => (a.id === assignmentId ? { ...a, studentIds } : a)),
            }
      ),
    }));
  };

  const randomizeBalancedTeams = () => {
    if (!isAdmin) return;
    setState((prev) => {
      const active = [...prev.students.filter((s) => s.active)];
      for (let i = active.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [active[i], active[j]] = [active[j], active[i]];
      }
      const teamIds = prev.teams.map((t) => t.id);
      const assignedMap: Record<string, string> = {};
      active.forEach((st, idx) => {
        assignedMap[st.id] = teamIds[idx % teamIds.length];
      });
      return {
        ...prev,
        students: prev.students.map((s) => (assignedMap[s.id] ? { ...s, teamId: assignedMap[s.id] } : s)),
      };
    });
  };

  const assignStudentToTeam: ClassroomContextValue['assignStudentToTeam'] = (studentId, teamId) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === studentId ? { ...s, teamId } : s)),
    }));
  };

  const updateTeam: ClassroomContextValue['updateTeam'] = (teamId, updates) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
    }));
  };

  const awardTeamCategoryPoints: ClassroomContextValue['awardTeamCategoryPoints'] = (
    teamId,
    category,
    points,
    reason
  ) => {
    if (!isAdmin || !reason.trim()) return;
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id !== teamId
          ? t
          : {
              ...t,
              bonusPoints: t.bonusPoints + points,
              categoryScores: {
                ...t.categoryScores,
                [category]: Math.max(0, (t.categoryScores[category] || 0) + points),
              },
            }
      ),
      pointTransactions: [
        {
          id: `pt-${Date.now()}`,
          teamId,
          points,
          reason: reason.trim(),
          category,
          awardedBy: role,
          awardedByName: role === 'monitor' ? prev.settings.monitorName : prev.settings.teacherName,
          createdAt: new Date().toISOString(),
        },
        ...prev.pointTransactions,
      ],
    }));
  };

  const awardPoints: ClassroomContextValue['awardPoints'] = ({
    studentId,
    teamId,
    points,
    reason,
    category,
    badgeId,
  }) => {
    if (!isAdmin || !reason.trim()) return;
    setState((prev) => {
      const targetStudent = studentId ? prev.students.find((s) => s.id === studentId) : undefined;
      const resolvedTeamId = teamId || targetStudent?.teamId;
      return {
        ...prev,
        students: studentId
          ? prev.students.map((s) => {
              if (s.id !== studentId) return s;
              const nextBadges =
                badgeId && !s.badges.includes(badgeId) ? [...s.badges, badgeId] : s.badges;
              return { ...s, points: Math.max(0, s.points + points), badges: nextBadges };
            })
          : prev.students,
        teams: resolvedTeamId
          ? prev.teams.map((t) =>
              t.id !== resolvedTeamId
                ? t
                : {
                    ...t,
                    categoryScores: {
                      ...t.categoryScores,
                      [category]: Math.max(0, (t.categoryScores[category] || 0) + points),
                    },
                  }
            )
          : prev.teams,
        pointTransactions: [
          {
            id: `pt-${Date.now()}`,
            studentId,
            teamId: resolvedTeamId,
            points,
            reason: reason.trim(),
            category,
            awardedBy: role,
            awardedByName: role === 'monitor' ? prev.settings.monitorName : prev.settings.teacherName,
            createdAt: new Date().toISOString(),
          },
          ...prev.pointTransactions,
        ],
      };
    });
  };

  const updatePointPreset: ClassroomContextValue['updatePointPreset'] = (presetId, updates) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      pointPresets: prev.pointPresets.map((p) => (p.id === presetId ? { ...p, ...updates } : p)),
    }));
  };

  const addPointPreset: ClassroomContextValue['addPointPreset'] = (preset) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      pointPresets: [...prev.pointPresets, { ...preset, id: `preset-${Date.now()}` }],
    }));
  };

  const setStudentOfTheWeek: ClassroomContextValue['setStudentOfTheWeek'] = (studentId, reason) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        studentOfTheWeekId: studentId,
        studentOfTheWeekReason: reason.trim() || prev.settings.studentOfTheWeekReason,
      },
    }));
  };

  const recordPick: ClassroomContextValue['recordPick'] = (item) => {
    const newItem: PickerHistoryItem = {
      ...item,
      id: `pick-${Date.now()}`,
      pickedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      pickerHistory: [newItem, ...prev.pickerHistory].slice(0, 80),
    }));
    return newItem;
  };

  const clearPickerHistory = () => {
    setState((prev) => ({ ...prev, pickerHistory: [] }));
  };

  const addLesson: ClassroomContextValue['addLesson'] = (lesson) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      lessons: [{ ...lesson, id: `lesson-${Date.now()}` }, ...prev.lessons],
    }));
  };

  const setWordOfTheDay: ClassroomContextValue['setWordOfTheDay'] = (lessonId) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, wordOfTheDayId: lessonId },
    }));
  };

  const addAssignment: ClassroomContextValue['addAssignment'] = (assignment) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      assignments: [
        {
          ...assignment,
          id: `assign-${Date.now()}`,
          createdAt: getTodayISO(),
          completedStudentIds: [],
        },
        ...prev.assignments,
      ],
    }));
  };

  const updateAssignmentStatus: ClassroomContextValue['updateAssignmentStatus'] = (id, status) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  };

  const toggleAssignmentStudentCompletion: ClassroomContextValue['toggleAssignmentStudentCompletion'] = (
    assignmentId,
    studentId
  ) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const exists = a.completedStudentIds.includes(studentId);
        return {
          ...a,
          completedStudentIds: exists
            ? a.completedStudentIds.filter((id) => id !== studentId)
            : [...a.completedStudentIds, studentId],
        };
      }),
    }));
  };

  const deleteAssignment: ClassroomContextValue['deleteAssignment'] = (id) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
  };

  const addActivity: ClassroomContextValue['addActivity'] = (activity) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      activities: [{ ...activity, id: `act-${Date.now()}` }, ...prev.activities],
    }));
  };

  const deleteActivity: ClassroomContextValue['deleteActivity'] = (id) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
  };

  const submitSuggestion: ClassroomContextValue['submitSuggestion'] = (category, title, message) => {
    if (!title.trim() || !message.trim()) return;
    setState((prev) => ({
      ...prev,
      suggestions: [
        {
          id: `sug-${Date.now()}`,
          category,
          title: title.trim(),
          message: message.trim(),
          status: 'new',
          createdAt: new Date().toISOString(),
        },
        ...prev.suggestions,
      ],
    }));
  };

  const updateSuggestionAdmin: ClassroomContextValue['updateSuggestionAdmin'] = (id, status, adminReply) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      suggestions: prev.suggestions.map((s) =>
        s.id === id ? { ...s, status, adminReply: adminReply ?? s.adminReply } : s
      ),
    }));
  };

  const addRule: ClassroomContextValue['addRule'] = (rule) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          ...rule,
          id: `rule-${Date.now()}`,
          order: prev.rules.length + 1,
        },
      ],
    }));
  };

  const updateRule: ClassroomContextValue['updateRule'] = (id, updates) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  };

  const deleteRule: ClassroomContextValue['deleteRule'] = (id) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      rules: prev.rules
        .filter((r) => r.id !== id)
        .map((r, idx) => ({ ...r, order: idx + 1 })),
    }));
  };

  const updateSettings: ClassroomContextValue['updateSettings'] = (updates) => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  const exportBackupJson = (): string => {
    return JSON.stringify(
      {
        ...state,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importBackupJson = (jsonText: string): { ok: boolean; error?: string } => {
    if (!isAdmin) return { ok: false, error: 'Monitor or Teacher authorization required.' };
    try {
      const parsed = JSON.parse(jsonText) as ClassroomState;
      if (
        !parsed ||
        !Array.isArray(parsed.students) ||
        !Array.isArray(parsed.teams) ||
        !parsed.settings ||
        !Array.isArray(parsed.rules)
      ) {
        return { ok: false, error: 'Invalid SMART CLASS backup file format.' };
      }
      setState({
        ...parsed,
        lastSavedAt: new Date().toISOString(),
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not parse JSON file. Please verify file integrity.' };
    }
  };

  const resetAllData = () => {
    if (role !== 'monitor') return;
    const fresh = createInitialState();
    setState(fresh);
  };

  return (
    <ClassroomContext.Provider
      value={{
        state,
        role,
        isAdmin,
        language,
        theme,
        activeSection,
        presentationMode,
        projectorSpotlight,
        lastSavedStatus,
        setActiveSection,
        setLanguage,
        toggleTheme,
        setPresentationMode,
        setProjectorSpotlight,
        authenticateRole,
        setupPin,
        switchToStudentRole,
        addStudent,
        updateStudent,
        deleteStudent,
        setAttendanceForDate,
        markAllPresentForDate,
        generateWeeklyCleaning,
        toggleCleaningTaskDone,
        updateCleaningAssignmentStudents,
        randomizeBalancedTeams,
        assignStudentToTeam,
        updateTeam,
        awardTeamCategoryPoints,
        awardPoints,
        updatePointPreset,
        addPointPreset,
        setStudentOfTheWeek,
        recordPick,
        clearPickerHistory,
        addLesson,
        setWordOfTheDay,
        addAssignment,
        updateAssignmentStatus,
        toggleAssignmentStudentCompletion,
        deleteAssignment,
        addActivity,
        deleteActivity,
        submitSuggestion,
        updateSuggestionAdmin,
        addRule,
        updateRule,
        deleteRule,
        updateSettings,
        exportBackupJson,
        importBackupJson,
        resetAllData,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export function useClassroom(): ClassroomContextValue {
  const ctx = useContext(ClassroomContext);
  if (!ctx) throw new Error('useClassroom must be used inside ClassroomProvider');
  return ctx;
}
