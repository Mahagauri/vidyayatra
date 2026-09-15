import { GoogleGenAI } from '@google/genai';

function fallbackSplitter(description: string) {
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

    return {
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      type: isStudy ? 'study' : 'habit',
      category: isStudy ? 'Study Trial' : (isMantraOrHabit ? 'Sadhana & Vitality' : 'Daily Action'),
      estimatedMinutes: isStudy ? 45 : 20,
      xpReward: isStudy ? 100 : 60,
      subtasks: isStudy
        ? [
            'Understand problem & constraints',
            'Implement & verify optimal solution',
            'Review time & space complexity',
          ]
        : [
            'Find a calm, uninterrupted posture',
            'Focus mind and complete recitation with devotion',
            'Pause in silent contemplation',
          ],
      quizPromptHint: isStudy ? `Concepts and problem-solving relating to ${cleanTitle}` : '',
    };
  });
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

    const description = body.description;
    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY not set on server, using fallback');
      res.status(200).json({ tasks: fallbackSplitter(description) });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

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
    } catch (modelErr) {
      console.warn(`Primary model ${modelName} call failed, retrying with gemini-2.5-flash:`, modelErr);
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
      res.status(200).json({ tasks: fallbackSplitter(description) });
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
      res.status(200).json({ tasks: enriched });
      return;
    }

    res.status(200).json({ tasks: fallbackSplitter(description) });
  } catch (error) {
    console.error('Error in /api/decompose-day:', error);
    let desc = '';
    try {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      desc = b?.description || '';
    } catch (e) {
      desc = '';
    }
    res.status(200).json({ tasks: fallbackSplitter(desc) });
  }
}
