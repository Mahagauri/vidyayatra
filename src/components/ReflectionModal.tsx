import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { TaskItem } from '../types';

interface ReflectionModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReflection: (taskId: string, reflectionText: string) => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirmReflection,
}) => {
  const [reflection, setReflection] = useState('');
  const [honestCheck, setHonestCheck] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!honestCheck) return;
    onConfirmReflection(task.id, reflection.trim() || 'Completed with dedication and clarity.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#0d091a] shadow-2xl p-6 sm:p-7 overflow-hidden mythic-corner-brackets">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold">
                Daily Quest & Habit Reflection
              </span>
              <h2 className="text-base font-serif font-bold text-stone-100 line-clamp-1">
                {task.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-stone-300 leading-relaxed">
            Take a conscious breath. Acknowledge this duty fulfilled in your daily life.
          </p>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-xs text-stone-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={honestCheck}
              onChange={(e) => setHonestCheck(e.target.value === 'true' || e.target.checked)}
              className="mt-0.5 rounded border-emerald-700 bg-stone-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer accent-emerald-500"
            />
            <span>
              I affirm on my honor that I completed this action mindfully and effectively.
            </span>
          </label>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">
              One takeaway, observation, or feeling (Optional):
            </label>
            <textarea
              rows={2}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. Energy renewed, mind clear, desk organized for tonight's studies..."
              className="w-full rounded-xl border border-stone-800 bg-stone-950/80 p-3 text-xs text-stone-100 placeholder-stone-600 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="border-t border-stone-800 pt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{task.xpReward} XP Reward
            </span>

            <button
              type="submit"
              disabled={!honestCheck}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-stone-950 font-bold text-xs shadow-lg cursor-pointer transition-all"
            >
              <span>Manifest Wisdom Encounter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
