export type TaskType = 'study' | 'habit';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  type: TaskType;
  category: string;
  estimatedMinutes: number;
  xpReward: number;
  status: TaskStatus;
  subtasks: { id: string; text: string; done: boolean }[];
  quizPromptHint?: string;
  notes?: string;
  completedAt?: string;
  quizScore?: { score: number; total: number };
  reflectionText?: string;
  unlockedFigureId?: string;
}

export type FigureTier = 'common' | 'uncommon' | 'rare' | 'cautionary';

export interface MythologicalFigure {
  id: string;
  name: string;
  title: string;
  tier: FigureTier;
  symbol: string;
  quote: string;
  element: 'solar' | 'fire' | 'mystic' | 'verdant' | 'cosmic' | 'abyssal' | 'cautionary';
  rarityWeight: number; // For weighted random rolls
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProfile {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  legendaryPresence: number; // 0 - 100% gauge
  discoveredFigures: {
    figureId: string;
    discoveredAt: string;
    isFavorite?: boolean;
  }[];
  soundEnabled: boolean;
  omDroneEnabled?: boolean;
  omVolume?: number; // 0.0 to 1.0 (default 0.22)
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  taskType: TaskType;
  category: string;
  completedAt: string;
  xpEarned: number;
  reflection?: string;
  figureEncountered?: {
    id: string;
    name: string;
    tier: FigureTier;
    quote: string;
  };
}
