import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Database,
  Maximize2,
  Minimize2,
  MonitorPlay,
  Printer,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { CLEANING_TASKS, getMondayISO, getTodayISO } from '../data/initialData';
import { Language, NavSection } from '../types/classroom';
import { getTeamTotalScore } from '../utils/helpers';
import { UniversityEmblem } from './Emblem';
import classroomHeroBanner from '../assets/images/classroom_hero_banner_1795317040602.jpg';

interface SlideMeta {
  id: string;
  num: string;
  navAr: string;
  navEn: string;
  navZh: string;
}

const SLIDES: SlideMeta[] = [
  { id: 'cover', num: '01', navAr: 'الافتتاحية والرؤية', navEn: 'Vision & Overview', navZh: '封面与愿景' },
  { id: 'problem', num: '02', navAr: 'المشكلة والحل', navEn: 'Why SMART CLASS', navZh: '痛点与方案' },
  { id: 'architecture', num: '03', navAr: 'الأمان والخصوصية', navEn: 'Local-First & Security', navZh: '本地架构与安全' },
  { id: 'teacher', num: '04', navAr: 'دليل الأستاذة', navEn: 'For the Teacher', navZh: '老师使用指南' },
  { id: 'monitor', num: '05', navAr: 'دليل مراقب الصف', navEn: 'For Class Monitor', navZh: '班长管理指南' },
  { id: 'students', num: '06', navAr: 'فائدة الطلاب', navEn: 'For Students', navZh: '学生每日受益' },
  { id: 'cleaning-picker', num: '07', navAr: 'النظافة والقرعة', navEn: 'Cleaning & Wheel', navZh: '值日与随机抽选' },
  { id: 'teams-chinese', num: '08', navAr: 'الفرق وتعلم الصينية', navEn: 'Teams & Chinese', navZh: '小组与中文角' },
  { id: 'impact', num: '09', navAr: 'الأثر وتحسين الصف', navEn: 'Classroom Impact', navZh: '班级提升成效' },
  { id: 'demo', num: '10', navAr: 'التجربة الحية', navEn: 'Live Demo Launch', navZh: '现场演示入口' },
];

export const PlatformShowcaseDeck: React.FC = () => {
  const {
    state,
    language,
    setLanguage,
    setActiveSection,
    setPresentationMode,
  } = useClassroom();

  const [slideIndex, setSlideIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const totalSlides = SLIDES.length;
  const isAr = language === 'ar';
  const isZh = language === 'zh';

  const pickText = (ar: string, en: string, zh: string) =>
    isAr ? ar : isZh ? zh : en;

  const goNext = useCallback(() => {
    setSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
        return;
      }
      if (e.key === 'ArrowRight') {
        if (isAr) goPrev();
        else goNext();
      } else if (e.key === 'ArrowLeft') {
        if (isAr) goNext();
        else goPrev();
      } else if (e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'BUTTON' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          goNext();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen, goNext, goPrev, isAr]);

  // Live state metrics so the presentation always reflects actual classroom data
  const activeStudents = state.students.filter((s) => s.active);
  const todayISO = getTodayISO();
  const todayAtt = state.attendanceHistory.find((a) => a.date === todayISO);
  let presentCount = activeStudents.length;
  if (todayAtt) {
    presentCount = activeStudents.filter(
      (s) => todayAtt.records[s.id] === 'present' || todayAtt.records[s.id] === 'late'
    ).length;
  }
  const mondayISO = getMondayISO();
  const currentCleaning =
    state.cleaningSchedules.find((w) => w.weekStart === mondayISO) ||
    [...state.cleaningSchedules].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
  const cleaningDoneCount = currentCleaning
    ? currentCleaning.assignments.filter((a) => a.completed).length
    : 0;
  const rankedTeams = [...state.teams]
    .map((tm) => ({
      ...tm,
      membersCount: activeStudents.filter((s) => s.teamId === tm.id).length,
      totalScore: getTeamTotalScore(tm, state.students),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const jumpToFeature = (section: NavSection) => {
    setFullscreen(false);
    setActiveSection(section);
  };

  const currentMeta = SLIDES[slideIndex];

  const renderSlideBody = () => {
    switch (currentMeta.id) {
      case 'cover':
        return (
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#C9972C]">
                  <span>{state.settings.universityName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{state.settings.universityNameZh}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{state.settings.semesterLabel}</span>
                </div>

                <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  {pickText(
                    'منصة SMART CLASS – 智慧班级 لإدارة صف اللغة الصينية',
                    'SMART CLASS – 智慧班级 Classroom Management Platform',
                    'SMART CLASS – 智慧班级 国际中文智慧班级平台'
                  )}
                </h2>

                <p className={`text-base leading-relaxed sm:text-lg ${fullscreen ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'منظومة رقمية متكاملة صُممت خصيصاً لصف اللغة الصينية الدولي في جامعة لانتشو للتكنولوجيا، لرفع جودة التنظيم، العدالة في المهام، والتفاعل التعليمي اليومي.',
                    'A dedicated digital classroom platform built for our international Chinese language class at Lanzhou University of Technology to unify organization, fairness, and daily language growth.',
                    '专为兰州理工大学国际中文班级打造的一体化智慧管理平台，让考勤、值日、竞赛与中文学习更高效、更公平。'
                  )}
                </p>
              </div>

              <div className={`grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-4 ${fullscreen ? 'border-white/15' : 'border-slate-200 dark:border-slate-800'}`}>
                <div>
                  <div className="text-xs opacity-70">{pickText('الطلاب المسجلون', 'Students', '班级人数')}</div>
                  <div className="mt-1 font-display text-2xl font-bold tabular-nums text-[#C9972C]">
                    {activeStudents.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70">{pickText('الفرق المتوازنة', 'Teams', '学习小组')}</div>
                  <div className="mt-1 font-display text-2xl font-bold tabular-nums text-[#C9972C]">
                    {state.teams.length} (6/6/5)
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70">{pickText('مراقب الصف', 'Monitor', '班长')}</div>
                  <div className="mt-1 text-sm font-bold">{state.settings.monitorName}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">{pickText('اللغات المدعومة', 'Languages', '支持语言')}</div>
                  <div className="mt-1 text-sm font-bold">AR · EN · 中文</div>
                </div>
              </div>
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-slate-200/20 bg-[#0F2342] lg:col-span-5">
              <img
                src={classroomHeroBanner}
                alt="SMART CLASS Lanzhou University of Technology"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09172E]/90 via-[#09172E]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="text-xs text-[#E8C872]">
                  {pickText('عرض تعريفي للأستاذة والطلاب', 'Prepared for Teacher & Classmates', '向老师与全班同学展示')}
                </div>
                <div className="mt-1 font-display text-lg font-bold">
                  {state.settings.classroomName} · {state.settings.classroomNameZh}
                </div>
              </div>
            </div>
          </div>
        );

      case 'problem':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('02 · لماذا بنينا هذا الموقع؟', '02 · The Classroom Challenge', '02 · 为什么要建立这个平台？')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'من الفوضى والملفات المتفرقة إلى نظام صفي ذكي وشفاف',
                  'Moving from Scattered Notes to One Transparent Classroom Hub',
                  '告别零散记录，打造透明高效的统一班级中枢'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className={`rounded-xl border p-6 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'}`}>
                <h3 className="font-display text-lg font-bold text-rose-500">
                  {pickText('التحديات السابقة في الصف', 'Before SMART CLASS', '过去面临的痛点')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                  <li>
                    <span className="font-semibold">1. </span>
                    {pickText(
                      'ضغط المتابعة الورقية اليومية للحضور والغياب والتأخير وغياب الإحصائيات الشهرية الفورية.',
                      'Manual attendance sheets made monthly punctuality tracking slow and hard to summarize.',
                      '纸质考勤耗时且难以快速统计出勤率与迟到趋势。'
                    )}
                  </li>
                  <li>
                    <span className="font-semibold">2. </span>
                    {pickText(
                      'نسيان أدوار النظافة الأسبوعية أو تكرار نفس الطلاب دون سجل عادل وواضح.',
                      'Weekly cleaning duties lacked automatic fair rotation and task completion history.',
                      '每周值日容易重复或遗漏，缺乏透明公平的轮换记录。'
                    )}
                  </li>
                  <li>
                    <span className="font-semibold">3. </span>
                    {pickText(
                      'ضياع الواجبات والإعلانات والكلمات الجديدة وسط رسائل الدردشة اليومية.',
                      'Homework deadlines, new Chinese vocabulary, and announcements got buried in chat groups.',
                      '作业截止日期、每日词汇和通知容易在群聊中被刷屏淹没。'
                    )}
                  </li>
                  <li>
                    <span className="font-semibold">4. </span>
                    {pickText(
                      'اختيار الطلاب للأسئلة أو العرض بشكل عشوائي يدوي قد يسبب تكرار نفس الأسماء.',
                      'Manual student selection risked calling the same students repeatedly.',
                      '课堂提问手动点名不够随机，容易重复提问同一批同学。'
                    )}
                  </li>
                </ul>
              </div>

              <div className={`rounded-xl border p-6 ${fullscreen ? 'border-[#C9972C]/50 bg-[#16325C]/60' : 'border-[#0F2342]/20 bg-[#0F2342] text-white dark:border-[#C9972C]/40'}`}>
                <h3 className="font-display text-lg font-bold text-[#E8C872]">
                  {pickText('الحل الذي تقدمه SMART CLASS', 'With SMART CLASS', 'SMART CLASS 的解决方案')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-100">
                  <li>
                    <span className="font-semibold text-[#E8C872]">1. </span>
                    {pickText(
                      'تسجيل حضور بضغطة زر مع إحصائيات يومية وشهرية جاهزة للطباعة أو Excel.',
                      'One-click daily attendance with automatic rates and instant Excel/PDF reports.',
                      '一键记录每日考勤，自动生成出勤统计与 Excel/PDF 报表。'
                    )}
                  </li>
                  <li>
                    <span className="font-semibold text-[#E8C872]">2. </span>
                    {pickText(
                      'توزيع آلي وعادل لـ 7 مهام نظافة أسبوعية مع تتبع الإنجاز واستبعاد الغائبين أو المعذورين.',
                      'Automated weekly rotation across 7 cleaning tasks with completion checkboxes and fair exclusions.',
                      '7项值日任务自动公平轮换，支持完成勾选和临时豁免。'
                    )}
                  </li>
                  <li>
                    <span className="font-semibold text-[#E8C872]">3. </span>
                    {pickText(
                      'لوحة موحدة للواجبات، كلمة اليوم الصينية، اختبارات HSK، ونطق صوتي مباشر.',
                      'Central hub for homework, Word of the Day, HSK quizzes, and Chinese audio pronunciation.',
                      '集中展示作业、每日一词、HSK 测验及中文语音朗读。'
                    )}
                  </li>
                  <li>
                    <span className="font-semibold text-[#E8C872]">4. </span>
                    {pickText(
                      'عجلة قرعة متحركة بـ 6 أوضاع مع خيار عدم التكرار واستبعاد الغائبين اليوم.',
                      'Animated 6-mode random wheel with No-Repeat mode and absent-student exclusion.',
                      '6种模式动画抽选转盘，支持不重复模式和排除今日缺勤同学。'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('03 · التصميم، الخصوصية، والاعتمادية', '03 · Architecture, Privacy & Zero Cost', '03 · 架构设计、隐私与零成本')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'منصة سريعة وآمنة 100% — مجانية بالكامل وتعمل محلياً بثلاث لغات',
                  '100% Free Static Web App — Local-First Storage & Role PIN Protection',
                  '100% 免费纯前端静态应用 — 本地存储与分级安全保护'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <Database className="h-6 w-6 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('حفظ تلقائي محلي + نسخ احتياطي JSON', 'Auto-Save + JSON Backup', '本地自动保存 + JSON 备份')}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'جميع بيانات الصف تُحفظ تلقائياً في المتصفح (localStorage) بدون اشتراكات أو قواعد بيانات خارجية، مع إمكانية تصدير واستيراد نسخة احتياطية JSON في ثوانٍ.',
                    'All records auto-save locally in the browser with zero external server costs, plus 1-click JSON backup export and import.',
                    '所有班级数据自动保存在浏览器本地，无需付费服务器，支持一键导出与恢复 JSON 备份。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <ShieldCheck className="h-6 w-6 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('3 مستويات صلاحيات محمية برمز PIN', '3 Role-Based Permission Tiers', '三级权限与本地 PIN 密码')}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'الوضع الافتراضي آمن للطلاب (للقراءة والمشاركة فقط)، بينما تتطلب صلاحيات الأستاذة ومراقب الصف إعداد رمز PIN خاص من أول استخدام.',
                    'Defaults to safe Student View; Teacher and Monitor admin controls require locally configured PINs with no hardcoded defaults.',
                    '默认处于安全的学生只读视图，老师与班长权限需首次自行设置独立 PIN 密码。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <BookOpen className="h-6 w-6 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('واجهة ثلاثية اللغات مع دعم RTL', 'Trilingual Interface (AR / EN / ZH)', '三语切换与阿拉伯语 RTL 支持')}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'التبديل الفوري بين العربية (RTL)، الإنجليزية، والصينية لتسهيل استخدام الموقع على الأستاذة والطلاب الدوليين في أي وقت.',
                    'Instant switching across Arabic (full RTL layout), English, and Simplified Chinese, plus Light & Dark themes.',
                    '支持阿拉伯语（RTL 排版）、英文和简体中文实时切换，并提供日间/夜间双主题。'
                  )}
                </p>
              </div>
            </div>

            <div className={`rounded-xl border p-4 text-sm ${fullscreen ? 'border-white/15 bg-white/5 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300'}`}>
              <span className="font-semibold text-[#C9972C]">
                {pickText('البيانات الحية الآن: ', 'Live Classroom Snapshot: ', '当前实时班级数据：')}
              </span>
              <span className="tabular-nums">
                {activeStudents.length} {pickText('طالب', 'students', '名学生')} · {state.lessons.length} {pickText('درس ومفردة', 'Chinese lessons', '条中文词条')} · {state.quizzes.length} {pickText('سؤال اختبار', 'quiz questions', '道测验题')} · {state.assignments.length} {pickText('واجبات', 'assignments', '项作业')}
              </span>
            </div>
          </div>
        );

      case 'teacher':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('04 · كيف تستخدم الأستاذة المنصة؟', '04 · Teacher Workflow Guide', '04 · 老师如何使用本平台？')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'أدوات دقيقة للأستاذة لمتابعة الحضور، الواجبات، ومستوى تعلم الصينية',
                  'Streamlined Tools for Attendance, Lessons, Assignments & Student Insights',
                  '助力老师高效管理考勤、作业、中文教学与表现评估'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex items-center gap-2 font-display text-base font-bold text-[#C9972C]">
                  <ShieldCheck className="h-5 w-5" />
                  <span>{pickText('1. الدخول السريع بصلاحية المعلم (老师)', '1. Unlock Teacher Role via PIN', '1. 通过老师 PIN 解锁管理权限')}</span>
                </div>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'من الزر العلوي "تبديل الصلاحية" تختار الأستاذة دور المعلم وتدخل رمز PIN الخاص بها لتفعيل كافة أدوات الإدارة المشتركة.',
                    'Click Switch Role in the top bar, select Teacher (老师), and enter your personal PIN to unlock shared administration.',
                    '点击右上角“切换身份”，选择“老师”并输入专属 PIN，即可开启全部教学管理功能。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex items-center gap-2 font-display text-base font-bold text-[#C9972C]">
                  <CalendarCheck className="h-5 w-5" />
                  <span>{pickText('2. تسجيل الحضور اليومي في ثوانٍ', '2. Daily Attendance & Punctuality', '2. 秒级记录每日课堂考勤')}</span>
                </div>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'زر "تحديد الكل حاضر" ثم تعديل حالات المتأخر أو الغائب أو المعذور فقط، مع ظهور نسبة الحضور تلقائياً للجميع.',
                    'Mark all present with one click, adjust late/absent/excused statuses, and view monthly attendance percentages instantly.',
                    '支持“一键全员出勤”，仅需微调迟到/缺勤/请假状态，月度出勤率自动计算。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex items-center gap-2 font-display text-base font-bold text-[#C9972C]">
                  <BookOpen className="h-5 w-5" />
                  <span>{pickText('3. نشر كلمة اليوم والواجبات والإعلانات', '3. Word of the Day, Homework & Notices', '3. 发布每日一词、作业与公告')}</span>
                </div>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'إضافة كلمات HSK مع النطق والمثال والترجمة العربية/الإنجليزية، وتحديد مواعيد تسليم الواجبات وتثبيت الإعلانات المهمة.',
                    'Publish HSK vocabulary, grammar tips, homework deadlines with student completion tracking, and pinned announcements.',
                    '添加 HSK 词汇、语法重点和作业截止日期，并可追踪每位同学的完成情况。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex items-center gap-2 font-display text-base font-bold text-[#C9972C]">
                  <BarChart3 className="h-5 w-5" />
                  <span>{pickText('4. تقييم الأداء وتصدير التقارير', '4. Performance Scoring & Reports', '4. 表现评估与报表导出')}</span>
                </div>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'منح نقاط تحفيزية للطلاب أو الفرق، اختيار "طالب الأسبوع"، ومراجعة تقارير الأداء أو تصديرها بصيغة Excel / PDF.',
                    'Award points or badges, feature Student of the Week, and export comprehensive attendance, cleaning, and points reports.',
                    '为学生或小组加分颁奖、评选每周之星，并一键导出 Excel 或 PDF 统计报告。'
                  )}
                </p>
              </div>
            </div>
          </div>
        );

      case 'monitor':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('05 · دور مراقب الصف (班长)', '05 · Class Monitor Workflow', '05 · 班长日常管理流程')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  `كيف يدير مراقب الصف (${state.settings.monitorName}) التنظيم اليومي؟`,
                  `How Class Monitor (${state.settings.monitorName}) Runs Daily Operations`,
                  `班长（${state.settings.monitorName}）如何高效管理班级事务？`
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <Users className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('إدارة قاعدة بيانات الـ 17 طالباً', '17-Student Registry & Profiles', '17名学生档案维护')}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'تعديل أسماء الطلاب بالصينية والـ Pinyin والإنجليزية بدقة، إضافة طلاب جدد، وتوزيعهم على الفرق الـ 3 المتوازنة (6 / 6 / 5).',
                    'Maintain exact Chinese characters, Pinyin, and English spellings for all 17 students, add newcomers, and balance the 3 teams (6/6/5).',
                    '完善17位同学的中文名、拼音与英文信息，维护 6/6/5 均衡小组配置。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <Sparkles className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('جدول النظافة والتنسيق الميداني', 'Weekly Cleaning & Task Checkoff', '每周值日排班与验收')}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'توليد جدول الأسبوع بضغطة زر دون تكرار غير عادل، تعديل المهام عند الحاجة، استبعاد طالب مؤقتاً عند العذر، وتوثيق إنجاز المهام.',
                    'Auto-generate fair weekly schedules avoiding consecutive repeats, temporarily exclude excused students, and check off completed tasks.',
                    '一键生成公平值日表避免连续重复，支持临时请假豁免与完成情况打勾记录。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <Shuffle className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('القرعة، صندوق المقترحات، والنسخ الاحتياطي', 'Wheel, Feedback & Backups', '随机抽选、意见箱与备份')}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'تشغيل العجلة العشوائية أمام الصف على البروجكتر، متابعة مقترحات الطلاب المجهولة والرد عليها، وحفظ نسخة JSON أسبوعية.',
                    'Run the Random Picker wheel live on the projector, respond to anonymous student suggestions, and archive regular JSON backups.',
                    '在投影仪上运行随机抽选转盘，回复匿名意见箱，并定期导出 JSON 备份文件。'
                  )}
                </p>
              </div>
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('06 · كيف يستفيد الطلاب يومياً؟', '06 · Student Experience & Benefits', '06 · 学生如何每日使用并受益？')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'بوابة واضحة للطلاب للالتزام، المنافسة الإيجابية، وممارسة الصينية',
                  'A Clear Daily Companion for Responsibility, Fair Competition & Chinese Practice',
                  '清晰易用的每日学习助手：明确职责、良性竞赛、轻松学中文'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <CheckCircle2 className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('معرفة الواجبات ومهمة النظافة فوراً', 'Zero Confusion on Duties & Deadlines', '值日与作业一目了然')}
                </h3>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'يعرف كل طالب متى دوره في النظافة وما مهمته بالضبط، وما هي الواجبات والأنشطة القادمة دون البحث في مئات الرسائل.',
                    'Every student immediately sees this week’s cleaning role, upcoming assignments, and class events without scrolling through chat history.',
                    '每位同学都能快速查看本周值日任务、近期作业与班级活动，不再遗漏通知。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <Trophy className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('متابعة النقاط والأوسمة وترتيب الفريق', 'Track Team Rankings, Points & Badges', '查看个人积分、徽章与小组排名')}
                </h3>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'الشفافية في النقاط تشجع على الحضور المبكر، التحدث بالصينية داخل الفصل، والتعاون بين أعضاء الفريق الواحد.',
                    'Transparent points and 5 achievement badges motivate punctual attendance, cooperation, and active Chinese speaking.',
                    '公开透明的积分与5项荣誉徽章激励按时出勤、积极发言与团队协作。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <BookOpen className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('مراجعة الصينية والنطق الصوتي واختبارات HSK', 'Self-Practice with Audio & HSK Quizzes', '语音跟读与 HSK 互动自测')}
                </h3>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'إمكانية الاستماع إلى نطق كلمة اليوم والمفردات، قراءة الأمثلة بالصينية والعربية والإنجليزية، واختبار الفهم عبر الاختبارات التفاعلية.',
                    'Listen to Chinese pronunciation, study example sentences in Chinese/English/Arabic, and test mastery with interactive quizzes.',
                    '一键听取中文朗读，对照中英阿三语例句学习，并随时完成互动小测验。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <UserCheck className="h-5 w-5 text-[#C9972C]" />
                <h3 className="mt-3 font-display text-base font-bold">
                  {pickText('صندوق المقترحات المجهول + قواعد الصف', 'Anonymous Voice & Clear Class Charter', '匿名建议箱与三语班级公约')}
                </h3>
                <p className={`mt-2 text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {pickText(
                    'أي طالب يستطيع إرسال اقتراح نشاط أو فكرة تحسين بسرية تامة، والرجوع لقواعد الصف المترجمة للغات الثلاث.',
                    'Students can submit improvement ideas or activity requests anonymously and review classroom rules in Arabic, English, or Chinese.',
                    '学生可匿名提出班级建议或活动想法，并随时查阅三语对照的班级公约。'
                  )}
                </p>
              </div>
            </div>
          </div>
        );

      case 'cleaning-picker':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('07 · نظام النظافة الأسبوعي والعجلة العشوائية', '07 · Weekly Cleaning Rotation & Random Picker', '07 · 每周值日轮换与随机抽选转盘')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'عدالة كاملة في توزيع المهام والاختيار داخل الصف',
                  'Built-In Fairness for Classroom Care and Live Participation',
                  '用系统化机制保障值日公平与课堂抽选公正'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className={`rounded-xl border p-6 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">
                    {pickText('7 مهام نظافة أسبوعية (值日生)', '7 Weekly Cleaning Tasks (值日生)', '7项每周值日任务（值日生）')}
                  </h3>
                  <span className="font-mono-tabular text-xs font-semibold text-[#C9972C]">
                    {cleaningDoneCount}/{CLEANING_TASKS.length} {pickText('منجز', 'done', '已完成')}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {[
                    pickText('1. كنس الأرضية', '1. Sweeping floor', '1. 扫地'),
                    pickText('2. مسح الأرضية', '2. Mopping floor', '2. 拖地'),
                    pickText('3. تنظيف السبورة', '3. Cleaning whiteboard', '3. 擦白板'),
                    pickText('4. ترتيب الطاولات والكراسي', '4. Organizing desks', '4. 整理桌椅'),
                    pickText('5. إفراغ سلة المهملات', '5. Emptying trash', '5. 倒垃圾'),
                    pickText('6. تنظيف النوافذ', '6. Cleaning windows', '6. 擦窗户'),
                    pickText('7. ترتيب مستلزمات الفصل', '7. Organizing supplies', '7. 整理班级物品'),
                  ].map((task) => (
                    <div
                      key={task}
                      className={`rounded-lg border px-3 py-2 ${fullscreen ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'}`}
                    >
                      {task}
                    </div>
                  ))}
                </div>
                <p className={`mt-4 text-xs ${fullscreen ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {pickText(
                    'يشمل: منع التكرار غير العادل + سجل تاريخي + إحصائيات شهرية + استبعاد مؤقت عند العذر.',
                    'Includes non-consecutive rotation, historical archive, monthly stats, and temporary student exclusion.',
                    '支持防连续重复、历史归档、月度统计及临时豁免。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-6 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <h3 className="font-display text-lg font-bold">
                  {pickText('6 أوضاع للقرعة المتحركة (随机抽选)', '6 Modes in the Random Picker Wheel', '随机抽选转盘（6种模式）')}
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
                  {[
                    pickText('طالب عشوائي', 'Random Student', '随机学生'),
                    pickText('فريق عشوائي', 'Random Team', '随机小组'),
                    pickText('مهمة نظافة', 'Cleaning Assignment', '随机值日'),
                    pickText('سؤال صيني', 'Chinese Question', '随机中文题'),
                    pickText('متحدث للعرض', 'Presentation Speaker', '随机演讲人'),
                    pickText('نشاط صفي', 'Classroom Activity', '随机班级活动'),
                  ].map((mode) => (
                    <div
                      key={mode}
                      className={`rounded-lg border px-3 py-2.5 font-medium ${fullscreen ? 'border-[#C9972C]/35 bg-[#16325C]/50 text-white' : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200'}`}
                    >
                      {mode}
                    </div>
                  ))}
                </div>
                <p className={`mt-4 text-xs ${fullscreen ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {pickText(
                    'يدعم استبعاد الغائبين اليوم + عدم التكرار + عرض النتيجة فوراً على شاشة العرض الكبيرة.',
                    'Supports Exclude Absent Today, No-Repeat Mode, and 1-click Projector Spotlight.',
                    '支持排除今日缺勤、不重复抽选，以及一键投屏展示结果。'
                  )}
                </p>
              </div>
            </div>
          </div>
        );

      case 'teams-chinese':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('08 · الفرق المتوازنة ومركز تعلم الصينية', '08 · Balanced Teams & Chinese Learning Corner', '08 · 小组竞赛与中文学习角')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'ربط التحفيز الجماعي بالتطور اللغوي اليومي',
                  'Connecting Team Spirit Directly to Chinese Language Mastery',
                  '将团队荣誉感转化为每日中文进步动力'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className={`rounded-xl border p-6 lg:col-span-6 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <h3 className="font-display text-lg font-bold">
                  {pickText('الفرق الـ 3 (توزيع 6 / 6 / 5)', '3 Balanced Teams (6 / 6 / 5)', '3支均衡学习小组（6 / 6 / 5）')}
                </h3>
                <div className="mt-4 space-y-3">
                  {rankedTeams.map((tm, idx) => (
                    <div
                      key={tm.id}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${fullscreen ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'}`}
                    >
                      <div>
                        <div className="font-semibold">
                          #{idx + 1} {tm.name} · {tm.chineseName}
                        </div>
                        <div className={`text-xs ${fullscreen ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {tm.membersCount} {pickText('طلاب', 'members', '名成员')} · {tm.motto}
                        </div>
                      </div>
                      <div className="font-mono-tabular text-xl font-bold text-[#C9972C]">
                        {tm.totalScore}
                      </div>
                    </div>
                  ))}
                </div>
                <p className={`mt-4 text-xs ${fullscreen ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {pickText(
                    '7 معايير للتقييم: التحدث بالصينية، المفردات، القواعد، الحضور، النظافة، التعاون، والمشاركة.',
                    '7 scoring dimensions: Chinese speaking, Vocabulary, Grammar, Attendance, Cleanliness, Cooperation & Participation.',
                    '7大竞赛维度：中文口语、词汇、语法、考勤、班级卫生、团队合作与课堂参与。'
                  )}
                </p>
              </div>

              <div className={`rounded-xl border p-6 lg:col-span-6 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <h3 className="font-display text-lg font-bold">
                  {pickText('مركز تعلم الصينية (中文学习角)', 'Chinese Learning Center (中文学习角)', '中文学习角（每日提升）')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                  <li>
                    <Award className="me-2 inline h-4 w-4 text-[#C9972C]" />
                    {pickText(
                      'كلمة اليوم (Word of the Day): تظهر في الصفحة الرئيسية ووضع البروجكتر بالرموز والـ Pinyin والمعنى والأمثلة.',
                      'Word of the Day pinned to the Dashboard & Projector with Hanzi, Pinyin, meanings, and bilingual examples.',
                      '每日一词直接展示在首页与投影模式中，包含汉字、拼音、多语释义与例句。'
                    )}
                  </li>
                  <li>
                    <BookOpen className="me-2 inline h-4 w-4 text-[#C9972C]" />
                    {pickText(
                      'بطاقات مفردات وقواعد مصنفة بمستويات HSK مع نطق صوتي مباشر داخل المتصفح.',
                      'HSK-leveled vocabulary & grammar cards with built-in Chinese speech pronunciation.',
                      '按 HSK 等级整理的词汇与语法卡片，内置浏览器中文朗读发音。'
                    )}
                  </li>
                  <li>
                    <CheckCircle2 className="me-2 inline h-4 w-4 text-[#C9972C]" />
                    {pickText(
                      'اختبارات تفاعلية فورية مع الشرح لتثبيت الدروس وتشجيع الطلاب على الممارسة.',
                      'Instant self-check quizzes with explanations so students reinforce each lesson actively.',
                      '附带解析的互动小测验，帮助同学即时巩固课堂所学内容。'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'impact':
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('09 · كيف يُحسّن الموقع من مستوى الصف؟', '09 · How SMART CLASS Elevates Classroom Performance', '09 · 平台如何全面提升班级水平？')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'أثر ملموس في الانضباط، النظافة، التفاعل، ومهارة اللغة الصينية',
                  'Measurable Improvements in Punctuality, Cleanliness, Engagement & Chinese Fluency',
                  '在出勤纪律、环境卫生、课堂参与与中文能力上的四大提升'
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  metric: `${presentCount}/${activeStudents.length}`,
                  title: pickText('رفع الالتزام والحضور', 'Stronger Punctuality', '提高出勤与守时率'),
                  desc: pickText(
                    'وضوح سجل الحضور اليومي والشهري يقلل التأخير والغياب غير المبرر.',
                    'Visible daily and monthly attendance records encourage on-time arrival.',
                    '透明的每日与月度考勤统计促进准时到课。',
                  ),
                },
                {
                  metric: '7 / 7',
                  title: pickText('استدامة نظافة الفصل', 'Consistent Cleanliness', '持久整洁的教室环境'),
                  desc: pickText(
                    'التوزيع العادل بدون تكرار والتأكيد بالعلامات يضمن جاهزية القاعة يومياً.',
                    'Fair task rotation and completion checkoffs keep the classroom spotless every week.',
                    '公平轮换与完成打卡让教室每天保持整洁有序。',
                  ),
                },
                {
                  metric: '100%',
                  title: pickText('مشاركة عادلة للجميع', 'Equal Participation', '全员公平参与课堂'),
                  desc: pickText(
                    'القرعة الذكية تمنح كل طالب فرصة للتحدث والإجابة دون حرج أو تحيز.',
                    'No-repeat random selection ensures all 17 students practice speaking equally.',
                    '不重复随机抽选让全部17位同学平等获得开口机会。',
                  ),
                },
                {
                  metric: 'AR·EN·ZH',
                  title: pickText('تسريع تعلم الصينية', 'Faster Chinese Growth', '加速中文听说读写提升'),
                  desc: pickText(
                    'الربط اليومي بين كلمة اليوم، الاختبارات، ونقاط التحدث بالصينية داخل الصف.',
                    'Daily exposure to Word of the Day, quizzes, and Chinese speaking points accelerates fluency.',
                    '每日词汇、小测验与口语积分机制持续提升中文应用能力。',
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl border p-5 ${fullscreen ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
                >
                  <div className="font-mono-tabular text-2xl font-bold text-[#C9972C]">
                    {item.metric}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold">{item.title}</h3>
                  <p className={`mt-2 text-xs leading-relaxed ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'demo':
      default:
        return (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#C9972C]">
                {pickText('10 · التطبيق العملي المباشر والختام', '10 · Live Interactive Demo & Next Steps', '10 · 现场功能演示与总结')}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-balance sm:text-3xl">
                {pickText(
                  'لنجرّب المنصة عملياً الآن أمام الأستاذة والطلاب!',
                  'Explore Any Live Module Directly from This Presentation',
                  '欢迎老师和同学们现场体验各核心模块！'
                )}
              </h2>
              <p className={`mt-2 max-w-2xl text-sm ${fullscreen ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                {pickText(
                  'اضغط على أي قسم أدناه للانتقال الفوري أثناء العرض، أو افتح وضع البروجكتر لعرض لوحة الصف الكاملة.',
                  'Select any live section below to demonstrate it during your presentation, or launch full-screen Classroom Projector Mode.',
                  '点击下方任意模块即可现场演示，或开启全屏教室投影模式查看班级实时总览。'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  section: 'attendance' as NavSection,
                  icon: CalendarCheck,
                  label: pickText('فتح سجل الحضور اليومي', 'Open Daily Attendance', '打开每日考勤'),
                },
                {
                  section: 'cleaning' as NavSection,
                  icon: Sparkles,
                  label: pickText('فتح جدول النظافة الأسبوعي', 'Open Weekly Cleaning', '打开每周值日'),
                },
                {
                  section: 'picker' as NavSection,
                  icon: Shuffle,
                  label: pickText('تشغيل عجلة الاختيار العشوائي', 'Launch Random Picker Wheel', '演示随机抽选转盘'),
                },
                {
                  section: 'chinese' as NavSection,
                  icon: BookOpen,
                  label: pickText('فتح مركز تعلم الصينية', 'Open Chinese Center', '打开中文学习角'),
                },
                {
                  section: 'teams' as NavSection,
                  icon: Trophy,
                  label: pickText('عرض ترتيب الفرق الـ 3', 'View 3 Team Rankings', '查看小组积分榜'),
                },
                {
                  section: 'reports' as NavSection,
                  icon: BarChart3,
                  label: pickText('عرض التقارير والتصدير', 'View Reports & Exports', '查看统计与导出'),
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.section}
                    type="button"
                    onClick={() => jumpToFeature(action.section)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-start text-sm font-semibold transition-colors ${
                      fullscreen
                        ? 'border-white/15 bg-white/5 text-white hover:border-[#C9972C] hover:bg-white/10'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-[#0F2342] hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-[#C9972C]'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[#C9972C]" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 ${fullscreen ? 'border-[#C9972C]/50 bg-[#16325C]/70' : 'border-slate-200 bg-[#0F2342] text-white dark:border-slate-800'}`}>
              <div>
                <div className="font-display text-lg font-bold text-white">
                  SMART CLASS – 智慧班级 · Lanzhou University of Technology
                </div>
                <div className="mt-1 text-xs text-[#E8C872]">
                  {pickText(
                    'معاً نتعلم، ومعاً نتطور — شكراً للأستاذة والزملاء على حسن الاستماع.',
                    'Together We Learn, Together We Improve — Thank you Teacher and Classmates.',
                    '共同学习，共同进步 — 感谢老师与各位同学的聆听。'
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFullscreen(false);
                  setPresentationMode(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C9972C] px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-[#d8a73d] whitespace-nowrap shrink-0"
              >
                <MonitorPlay className="h-4 w-4" />
                {pickText('تشغيل وضع البروجكتر المباشر', 'Launch Live Projector Mode', '开启实时投影模式')}
              </button>
            </div>
          </div>
        );
    }
  };

  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[#09172E] p-5 text-white sm:p-8 lg:p-10'
    : 'space-y-5';

  const cardSurfaceClasses = fullscreen
    ? 'mx-auto w-full max-w-6xl flex-1 py-4'
    : 'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900';

  return (
    <div className={containerClasses}>
      {/* Top Deck Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 ${
          fullscreen
            ? 'mx-auto w-full max-w-6xl border-b border-white/15 pb-4'
            : 'rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <UniversityEmblem className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#C9972C]">
              {state.settings.universityName} · {state.settings.universityNameZh}
            </div>
            <h1 className="truncate font-display text-base font-bold sm:text-lg">
              {pickText(
                'العرض التعريفي لمنصة SMART CLASS – 智慧班级',
                'SMART CLASS – 智慧班级 Presentation Deck',
                'SMART CLASS – 智慧班级 平台介绍演示文稿'
              )}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {fullscreen && (
            <div className="flex items-center rounded-lg border border-white/20 bg-white/5 p-0.5">
              {(['ar', 'en', 'zh'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    language === lang
                      ? 'bg-[#C9972C] text-slate-950'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ar' ? 'عربي' : '中文'}
                </button>
              ))}
            </div>
          )}

          <span className="font-mono-tabular px-2 text-xs font-semibold opacity-80">
            {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>

          <button
            type="button"
            onClick={() => window.print()}
            className={`no-print inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              fullscreen
                ? 'border-white/20 bg-white/5 text-white hover:bg-white/15'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            {pickText('طباعة / PDF', 'Print / PDF', '打印 / PDF')}
          </button>

          <button
            type="button"
            onClick={() => setFullscreen((prev) => !prev)}
            className="no-print inline-flex items-center gap-1.5 rounded-lg bg-[#C9972C] px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-[#d8a73d] whitespace-nowrap shrink-0"
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {fullscreen
              ? pickText('خروج من ملء الشاشة', 'Exit Fullscreen', '退出全屏')
              : pickText('عرض ملء الشاشة', 'Fullscreen Slides', '全屏放映')}
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className={cardSurfaceClasses}>
        {renderSlideBody()}
      </div>

      {/* Bottom Controls & Slide Index */}
      <div
        className={`no-print flex flex-wrap items-center justify-between gap-4 ${
          fullscreen
            ? 'mx-auto w-full max-w-6xl border-t border-white/15 pt-4'
            : 'rounded-xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {SLIDES.map((s, idx) => {
            const active = idx === slideIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlideIndex(idx)}
                title={pickText(s.navAr, s.navEn, s.navZh)}
                className={`rounded-md px-2.5 py-1.5 font-mono-tabular text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#C9972C] text-slate-950'
                    : fullscreen
                      ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {s.num}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={goPrev}
            disabled={slideIndex === 0}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 ${
              fullscreen
                ? 'border-white/20 bg-white/5 text-white hover:bg-white/15'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
            {pickText('السابق', 'Previous', '上一页')}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={slideIndex === totalSlides - 1}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#16325C] disabled:opacity-40 dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap shrink-0"
          >
            {pickText('التالي', 'Next', '下一页')}
            {isAr ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
