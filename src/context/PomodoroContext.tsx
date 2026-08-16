import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';
import { loadAudioFileFromDB, saveAudioFileToDB, deleteAudioFileFromDB } from '../utils/audioStorage';

export interface ProjectTag {
  id: string;
  name: string;
  color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

export const TAG_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; hex: string }> = {
  blue: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500', hex: '#3b82f6' },
  violet: { bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/30', dot: 'bg-violet-500', hex: '#8b5cf6' },
  emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500', hex: '#10b981' },
  amber: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500', hex: '#f59e0b' },
  rose: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-500', hex: '#f43f5e' },
  cyan: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-500', hex: '#06b6d4' },
};

export const DEFAULT_TAGS: ProjectTag[] = [
  { id: 'work', name: 'Work', color: 'blue' },
  { id: 'study', name: 'Study', color: 'violet' },
  { id: 'coding', name: 'Coding', color: 'emerald' },
  { id: 'reading', name: 'Reading', color: 'amber' },
  { id: 'design', name: 'Design', color: 'rose' },
  { id: 'personal', name: 'Personal', color: 'cyan' },
];

export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: string;
  tagId?: string;
  tagName?: string;
  tagColor?: string;
}

export interface SessionRecord {
  id: string;
  mode: 'work' | 'short' | 'long';
  durationMinutes: number;
  timestamp: string; // ISO string
  taskId?: string;
  taskTitle?: string;
  tagId?: string;
  tagName?: string;
  tagColor?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: 'Moon' | 'Sun' | 'Target' | 'Award' | 'Shield' | 'Zap' | 'Sparkles' | 'Wind' | 'Droplets';
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  maxProgress: number;
  progressLabel: string;
  category: 'time' | 'streak' | 'volume' | 'wellness';
}

export interface TimerSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // sessions
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmVolume: number;
  alarmSound: 'digital' | 'bell' | 'soft';
  ambientSound: 'none' | 'rain' | 'white-noise' | 'lo-fi' | 'custom';
  ambientVolume: number;
  enableNotifications: boolean;
  theme: 'system' | 'light' | 'dark';
  customAudioUrl: string;
  customAudioName?: string;
  customAudioType?: 'file' | 'url';
  backgroundMode: 'global' | 'per-mode';
  globalBackground: string;
  workBackground: string;
  shortBackground: string;
  longBackground: string;
  customBackground: string | null;
  backgroundDimness: number; // 0 to 100 percentage overlay opacity
  focusColor: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet';
  guidedBreaksEnabled: boolean;
  defaultBreakActivity: 'breathing' | 'stretches' | 'eyecare' | 'hydration' | 'classic';
  breathingAudioGuidance: boolean;
  dailyFocusTarget: number; // minutes, e.g. 180 (3h)
  showDailyProgressRing: boolean;
}

export type BreakActivityType = 'breathing' | 'stretches' | 'eyecare' | 'hydration' | 'classic';

type TimerMode = 'work' | 'short' | 'long';

interface PomodoroContextType {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  settings: TimerSettings;
  tasks: Task[];
  activeTaskId: string | null;
  history: SessionRecord[];
  streak: number;
  focusMode: boolean;
  isFullscreen: boolean;
  ambientPlaying: boolean;
  breakActivity: BreakActivityType;
  setBreakActivity: (activity: BreakActivityType) => void;
  waterGlasses: number;
  logWater: () => void;
  resetWater: () => void;
  breathingCyclesCompleted: number;
  incrementBreathingCycles: () => void;
  completedStretchesCount: number;
  incrementCompletedStretches: () => void;
  tags: ProjectTag[];
  addTag: (name: string, color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan') => ProjectTag;
  deleteTag: (tagId: string) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tagId: string | null) => void;
  todayFocusMinutes: number;
  dailyGoalPercentage: number;
  badges: Badge[];
  unlockedBadgesCount: number;
  recentUnlockedBadge: Badge | null;
  dismissBadgeToast: () => void;
  isBadgesModalOpen: boolean;
  setIsBadgesModalOpen: (open: boolean) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  addTask: (title: string, estimatedPomodoros: number, tagId?: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  selectTask: (taskId: string | null) => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  uploadCustomAudio: (file: File) => Promise<boolean>;
  removeCustomAudio: () => Promise<void>;
  toggleFocusMode: () => void;
  toggleFullscreen: () => void;
  setAmbientPlaying: (playing: boolean) => void;
  clearHistory: () => void;
  totalFocusTime: number; // in minutes
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmVolume: 0.5,
  alarmSound: 'bell',
  ambientSound: 'none',
  ambientVolume: 0.3,
  enableNotifications: false,
  theme: 'system',
  customAudioUrl: '',
  backgroundMode: 'global',
  globalBackground: 'abstract',
  workBackground: 'abstract',
  shortBackground: 'nature',
  longBackground: 'cozy',
  customBackground: null,
  backgroundDimness: 20,
  focusColor: 'blue',
  guidedBreaksEnabled: true,
  defaultBreakActivity: 'breathing',
  breathingAudioGuidance: false,
  dailyFocusTarget: 180, // 3 hours
  showDailyProgressRing: true,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('pomodoro-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pomodoro-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem('pomodoro-active-task-id') || null;
  });

  const [history, setHistory] = useState<SessionRecord[]>(() => {
    const saved = localStorage.getItem('pomodoro-history');
    return saved ? JSON.parse(saved) : [];
  });

  const startTimerRef = useRef<(() => void) | null>(null);
  const skipTimerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    startTimerRef.current = startTimer;
    skipTimerRef.current = skipTimer;
  }); // Keep refs fresh

  // Register service worker and listen for background notification action clicks
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Notification Service Worker registered:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));

      const handleMessage = (event: MessageEvent) => {
        const { action } = event.data;
        if (action === 'start-break' || action === 'start-focus') {
          if (startTimerRef.current) startTimerRef.current();
        } else if (action === 'skip-break' || action === 'skip-focus') {
          if (skipTimerRef.current) skipTimerRef.current();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);

  const [tags, setTags] = useState<ProjectTag[]>(() => {
    try {
      const saved = localStorage.getItem('pomodoro-tags');
      return saved ? JSON.parse(saved) : DEFAULT_TAGS;
    } catch {
      return DEFAULT_TAGS;
    }
  });

  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('pomodoro-tags', JSON.stringify(tags));
  }, [tags]);

  const addTag = (name: string, color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan') => {
    const newTag: ProjectTag = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      color,
    };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const deleteTag = (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setTasks((prev) =>
      prev.map((t) =>
        t.tagId === tagId ? { ...t, tagId: undefined, tagName: undefined, tagColor: undefined } : t
      )
    );
    if (selectedTagFilter === tagId) {
      setSelectedTagFilter(null);
    }
  };

  // Guided Micro-Break Activity & Wellness State
  const [breakActivity, setBreakActivity] = useState<BreakActivityType>(settings.defaultBreakActivity || 'breathing');
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState<number>(0);
  const [completedStretchesCount, setCompletedStretchesCount] = useState<number>(0);

  // Daily Water Tracker (persisted with date check)
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('pomodoro-water-date');
      const savedCount = localStorage.getItem('pomodoro-water-count');
      if (savedDate === todayStr && savedCount) {
        return parseInt(savedCount, 10) || 0;
      }
    } catch {}
    return 0;
  });

  const logWater = () => {
    setWaterGlasses((prev) => {
      const updated = prev + 1;
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.setItem('pomodoro-water-date', todayStr);
        localStorage.setItem('pomodoro-water-count', updated.toString());
      } catch {}
      audio.playActivityComplete();
      return updated;
    });
  };

  const resetWater = () => {
    setWaterGlasses(0);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('pomodoro-water-date', todayStr);
      localStorage.setItem('pomodoro-water-count', '0');
    } catch {}
  };

  const incrementBreathingCycles = () => {
    setBreathingCyclesCompleted((prev) => prev + 1);
  };

  const incrementCompletedStretches = () => {
    setCompletedStretchesCount((prev) => prev + 1);
    audio.playActivityComplete();
  };

  // Gamification & Milestone Badges State
  const [unlockedBadgesMap, setUnlockedBadgesMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('pomodoro-unlocked-badges');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [recentUnlockedBadge, setRecentUnlockedBadge] = useState<Badge | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);

  const dismissBadgeToast = () => {
    setRecentUnlockedBadge(null);
  };

  // Compute Today's total work focus minutes
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayFocusMinutes = history
    .filter((r) => r.mode === 'work' && r.timestamp.startsWith(todayDateStr))
    .reduce((sum, r) => sum + r.durationMinutes, 0);

  const dailyGoalPercentage = settings.dailyFocusTarget > 0
    ? Math.min(100, Math.round((todayFocusMinutes / settings.dailyFocusTarget) * 100))
    : 0;

  // Calculate Badge metrics
  const totalWorkSessions = history.filter((r) => r.mode === 'work').length;

  // Max sessions in a single day
  const sessionsByDay: Record<string, number> = {};
  history.filter((r) => r.mode === 'work').forEach((r) => {
    const day = r.timestamp.split('T')[0];
    sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
  });
  const maxSessionsInSingleDay = Math.max(0, ...Object.values(sessionsByDay));

  // Night sessions (after 10 PM or before 4 AM)
  const hasNightSession = history.some((r) => {
    if (r.mode !== 'work') return false;
    const hour = new Date(r.timestamp).getHours();
    return hour >= 22 || hour < 4;
  });

  // Early bird sessions (between 4 AM and 7 AM)
  const hasEarlySession = history.some((r) => {
    if (r.mode !== 'work') return false;
    const hour = new Date(r.timestamp).getHours();
    return hour >= 4 && hour < 7;
  });

  // Define Badge definitions
  const badgeDefs: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Completed a focus session after 10:00 PM',
      iconName: 'Moon',
      currentProgress: hasNightSession ? 1 : 0,
      maxProgress: 1,
      progressLabel: hasNightSession ? 'Unlocked' : 'Focus after 10 PM',
      category: 'time',
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Completed a focus session before 7:00 AM',
      iconName: 'Sun',
      currentProgress: hasEarlySession ? 1 : 0,
      maxProgress: 1,
      progressLabel: hasEarlySession ? 'Unlocked' : 'Focus before 7 AM',
      category: 'time',
    },
    {
      id: 'goal-crusher',
      title: 'Goal Crusher',
      description: 'Hit 100% of your daily focus target',
      iconName: 'Target',
      currentProgress: Math.min(todayFocusMinutes, settings.dailyFocusTarget),
      maxProgress: settings.dailyFocusTarget,
      progressLabel: `${Math.min(todayFocusMinutes, settings.dailyFocusTarget)} / ${settings.dailyFocusTarget} mins`,
      category: 'time',
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Completed 100 Pomodoro focus sessions',
      iconName: 'Award',
      currentProgress: Math.min(totalWorkSessions, 100),
      maxProgress: 100,
      progressLabel: `${Math.min(totalWorkSessions, 100)} / 100 sessions`,
      category: 'volume',
    },
    {
      id: 'iron-streak',
      title: 'Iron Streak',
      description: 'Maintained a 7-day active daily streak',
      iconName: 'Shield',
      currentProgress: Math.min(streak, 7),
      maxProgress: 7,
      progressLabel: `${Math.min(streak, 7)} / 7 days`,
      category: 'streak',
    },
    {
      id: 'deep-flow',
      title: 'Deep Flow',
      description: 'Completed 4 focus sessions in a single day',
      iconName: 'Zap',
      currentProgress: Math.min(maxSessionsInSingleDay, 4),
      maxProgress: 4,
      progressLabel: `${Math.min(maxSessionsInSingleDay, 4)} / 4 sessions`,
      category: 'volume',
    },
    {
      id: 'focus-pioneer',
      title: 'Focus Pioneer',
      description: 'Completed your very first focus session',
      iconName: 'Sparkles',
      currentProgress: Math.min(totalWorkSessions, 1),
      maxProgress: 1,
      progressLabel: totalWorkSessions >= 1 ? 'Unlocked' : '0 / 1 session',
      category: 'volume',
    },
    {
      id: 'zen-master',
      title: 'Zen Master',
      description: 'Completed 10 guided breathing or desk stretch breaks',
      iconName: 'Wind',
      currentProgress: Math.min(breathingCyclesCompleted + completedStretchesCount, 10),
      maxProgress: 10,
      progressLabel: `${Math.min(breathingCyclesCompleted + completedStretchesCount, 10)} / 10 activities`,
      category: 'wellness',
    },
    {
      id: 'hydro-champion',
      title: 'Hydro Champion',
      description: 'Reached your 8-glass daily water goal',
      iconName: 'Droplets',
      currentProgress: Math.min(waterGlasses, 8),
      maxProgress: 8,
      progressLabel: `${Math.min(waterGlasses, 8)} / 8 glasses`,
      category: 'wellness',
    },
  ];

  const badges: Badge[] = badgeDefs.map((def) => {
    const isUnlocked = Boolean(unlockedBadgesMap[def.id]) || def.currentProgress >= def.maxProgress;
    return {
      ...def,
      unlocked: isUnlocked,
      unlockedAt: unlockedBadgesMap[def.id],
    };
  });

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  // Detect newly unlocked badges and show toast celebration
  const isInitialBadgeLoadRef = useRef(true);
  useEffect(() => {
    let hasNew = false;
    const updatedMap = { ...unlockedBadgesMap };

    badgeDefs.forEach((def) => {
      if (def.currentProgress >= def.maxProgress && !updatedMap[def.id]) {
        updatedMap[def.id] = new Date().toISOString();
        hasNew = true;
        if (!isInitialBadgeLoadRef.current) {
          setRecentUnlockedBadge({
            ...def,
            unlocked: true,
            unlockedAt: updatedMap[def.id],
          });
          audio.playActivityComplete();
        }
      }
    });

    if (hasNew) {
      setUnlockedBadgesMap(updatedMap);
      localStorage.setItem('pomodoro-unlocked-badges', JSON.stringify(updatedMap));
    }
    isInitialBadgeLoadRef.current = false;
  }, [history, streak, breathingCyclesCompleted, completedStretchesCount, waterGlasses, todayFocusMinutes]);

  // Reset default activity when switching into break mode
  useEffect(() => {
    if (mode === 'short' || mode === 'long') {
      if (settings.guidedBreaksEnabled) {
        setBreakActivity(settings.defaultBreakActivity || 'breathing');
      } else {
        setBreakActivity('classic');
      }
    }
  }, [mode, settings.guidedBreaksEnabled, settings.defaultBreakActivity]);

  // Keep track of total focus time
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);

  const timerRef = useRef<any>(null);
  const expectedEndTimeRef = useRef<number | null>(null);

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync active task id to localStorage
  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem('pomodoro-active-task-id', activeTaskId);
    } else {
      localStorage.removeItem('pomodoro-active-task-id');
    }
  }, [activeTaskId]);

  // Sync history to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-history', JSON.stringify(history));
    calculateStreak(history);
    calculateTotalFocusTime(history);
  }, [history]);

  // Handle setting updates
  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('pomodoro-settings', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save settings to localStorage:', err);
      }
      return updated;
    });

    // If timer is not running and duration was updated, update timeLeft to match
    if (!isRunning) {
      if (mode === 'work' && newSettings.workDuration !== undefined) {
        setTimeLeft(newSettings.workDuration * 60);
      } else if (mode === 'short' && newSettings.shortBreakDuration !== undefined) {
        setTimeLeft(newSettings.shortBreakDuration * 60);
      } else if (mode === 'long' && newSettings.longBreakDuration !== undefined) {
        setTimeLeft(newSettings.longBreakDuration * 60);
      }
    }
  };

  // Sync system theme preference
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const activeTheme = settings.theme === 'system' 
        ? (mediaQuery.matches ? 'dark' : 'light') 
        : settings.theme;

      if (activeTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Load saved custom audio file from IndexedDB on mount if available
  useEffect(() => {
    if (settings.customAudioType === 'file' || (!settings.customAudioType && settings.customAudioName)) {
      loadAudioFileFromDB().then((res) => {
        if (res && res.url) {
          setSettings((prev) => ({
            ...prev,
            customAudioUrl: res.url,
            customAudioName: res.meta.name,
            customAudioType: 'file',
          }));
        }
      }).catch((err) => console.error('Failed loading custom audio file:', err));
    }
  }, []);

  const uploadCustomAudio = async (file: File): Promise<boolean> => {
    try {
      const { url, meta } = await saveAudioFileToDB(file);
      updateSettings({
        customAudioUrl: url,
        customAudioName: meta.name,
        customAudioType: 'file',
        ambientSound: 'custom',
      });
      return true;
    } catch (err) {
      console.error('Error uploading custom audio file:', err);
      return false;
    }
  };

  const removeCustomAudio = async (): Promise<void> => {
    await deleteAudioFileFromDB();
    const isCustomActive = settings.ambientSound === 'custom';
    if (isCustomActive && ambientPlaying) {
      setAmbientPlaying(false);
    }
    updateSettings({
      customAudioUrl: '',
      customAudioName: undefined,
      customAudioType: undefined,
      ambientSound: isCustomActive ? 'none' : settings.ambientSound,
    });
  };

  // Sync ambient sound to play/pause state
  useEffect(() => {
    if (ambientPlaying && settings.ambientSound !== 'none') {
      audio.startAmbient(settings.ambientSound, settings.ambientVolume, settings.customAudioUrl);
    } else {
      audio.stopAmbient();
    }
    return () => {
      audio.stopAmbient();
    };
  }, [ambientPlaying, settings.ambientSound, settings.customAudioUrl]);

  // Volume synchronization
  useEffect(() => {
    audio.setAmbientVolume(settings.ambientVolume);
  }, [settings.ambientVolume]);

  // Fullscreen implementation
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      localStorage.setItem('pomodoro-prefer-fullscreen', (!!document.fullscreenElement).toString());
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error exiting fullscreen: ${err.message}`);
      });
    }
  };

  // Restore fullscreen preference on first click
  useEffect(() => {
    const preferred = localStorage.getItem('pomodoro-prefer-fullscreen') === 'true';
    if (preferred) {
      const restore = () => {
        if (!document.fullscreenElement) {
          toggleFullscreen();
        }
        document.removeEventListener('click', restore);
      };
      document.addEventListener('click', restore);
      return () => document.removeEventListener('click', restore);
    }
  }, []);

  // Request notifications permission if enabled
  useEffect(() => {
    if (settings.enableNotifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.enableNotifications]);

  // Streak Calculation
  const calculateStreak = (records: SessionRecord[]) => {
    if (records.length === 0) {
      setStreak(0);
      return;
    }

    // Filter only work sessions and get unique dates (YYYY-MM-DD)
    const workDates = records
      .filter((r) => r.mode === 'work')
      .map((r) => r.timestamp.split('T')[0]);
    
    const uniqueDates = Array.from(new Set(workDates)).sort();
    
    if (uniqueDates.length === 0) {
      setStreak(0);
      return;
    }

    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if the user has focused today or yesterday to continue streak
    const hasFocusedRecently = uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr);
    
    if (!hasFocusedRecently) {
      setStreak(0);
      return;
    }

    // Count backwards from today or yesterday
    let checkDate = uniqueDates.includes(todayStr) ? new Date() : yesterday;
    
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1); // Go back one day
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  // Total Focus Time Calculation (minutes)
  const calculateTotalFocusTime = (records: SessionRecord[]) => {
    const total = records
      .filter((r) => r.mode === 'work')
      .reduce((sum, r) => sum + r.durationMinutes, 0);
    setTotalFocusTime(total);
  };

  // Browser Tab Title Live Update
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    let emoji = '⏱️';
    if (mode === 'work') emoji = '💻';
    if (mode === 'short') emoji = '☕';
    if (mode === 'long') emoji = '🌴';

    const modeText = mode === 'work' ? 'Focus' : mode === 'short' ? 'Break' : 'Long Break';
    
    if (isRunning) {
      document.title = `${timeStr} | ${modeText} ${emoji}`;
    } else {
      document.title = `Pomodoro Timer ${emoji}`;
    }
  }, [timeLeft, mode, isRunning]);

  // Main Timer Countdown loop
  useEffect(() => {
    if (isRunning) {
      expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
      
      timerRef.current = setInterval(() => {
        if (expectedEndTimeRef.current !== null) {
          const remaining = Math.max(0, Math.ceil((expectedEndTimeRef.current - Date.now()) / 1000));
          setTimeLeft(remaining);

          if (remaining <= 0) {
            handleTimerComplete();
          }
        }
      }, 200); // Check frequently to avoid visible delay/jumping
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      expectedEndTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Handle timer completion logic
  const handleTimerComplete = () => {
    setIsRunning(false);
    audio.playAlarm(settings.alarmVolume, settings.alarmSound);

    // Send push notification if permitted
    if (settings.enableNotifications && Notification.permission === 'granted') {
      const nextActionText = mode === 'work' ? 'Time for a break!' : 'Time to focus!';
      const title = 'FocusFlow';
      const body = `${mode === 'work' ? 'Focus session' : 'Break'} complete. ${nextActionText}`;
      
      const actions = mode === 'work' 
        ? [
            { action: 'start-break', title: '☕ Start Break' },
            { action: 'skip-break', title: '⏭️ Skip Break' }
          ]
        : [
            { action: 'start-focus', title: '💻 Start Focus' },
            { action: 'skip-focus', title: '⏭️ Skip' }
          ];

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'pomodoro-notification',
            renotify: true,
            actions,
          } as any);
        });
      } else {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    }

    if (mode === 'work') {
      // Completed work session
      const completedCount = completedPomodoros + 1;
      setCompletedPomodoros(completedCount);

      // Save to history with active task and project tag metadata
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      const record: SessionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        mode: 'work',
        durationMinutes: settings.workDuration,
        timestamp: new Date().toISOString(),
        taskId: activeTask?.id,
        taskTitle: activeTask?.title,
        tagId: activeTask?.tagId,
        tagName: activeTask?.tagName,
        tagColor: activeTask?.tagColor,
      };
      setHistory((prev) => [record, ...prev]);

      // Update active task count
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId
              ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
              : t
          )
        );
      }

      // Check if long break interval reached
      if (completedCount > 0 && completedCount % settings.longBreakInterval === 0) {
        setMode('long');
        setTimeLeft(settings.longBreakDuration * 60);
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 500);
        }
      } else {
        setMode('short');
        setTimeLeft(settings.shortBreakDuration * 60);
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 500);
        }
      }
    } else {
      // Completed a break session
      // Save break to history as well
      const duration = mode === 'short' ? settings.shortBreakDuration : settings.longBreakDuration;
      const record: SessionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        mode,
        durationMinutes: duration,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [record, ...prev]);

      setMode('work');
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  };

  const startTimer = () => {
    // Resume context if suspended
    audio.startAmbient('none'); 
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(settings.workDuration * 60);
    else if (mode === 'short') setTimeLeft(settings.shortBreakDuration * 60);
    else if (mode === 'long') setTimeLeft(settings.longBreakDuration * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    // Move to next mode manually
    if (mode === 'work') {
      const completedCount = completedPomodoros + 1;
      setCompletedPomodoros(completedCount);
      
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      const record: SessionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        mode: 'work',
        durationMinutes: settings.workDuration, 
        timestamp: new Date().toISOString(),
        taskId: activeTask?.id,
        taskTitle: activeTask?.title,
        tagId: activeTask?.tagId,
        tagName: activeTask?.tagName,
        tagColor: activeTask?.tagColor,
      };
      setHistory((prev) => [record, ...prev]);

      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId
              ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
              : t
          )
        );
      }

      if (completedCount > 0 && completedCount % settings.longBreakInterval === 0) {
        setMode('long');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode('short');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  // Task Actions
  const addTask = (title: string, estimatedPomodoros: number, tagId?: string) => {
    const selectedTag = tagId ? tags.find((t) => t.id === tagId) : undefined;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      tagId: selectedTag?.id,
      tagName: selectedTag?.name,
      tagColor: selectedTag?.color,
    };
    setTasks((prev) => [newTask, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const merged: Task = { ...t, ...updates };
        if (updates.tagId !== undefined) {
          if (!updates.tagId) {
            merged.tagId = undefined;
            merged.tagName = undefined;
            merged.tagColor = undefined;
          } else {
            const foundTag = tags.find((tag) => tag.id === updates.tagId);
            if (foundTag) {
              merged.tagId = foundTag.id;
              merged.tagName = foundTag.name;
              merged.tagColor = foundTag.color;
            }
          }
        }
        return merged;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
  };

  const selectTask = (taskId: string | null) => {
    setActiveTaskId(taskId);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const clearHistory = () => {
    setHistory([]);
    setCompletedPomodoros(0);
    setStreak(0);
    setTotalFocusTime(0);
  };

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        timeLeft,
        isRunning,
        completedPomodoros,
        settings,
        tasks,
        activeTaskId,
        history,
        streak,
        focusMode,
        isFullscreen,
        ambientPlaying,
        breakActivity,
        setBreakActivity,
        waterGlasses,
        logWater,
        resetWater,
        breathingCyclesCompleted,
        incrementBreathingCycles,
        completedStretchesCount,
        incrementCompletedStretches,
        tags,
        addTag,
        deleteTag,
        selectedTagFilter,
        setSelectedTagFilter,
        todayFocusMinutes,
        dailyGoalPercentage,
        badges,
        unlockedBadgesCount,
        recentUnlockedBadge,
        dismissBadgeToast,
        isBadgesModalOpen,
        setIsBadgesModalOpen,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        selectTask,
        updateSettings,
        uploadCustomAudio,
        removeCustomAudio,
        toggleFocusMode,
        toggleFullscreen,
        setAmbientPlaying,
        clearHistory,
        totalFocusTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
