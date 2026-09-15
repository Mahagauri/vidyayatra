import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let genaiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genaiClient) {
    genaiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genaiClient;
}

// Fallback task splitter
function fallbackSplitter(description: string) {
  const lines = description
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  return lines.map((line, idx) => {
    const isStudy =
      /study|read|revise|learn|chapter|exam|practice|notes|vocab|history|math|physics|chemistry|biology|code|program|exercise 1|algorithm/i.test(
        line
      );
    return {
      id: `task-${Date.now()}-${idx}`,
      title: line.charAt(0).toUpperCase() + line.slice(1),
      type: isStudy ? ('study' as const) : ('habit' as const),
      category: isStudy ? 'Study Trial' : 'Daily Action',
      estimatedMinutes: isStudy ? 45 : 20,
      xpReward: isStudy ? 100 : 50,
      subtasks: [
        'Prepare focus environment',
        'Complete core objective',
        'Review key takeaways',
      ],
      quizPromptHint: isStudy
        ? `Concepts and problem-solving relating to ${line}`
        : '',
    };
  });
}

// Fallback quiz generator
function fallbackQuiz(taskTitle: string) {
  return [
    {
      question: `What was the central concept or core principle you mastered in "${taskTitle}"?`,
      options: [
        'The foundational definition and underlying rules/mechanisms',
        'Only superficial memorization without applying the concept',
        'Skipped the main concept and only glanced at headings',
        'Unrelated peripheral trivia that has no bearing on mastery',
      ],
      correctIndex: 0,
      explanation:
        'True mastery requires internalizing the fundamental mechanism and foundational definitions.',
    },
    {
      question: `When applying what you reviewed in "${taskTitle}", what is the recommended practice for retention?`,
      options: [
        'Immediate passive rereading without active recall',
        'Active recall, spaced repetition, and practical application',
        'Never revisiting the material again',
        'Assuming familiarity is the same as comprehension',
      ],
      correctIndex: 1,
      explanation:
        'Active recall and practical application cement knowledge deeply into long-term recall.',
    },
    {
      question: `Which obstacle did you successfully navigate while completing "${taskTitle}"?`,
      options: [
        'Overcoming distraction by maintaining deliberate deep focus',
        'Procrastinating until momentum was lost',
        'Abandoning the task before verifying understanding',
        'Multitasking with unrelated social feeds',
      ],
      correctIndex: 0,
      explanation:
        'Sustained single-pointed attention is the hallmark of dharmic study and true progress.',
    },
  ];
}

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/decompose-day', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log('Gemini API key missing, using fallback parser');
      res.json({ tasks: fallbackSplitter(description) });
      return;
    }

    const prompt = `You are the VidyaYatra task decomposition sage. The user describes their intended daily plan:
"${description}"

CRITICAL RULE FOR TASK SPLITTING:
- If the user's sentence mentions multiple activities, actions, or routines (e.g. "complete leetcode problem before sleeping and then chant 32 durga mantra", or "revise physics chapter 4, run 5km, read 10 pages"), you MUST separate them into DISTINCT individual tasks in the "tasks" array. NEVER merge separate activities into one combined task title.
- Distinguish study/academic work from spiritual/habit/wellness rituals.

For each individual task:
- Categorize type strictly as either:
  * "study" (for academic learning, revision, reading, coding/LeetCode, memorizing, practicing concepts testable with a quiz)
  * "habit" (for chanting, japa, meditation, physical chores, workouts, routines which require honest self-reflection/check).
- Assign an appropriate category name (e.g. "DSA & Code Craft", "Sadhana & Meditation", "Mathematics", "Physical Wellness", "Life Dharma").
- Provide realistic estimatedMinutes (e.g. 20, 30, 45, 60).
- Assign an XP reward based on depth (40 to 150 XP).
- Include 2-3 tailored actionable checklist subtasks.
- If type is "study", provide a quizPromptHint specifying what specific concepts from this task should be tested.

Respond STRICTLY with valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "Task title",
      "type": "study" | "habit",
      "category": "Category name",
      "estimatedMinutes": 45,
      "xpReward": 100,
      "subtasks": ["subtask 1", "subtask 2"],
      "quizPromptHint": "specific topics/concepts"
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
    } catch (mErr) {
      console.warn(`Model ${modelName} failed, retrying with gemini-2.5-flash:`, mErr);
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
      res.json({ tasks: fallbackSplitter(description) });
      return;
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      const enriched = parsed.tasks.map((t: any, idx: number) => ({
        ...t,
        id: `task-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        type: t.type === 'habit' ? 'habit' : 'study',
        estimatedMinutes: Number(t.estimatedMinutes) || 30,
        xpReward: Number(t.xpReward) || (t.type === 'study' ? 100 : 50),
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        quizPromptHint: t.quizPromptHint || '',
      }));
      res.json({ tasks: enriched });
      return;
    }

    res.json({ tasks: fallbackSplitter(description) });
  } catch (error) {
    console.error('Error decomposing day:', error);
    res.json({ tasks: fallbackSplitter(req.body?.description || '') });
  }
});

app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { taskTitle, notes, category, hint } = req.body;
    if (!taskTitle) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log('Gemini API key missing, using intelligent fallback quiz');
      res.json({ questions: fallbackQuiz(taskTitle) });
      return;
    }

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
    } catch (mErr) {
      console.warn(`Model ${modelName} failed in quiz, retrying with gemini-2.5-flash:`, mErr);
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
      res.json({ questions: fallbackQuiz(taskTitle) });
      return;
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      res.json({ questions: parsed.questions });
      return;
    }

    res.json({ questions: fallbackQuiz(taskTitle) });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.json({ questions: fallbackQuiz(req.body?.taskTitle || 'Study Session') });
  }
});

// Setup server and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VidyaYatra server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
