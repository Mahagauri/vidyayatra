import React, { useState } from 'react';
import { Sparkles, Plus, Compass, BookOpen, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { TaskItem, TaskType } from '../types';

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

      if (!res.ok) {
        throw new Error('Failed to decompose day');
      }

      const data = await res.json();
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        const mappedTasks: TaskItem[] = data.tasks.map((t: any, idx: number) => ({
          id: `task-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          title: t.title || 'Untitled Task',
          type: t.type === 'habit' ? 'habit' : 'study',
          category: t.category || (t.type === 'study' ? 'Study Trial' : 'Action'),
          estimatedMinutes: Number(t.estimatedMinutes) || 30,
          xpReward: Number(t.xpReward) || (t.type === 'study' ? 100 : 50),
          status: 'pending' as const,
          subtasks: Array.isArray(t.subtasks)
            ? t.subtasks.map((sub: string, sIdx: number) => ({
                id: `sub-${Date.now()}-${sIdx}`,
                text: typeof sub === 'string' ? sub : String(sub),
                done: false,
              }))
            : [
                { id: `sub-${Date.now()}-1`, text: 'Prepare study sanctuary', done: false },
                { id: `sub-${Date.now()}-2`, text: 'Complete core objective', done: false },
              ],
          quizPromptHint: t.quizPromptHint || '',
        }));

        onTasksGenerated(mappedTasks);
        setInputDescription('');
      }
    } catch (err) {
      console.error('Error decomposing day:', err);
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
      category: manualCategory.trim() || (manualType === 'study' ? 'Study Trial' : 'Habit'),
      estimatedMinutes: manualMinutes,
      xpReward: manualType === 'study' ? 100 : 50,
      subtasks: [
        { id: `sub-${Date.now()}-1`, text: 'Initial preparation', done: false },
        { id: `sub-${Date.now()}-2`, text: 'Fulfill primary intent', done: false },
        { id: `sub-${Date.now()}-3`, text: 'Consolidate insight', done: false },
      ],
      quizPromptHint: manualType === 'study' ? `Mastery of ${manualTitle}` : '',
    });

    setManualTitle('');
    setShowManualForm(false);
  };

  return (
    <div className="mythic-card mythic-corner-brackets rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-900/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
              Declare Today's Quests & Trials
            </h2>
          </div>
          <p className="text-xs text-stone-300/80 mt-0.5">
            Describe your day in natural words. VidyaYatra separates academic study trials (verified via mastery quiz) from daily habits and action quests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="text-xs font-medium text-amber-300/80 hover:text-amber-200 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {showManualForm ? 'Hide manual quest entry' : 'Add custom quest manually'}
        </button>
      </div>

      {/* Input Box */}
      {!showManualForm ? (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              id="day-description-input"
              rows={3}
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
              placeholder="Describe whatever needs to be done for the day... (e.g. finish chapter 4 of chemistry, revise 20 vocab words, workout, 5 practice problems)"
              className="w-full rounded-xl border border-amber-500/30 bg-stone-950/80 p-3.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all resize-none shadow-inner"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleDecompose();
                }
              }}
            />
          </div>

          {/* Quick preset suggestions */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-medium text-amber-300/70">Quick ideas:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputDescription(p);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-amber-500/20 bg-stone-950/60 text-stone-300 hover:border-amber-400/50 hover:text-amber-200 transition-colors truncate max-w-xs cursor-pointer text-left"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-stone-300/80">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/20">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Study = Quiz Verification
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Action = Self-Check Reflection
              </span>
            </div>

            <button
              id="decompose-day-btn"
              type="button"
              onClick={() => handleDecompose()}
              disabled={isLoading || !inputDescription.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Divining Trials...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Decompose into Trials & Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Manual Single Task Form */
        <form onSubmit={handleManualSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Task Title / Objective
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Solve 10 Physics Mechanics Questions"
                className="w-full rounded-xl border border-stone-700 bg-stone-950/80 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Trial Type
              </label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as TaskType)}
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="study">Study Trial (Requires Verification Quiz)</option>
                <option value="habit">Daily Action / Habit (Reflection Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Category & Est. Minutes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="Category"
                  className="w-2/3 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="number"
                  min={5}
                  max={240}
                  step={5}
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                  className="w-1/3 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                />
              </div>
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
