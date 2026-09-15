import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Trash2,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { TaskItem, TaskType } from '../types';
import { MYTHOLOGICAL_FIGURES } from '../data/mythology';

interface TaskListProps {
  tasks: TaskItem[];
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onStartQuiz: (task: TaskItem) => void;
  onStartReflection: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
  onClearAllTasks?: () => void;
  onLoadSampleTasks?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleSubtask,
  onAddSubtask,
  onStartQuiz,
  onStartReflection,
  onDeleteTask,
  onUpdateNotes,
  onClearAllTasks,
  onLoadSampleTasks,
}) => {
  const [filter, setFilter] = useState<'all' | 'study' | 'habit' | 'completed'>('all');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'study') return t.type === 'study' && t.status !== 'completed';
    if (filter === 'habit') return t.type === 'habit' && t.status !== 'completed';
    return true; // 'all'
  });

  const pendingStudyCount = tasks.filter((t) => t.type === 'study' && t.status !== 'completed').length;
  const pendingHabitCount = tasks.filter((t) => t.type === 'habit' && t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleSubtaskSubmit = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = newSubtaskInputs[taskId]?.trim();
    if (!text) return;
    onAddSubtask(taskId, text);
    setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-800 text-stone-100 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Quests ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('study')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'study'
                ? 'bg-amber-950/80 text-amber-200 border border-amber-500/30'
                : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Study Trials ({pendingStudyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('habit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'habit'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/30'
                : 'text-stone-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Daily Actions ({pendingHabitCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-stone-800 text-stone-200 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-stone-400">
            Passing a trial manifests a mythical wisdom encounter
          </span>

          {tasks.length > 0 && onClearAllTasks && (
            <button
              type="button"
              onClick={onClearAllTasks}
              className="text-xs px-2.5 py-1 rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-red-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Clear all tasks to start with an empty log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Template Quests</span>
            </button>
          )}

          {tasks.length === 0 && onLoadSampleTasks && (
            <button
              type="button"
              onClick={onLoadSampleTasks}
              className="text-xs px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-950/30 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Load example study quest template"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-800/80 bg-stone-950/40 p-10 text-center text-stone-500 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-amber-500/40 opacity-75" />
          <h3 className="text-base font-serif font-bold text-stone-300">
            {tasks.length === 0 ? 'Your Quest Log is Clear' : 'No tasks in this category'}
          </h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
            {tasks.length === 0
              ? 'Enter whatever you want to study today in the prompt box above and click "Decompose Quest" to generate your custom plan.'
              : 'Switch to another tab or declare new quests to continue your journey.'}
          </p>

          {tasks.length === 0 && onLoadSampleTasks && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onLoadSampleTasks}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-amber-500/30 bg-stone-900 hover:bg-stone-800 text-amber-300 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Sample Quests Template</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isStudy = task.type === 'study';
            const completedSubtasksCount = task.subtasks.filter((s) => s.done).length;
            const subtaskRatio = task.subtasks.length > 0
              ? Math.round((completedSubtasksCount / task.subtasks.length) * 100)
              : 0;

            const unlockedFigure = task.unlockedFigureId
              ? MYTHOLOGICAL_FIGURES.find((f) => f.id === task.unlockedFigureId)
              : null;

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`group rounded-2xl border p-4 sm:p-5 transition-all relative overflow-hidden mythic-corner-brackets ${
                  isCompleted
                    ? 'border-amber-500/15 bg-stone-950/50 opacity-75'
                    : isStudy
                    ? 'border-amber-500/35 bg-[#120b22]/85 hover:border-amber-400/60 shadow-xl shadow-amber-950/30'
                    : 'border-emerald-500/30 bg-[#0c1819]/85 hover:border-emerald-400/50 shadow-xl shadow-emerald-950/30'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      {/* Type Badge */}
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                          isStudy
                            ? 'border-amber-500/30 bg-amber-950/60 text-amber-300'
                            : 'border-emerald-500/30 bg-emerald-950/60 text-emerald-300'
                        }`}
                      >
                        {isStudy ? 'Study Trial' : 'Daily Action'}
                      </span>

                      {/* Category Chip */}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-medium">
                        {task.category}
                      </span>

                      {/* Minutes Chip */}
                      <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-stone-500" />
                        {task.estimatedMinutes}m
                      </span>

                      {/* XP Badge */}
                      <span className="text-[11px] font-mono font-semibold text-amber-400/90 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        +{task.xpReward} XP
                      </span>

                      {isCompleted && (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Passed & Cleared
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-base font-medium tracking-tight ${
                        isCompleted ? 'text-stone-400 line-through' : 'text-stone-100 font-semibold'
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedNotesId(expandedNotesId === task.id ? null : task.id)
                      }
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs flex items-center gap-1 cursor-pointer"
                      title="Study Notes & Verification Prompt"
                    >
                      <FileText className="w-4 h-4" />
                      {task.notes && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800/80 transition-colors cursor-pointer"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Progress & Checkboxes */}
                {task.subtasks.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-stone-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span>
                        Trial Milestones ({completedSubtasksCount}/{task.subtasks.length})
                      </span>
                      <span className="font-mono text-[11px] text-stone-400">{subtaskRatio}%</span>
                    </div>

                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500/70 transition-all rounded-full"
                        style={{ width: `${subtaskRatio}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {task.subtasks.map((sub) => (
                        <label
                          key={sub.id}
                          className="flex items-start gap-2.5 text-xs text-stone-300 hover:text-stone-100 cursor-pointer select-none group/sub"
                        >
                          <input
                            type="checkbox"
                            checked={sub.done}
                            onChange={() => onToggleSubtask(task.id, sub.id)}
                            className="mt-0.5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer accent-amber-500"
                          />
                          <span className={sub.done ? 'line-through text-stone-400' : ''}>
                            {sub.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Add Subtask form */}
                {!isCompleted && (
                  <form
                    onSubmit={(e) => handleSubtaskSubmit(task.id, e)}
                    className="mt-2 flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={newSubtaskInputs[task.id] || ''}
                      onChange={(e) =>
                        setNewSubtaskInputs({ ...newSubtaskInputs, [task.id]: e.target.value })
                      }
                      placeholder="+ Add a quick milestone subtask..."
                      className="text-xs bg-stone-950/60 border border-stone-800 rounded-lg px-2.5 py-1 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600 flex-1"
                    />
                    {newSubtaskInputs[task.id]?.trim() && (
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 bg-stone-800 text-stone-200 rounded-lg hover:bg-stone-700 cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </form>
                )}

                {/* Notes Drawer (Optional user study notes or prompt hint) */}
                {expandedNotesId === task.id && (
                  <div className="mt-3 p-3 rounded-xl border border-stone-800 bg-stone-950/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-400 font-medium">
                      <span>Study Notes & Verification Focus</span>
                      {task.quizPromptHint && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          Hint: {task.quizPromptHint}
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={task.notes || ''}
                      onChange={(e) => onUpdateNotes(task.id, e.target.value)}
                      placeholder="Jot key takeaways or notes here. The quiz generator uses this to test your genuine understanding!"
                      className="w-full rounded-lg border border-stone-800 bg-stone-900/90 p-2 text-stone-200 placeholder-stone-600 focus:border-amber-500 focus:outline-none resize-none text-xs"
                    />
                  </div>
                )}

                {/* Bottom Row / Completion Badge or Action CTAs */}
                <div className="mt-4 pt-3 border-t border-stone-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {isCompleted ? (
                    <div className="flex items-center flex-wrap gap-2 text-xs text-stone-400">
                      {task.quizScore && (
                        <span className="font-mono text-amber-300 font-medium bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          Quiz Score: {task.quizScore.score}/{task.quizScore.total}
                        </span>
                      )}
                      {unlockedFigure && (
                        <div className="flex items-center gap-1.5 text-stone-300 bg-stone-800/80 px-2.5 py-1 rounded-lg">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Encountered:</span>
                          <span className="font-serif font-bold text-amber-200">
                            {unlockedFigure.name}
                          </span>
                        </div>
                      )}
                      {task.reflectionText && (
                        <p className="italic text-stone-400 truncate max-w-sm">
                          "{task.reflectionText}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-stone-400">
                        {isStudy
                          ? 'Complete study material, then initiate the examination to manifest an encounter.'
                          : 'Complete this daily duty, then record a brief reflection.'}
                      </div>

                      {isStudy ? (
                        <button
                          type="button"
                          id={`start-quiz-${task.id}`}
                          onClick={() => onStartQuiz(task)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-stone-950 font-semibold text-xs shadow-md shadow-amber-950/30 cursor-pointer transition-all self-end sm:self-auto"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Begin Verification Quiz</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          id={`start-reflect-${task.id}`}
                          onClick={() => onStartReflection(task)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-stone-950 font-semibold text-xs shadow-md shadow-emerald-950/30 cursor-pointer transition-all self-end sm:self-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reflect & Complete</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
