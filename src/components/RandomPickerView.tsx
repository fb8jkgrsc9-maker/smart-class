import React, { useMemo, useState } from 'react';
import { MonitorPlay, RotateCcw, Shuffle, Trash2 } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { CLEANING_TASKS, getTodayISO } from '../data/initialData';
import { t } from '../i18n/translations';
import { PickerHistoryItem, PickerMode } from '../types/classroom';

const MODES: { id: PickerMode; label: string; labelZh: string }[] = [
  { id: 'student', label: 'Random Student', labelZh: '随机学生' },
  { id: 'team', label: 'Random Team', labelZh: '随机小组' },
  { id: 'cleaning', label: 'Cleaning Duty', labelZh: '随机值日' },
  { id: 'question', label: 'Chinese Question', labelZh: '中文提问' },
  { id: 'speaker', label: 'Presentation Speaker', labelZh: '演讲抽签' },
  { id: 'activity', label: 'Classroom Activity', labelZh: '随机活动' },
];

const WHEEL_COLORS = ['#0F2342', '#1E3A8A', '#B45309', '#16325C', '#0F766E', '#7C2D12'];

interface WheelEntry {
  id: string;
  label: string;
  subLabel?: string;
}

export const RandomPickerView: React.FC = () => {
  const {
    state,
    isAdmin,
    language,
    recordPick,
    clearPickerHistory,
    setProjectorSpotlight,
    setPresentationMode,
  } = useClassroom();

  const [mode, setMode] = useState<PickerMode>('student');
  const [excludeAbsent, setExcludeAbsent] = useState(true);
  const [noRepeat, setNoRepeat] = useState(true);
  const [usedIdsByMode, setUsedIdsByMode] = useState<Record<PickerMode, string[]>>({
    student: [],
    team: [],
    cleaning: [],
    question: [],
    speaker: [],
    activity: [],
  });
  const [rotationDeg, setRotationDeg] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [latestPick, setLatestPick] = useState<PickerHistoryItem | null>(
    state.pickerHistory[0] || null
  );
  const [manualId, setManualId] = useState('');

  const todayISO = getTodayISO();
  const todayAttendance = state.attendanceHistory.find((a) => a.date === todayISO);

  const allEntries: WheelEntry[] = useMemo(() => {
    if (mode === 'student' || mode === 'speaker') {
      return state.students
        .filter((s) => s.active)
        .filter((s) => {
          if (!excludeAbsent || !todayAttendance) return true;
          const status = todayAttendance.records[s.id];
          return status !== 'absent' && status !== 'excused';
        })
        .map((s) => ({
          id: s.id,
          label: s.displayName,
          subLabel: state.teams.find((tm) => tm.id === s.teamId)?.name,
        }));
    }
    if (mode === 'team') {
      return state.teams.map((tm) => ({
        id: tm.id,
        label: tm.name,
        subLabel: tm.chineseName,
      }));
    }
    if (mode === 'cleaning') {
      return CLEANING_TASKS.map((tk) => ({
        id: tk,
        label: t(language, tk),
        subLabel: 'Weekly Cleaning Duty',
      }));
    }
    if (mode === 'question') {
      return state.lessons.map((l) => ({
        id: l.id,
        label: `${l.hanzi} (${l.pinyin})`,
        subLabel: l.meaningEn,
      }));
    }
    return [
      { id: 'act-roleplay', label: '2-Minute Chinese Roleplay', subLabel: 'Speaking Practice' },
      { id: 'act-dictation', label: 'Character Dictation Relay', subLabel: 'Writing & Memory' },
      { id: 'act-tongue', label: 'Chinese Tongue Twister', subLabel: 'Pronunciation' },
      { id: 'act-quiz', label: 'Rapid HSK Vocab Quiz', subLabel: 'Team Challenge' },
      { id: 'act-story', label: 'Describe Campus Picture', subLabel: 'Sentence Building' },
      { id: 'act-song', label: 'Chinese Idiom Story', subLabel: 'Cultural Exchange' },
    ];
  }, [mode, excludeAbsent, todayAttendance, state.students, state.teams, state.lessons, language]);

  const usedIds = usedIdsByMode[mode] || [];
  const eligibleEntries = useMemo(() => {
    if (!noRepeat) return allEntries;
    const remaining = allEntries.filter((e) => !usedIds.includes(e.id));
    return remaining.length > 0 ? remaining : allEntries;
  }, [allEntries, noRepeat, usedIds]);

  const handleSpin = () => {
    if (spinning || eligibleEntries.length === 0) return;
    setSpinning(true);

    const chosenIdx = Math.floor(Math.random() * eligibleEntries.length);
    const chosen = eligibleEntries[chosenIdx];

    // Calculate angle on the displayed wheel (allEntries or eligibleEntries)
    const wheelList = eligibleEntries;
    const sliceDeg = 360 / wheelList.length;
    const targetSliceCenter = chosenIdx * sliceDeg + sliceDeg / 2;
    const spins = 5 * 360;
    const nextAngle =
      rotationDeg + spins + (360 - ((rotationDeg + targetSliceCenter) % 360));
    setRotationDeg(nextAngle);

    setTimeout(() => {
      setSpinning(false);
      const picked = recordPick({
        mode,
        resultLabel: chosen.label,
        resultSubLabel: chosen.subLabel,
        targetId: chosen.id,
      });
      setLatestPick(picked);
      if (noRepeat) {
        setUsedIdsByMode((prev) => {
          const already = prev[mode] || [];
          const nextList = already.length + 1 >= allEntries.length ? [] : [...already, chosen.id];
          return { ...prev, [mode]: nextList };
        });
      }
    }, 3100);
  };

  const handleManualPick = () => {
    const found = allEntries.find((e) => e.id === manualId);
    if (!found) return;
    const picked = recordPick({
      mode,
      resultLabel: found.label,
      resultSubLabel: `${found.subLabel || ''} · Manual Selection`.trim(),
      targetId: found.id,
    });
    setLatestPick(picked);
  };

  const handleResetPool = () => {
    setUsedIdsByMode((prev) => ({ ...prev, [mode]: [] }));
  };

  const openOnProjector = () => {
    if (!latestPick) return;
    setProjectorSpotlight(latestPick);
    setPresentationMode(true);
  };

  const wheelItems = eligibleEntries.length > 0 ? eligibleEntries : allEntries;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t(language, 'navPicker')} · 随机抽选
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fair animated selection wheel with absent exclusion, no-repeat tracking, and projector display.
          </p>
        </div>

        {latestPick && (
          <button
            type="button"
            onClick={openOnProjector}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9972C] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d8a73d] whitespace-nowrap"
          >
            <MonitorPlay className="h-4 w-4" />
            Show Selected on Projector
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === m.id
                ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {m.label} · {m.labelZh}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Wheel Stage */}
        <div className="flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="inline-flex cursor-pointer items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={excludeAbsent}
                  onChange={(e) => setExcludeAbsent(e.target.checked)}
                />
                {t(language, 'excludeAbsent')}
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={noRepeat}
                  onChange={(e) => setNoRepeat(e.target.checked)}
                />
                {t(language, 'noRepeat')}
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono-tabular">
                Pool: {wheelItems.length}/{allEntries.length}
              </span>
              <button
                type="button"
                onClick={handleResetPool}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                <RotateCcw className="h-3 w-3" />
                {t(language, 'reset')}
              </button>
            </div>
          </div>

          {/* SVG Wheel */}
          <div className="relative my-6 flex items-center justify-center">
            {/* Pointer */}
            <div className="absolute -top-3 z-10 h-0 w-0 border-x-[11px] border-t-[18px] border-x-transparent border-t-[#C9972C]" />

            <div
              className="h-72 w-72 sm:h-80 sm:w-80"
              style={{
                transform: `rotate(${rotationDeg}deg)`,
                transition: spinning ? 'transform 3s cubic-bezier(0.16, 1, 0.25, 1)' : 'none',
              }}
            >
              <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-md">
                {wheelItems.map((entry, idx) => {
                  const total = wheelItems.length;
                  const startAngle = (idx * 360) / total - 90;
                  const endAngle = ((idx + 1) * 360) / total - 90;
                  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                  const rad1 = (startAngle * Math.PI) / 180;
                  const rad2 = (endAngle * Math.PI) / 180;
                  const x1 = 100 + 96 * Math.cos(rad1);
                  const y1 = 100 + 96 * Math.sin(rad1);
                  const x2 = 100 + 96 * Math.cos(rad2);
                  const y2 = 100 + 96 * Math.sin(rad2);
                  const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
                  const tx = 100 + 62 * Math.cos(midAngle);
                  const ty = 100 + 62 * Math.sin(midAngle);
                  const textRot = (startAngle + endAngle) / 2;
                  const fill = WHEEL_COLORS[idx % WHEEL_COLORS.length];

                  return (
                    <g key={entry.id}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 96 96 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={fill}
                        stroke="#F8FAFC"
                        strokeWidth="1"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill="#FFFFFF"
                        fontSize={total > 12 ? '5.2' : '6.8'}
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textRot}, ${tx}, ${ty})`}
                      >
                        {entry.label.length > 14 ? `${entry.label.slice(0, 13)}…` : entry.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="18" fill="#0F2342" stroke="#C9972C" strokeWidth="3" />
              </svg>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning || wheelItems.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F2342] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#16325C] disabled:opacity-50 dark:bg-[#C9972C] dark:text-slate-950"
            >
              <Shuffle className="h-4 w-4" />
              {spinning ? 'Selecting...' : t(language, 'spinWheel')}
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <select
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="max-w-[180px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Manual select...</option>
                  {allEntries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleManualPick}
                  disabled={!manualId}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                >
                  Pick
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result & History */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-[#0F2342] p-6 text-white dark:border-slate-800">
            <div className="text-xs font-medium text-[#E8C872]">Selected Result</div>
            {latestPick ? (
              <div className="mt-3">
                <div className="font-display text-3xl font-bold text-white">
                  {latestPick.resultLabel}
                </div>
                {latestPick.resultSubLabel && (
                  <div className="mt-1.5 text-sm text-slate-300">{latestPick.resultSubLabel}</div>
                )}
                <div className="mt-4 text-xs font-mono-tabular text-slate-400">
                  {new Date(latestPick.pickedAt).toLocaleTimeString()} · Mode: {latestPick.mode}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-300">
                Spin the wheel to select a student, team, cleaning duty, or Chinese question.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                Selection History ({state.pickerHistory.length})
              </h3>
              {state.pickerHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearPickerHistory}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
            <div className="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {state.pickerHistory.length === 0 ? (
                <p className="py-4 text-xs text-slate-500">No selections recorded yet.</p>
              ) : (
                state.pickerHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.resultLabel}
                      </div>
                      <div className="text-slate-500">{item.mode}</div>
                    </div>
                    <span className="font-mono-tabular text-slate-400">
                      {new Date(item.pickedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
