import React, { useState } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Mic, Plus, Star, Volume2, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { t } from '../i18n/translations';
import { ChineseLesson } from '../types/classroom';
import { speakChinese } from '../utils/helpers';

export const ChineseLearningView: React.FC = () => {
  const { state, isAdmin, role, language, addLesson, setWordOfTheDay } = useClassroom();
  const [tab, setTab] = useState<'vocab' | 'grammar' | 'quiz' | 'speaking'>('vocab');
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Custom lesson draft
  const [draft, setDraft] = useState<Omit<ChineseLesson, 'id' | 'createdBy'>>({
    type: 'word',
    hskLevel: 'HSK 2',
    hanzi: '',
    pinyin: '',
    meaningEn: '',
    meaningAr: '',
    exampleZh: '',
    examplePinyin: '',
    exampleEn: '',
    exampleAr: '',
    grammarTip: '',
  });

  const wordOfDay =
    state.lessons.find((l) => l.id === state.settings.wordOfTheDayId) || state.lessons[0];

  const handleSpeak = (text: string) => {
    const res = speakChinese(text);
    if (!res.ok) {
      setAudioNotice(res.reason || 'Audio unavailable');
      setTimeout(() => setAudioNotice(null), 3000);
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.hanzi.trim() || !draft.meaningEn.trim()) return;
    addLesson({
      ...draft,
      createdBy: role === 'monitor' ? state.settings.monitorName : state.settings.teacherName,
    });
    setDraft({
      type: 'word',
      hskLevel: 'HSK 2',
      hanzi: '',
      pinyin: '',
      meaningEn: '',
      meaningAr: '',
      exampleZh: '',
      examplePinyin: '',
      exampleEn: '',
      exampleAr: '',
      grammarTip: '',
    });
    setShowAddModal(false);
  };

  const vocabLessons = state.lessons.filter((l) => l.type === 'word' || l.type === 'hsk');
  const grammarLessons = state.lessons.filter((l) => l.type === 'grammar');
  const speakingLessons = state.lessons.filter((l) => l.type === 'speaking');

  const quizScore = state.quizzes.reduce(
    (sum, q) => (answers[q.id] === q.correctIndex ? sum + 1 : sum),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navChinese')} · 中文学习角
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Word of the Day, HSK vocabulary, grammar notes, speaking prompts, and interactive daily quizzes.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Custom Lesson
          </button>
        )}
      </div>

      {/* Word of the Day Featured Banner */}
      {wordOfDay && (
        <section className="rounded-xl border border-slate-200 bg-[#0F2342] p-6 text-white dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E8C872]">
                <Star className="h-4 w-4" />
                {t(language, 'wordOfTheDay')} · {wordOfDay.hskLevel}
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-4">
                <span className="text-4xl font-bold tracking-tight">{wordOfDay.hanzi}</span>
                <span className="font-mono-tabular text-lg text-[#E8C872]">{wordOfDay.pinyin}</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="text-slate-200">
                  <span className="text-xs text-slate-400">English: </span>
                  {wordOfDay.meaningEn}
                </div>
                <div className="text-slate-200" dir="rtl">
                  <span className="text-xs text-slate-400">العربية: </span>
                  {wordOfDay.meaningAr}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSpeak(`${wordOfDay.hanzi}。${wordOfDay.exampleZh}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C9972C] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d8a73d] whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4" />
              {t(language, 'pronounce')}
            </button>
          </div>

          {audioNotice && <p className="mt-2 text-xs text-amber-300">{audioNotice}</p>}

          <div className="mt-4 rounded-lg border border-white/15 bg-white/5 p-4 text-sm">
            <div className="font-medium text-white">{wordOfDay.exampleZh}</div>
            <div className="mt-0.5 text-xs text-slate-300">{wordOfDay.examplePinyin}</div>
            <div className="mt-2 text-xs text-slate-200">{wordOfDay.exampleEn}</div>
            <div className="mt-0.5 text-xs text-slate-200" dir="rtl">
              {wordOfDay.exampleAr}
            </div>
          </div>
        </section>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setTab('vocab')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold ${
            tab === 'vocab'
              ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          HSK Vocabulary ({vocabLessons.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('grammar')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold ${
            tab === 'grammar'
              ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
          }`}
        >
          Grammar Exercises ({grammarLessons.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('quiz')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold ${
            tab === 'quiz'
              ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Daily Quiz ({state.quizzes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('speaking')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold ${
            tab === 'speaking'
              ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
          }`}
        >
          <Mic className="h-3.5 w-3.5" />
          Speaking Competitions ({speakingLessons.length})
        </button>
      </div>

      {(tab === 'vocab' || tab === 'grammar' || tab === 'speaking') && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(tab === 'vocab'
            ? vocabLessons
            : tab === 'grammar'
              ? grammarLessons
              : speakingLessons
          ).map((lesson) => (
            <div
              key={lesson.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono-tabular text-[#C9972C]">
                      {lesson.hskLevel} · {lesson.createdBy}
                    </div>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {lesson.hanzi}
                    </h3>
                    <div className="font-mono-tabular text-xs text-slate-500">{lesson.pinyin}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeak(`${lesson.hanzi}。${lesson.exampleZh}`)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                      title="Listen"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setWordOfTheDay(lesson.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                      >
                        Set Daily
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div className="text-slate-800 dark:text-slate-200">{lesson.meaningEn}</div>
                  <div className="text-slate-700 dark:text-slate-300" dir="rtl">
                    {lesson.meaningAr}
                  </div>
                </div>

                {lesson.grammarTip && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                    Tip: {lesson.grammarTip}
                  </div>
                )}
              </div>

              {lesson.exampleZh && (
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {lesson.exampleZh}
                  </div>
                  <div className="text-slate-500">{lesson.examplePinyin}</div>
                  <div className="mt-1 text-slate-600 dark:text-slate-300">{lesson.exampleEn}</div>
                  <div className="text-slate-600 dark:text-slate-300" dir="rtl">
                    {lesson.exampleAr}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Interactive Daily Chinese Check
            </span>
            <span className="font-mono-tabular font-bold text-[#0F2342] dark:text-[#E8C872]">
              Score: {quizScore} / {state.quizzes.length}
            </span>
          </div>

          {state.quizzes.map((q, idx) => {
            const chosen = answers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;
            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="text-xs font-mono-tabular text-[#C9972C]">
                  Question {idx + 1} · {q.hskLevel}
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {q.questionZh}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{q.questionEn}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400" dir="rtl">
                  {q.questionAr}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = chosen === optIdx;
                    const right = optIdx === q.correctIndex;
                    let cls =
                      'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200';
                    if (isAnswered) {
                      if (right) {
                        cls =
                          'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300';
                      } else if (selected) {
                        cls =
                          'border-red-600 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-300';
                      }
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${cls}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <CheckCircle2
                      className={`h-4 w-4 ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`}
                    />
                    {isCorrect ? 'Correct! ' : 'Review: '}
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Add Custom Chinese Lesson
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Category</label>
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft({ ...draft, type: e.target.value as ChineseLesson['type'] })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="word">Word of the Day / Vocab</option>
                    <option value="hsk">HSK Challenge</option>
                    <option value="grammar">Grammar Exercise</option>
                    <option value="speaking">Speaking Prompt</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">HSK Level</label>
                  <input
                    type="text"
                    value={draft.hskLevel}
                    onChange={(e) => setDraft({ ...draft, hskLevel: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Chinese (汉字)"
                  value={draft.hanzi}
                  onChange={(e) => setDraft({ ...draft, hanzi: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Pinyin"
                  value={draft.pinyin}
                  onChange={(e) => setDraft({ ...draft, pinyin: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <input
                type="text"
                placeholder="English Meaning"
                value={draft.meaningEn}
                onChange={(e) => setDraft({ ...draft, meaningEn: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                dir="rtl"
                placeholder="المعنى بالعربية"
                value={draft.meaningAr}
                onChange={(e) => setDraft({ ...draft, meaningAr: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Example Sentence (中文)"
                value={draft.exampleZh}
                onChange={(e) => setDraft({ ...draft, exampleZh: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Example Pinyin"
                value={draft.examplePinyin}
                onChange={(e) => setDraft({ ...draft, examplePinyin: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Example English Translation"
                value={draft.exampleEn}
                onChange={(e) => setDraft({ ...draft, exampleEn: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                dir="rtl"
                placeholder="ترجمة المثال بالعربية"
                value={draft.exampleAr}
                onChange={(e) => setDraft({ ...draft, exampleAr: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Grammar / Speaking Tip (optional)"
                value={draft.grammarTip}
                onChange={(e) => setDraft({ ...draft, grammarTip: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
