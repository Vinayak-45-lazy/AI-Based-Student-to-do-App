const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const authMiddleware = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.use(authMiddleware);

// POST /ai/schedule - Prioritize pending & in_progress tasks
router.post('/schedule', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all pending / in_progress tasks
    const tasks = await Task.findAll({
      where: {
        userId,
        status: ['pending', 'in_progress']
      }
    });

    if (tasks.length === 0) {
      return res.json({ message: 'No active tasks to schedule', tasks: [] });
    }

    let prioritizedIds = [];
    let parsedSuccessfully = false;

    // 1. Try Gemini prioritization
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const taskDataForPrompt = tasks.map(t => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          priority: t.priority,
          dueDate: t.dueDate,
          estimatedTime: t.estimatedTime
        }));

        const prompt = `You are StudyFlow AI, an expert academic planner. You prioritize a student's assignments to maximize focus and ensure deadlines are met.
Analyze these tasks:
${JSON.stringify(taskDataForPrompt, null, 2)}

Current Time: ${new Date().toISOString()}

Determine the optimal order of completion. Factors:
- Soonest due dates first (high urgency)
- High priority tasks first
- Short tasks that can be finished quickly to build momentum (quick wins)

Respond ONLY with a valid JSON array of strings containing the task IDs in order, from first to last. Do not include any other markdown, explanations or extra text.
Example response format:
["id-1", "id-2", "id-3"]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
        
        if (jsonMatch) {
          prioritizedIds = JSON.parse(jsonMatch[0]);
          if (Array.isArray(prioritizedIds) && prioritizedIds.length > 0) {
            parsedSuccessfully = true;
          }
        }
      } catch (geminiError) {
        console.error('Gemini Scheduling Error, falling back to local algorithm:', geminiError.message);
      }
    }

    // 2. Local Fallback Sort Algorithm
    if (!parsedSuccessfully) {
      const now = Date.now();
      const priorityWeights = { high: 3, medium: 2, low: 1 };

      const scoredTasks = tasks.map(t => {
        const dueTime = new Date(t.dueDate).getTime();
        const timeDiffHours = (dueTime - now) / (1000 * 60 * 60); // hours until due
        
        const priorityVal = priorityWeights[t.priority] || 2;
        const estHours = t.estimatedTime / 60;

        // Lower score means higher priority (should be done sooner)
        // Formula: urgency dominates (hours remaining), heavily discounted by priority weight, plus minor penalty for long durations
        const score = timeDiffHours - (priorityVal * 16) + (estHours * 2);
        
        return { id: t.id, score };
      });

      // Sort ascending by score
      scoredTasks.sort((a, b) => a.score - b.score);
      prioritizedIds = scoredTasks.map(t => t.id);
    }

    // 3. Update tasks in database with new order
    for (let i = 0; i < prioritizedIds.length; i++) {
      const taskId = prioritizedIds[i];
      await Task.update(
        { aiPriorityOrder: i + 1 },
        { where: { id: taskId, userId } }
      );
    }

    // Fetch the tasks again, in the new sorted order
    const updatedTasks = await Task.findAll({
      where: { userId },
      order: [
        ['status', 'ASC'],
        ['dueDate', 'ASC'],
        ['aiPriorityOrder', 'ASC']
      ]
    });

    return res.json({
      message: parsedSuccessfully ? 'AI Smart Plan generated successfully!' : 'Smart Plan generated offline.',
      tasks: updatedTasks
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate smart schedule plan' });
  }
});

// POST /ai/chat - Conversational study assistant
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, history } = req.body; // history = [{ role: 'user'|'model', text: '...' }]

    if (!message) {
      return res.status(400).json({ error: 'No user query message provided' });
    }

    // 1. Try Gemini API chat
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash for speed and reliability
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const systemInstruction = `You are StudyFlow AI, a warm, motivating, and brilliant AI study coach.
Your job is to help students manage their coursework, plan studies, explain complex terms, and recommend learning techniques.
Keep formatting clean using Markdown bullet points, bold text, and numbered lists where appropriate.
If asked to make a revision plan, make it structured.
Be encouraging!`;

        // Format history for Google GenAI format (requires { role: 'user'|'model', parts: [{ text: '...' }] })
        const formattedHistory = (history || []).map(h => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        }));

        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            maxOutputTokens: 800,
          },
          systemInstruction: systemInstruction
        });

        const result = await chat.sendMessage(message);
        const replyText = result.response.text();
        return res.json({ reply: replyText });
      } catch (geminiError) {
        console.error('Gemini Chat Error, falling back to local assistant:', geminiError.message);
      }
    }

    // 2. High-fidelity Offline local fallback responder
    const query = message.toLowerCase();
    let reply = '';

    if (query.includes('feynman')) {
      reply = `### The Feynman Technique 🧠
Here is how you can learn any complex topic quickly using this Nobel-prize winning technique:

1. **Choose a Concept:** Write down the title of the topic you want to study at the top of a page.
2. **Teach it to a Child:** Write out an explanation of the concept as if you were teaching it to a 10-year-old. Avoid technical jargon. Use simple words.
3. **Identify Gaps:** Look at where your explanation broke down or got complicated. Go back to your textbooks or notes to fill in these knowledge gaps.
4. **Simplify & Use Analogies:** Refine your explanation. Group key points together and find a simple analogy (e.g. comparing electrical current to water flowing in pipes).

*Try this out! dictate a concept to me and I will help you simplify it.*`;
    } else if (query.includes('pomodoro')) {
      reply = `### The Pomodoro Study Technique ⏱️
Increase your focus and manage your fatigue using timed intervals:

*   **Step 1:** Select a task (e.g. "Math Homework").
*   **Step 2:** Set a timer for **25 minutes** (this is one *Pomodoro*). Focus 100% on the task, ignoring all notifications.
*   **Step 3:** When the timer rings, take a **5-minute break**. Walk around, grab water, or stretch. Do not check social media.
*   **Step 4:** Repeat the cycle. After **4 Pomodoros**, reward yourself with a longer **15-30 minute break**.

StudyFlow AI has a built-in Pomodoro focus timer on the Dashboard! Let's get started.`;
    } else if (query.includes('active recall') || query.includes('recall') || query.includes('flashcard')) {
      reply = `### Active Recall & Spaced Repetition 💡
Active recall is the single most efficient way to study! Instead of re-reading notes (passive study), force your brain to retrieve the information.

*   **How to apply Active Recall:**
    1.  **Feynman Questions:** Write questions for yourself while reading. Next time, try to answer them without looking at the text.
    2.  **Closed Book Recall:** Read a chapter, close the book, and write down everything you remember on a blank sheet. Check what you missed.
    3.  **Flashcards:** Use Q&A style prompts.
*   **Pair it with Spaced Repetition:**
    Review materials at expanding intervals (e.g., 1 day later, 3 days later, 7 days later, 14 days later). This moves knowledge from short-term to long-term memory.`;
    } else if (query.includes('revision') || query.includes('plan') || query.includes('schedule') || query.includes('prep')) {
      reply = `### Custom Study Revision Plan 📅
Here is a structured 4-phase prep schedule to crush your upcoming assessments:

1.  **Phase 1: Diagnostic (Day 1-2)**
    *   List all subtopics appearing in the exam.
    *   Do a quick check to find your weakest topics.
2.  **Phase 2: Active Study (Day 3-10)**
    *   Spend 60% of time on your weak subjects.
    *   Study in 25-minute Pomodoro blocks.
    *   Use *Active Recall* questions instead of just reading.
3.  **Phase 3: Practice & Review (Day 11-13)**
    *   Solve past papers or mock exams under timed conditions.
    *   Create quick mind-maps linking concepts.
4.  **Phase 4: Light Refresh (Day 14 / Day before exam)**
    *   Review summary lists, equations, or vocabulary.
    *   Get at least 8 hours of sleep.

*Add your exam date in the **Calendar** tab and let me help you break down your study goals!*`;
    } else if (query.includes('productivity') || query.includes('tip') || query.includes('focus') || query.includes('distracted')) {
      reply = `### StudyFlow AI Productivity Tips 🚀
Here are 5 science-backed tips to stay focused:

1.  **Zero-Notification Zone:** Put your phone in another room while studying. Even seeing the screen can sap working memory.
2.  **Task Batching:** Group small tasks (e.g., replying to emails, filing worksheets) and do them all at once.
3.  **The 5-Minute Rule:** If you are procrastinating, commit to studying for just *5 minutes*. 80% of the time, you will keep going once you start.
4.  **Prioritization (Eisenhower Matrix):** Focus on what's *Important and Urgent* first. Let the StudyFlow **AI Smart Planner** handle this order for you automatically!
5.  **Sleep & Water:** Dehydration slows brain processing. Keep a water bottle at your desk and sleep 7-8 hours to lock in memories.`;
    } else {
      reply = `Hello! I am **StudyFlow AI**, your academic coach. 🎓

I can help you:
*   Create custom **revision plans** for your courses
*   Explain learning strategies like the **Feynman Technique** or **Active Recall**
*   Teach you how to set up **Pomodoro intervals**
*   Give you daily **productivity tips** to handle homework stress

What subject or study technique would you like to cover today?`;
    }

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'AI Assistant failed to reply' });
  }
});

module.exports = router;
