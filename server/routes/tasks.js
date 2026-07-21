const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const authMiddleware = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.use(authMiddleware);


// GET /tasks
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, priority, status } = req.query;
    
    const whereClause = { userId };
    
    if (subject) whereClause.subject = subject;
    if (priority) whereClause.priority = priority;
    if (status) whereClause.status = status;

    const tasks = await Task.findAll({
      where: whereClause,
      order: [
        ['status', 'ASC'], // pending and in_progress first
        ['dueDate', 'ASC'], // closest deadline first
        ['aiPriorityOrder', 'ASC'] // then AI priority ranking
      ]
    });
    
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /tasks
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, subject, priority, dueDate, status, tags, estimatedTime } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and Due Date are required fields' });
    }

    const task = await Task.create({
      userId,
      title,
      description,
      subject: subject || 'General',
      priority: priority || 'medium',
      dueDate,
      status: status || 'pending',
      tags: tags || '',
      estimatedTime: estimatedTime || 30
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, description, subject, priority, dueDate, status, tags, estimatedTime, aiPriorityOrder } = req.body;

    const task = await Task.findOne({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      subject: subject !== undefined ? subject : task.subject,
      priority: priority !== undefined ? priority : task.priority,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      status: status !== undefined ? status : task.status,
      tags: tags !== undefined ? tags : task.tags,
      estimatedTime: estimatedTime !== undefined ? estimatedTime : task.estimatedTime,
      aiPriorityOrder: aiPriorityOrder !== undefined ? aiPriorityOrder : task.aiPriorityOrder
    });

    return res.json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    return res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /tasks/voice - Parses natural voice input text and creates task
router.post('/voice', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'No voice transcript provided' });
    }

    // Default values
    let title = text;
    let subject = 'General';
    let priority = 'medium';
    let dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // default tomorrow
    let description = 'Created via Voice Command: "' + text + '"';
    let estimatedTime = 45;

    let parsedSuccessfully = false;

    // Optional Gemini NLP check
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        
        const prompt = `You are a helper parsing a student's voice command to create a task.
Command: "${text}"
Current Time: ${new Date().toISOString()}

Respond strictly with valid JSON inside a codeblock matching this schema (do not explain, do not add extra text):
{
  "title": "String task title",
  "subject": "String course name, e.g. Math, History, Physics (default: General)",
  "priority": "high" or "medium" or "low",
  "dueDate": "ISO String for when it is due (default is 24h from now)",
  "estimatedTime": number (minutes, default: 45)
}`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          title = parsed.title || title;
          subject = parsed.subject || subject;
          priority = parsed.priority || priority;
          dueDate = new Date(parsed.dueDate || dueDate);
          estimatedTime = parsed.estimatedTime || estimatedTime;
          parsedSuccessfully = true;
        }
      } catch (geminiError) {
        console.error('Gemini Voice Parsing Error, falling back to regex:', geminiError.message);
      }
    }

    // Fallback Regex Rule-based parsing
    if (!parsedSuccessfully) {
      const lowerText = text.toLowerCase();

      // Extract subject
      const subjects = ['math', 'science', 'history', 'english', 'biology', 'chemistry', 'physics', 'geography', 'art', 'music', 'computer science', 'coding'];
      for (const sub of subjects) {
        if (lowerText.includes(sub)) {
          subject = sub.charAt(0).toUpperCase() + sub.slice(1);
          break;
        }
      }

      // Extract priority
      if (lowerText.includes('urgent') || lowerText.includes('high') || lowerText.includes('important') || lowerText.includes('exam') || lowerText.includes('test')) {
        priority = 'high';
      } else if (lowerText.includes('low') || lowerText.includes('easy')) {
        priority = 'low';
      }

      // Extract date indicators
      if (lowerText.includes('today')) {
        dueDate = new Date();
        dueDate.setHours(23, 59, 0, 0);
      } else if (lowerText.includes('tomorrow')) {
        dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        dueDate.setHours(17, 0, 0, 0); // default to 5 PM tomorrow
      } else if (lowerText.includes('next week')) {
        dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        dueDate.setHours(17, 0, 0, 0);
      } else if (lowerText.includes('tonight')) {
        dueDate = new Date();
        dueDate.setHours(21, 0, 0, 0);
      }

      // Clean up title (remove action phrases at start)
      title = text
        .replace(/^(add|create|make|remind me to|new task to|please add)\s+/i, '')
        .replace(/\s+(due|tomorrow|today|tonight|next week|by|for|subject|priority).*$/i, '');
      
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    // Create the task
    const task = await Task.create({
      userId,
      title,
      description,
      subject,
      priority,
      dueDate,
      status: 'pending',
      tags: 'voice',
      estimatedTime
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to parse and create task via voice' });
  }
});

module.exports = router;
