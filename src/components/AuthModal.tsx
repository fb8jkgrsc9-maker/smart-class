import React, { useState } from 'react';
import { KeyRound, Lock, ShieldCheck, User, X } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { t } from '../i18n/translations';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { role, state, language, authenticateRole, setupPin, switchToStudentRole } = useClassroom();
  const [selectedTarget, setSelectedTarget] = useState<'monitor' | 'teacher'>('monitor');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const isTargetConfigured =
    selectedTarget === 'monitor'
      ? Boolean(state.settings.monitorPin)
      : Boolean(state.settings.teacherPin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isTargetConfigured) {
      if (pin.trim().length < 4) {
        setError('PIN must be at least 4 characters.');
        return;
      }
      if (pin.trim() !== confirmPin.trim()) {
        setError('PINs do not match. Please re-enter.');
        return;
      }
      const created = setupPin(selectedTarget, pin);
      if (created) {
        setPin('');
        setConfirmPin('');
        onClose();
      } else {
        setError('Could not save first-time PIN.');
      }
      return;
    }

    const ok = authenticateRole(selectedTarget, pin);
    if (ok) {
      setPin('');
      setConfirmPin('');
      onClose();
    } else {
      setError('Incorrect local PIN. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#C9972C]" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              {t(language, 'switchRole')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            Current role:{' '}
            <strong className="font-semibold text-slate-900 dark:text-white">
              {role === 'monitor'
                ? t(language, 'roleMonitor')
                : role === 'teacher'
                  ? t(language, 'roleTeacher')
                  : t(language, 'roleStudent')}
            </strong>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedTarget('monitor');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                selectedTarget === 'monitor'
                  ? 'border-[#0F2342] bg-[#0F2342] text-white dark:border-[#C9972C] dark:bg-[#16325C]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <div className="font-semibold">Class Monitor (班长)</div>
              <div className="text-xs opacity-80">{state.settings.monitorName}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTarget('teacher');
                setPin('');
                setConfirmPin('');
                setError('');
              }}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                selectedTarget === 'teacher'
                  ? 'border-[#0F2342] bg-[#0F2342] text-white dark:border-[#C9972C] dark:bg-[#16325C]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <div className="font-semibold">Teacher (老师)</div>
              <div className="text-xs opacity-80">Shared Admin</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isTargetConfigured ? (
              <>
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <strong>First-Time Setup:</strong> Configure a private local PIN (minimum 4 digits) for{' '}
                    {selectedTarget === 'monitor' ? 'Class Monitor (班长)' : 'Teacher (老师)'}.
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Create Local PIN
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 font-mono-tabular text-sm text-slate-900 focus:border-[#0F2342] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Confirm Local PIN
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      inputMode="numeric"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Re-enter PIN"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 font-mono-tabular text-sm text-slate-900 focus:border-[#0F2342] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Local Access PIN
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter configured local PIN"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 font-mono-tabular text-sm text-slate-900 focus:border-[#0F2342] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  switchToStudentRole();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <User className="h-3.5 w-3.5" />
                Student View
              </button>

              <button
                type="submit"
                className="rounded-lg bg-[#0F2342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 dark:hover:bg-[#d6a63f]"
              >
                {isTargetConfigured ? 'Unlock Admin Profile' : 'Set PIN & Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
