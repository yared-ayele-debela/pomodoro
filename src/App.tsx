import React, { useState, useEffect } from 'react';
import { PomodoroProvider, usePomodoro } from './context/PomodoroContext';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { AmbientSoundWidget } from './components/AmbientSoundWidget';
import { BadgeToast } from './components/BadgeToast';
import { BadgesModal } from './components/BadgesModal';
import { Keyboard, X, Settings as SettingsIcon, CheckSquare, BarChart2 } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { focusMode, mode, settings, isFullscreen, tasks, streak } = usePomodoro();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('pomodoro-onboarding-dismissed') !== 'true';
  });

  const [activeDrawer, setActiveDrawer] = useState<'tasks' | 'stats' | 'settings' | null>(null);
  const [isInactive, setIsInactive] = useState(false);

  const incompleteTaskCount = tasks.filter((t) => !t.isCompleted).length;

  // Background Crossfade States
  const [bg1, setBg1] = useState('');
  const [bg2, setBg2] = useState('');
  const [showBg1, setShowBg1] = useState(true);

  // Keyboard shortcut to close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDrawer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track background changes and manage crossfade
  useEffect(() => {
    const bgType = settings.backgroundMode === 'global'
      ? settings.globalBackground
      : (mode === 'work' ? settings.workBackground : (mode === 'short' ? settings.shortBackground : settings.longBackground));

    let url = '';
    if (bgType === 'nature') url = '/bg_nature.jpg';
    else if (bgType === 'cozy') url = '/bg_cozy.jpg';
    else if (bgType === 'night') url = '/bg_night.jpg';
    else if (bgType === 'abstract') url = '/bg_abstract.jpg';
    else if (bgType === 'custom' && settings.customBackground) url = settings.customBackground;

    if (showBg1) {
      if (url !== bg1) {
        setBg2(url);
        setShowBg1(false);
      }
    } else {
      if (url !== bg2) {
        setBg1(url);
        setShowBg1(true);
      }
    }
  }, [mode, settings.backgroundMode, settings.globalBackground, settings.workBackground, settings.shortBackground, settings.longBackground, settings.customBackground]);

  // Inactivity Timer for Fullscreen Mode
  useEffect(() => {
    if (!isFullscreen) {
      setIsInactive(false);
      return;
    }

    let timeout: any;
    const handleActivity = () => {
      setIsInactive(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsInactive(true);
      }, 4000); // 4 seconds of inactivity
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('touchstart', handleActivity);

    timeout = setTimeout(() => {
      setIsInactive(true);
    }, 4000);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('pomodoro-onboarding-dismissed', 'true');
  };

  const getThemeBorder = () => {
    if (mode === 'short') return 'border-emerald-500/10 dark:border-emerald-500/20';
    if (mode === 'long') return 'border-violet-500/10 dark:border-violet-500/20';
    return 'border-blue-500/10 dark:border-blue-500/20';
  };

  // Visibility toggling class for secondary chrome in fullscreen mode
  const transitionClass = `transition-all duration-700 transform ${
    isFullscreen && isInactive 
      ? 'opacity-0 scale-95 pointer-events-none translate-y-4' 
      : 'opacity-100 scale-100 translate-y-0'
  }`;

  const hasBackground = settings.backgroundMode === 'global' 
    ? settings.globalBackground !== 'none'
    : (mode === 'work' ? settings.workBackground !== 'none' : (mode === 'short' ? settings.shortBackground !== 'none' : settings.longBackground !== 'none'));

  return (
    <div className={`min-h-screen flex flex-col relative transition-all duration-500 ${
      hasBackground ? 'bg-transparent text-white' : 'bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-50'
    }`}>
      {/* Background Slideshow Containers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        {bg1 && (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              showBg1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url("${bg1}")` }}
          />
        )}
        {bg2 && (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              !showBg1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url("${bg2}")` }}
          />
        )}
        {/* Dynamic scrim overlay for contrast */}
        {hasBackground && (
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{ backgroundColor: `rgba(10, 10, 10, ${(settings.backgroundDimness ?? 20) / 100})` }}
          />
        )}
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center items-center max-w-4xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        {/* Onboarding Help Hint */}
        {!focusMode && showOnboarding && (
          <div className={`mb-8 p-4 rounded-2xl border ${getThemeBorder()} bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-lg flex gap-3.5 items-start justify-between w-full max-w-2xl ${transitionClass}`}>
            <div className="flex gap-3">
              <span className="text-xl p-1 bg-blue-500/10 rounded-xl flex items-center justify-center">💡</span>
              <div className="text-neutral-800 dark:text-neutral-200">
                <h2 className="text-xs font-bold">
                  Getting Started with Pomodoro
                </h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Focus for <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{settings.workDuration} mins</strong>, 
                  then take a <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{settings.shortBreakDuration} mins</strong> break. 
                  Every <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{settings.longBreakInterval} sessions</strong>, trigger a longer 
                  {' '}<strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{settings.longBreakDuration} mins</strong> break.
                </p>
                <div className="mt-2.5 flex items-center gap-4 text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Keyboard size={11} />
                    <span><kbd className="px-1 border border-neutral-300/30 rounded bg-white/10">Space</kbd> Start/Pause</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span><kbd className="px-1 border border-neutral-300/30 rounded bg-white/10">R</kbd> Reset</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span><kbd className="px-1 border border-neutral-300/30 rounded bg-white/10">N</kbd> Skip</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span><kbd className="px-1 border border-neutral-300/30 rounded bg-white/10">F</kbd> Fullscreen</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={dismissOnboarding}
              aria-label="Dismiss hint"
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Centered Main Focus Area (Timer) */}
        <div className={`w-full flex flex-col justify-center items-center transition-all duration-700 ${
          focusMode || isFullscreen ? 'h-[75vh]' : 'min-h-[50vh]'
        }`}>
          <div className={`transition-all duration-500 ${focusMode || isFullscreen ? 'scale-110' : ''}`}>
            <Timer />
          </div>
        </div>
      </main>

      {/* Floating Audio Widget (Bottom Left) */}
      <div className={`fixed bottom-6 left-6 z-30 ${transitionClass}`}>
        <AmbientSoundWidget />
      </div>

      {/* Floating Action Dock (Bottom Right) */}
      <div className={`fixed bottom-6 right-6 z-30 flex items-center gap-1 bg-white/10 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-neutral-200/20 dark:border-neutral-800/40 shadow-xl ${transitionClass}`}>
        {/* Tasks Button */}
        <button
          onClick={() => setActiveDrawer('tasks')}
          aria-label="Open tasks panel"
          title="Tasks & To-Do"
          className={`relative p-3 rounded-full transition-all active:scale-95 text-inherit ${
            activeDrawer === 'tasks'
              ? 'bg-white/30 dark:bg-white/20 text-neutral-900 dark:text-white shadow-sm'
              : 'hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          <CheckSquare size={17} />
          {incompleteTaskCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
              {incompleteTaskCount > 9 ? '9+' : incompleteTaskCount}
            </span>
          )}
        </button>

        {/* Stats Button */}
        <button
          onClick={() => setActiveDrawer('stats')}
          aria-label="Open statistics panel"
          title="Focus Analytics"
          className={`relative p-3 rounded-full transition-all active:scale-95 text-inherit ${
            activeDrawer === 'stats'
              ? 'bg-white/30 dark:bg-white/20 text-neutral-900 dark:text-white shadow-sm'
              : 'hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          <BarChart2 size={17} />
          {streak > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white px-1 rounded-full text-[8px] font-extrabold flex items-center shadow-sm">
              🔥{streak}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setActiveDrawer('settings')}
          aria-label="Open settings panel"
          title="Settings"
          className={`p-3 rounded-full transition-all active:scale-95 text-inherit ${
            activeDrawer === 'settings'
              ? 'bg-white/30 dark:bg-white/20 text-neutral-900 dark:text-white shadow-sm'
              : 'hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          <SettingsIcon size={17} />
        </button>
      </div>

      {/* Slide-over Side Drawer Container */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        activeDrawer !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
          onClick={() => setActiveDrawer(null)}
        />
        {/* Drawer Panel */}
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 flex flex-col transition-transform duration-300 transform text-neutral-800 dark:text-neutral-100 ${
          activeDrawer !== null ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Drawer Header Tabs */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80 mb-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-neutral-100/70 dark:bg-neutral-800/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveDrawer('tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDrawer === 'tasks'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <CheckSquare size={13} />
                <span>Tasks</span>
                {incompleteTaskCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px]">
                    {incompleteTaskCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveDrawer('stats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDrawer === 'stats'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <BarChart2 size={13} />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveDrawer('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDrawer === 'settings'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <SettingsIcon size={13} />
                <span>Settings</span>
              </button>
            </div>

            <button
              onClick={() => setActiveDrawer(null)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {activeDrawer === 'tasks' && <TaskList />}
            {activeDrawer === 'stats' && <Stats />}
            {activeDrawer === 'settings' && <Settings />}
          </div>
        </div>
      </div>

      {/* Milestone Badge Toast & Modal */}
      <BadgeToast />
      <BadgesModal />

      {/* Footer */}
      <footer
        className={`w-full py-6 text-center border-t border-neutral-200/10 dark:border-neutral-900/10 mt-auto text-[10px] text-neutral-400 dark:text-neutral-500 backdrop-blur-[2px] z-10 ${
          focusMode || (isFullscreen && isInactive) 
            ? 'translate-y-full opacity-0 h-0 py-0 overflow-hidden duration-700' 
            : 'translate-y-0 opacity-100 duration-500'
        }`}
      >
        <p>© 2026 FocusFlow. Designed with minimalist aesthetics. LocalStorage persisted.</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PomodoroProvider>
      <DashboardContent />
    </PomodoroProvider>
  );
};

export default App;
