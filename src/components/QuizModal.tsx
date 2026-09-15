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

      if (!res.ok) {
        throw new Error('Failed to generate verification quiz');
      }

      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setUserAnswers(new Array(data.questions.length).fill(-1));
      } else {
        throw new Error('Empty quiz returned');
      }
    } catch (err: any) {
      console.error('Quiz loading error:', err);
      setError('Could not prepare quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    const next = [...userAnswers];
    next[qIdx] = optIdx;
    setUserAnswers(next);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const score = isSubmitted ? calculateScore() : 0;
  const isPassed = isSubmitted && score >= Math.ceil(questions.length * 0.6); // 2 of 3
  const allAnswered = userAnswers.every((ans) => ans !== -1);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleClaim = () => {
    onQuizPassed(task.id, { score, total: questions.length });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-[#0d091a] shadow-2xl p-6 sm:p-7 overflow-hidden my-8 mythic-corner-brackets">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-semibold">
                Verification Examination
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-100 line-clamp-1">
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

        {/* Content Body */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="w-9 h-9 mx-auto text-amber-400 animate-spin" />
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-stone-200">
                Inscribing the Trial Questions...
              </h3>
              <p className="text-xs text-stone-400">
                Formulating 3 specific questions to genuinely verify your study mastery.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-4">
            <HelpCircle className="w-8 h-8 mx-auto text-stone-500" />
            <p className="text-sm text-stone-400">{error}</p>
            <button
              onClick={loadQuiz}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Inscription
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Questions list */}
            <div className="space-y-6 max-h-[58vh] overflow-y-auto pr-1">
              {questions.map((q, qIdx) => {
                const selectedOption = userAnswers[qIdx];
                const isCorrect = isSubmitted && selectedOption === q.correctIndex;
                const isWrong = isSubmitted && selectedOption !== q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      !isSubmitted
                        ? 'border-stone-800 bg-stone-950/60'
                        : isCorrect
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-red-500/30 bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="text-sm sm:text-base font-medium text-stone-100 flex items-start gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md mt-0.5">
                          Q{qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </h4>

                      {isSubmitted && (
                        <div className="shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isActualCorrect = isSubmitted && optIdx === q.correctIndex;

                        let optClasses =
                          'border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-300';
                        if (!isSubmitted && isChosen) {
                          optClasses =
                            'border-amber-500 bg-amber-950/40 text-amber-100 ring-1 ring-amber-500/50';
                        } else if (isSubmitted) {
                          if (isActualCorrect) {
                            optClasses =
                              'border-emerald-500 bg-emerald-950/40 text-emerald-100 font-medium ring-1 ring-emerald-500/50';
                          } else if (isChosen && !isActualCorrect) {
                            optClasses =
                              'border-red-500 bg-red-950/40 text-red-200 line-through';
                          } else {
                            optClasses = 'border-stone-800/60 bg-stone-950/40 text-stone-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            disabled={isSubmitted}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optClasses}`}
                          >
                            <span className="font-mono text-xs opacity-60 shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {isSubmitted && (
                      <div className="mt-3 pt-3 border-t border-stone-800/80 text-xs text-stone-300 bg-stone-900/40 p-2.5 rounded-xl">
                        <span className="font-semibold text-amber-300">Explanation: </span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-stone-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {isSubmitted ? (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-sm font-bold font-mono px-3 py-1.5 rounded-xl border ${
                        isPassed
                          ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                          : 'border-red-500/40 bg-red-950/50 text-red-300'
                      }`}
                    >
                      Score: {score} / {questions.length} (
                      {Math.round((score / questions.length) * 100)}%)
                    </div>
                    <span className="text-xs text-stone-400">
                      {isPassed
                        ? 'Mastery Proven. Sacred Wisdom awaits.'
                        : 'Review the explanations and attempt again.'}
                    </span>
                  </div>

                  {isPassed ? (
                    <button
                      type="button"
                      id="claim-wisdom-btn"
                      onClick={handleClaim}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Manifest Sacred Encounter</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={loadQuiz}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Verification</span>
                    </button>
                  )}
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
