import React, { useState } from 'react';
import { Sparkles, Plus, Compass, BookOpen, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { TaskItem, TaskType } from '../types';
import { clientFallbackSplitter } from '../utils/decomposer';

interface DayInputSectionProps {
  onTasksGenerated: (newTasks: TaskItem[]) => void;
  onAddTaskManually: (task: Omit<TaskItem, 'id' | 'status'>) => void;
}

export const DayInputSection: React.FC<DayInputSectionProps> = ({
  onTasksGenerated,
  onAddTaskManually,
}) => {
  const [inputDescription, setInputDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual task state
  const [manualTitle, setManualTitle] = useState('');
  const [manualType, setManualType] = useState<TaskType>('study');
  const [manualCategory, setManualCategory] = useState('General');
  const [manualMinutes, setManualMinutes] = useState(45);

  const presets = [
    'finish chapter 4 of chemistry, revise 20 vocab words, do laundry',
    'solve 5 calculus integral problems, read history chapter 3, 20m evening meditation',
    'implement binary search algorithm in typescript, write clean notes, organize desk',
  ];

  const handleDecompose = async (textToProcess?: string) => {
    const text = textToProcess || inputDescription;
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/decompose-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          const localCheck = clientFallbackSplitter(text);
          const tasksToUse: TaskItem[] =
            data.tasks.length === 1 && localCheck.length > 1
              ? localCheck
              : data.tasks.map((t: any, idx: number) => ({
                  id: `task-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
                  title: t.title || 'Untitled Task',
                  type: t.type === 'habit' ? 'habit' : 'study',
                  category: t.category || (t.type === 'study' ? 'Study Trial' : 'Action'),
                  estimatedMinutes: Number(t.estimatedMinutes) || 30,
                  xpReward: Number(t.xpReward) || (t.type === 'study' ? 100 : 50),
                  status: 'pending' as const,
                  subtasks: Array.isArray(t.subtasks)
                    ? t.subtasks.map((sub: string, sIdx: number) => ({
                        id: `sub-${Date.now()}-${idx}-${sIdx}`,
                        text: typeof sub === 'string' ? sub : (sub as any).text,
                        done: false,
                      }))
                    : [],
                  quizPromptHint: t.quizPromptHint || '',
                }));

          onTasksGenerated(tasksToUse);
          setInputDescription('');
          setIsLoading(false);
          return;
        }
      }
      // Fallback decomposition
      const fallbackTasks = clientFallbackSplitter(text);
      onTasksGenerated(fallbackTasks);
      setInputDescription('');
    } catch {
      const fallbackTasks = clientFallbackSplitter(text);
      onTasksGenerated(fallbackTasks);
      setInputDescription('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    onAddTaskManually({
      title: manualTitle.trim(),
      type: manualType,
      category: manualCategory.trim() || 'General',
      estimatedMinutes: Number(manualMinutes) || 30,
      xpReward: manualType === 'study' ? 100 : 50,
      subtasks: [
        { id: `sub-${Date.now()}-1`, text: 'Initiate deliberate focus', done: false },
        { id: `sub-${Date.now()}-2`, text: 'Complete core milestone', done: false },
      ],
      quizPromptHint: manualTitle.trim(),
    });

    setManualTitle('');
    setShowManualForm(false);
  };

  return (
    <div className="mythic-card mythic-corner-brackets rounded-2xl p-5 sm:p-6 shadow-xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-amber-100">
              Declare Your Day&apos;s Quest
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Type your plans in natural language. VidyaYatra breaks them into structured Study Trials &amp; Habits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:bg-stone-850 text-amber-200/90 text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showManualForm ? 'Hide Form' : 'Manual Entry'}</span>
        </button>
      </div>

      {/* Natural Language Input */}
      {!showManualForm ? (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              id="natural-task-input"
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
              placeholder="e.g. Finish chapter 4 chemistry mechanisms, memorize 20 GRE words, 30m gym session..."
              rows={3}
              className="w-full rounded-xl bg-stone-950/80 border border-amber-500/20 px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 resize-none transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleDecompose();
                }
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Quick Inspiration chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[11px] text-stone-400">
              <span className="shrink-0 text-amber-400/80">Try:</span>
              <button
                type="button"
                onClick={() => handleDecompose(presets[0])}
                className="truncate max-w-[200px] sm:max-w-none px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
                title={presets[0]}
              >
                Organic Chemistry &amp; Vocab
              </button>
              <button
                type="button"
                onClick={() => handleDecompose(presets[1])}
                className="truncate max-w-[200px] sm:max-w-none px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
                title={presets[1]}
              >
                Calculus &amp; Meditation
              </button>
            </div>

            <button
              id="decompose-btn"
              type="button"
              onClick={() => handleDecompose()}
              disabled={isLoading || !inputDescription.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Decomposing Quest...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transmute into Trials</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Manual Task Entry Form */
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-[11px] font-medium text-stone-300 mb-1">
                Trial / Task Title
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Master Binary Search Trees"
                required
                className="w-full rounded-xl bg-stone-950/80 border border-amber-500/20 px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-stone-300 mb-1">
                Type
              </label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as TaskType)}
                className="w-full rounded-xl bg-stone-950/80 border border-amber-500/20 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400/60"
              >
                <option value="study">Study Trial (Quiz Verification)</option>
                <option value="habit">Daily Action (Reflection)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                placeholder="e.g. Computer Science, Math, Vitality"
                className="w-full rounded-xl bg-stone-950/80 border border-amber-500/20 px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-300 mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Number(e.target.value))}
                className="w-full rounded-xl bg-stone-950/80 border border-amber-500/20 px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400/60"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs cursor-pointer shadow-md"
            >
              Create Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DayInputSection;