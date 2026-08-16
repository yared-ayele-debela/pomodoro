import React, { useEffect } from 'react';
import { usePomodoro, type Badge } from '../context/PomodoroContext';
import { Moon, Sun, Target, Award, Shield, Zap, Sparkles, Wind, Droplets, X, Check } from 'lucide-react';

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

export const BadgeToast: React.FC = () => {
  const { recentUnlockedBadge, dismissBadgeToast, setIsBadgesModalOpen } = usePomodoro();

  useEffect(() => {
    if (!recentUnlockedBadge) return;
    const timer = setTimeout(() => {
      dismissBadgeToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [recentUnlockedBadge, dismissBadgeToast]);

  if (!recentUnlockedBadge) return null;

  const IconComponent = BADGE_ICONS[recentUnlockedBadge.iconName] || Award;

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-neutral-900/95 dark:bg-neutral-800/95 text-white border border-amber-500/40 shadow-2xl backdrop-blur-md max-w-sm">
        {/* Glowing Badge Icon Container */}
        <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 shadow-md">
          <IconComponent size={22} className="stroke-[2.2]" />
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
            <Check size={10} strokeWidth={3} />
          </span>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              Badge Unlocked!
            </span>
          </div>
          <h4 className="text-sm font-bold text-white truncate">
            {recentUnlockedBadge.title}
          </h4>
          <p className="text-[11px] text-neutral-300 line-clamp-1">
            {recentUnlockedBadge.description}
          </p>
        </div>

        {/* Action / Dismiss Buttons */}
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <button
            onClick={dismissBadgeToast}
            aria-label="Dismiss toast"
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-colors"
          >
            <X size={14} />
          </button>
          <button
            onClick={() => {
              dismissBadgeToast();
              setIsBadgesModalOpen(true);
            }}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline mt-1"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
};
