import React from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Scroll,
  Flame,
  CheckCircle2,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../types';
import { MYTHOLOGICAL_FIGURES } from '../data/mythology';
import { calculateLevel } from '../utils/storage';

interface FocusSanctuaryProps {
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: (seconds?: number) => void;
  onSetTimerDuration: (seconds: number) => void;
  profile: UserProfile;
  onOpenCodex: () => void;
  onOpenHistory: () => void;
  completedTodayCount: number;
  pendingStudyCount: number;
}

export const FocusSanctuary: React.FC<FocusSanctuaryProps> = ({
  timerSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onSetTimerDuration,
  profile,
  onOpenCodex,
  onOpenHistory,
  completedTodayCount,
  pendingStudyCount,
}) => {
  const { level, currentXp, nextLevelXp, title } = calculateLevel(profile.xp);
  const xpPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Get recently discovered figures
  const discoveredFiguresList = profile.discoveredFigures
    .slice(-3)
    .reverse()
    .map((item) => {
      const figure = MYTHOLOGICAL_FIGURES.find((f) => f.id === item.figureId);
      return figure ? { ...figure, discoveredAt: item.discoveredAt } : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-5">
      {/* 1. Deep Focus Sanctuary Timer */}
      <div className="mythic-card mythic-corner-brackets rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-amber-100">
              Focus Sanctuary
            </h3>
          </div>
          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-950/60 text-amber-300">
            {isTimerRunning ? 'Active Focus' : 'Ready'}
          </span>
        </div>

        {/* Large Timer Display */}
        <div className="text-center py-3 my-2 rounded-xl bg-stone-950/80 border border-amber-500/20 shadow-inner">
          <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            {formattedTime}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {isTimerRunning
              ? 'Maintain single-pointed attention until completion'
              : 'Set your interval and begin your study session'}
          </p>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onToggleTimer}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-xs cursor-pointer shadow-md transition-all ${
              isTimerRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Focus</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onResetTimer()}
            className="p-2 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            title="Reset to selected duration"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="grid grid-cols-3 gap-1.5 pt-4 mt-4 border-t border-stone-800/80">
          <button
            type="button"
            onClick={() => onSetTimerDuration(25 * 60)}
            className="text-[11px] py-1.5 px-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 font-mono transition-colors cursor-pointer text-center"
          >
            25m Focus
          </button>
          <button
            type="button"
            onClick={() => onSetTimerDuration(50 * 60)}
            className="text-[11px] py-1.5 px-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 font-mono transition-colors cursor-pointer text-center"
          >
            50m Quest
          </button>
          <button
            type="button"
            onClick={() => onSetTimerDuration(10 * 60)}
            className="text-[11px] py-1.5 px-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 font-mono transition-colors cursor-pointer text-center"
          >
            10m Respite
          </button>
        </div>
      </div>

      {/* 2. Legendary Presence Resonance & Aura Chamber */}
      <div className="mythic-card mythic-corner-brackets rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif text-sm font-bold text-amber-200">
              Aura Resonance
            </h4>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
            {profile.legendaryPresence}%
          </span>
        </div>

        {/* Resonance Bar */}
        <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-amber-500/20 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${Math.max(5, profile.legendaryPresence)}%` }}
          />
        </div>

        <p className="text-xs text-stone-300/80 leading-relaxed">
          Passing study trial quizzes supercharges your presence gauge, attracting rarer sages, guardians, and sovereigns to your encounters.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800/80 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
            <span className="text-stone-400">Rare Summon:</span>
            <span className="font-mono text-amber-300 font-semibold">
              {profile.legendaryPresence >= 50 ? 'Enhanced' : 'Base'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
            <span className="text-stone-400">Trials Pending:</span>
            <span className="font-mono text-amber-300 font-semibold">{pendingStudyCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Mythic Codex Showcase */}
      <div className="mythic-card mythic-corner-brackets rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif text-sm font-bold text-amber-200">
              Celestial Codex
            </h4>
          </div>
          <button
            type="button"
            onClick={onOpenCodex}
            className="text-xs text-amber-300/80 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Discovered Pantheon</span>
          <span className="font-mono text-amber-300 font-semibold">
            {profile.discoveredFigures.length} / {MYTHOLOGICAL_FIGURES.length}
          </span>
        </div>

        {/* Discovered progress */}
        <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
          <div
            className="h-full bg-amber-500 transition-all duration-500 rounded-full"
            style={{
              width: `${Math.round((profile.discoveredFigures.length / MYTHOLOGICAL_FIGURES.length) * 100)}%`,
            }}
          />
        </div>

        {/* Recently discovered figures mini list */}
        {discoveredFiguresList.length > 0 ? (
          <div className="space-y-2 pt-1">
            {discoveredFiguresList.map((fig: any) => (
              <div
                key={fig.id}
                onClick={onOpenCodex}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/70 border border-amber-500/20 hover:border-amber-400/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg select-none group-hover:scale-110 transition-transform">
                    {fig.symbol}
                  </span>
                  <div>
                    <div className="text-xs font-serif font-bold text-stone-200 group-hover:text-amber-200 transition-colors">
                      {fig.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate max-w-[150px]">
                      {fig.title}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  {fig.tier}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-stone-500">
            <p>No celestial figures revealed yet.</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Complete your first study trial to summon wisdom.
            </p>
          </div>
        )}
      </div>

      {/* 4. Odyssey Stats & Chronicle Link */}
      <div className="mythic-card mythic-corner-brackets rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif text-sm font-bold text-amber-200">
              Quest Chronicle
            </h4>
          </div>
          <button
            type="button"
            onClick={onOpenHistory}
            className="text-xs text-amber-300/80 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Chronicle</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-mono">Streak</div>
              <div className="font-bold text-stone-200 text-sm">{profile.streak} Days</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-mono">Completed</div>
              <div className="font-bold text-stone-200 text-sm">{completedTodayCount} Quests</div>
            </div>
          </div>
        </div>

        {/* Level XP Progress */}
        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-300 font-medium">Lvl {level} • {title}</span>
            <span className="font-mono text-amber-400 text-[11px] font-semibold">
              {currentXp} / {nextLevelXp} XP
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
