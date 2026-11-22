export type Language = 'en' | 'ar' | 'zh';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'student' | 'monitor' | 'teacher';

export type NavSection =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'cleaning'
  | 'picker'
  | 'teams'
  | 'points'
  | 'chinese'
  | 'activities'
  | 'community'
  | 'reports'
  | 'settings';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type CleaningTaskKey =
  | 'sweep_floor'
  | 'mop_floor'
  | 'clean_whiteboard'
  | 'organize_desks'
  | 'empty_trash'
  | 'clean_windows'
  | 'organize_supplies';

export type CompetitionCategory =
  | 'Chinese speaking'
  | 'Vocabulary'
  | 'Grammar'
  | 'Attendance'
  | 'Classroom cleanliness'
  | 'Cooperation'
  | 'Participation';

export type PickerMode =
  | 'student'
  | 'team'
  | 'cleaning'
  | 'question'
  | 'speaker'
  | 'activity';

export type SuggestionCategory =
  | 'improvement'
  | 'complaint'
  | 'activity'
  | 'question'
  | 'request';

export type ActivityCategory =
  | 'competition'
  | 'cultural'
  | 'challenge'
  | 'presentation'
  | 'announcement'
  | 'meeting';

export interface Student {
  id: string;
  orderIndex: number;
  displayName: string; // Preserved supplied name
  chineseName: string;
  pinyin: string;
  englishName: string;
  studentNumber: string;
  isMonitor: boolean;
  teamId: string;
  points: number;
  badges: string[];
  excludedFromCleaning: boolean;
  active: boolean;
  notes: string;
}

export interface Team {
  id: string;
  name: string;
  chineseName: string;
  motto: string;
  accentColor: string;
  bonusPoints: number;
  categoryScores: Record<CompetitionCategory, number>;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>;
  updatedBy: UserRole;
  updatedAt: string;
}

export interface CleaningAssignment {
  id: string;
  taskKey: CleaningTaskKey;
  studentIds: string[];
  completed: boolean;
  completedAt?: string;
}

export interface CleaningWeekSchedule {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekLabel: string;
  assignments: CleaningAssignment[];
  notes: string;
}

export interface PointPreset {
  id: string;
  label: string;
  labelZh: string;
  labelAr: string;
  points: number;
  category: CompetitionCategory;
}

export interface PointTransaction {
  id: string;
  studentId?: string;
  teamId?: string;
  points: number;
  reason: string;
  category: CompetitionCategory;
  awardedBy: UserRole;
  awardedByName: string;
  createdAt: string;
}

export interface PickerHistoryItem {
  id: string;
  mode: PickerMode;
  resultLabel: string;
  resultSubLabel?: string;
  targetId?: string;
  pickedAt: string;
}

export interface ChineseLesson {
  id: string;
  type: 'word' | 'hsk' | 'grammar' | 'speaking';
  hskLevel: string;
  hanzi: string;
  pinyin: string;
  meaningEn: string;
  meaningAr: string;
  exampleZh: string;
  examplePinyin: string;
  exampleEn: string;
  exampleAr: string;
  grammarTip?: string;
  createdBy: string;
  isWordOfDay?: boolean;
}

export interface QuizQuestion {
  id: string;
  questionZh: string;
  questionEn: string;
  questionAr: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hskLevel: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacher: string;
  createdAt: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedStudentIds: string[];
}

export interface ClassActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  createdBy: string;
  isPinnedAnnouncement?: boolean;
}

export interface SuggestionItem {
  id: string;
  category: SuggestionCategory;
  title: string;
  message: string;
  status: 'new' | 'reviewing' | 'planned' | 'resolved';
  adminReply?: string;
  createdAt: string;
}

export interface ClassroomRule {
  id: string;
  order: number;
  en: string;
  zh: string;
  ar: string;
}

export interface ClassroomSettings {
  classroomName: string;
  classroomNameZh: string;
  universityName: string;
  universityNameZh: string;
  semesterLabel: string;
  monitorName: string;
  teacherName: string;
  monitorPin: string;
  teacherPin: string;
  studentOfTheWeekId: string;
  studentOfTheWeekReason: string;
  wordOfTheDayId: string;
}

export interface ClassroomState {
  version: number;
  lastSavedAt: string;
  settings: ClassroomSettings;
  students: Student[];
  teams: Team[];
  attendanceHistory: AttendanceRecord[];
  cleaningSchedules: CleaningWeekSchedule[];
  pointPresets: PointPreset[];
  pointTransactions: PointTransaction[];
  pickerHistory: PickerHistoryItem[];
  lessons: ChineseLesson[];
  quizzes: QuizQuestion[];
  assignments: Assignment[];
  activities: ClassActivity[];
  suggestions: SuggestionItem[];
  rules: ClassroomRule[];
}
