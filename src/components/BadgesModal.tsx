import React, { useState, useEffect } from 'react';
import { usePomodoro, type Badge } from '../context/PomodoroContext';
import {
  Moon,
  Sun,
  Target,
  Award,
  Shield,
  Zap,
  Sparkles,
  Wind,
  Droplets,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const BADGE_ICONS: Record<Badge['iconName'], React.FC<{ size?: number; className?: string }>> = {
  Moon,
  Sun,
  Target,
  Award,
  Shield,
  Zap,
  Sparkles,
  Wind,
  Droplets,
};

export const BadgesModal: React.FC = () => {
  const {
    isBadgesModalOpen,
    setIsBadgesModalOpen,
    badges,
    unlockedBadgesCount,
    todayFocusMinutes,
    dailyGoalPercentage,
    settings,
  } = usePomodoro();

  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'time' | 'volume' | 'streak' | 'wellness'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBadgesModalOpen) {
        setIsBadgesModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBadgesModalOpen, setIsBadgesModalOpen]);

  if (!isBadgesModalOpen) return null;

  const filteredBadges = badges.filter((b) => {
    if (statusFilter === 'unlocked' && !b.unlocked) return false;
    if (statusFilter === 'locked' && b.unlocked) return false;
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    return true;
  });

  const completionPercentage = Math.round((unlockedBadgesCount / badges.length) * 100);

  const formatFocusTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsBadgesModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Focus Goals & Milestone Badges
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Unlock achievements and maintain daily focus consistency
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBadgesModalOpen(false)}
            aria-label="Close modal"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 sm:px-6 sm:py-4 bg-neutral-50/60 dark:bg-neutral-850/40 border-b border-neutral-100 dark:border-neutral-800/60">
          {/* Daily Goal Status Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-xs">
            <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 36 36">
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
              <Target size={16} className="absolute text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Daily Focus Goal</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{dailyGoalPercentage}%</span>
              </div>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                {formatFocusTime(todayFocusMinutes)} completed of {formatFocusTime(settings.dailyFocusTarget)} target
              </p>
            </div>
          </div>

          {/* Badges Progress Summary */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Award size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Milestone Badges</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{unlockedBadgesCount} / {badges.length}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 sm:px-6 border-b border-neutral-100 dark:border-neutral-800/60 flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/70 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              All ({badges.length})
            </button>
            <button
              onClick={() => setStatusFilter('unlocked')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'unlocked'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Unlocked ({unlockedBadgesCount})
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'locked'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              In Progress ({badges.length - unlockedBadgesCount})
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold text-neutral-500">
            {(['all', 'time', 'volume', 'streak', 'wellness'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-750'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3 custom-scrollbar">
          {filteredBadges.length === 0 ? (
            <div className="py-12 text-center">
              <Award size={32} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
              <p className="text-xs font-semibold text-neutral-500">No badges match the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBadges.map((badge) => {
                const Icon = BADGE_ICONS[badge.iconName] || Award;
                const isUnlocked = badge.unlocked;
                const progressPct = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.06] dark:from-amber-500/[0.02] dark:to-orange-500/[0.04] border-amber-500/30 dark:border-amber-500/20 shadow-xs'
                        : 'bg-white dark:bg-neutral-900/60 border-neutral-200/70 dark:border-neutral-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon container */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/20'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        <Icon size={20} className="stroke-[2.2]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {badge.title}
                          </h4>
                          {isUnlocked ? (
                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Lock size={11} className="text-neutral-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer with progress or unlocked date */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60">
                      {isUnlocked ? (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            ✨ Unlocked
                          </span>
                          <span className="text-neutral-400 dark:text-neutral-500">
                            {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Active'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                            <span>{badge.progressLabel}</span>
                            <span className="font-bold tabular-nums text-neutral-600 dark:text-neutral-300">
                              {progressPct}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
