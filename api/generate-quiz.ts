import { GoogleGenAI } from '@google/genai';

function fallbackQuiz(taskTitle: string) {
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const { taskTitle, notes, category, hint } = body;
    if (!taskTitle) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key missing, using fallback quiz');
      res.status(200).json({ questions: fallbackQuiz(taskTitle) });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `You are the VidyaYatra Examination Sage. The user has completed a study trial titled:
"${taskTitle}"
Category: ${category || 'General Study'}
Student Notes/Reflection: ${notes || 'No specific notes provided'}
Subject Hint: ${hint || taskTitle}

Generate a short, high-quality verification quiz consisting of exactly 3 multiple choice questions to genuinely test whether the student understood and studied this material.
Make the questions thoughtful, substantive, and directly relevant to the topic of "${taskTitle}".
Ensure each question has 4 options, an integer 0-indexed correctIndex pointing to the right option, and a short 1-2 sentence explanation.

Respond STRICTLY with valid JSON matching this schema:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
    } catch (modelErr) {
      console.warn(`Primary model ${modelName} call failed in quiz, retrying with gemini-2.5-flash:`, modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const text = response.text;
    if (!text) {
      res.status(200).json({ questions: fallbackQuiz(taskTitle) });
      return;
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      res.status(200).json({ questions: parsed.questions });
      return;
    }

    res.status(200).json({ questions: fallbackQuiz(taskTitle) });
  } catch (error) {
    console.error('Error generating quiz:', error);
    let title = 'Study Session';
    try {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      title = b?.taskTitle || title;
    } catch (e) {
      // ignore
    }
    res.status(200).json({ questions: fallbackQuiz(title) });
  }
}
