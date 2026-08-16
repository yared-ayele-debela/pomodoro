import React, { useEffect, useState } from 'react';
import { usePomodoro } from '../context/PomodoroContext';

const breakSuggestions = [
  "Drink a glass of water 💧",
  "Look 20ft away for 20s 👀",
  "Stretch your shoulders 🧘",
  "Roll your wrists and fingers ✍️",
  "Close your eyes to rest 😴",
  "Walk around for a minute 🚶",
  "Roll your neck gently 🙆",
  "Take 3 deep breaths 🌬️"
];
import { Play, Pause, RotateCcw, SkipForward, EyeOff, Eye, Maximize, Minimize, Wind, Target, Award } from 'lucide-react';
import { GuidedBreaksContainer } from './breaks/GuidedBreaksContainer';

export const Timer: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    settings,
    focusMode,
    toggleFocusMode,
    completedPomodoros,
    tasks,
    activeTaskId,
    isFullscreen,
    toggleFullscreen,
    breakActivity,
    setBreakActivity,
    todayFocusMinutes,
    dailyGoalPercentage,
    badges,
    unlockedBadgesCount,
    setIsBadgesModalOpen,
  } = usePomodoro();

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    if (mode !== 'work') {
      const random = breakSuggestions[Math.floor(Math.random() * breakSuggestions.length)];
      setSuggestion(random);
    }
  }, [mode]);

  const cycleSuggestion = () => {
    const currentIndex = breakSuggestions.indexOf(suggestion);
    const nextIndex = (currentIndex + 1) % breakSuggestions.length;
    setSuggestion(breakSuggestions[nextIndex]);
  };

  const getTotalSeconds = () => {
    if (mode === 'work') return settings.workDuration * 60;
    if (mode === 'short') return settings.shortBreakDuration * 60;
    return settings.longBreakDuration * 60;
  };

  const totalSeconds = getTotalSeconds();
  const percentage = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  
  // Circumference for r = 120 is 2 * PI * 120 = 753.98 (we use 754)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Accent color mapping based on mode & custom focusColor setting
  const getColors = () => {
    if (mode === 'short') {
      return {
        stroke: 'stroke-emerald-500 dark:stroke-emerald-400',
        text: 'text-emerald-500 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
        border: 'border-emerald-500/20 dark:border-emerald-400/20',
        accent: 'emerald',
        glow: 'bg-emerald-500',
      };
    }
    if (mode === 'long') {
      return {
        stroke: 'stroke-violet-500 dark:stroke-violet-400',
        text: 'text-violet-500 dark:text-violet-400',
        bg: 'bg-violet-500/10 dark:bg-violet-400/10',
        border: 'border-violet-500/20 dark:border-violet-400/20',
        accent: 'violet',
        glow: 'bg-violet-500',
      };
    }

    // Work / Focus Mode (configurable color)
    const fc = settings.focusColor || 'blue';
    if (fc === 'emerald') {
      return {
        stroke: 'stroke-emerald-600 dark:stroke-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-500',
        bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
        border: 'border-emerald-500/20 dark:border-emerald-400/20',
        accent: 'emerald',
        glow: 'bg-emerald-500',
      };
    }
    if (fc === 'rose') {
      return {
        stroke: 'stroke-rose-600 dark:stroke-rose-500',
        text: 'text-rose-600 dark:text-rose-500',
        bg: 'bg-rose-500/10 dark:bg-rose-400/10',
        border: 'border-rose-500/20 dark:border-rose-400/20',
        accent: 'rose',
        glow: 'bg-rose-500',
      };
    }
    if (fc === 'amber') {
      return {
        stroke: 'stroke-amber-600 dark:stroke-amber-500',
        text: 'text-amber-600 dark:text-amber-500',
        bg: 'bg-amber-500/10 dark:bg-amber-400/10',
        border: 'border-amber-500/20 dark:border-amber-400/20',
        accent: 'amber',
        glow: 'bg-amber-500',
      };
    }
    if (fc === 'violet') {
      return {
        stroke: 'stroke-violet-600 dark:stroke-violet-500',
        text: 'text-violet-600 dark:text-violet-500',
        bg: 'bg-violet-500/10 dark:bg-violet-400/10',
        border: 'border-violet-500/20 dark:border-violet-400/20',
        accent: 'violet',
        glow: 'bg-violet-500',
      };
    }

    // Default Ocean Blue
    return {
      stroke: 'stroke-blue-600 dark:stroke-blue-500',
      text: 'text-blue-600 dark:text-blue-500',
      bg: 'bg-blue-500/10 dark:bg-blue-400/10',
      border: 'border-blue-500/20 dark:border-blue-400/20',
      accent: 'blue',
      glow: 'bg-blue-500',
    };
  };

  const colors = getColors();

  // Keyboard Shortcuts (Space = play/pause, R = reset, N = skip, B = toggle break activities)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in input fields
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA' || document.activeElement?.getAttribute('contenteditable') === 'true') {
        return;
      }

      const key = e.key.toLowerCase();
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) pauseTimer();
        else startTimer();
      } else if (key === 'r') {
        resetTimer();
      } else if (key === 'n') {
        skipTimer();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 'b' && mode !== 'work') {
        setBreakActivity(breakActivity === 'classic' ? 'breathing' : 'classic');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning, timeLeft, mode, breakActivity, setBreakActivity]);

  const getModeLabel = () => {
    if (mode === 'work') return 'Focus Session';
    if (mode === 'short') return 'Short Break';
    return 'Long Break';
  };

  const minsStr = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secsStr = (timeLeft % 60).toString().padStart(2, '0');

  // If break mode is active and guided breaks are enabled, present the interactive micro-breaks hub
  if (mode !== 'work' && settings.guidedBreaksEnabled && breakActivity !== 'classic') {
    return <GuidedBreaksContainer onSwitchToClassicTimer={() => setBreakActivity('classic')} />;
  }

  if (isFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 select-none py-6 md:py-12">
        {/* Mode & Switch to Micro-Breaks Chip */}
        {mode !== 'work' && settings.guidedBreaksEnabled && (
          <button
            onClick={() => setBreakActivity('breathing')}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer z-30"
          >
            <Wind size={14} />
            <span>Open Guided Micro-Breaks</span>
          </button>
        )}

        {/* Flip Clock Cards */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Minutes Card */}
          <div className="relative w-36 h-44 sm:w-56 sm:h-64 md:w-72 md:h-80 lg:w-96 lg:h-[22rem] bg-[#222222] dark:bg-[#1a1a1a] border border-white/[0.08] rounded-2xl sm:rounded-3xl md:rounded-[36px] shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Horizontal Split Line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/80 z-20 shadow-sm" />
            {/* Subtle Top Lighting */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] z-10 pointer-events-none" />
            
            <span className="font-flip text-[7rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem] font-bold text-[#d1d5db] leading-none tracking-tight tabular-nums transform translate-y-1 sm:translate-y-2 select-none">
              {minsStr}
            </span>
          </div>

          {/* Seconds Card */}
          <div className="relative w-36 h-44 sm:w-56 sm:h-64 md:w-72 md:h-80 lg:w-96 lg:h-[22rem] bg-[#222222] dark:bg-[#1a1a1a] border border-white/[0.08] rounded-2xl sm:rounded-3xl md:rounded-[36px] shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Horizontal Split Line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/80 z-20 shadow-sm" />
            {/* Subtle Top Lighting */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] z-10 pointer-events-none" />
            
            <span className="font-flip text-[7rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem] font-bold text-[#d1d5db] leading-none tracking-tight tabular-nums transform translate-y-1 sm:translate-y-2 select-none">
              {secsStr}
            </span>
          </div>
        </div>

        {/* Active Task / Mode Info */}
        <div className="mt-6 text-center">
          {mode !== 'work' ? (
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 dark:text-neutral-500">
              {suggestion}
            </p>
          ) : activeTask ? (
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 dark:text-neutral-500 truncate max-w-xs sm:max-w-md">
              {activeTask.title} ({activeTask.completedPomodoros}/{activeTask.estimatedPomodoros})
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-semibold text-neutral-400 dark:text-neutral-500">
              {getModeLabel()} • Session #{completedPomodoros + 1}
            </p>
          )}
        </div>

        {/* Fullscreen Controls */}
        <div className="flex items-center gap-4 mt-8 sm:mt-10 z-20">
          <button
            onClick={resetTimer}
            title="Reset (R)"
            aria-label="Reset Timer"
            className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            title={isRunning ? "Pause (Space)" : "Start (Space)"}
            aria-label="Start / Pause Timer"
            className="p-4 sm:p-5 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 transition-all active:scale-95 shadow-lg flex items-center justify-center"
          >
            {isRunning ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={skipTimer}
            title="Skip Session (N)"
            aria-label="Skip Session"
            className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <SkipForward size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Exit Fullscreen (F)"
            aria-label="Exit Fullscreen"
            className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <Minimize size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-700 ${focusMode ? 'py-16 md:py-24' : 'py-8'}`}>
      {/* Do Not Disturb Toggle Button */}
      {!focusMode && (
        <div className="mb-8 flex gap-2">
          <button
            onClick={toggleFocusMode}
            aria-label="Enter Focus Mode"
            className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors shadow-sm"
          >
            <EyeOff size={13} />
            <span>Enter Focus Mode</span>
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 px-4 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors shadow-sm"
          >
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      )}

      {/* Daily Focus Goal Progress Ring Indicator */}
      {settings.showDailyProgressRing && !focusMode && (
        <button
          type="button"
          onClick={() => setIsBadgesModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-neutral-900/70 hover:bg-white dark:hover:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-md cursor-pointer transition-all duration-300 shadow-xs mb-4 active:scale-95 group z-10"
          title="Daily Focus Goal & Milestone Badges"
        >
          {/* Mini SVG Progress Ring */}
          <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="stroke-neutral-200 dark:stroke-neutral-800 fill-none"
                strokeWidth="3.5"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${dailyGoalPercentage >= 100 ? 'stroke-amber-500' : 'stroke-blue-600 dark:stroke-blue-500'} fill-none transition-all duration-500`}
                strokeWidth="3.5"
                strokeDasharray={`${dailyGoalPercentage}, 100`}
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Target size={9} className="absolute text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span>
              Goal: {todayFocusMinutes < 60 ? `${todayFocusMinutes}m` : `${Math.floor(todayFocusMinutes / 60)}h ${todayFocusMinutes % 60 ? `${todayFocusMinutes % 60}m` : ''}`.trim()} / {settings.dailyFocusTarget < 60 ? `${settings.dailyFocusTarget}m` : `${Math.floor(settings.dailyFocusTarget / 60)}h ${settings.dailyFocusTarget % 60 ? `${settings.dailyFocusTarget % 60}m` : ''}`.trim()}
            </span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
              dailyGoalPercentage >= 100
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}>
              {dailyGoalPercentage}%
            </span>
          </div>

          {/* Badges count pill */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 border-l border-neutral-200 dark:border-neutral-800 pl-2">
            <Award size={12} className="text-amber-500" />
            <span>{unlockedBadgesCount}/{badges.length}</span>
          </div>
        </button>
      )}

      {/* Main Timer Display Group */}
      <div className="relative flex items-center justify-center select-none">
        {/* Glow Effect behind Timer Ring */}
        <div className={`absolute inset-0 rounded-full blur-[48px] opacity-10 dark:opacity-[0.15] transition-all duration-1000 ${
          colors.glow
        }`} />

        {/* Circular SVG Ring */}
        <svg className="w-72 h-72 md:w-80 md:h-80 -rotate-90 transform" aria-hidden="true">
          {/* Base Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-neutral-100 dark:stroke-neutral-800/60 fill-none"
            strokeWidth="10"
          />
          {/* Animated Remaining Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className={`fill-none ${colors.stroke} transition-all duration-300`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Text inside Ring */}
        <div className="absolute flex flex-col items-center text-center">
          <span className={`text-xs font-semibold tracking-widest uppercase transition-colors duration-500 ${colors.text}`}>
            {getModeLabel()}
          </span>
          <span className="text-5xl md:text-6xl font-light tracking-tight tabular-nums text-neutral-900 dark:text-neutral-50 mt-2 mb-1">
            {formatTime(timeLeft)}
          </span>
          
          {/* Linked Active Task Info / Break Suggestion */}
          {mode !== 'work' ? (
            <div className="flex items-center gap-1 mt-1 justify-center px-4 max-w-[190px]">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 animate-in fade-in duration-300 text-center leading-tight">
                {suggestion}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cycleSuggestion();
                }}
                className="text-neutral-450 hover:text-neutral-600 dark:hover:text-neutral-250 transition-colors p-0.5 rounded cursor-pointer"
                title="Next break suggestion"
              >
                <RotateCcw size={8} />
              </button>
            </div>
          ) : activeTask ? (
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 max-w-[180px] truncate" title={activeTask.title}>
              {activeTask.title} ({activeTask.completedPomodoros}/{activeTask.estimatedPomodoros})
            </span>
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Session #{completedPomodoros + 1}
            </span>
          )}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-4 mt-8 z-10">
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          title="Reset (R)"
          aria-label="Reset Timer"
          className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 active:scale-95 transition-all shadow-sm"
        >
          <RotateCcw size={18} />
        </button>

        {/* Start / Pause Button */}
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          title={isRunning ? "Pause (Space)" : "Start (Space)"}
          aria-label={isRunning ? "Pause Timer" : "Start Timer"}
          className={`px-8 py-3.5 rounded-full font-medium shadow-sm transition-all duration-300 active:scale-95 flex items-center gap-2.5 ${
            isRunning
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
              : `${colors.bg} ${colors.text} border ${colors.border} hover:bg-opacity-20 dark:hover:bg-opacity-20`
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={18} fill="currentColor" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              <span>Focus</span>
            </>
          )}
        </button>

        {/* Skip Button */}
        <button
          onClick={skipTimer}
          title="Skip Mode (N)"
          aria-label="Skip Session"
          className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 active:scale-95 transition-all shadow-sm"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Return to Guided Micro-Breaks Button if in break mode */}
      {mode !== 'work' && settings.guidedBreaksEnabled && (
        <button
          onClick={() => setBreakActivity('breathing')}
          className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Wind size={14} />
          <span>Open Guided Micro-Breaks</span>
        </button>
      )}

      {/* Focus Mode Leave Button */}
      {focusMode && (
        <button
          onClick={toggleFocusMode}
          aria-label="Leave Focus Mode"
          className="mt-12 flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 px-4 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors shadow-sm"
        >
          <Eye size={13} />
          <span>Exit Focus Mode</span>
        </button>
      )}
    </div>
  );
};
