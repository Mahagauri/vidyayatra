import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Lock,
  Search,
  Flame,
  Crown,
  Sun,
  Moon,
  Feather,
  Shield,
  Compass,
  Scroll,
  Heart,
  Scale,
  Zap,
  Eye,
  TreePine,
  Copy,
  Check,
  Star,
  Bell,
} from 'lucide-react';
import { MythologicalFigure, UserProfile } from '../types';
import { MYTHOLOGICAL_FIGURES } from '../data/mythology';
import { playChimeCascade } from '../utils/audio';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

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

export const CodexModal: React.FC<CodexModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const discoveredMap = new Map<string, string>(
    profile.discoveredFigures.map((d) => [d.figureId, d.discoveredAt])
  );

  const discoveredCount = profile.discoveredFigures.length;
  const totalCount = MYTHOLOGICAL_FIGURES.length;
  const progressPercent = Math.round((discoveredCount / totalCount) * 100);

  const filteredFigures = MYTHOLOGICAL_FIGURES.filter((fig) => {
    if (selectedTier !== 'all' && fig.tier !== selectedTier) return false;
    if (searchQuery.trim()) {
      const isDiscovered = discoveredMap.has(fig.id);
      if (!isDiscovered) return false;
      const q = searchQuery.toLowerCase();
      return (
        fig.name.toLowerCase().includes(q) ||
        fig.title.toLowerCase().includes(q) ||
        fig.quote.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyQuote = (fig: MythologicalFigure) => {
    navigator.clipboard.writeText(`${fig.name}: ${fig.quote}`);
    setCopiedId(fig.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-amber-500/30 bg-[#0d091a] shadow-2xl p-5 sm:p-7 overflow-hidden my-6 flex flex-col max-h-[90vh] mythic-corner-brackets">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                  The Sacred Codex of Wisdom
                </h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300">
                  {discoveredCount} / {totalCount} ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-amber-200/60">
                A mystical archive of deities, sages, and cautionary legends unlocked through daily study trials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Filter Controls */}
        <div className="py-4 border-b border-stone-800/80 space-y-3 shrink-0">
          <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-orange-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tier Filters */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTier('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
                  selectedTier === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}
              >
                All Figures ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('cautionary')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  selectedTier === 'cautionary'
                    ? 'bg-red-950/80 border-red-500 text-red-200 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-red-400/90 hover:border-red-900'
                }`}
              >
                Cautionary Legends
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('rare')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  selectedTier === 'rare'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-purple-400/90 hover:border-purple-900'
                }`}
              >
                Rare Sages
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('uncommon')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  selectedTier === 'uncommon'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-emerald-400/90 hover:border-emerald-900'
                }`}
              >
                Celestial Guardians
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('common')}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                  selectedTier === 'common'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-amber-400/90 hover:border-amber-900'
                }`}
              >
                Sacred Divinities
              </button>
            </div>

            {/* Search Input for Discovered Quotes */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unveiled lore..."
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Figures Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFigures.map((fig) => {
              const isDiscovered = discoveredMap.has(fig.id);
              const discoveredAt = discoveredMap.get(fig.id);
              const IconComponent = SYMBOL_ICONS[fig.symbol] || Sparkles;
              const isCautionary = fig.tier === 'cautionary';

              if (!isDiscovered) {
                // Mysterious Silhouette (No spoiler!)
                return (
                  <div
                    key={fig.id}
                    className="rounded-2xl border border-stone-800/80 bg-stone-900/30 p-4 flex items-center gap-4 relative overflow-hidden group select-none opacity-60"
                  >
                    <div className="w-14 h-14 rounded-xl border border-stone-800 bg-stone-950 flex items-center justify-center text-stone-600 shrink-0">
                      <Lock className="w-5 h-5 text-stone-600 group-hover:text-amber-500/60 transition-colors" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md bg-stone-900 text-stone-500 border border-stone-800">
                          {fig.tier === 'cautionary' ? 'Cautionary' : fig.tier}
                        </span>
                        <span className="text-xs font-serif font-bold text-stone-600">
                          ??? Undiscovered Presence
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Pass a daily study trial to potentially manifest this encounter.
                      </p>
                    </div>
                  </div>
                );
              }

              // Discovered Encounter Card
              return (
                <div
                  key={fig.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                    isCautionary
                      ? 'border-red-900/50 bg-gradient-to-br from-red-950/20 via-stone-900/90 to-stone-950'
                      : fig.tier === 'rare'
                      ? 'border-purple-900/50 bg-gradient-to-br from-purple-950/20 via-stone-900/90 to-stone-950'
                      : fig.tier === 'uncommon'
                      ? 'border-emerald-900/50 bg-gradient-to-br from-emerald-950/20 via-stone-900/90 to-stone-950'
                      : 'border-amber-900/40 bg-gradient-to-br from-amber-950/20 via-stone-900/90 to-stone-950'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                            isCautionary
                              ? 'border-red-500/40 bg-red-950/50 text-red-300'
                              : 'border-amber-500/30 bg-amber-950/50 text-amber-300'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-serif text-base font-bold text-stone-100">
                              {fig.name}
                            </h3>
                            <span
                              className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isCautionary
                                  ? 'border-red-600/50 bg-red-950/60 text-red-300'
                                  : 'border-amber-500/30 bg-amber-950/60 text-amber-300'
                              }`}
                            >
                              {isCautionary ? 'Cautionary' : fig.tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 font-sans">{fig.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => playChimeCascade(fig.tier)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
                          title="Ring celestial chimes for this figure"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyQuote(fig)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Copy Quote"
                        >
                          {copiedId === fig.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Wisdom Quote */}
                    <p className="font-serif text-xs text-stone-200 italic leading-relaxed bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 my-2">
                      {fig.quote}
                    </p>
                  </div>

                  {/* Footer date */}
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-800/60 mt-1">
                    <span>Unlocked on {discoveredAt ? new Date(discoveredAt).toLocaleDateString() : 'Journey'}</span>
                    <span className="font-mono text-amber-400/80">Permanent Wisdom</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
