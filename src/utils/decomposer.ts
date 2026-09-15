import { TaskItem } from '../types';

export function clientFallbackSplitter(description: string): TaskItem[] {
  const lines = description
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const taskTitles = lines.length > 0 ? lines : [description.trim() || 'Daily Practice Session'];

  return taskTitles.map((line, idx) => {
    const isStudy =
      /study|read|revise|learn|chapter|exam|practice|notes|vocab|history|math|physics|chemistry|biology|code|program|exercise|algorithm|solve|essay|mechanics/i.test(
        line
      );
    return {
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      title: line.charAt(0).toUpperCase() + line.slice(1),
      type: isStudy ? ('study' as const) : ('habit' as const),
      category: isStudy ? 'Study Trial' : 'Daily Action',
      estimatedMinutes: isStudy ? 45 : 20,
      xpReward: isStudy ? 100 : 50,
      status: 'pending' as const,
      subtasks: [
        { id: `sub-${Date.now()}-${idx}-1`, text: 'Set up focused sanctuary', done: false },
        { id: `sub-${Date.now()}-${idx}-2`, text: 'Execute core objective with deep attention', done: false },
        { id: `sub-${Date.now()}-${idx}-3`, text: 'Consolidate takeaways and reflections', done: false },
      ],
      quizPromptHint: isStudy ? `Core principles and practical problem solving in ${line}` : '',
    };
  });
}

export function clientFallbackQuiz(taskTitle: string) {
  return [
    {
      question: `What was the central concept or core principle you mastered in "${taskTitle}"?`,
      options: [
        'The foundational definition, core mechanisms, and practical application',
        'Superficial memorization without understanding underlying mechanisms',
        'Skipped the core derivations and only skimmed chapter summary lines',
        'Unrelated peripheral trivia that has no bearing on actual mastery',
      ],
      correctIndex: 0,
      explanation: 'True mastery requires internalizing the fundamental mechanism and foundational definitions.',
    },
    {
      question: `When applying what you reviewed in "${taskTitle}", what is the most effective approach for durable retention?`,
      options: [
        'Passive rereading immediately before an exam',
        'Active recall, spaced self-testing, and deliberate problem solving',
        'Never revisiting or reviewing the concepts after today',
        'Assuming familiarity is identical to complete comprehension',
      ],
      correctIndex: 1,
      explanation: 'Active recall and spaced problem solving cement knowledge into permanent long-term memory.',
    },
    {
      question: `Which obstacle did you overcome during this study session for "${taskTitle}"?`,
      options: [
        'Maintaining sustained single-pointed concentration and overcoming distraction',
        'Procrastinating until study momentum and energy were lost',
        'Abandoning the study trial prematurely before testing understanding',
        'Fragmenting attention with social feeds and notifications',
      ],
      correctIndex: 0,
      explanation: 'Sustained single-pointed attention (Ekagrata) is the hallmark of true progress.',
    },
  ];
}
