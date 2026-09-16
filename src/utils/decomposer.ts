import { TaskItem } from '../types';

export function clientFallbackSplitter(description: string): TaskItem[] {
  // Split on newlines, semicolons, and conjunctions
  let rawParts: string[] = [];
  const initialBlocks = description.split(/[\n;]+/);

  for (const block of initialBlocks) {
    const subParts = block
      .split(/\s+(?:and\s+then|then|after\s+that|also|and\s+also|\band\b(?=\s+(?:chant|study|solve|complete|do|read|revise|meditate|workout|exercise|practice)))\s+/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    
    if (subParts.length > 0) {
      rawParts.push(...subParts);
    } else if (block.trim().length > 2) {
      rawParts.push(block.trim());
    }
  }

  const taskTitles = rawParts.length > 0 ? rawParts : [description.trim() || 'Daily Practice Session'];

  return taskTitles.map((line, idx) => {
    const cleanTitle = line.replace(/^[\s\-•*]+/, '').trim();
    const isStudy =
      /study|read|revise|learn|chapter|exam|practice|notes|vocab|history|math|physics|chemistry|biology|code|program|exercise|algorithm|solve|essay|mechanics|leetcode|dsa/i.test(
        cleanTitle
      );
    const isMantraOrHabit =
      /chant|mantra|meditat|japa|walk|sleep|water|gym|workout|clean|cook|pray|puja|breath/i.test(cleanTitle);

    let category = 'Daily Action';
    if (isStudy) category = 'Study Trial';
    if (isMantraOrHabit) category = 'Sadhana & Vitality';

    return {
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      type: isStudy ? ('study' as const) : ('habit' as const),
      category,
      estimatedMinutes: isStudy ? 45 : 20,
      xpReward: isStudy ? 100 : 60,
      status: 'pending' as const,
      subtasks: isStudy
        ? [
            { id: `sub-${Date.now()}-${idx}-1`, text: 'Understand problem & constraints', done: false },
            { id: `sub-${Date.now()}-${idx}-2`, text: 'Implement & verify optimal solution', done: false },
            { id: `sub-${Date.now()}-${idx}-3`, text: 'Review time & space complexity', done: false },
          ]
        : [
            { id: `sub-${Date.now()}-${idx}-1`, text: 'Find a calm, uninterrupted posture', done: false },
            { id: `sub-${Date.now()}-${idx}-2`, text: 'Focus mind and complete recitation with devotion', done: false },
            { id: `sub-${Date.now()}-${idx}-3`, text: 'Pause in silent contemplation', done: false },
          ],
      quizPromptHint: isStudy ? `Key problem solving patterns and algorithms in ${cleanTitle}` : '',
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