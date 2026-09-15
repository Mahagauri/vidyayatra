import React, { useRef } from 'react';
import {
  X,
  Scroll,
  Calendar,
  Award,
  Sparkles,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { HistoryEntry, UserProfile } from '../types';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  profile: UserProfile;
  onResetProgress: () => void;
  onImportData: (data: { profile: UserProfile; history: HistoryEntry[] }) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  history,
  profile,
  onResetProgress,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = {
      profile,
      history,
      exportedAt: new Date().toISOString(),
      appName: 'VidyaYatra',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vidyayatra-quest-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) {
          onImportData({
            profile: parsed.profile,
            history: Array.isArray(parsed.history) ? parsed.history : [],
          });
        }
      } catch (err) {
        console.error('Failed to parse backup:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-amber-500/30 bg-[#0d091a] shadow-2xl p-5 sm:p-7 overflow-hidden my-6 flex flex-col max-h-[90vh] mythic-corner-brackets">
        {/* Subtle celestial aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                The Mythic Chronicle & Journal
              </h2>
              <p className="text-xs text-amber-200/60">
                A permanent recording of all study trials passed, actions fulfilled, and reflections noted.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-amber-200 hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="py-3 border-b border-stone-800/80 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <span className="text-xs font-mono text-stone-400">
            Total Accomplishments: <strong className="text-amber-300">{history.length}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center gap-1.5 cursor-pointer"
              title="Download backup JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Backup</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center gap-1.5 cursor-pointer"
              title="Import backup JSON"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={onResetProgress}
              className="text-xs px-3 py-1.5 rounded-xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-300 flex items-center gap-1.5 cursor-pointer"
              title="Reset progress to fresh start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-500 space-y-2">
              <Scroll className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium text-stone-400">The Chronicle awaits its first inscription.</p>
              <p className="text-xs text-stone-500">
                Pass a study trial or complete a daily action to start recording your journey.
              </p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 space-y-2.5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${
                        entry.taskType === 'study'
                          ? 'border-amber-500/30 bg-amber-950/60 text-amber-300'
                          : 'border-emerald-500/30 bg-emerald-950/60 text-emerald-300'
                      }`}
                    >
                      {entry.taskType === 'study' ? 'Study Trial' : 'Daily Action'}
                    </span>
                    <span className="text-xs font-medium text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md">
                      {entry.category}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.completedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-md self-start sm:self-auto">
                    +{entry.xpEarned} XP
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-stone-200">{entry.taskTitle}</h3>

                {entry.reflection && (
                  <p className="text-xs text-stone-300 italic bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                    "{entry.reflection}"
                  </p>
                )}

                {entry.figureEncountered && (
                  <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manifested Wisdom:</span>
                    <strong className="text-amber-200 font-serif">
                      {entry.figureEncountered.name}
                    </strong>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                      {entry.figureEncountered.tier}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
