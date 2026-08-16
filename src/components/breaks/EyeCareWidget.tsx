import React, { useState, useEffect } from 'react';
import { audio } from '../../utils/audio';
import { Eye, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Compass } from 'lucide-react';

interface EyeExercise {
  id: '20-20-20' | 'palming' | 'figure8' | 'blinking';
  title: string;
  subtitle: string;
  durationSeconds: number;
  instructions: string;
  scientificBenefit: string;
  badge: string;
}

const EYE_EXERCISES: EyeExercise[] = [
  {
    id: '20-20-20',
    title: 'The 20-20-20 Distance Rule',
    subtitle: 'Look 20 feet away for 20 seconds',
    durationSeconds: 20,
    instructions: 'Shift your gaze from your screen to an object at least 20 feet (6 meters) away, such as a window, tree, or far wall.',
    scientificBenefit: 'Relaxes the ciliary muscles in your eyes that get locked in place during prolonged close-up screen reading.',
    badge: 'Optometrist Recommended',
  },
  {
    id: 'palming',
    title: 'Thermal Eye Palming',
    subtitle: 'Soothing warmth & darkness',
    durationSeconds: 30,
    instructions: 'Rub your hands vigorously together until your palms feel warm. Gently cup your warm palms over your closed eyes without applying pressure to the eyeballs.',
    scientificBenefit: 'The soothing darkness and gentle warmth relieve optic nerve fatigue and accelerate tear film replenishment.',
    badge: 'Deep Relief',
  },
  {
    id: 'figure8',
    title: 'Figure-8 Visual Tracking',
    subtitle: 'Smooth ocular motility exercise',
    durationSeconds: 20,
    instructions: 'Follow the gentle infinity dot moving across the screen with your eyes, keeping your head and neck completely still.',
    scientificBenefit: 'Improves extraocular muscle flexibility, boosts coordination, and reduces eye stiffness.',
    badge: 'Eye Mobility',
  },
  {
    id: 'blinking',
    title: 'Conscious Blink Reset',
    subtitle: 'Replenish eye tear film',
    durationSeconds: 20,
    instructions: 'Close your eyes gently for 2 full seconds, open them, and take 10 slow, deliberate blinks to naturally lubricate your corneas.',
    scientificBenefit: 'Screen time reduces natural blink rates by over 60%, leading to dry eye syndrome and digital eye fatigue.',
    badge: 'Hydration Reset',
  },
];

export const EyeCareWidget: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<'20-20-20' | 'palming' | 'figure8' | 'blinking'>('20-20-20');
  const activeExercise = EYE_EXERCISES.find((e) => e.id === selectedExerciseId) || EYE_EXERCISES[0];

  const [secondsLeft, setSecondsLeft] = useState(activeExercise.durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [eyeSessionsCount, setEyeSessionsCount] = useState(0);

  // Reset timer when selecting another exercise
  useEffect(() => {
    setSecondsLeft(activeExercise.durationSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  }, [selectedExerciseId, activeExercise]);

  // Countdown timer loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsCompleted(true);
          setEyeSessionsCount((c) => c + 1);
          audio.playActivityComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleReset = () => {
    setSecondsLeft(activeExercise.durationSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const totalDuration = activeExercise.durationSeconds;
  const progressPercent = totalDuration > 0 ? ((totalDuration - secondsLeft) / totalDuration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      {/* Exercise Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 bg-neutral-100/70 dark:bg-neutral-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm text-xs">
        {EYE_EXERCISES.map((ex) => {
          const isSelected = ex.id === selectedExerciseId;
          return (
            <button
              key={ex.id}
              onClick={() => setSelectedExerciseId(ex.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-white dark:bg-neutral-900 text-teal-600 dark:text-teal-400 shadow-sm scale-102'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {ex.title}
            </button>
          );
        })}
      </div>

      {/* Main Eye Care Visual Card */}
      <div className="w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Header with icon & badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-500/20 shadow-inner">
              <Eye size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                  {activeExercise.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {activeExercise.badge}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {activeExercise.subtitle}
              </p>
            </div>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold animate-in fade-in zoom-in-95">
              <CheckCircle2 size={13} />
              <span>Eyes Refreshed!</span>
            </div>
          )}
        </div>

        {/* Visual Focus Horizon / Animation Area */}
        <div className="relative w-full h-36 sm:h-44 bg-gradient-to-b from-teal-500/5 via-cyan-500/5 to-blue-500/10 dark:from-neutral-950/80 dark:to-neutral-900/80 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 flex flex-col items-center justify-center overflow-hidden my-3">
          {selectedExerciseId === '20-20-20' && (
            <div className="relative flex flex-col items-center justify-center text-center p-4">
              {/* Pulsing Horizon Circle */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-300 blur-xl opacity-30 absolute transition-all duration-1000 ${
                  isRunning ? 'scale-150 animate-pulse' : 'scale-100'
                }`}
              />
              <div className="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-600 dark:text-teal-300 z-10 shadow-lg animate-pulse">
                <Compass size={18} />
              </div>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mt-2 z-10">
                Focus on an object 20+ feet away
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 z-10">
                Look out the window or at a far wall
              </span>
            </div>
          )}

          {selectedExerciseId === 'figure8' && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Infinity Symbol Track */}
              <svg className="w-48 h-24 stroke-teal-500/30 dark:stroke-teal-400/20 fill-none" viewBox="0 0 100 50">
                <path
                  d="M 25,25 C 25,10 5,10 5,25 C 5,40 25,40 50,25 C 75,10 95,10 95,25 C 95,40 75,40 50,25 C 25,10 25,10 25,25 Z"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>
              {/* Animated Floating Eye Tracker Dot */}
              <div
                className={`absolute w-4 h-4 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.8)] border border-white ${
                  isRunning ? 'animate-bounce' : ''
                }`}
                style={{
                  transition: 'all 2s ease-in-out',
                }}
              />
              <span className="absolute bottom-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                Follow the dot with your eyes (keep head still)
              </span>
            </div>
          )}

          {selectedExerciseId === 'palming' && (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="text-3xl mb-1">🤲</div>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                Warm Palms Over Closed Eyes
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-xs mt-0.5">
                Enjoy 30 seconds of restorative darkness & soothing warmth
              </span>
            </div>
          )}

          {selectedExerciseId === 'blinking' && (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="text-3xl mb-1">👀</div>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                10 Slow Conscious Blinks
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-xs mt-0.5">
                Close 2s, open, and naturally blink to restore natural moisture
              </span>
            </div>
          )}
        </div>

        {/* Instructions & Medical Benefit */}
        <div className="space-y-2 mb-4">
          <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
            {activeExercise.instructions}
          </p>

          <div className="flex items-start gap-2 px-3 py-2 bg-teal-500/5 border border-teal-500/20 rounded-xl text-[11px] text-teal-800 dark:text-teal-300">
            <Sparkles size={13} className="text-teal-500 flex-shrink-0 mt-0.5" />
            <span><strong className="font-semibold">Why it works:</strong> {activeExercise.scientificBenefit}</span>
          </div>
        </div>

        {/* Timer Bar & Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            {/* Circular Progress */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90 transform" aria-hidden="true">
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  className="stroke-neutral-200 dark:stroke-neutral-800 fill-none"
                  strokeWidth="3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  className="stroke-teal-500 fill-none transition-all duration-300"
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold tabular-nums text-neutral-900 dark:text-white">
                {secondsLeft}s
              </span>
            </div>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                isRunning
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={13} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>{secondsLeft === totalDuration ? `Start ${totalDuration}s Eye Break` : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              title="Reset Timer"
              aria-label="Reset eye break timer"
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {eyeSessionsCount > 0 && (
            <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
              Refreshed: <strong className="text-teal-600 dark:text-teal-400 font-bold">{eyeSessionsCount}x</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
