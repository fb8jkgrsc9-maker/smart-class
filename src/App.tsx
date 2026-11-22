import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Database,
  LayoutDashboard,
  Menu,
  MonitorPlay,
  Moon,
  Presentation,
  ScrollText,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Sun,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { t } from './i18n/translations';
import { Language, NavSection } from './types/classroom';
import { UniversityEmblem } from './components/Emblem';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { CleaningView } from './components/CleaningView';
import { RandomPickerView } from './components/RandomPickerView';
import { TeamsView } from './components/TeamsView';
import { PointsView } from './components/PointsView';
import { ChineseLearningView } from './components/ChineseLearningView';
import { ActivitiesView } from './components/ActivitiesView';
import { CommunityView } from './components/CommunityView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PresentationMode } from './components/PresentationMode';
import { PlatformShowcaseDeck } from './components/PlatformShowcaseDeck';

const NAV_ITEMS: { id: NavSection; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
  { id: 'students', labelKey: 'navStudents', icon: Users },
  { id: 'attendance', labelKey: 'navAttendance', icon: CalendarCheck },
  { id: 'cleaning', labelKey: 'navCleaning', icon: Sparkles },
  { id: 'picker', labelKey: 'navPicker', icon: Shuffle },
  { id: 'teams', labelKey: 'navTeams', icon: Trophy },
  { id: 'points', labelKey: 'navPoints', icon: Award },
  { id: 'chinese', labelKey: 'navChinese', icon: BookOpen },
  { id: 'activities', labelKey: 'navActivities', icon: CalendarDays },
  { id: 'community', labelKey: 'navCommunity', icon: ScrollText },
  { id: 'reports', labelKey: 'navReports', icon: BarChart3 },
  { id: 'settings', labelKey: 'navSettings', icon: Database },
  { id: 'showcase', labelKey: 'navShowcase', icon: Presentation },
];

const AppShell: React.FC = () => {
  const {
    role,
    isAdmin,
    language,
    theme,
    activeSection,
    presentationMode,
    lastSavedStatus,
    setActiveSection,
    setLanguage,
    toggleTheme,
    setPresentationMode,
    switchToStudentRole,
  } = useClassroom();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const activeNav = NAV_ITEMS.find((n) => n.id === activeSection) || NAV_ITEMS[0];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'cleaning':
        return <CleaningView />;
      case 'picker':
        return <RandomPickerView />;
      case 'teams':
        return <TeamsView />;
      case 'points':
        return <PointsView />;
      case 'chinese':
        return <ChineseLearningView />;
      case 'activities':
        return <ActivitiesView />;
      case 'community':
        return <CommunityView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'showcase':
        return <PlatformShowcaseDeck />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {presentationMode && <PresentationMode />}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="no-print hidden w-64 shrink-0 flex-col border-e border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <UniversityEmblem className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold tracking-tight text-[#0F2342] dark:text-white">
                SMART CLASS
              </div>
              <div className="truncate text-xs text-[#C9972C]">智慧班级 · 兰州理工大学</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#0F2342] text-white dark:bg-[#16325C] dark:text-[#E8C872]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t(language, item.labelKey)}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 text-xs dark:border-slate-800">
            <div className="font-medium text-slate-700 dark:text-slate-300">
              {role === 'monitor'
                ? t(language, 'roleMonitor')
                : role === 'teacher'
                  ? t(language, 'roleTeacher')
                  : t(language, 'roleStudent')}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {t(language, 'savedLocally')} {lastSavedStatus ? `· ${lastSavedStatus}` : ''}
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative z-50 flex w-72 flex-col bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <UniversityEmblem className="h-8 w-8" />
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    SMART CLASS – 智慧班级
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        active
                          ? 'bg-[#0F2342] text-white dark:bg-[#16325C] dark:text-[#E8C872]'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{t(language, item.labelKey)}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xs sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-200"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {t(language, activeNav.labelKey)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Language Selector */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950">
                {(['en', 'ar', 'zh'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      language === lang
                        ? 'bg-[#0F2342] text-white dark:bg-[#C9972C] dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'ar' ? 'عربي' : '中文'}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Toggle Light/Dark Mode"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              {/* Projector Mode */}
              <button
                type="button"
                onClick={() => setPresentationMode(true)}
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                <MonitorPlay className="h-3.5 w-3.5 text-[#C9972C]" />
                {t(language, 'projectorMode')}
              </button>

              {/* Role / Auth Action */}
              {isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-3 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {role === 'monitor' ? 'Li Ankai (班长)' : 'Teacher (老师)'}
                  </button>
                  <button
                    type="button"
                    onClick={switchToStudentRole}
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 whitespace-nowrap"
                  >
                    Lock
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2342] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#16325C] dark:bg-[#C9972C] dark:text-slate-950 whitespace-nowrap"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t(language, 'switchRole')}
                </button>
              )}
            </div>
          </header>

          {/* Main Viewport */}
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            {renderSection()}
          </main>

          <footer className="no-print border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            SMART CLASS – 智慧班级 · Lanzhou University of Technology (兰州理工大学) · {t(language, 'tagline')}
          </footer>
        </div>
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ClassroomProvider>
      <AppShell />
    </ClassroomProvider>
  );
}
