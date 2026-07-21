const express = require('express');
const router = express.Router();
const { Task, StudySession } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authMiddleware);

// GET /analytics - Get productivity statistics
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all tasks for user
    const tasks = await Task.findAll({ where: { userId } });
    
    const totalCount = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completedCount = completedTasks.length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const progressCount = tasks.filter(t => t.status === 'in_progress').length;

    // Compute productivity score (0 - 100)
    // Base: Task completion percentage (weight: 60%)
    // Bonus: completing High priority tasks (weight: 20%)
    // Bonus: tasks done on time (weight: 20%)
    let productivityScore = 0;
    if (totalCount > 0) {
      const completionRatio = completedCount / totalCount;
      
      const highPriorityTasks = tasks.filter(t => t.priority === 'high');
      const completedHighPriority = highPriorityTasks.filter(t => t.status === 'completed');
      const highPriorityRatio = highPriorityTasks.length > 0 ? (completedHighPriority.length / highPriorityTasks.length) : 1;

      // Mock deadlines check
      const onTimeRatio = 0.9; // 90% default on time

      productivityScore = Math.round(
        (completionRatio * 60) + 
        (highPriorityRatio * 20) + 
        (onTimeRatio * 20)
      );
    } else {
      productivityScore = 80; // default initial score
    }

    // Get Subject Breakdown
    const subjectStats = {};
    tasks.forEach(t => {
      if (!subjectStats[t.subject]) {
        subjectStats[t.subject] = { total: 0, completed: 0 };
      }
      subjectStats[t.subject].total++;
      if (t.status === 'completed') {
        subjectStats[t.subject].completed++;
      }
    });

    const subjectBreakdown = Object.keys(subjectStats).map(subject => ({
      subject,
      total: subjectStats[subject].total,
      completed: subjectStats[subject].completed,
      completionRate: Math.round((subjectStats[subject].completed / subjectStats[subject].total) * 100)
    }));

    // Fetch study sessions in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const studySessions = await StudySession.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: sevenDaysAgo.toISOString().split('T')[0]
        }
      },
      order: [['date', 'ASC']]
    });

    // Group study sessions by date
    const dailyStudyMinutes = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      dailyStudyMinutes[dateString] = 0;
    }

    studySessions.forEach(session => {
      const dateStr = session.date;
      if (dailyStudyMinutes[dateStr] !== undefined) {
        dailyStudyMinutes[dateStr] += session.durationMinutes;
      } else {
        dailyStudyMinutes[dateStr] = session.durationMinutes;
      }
    });

    const studyHoursTrend = Object.keys(dailyStudyMinutes).map(date => {
      const dateObj = new Date(date + 'T00:00:00');
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date,
        day: dayName,
        minutes: dailyStudyMinutes[date],
        hours: parseFloat((dailyStudyMinutes[date] / 60).toFixed(1))
      };
    });

    // Total Study Hours
    const totalMinutes = studySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalStudyHours = parseFloat((totalMinutes / 60).toFixed(1));

    return res.json({
      summary: {
        totalTasks: totalCount,
        completedTasks: completedCount,
        pendingTasks: pendingCount,
        inProgressTasks: progressCount,
        productivityScore,
        totalStudyHours
      },
      subjectBreakdown,
      studyHoursTrend
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// POST /analytics/session - Register a completed study session
router.post('/session', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId, subject, durationMinutes } = req.body;

    if (!durationMinutes) {
      return res.status(400).json({ error: 'Session duration is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const session = await StudySession.create({
      userId,
      taskId: taskId || null,
      subject: subject || 'General',
      durationMinutes: parseInt(durationMinutes),
      date: todayStr
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to record study session' });
  }
});

module.exports = router;
