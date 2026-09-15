import { HistoryEntry, TaskItem, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'vidyayatra_profile_v1',
  TASKS: 'vidyayatra_tasks_v1',
  HISTORY: 'vidyayatra_history_v1',
};

export const INITIAL_PROFILE: UserProfile = {
  xp: 180,
  level: 1,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  legendaryPresence: 15,
  discoveredFigures: [],
  soundEnabled: true,
};

export const SAMPLE_TASKS: TaskItem[] = [
  {
    id: 'sample-task-1',
    title: 'Review Organic Chemistry Mechanism: SN1 vs SN2 Reactions',
    type: 'study',
    category: 'Chemistry',
    estimatedMinutes: 45,
    xpReward: 120,
    status: 'pending',
    subtasks: [
      { id: 'sub-1', text: 'Contrast polar protic vs aprotic solvent effects', done: true },
      { id: 'sub-2', text: 'Draw transition state stereochemistry (inversion vs racemization)', done: false },
      { id: 'sub-3', text: 'Solve 3 end-of-chapter substrate comparison problems', done: false },
    ],
    quizPromptHint: 'Differences between SN1 and SN2 kinetics, nucleophile strength, and stereochemistry inversion',
  },
  {
    id: 'sample-task-2',
    title: 'Mythic Lore & Philosophy: Revise 20 Vocabulary Words',
    type: 'study',
    category: 'Lore & Wisdom',
    estimatedMinutes: 30,
    xpReward: 90,
    status: 'pending',
    subtasks: [
      { id: 'sub-4', text: 'Recall meanings of ethical principles, discipline, discernment, and truth', done: false },
      { id: 'sub-5', text: 'Write flashcards for 10 root verbs (Dhatu)', done: false },
    ],
    quizPromptHint: 'Core philosophical terms: ethical principles, discernment, karma, and root word definitions',
  },
  {
    id: 'sample-task-3',
    title: 'Daily Action: Organize Study Desk & Set Evening Tea',
    type: 'habit',
    category: 'Daily Routine',
    estimatedMinutes: 15,
    xpReward: 50,
    status: 'pending',
    subtasks: [
      { id: 'sub-6', text: 'Clear books and notes from surface', done: false },
      { id: 'sub-7', text: 'Prepare hydration and clean notebook for evening session', done: false },
    ],
  },
];

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return INITIAL_PROFILE;
    const parsed = JSON.parse(raw) as UserProfile;

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const last = new Date(parsed.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // consecutive day
        parsed.streak = (parsed.streak || 0) + 1;
      } else if (diffDays > 1) {
        // broken streak
        parsed.streak = 1;
      }
      parsed.lastActiveDate = today;
      saveUserProfile(parsed);
    }

    return parsed;
  } catch (e) {
    console.error('Failed to load user profile:', e);
    return INITIAL_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function loadTasks(): TaskItem[] {
  if (typeof window === 'undefined') return SAMPLE_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(SAMPLE_TASKS);
      return SAMPLE_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks:', e);
    return SAMPLE_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history:', e);
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; title: string } {
  // Each level requires 250 * level XP
  let lvl = 1;
  let accumulated = 0;

  while (xp >= accumulated + lvl * 250) {
    accumulated += lvl * 250;
    lvl++;
  }

  const currentXp = xp - accumulated;
  const nextLevelXp = lvl * 250;

  const titles = [
    'Initiate Scholar',
    'Dedicated Seeker',
    'Inquirer of Wisdom',
    'Master of Discernment',
    'Keeper of Lore',
    'Master of Insight',
    'Illuminated Sage',
    'Sovereign Scholar',
  ];

  const title = titles[Math.min(lvl - 1, titles.length - 1)];

  return { level: lvl, currentXp, nextLevelXp, title };
}
