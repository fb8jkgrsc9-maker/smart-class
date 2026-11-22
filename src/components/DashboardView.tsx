import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  MonitorPlay,
  Trophy,
  Users,
  Volume2,
} from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { t } from '../i18n/translations';
import { getTodayISO, getMondayISO } from '../data/initialData';
import { getTeamTotalScore, speakChinese } from '../utils/helpers';
import classroomHeroBanner from '../assets/images/classroom_hero_banner_1795317040602.jpg';

export const DashboardView: React.FC = () => {
  const {
    state,
    isAdmin,
    language,
    setActiveSection,
    setPresentationMode,
    toggleCleaningTaskDone,
  } = useClassroom();

  const [now, setNow] = useState(new Date());
  const [audioMsg, setAudioMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const activeStudents = state.students.filter((s) => s.active);
  const todayISO = getTodayISO();
  const todayRecord = state.attendanceHistory.find((a) => a.date === todayISO);

  let presentCount = 0;
  let lateCount = 0;
  if (todayRecord) {
    activeStudents.forEach((s) => {
      const st = todayRecord.records[s.id];
      if (st === 'present') presentCount++;
      else if (st === 'late') lateCount++;
    });
  } else {
    presentCount = activeStudents.length;
  }
  const attendancePct =
    activeStudents.length === 0
      ? 100
      : Math.round(((presentCount + lateCount * 0.8) / activeStudents.length) * 100);

  const mondayISO = getMondayISO();
  const currentCleaning =
    state.cleaningSchedules.find((w) => w.weekStart === mondayISO) ||
    [...state.cleaningSchedules].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];

  const completedTasks = currentCleaning
    ? currentCleaning.assignments.filter((a) => a.completed).length
    : 0;
  const totalTasks = currentCleaning ? currentCleaning.assignments.length : 7;
  const cleaningPct = totalTasks === 0 ? 100 : Math.round((completedTasks / totalTasks) * 100);

  const sortedTeams = [...state.teams]
    .map((team) => ({
      ...team,
      totalScore: getTeamTotalScore(team, state.students),
      membersCount: activeStudents.filter((s) => s.teamId === team.id).length,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const maxTeamScore = Math.max(1, ...sortedTeams.map((tm) => tm.totalScore));

  const studentOfWeek =
    state.students.find((s) => s.id === state.settings.studentOfTheWeekId) || activeStudents[0];

  const wordOfDay =
    state.lessons.find((l) => l.id === state.settings.wordOfTheDayId) || state.lessons[0];

  const performanceIndex = Math.round(attendancePct * 0.5 + cleaningPct * 0.3 + 20);

  const upcomingAssignments = state.assignments.filter((a) => a.status !== 'completed').slice(0, 3);
  const upcomingActivities = [...state.activities]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const getStudentName = (id: string) =>
    state.students.find((s) => s.id === id)?.displayName || id;

  const handleSpeak = (text: string) => {
    const res = speakChinese(text);
    if (!res.ok) {
      setAudioMsg(res.reason || 'Audio unavailable');
      setTimeout(() => setAudioMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* University Hero Banner */}
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-[#0F2342] text-white dark:border-slate-800">
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
          <div className="flex flex-col justify-between p-6 lg:col-span-7 lg:p-8">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E8C872]">
                <span>{state.settings.universityName}</span>
                <span aria-hidden="true">·</span>
                <span>{state.settings.universityNameZh}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{state.settings.semesterLabel}</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
                {state.settings.classroomName}
              </h1>
              <p className="text-sm text-slate-200">
                {state.settings.classroomNameZh} — {t(language, 'tagline')}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200">
                <span className="font-mono-tabular">
                  {now.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'zh' ? 'zh-CN' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span aria-hidden="true">·</span>
                <span>Monitor: {state.settings.monitorName}</span>
              </div>

              <button
                type="button"
                onClick={() => setPresentationMode(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C9972C] px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-[#d8a73d] whitespace-nowrap shrink-0"
              >
                <MonitorPlay className="h-4 w-4" />
                {t(language, 'projectorMode')}
              </button>
            </div>
          </div>

          <div className="relative min-h-[180px] bg-[#16325C] lg:col-span-5">
            <img
              src={classroomHeroBanner}
              alt="Lanzhou University of Technology international Chinese classroom"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0F2342]/80 via-[#0F2342]/25 to-transparent" />
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t(language, 'totalStudents')}</span>
            <Users className="h-4 w-4 text-[#0F2342] dark:text-[#C9972C]" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {activeStudents.length}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            3 balanced teams · {state.students.filter((s) => !s.excludedFromCleaning).length} cleaning-eligible
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t(language, 'todaysAttendance')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {attendancePct}%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {presentCount} {t(language, 'present')} · {lateCount} {t(language, 'late')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t(language, 'weeklyCleaning')}</span>
            <ClipboardList className="h-4 w-4 text-[#C9972C]" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {completedTasks}/{totalTasks}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {cleaningPct}% completed this week
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t(language, 'classPerformance')}</span>
            <Trophy className="h-4 w-4 text-[#0F2342] dark:text-[#C9972C]" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {performanceIndex}/100
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Attendance · Cleanliness · Engagement
          </p>
        </div>
      </section>

      {/* Main Content Two-Column Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 Columns: Cleaning + Assignments/Activities */}
        <div className="space-y-6 lg:col-span-7">
          {/* Weekly Cleaning Team */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {t(language, 'cleaningTeamTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentCleaning?.weekLabel || 'Current Week'} · 值日生
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('cleaning')}
                className="text-xs font-semibold text-[#0F2342] hover:underline dark:text-[#C9972C] whitespace-nowrap shrink-0"
              >
                Manage Schedule
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {currentCleaning?.assignments.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => toggleCleaningTaskDone(currentCleaning.id, item.id)}
                      className={`mt-0.5 transition-colors ${
                        isAdmin ? 'cursor-pointer' : 'cursor-default opacity-80'
                      }`}
                      title={isAdmin ? 'Toggle task completion' : 'Admin access required to update'}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          item.completed
                            ? 'text-slate-400 line-through dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {t(language, item.taskKey)}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {item.studentIds.map(getStudentName).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium tabular-nums whitespace-nowrap ${
                      item.completed
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {item.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Assignments & Activities */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#C9972C]" />
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {t(language, 'upcomingAssignments')} & {t(language, 'upcomingActivities')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('activities')}
                className="text-xs font-semibold text-[#0F2342] hover:underline dark:text-[#C9972C] whitespace-nowrap shrink-0"
              >
                Open Calendar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t(language, 'upcomingAssignments')}
                </div>
                {upcomingAssignments.length === 0 ? (
                  <p className="text-xs text-slate-500">All current assignments completed.</p>
                ) : (
                  upcomingAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {a.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {a.subject} · Due <span className="font-mono-tabular">{a.deadline}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t(language, 'upcomingActivities')} & {t(language, 'recentAnnouncements')}
                </div>
                {upcomingActivities.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {act.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono-tabular">{act.date}</span> · {act.time} · {act.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right 5 Columns: Word of the Day, Team Rankings, Student of the Week */}
        <div className="space-y-6 lg:col-span-5">
          {/* Chinese Word of the Day */}
          {wordOfDay && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#C9972C]" />
                  <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {t(language, 'wordOfTheDay')}
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {wordOfDay.hskLevel}
                </span>
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-4xl font-bold tracking-tight text-[#0F2342] dark:text-[#E8C872]">
                    {wordOfDay.hanzi}
                  </div>
                  <div className="mt-1 font-mono-tabular text-sm text-slate-600 dark:text-slate-300">
                    {wordOfDay.pinyin}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${wordOfDay.hanzi}。${wordOfDay.exampleZh}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <Volume2 className="h-4 w-4 text-[#C9972C]" />
                  {t(language, 'pronounce')}
                </button>
              </div>

              {audioMsg && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{audioMsg}</p>
              )}

              <div className="mt-4 space-y-1.5 text-sm">
                <div className="text-slate-800 dark:text-slate-200">
                  <span className="text-xs font-medium text-slate-500">EN: </span>
                  {wordOfDay.meaningEn}
                </div>
                <div className="text-slate-800 dark:text-slate-200" dir="rtl">
                  <span className="text-xs font-medium text-slate-500">AR: </span>
                  {wordOfDay.meaningAr}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {wordOfDay.exampleZh}
                </div>
                <div className="mt-0.5 text-slate-500 dark:text-slate-400">{wordOfDay.examplePinyin}</div>
                <div className="mt-1 text-slate-700 dark:text-slate-300">{wordOfDay.exampleEn}</div>
                <div className="mt-0.5 text-slate-700 dark:text-slate-300" dir="rtl">
                  {wordOfDay.exampleAr}
                </div>
              </div>
            </section>
          )}

          {/* Team Rankings */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {t(language, 'teamRankings')}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('teams')}
                className="text-xs font-semibold text-[#0F2342] hover:underline dark:text-[#C9972C]"
              >
                Full Standings
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {sortedTeams.map((team, idx) => {
                const widthPct = Math.round((team.totalScore / maxTeamScore) * 100);
                return (
                  <div key={team.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        <span className="mr-2 font-mono-tabular text-xs font-semibold text-[#C9972C]">
                          #{idx + 1}
                        </span>
                        {team.name}
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                          {team.chineseName}
                        </span>
                      </div>
                      <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                        {team.totalScore} pts
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%`, backgroundColor: team.accentColor }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {team.membersCount} students · {team.motto}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Student of the Week */}
          {studentOfWeek && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#C9972C]" />
                  <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {t(language, 'studentOfTheWeek')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('points')}
                  className="text-xs font-semibold text-[#0F2342] hover:underline dark:text-[#C9972C]"
                >
                  Rewards
                </button>
              </div>
              <div className="mt-4">
                <div className="font-display text-xl font-bold text-[#0F2342] dark:text-[#E8C872]">
                  {studentOfWeek.displayName}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {state.teams.find((tm) => tm.id === studentOfWeek.teamId)?.name} ·{' '}
                  {studentOfWeek.points} pts
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {state.settings.studentOfTheWeekReason}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
