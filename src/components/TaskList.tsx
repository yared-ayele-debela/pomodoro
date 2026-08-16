import React, { useState } from 'react';
import { usePomodoro, type Task, TAG_COLOR_MAP } from '../context/PomodoroContext';
import { Plus, Trash2, CheckCircle2, Circle, Play, Check, Tag, Filter, X } from 'lucide-react';

export const TaskList: React.FC = () => {
  const {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    selectTask,
    isRunning,
    startTimer,
    tags,
    addTag,
    selectedTagFilter,
    setSelectedTagFilter,
  } = usePomodoro();

  const [title, setTitle] = useState('');
  const [estimate, setEstimate] = useState(2);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);

  // New custom tag creation popover/inline state
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan'>('blue');

  const handleCreateNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const created = addTag(newTagName.trim(), newTagColor);
    setSelectedTagId(created.id);
    setNewTagName('');
    setIsCreatingTag(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), estimate, selectedTagId);
    setTitle('');
    setEstimate(2);
    setSelectedTagId(undefined);
    setIsAdding(false);
  };

  // Filter tasks based on selectedTagFilter
  const filteredTasks = tasks.filter((task) => {
    if (!selectedTagFilter) return true;
    if (selectedTagFilter === 'untagged') return !task.tagId;
    return task.tagId === selectedTagFilter;
  });

  // Calculate task counts per tag
  const getTagTaskCount = (tagId: string) => tasks.filter((t) => t.tagId === tagId).length;
  const untaggedCount = tasks.filter((t) => !t.tagId).length;

  // Render individual estimated circles
  const renderProgressCircles = (task: Task) => {
    const circles = [];
    const maxCircles = Math.max(task.estimatedPomodoros, task.completedPomodoros);

    for (let i = 0; i < maxCircles; i++) {
      const isCompleted = i < task.completedPomodoros;
      const isExtra = i >= task.estimatedPomodoros; // Exceeded estimate

      circles.push(
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            isCompleted
              ? isExtra
                ? 'bg-amber-500 dark:bg-amber-400' // Overachieved
                : 'bg-blue-500 dark:bg-blue-400' // Done
              : 'border border-neutral-300 dark:border-neutral-700 bg-transparent' // Pending
          }`}
          title={isCompleted ? (isExtra ? 'Completed extra session' : 'Completed session') : 'Session pending'}
        />
      );
    }
    return <div className="flex gap-1 items-center">{circles}</div>;
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Tasks & Projects</h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            Tag tasks to categorize focus hours
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Project & Category Filter Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 custom-scrollbar">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-xl text-xs w-full">
          <Filter size={12} className="text-neutral-400 ml-1.5 flex-shrink-0" />
          <select
            value={selectedTagFilter || ''}
            onChange={(e) => setSelectedTagFilter(e.target.value || null)}
            aria-label="Filter tasks by project"
            className="bg-transparent border-none outline-none text-xs font-semibold text-neutral-700 dark:text-neutral-200 cursor-pointer flex-1 py-0.5 pr-2"
          >
            <option value="" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
              All Projects ({tasks.length})
            </option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                #{tag.name} ({getTagTaskCount(tag.id)})
              </option>
            ))}
            {untaggedCount > 0 && (
              <option value="untagged" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Untagged ({untaggedCount})
              </option>
            )}
          </select>

          {selectedTagFilter && (
            <button
              onClick={() => setSelectedTagFilter(null)}
              title="Clear Filter"
              aria-label="Clear Filter"
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 mb-4 bg-neutral-50/70 dark:bg-neutral-800/30 transition-all duration-300 space-y-3.5 shadow-sm">
          <input
            type="text"
            placeholder="What task or project are you tackling?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm bg-transparent border-b border-neutral-200 dark:border-neutral-800 pb-2 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 font-medium"
            autoFocus
            required
          />

          {/* Project Tag Selection Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <Tag size={11} /> Project / Category Tag:
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingTag(!isCreatingTag)}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isCreatingTag ? 'Cancel' : '+ New Tag'}
              </button>
            </div>

            {/* Custom Tag Inline Creator */}
            {isCreatingTag && (
              <div className="p-3 mb-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2.5 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Tag name (e.g., Marketing, Research)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full text-xs bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 outline-none text-neutral-800 dark:text-neutral-200"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan'] as const).map((colorKey) => (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setNewTagColor(colorKey)}
                        className={`w-5 h-5 rounded-full ${TAG_COLOR_MAP[colorKey].dot} transition-transform ${
                          newTagColor === colorKey ? 'ring-2 ring-offset-1 ring-neutral-400 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewTag}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                  >
                    Save Tag
                  </button>
                </div>
              </div>
            )}

            {/* Tag Pills List */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              <button
                type="button"
                onClick={() => setSelectedTagId(undefined)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedTagId === undefined
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                No Tag
              </button>

              {tags.map((tag) => {
                const isSelected = selectedTagId === tag.id;
                const colors = TAG_COLOR_MAP[tag.color] || TAG_COLOR_MAP.blue;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTagId(tag.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ring-offset-0 scale-102 shadow-sm font-bold`
                        : 'bg-white dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    <span>#{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Est. sessions:</span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setEstimate(Math.max(1, estimate - 1))}
                  className="px-2 py-1 text-xs bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {estimate}
                </span>
                <button
                  type="button"
                  onClick={() => setEstimate(estimate + 1)}
                  className="px-2 py-1 text-xs bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-sm active:scale-95"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter indicator chip if filter is active */}
      {selectedTagFilter && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
          <span>
            Filtering by: <strong>{selectedTagFilter === 'untagged' ? 'Untagged' : `#${tags.find((t) => t.id === selectedTagFilter)?.name || selectedTagFilter}`}</strong> ({filteredTasks.length})
          </span>
          <button
            onClick={() => setSelectedTagFilter(null)}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[340px] space-y-2 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800/40 rounded-2xl">
            <span className="text-2xl mb-1">📝</span>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {tasks.length === 0 ? 'No tasks created yet' : 'No tasks matching this filter'}
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[200px]">
              {tasks.length === 0 ? 'Add a task to categorize and track milestones.' : 'Select another category or click "Show All".'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = task.id === activeTaskId;
            const tagColor = task.tagColor ? TAG_COLOR_MAP[task.tagColor] || TAG_COLOR_MAP.blue : undefined;

            return (
              <div
                key={task.id}
                onClick={() => !task.isCompleted && selectTask(task.id)}
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  task.isCompleted
                    ? 'border-neutral-100 dark:border-neutral-900/50 bg-neutral-50/30 dark:bg-neutral-900/20 opacity-60'
                    : isActive
                    ? 'border-blue-500/50 dark:border-blue-500/40 bg-blue-500/[0.03] dark:bg-blue-400/[0.02] shadow-sm ring-1 ring-blue-500/20'
                    : 'border-neutral-200/80 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
                } cursor-pointer`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Task completion toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(task.id);
                      if (isActive && !task.isCompleted) {
                        selectTask(null);
                      }
                    }}
                    aria-label={task.isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
                    className="text-neutral-400 dark:text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={18} className="text-blue-500 dark:text-blue-400" />
                    ) : (
                      <Circle size={18} className="hover:scale-105 transition-transform" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate transition-all ${
                          task.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-600' : ''
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Color-coded Project Tag Badge with quick cycle onClick */}
                      {task.tagName && tagColor ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tags.length === 0) return;
                            const idx = tags.findIndex((t) => t.id === task.tagId);
                            if (idx === tags.length - 1) {
                              updateTask(task.id, { tagId: undefined });
                            } else {
                              updateTask(task.id, { tagId: tags[idx + 1].id });
                            }
                          }}
                          title="Click to switch project tag"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tagColor.bg} ${tagColor.text} ${tagColor.border} hover:opacity-80 transition-opacity flex-shrink-0 cursor-pointer`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tagColor.dot}`} />
                          #{task.tagName}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tags.length > 0) {
                              updateTask(task.id, { tagId: tags[0].id });
                            }
                          }}
                          title="Add project tag"
                          className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all flex-shrink-0"
                        >
                          <Tag size={9} />
                          <span>+Tag</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      {renderProgressCircles(task)}
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums font-medium">
                        {task.completedPomodoros} / {task.estimatedPomodoros}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {/* Quick Focus (play) button if not active and not completed */}
                  {!task.isCompleted && !isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTask(task.id);
                        if (!isRunning) startTimer();
                      }}
                      title="Focus on this task"
                      aria-label="Focus on this task"
                      className="p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 md:opacity-0 md:group-hover:opacity-100 transition-all"
                    >
                      <Play size={12} fill="currentColor" />
                    </button>
                  )}

                  {/* Active Indicator checkmark */}
                  {isActive && !task.isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20">
                      <Check size={10} strokeWidth={3} />
                      Active
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    title="Delete task"
                    aria-label="Delete task"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active task summary at bottom if one is active */}
      {activeTask && (
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <span>Focusing on:</span>
            <strong className="text-neutral-700 dark:text-neutral-200 font-bold truncate">
              {activeTask.title}
            </strong>
            {activeTask.tagName && (
              <span className="text-[10px] font-bold text-blue-500">
                (#{activeTask.tagName})
              </span>
            )}
          </div>
          <button
            onClick={() => selectTask(null)}
            className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors font-medium flex-shrink-0"
          >
            Clear Active
          </button>
        </div>
      )}
    </div>
  );
};
