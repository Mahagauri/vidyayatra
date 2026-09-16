import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Loader2,
  RefreshCw,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { QuizQuestion, TaskItem } from '../types';
import { clientFallbackQuiz } from '../utils/decomposer';

interface QuizModalProps {
  task: TaskItem;
  isOpen: boolean;
  onClose: () => void;
  onQuizPassed: (taskId: string, score: { score: number; total: number }) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  task,
  isOpen,
  onClose,
  onQuizPassed,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      loadQuiz();
    }
  }, [isOpen, task?.id]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setIsSubmitted(false);
    setUserAnswers([]);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          notes: task.notes || '',
          category: task.category,
          hint: task.quizPromptHint || task.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          setUserAnswers(new Array(data.questions.length).fill(-1));
          setLoading(false);
          return;
        }
      }
      // Fallback client quiz
      const fallback = clientFallbackQuiz(task.title);
      setQuestions(fallback);
      setUserAnswers(new Array(fallback.length).fill(-1));
    } catch {
      const fallback = clientFallbackQuiz(task.title);
      setQuestions(fallback);
      setUserAnswers(new Array(fallback.length).fill(-1));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[qIdx] = optionIdx;
      return updated;
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });
    return { score: correct, total: questions.length };
  };

  const allAnswered = userAnswers.length > 0 && userAnswers.every((ans) => ans !== -1);
  const scoreResult = isSubmitted ? calculateScore() : null;
  const isPassed = scoreResult ? scoreResult.score >= Math.ceil(questions.length * 0.6) : false;

  const handleSubmit = () => {
    if (!allAnswered) return;
    setIsSubmitted(true);
  };

  const handleClaimVictory = () => {
    if (scoreResult) {
      onQuizPassed(task.id, scoreResult);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-[#0f0a1c] p-6 shadow-2xl mythic-corner-brackets space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-semibold">
                  Study Trial Examination
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  +{task.xpReward} XP Reward
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-100 mt-1">
                {task.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="font-serif text-amber-200 text-sm">
              Summoning celestial verification queries...
            </p>
            <p className="text-xs text-stone-400">
              Formulating diagnostic questions to prove your mastery.
            </p>
          </div>
        )}

        {/* Quiz Content */}
        {!loading && questions.length > 0 && (
          <div className="space-y-6">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((q, qIdx) => {
                const selectedOption = userAnswers[qIdx];
                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl bg-stone-950/70 border border-amber-500/20 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-medium text-stone-200 leading-snug pt-0.5">
                        {q.question}
                      </h4>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isCorrectAnswer = optIdx === q.correctIndex;

                        let borderClass = 'border-stone-800 hover:border-amber-500/40 bg-stone-900/60';
                        let icon = null;

                        if (isSubmitted) {
                          if (isCorrectAnswer) {
                            borderClass = 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200';
                            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                          } else if (isChosen && !isCorrectAnswer) {
                            borderClass = 'border-red-500/80 bg-red-950/30 text-red-200';
                            icon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
                          }
                        } else if (isChosen) {
                          borderClass = 'border-amber-400 bg-amber-950/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${borderClass}`}
                          >
                            <span>{opt}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>

                    {/* Post-submission explanation */}
                    {isSubmitted && (
                      <div className="pl-8 pt-1 text-[11px] text-stone-400 leading-relaxed italic border-t border-stone-800 mt-2">
                        <span className="font-semibold text-amber-300 not-italic">Note: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-500/20">
              {isSubmitted && scoreResult ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-amber-200">
                      Score: {scoreResult.score} / {scoreResult.total}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        isPassed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {isPassed ? 'Trial Passed' : 'Need 60% to Pass'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPassed && (
                      <button
                        type="button"
                        onClick={loadQuiz}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-800 text-stone-300 hover:text-white text-xs cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Trial</span>
                      </button>
                    )}

                    {isPassed && (
                      <button
                        type="button"
                        onClick={handleClaimVictory}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Claim XP &amp; Summon Wisdom</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xs text-stone-400">
                    Answer all {questions.length} questions to verify your study trial.
                  </span>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
                  >
                    <span>Submit Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;