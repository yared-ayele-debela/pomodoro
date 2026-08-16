import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { audio } from '../../utils/audio';
import { Droplets, Footprints, CheckCircle2, RotateCcw, Play, Pause, Plus } from 'lucide-react';

export const HydrationMovementWidget: React.FC = () => {
  const { waterGlasses, logWater, resetWater } = usePomodoro();

  const [walkSecondsLeft, setWalkSecondsLeft] = useState(60);
  const [isWalkRunning, setIsWalkRunning] = useState(false);
  const [walkCompleted, setWalkCompleted] = useState(false);

  const dailyGoal = 8;
  const progressPercent = Math.min(100, Math.round((waterGlasses / dailyGoal) * 100));

  // Walk countdown timer
  useEffect(() => {
    if (!isWalkRunning) return;

    const timer = setInterval(() => {
      setWalkSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsWalkRunning(false);
          setWalkCompleted(true);
          audio.playActivityComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWalkRunning]);

  const handleResetWalk = () => {
    setWalkSecondsLeft(60);
    setIsWalkRunning(false);
    setWalkCompleted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Hydration Tracker Card */}
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
                  <Droplets size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">Hydration Tracker</h3>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Goal: 8 glasses (2.0 L)</span>
                </div>
              </div>

              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                {waterGlasses}/{dailyGoal}
              </span>
            </div>

            {/* Droplet visual grid (8 glasses) */}
            <div className="grid grid-cols-4 gap-2 my-4">
              {Array.from({ length: dailyGoal }).map((_, idx) => {
                const isFilled = idx < waterGlasses;
                return (
                  <div
                    key={idx}
                    className={`h-10 rounded-xl flex items-center justify-center text-sm border transition-all duration-300 ${
                      isFilled
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400 scale-105 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600'
                    }`}
                  >
                    💧
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden mb-4">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              onClick={logWater}
              className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Drink 1 Glass 💧</span>
            </button>

            {waterGlasses > 0 && (
              <button
                onClick={resetWater}
                title="Reset water count"
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* 1-Minute Walk & Move Card */}
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Footprints size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">60s Desk Walk</h3>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Boost leg circulation</span>
                </div>
              </div>

              {walkCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={11} /> Done
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed mb-4">
              Stand up, shake out your arms and legs, and take a quick 1-minute walk around your room or hallway to clear mental fog.
            </p>

            {/* Visual 60s Countdown Area */}
            <div className="flex items-center justify-center gap-3 my-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <span className={`text-2xl ${isWalkRunning ? 'animate-bounce' : ''}`}>🚶</span>
              <div className="text-2xl sm:text-3xl font-light tabular-nums text-neutral-900 dark:text-white">
                {walkSecondsLeft}s
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              onClick={() => setIsWalkRunning(!isWalkRunning)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                isWalkRunning
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isWalkRunning ? (
                <>
                  <Pause size={13} fill="currentColor" />
                  <span>Pause Walk</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>{walkSecondsLeft === 60 ? 'Start 60s Walk' : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetWalk}
              title="Reset walk timer"
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
