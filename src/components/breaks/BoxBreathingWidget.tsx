import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { audio } from '../../utils/audio';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Wind } from 'lucide-react';

interface BreathingPattern {
  id: 'box' | 'relax' | 'equal';
  name: string;
  phases: {
    type: 'inhale' | 'hold' | 'exhale' | 'hold2';
    label: string;
    sublabel: string;
    duration: number; // seconds
  }[];
}

const BREATHING_PATTERNS: Record<string, BreathingPattern> = {
  box: {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    phases: [
      { type: 'inhale', label: 'Breathe In', sublabel: 'Inhale slowly through nose', duration: 4 },
      { type: 'hold', label: 'Hold Breath', sublabel: 'Keep lungs full & relaxed', duration: 4 },
      { type: 'exhale', label: 'Breathe Out', sublabel: 'Exhale smoothly through mouth', duration: 4 },
      { type: 'hold2', label: 'Hold & Rest', sublabel: 'Empty lungs, feel the stillness', duration: 4 },
    ],
  },
  relax: {
    id: 'relax',
    name: '4-7-8 Deep Calm',
    phases: [
      { type: 'inhale', label: 'Breathe In', sublabel: 'Inhale quietly through nose', duration: 4 },
      { type: 'hold', label: 'Hold Breath', sublabel: 'Hold breath gently', duration: 7 },
      { type: 'exhale', label: 'Exhale', sublabel: 'Whoosh air out completely', duration: 8 },
    ],
  },
  equal: {
    id: 'equal',
    name: 'Equal Breath (4-4)',
    phases: [
      { type: 'inhale', label: 'Breathe In', sublabel: 'Smooth deep inhalation', duration: 4 },
      { type: 'exhale', label: 'Breathe Out', sublabel: 'Smooth steady exhalation', duration: 4 },
    ],
  },
};

export const BoxBreathingWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    settings,
    updateSettings,
    breathingCyclesCompleted,
    incrementBreathingCycles,
  } = usePomodoro();

  const [patternKey, setPatternKey] = useState<'box' | 'relax' | 'equal'>('box');
  const activePattern = BREATHING_PATTERNS[patternKey];

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(activePattern.phases[0].duration);
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.breathingAudioGuidance ?? false);

  // Sync breathing sound with settings
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    updateSettings({ breathingAudioGuidance: next });
    if (next) {
      audio.playBreathingCue('inhale', 0.15);
    }
  };

  const activePhase = activePattern.phases[phaseIndex] || activePattern.phases[0];

  // Pacing interval ticker (runs every second for clean phase countdown)
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setPhaseSecondsLeft((prevSec) => {
        if (prevSec > 1) {
          return prevSec - 1;
        }

        // Phase finished -> advance to next phase
        setPhaseIndex((currIndex) => {
          const nextIndex = (currIndex + 1) % activePattern.phases.length;
          // Completed a full cycle
          if (nextIndex === 0) {
            incrementBreathingCycles();
            if (soundEnabled) {
              audio.playBreathingCue('finish', 0.2);
            }
          } else if (soundEnabled) {
            const nextPhase = activePattern.phases[nextIndex];
            audio.playBreathingCue(nextPhase.type, 0.18);
          }
          return nextIndex;
        });

        // Set duration for the new phase
        const nextIdx = (phaseIndex + 1) % activePattern.phases.length;
        return activePattern.phases[nextIdx].duration;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, activePattern, phaseIndex, soundEnabled, incrementBreathingCycles]);

  // When pattern changes, reset phase index & timer
  const handleSelectPattern = (key: 'box' | 'relax' | 'equal') => {
    setPatternKey(key);
    setPhaseIndex(0);
    setPhaseSecondsLeft(BREATHING_PATTERNS[key].phases[0].duration);
  };

  const handleReset = () => {
    setPhaseIndex(0);
    setPhaseSecondsLeft(activePattern.phases[0].duration);
    setIsBreathingActive(true);
  };

  // Calculate progress within current phase (0.0 to 1.0)
  const phaseDuration = activePhase.duration;
  const phaseProgress = (phaseDuration - phaseSecondsLeft + 1) / phaseDuration;

  // Determine circle scale based on phase
  let targetScale = 0.75;
  if (activePhase.type === 'inhale') {
    targetScale = 0.70 + 0.30 * Math.min(1, phaseProgress);
  } else if (activePhase.type === 'hold') {
    targetScale = 1.0;
  } else if (activePhase.type === 'exhale') {
    targetScale = 1.0 - 0.30 * Math.min(1, phaseProgress);
  } else if (activePhase.type === 'hold2') {
    targetScale = 0.70;
  }

  // Phase accent colors
  const getPhaseTheme = () => {
    switch (activePhase.type) {
      case 'inhale':
        return {
          glow: 'from-teal-500/30 to-emerald-500/20',
          text: 'text-teal-600 dark:text-teal-400',
          ring: 'stroke-teal-500 dark:stroke-teal-400',
          bg: 'bg-teal-500/10 dark:bg-teal-400/10',
          border: 'border-teal-500/30',
        };
      case 'hold':
        return {
          glow: 'from-amber-500/30 to-yellow-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          ring: 'stroke-amber-500 dark:stroke-amber-400',
          bg: 'bg-amber-500/10 dark:bg-amber-400/10',
          border: 'border-amber-500/30',
        };
      case 'exhale':
        return {
          glow: 'from-blue-500/30 to-indigo-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          ring: 'stroke-blue-500 dark:stroke-blue-400',
          bg: 'bg-blue-500/10 dark:bg-blue-400/10',
          border: 'border-blue-500/30',
        };
      case 'hold2':
        return {
          glow: 'from-violet-500/30 to-purple-500/20',
          text: 'text-violet-600 dark:text-violet-400',
          ring: 'stroke-violet-500 dark:stroke-violet-400',
          bg: 'bg-violet-500/10 dark:bg-violet-400/10',
          border: 'border-violet-500/30',
        };
    }
  };

  const theme = getPhaseTheme();

  return (
    <div className={`flex flex-col items-center justify-center select-none w-full max-w-xl mx-auto ${compact ? 'py-2' : 'py-4 md:py-6'}`}>
      {/* Pattern Selector Chips & Sound Toggle */}
      <div className="flex items-center justify-between w-full max-w-sm mb-6 px-2">
        <div className="flex bg-neutral-200/50 dark:bg-neutral-800/60 backdrop-blur-md p-1 rounded-full border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm text-xs">
          <button
            onClick={() => handleSelectPattern('box')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 ${
              patternKey === 'box'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Box 4-4-4-4
          </button>
          <button
            onClick={() => handleSelectPattern('relax')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 ${
              patternKey === 'relax'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            4-7-8 Calm
          </button>
          <button
            onClick={() => handleSelectPattern('equal')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 ${
              patternKey === 'equal'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            4-4 Equal
          </button>
        </div>

        {/* Audio guidance toggle button */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Audio Chimes On (Click to Mute)' : 'Audio Chimes Off (Click to Enable)'}
          aria-label="Toggle breathing sound guidance"
          className={`p-2 rounded-full border transition-all duration-200 active:scale-95 shadow-sm ${
            soundEnabled
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
              : 'bg-neutral-100 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Main Breathing Visualizer */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 md:w-88 md:h-88 my-2">
        {/* Ambient Pulsing Glow Backdrop */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-30 bg-gradient-to-tr transition-all duration-1000 ${theme.glow}`}
          style={{
            transform: `scale(${targetScale * 1.1})`,
            transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Outer Guide Frame (Box / Circle Perimeter) */}
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-neutral-300/40 dark:border-neutral-700/40 pointer-events-none" />

        {/* 4 Phase Indicator Badges Around Perimeter (for Box Breathing) */}
        {patternKey === 'box' && (
          <>
            {/* Top: Inhale */}
            <div
              className={`absolute top-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-500 border ${
                phaseIndex === 0
                  ? 'bg-teal-500 text-white border-teal-400 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500 border-neutral-200/50 dark:border-neutral-700/50 opacity-60'
              }`}
            >
              1. Inhale 4s
            </div>

            {/* Right: Hold */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-500 border ${
                phaseIndex === 1
                  ? 'bg-amber-500 text-white border-amber-400 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500 border-neutral-200/50 dark:border-neutral-700/50 opacity-60'
              }`}
            >
              2. Hold 4s
            </div>

            {/* Bottom: Exhale */}
            <div
              className={`absolute bottom-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-500 border ${
                phaseIndex === 2
                  ? 'bg-blue-500 text-white border-blue-400 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500 border-neutral-200/50 dark:border-neutral-700/50 opacity-60'
              }`}
            >
              3. Exhale 4s
            </div>

            {/* Left: Hold & Rest */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-500 border ${
                phaseIndex === 3
                  ? 'bg-violet-500 text-white border-violet-400 shadow-md scale-105'
                  : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500 border-neutral-200/50 dark:border-neutral-700/50 opacity-60'
              }`}
            >
              4. Hold 4s
            </div>
          </>
        )}

        {/* Expanding & Contracting Core Breathing Circle */}
        <div
          className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl border ${theme.border} ${theme.bg} transition-all duration-1000 ease-in-out`}
          style={{
            transform: `scale(${targetScale})`,
            transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Subtle concentric inner aura */}
          <div className="absolute inset-3 rounded-full border border-white/20 dark:border-white/10 pointer-events-none" />

          {/* Phase Icon */}
          <Wind className={`w-5 h-5 mb-1 transition-colors duration-500 ${theme.text}`} />

          {/* Current Phase Title */}
          <h3 className={`text-sm sm:text-base font-extrabold uppercase tracking-widest transition-colors duration-500 ${theme.text}`}>
            {activePhase.label}
          </h3>

          {/* Second Countdown Digit */}
          <div className="text-4xl sm:text-5xl font-light tabular-nums tracking-tight text-neutral-900 dark:text-white my-1">
            {phaseSecondsLeft}
          </div>

          {/* Subtitle helper prompt */}
          <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 text-center px-4 leading-tight max-w-[170px]">
            {activePhase.sublabel}
          </p>
        </div>
      </div>

      {/* Cycle Counter & Feedback */}
      <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800 shadow-sm text-xs text-neutral-600 dark:text-neutral-300">
        <Sparkles size={14} className="text-amber-500" />
        <span>Completed Cycles: <strong className="font-bold text-neutral-900 dark:text-white">{breathingCyclesCompleted}</strong></span>
        {breathingCyclesCompleted >= 4 && (
          <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
            Zen Master ✨
          </span>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleReset}
          title="Reset Breathing Cycle"
          aria-label="Reset breathing cycle"
          className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={() => setIsBreathingActive(!isBreathingActive)}
          title={isBreathingActive ? 'Pause Breathing Guide' : 'Start Breathing Guide'}
          aria-label={isBreathingActive ? 'Pause breathing' : 'Resume breathing'}
          className={`px-6 py-2.5 rounded-full font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 ${
            isBreathingActive
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isBreathingActive ? (
            <>
              <Pause size={14} fill="currentColor" />
              <span>Pause Guide</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              <span>Resume Guide</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
