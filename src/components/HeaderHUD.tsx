import React from 'react';
import { Award, Flame, BookOpen, Scroll, Volume2, VolumeX } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateLevel } from '../utils/storage';

interface HeaderHUDProps {
  profile: UserProfile;
  totalFiguresCount: number;
  onToggleSound: () => void;
  onToggleOmDrone: () => void;
  onChangeOmVolume: (volume: number) => void;
  onOpenCodex: () => void;
  onOpenHistory: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  profile,
  totalFiguresCount,
  onToggleSound,
  onToggleOmDrone,
  onChangeOmVolume,
  onOpenCodex,
  onOpenHistory,
}) => {
  const { level, currentXp, nextLevelXp, title } = calculateLevel(profile.xp);
  const progressPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  const discoveredCount = profile.discoveredFigures.length;
  const isOmActive = Boolean(profile.omDroneEnabled);
  const omVol = profile.omVolume ?? 0.22;

  return (
    <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-[#0c0817]/90 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      <div className="w-full max-w-[1920px] 2xl:max-w-[2160px] 3xl:max-w-[2560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 via-purple-900/40 to-stone-950 border border-amber-400/50 shadow-lg shadow-amber-950/60 group">
            <span className="font-serif text-xl font-bold text-amber-200 group-hover:scale-110 transition-transform">वि</span>
            <div className="absolute -inset-1 rounded-xl bg-amber-500/20 blur-sm -z-10 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
                <span className="mythic-gold-text">VidyaYatra</span>
                <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-950/70 text-amber-300 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  Mythic Odyssey
                </span>
              </h1>
            </div>
            <p className="text-xs text-amber-200/60 font-sans">
              Daily Study Trials & Celestial Wisdom Encounters
            </p>
          </div>
        </div>

        {/* Gamification Stats HUD */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Level & XP Capsule */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-amber-500/25 bg-stone-950/70 shadow-sm shadow-amber-950/20">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[11px] font-semibold text-stone-200 flex items-center gap-1.5">
                  <span className="text-amber-300 font-bold">Lvl {level}</span>
                  <span className="text-amber-500/40 hidden sm:inline">•</span>
                  <span className="text-amber-200/90 font-medium hidden sm:inline">{title}</span>
                </div>
                <div className="w-24 sm:w-28 h-1.5 bg-stone-900 border border-amber-500/20 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono">
              {currentXp}/{nextLevelXp} XP
            </span>
          </div>

          {/* Fire Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/40 bg-orange-950/40 text-orange-200 shadow-sm shadow-orange-950/40" title="Consecutive active days">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-500/40 animate-pulse" />
            <span className="text-xs font-bold font-mono text-orange-300">{profile.streak}</span>
            <span className="text-[11px] font-medium hidden sm:inline text-orange-200/90">Day Streak</span>
          </div>

          {/* Codex Encounter Counter */}
          <button
            id="open-codex-btn"
            onClick={onOpenCodex}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/50 to-purple-950/40 hover:border-amber-400 text-amber-200 transition-all shadow-sm shadow-amber-950/30 cursor-pointer"
            title="Open Mythological Codex"
          >
            <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold font-mono text-amber-300">
              {discoveredCount}/{totalFiguresCount}
            </span>
            <span className="text-[11px] text-amber-200 font-medium hidden sm:inline">Codex</span>
          </button>

          {/* Chronicle / Journal Button */}
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-950/70 hover:border-amber-500/30 hover:bg-stone-900 text-stone-300 hover:text-amber-200 transition-colors shadow-sm cursor-pointer"
            title="View Completed Tasks & Reflection Log"
          >
            <Scroll className="w-4 h-4 text-amber-400/70" />
            <span className="text-[11px] font-medium hidden sm:inline">Chronicle</span>
          </button>

          {/* Sacred Om Ambient Drone Button */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-amber-500/30 bg-stone-950/80 shadow-sm shadow-amber-950/40">
            <button
              id="toggle-om-drone-btn"
              type="button"
              onClick={onToggleOmDrone}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                isOmActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-amber-200/80 hover:text-amber-300'
              }`}
              title={isOmActive ? 'Pause Sacred Om Background Drone' : 'Play Sacred Om (136.1 Hz Cosmic Octave Drone)'}
              aria-label="Toggle Sacred Om Sound"
            >
              <span className="text-sm font-sans">ॐ</span>
              <span className="font-sans text-[11px] font-semibold hidden sm:inline">
                {isOmActive ? 'Om Active' : 'Om Drone'}
              </span>
            </button>

            {isOmActive && (
              <input
                id="om-volume-slider"
                type="range"
                min="0.05"
                max="0.6"
                step="0.01"
                value={omVol}
                onChange={(e) => onChangeOmVolume(parseFloat(e.target.value))}
                className="w-14 sm:w-16 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mr-1"
                title={`Om Volume: ${Math.round(omVol * 100)}%`}
                aria-label="Sacred Om Volume Slider"
              />
            )}
          </div>

          {/* Sound Effects / Chimes Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            className="p-2 rounded-xl border border-stone-800 bg-stone-950/70 hover:border-amber-500/30 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={profile.soundEnabled ? 'Mute Chimes & UI SFX' : 'Unmute Chimes & UI SFX'}
            aria-label="Sound Effects Toggle"
          >
            {profile.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};