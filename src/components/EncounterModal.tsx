import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Flame,
  Crown,
  Sun,
  Moon,
  Feather,
  Shield,
  Compass,
  BookOpen,
  Scroll,
  Heart,
  Scale,
  Zap,
  Eye,
  TreePine,
  ArrowRight,
  BookmarkCheck,
  Bell,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import { MythologicalFigure } from '../types';
import {
  playCautionaryGong,
  playCelestialChord,
  playTempleBell,
  startEncounterChimeLoop,
  playChimeCascade,
} from '../utils/audio';

interface EncounterModalProps {
  figure: MythologicalFigure | null;
  xpEarned: number;
  isOpen: boolean;
  soundEnabled: boolean;
  onClose: () => void;
}

// Icon mapper for symbolic representations
const SYMBOL_ICONS: Record<string, React.ElementType> = {
  Crown,
  Flame,
  Sun,
  Moon,
  Feather,
  Shield,
  Compass,
  BookOpen,
  Scroll,
  Heart,
  Scale,
  Zap,
  Eye,
  TreePine,
  Sparkles,
};

export const EncounterModal: React.FC<EncounterModalProps> = ({
  figure,
  xpEarned,
  isOpen,
  soundEnabled,
  onClose,
}) => {
  const [chimesEnabled, setChimesEnabled] = useState(true);
  const [chimePulse, setChimePulse] = useState(false);

  // Continuous atmospheric chimes loop while reading the character wisdom
  useEffect(() => {
    if (!isOpen || !figure || !soundEnabled || !chimesEnabled) return;

    // Start repeating serene wind chimes throughout the encounter
    const stopChimeLoop = startEncounterChimeLoop(figure.tier);

    // Initial chime pulse animation
    setChimePulse(true);
    const pulseTimer = setTimeout(() => setChimePulse(false), 2000);

    return () => {
      stopChimeLoop();
      clearTimeout(pulseTimer);
    };
  }, [isOpen, figure, soundEnabled, chimesEnabled]);

  const handleManualChime = () => {
    if (!figure) return;
    setChimePulse(true);
    setTimeout(() => setChimePulse(false), 1800);
    playChimeCascade(figure.tier);
  };

  if (!isOpen || !figure) return null;

  const isCautionary = figure.tier === 'cautionary';
  const IconComponent = SYMBOL_ICONS[figure.symbol] || Sparkles;

  // Tier presentation styling
  const tierBadges: Record<string, { label: string; badgeClasses: string; glowColor: string; borderClasses: string }> = {
    cautionary: {
      label: 'Cautionary Legend',
      badgeClasses: 'bg-red-950/80 border-red-600/60 text-red-300 shadow-lg shadow-red-950/50',
      glowColor: 'bg-red-600/15',
      borderClasses: 'border-red-600/40 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950',
    },
    rare: {
      label: 'Rare Illuminated Sage',
      badgeClasses: 'bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-950/40',
      glowColor: 'bg-purple-600/15',
      borderClasses: 'border-purple-500/40 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950',
    },
    uncommon: {
      label: 'Celestial Guardian',
      badgeClasses: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/40',
      glowColor: 'bg-emerald-600/15',
      borderClasses: 'border-emerald-500/40 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950',
    },
    common: {
      label: 'Sacred Divinity',
      badgeClasses: 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-950/40',
      glowColor: 'bg-amber-500/15',
      borderClasses: 'border-amber-500/40 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950',
    },
  };

  const config = tierBadges[figure.tier] || tierBadges.common;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
      <div
        className={`relative w-full max-w-xl rounded-3xl border ${config.borderClasses} shadow-2xl p-6 sm:p-8 overflow-hidden my-6 transition-all animate-in fade-in zoom-in-95 duration-300 mythic-corner-brackets`}
      >
        {/* Thematic radial glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 ${config.glowColor} rounded-full blur-3xl pointer-events-none -z-10`}
        />

        {/* Top Header / Tier Banner & Chime Resonance Controls */}
        <div className="text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-[11px] font-mono uppercase font-bold tracking-wider ${config.badgeClasses}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </div>

            {/* Ambient Chimes Control Pill */}
            {soundEnabled && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-500/30 bg-stone-950/80 text-[11px] text-amber-200/90 shadow-sm">
                <button
                  type="button"
                  onClick={handleManualChime}
                  className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full hover:bg-amber-500/20 text-amber-300 font-medium transition-colors cursor-pointer"
                  title="Click to ring a shimmering cascade of celestial chimes"
                >
                  <Bell className={`w-3.5 h-3.5 ${chimePulse ? 'animate-bounce text-amber-300' : chimesEnabled ? 'animate-pulse text-amber-400' : 'text-stone-500'}`} />
                  <span className="font-sans font-semibold">
                    {chimesEnabled ? 'Chimes Active' : 'Chimes Paused'}
                  </span>
                </button>

                <span className="text-stone-600">•</span>

                <button
                  type="button"
                  onClick={() => setChimesEnabled(!chimesEnabled)}
                  className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title={chimesEnabled ? 'Pause continuous chimes' : 'Resume continuous wind chimes'}
                >
                  {chimesEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Symbolic Icon glyph - Clickable to ring chimes */}
          <div className="flex justify-center my-2">
            <button
              type="button"
              onClick={handleManualChime}
              title="Click emblem to ring celestial chimes"
              className={`relative flex items-center justify-center w-20 h-20 rounded-2xl border ${
                isCautionary
                  ? 'border-red-500/50 bg-red-950/40 text-red-300 hover:border-red-400'
                  : 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:border-amber-300'
              } shadow-xl shadow-black/60 cursor-pointer transition-all transform hover:scale-105 active:scale-95 group`}
            >
              <IconComponent className={`w-10 h-10 ${chimePulse ? 'scale-110 text-amber-200' : 'animate-pulse'} transition-transform`} />
              <div
                className={`absolute -inset-1 rounded-2xl ${
                  isCautionary ? 'bg-red-600/20' : 'bg-amber-500/20'
                } ${chimePulse ? 'blur-lg scale-110 opacity-100' : 'blur-md'} -z-10 transition-all`}
              />
              {/* Subtle chime wave animation ring */}
              {chimePulse && (
                <div className="absolute -inset-3 rounded-3xl border border-amber-400/40 animate-ping pointer-events-none" />
              )}
            </button>
          </div>

          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-100">
              {figure.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-sans mt-0.5">
              {figure.title}
            </p>
          </div>
        </div>

        {/* The Personal Spoken Wisdom Quote */}
        <div className="my-6 relative rounded-2xl border border-stone-800 bg-stone-950/70 p-5 sm:p-6 shadow-inner">
          <span
            className={`font-serif text-4xl leading-none select-none opacity-30 ${
              isCautionary ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            “
          </span>
          <blockquote className="font-serif text-sm sm:text-base text-stone-100 italic leading-relaxed sm:leading-loose text-center px-2">
            {figure.quote.replace(/^["“]|["”]$/g, '')}
          </blockquote>
          <div className="text-right">
            <span
              className={`font-serif text-4xl leading-none select-none opacity-30 ${
                isCautionary ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              ”
            </span>
          </div>

          {isCautionary && (
            <div className="mt-2 text-center">
              <span className="text-[11px] font-mono text-red-400/90 font-medium">
                • A lesson in desire, power, and the paramount sovereignty of righteousness •
              </span>
            </div>
          )}
        </div>

        {/* Rewards summary */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-800 bg-stone-900/80 mb-6">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-stone-300">
              Recorded in your permanent <span className="font-semibold text-amber-300">Sacred Codex</span>
            </span>
          </div>

          <div className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            +{xpEarned} XP
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          id="absorb-wisdom-btn"
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCautionary
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-950'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950'
          }`}
        >
          <span>Absorb Wisdom & Walk Forth</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
