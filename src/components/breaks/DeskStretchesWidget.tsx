import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { audio } from '../../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Activity,
  UserCheck,
} from 'lucide-react';

interface StretchItem {
  id: string;
  title: string;
  category: string;
  targetArea: string;
  durationSeconds: number;
  instructions: string[];
  tips: string;
  iconEmoji: string;
}

const DESK_STRETCHES: StretchItem[] = [
  {
    id: 'shoulder-rolls',
    title: 'Shoulder Rolls & Shrugs',
    category: 'Upper Body',
    targetArea: 'Trapezius & Upper Back',
    durationSeconds: 20,
    instructions: [
      'Inhale deeply and shrug both shoulders up towards your ears.',
      'Roll them backward in large, smooth circles, squeezing your shoulder blades.',
      'After 10 seconds, reverse direction and roll forward.',
    ],
    tips: 'Keep your neck long and unclench your jaw while rolling.',
    iconEmoji: '🙆',
  },
  {
    id: 'neck-tilt',
    title: 'Neck Lateral Release',
    category: 'Cervical Spine',
    targetArea: 'Scalenes & Neck Sides',
    durationSeconds: 20,
    instructions: [
      'Sit tall with your shoulders relaxed downward.',
      'Gently drop your right ear towards your right shoulder without lifting the shoulder.',
      'Hold for 10s, return to center, and gently tilt to the left side for 10s.',
    ],
    tips: 'Never yank or pull on your head; let gravity do the gentle work.',
    iconEmoji: '🧘',
  },
  {
    id: 'chest-opener',
    title: 'Chest Opener & Goalpost',
    category: 'Posture Reset',
    targetArea: 'Pectorals & Thoracic Spine',
    durationSeconds: 20,
    instructions: [
      'Bend both elbows at 90° at shoulder height like a goalpost.',
      'Draw your elbows and shoulder blades back, opening your chest.',
      'Hold and breathe deeply into your ribs.',
    ],
    tips: 'Perfect counter-movement for hunched desk and keyboard posture.',
    iconEmoji: '👐',
  },
  {
    id: 'wrist-stretch',
    title: 'Wrist & Finger Extension',
    category: 'Repetitive Strain Relief',
    targetArea: 'Forearms & Carpal Tunnel',
    durationSeconds: 20,
    instructions: [
      'Extend your right arm forward with palm facing forward like a "stop" sign.',
      'Use left hand to gently pull fingers back towards your body for 10s.',
      'Flip palm downward and gently press back of hand, then switch arms.',
    ],
    tips: 'Relieves strain from extensive typing, trackpad, and mouse use.',
    iconEmoji: '✍️',
  },
  {
    id: 'spinal-twist',
    title: 'Seated Spinal Twist',
    category: 'Spine Mobility',
    targetArea: 'Lumbar & Thoracic Rotators',
    durationSeconds: 25,
    instructions: [
      'Sit tall with feet flat on floor.',
      'Place your right hand on your left knee and your left hand on the chair back or armrest.',
      'Gently twist your torso to the left, looking over your left shoulder. Hold, then repeat on right.',
    ],
    tips: 'Inhale to lengthen your spine tall, exhale to gently rotate.',
    iconEmoji: '🔄',
  },
  {
    id: 'standing-hip',
    title: 'Standing Hip Flexor & Reach',
    category: 'Lower Body',
    targetArea: 'Hip Flexors & Core',
    durationSeconds: 25,
    instructions: [
      'Stand up from your desk chair.',
      'Step your right foot back into a shallow split stance, tucking your tailbone slightly.',
      'Reach both arms overhead and lean gently back to stretch the front hip. Repeat on left leg.',
    ],
    tips: 'Sitting shortens hip flexors; standing opens them back up.',
    iconEmoji: '🚶',
  },
  {
    id: 'upper-back-clasp',
    title: 'Upper Back & Rhomboid Clasp',
    category: 'Upper Back',
    targetArea: 'Rhomboids & Shoulder Blades',
    durationSeconds: 20,
    instructions: [
      'Interlace your fingers in front of your chest with palms facing away.',
      'Push your hands outward while tucking your chin and rounding your upper back.',
      'Breathe into the space between your shoulder blades.',
    ],
    tips: 'Feel the separation and gentle decompression across your upper back.',
    iconEmoji: '🛡️',
  },
];

export const DeskStretchesWidget: React.FC = () => {
  const { completedStretchesCount, incrementCompletedStretches } = usePomodoro();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStretch = DESK_STRETCHES[currentIndex];

  const [secondsLeft, setSecondsLeft] = useState(currentStretch.durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [completedStretches, setCompletedStretches] = useState<Record<string, boolean>>({});

  // Reset timer when changing stretch
  useEffect(() => {
    setSecondsLeft(currentStretch.durationSeconds);
    setIsRunning(false);
  }, [currentIndex, currentStretch]);

  // Countdown timer for active stretch
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          handleMarkDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentIndex]);

  const handleMarkDone = () => {
    if (!completedStretches[currentStretch.id]) {
      setCompletedStretches((prev) => ({ ...prev, [currentStretch.id]: true }));
      incrementCompletedStretches();
    } else {
      audio.playActivityComplete();
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % DESK_STRETCHES.length;
    setCurrentIndex(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + DESK_STRETCHES.length) % DESK_STRETCHES.length;
    setCurrentIndex(prevIdx);
  };

  const handleResetTimer = () => {
    setSecondsLeft(currentStretch.durationSeconds);
    setIsRunning(false);
  };

  const totalDuration = currentStretch.durationSeconds;
  const progressPercent = totalDuration > 0 ? ((totalDuration - secondsLeft) / totalDuration) * 100 : 0;
  const isDone = !!completedStretches[currentStretch.id];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      {/* Category Tag & Navigation Controls */}
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
          <Activity size={13} />
          <span>{currentStretch.category}</span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-600 dark:text-neutral-300">{currentStretch.targetArea}</span>
        </div>

        <div className="text-xs text-neutral-400 font-semibold tabular-nums">
          {currentIndex + 1} / {DESK_STRETCHES.length}
        </div>
      </div>

      {/* Main Stretch Card */}
      <div className="relative w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden transition-all duration-300">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-inner">
              {currentStretch.iconEmoji}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                {currentStretch.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Target: <span className="font-medium text-neutral-700 dark:text-neutral-300">{currentStretch.targetArea}</span>
              </p>
            </div>
          </div>

          {/* Quick Done Badge */}
          {isDone && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold animate-in fade-in zoom-in-95">
              <CheckCircle2 size={13} />
              <span>Done</span>
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 mb-4 bg-neutral-50/70 dark:bg-neutral-800/40 rounded-2xl p-3.5 border border-neutral-100 dark:border-neutral-800/80">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
            How to perform:
          </span>
          <ol className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed list-decimal list-inside pl-0.5 font-medium">
            {currentStretch.instructions.map((step, idx) => (
              <li key={idx} className="pl-1">
                <span className="text-neutral-700 dark:text-neutral-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Ergonomic Tip */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
          <Sparkles size={13} className="text-amber-500 flex-shrink-0" />
          <span><strong className="font-semibold">Tip:</strong> {currentStretch.tips}</span>
        </div>

        {/* Timer Bar & Stretch Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          {/* Circular Countdown Progress */}
          <div className="flex items-center gap-3">
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
                  className="stroke-emerald-500 fill-none transition-all duration-300"
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                  isRunning
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
                    <span>{secondsLeft === totalDuration ? 'Start 20s Stretch' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                title="Reset Stretch Timer"
                aria-label="Reset stretch timer"
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Action Buttons: Mark Done & Next */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleMarkDone}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-emerald-500/50 text-neutral-700 dark:text-neutral-300 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>{isDone ? 'Completed' : 'Mark Done'}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Stretch Switcher Thumbnails / Dots */}
      <div className="flex items-center justify-between w-full max-w-sm mt-4 px-2">
        <button
          onClick={handlePrev}
          aria-label="Previous stretch"
          className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          {DESK_STRETCHES.map((item, idx) => {
            const active = idx === currentIndex;
            const done = !!completedStretches[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                title={item.title}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active
                    ? 'w-6 bg-emerald-500 shadow-sm'
                    : done
                    ? 'w-2 bg-emerald-400/60'
                    : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next stretch"
          className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Completed Summary */}
      {completedStretchesCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <UserCheck size={13} className="text-emerald-500" />
          <span>Stretches completed today: <strong className="text-neutral-800 dark:text-neutral-200 font-bold">{completedStretchesCount}</strong></span>
        </div>
      )}
    </div>
  );
};
