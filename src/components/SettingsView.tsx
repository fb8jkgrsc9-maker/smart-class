import React, { useRef, useState } from 'react';
import { CheckCircle2, Download, KeyRound, RotateCcw, Upload } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { t } from '../i18n/translations';

export const SettingsView: React.FC = () => {
  const {
    state,
    role,
    isAdmin,
    language,
    lastSavedStatus,
    updateSettings,
    exportBackupJson,
    importBackupJson,
    resetAllData,
  } = useClassroom();

  const [classroomName, setClassroomName] = useState(state.settings.classroomName);
  const [classroomNameZh, setClassroomNameZh] = useState(state.settings.classroomNameZh);
  const [semesterLabel, setSemesterLabel] = useState(state.settings.semesterLabel);
  const [monitorName, setMonitorName] = useState(state.settings.monitorName);
  const [teacherName, setTeacherName] = useState(state.settings.teacherName);

  const [newMonitorPin, setNewMonitorPin] = useState('');
  const [newTeacherPin, setNewTeacherPin] = useState('');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateSettings({
      classroomName: classroomName.trim() || state.settings.classroomName,
      classroomNameZh: classroomNameZh.trim() || state.settings.classroomNameZh,
      semesterLabel: semesterLabel.trim() || state.settings.semesterLabel,
      monitorName: monitorName.trim() || state.settings.monitorName,
      teacherName: teacherName.trim() || state.settings.teacherName,
    });
    showNotice('ok', 'Classroom profile saved locally.');
  };

  const handleSavePins = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const updates: { monitorPin?: string; teacherPin?: string } = {};
    if (role === 'monitor' && newMonitorPin.trim().length >= 4) {
      updates.monitorPin = newMonitorPin.trim();
    }
    if (newTeacherPin.trim().length >= 4) {
      updates.teacherPin = newTeacherPin.trim();
    }
    if (Object.keys(updates).length === 0) {
      showNotice('err', 'PIN must be at least 4 characters.');
      return;
    }
    updateSettings(updates);
    setNewMonitorPin('');
    setNewTeacherPin('');
    showNotice('ok', 'Local access PIN updated.');
  };

  const handleDownloadJson = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-class-lut-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('ok', 'JSON backup downloaded.');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importBackupJson(text);
    if (res.ok) {
      showNotice('ok', 'Backup restored successfully from JSON file.');
    } else {
      showNotice('err', res.error || 'Import failed.');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t(language, 'navSettings')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All classroom data is automatically saved in browser localStorage ({lastSavedStatus || 'Active'}). Export JSON backups regularly.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium ${
            notice.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* JSON Backup Export / Import */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Local Backup & Data Portability
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Standalone offline-ready storage. Download or restore complete classroom records anytime.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F2342] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
            >
              <Download className="h-4 w-4" />
              {t(language, 'exportJson')}
            </button>

            {isAdmin && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  <Upload className="h-4 w-4" />
                  {t(language, 'importJson')}
                </button>
              </>
            )}
          </div>

          {role === 'monitor' && (
            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Reset all classroom data back to the initial 17-student defaults? Consider exporting a JSON backup first.'
                    )
                  ) {
                    resetAllData();
                    showNotice('ok', 'Classroom reset to initial 17-student defaults.');
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Classroom to Initial Defaults
              </button>
            </div>
          )}
        </section>

        {/* Local PIN Security */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#C9972C]" />
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Local Profile PINs
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Protect administrative actions locally without cloud authentication.
          </p>

          {!isAdmin ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              Sign in as Class Monitor or Teacher via Switch Role to configure local PINs.
            </p>
          ) : (
            <form onSubmit={handleSavePins} className="mt-4 space-y-3">
              {role === 'monitor' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    New Class Monitor PIN (min 4 digits)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={newMonitorPin}
                    onChange={(e) => setNewMonitorPin(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  New Teacher PIN (min 4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={newTeacherPin}
                  onChange={(e) => setNewTeacherPin(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono-tabular text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
              >
                Update Local PINs
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Classroom Profile Configuration */}
      {isAdmin && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Classroom Identity & Leadership
          </h2>
          <form onSubmit={handleSaveProfile} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Classroom Name (English)</label>
              <input
                type="text"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Classroom Name (中文)</label>
              <input
                type="text"
                value={classroomNameZh}
                onChange={(e) => setClassroomNameZh(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Semester Label</label>
              <input
                type="text"
                value={semesterLabel}
                onChange={(e) => setSemesterLabel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Class Monitor Name</label>
              <input
                type="text"
                value={monitorName}
                onChange={(e) => setMonitorName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Classroom Teacher Name</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-lg bg-[#0F2342] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950"
              >
                Save Classroom Profile
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};
