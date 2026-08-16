import React, { useState, useEffect } from 'react';
import { usePomodoro, type BreakActivityType } from '../../context/PomodoroContext';
import { BoxBreathingWidget } from './BoxBreathingWidget';
import { DeskStretchesWidget } from './DeskStretchesWidget';
import { EyeCareWidget } from './EyeCareWidget';
import { HydrationMovementWidget } from './HydrationMovementWidget';
import {
  Wind,
  Activity,
  Eye,
  Droplets,
  Clock,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize,
  Minimize,
  Coffee,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const ROTATING_TIPS = [
  { text: 'Look 20 feet away for 20 seconds to relax your eye ciliary muscles 👀', target: 'eyecare' as BreakActivityType },
  { text: 'Roll your shoulders backward 5 times to release trapezius tension 🧘', target: 'stretches' as BreakActivityType },
  { text: 'Drink a fresh glass of water to replenish brain hydration 💧', target: 'hydration' as BreakActivityType },
  { text: 'Take 4 slow box breaths to activate the parasympathetic nervous system 🌬️', target: 'breathing' as BreakActivityType },
  { text: 'Stand up and take a quick 1-minute walk around the room 🚶', target: 'hydration' as BreakActivityType },
  { text: 'Gently tilt your neck from side to side to relieve spinal compression 🙆', target: 'stretches' as BreakActivityType },
];

export const GuidedBreaksContainer: React.FC<{ onSwitchToClassicTimer?: () => void }> = ({
  onSwitchToClassicTimer,
}) => {
  const {
    mode,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    settings,
    breakActivity,
    setBreakActivity,
    isFullscreen,
    toggleFullscreen,
  } = usePomodoro();

  const [tipIndex, setTipIndex] = useState(0);

  // Rotate helpful prompts every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalBreakSeconds = (mode === 'short' ? settings.shortBreakDuration : settings.longBreakDuration) * 60;
  const breakProgress = totalBreakSeconds > 0 ? ((totalBreakSeconds - timeLeft) / totalBreakSeconds) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTip = ROTATING_TIPS[tipIndex];

  const tabs: { id: BreakActivityType; label: string; icon: React.ReactNode }[] = [
    { id: 'breathing', label: 'Box Breathing', icon: <Wind size={14} /> },
    { id: 'stretches', label: 'Desk Stretches', icon: <Activity size={14} /> },
    { id: 'eyecare', label: '20-20-20 Eye Care', icon: <Eye size={14} /> },
    { id: 'hydration', label: 'Hydrate & Move', icon: <Droplets size={14} /> },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-2 sm:px-4 animate-in fade-in zoom-in-98 duration-400">
      {/* Break Header Bar with Break Timer Progress */}
      <div className="w-full bg-white/75 dark:bg-neutral-900/75 backdrop-blur-xl border border-neutral-200/70 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xl mb-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Mode Title & Time Left */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
              mode === 'short'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
            }`}>
              <Coffee size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {mode === 'short' ? 'Short Break' : 'Long Break'}
                </h2>
                <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Guided Micro-Break
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-light tabular-nums text-neutral-900 dark:text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-neutral-400 font-medium">remaining</span>
              </div>
            </div>
          </div>

          {/* Quick Timer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetTimer}
              title="Reset Break (R)"
              aria-label="Reset Break"
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              title={isRunning ? 'Pause Break (Space)' : 'Start Break (Space)'}
              aria-label={isRunning ? 'Pause Break' : 'Start Break'}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                isRunning
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={14} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Start Break</span>
                </>
              )}
            </button>

            <button
              onClick={skipTimer}
              title="Skip to Focus (N)"
              aria-label="Skip to Focus"
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <SkipForward size={15} />
            </button>

            {onSwitchToClassicTimer && (
              <button
                onClick={onSwitchToClassicTimer}
                title="Switch to Classic Timer View"
                aria-label="Switch to Classic Timer View"
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Clock size={15} />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>
        </div>

        {/* Break Progress Bar */}
        <div className="w-full bg-neutral-200/50 dark:bg-neutral-800/80 rounded-full h-1.5 overflow-hidden mt-4">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              mode === 'short' ? 'bg-emerald-500' : 'bg-violet-500'
            }`}
            style={{ width: `${breakProgress}%` }}
          />
        </div>

        {/* Rotating Care Prompt Banner */}
        <div
          onClick={() => setBreakActivity(currentTip.target)}
          className="mt-3.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-100/60 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2 truncate">
            <Sparkles size={12} className="text-amber-500 flex-shrink-0" />
            <span className="truncate">{currentTip.text}</span>
          </div>
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 flex-shrink-0 ml-2">
            Try activity <ChevronRight size={11} />
          </span>
        </div>
      </div>

      {/* Activity Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 bg-neutral-100/70 dark:bg-neutral-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm w-full max-w-lg">
        {tabs.map((tab) => {
          const isActive = breakActivity === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setBreakActivity(tab.id)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-md scale-102 border border-neutral-200/50 dark:border-neutral-700/50'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Active Activity Body */}
      <div className="w-full transition-all duration-300">
        {breakActivity === 'breathing' && <BoxBreathingWidget />}
        {breakActivity === 'stretches' && <DeskStretchesWidget />}
        {breakActivity === 'eyecare' && <EyeCareWidget />}
        {breakActivity === 'hydration' && <HydrationMovementWidget />}
      </div>
    </div>
  );
};
