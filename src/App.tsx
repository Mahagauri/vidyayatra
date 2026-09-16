import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Scroll,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TaskItem, UserProfile, HistoryEntry, MythologicalFigure } from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadTasks,
  saveTasks,
  loadHistory,
  saveHistory,
  calculateLevel,
  SAMPLE_TASKS,
} from './utils/storage';
import { MYTHOLOGICAL_FIGURES, rollRandomFigure } from './data/mythology';
import { playTap, playCelestialChord, startOmAmbient, stopOmAmbient, setOmVolume } from './utils/audio';

import { HeaderHUD } from './components/HeaderHUD';
import { DayInputSection } from './components/DayInputSection';
import { TaskList } from './components/TaskList';
import { FocusSanctuary } from './components/FocusSanctuary';
import { QuizModal } from './components/QuizModal';
import { ReflectionModal } from './components/ReflectionModal';
import { EncounterModal } from './components/EncounterModal';
import { CodexModal } from './components/CodexModal';
import { JournalModal } from './components/JournalModal';
import { MythicBackground } from './components/MythicBackground';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [tasks, setTasks] = useState<TaskItem[]>(loadTasks);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  // Active Modals state
  const [activeQuizTask, setActiveQuizTask] = useState<TaskItem | null>(null);
  const [activeReflectionTask, setActiveReflectionTask] = useState<TaskItem | null>(null);
  const [manifestedFigure, setManifestedFigure] = useState<MythologicalFigure | null>(null);
  const [manifestedXp, setManifestedXp] = useState<number>(100);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Focus Sanctuary Timer (Pomodoro companion)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (profile.soundEnabled) {
        playCelestialChord();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, profile.soundEnabled]);

  // Sacred Om Ambient Drone synchronization
  useEffect(() => {
    if (profile.omDroneEnabled) {
      startOmAmbient(profile.omVolume ?? 0.22);
    } else {
      stopOmAmbient();
    }
    return () => {
      // Clean up when unmounting
      stopOmAmbient(0.8);
    };
  }, [profile.omDroneEnabled]);

  const handleToggleOmDrone = () => {
    const nextState = !profile.omDroneEnabled;
    const vol = profile.omVolume ?? 0.22;
    if (nextState) {
      startOmAmbient(vol);
      setToastMessage('Sacred Om drone activated (136.1 Hz Cosmic Octave)');
    } else {
      stopOmAmbient();
      setToastMessage('Sacred Om drone paused');
    }
    setProfile((prev) => ({ ...prev, omDroneEnabled: nextState }));
  };

  const handleChangeOmVolume = (newVol: number) => {
    setOmVolume(newVol);
    setProfile((prev) => ({ ...prev, omVolume: newVol }));
  };

  // Task generation from natural language input
  const handleTasksGenerated = (newTasks: TaskItem[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const handleAddTaskManually = (newTaskData: Omit<TaskItem, 'id' | 'status'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Subtask checkbox toggling
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    if (profile.soundEnabled) {
      playTap();
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
        };
      })
    );
  };

  const handleAddSubtask = (taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: [
            ...t.subtasks,
            { id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, text, done: false },
          ],
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleUpdateNotes = (taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes } : t))
    );
  };

  // Triggering the examination / quiz
  const handleStartQuiz = (task: TaskItem) => {
    setActiveQuizTask(task);
  };

  // Quiz passing flow
  const handleQuizPassed = (taskId: string, score: { score: number; total: number }) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    // Roll a random mythological figure!
    const unlockedIds = profile.discoveredFigures.map((d) => d.figureId);
    const figure = rollRandomFigure(unlockedIds);

    // Calculate XP
    const perfectBonus = score.score === score.total ? 30 : 0;
    const earnedXp = targetTask.xpReward + perfectBonus;

    // Update Profile
    const prevLevel = calculateLevel(profile.xp).level;
    const nextXp = profile.xp + earnedXp;
    const nextLevel = calculateLevel(nextXp).level;

    if (nextLevel > prevLevel && profile.soundEnabled) {
      playCelestialChord();
    }

    const nextDiscovered = [...profile.discoveredFigures];
    if (!nextDiscovered.some((d) => d.figureId === figure.id)) {
      nextDiscovered.push({
        figureId: figure.id,
        discoveredAt: new Date().toISOString(),
      });
    }

    const nextPresence = Math.min(100, profile.legendaryPresence + 8);

    setProfile({
      ...profile,
      xp: nextXp,
      legendaryPresence: nextPresence,
      discoveredFigures: nextDiscovered,
    });

    // Mark task completed
    const completedTime = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'completed',
          quizScore: score,
          unlockedFigureId: figure.id,
          completedAt: completedTime,
        };
      })
    );

    // Inscribe in history chronicle
    const historyEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      taskId: targetTask.id,
      taskTitle: targetTask.title,
      taskType: targetTask.type,
      category: targetTask.category,
      completedAt: completedTime,
      xpEarned: earnedXp,
      reflection: `Passed verification quiz with score ${score.score}/${score.total}.`,
      figureEncountered: {
        id: figure.id,
        name: figure.name,
        tier: figure.tier,
        quote: figure.quote,
      },
    };
    setHistory((prev) => [historyEntry, ...prev]);

    // Close quiz and display encounter reward
    setActiveQuizTask(null);
    setManifestedFigure(figure);
    setManifestedXp(earnedXp);
  };

  // Triggering reflection for habits/actions
  const handleStartReflection = (task: TaskItem) => {
    setActiveReflectionTask(task);
  };

  // Reflection completion flow
  const handleConfirmReflection = (taskId: string, reflectionText: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const unlockedIds = profile.discoveredFigures.map((d) => d.figureId);
    const figure = rollRandomFigure(unlockedIds);
    const earnedXp = targetTask.xpReward;

    const prevLevel = calculateLevel(profile.xp).level;
    const nextXp = profile.xp + earnedXp;
    const nextLevel = calculateLevel(nextXp).level;

    if (nextLevel > prevLevel && profile.soundEnabled) {
      playCelestialChord();
    }

    const nextDiscovered = [...profile.discoveredFigures];
    if (!nextDiscovered.some((d) => d.figureId === figure.id)) {
      nextDiscovered.push({
        figureId: figure.id,
        discoveredAt: new Date().toISOString(),
      });
    }

    const nextPresence = Math.min(100, profile.legendaryPresence + 5);

    setProfile({
      ...profile,
      xp: nextXp,
      legendaryPresence: nextPresence,
      discoveredFigures: nextDiscovered,
    });

    const completedTime = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'completed',
          reflectionText,
          unlockedFigureId: figure.id,
          completedAt: completedTime,
        };
      })
    );

    const historyEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      taskId: targetTask.id,
      taskTitle: targetTask.title,
      taskType: targetTask.type,
      category: targetTask.category,
      completedAt: completedTime,
      xpEarned: earnedXp,
      reflection: reflectionText,
      figureEncountered: {
        id: figure.id,
        name: figure.name,
        tier: figure.tier,
        quote: figure.quote,
      },
    };
    setHistory((prev) => [historyEntry, ...prev]);

    setActiveReflectionTask(null);
    setManifestedFigure(figure);
    setManifestedXp(earnedXp);
  };

  // Reset and import handlers
  const handleResetProgress = () => {
    setShowResetModal(true);
  };

  const confirmResetProgress = () => {
    const freshProfile: UserProfile = {
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      legendaryPresence: 10,
      discoveredFigures: [],
      soundEnabled: true,
    };
    setProfile(freshProfile);
    setTasks(SAMPLE_TASKS);
    setHistory([]);
    saveUserProfile(freshProfile);
    saveTasks(SAMPLE_TASKS);
    saveHistory([]);
    setIsHistoryOpen(false);
    setShowResetModal(false);
    setToastMessage('Progress reset to origin.');
  };

  const handleClearAllTasks = () => {
    setTasks([]);
    saveTasks([]);
    setToastMessage('All template quests cleared. Quest log is ready for your input.');
  };

  const handleLoadSampleTasks = () => {
    setTasks(SAMPLE_TASKS);
    saveTasks(SAMPLE_TASKS);
    setToastMessage('Sample quest template loaded.');
  };

  const handleImportData = (data: { profile: UserProfile; history: HistoryEntry[] }) => {
    setProfile(data.profile);
    setHistory(data.history);
    saveUserProfile(data.profile);
    saveHistory(data.history);
    setToastMessage('Quest journey restored successfully!');
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const completedTodayCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingStudyCount = tasks.filter((t) => t.type === 'study' && t.status !== 'completed').length;

  return (
    <div className="min-h-screen text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 relative">
      {/* Mythical Cosmic Celestial Background */}
      <MythicBackground />

      {/* Top Gamification HUD */}
      <HeaderHUD
        profile={profile}
        totalFiguresCount={MYTHOLOGICAL_FIGURES.length}
        onToggleSound={() =>
          setProfile((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onToggleOmDrone={handleToggleOmDrone}
        onChangeOmVolume={handleChangeOmVolume}
        onOpenCodex={() => setIsCodexOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area - Scaled for Ultrawide and Standard Screens */}
      <main className="flex-1 w-full max-w-[1920px] 2xl:max-w-[2160px] 3xl:max-w-[2560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Quest Stream (Left 8 cols on xl+) */}
          <div className="xl:col-span-8 space-y-6">
            {/* The Natural Language Task Decomposer */}
            <DayInputSection
              onTasksGenerated={handleTasksGenerated}
              onAddTaskManually={handleAddTaskManually}
            />

            {/* Task Log & Study Trials */}
            <TaskList
              tasks={tasks}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onStartQuiz={handleStartQuiz}
              onStartReflection={handleStartReflection}
              onDeleteTask={handleDeleteTask}
              onUpdateNotes={handleUpdateNotes}
              onClearAllTasks={handleClearAllTasks}
              onLoadSampleTasks={handleLoadSampleTasks}
            />
          </div>

          {/* Focus Sanctuary Companion Sidebar (Right 4 cols on xl+) */}
          <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-20">
            <FocusSanctuary
              timerSeconds={timerSeconds}
              isTimerRunning={isTimerRunning}
              onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
              onResetTimer={(secs) => {
                setIsTimerRunning(false);
                setTimerSeconds(secs || 25 * 60);
              }}
              onSetTimerDuration={(secs) => {
                setIsTimerRunning(false);
                setTimerSeconds(secs);
              }}
              profile={profile}
              onToggleOmDrone={handleToggleOmDrone}
              onChangeOmVolume={handleChangeOmVolume}
              onOpenCodex={() => setIsCodexOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              completedTodayCount={completedTodayCount}
              pendingStudyCount={pendingStudyCount}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 bg-[#0c0817]/90 backdrop-blur-md py-6 text-center text-xs text-amber-200/60">
        <div className="w-full max-w-[1920px] 2xl:max-w-[2160px] 3xl:max-w-[2560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VidyaYatra • May your quest for knowledge be steadfast and illuminated</span>
          <span className="font-mono text-[11px] text-amber-300/80">
            {profile.discoveredFigures.length} of {MYTHOLOGICAL_FIGURES.length} Encounters Unveiled
          </span>
        </div>
      </footer>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#140e24] border border-amber-500/40 text-amber-200 px-4 py-3 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] text-xs font-medium mythic-corner-brackets">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[#120a16] p-6 shadow-2xl mythic-corner-brackets space-y-4">
            <h3 className="font-serif text-lg font-bold text-red-200">
              Reset Quest Journey?
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              This will reset your level, streak, and discovered celestial figures back to their origins. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-xs text-stone-300 hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetProgress}
                className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/60 text-xs text-red-200 font-semibold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Examination Modal for Study Trials */}
      {activeQuizTask && (
        <QuizModal
          task={activeQuizTask}
          isOpen={Boolean(activeQuizTask)}
          onClose={() => setActiveQuizTask(null)}
          onQuizPassed={handleQuizPassed}
        />
      )}

      {/* Reflection Modal for Daily Habits */}
      {activeReflectionTask && (
        <ReflectionModal
          task={activeReflectionTask}
          isOpen={Boolean(activeReflectionTask)}
          onClose={() => setActiveReflectionTask(null)}
          onConfirmReflection={handleConfirmReflection}
        />
      )}

      {/* Mythological Encounter Reward Modal */}
      {manifestedFigure && (
        <EncounterModal
          figure={manifestedFigure}
          xpEarned={manifestedXp}
          isOpen={Boolean(manifestedFigure)}
          soundEnabled={profile.soundEnabled}
          onClose={() => setManifestedFigure(null)}
        />
      )}

      {/* Sacred Codex Modal */}
      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        profile={profile}
      />

      {/* Mythic Chronicle & Journal Modal */}
      <JournalModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        profile={profile}
        onResetProgress={handleResetProgress}
        onImportData={handleImportData}
      />
    </div>
  );
}
