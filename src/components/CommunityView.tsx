import React, { useState } from 'react';
import { CheckCircle2, Edit3, MessageSquarePlus, Plus, ScrollText, Send, Trash2, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { t } from '../i18n/translations';
import { ClassroomRule, SuggestionCategory, SuggestionItem } from '../types/classroom';

const SUGGESTION_CATEGORIES: { value: SuggestionCategory; label: string }[] = [
  { value: 'improvement', label: 'Improvement Idea' },
  { value: 'activity', label: 'Activity Suggestion' },
  { value: 'question', label: 'Question' },
  { value: 'request', label: 'Request' },
  { value: 'complaint', label: 'Classroom Complaint' },
];

export const CommunityView: React.FC = () => {
  const {
    state,
    isAdmin,
    language,
    submitSuggestion,
    updateSuggestionAdmin,
    addRule,
    updateRule,
    deleteRule,
  } = useClassroom();

  const [tab, setTab] = useState<'rules' | 'suggestions'>('rules');

  // Rule modal
  const [editingRule, setEditingRule] = useState<ClassroomRule | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [ruleDraft, setRuleDraft] = useState({ en: '', zh: '', ar: '' });

  // Suggestion form
  const [sugCategory, setSugCategory] = useState<SuggestionCategory>('improvement');
  const [sugTitle, setSugTitle] = useState('');
  const [sugMessage, setSugMessage] = useState('');
  const [sugSuccess, setSugSuccess] = useState(false);

  // Admin reply state
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const handleRuleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleDraft.en.trim() || !ruleDraft.zh.trim() || !ruleDraft.ar.trim()) return;
    if (editingRule) {
      updateRule(editingRule.id, ruleDraft);
      setEditingRule(null);
    } else {
      addRule(ruleDraft);
      setShowAddRule(false);
    }
    setRuleDraft({ en: '', zh: '', ar: '' });
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugTitle.trim() || !sugMessage.trim()) return;
    submitSuggestion(sugCategory, sugTitle, sugMessage);
    setSugTitle('');
    setSugMessage('');
    setSugSuccess(true);
    setTimeout(() => setSugSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navCommunity')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Multilingual classroom charter (Arabic · 中文 · English) and anonymous student suggestion box.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTab('rules')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === 'rules'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ScrollText className="h-3.5 w-3.5" />
              Classroom Rules · 班级公约
            </button>
            <button
              type="button"
              onClick={() => setTab('suggestions')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === 'suggestions'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Suggestion Box · 意见箱 ({state.suggestions.length})
            </button>
          </div>

          {isAdmin && tab === 'rules' && (
            <button
              type="button"
              onClick={() => {
                setRuleDraft({ en: '', zh: '', ar: '' });
                setShowAddRule(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
          )}
        </div>
      </div>

      {tab === 'rules' && (
        <div className="space-y-3">
          {state.rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F2342] font-mono-tabular text-xs font-bold text-[#E8C872]">
                    {String(rule.order).padStart(2, '0')}
                  </span>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{rule.en}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{rule.zh}</p>
                    <p
                      className="text-sm font-medium text-slate-800 dark:text-slate-200"
                      dir="rtl"
                    >
                      {rule.ar}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleDraft({ en: rule.en, zh: rule.zh, ar: rule.ar });
                      }}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Rule"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRule(rule.id)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'suggestions' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Submit Anonymously */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Anonymous Suggestion Box · 意见箱
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              No student identity is recorded. Share ideas, feedback, or questions safely.
            </p>

            <form onSubmit={handleSuggestionSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={sugCategory}
                  onChange={(e) => setSugCategory(e.target.value as SuggestionCategory)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {SUGGESTION_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Subject
                </label>
                <input
                  type="text"
                  value={sugTitle}
                  onChange={(e) => setSugTitle(e.target.value)}
                  placeholder="Brief title"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={sugMessage}
                  onChange={(e) => setSugMessage(e.target.value)}
                  placeholder="Write your idea, question, or feedback..."
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {sugSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Submitted anonymously to the classroom board.
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
              >
                <Send className="h-3.5 w-3.5" />
                {t(language, 'submitSuggestion')}
              </button>
            </form>
          </section>

          {/* Submissions List */}
          <section className="space-y-3 lg:col-span-7">
            {state.suggestions.map((sug) => (
              <div
                key={sug.id}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold capitalize text-[#C9972C]">{sug.category}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-mono-tabular">{sug.createdAt.slice(0, 10)}</span>
                    <span className="mx-1.5">·</span>
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                      Status: {sug.status}
                    </span>
                  </div>

                  {isAdmin && (
                    <select
                      value={sug.status}
                      onChange={(e) =>
                        updateSuggestionAdmin(
                          sug.id,
                          e.target.value as SuggestionItem['status'],
                          sug.adminReply
                        )
                      }
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Under Review</option>
                      <option value="planned">Planned</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  )}
                </div>

                <h3 className="mt-2 font-display text-base font-bold text-slate-900 dark:text-white">
                  {sug.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{sug.message}</p>

                {sug.adminReply && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <strong className="font-semibold text-[#0F2342] dark:text-[#E8C872]">
                      Monitor / Teacher Response:{' '}
                    </strong>
                    {sug.adminReply}
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={replyDrafts[sug.id] ?? sug.adminReply ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [sug.id]: e.target.value }))
                      }
                      placeholder="Write official response..."
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateSuggestionAdmin(
                          sug.id,
                          sug.status === 'new' ? 'reviewing' : sug.status,
                          replyDrafts[sug.id] ?? sug.adminReply ?? ''
                        )
                      }
                      className="rounded-lg bg-[#0F2342] px-3 py-1.5 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                    >
                      Save Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      )}

      {/* Rule Add/Edit Modal */}
      {(editingRule || showAddRule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {editingRule ? 'Edit Classroom Rule' : 'Add Classroom Rule'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingRule(null);
                  setShowAddRule(false);
                }}
                className="rounded-lg p-1 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRuleSave} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">English</label>
                <textarea
                  rows={2}
                  value={ruleDraft.en}
                  onChange={(e) => setRuleDraft({ ...ruleDraft, en: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Chinese (中文)</label>
                <textarea
                  rows={2}
                  value={ruleDraft.zh}
                  onChange={(e) => setRuleDraft({ ...ruleDraft, zh: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Arabic (العربية)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={ruleDraft.ar}
                  onChange={(e) => setRuleDraft({ ...ruleDraft, ar: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRule(null);
                    setShowAddRule(false);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white dark:bg-[#C9972C] dark:text-slate-950"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
