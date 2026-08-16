import React, { useState } from 'react';
import { usePomodoro, TAG_COLOR_MAP } from '../context/PomodoroContext';
import { BarChart2, Flame, Clock, Award, Calendar, PieChart, Tag } from 'lucide-react';

interface CategoryBreakdown {
  id: string;
  name: string;
  color: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  totalMinutes: number;
  sessionCount: number;
  percentage: number;
}

export const Stats: React.FC = () => {
  const { history, streak, totalFocusTime, tags } = usePomodoro();
  const [categoryRange, setCategoryRange] = useState<'all' | 'week' | 'today'>('all');

  // Get completed sessions today
  const getTodaySessionsCount = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return history.filter(
      (r) => r.mode === 'work' && r.timestamp.startsWith(todayStr)
    ).length;
  };

  // Get data for the last 7 days
  const getLast7DaysData = () => {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayLabel = days[date.getDay()];
      
      const count = history.filter(
        (r) => r.mode === 'work' && r.timestamp.startsWith(dateString)
      ).length;

      data.push({
        day: dayLabel,
        date: dateString,
        count,
      });
    }
    return data;
  };

  // Calculate 12-week GitHub style contribution heatmap data
  const getHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    // Set start date to 12 weeks ago (84 days), aligned to Sunday of that week
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83 - today.getDay());
    
    const tempDate = new Date(startDate);
    
    while (tempDate <= today) {
      const dateString = tempDate.toISOString().split('T')[0];
      const count = history.filter(
        (r) => r.mode === 'work' && r.timestamp.startsWith(dateString)
      ).length;
      
      data.push({
        date: dateString,
        count,
      });
      
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return data;
  };

  const chartData = getLast7DaysData();
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const heatmapData = getHeatmapData();

  // Format total focus time (e.g. "2h 15m" or "45m")
  const formatFocusTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Calculate Project / Category Breakdown Analytics
  const getCategoryBreakdown = (): { categories: CategoryBreakdown[]; totalMinutesInRange: number } => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filteredHistory = history.filter((r) => {
      if (r.mode !== 'work') return false;
      if (categoryRange === 'today') {
        return r.timestamp.startsWith(todayStr);
      }
      if (categoryRange === 'week') {
        return new Date(r.timestamp) >= sevenDaysAgo;
      }
      return true;
    });

    const totalMinutesInRange = filteredHistory.reduce((sum, r) => sum + r.durationMinutes, 0);

    if (totalMinutesInRange === 0) {
      return { categories: [], totalMinutesInRange: 0 };
    }

    const map: Record<string, { totalMinutes: number; sessionCount: number; name: string; color: string }> = {};

    filteredHistory.forEach((record) => {
      const key = record.tagId || 'general';
      const name = record.tagName || (record.tagId ? tags.find((t) => t.id === record.tagId)?.name : 'General Focus') || 'General Focus';
      const color = record.tagColor || (record.tagId ? tags.find((t) => t.id === record.tagId)?.color : 'blue') || 'blue';

      if (!map[key]) {
        map[key] = { totalMinutes: 0, sessionCount: 0, name, color };
      }
      map[key].totalMinutes += record.durationMinutes;
      map[key].sessionCount += 1;
    });

    const categories: CategoryBreakdown[] = Object.entries(map)
      .map(([id, data]) => {
        const colorToken = TAG_COLOR_MAP[data.color] || TAG_COLOR_MAP.blue;
        return {
          id,
          name: data.name,
          color: data.color,
          hex: colorToken.hex,
          bgClass: colorToken.bg,
          textClass: colorToken.text,
          borderClass: colorToken.border,
          dotClass: colorToken.dot,
          totalMinutes: data.totalMinutes,
          sessionCount: data.sessionCount,
          percentage: Math.round((data.totalMinutes / totalMinutesInRange) * 100),
        };
      })
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    return { categories, totalMinutesInRange };
  };

  const { categories, totalMinutesInRange } = getCategoryBreakdown();

  // Format relative time (e.g. "5 mins ago", "2 hours ago", "Yesterday")
  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Calculate SVG Donut chart segments
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~251.32
  let accumulatedOffset = 0;

  return (
    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-neutral-500" />
          <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Analytics & Projects</h2>
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <div className="bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
          <Flame className={`w-5 h-5 mb-1 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-neutral-400 dark:text-neutral-600'}`} />
          <span className="text-xl sm:text-2xl font-light text-neutral-900 dark:text-neutral-50 tabular-nums">{streak}</span>
          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">Day Streak</span>
        </div>

        {/* Total Focus Time */}
        <div className="bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
          <Clock className="w-5 h-5 text-blue-500 mb-1" />
          <span className="text-xl sm:text-2xl font-light text-neutral-900 dark:text-neutral-50 tabular-nums">{formatFocusTime(totalFocusTime)}</span>
          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">Focus Time</span>
        </div>

        {/* Sessions Today */}
        <div className="bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
          <Award className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-xl sm:text-2xl font-light text-neutral-900 dark:text-neutral-50 tabular-nums">{getTodaySessionsCount()}</span>
          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">Today</span>
        </div>
      </div>

      {/* Category & Project Breakdown Section (High-Impact Feature) */}
      <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-800/40 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <PieChart size={14} className="text-blue-500" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Project & Category Breakdown
            </h3>
          </div>

          {/* Time range switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/60 p-0.5 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setCategoryRange('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                categoryRange === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setCategoryRange('week')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                categoryRange === 'week'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setCategoryRange('today')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                categoryRange === 'today'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 rounded-2xl p-6 text-center">
            <Tag size={20} className="mx-auto mb-1.5 text-neutral-400" />
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">No project data for this period</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              Tag tasks to visualize how your hours are distributed across projects.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/40 rounded-2xl p-4 space-y-4">
            {/* Chart Area */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
              {/* Donut Chart SVG */}
              <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100" aria-hidden="true">
                  {/* Background track circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    className="stroke-neutral-200/80 dark:stroke-neutral-800/80 fill-none"
                    strokeWidth="12"
                  />
                  {/* Category Slices */}
                  {categories.map((cat) => {
                    const sliceLength = (cat.percentage / 100) * donutCircumference;
                    const strokeDasharray = `${sliceLength} ${donutCircumference - sliceLength}`;
                    const strokeDashoffset = -accumulatedOffset;
                    accumulatedOffset += sliceLength;

                    return (
                      <circle
                        key={cat.id}
                        cx="50"
                        cy="50"
                        r={donutRadius}
                        stroke={cat.hex}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        fill="none"
                        className="transition-all duration-700 ease-out hover:stroke-[14]"
                      />
                    );
                  })}
                </svg>

                {/* Center time summary */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xs font-extrabold text-neutral-900 dark:text-white tabular-nums leading-tight">
                    {formatFocusTime(totalMinutesInRange)}
                  </span>
                  <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-tighter">
                    Focus
                  </span>
                </div>
              </div>

              {/* Segmented Distribution Bar */}
              <div className="flex-1 w-full space-y-2">
                <div className="w-full bg-neutral-200/60 dark:bg-neutral-800 rounded-full h-3 flex overflow-hidden shadow-inner">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.hex }}
                      title={`${cat.name}: ${cat.percentage}% (${formatFocusTime(cat.totalMinutes)})`}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium pt-1">
                  <span>{categories.length} active project{categories.length === 1 ? '' : 's'}</span>
                  <span>{formatFocusTime(totalMinutesInRange)} total</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="space-y-2 pt-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.hex }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                        #{cat.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {cat.sessionCount} session{cat.sessionCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                      {formatFocusTime(cat.totalMinutes)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cat.bgClass} ${cat.textClass} ${cat.borderClass} tabular-nums`}
                    >
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar Chart of Weekly Focus */}
      <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800/40 pt-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
          <span>Weekly Focus Sessions</span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400">
            <Calendar size={11} /> Last 7 Days
          </span>
        </div>

        <div className="bg-neutral-50/30 dark:bg-neutral-800/10 border border-neutral-100 dark:border-neutral-800/30 rounded-xl p-4">
          <div className="flex justify-between items-end h-28 gap-2 pt-2">
            {chartData.map((data, index) => {
              const heightPercent = (data.count / maxCount) * 100;
              const hasCount = data.count > 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end">
                  {/* Bar Value on Hover */}
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 transition-opacity duration-200 tabular-nums">
                    {data.count}
                  </span>
                  
                  {/* Bar Visual */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ease-out origin-bottom ${
                      hasCount
                        ? 'bg-blue-500 dark:bg-blue-600 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800/40'
                    }`}
                    style={{ height: `${heightPercent}%`, minHeight: hasCount ? '6px' : '3px' }}
                  />

                  {/* Day Label */}
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-2 font-medium">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800/40 pt-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
          <span>Focus Heatmap</span>
          <span className="text-[10px] font-semibold text-neutral-400">Last 12 Weeks</span>
        </div>
        
        <div className="bg-neutral-50/30 dark:bg-neutral-800/10 border border-neutral-100 dark:border-neutral-800/30 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex gap-2">
            {/* Day Labels Column */}
            <div className="grid grid-rows-7 text-[8px] font-extrabold text-neutral-400 dark:text-neutral-600 h-[102px] pr-1 leading-[14.5px] select-none">
              <div></div>
              <div>M</div>
              <div></div>
              <div>W</div>
              <div></div>
              <div>F</div>
              <div></div>
            </div>
            
            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {heatmapData.map((d, index) => {
                let cellColor = 'bg-neutral-100 dark:bg-neutral-850/30';
                if (d.count > 0 && d.count <= 2) cellColor = 'bg-blue-500/20 dark:bg-blue-500/15 border border-blue-500/10';
                else if (d.count > 2 && d.count <= 4) cellColor = 'bg-blue-500/50 dark:bg-blue-500/40';
                else if (d.count > 4) cellColor = 'bg-blue-600 dark:bg-blue-500';
                
                const formattedDate = new Date(d.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const tooltip = `${d.count} session${d.count === 1 ? '' : 's'} on ${formattedDate}`;

                return (
                  <div
                    key={index}
                    title={tooltip}
                    className={`w-[12px] h-[12px] rounded-[2px] transition-all hover:scale-125 hover:z-10 hover:ring-1 hover:ring-blue-500/50 cursor-pointer ${cellColor}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-end w-full gap-1.5 text-[8px] font-bold text-neutral-400 dark:text-neutral-600 select-none mt-3.5 pr-2">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-neutral-100 dark:bg-neutral-800/40" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-blue-500/20 dark:bg-blue-500/15" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-blue-500/50 dark:bg-blue-500/40" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-blue-600 dark:bg-blue-500" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Recent History log */}
      <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800/40 pt-4">
        <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Recent Activity</h3>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-600 italic text-center py-4">No sessions logged yet.</p>
          ) : (
            history.slice(0, 7).map((record) => {
              const isWork = record.mode === 'work';
              const tagColor = record.tagColor ? TAG_COLOR_MAP[record.tagColor] || TAG_COLOR_MAP.blue : undefined;

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl border border-neutral-100 dark:border-neutral-850/40 bg-neutral-50/20 dark:bg-neutral-900/10 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isWork ? (tagColor ? tagColor.dot : 'bg-blue-500') : 'bg-emerald-500'}`} />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {record.taskTitle || (isWork ? 'Focus Session' : record.mode === 'short' ? 'Short Break' : 'Long Break')}
                    </span>
                    {record.tagName && tagColor && (
                      <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${tagColor.bg} ${tagColor.text} ${tagColor.border} flex-shrink-0`}>
                        #{record.tagName}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                      ({record.durationMinutes}m)
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums flex-shrink-0">
                    {getRelativeTime(record.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
