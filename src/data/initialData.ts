import {
  AttendanceRecord,
  CleaningTaskKey,
  CleaningWeekSchedule,
  ClassroomState,
  CompetitionCategory,
  PointPreset,
  Student,
  Team,
} from '../types/classroom';

export const CLEANING_TASKS: CleaningTaskKey[] = [
  'sweep_floor',
  'mop_floor',
  'clean_whiteboard',
  'organize_desks',
  'empty_trash',
  'clean_windows',
  'organize_supplies',
];

export const COMPETITION_CATEGORIES: CompetitionCategory[] = [
  'Chinese speaking',
  'Vocabulary',
  'Grammar',
  'Attendance',
  'Classroom cleanliness',
  'Cooperation',
  'Participation',
];

export const BADGE_DEFINITIONS = [
  { id: 'speaking_star', name: 'Chinese Speaker', nameZh: '汉语之星', nameAr: 'نجم التحدث بالصينية', description: 'Active Chinese speaking in class' },
  { id: 'clean_champion', name: 'Cleanliness Guardian', nameZh: '值日模范', nameAr: 'بطل النظافة', description: 'Consistent cleaning duty excellence' },
  { id: 'perfect_attendance', name: 'Punctuality Award', nameZh: '全勤标兵', nameAr: 'الانضباط والحضور', description: 'Outstanding attendance record' },
  { id: 'helper_spirit', name: 'Classmate Helper', nameZh: '乐于助人', nameAr: 'روح التعاون', description: 'Supporting classmates in learning' },
  { id: 'hsk_achiever', name: 'Vocabulary Master', nameZh: '词汇达人', nameAr: 'متقن المفردات', description: 'Strong HSK & vocabulary performance' },
];

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateISO(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMondayISO(dateInput: Date = new Date()): string {
  const d = new Date(dateInput);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dateNum = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dateNum}`;
}

const SUPPLIED_NAMES: {
  orderIndex: number;
  displayName: string;
  chineseName: string;
  pinyin: string;
  englishName: string;
  isMonitor: boolean;
}[] = [
  { orderIndex: 1, displayName: 'Li Ankai – 李安凯', chineseName: '李安凯', pinyin: 'Lǐ Ānkǎi', englishName: 'Li Ankai', isMonitor: true },
  { orderIndex: 2, displayName: 'يناغ شو', chineseName: '', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 3, displayName: 'يوليان', chineseName: '哟亮', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 4, displayName: 'سويلي', chineseName: '苏雷', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 5, displayName: 'ليشوان', chineseName: '雷萱', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 6, displayName: 'ماسوين', chineseName: '马思远', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 7, displayName: 'اجوين', chineseName: '', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 8, displayName: 'ايجاو', chineseName: '', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 9, displayName: 'اجاني', chineseName: '爱干预', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 10, displayName: 'بيتمي', chineseName: '默尔雷', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 11, displayName: 'منغفان', chineseName: '明矾', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 12, displayName: 'نابوا', chineseName: '纳博', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 13, displayName: 'شلسياو', chineseName: '沙骁', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 14, displayName: 'انخهو', chineseName: '案后', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 15, displayName: 'سونينغ', chineseName: '', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 16, displayName: 'شونلونغ', chineseName: '陈龙', pinyin: '', englishName: '', isMonitor: false },
  { orderIndex: 17, displayName: 'لي خاو', chineseName: '林浩', pinyin: '', englishName: '', isMonitor: false },
];

export function createInitialStudents(): Student[] {
  return SUPPLIED_NAMES.map((item, idx) => {
    const teamNumber = Math.floor(idx / 6) + 1; // Team 1: 6, Team 2: 6, Team 3: 5
    const padded = String(item.orderIndex).padStart(2, '0');
    return {
      id: `stu-${padded}`,
      orderIndex: item.orderIndex,
      displayName: item.displayName,
      chineseName: item.chineseName,
      pinyin: item.pinyin,
      englishName: item.englishName,
      studentNumber: `LUT-${padded}`,
      isMonitor: item.isMonitor,
      teamId: `team-${teamNumber}`,
      points: item.isMonitor ? 18 : 10 + ((idx * 3) % 7),
      badges: item.isMonitor ? ['speaking_star', 'helper_spirit'] : idx % 4 === 0 ? ['perfect_attendance'] : [],
      excludedFromCleaning: false,
      active: true,
      notes: item.isMonitor ? '班长' : '',
    };
  });
}

export function createInitialTeams(): Team[] {
  return [
    {
      id: 'team-1',
      name: 'Silk Road Scholars',
      chineseName: '丝路学者队',
      motto: 'Diligence & Unity',
      accentColor: '#1E3A8A',
      bonusPoints: 10,
      categoryScores: {
        'Chinese speaking': 14,
        Vocabulary: 12,
        Grammar: 10,
        Attendance: 15,
        'Classroom cleanliness': 12,
        Cooperation: 14,
        Participation: 13,
      },
    },
    {
      id: 'team-2',
      name: 'Yellow River Pioneers',
      chineseName: '黄河先锋队',
      motto: 'Steady Progress Every Day',
      accentColor: '#B45309',
      bonusPoints: 8,
      categoryScores: {
        'Chinese speaking': 12,
        Vocabulary: 15,
        Grammar: 13,
        Attendance: 14,
        'Classroom cleanliness': 15,
        Cooperation: 11,
        Participation: 12,
      },
    },
    {
      id: 'team-3',
      name: 'Lanzhou Rising Stars',
      chineseName: '兰州新星队',
      motto: 'Curiosity & Excellence',
      accentColor: '#0F766E',
      bonusPoints: 9,
      categoryScores: {
        'Chinese speaking': 15,
        Vocabulary: 11,
        Grammar: 14,
        Attendance: 13,
        'Classroom cleanliness': 13,
        Cooperation: 15,
        Participation: 14,
      },
    },
  ];
}

export function createInitialPointPresets(): PointPreset[] {
  return [
    {
      id: 'preset-speak',
      label: 'Speaking Chinese',
      labelZh: '积极说中文',
      labelAr: 'التحدث بالصينية',
      points: 2,
      category: 'Chinese speaking',
    },
    {
      id: 'preset-answer',
      label: 'Answering a question',
      labelZh: '回答课堂问题',
      labelAr: 'الإجابة على سؤال',
      points: 3,
      category: 'Participation',
    },
    {
      id: 'preset-help',
      label: 'Helping another student',
      labelZh: '帮助同学',
      labelAr: 'مساعدة زميل',
      points: 2,
      category: 'Cooperation',
    },
    {
      id: 'preset-participate',
      label: 'Excellent classroom participation',
      labelZh: '课堂表现优秀',
      labelAr: 'مشاركة صفية متميزة',
      points: 3,
      category: 'Participation',
    },
    {
      id: 'preset-clean',
      label: 'Completing cleaning duties',
      labelZh: '认真完成值日',
      labelAr: 'إتمام مهام النظافة',
      points: 3,
      category: 'Classroom cleanliness',
    },
    {
      id: 'preset-ontime',
      label: 'Arriving on time',
      labelZh: '按时出勤',
      labelAr: 'الحضور في الموعد',
      points: 1,
      category: 'Attendance',
    },
    {
      id: 'preset-win',
      label: 'Winning a competition',
      labelZh: '赢得小组比赛',
      labelAr: 'الفوز في مسابقة',
      points: 5,
      category: 'Chinese speaking',
    },
  ];
}

function createInitialAttendance(students: Student[]): AttendanceRecord[] {
  const today = getTodayISO();
  const yesterday = getOffsetDateISO(-1);
  const twoDaysAgo = getOffsetDateISO(-2);

  const makeRecord = (date: string, lateIdx: number[], excusedIdx: number[]): AttendanceRecord => {
    const map: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach((s, idx) => {
      if (lateIdx.includes(idx)) map[s.id] = 'late';
      else if (excusedIdx.includes(idx)) map[s.id] = 'excused';
      else map[s.id] = 'present';
    });
    return {
      date,
      records: map,
      updatedBy: 'monitor',
      updatedAt: new Date().toISOString(),
    };
  };

  return [
    makeRecord(twoDaysAgo, [11], [15]),
    makeRecord(yesterday, [6], []),
    makeRecord(today, [], []),
  ];
}

function createInitialCleaning(students: Student[]): CleaningWeekSchedule[] {
  const monday = getMondayISO();
  const prevMondayDate = new Date();
  prevMondayDate.setDate(prevMondayDate.getDate() - 7);
  const prevMonday = getMondayISO(prevMondayDate);

  const eligible = students.filter((s) => s.active && !s.excludedFromCleaning);

  const prevAssignments = CLEANING_TASKS.map((taskKey, idx) => ({
    id: `clean-prev-${idx}`,
    taskKey,
    studentIds: [
      eligible[(idx * 2) % eligible.length].id,
      eligible[(idx * 2 + 1) % eligible.length].id,
    ],
    completed: true,
    completedAt: new Date(prevMondayDate).toISOString(),
  }));

  const currentAssignments = CLEANING_TASKS.map((taskKey, idx) => ({
    id: `clean-curr-${idx}`,
    taskKey,
    studentIds: [
      eligible[(idx * 2 + 4) % eligible.length].id,
      eligible[(idx * 2 + 5) % eligible.length].id,
    ],
    completed: idx < 3,
    completedAt: idx < 3 ? new Date().toISOString() : undefined,
  }));

  return [
    {
      id: `week-${prevMonday}`,
      weekStart: prevMonday,
      weekLabel: `Week of ${prevMonday}`,
      assignments: prevAssignments,
      notes: 'Completed cleanly on schedule.',
    },
    {
      id: `week-${monday}`,
      weekStart: monday,
      weekLabel: `Week of ${monday}`,
      assignments: currentAssignments,
      notes: 'Standard weekly cleaning rotation.',
    },
  ];
}

export function createInitialState(): ClassroomState {
  const students = createInitialStudents();
  const teams = createInitialTeams();
  const today = getTodayISO();

  return {
    version: 1,
    lastSavedAt: new Date().toISOString(),
    settings: {
      classroomName: 'International Chinese Language Class',
      classroomNameZh: '国际中文班',
      universityName: 'Lanzhou University of Technology',
      universityNameZh: '兰州理工大学',
      semesterLabel: '2026 Autumn Semester · 2026年秋季学期',
      monitorName: 'Li Ankai (李安凯)',
      teacherName: 'Chinese Language Teacher (中文老师)',
      monitorPin: '',
      teacherPin: '',
      studentOfTheWeekId: 'stu-01',
      studentOfTheWeekReason: 'Consistent leadership, daily Chinese practice, and helping classmates prepare for HSK.',
      wordOfTheDayId: 'lesson-01',
    },
    students,
    teams,
    attendanceHistory: createInitialAttendance(students),
    cleaningSchedules: createInitialCleaning(students),
    pointPresets: createInitialPointPresets(),
    pointTransactions: [
      {
        id: 'pt-init-1',
        studentId: 'stu-01',
        teamId: 'team-1',
        points: 3,
        reason: 'Leading morning Chinese reading practice',
        category: 'Chinese speaking',
        awardedBy: 'teacher',
        awardedByName: 'Teacher (老师)',
        createdAt: getOffsetDateISO(-2) + 'T09:30:00.000Z',
      },
      {
        id: 'pt-init-2',
        studentId: 'stu-08',
        teamId: 'team-2',
        points: 3,
        reason: 'Excellent classroom participation and dialogue',
        category: 'Participation',
        awardedBy: 'monitor',
        awardedByName: 'Li Ankai (李安凯)',
        createdAt: getOffsetDateISO(-1) + 'T11:15:00.000Z',
      },
      {
        id: 'pt-init-3',
        studentId: 'stu-14',
        teamId: 'team-3',
        points: 3,
        reason: 'Completing weekly cleaning duties thoroughly',
        category: 'Classroom cleanliness',
        awardedBy: 'monitor',
        awardedByName: 'Li Ankai (李安凯)',
        createdAt: today + 'T08:45:00.000Z',
      },
    ],
    pickerHistory: [],
    lessons: [
      {
        id: 'lesson-01',
        type: 'word',
        hskLevel: 'HSK 2',
        hanzi: '努力',
        pinyin: 'nǔ lì',
        meaningEn: 'To work hard; diligent; effort',
        meaningAr: 'يجتهد / يبذل جهداً',
        exampleZh: '我们一起努力学习汉语吧！',
        examplePinyin: 'Wǒmen yìqǐ nǔlì xuéxí Hànyǔ ba!',
        exampleEn: "Let's work hard together to study Chinese!",
        exampleAr: 'لنجتهد معاً في تعلم اللغة الصينية!',
        createdBy: 'Teacher (老师)',
        isWordOfDay: true,
      },
      {
        id: 'lesson-02',
        type: 'word',
        hskLevel: 'HSK 2',
        hanzi: '进步',
        pinyin: 'jìn bù',
        meaningEn: 'To make progress; improve',
        meaningAr: 'يتقدم / يتحسن',
        exampleZh: '你的汉语水平进步很快。',
        examplePinyin: 'Nǐ de Hànyǔ shuǐpíng jìnbù hěn kuài.',
        exampleEn: 'Your Chinese level is improving very fast.',
        exampleAr: 'مستواك في اللغة الصينية يتقدم بسرعة كبيرة.',
        createdBy: 'Teacher (老师)',
      },
      {
        id: 'lesson-03',
        type: 'hsk',
        hskLevel: 'HSK 3',
        hanzi: '环境',
        pinyin: 'huán jìng',
        meaningEn: 'Environment; surroundings',
        meaningAr: 'البيئة / المحيط',
        exampleZh: '保持教室环境干净很重要。',
        examplePinyin: 'Bǎochí jiàoshì huánjìng gānjìng hěn zhòngyào.',
        exampleEn: 'Keeping the classroom environment clean is very important.',
        exampleAr: 'الحفاظ على نظافة بيئة الفصل أمر مهم جداً.',
        createdBy: 'Li Ankai (李安凯)',
      },
      {
        id: 'lesson-04',
        type: 'grammar',
        hskLevel: 'HSK 2',
        hanzi: '越来越 + Adj',
        pinyin: 'yuè lái yuè',
        meaningEn: 'More and more...',
        meaningAr: 'أكثر فأكثر / يزداد باستمرار',
        exampleZh: '兰州理工大学的校园越来越漂亮。',
        examplePinyin: 'Lánzhōu Lǐgōng Dàxué de xiàoyuán yuèláiyuè piàoliang.',
        exampleEn: 'The Lanzhou University of Technology campus is getting more and more beautiful.',
        exampleAr: 'يصبح حرم جامعة لانتشو للتكنولوجيا أجمل فأجمل.',
        grammarTip: 'Place an adjective or mental verb directly after 越来越 without adding 很.',
        createdBy: 'Teacher (老师)',
      },
      {
        id: 'lesson-05',
        type: 'speaking',
        hskLevel: 'HSK 2-3',
        hanzi: '我的大学生活',
        pinyin: 'Wǒ de dàxué shēnghuó',
        meaningEn: 'My University Life in Lanzhou',
        meaningAr: 'حياتي الجامعية في لانتشو',
        exampleZh: '每天早上八点，我来到教室和同学们一起学习。',
        examplePinyin: 'Měitiān zǎoshang bā diǎn, wǒ láidào jiàoshì hé tóngxuémen yìqǐ xuéxí.',
        exampleEn: 'Every morning at 8 AM, I come to the classroom to study with my classmates.',
        exampleAr: 'في الساعة الثامنة صباح كل يوم، آتي إلى الفصل لأدرس مع زملائي.',
        grammarTip: 'Prepare a 90-second talk using 时间 (time), 地点 (place), and 和…一起.',
        createdBy: 'Teacher (老师)',
      },
    ],
    quizzes: [
      {
        id: 'quiz-1',
        questionZh: '“我们一起＿＿学习汉语吧！” 最合适的词是？',
        questionEn: 'Choose the best word to complete: "Wǒmen yìqǐ ___ xuéxí Hànyǔ ba!"',
        questionAr: 'اختر الكلمة الأنسب لإكمال الجملة: "我们一起＿＿学习汉语吧！"',
        options: ['努力 (nǔ lì)', '睡觉 (shuì jiào)', '忘记 (wàng jì)', '昨天 (zuó tiān)'],
        correctIndex: 0,
        explanation: '努力 (nǔ lì) means to work hard / make an effort.',
        hskLevel: 'HSK 2',
      },
      {
        id: 'quiz-2',
        questionZh: '下面哪句话语法正确？',
        questionEn: 'Which sentence uses 越来越 correctly?',
        questionAr: 'أي جملة تستخدم 越来越 بشكل صحيح؟',
        options: [
          '他的汉语越来越很好。',
          '他的汉语越来越好。',
          '他的汉语很越来越好。',
          '越来越他的汉语好。',
        ],
        correctIndex: 1,
        explanation: 'Do not use 很 with 越来越; say 越来越好.',
        hskLevel: 'HSK 2',
      },
      {
        id: 'quiz-3',
        questionZh: '“值日生” 在教室里负责什么？',
        questionEn: 'What does 值日生 (zhí rì shēng) mean in the classroom?',
        questionAr: 'ماذا تعني كلمة 值日生 داخل الفصل الدراسي؟',
        options: [
          'Student on cleaning/class duty',
          'Final examination paper',
          'University library card',
          'Weekend holiday',
        ],
        correctIndex: 0,
        explanation: '值日生 refers to the students assigned to classroom duty / cleaning.',
        hskLevel: 'HSK 3',
      },
    ],
    assignments: [
      {
        id: 'assign-1',
        title: 'HSK 2 Dialogue Writing & Reading',
        subject: 'Comprehensive Chinese (综合汉语)',
        description: 'Write 6 sentences using 越来越 and 因为…所以…, then practice reading aloud with your team.',
        teacher: 'Teacher (老师)',
        createdAt: getOffsetDateISO(-2),
        deadline: getOffsetDateISO(2),
        status: 'in_progress',
        completedStudentIds: ['stu-01', 'stu-03', 'stu-08', 'stu-14'],
      },
      {
        id: 'assign-2',
        title: 'Lanzhou Campus Vocabulary Sheet',
        subject: 'Speaking & Listening (听说课)',
        description: 'Memorize 15 campus & daily routine words and record pronunciation practice.',
        teacher: 'Teacher (老师)',
        createdAt: getOffsetDateISO(-1),
        deadline: getOffsetDateISO(4),
        status: 'pending',
        completedStudentIds: ['stu-01'],
      },
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Weekly Team Speaking Relay (小组汉语接力赛)',
        category: 'competition',
        date: getOffsetDateISO(2),
        time: '14:30',
        location: 'Room 304 · Lanzhou University of Technology',
        description: 'All 3 teams compete in 3-minute impromptu Chinese dialogues. Winning team earns +5 bonus points.',
        createdBy: 'Li Ankai (李安凯)',
        isPinnedAnnouncement: true,
      },
      {
        id: 'act-2',
        title: 'Chinese Calligraphy & Tea Culture Workshop',
        category: 'cultural',
        date: getOffsetDateISO(5),
        time: '16:00',
        location: 'International Student Center',
        description: 'Practice brush writing Chinese characters and learn classical tea etiquette together.',
        createdBy: 'Teacher (老师)',
      },
      {
        id: 'act-3',
        title: 'Mid-Term Roster & Chinese Name Confirmation',
        category: 'announcement',
        date: today,
        time: '09:00',
        location: 'Classroom Board',
        description: 'Please check your Chinese characters and Pinyin spelling with Class Monitor Li Ankai (李安凯) this week.',
        createdBy: 'Li Ankai (李安凯)',
        isPinnedAnnouncement: true,
      },
    ],
    suggestions: [
      {
        id: 'sug-1',
        category: 'activity',
        title: 'Weekly 10-minute Chinese tongue twister warm-up',
        message: 'Starting Friday classes with a short team tongue twister game would help everyone improve pronunciation.',
        status: 'planned',
        adminReply: 'Great idea! Added to next week’s Friday speaking warm-up.',
        createdAt: getOffsetDateISO(-1) + 'T13:20:00.000Z',
      },
    ],
    rules: [
      {
        id: 'rule-1',
        order: 1,
        en: 'Respect everyone in the classroom — teachers, monitor, and classmates.',
        zh: '尊重课堂上的每一个人——老师、班长和同学。',
        ar: 'احترام الجميع في الفصل الدراسي: المعلم ورائد الصف والزملاء.',
      },
      {
        id: 'rule-2',
        order: 2,
        en: 'Arrive on time before class begins and prepare textbooks in advance.',
        zh: '按时到达教室，课前做好学习准备。',
        ar: 'الحضور في الوقت المحدد قبل بدء الدرس وتجهيز الكتب مسبقاً.',
      },
      {
        id: 'rule-3',
        order: 3,
        en: 'Keep the classroom clean and complete weekly cleaning duties responsibly.',
        zh: '保持教室整洁，认真完成每周值日工作。',
        ar: 'الحفاظ على نظافة الفصل وأداء مهام النظافة الأسبوعية بمسؤولية.',
      },
      {
        id: 'rule-4',
        order: 4,
        en: 'Participate actively in lessons, discussions, and team challenges.',
        zh: '积极参与课堂学习、讨论和小组比赛。',
        ar: 'المشاركة الفعّالة في الدروس والمناقشات ومسابقات الفرق.',
      },
      {
        id: 'rule-5',
        order: 5,
        en: 'Respect classroom equipment, desks, whiteboard, and projector.',
        zh: '爱护教室设备、桌椅、白板及投影设施。',
        ar: 'المحافظة على تجهيزات الفصل والطاولات والسبورة وجهاز العرض.',
      },
      {
        id: 'rule-6',
        order: 6,
        en: 'Practice speaking Chinese daily inside and outside class.',
        zh: '坚持每天在课内外练习说中文。',
        ar: 'ممارسة التحدث باللغة الصينية يومياً داخل الفصل وخارجه.',
      },
      {
        id: 'rule-7',
        order: 7,
        en: 'Help classmates learn and support a positive team spirit.',
        zh: '互帮互助，共同营造积极向上的班级氛围。',
        ar: 'مساعدة الزملاء في التعلم وتعزيز روح الفريق الإيجابية.',
      },
    ],
  };
}
