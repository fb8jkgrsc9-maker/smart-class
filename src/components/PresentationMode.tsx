import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Calendar, CheckCircle2, ClipboardList, Trophy, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { getMondayISO, getTodayISO } from '../data/initialData';
import { t } from '../i18n/translations';
import { getTeamTotalScore } from '../utils/helpers';
import { UniversityEmblem } from './Emblem';

export const PresentationMode: React.FC = () => {
  const {
    state,
    language,
    setPresentationMode,
    projectorSpotlight,
    setProjectorSpotlight,
  } = useClassroom();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  const activeStudents = state.students.filter((s) => s.active);
  const todayISO = getTodayISO();
  const todayAtt = state.attendanceHistory.find((a) => a.date === todayISO);

  let present = 0;
  let late = 0;
  let absent = 0;
  if (todayAtt) {
    activeStudents.forEach((s) => {
      const st = todayAtt.records[s.id];
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else absent++;
    });
  } else {
    present = activeStudents.length;
  }

  const mondayISO = getMondayISO();
  const currentCleaning =
    state.cleaningSchedules.find((w) => w.weekStart === mondayISO) ||
    [...state.cleaningSchedules].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];

  const rankedTeams = [...state.teams]
    .map((tm) => ({ ...tm, score: getTeamTotalScore(tm, state.students) }))
    .sort((a, b) => b.score - a.score);

  const wordOfDay =
    state.lessons.find((l) => l.id === state.settings.wordOfTheDayId) || state.lessons[0];

  const studentOfWeek =
    state.students.find((s) => s.id === state.settings.studentOfTheWeekId) || activeStudents[0];

  const upcomingActivities = [...state.activities]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const getStudentName = (id: string) =>
    state.students.find((s) => s.id === id)?.displayName || id;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[#09172E] p-6 text-white sm:p-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-6">
        <div className="flex items-center gap-4">
          <UniversityEmblem className="h-14 w-14 shrink-0" />
          <div>
            <div className="text-sm font-medium text-[#E8C872]">
              {state.settings.universityName} · {state.settings.universityNameZh}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              SMART CLASS – 智慧班级 · {state.settings.classroomName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-mono-tabular text-2xl font-bold text-[#E8C872] sm:text-3xl">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-slate-300">
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setProjectorSpotlight(null);
              setPresentationMode(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
            {t(language, 'exitProjector')}
          </button>
        </div>
      </header>

      {/* Random Picker Spotlight Overlay if triggered */}
      {projectorSpotlight && (
        <div className="my-6 rounded-2xl border-2 border-[#C9972C] bg-[#16325C] p-8 text-center shadow-2xl">
          <div className="text-sm font-semibold text-[#E8C872]">
            Random Selection Spotlight · 随机抽选结果
          </div>
          <div className="mt-3 font-display text-5xl font-extrabold text-white sm:text-6xl">
            {projectorSpotlight.resultLabel}
          </div>
          {projectorSpotlight.resultSubLabel && (
            <div className="mt-2 text-xl text-slate-200">{projectorSpotlight.resultSubLabel}</div>
          )}
          <button
            type="button"
            onClick={() => setProjectorSpotlight(null)}
            className="mt-5 rounded-lg bg-[#C9972C] px-5 py-2 text-xs font-semibold text-slate-950"
          >
            Return to Classroom Overview
          </button>
        </div>
      )}

      {/* Main Projector Grid */}
      <main className="my-6 grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Word of the Day + Student of the Week + Attendance */}
        <div className="space-y-6 lg:col-span-5">
          {wordOfDay && (
            <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C872]">
                <BookOpen className="h-4 w-4" />
                {t(language, 'wordOfTheDay')} · {wordOfDay.hskLevel}
              </div>
              <div className="mt-3 flex items-baseline gap-4">
                <span className="text-5xl font-bold text-white">{wordOfDay.hanzi}</span>
                <span className="font-mono-tabular text-2xl text-[#E8C872]">{wordOfDay.pinyin}</span>
              </div>
              <div className="mt-3 text-lg text-slate-100">{wordOfDay.meaningEn}</div>
              <div className="mt-1 text-lg text-slate-200" dir="rtl">
                {wordOfDay.meaningAr}
              </div>
              <div className="mt-4 border-t border-white/10 pt-3 text-base text-slate-200">
                <div>{wordOfDay.exampleZh}</div>
                <div className="text-sm text-slate-400">{wordOfDay.exampleEn}</div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C872]">
                <CheckCircle2 className="h-4 w-4" />
                Attendance Today
              </div>
              <div className="mt-3 font-display text-4xl font-bold tabular-nums">
                {present} / {activeStudents.length}
              </div>
              <div className="mt-2 text-sm text-slate-300 tabular-nums">
                Late: {late} · Absent/Excused: {absent}
              </div>
            </section>

            {studentOfWeek && (
              <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C872]">
                  <Award className="h-4 w-4" />
                  Student of the Week
                </div>
                <div className="mt-3 font-display text-2xl font-bold text-white">
                  {studentOfWeek.displayName}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  {state.settings.studentOfTheWeekReason}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Center/Right: Cleaning Team + Team Rankings + Upcoming Activities */}
        <div className="space-y-6 lg:col-span-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C872]">
                <Trophy className="h-4 w-4" />
                Team Rankings · 小组比赛
              </div>
              <div className="mt-4 space-y-4">
                {rankedTeams.map((tm, idx) => (
                  <div key={tm.id} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="text-lg font-bold text-white">
                        #{idx + 1} {tm.name}
                      </div>
                      <div className="text-sm text-slate-400">{tm.chineseName}</div>
                    </div>
                    <div className="font-mono-tabular text-2xl font-bold text-[#E8C872]">
                      {tm.score}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C872]">
                <Calendar className="h-4 w-4" />
                Upcoming Activities
              </div>
              <div className="mt-4 space-y-3">
                {upcomingActivities.map((act) => (
                  <div key={act.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <div className="text-base font-semibold text-white">{act.title}</div>
                    <div className="mt-0.5 font-mono-tabular text-xs text-slate-300">
                      {act.date} · {act.time} · {act.location}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C872]">
                <ClipboardList className="h-4 w-4" />
                Weekly Cleaning Team · 值日生 ({currentCleaning?.weekLabel})
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentCleaning?.assignments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="text-sm font-semibold text-white">
                    {t(language, item.taskKey)}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {item.studentIds.map(getStudentName).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 pt-4 text-center text-sm text-slate-400">
        SMART CLASS – 智慧班级 · Together We Learn, Together We Improve.
      </footer>
    </div>
  );
};
