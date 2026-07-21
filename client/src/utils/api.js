// API client with seamless LocalStorage fallback
const API_URL = 'https://ai-based-student-to-do-app.onrender.com/api';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('studyflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Check if we are connected to the backend
let isBackendOnline = true;

const checkBackend = async () => {
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' });
    if (res.ok) {
      isBackendOnline = true;
    }
  } catch (e) {
    isBackendOnline = false;
  }
};

// Initialize backend check
checkBackend();
// Re-check periodically
setInterval(checkBackend, 15000);

// --- LOCAL STORAGE DATA SEEDERS ---
const getLocalTasks = () => {
  const tasks = localStorage.getItem('studyflow_tasks');
  if (!tasks) {
    const demoTasks = [
      {
        id: 'demo-1',
        title: 'Math Calculus Homework',
        description: 'Complete questions 1 to 15 on page 42. Focus on derivatives.',
        subject: 'Math',
        priority: 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        tags: 'homework,calculus',
        estimatedTime: 60,
        aiPriorityOrder: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        title: 'Chemistry Lab Report Draft',
        description: 'Draft introduction and methods section for the titration experiment.',
        subject: 'Chemistry',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        tags: 'lab,report',
        estimatedTime: 90,
        aiPriorityOrder: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-3',
        title: 'Read Biology Chapter 5',
        description: 'Take notes on photosynthesis pathways and light reactions.',
        subject: 'Biology',
        priority: 'low',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        tags: 'reading',
        estimatedTime: 45,
        aiPriorityOrder: 3,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('studyflow_tasks', JSON.stringify(demoTasks));
    return demoTasks;
  }
  return JSON.parse(tasks);
};

const getLocalNotes = () => {
  const notes = localStorage.getItem('studyflow_notes');
  if (!notes) {
    const demoNotes = [
      {
        id: 'note-1',
        title: 'Active Recall Biology Qs',
        content: '<p><strong>Q: What is the primary pigment in photosynthesis?</strong><br>A: Chlorophyll a.</p><p><strong>Q: Where do the light-dependent reactions take place?</strong><br>A: In the thylakoid membranes of chloroplasts.</p>',
        taskId: 'demo-3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'note-2',
        title: 'Calc Derivative Formulas',
        content: '<p>Key formulas to memorize:</p><ul><li>Power Rule: d/dx(x^n) = n*x^(n-1)</li><li>Product Rule: (f*g)\' = f\'g + fg\'</li><li>Quotient Rule: (f/g)\' = (f\'g - fg\') / g^2</li></ul>',
        taskId: 'demo-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('studyflow_notes', JSON.stringify(demoNotes));
    return demoNotes;
  }
  return JSON.parse(notes);
};

const getLocalSessions = () => {
  const sessions = localStorage.getItem('studyflow_sessions');
  if (!sessions) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const demoSessions = [
      { id: 's-1', subject: 'Math', durationMinutes: 25, date: yesterday },
      { id: 's-2', subject: 'Math', durationMinutes: 25, date: yesterday },
      { id: 's-3', subject: 'Chemistry', durationMinutes: 45, date: today }
    ];
    localStorage.setItem('studyflow_sessions', JSON.stringify(demoSessions));
    return demoSessions;
  }
  return JSON.parse(sessions);
};

// API Methods
export const api = {
  // Auth routes
  auth: {
    register: async (name, email, password) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Registration failed');
          localStorage.setItem('studyflow_token', data.token);
          localStorage.setItem('studyflow_user', JSON.stringify(data.user));
          return data;
        } catch (e) {
          if (e.message !== 'Failed to fetch') throw e;
        }
      }

      // Fallback
      const mockUser = {
        id: 'mock-user-id',
        name,
        email,
        academicGoals: 'Stay organized and study efficiently!',
        theme: 'dark',
        notificationsEnabled: true
      };
      const mockToken = 'mock-jwt-token-12345';
      localStorage.setItem('studyflow_token', mockToken);
      localStorage.setItem('studyflow_user', JSON.stringify(mockUser));
      return { token: mockToken, user: mockUser, isOffline: true };
    },

    login: async (email, password) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Login failed');
          localStorage.setItem('studyflow_token', data.token);
          localStorage.setItem('studyflow_user', JSON.stringify(data.user));
          return data;
        } catch (e) {
          if (e.message !== 'Failed to fetch') throw e;
        }
      }

      // Fallback
      const storedUser = localStorage.getItem('studyflow_user');
      const user = storedUser ? JSON.parse(storedUser) : {
        id: 'mock-user-id',
        name: 'Demo Student',
        email,
        academicGoals: 'Score a high GPA and submit assignments on time!',
        theme: 'dark',
        notificationsEnabled: true
      };

      const mockToken = 'mock-jwt-token-12345';
      localStorage.setItem('studyflow_token', mockToken);
      localStorage.setItem('studyflow_user', JSON.stringify(user));
      return { token: mockToken, user, isOffline: true };
    },

    googleLogin: async (name, email, googleId) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, googleId })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Google login failed');
          localStorage.setItem('studyflow_token', data.token);
          localStorage.setItem('studyflow_user', JSON.stringify(data.user));
          return data;
        } catch (e) {
          if (e.message !== 'Failed to fetch') throw e;
        }
      }

      // Fallback
      const mockUser = {
        id: googleId || 'google-user-id',
        name,
        email,
        academicGoals: 'Organize my assignments and studies with AI',
        theme: 'dark',
        notificationsEnabled: true
      };
      const mockToken = 'mock-jwt-token-google';
      localStorage.setItem('studyflow_token', mockToken);
      localStorage.setItem('studyflow_user', JSON.stringify(mockUser));
      return { token: mockToken, user: mockUser, isOffline: true };
    },

    logout: () => {
      localStorage.removeItem('studyflow_token');
      localStorage.removeItem('studyflow_user');
    }
  },

  // Task routes
  tasks: {
    getAll: async (filters = {}) => {
      if (isBackendOnline) {
        try {
          const queryParams = new URLSearchParams(filters).toString();
          const res = await fetch(`${API_URL}/tasks?${queryParams}`, {
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, falling back to LocalStorage tasks');
        }
      }

      // Fallback
      let tasks = getLocalTasks();
      if (filters.subject) tasks = tasks.filter(t => t.subject === filters.subject);
      if (filters.priority) tasks = tasks.filter(t => t.priority === filters.priority);
      if (filters.status) tasks = tasks.filter(t => t.status === filters.status);

      // Sort: status pending first, due date soonest, then priority order
      const priorityVal = { high: 3, medium: 2, low: 1 };
      return tasks.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'completed' ? 1 : -1;
        }
        const diff = new Date(a.dueDate) - new Date(b.dueDate);
        if (diff !== 0) return diff;
        return (a.aiPriorityOrder || 99) - (b.aiPriorityOrder || 99);
      });
    },

    create: async (taskData) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(taskData)
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, creating task locally');
        }
      }

      // Fallback
      const tasks = getLocalTasks();
      const newTask = {
        id: 'local-' + Math.random().toString(36).substr(2, 9),
        ...taskData,
        status: taskData.status || 'pending',
        subject: taskData.subject || 'General',
        priority: taskData.priority || 'medium',
        estimatedTime: parseInt(taskData.estimatedTime) || 30,
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
      localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
      return newTask;
    },

    update: async (id, taskData) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(taskData)
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, updating task locally');
        }
      }

      // Fallback
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');

      tasks[index] = { ...tasks[index], ...taskData };
      localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
      return tasks[index];
    },

    delete: async (id) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, deleting task locally');
        }
      }

      // Fallback
      const tasks = getLocalTasks();
      const updated = tasks.filter(t => t.id !== id);
      localStorage.setItem('studyflow_tasks', JSON.stringify(updated));
      return { message: 'Task deleted successfully' };
    },

    parseVoice: async (text) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/tasks/voice`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text })
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, parsing voice text locally');
        }
      }

      // Local Voice Parsing engine
      const lower = text.toLowerCase();
      let subject = 'General';
      let priority = 'medium';
      let dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      let title = text;

      // Extract subject
      const subjects = ['math', 'science', 'history', 'english', 'biology', 'chemistry', 'physics', 'geography', 'art', 'music', 'coding'];
      for (const sub of subjects) {
        if (lower.includes(sub)) {
          subject = sub.charAt(0).toUpperCase() + sub.slice(1);
          break;
        }
      }

      // Extract priority
      if (lower.includes('urgent') || lower.includes('high') || lower.includes('important')) {
        priority = 'high';
      } else if (lower.includes('low') || lower.includes('easy')) {
        priority = 'low';
      }

      // Extract Date
      if (lower.includes('today')) {
        const d = new Date();
        d.setHours(23, 59, 0, 0);
        dueDate = d.toISOString();
      } else if (lower.includes('tomorrow')) {
        const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
        d.setHours(17, 0, 0, 0);
        dueDate = d.toISOString();
      }

      // Clean Title
      title = text
        .replace(/^(add|create|make|remind me to|new task to)\s+/i, '')
        .replace(/\s+(due|tomorrow|today|next week|by|for|subject|priority).*$/i, '');
      title = title.charAt(0).toUpperCase() + title.slice(1);

      return api.tasks.create({
        title,
        subject,
        priority,
        dueDate,
        description: `Dictated: "${text}"`,
        estimatedTime: 45
      });
    }
  },

  // Note routes
  notes: {
    getAll: async () => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/notes`, {
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, loading notes locally');
        }
      }

      // Fallback
      return getLocalNotes();
    },

    create: async (noteData) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(noteData)
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, saving note locally');
        }
      }

      // Fallback
      const notes = getLocalNotes();
      const newNote = {
        id: 'note-' + Math.random().toString(36).substr(2, 9),
        title: noteData.title,
        content: noteData.content || '',
        taskId: noteData.taskId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      notes.push(newNote);
      localStorage.setItem('studyflow_notes', JSON.stringify(notes));
      return newNote;
    },

    update: async (id, noteData) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(noteData)
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, updating note locally');
        }
      }

      // Fallback
      const notes = getLocalNotes();
      const idx = notes.findIndex(n => n.id === id);
      if (idx === -1) throw new Error('Note not found');

      notes[idx] = {
        ...notes[idx],
        ...noteData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('studyflow_notes', JSON.stringify(notes));
      return notes[idx];
    },

    delete: async (id) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, deleting note locally');
        }
      }

      // Fallback
      const notes = getLocalNotes();
      const updated = notes.filter(n => n.id !== id);
      localStorage.setItem('studyflow_notes', JSON.stringify(updated));
      return { message: 'Note deleted successfully' };
    }
  },

  // AI assistant routes
  ai: {
    getSmartPlan: async () => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/ai/schedule`, {
            method: 'POST',
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, scheduling smart plan locally');
        }
      }

      // Offline Schedule prioritizer fallback
      const tasks = getLocalTasks().filter(t => t.status !== 'completed');
      const now = Date.now();
      const weights = { high: 3, medium: 2, low: 1 };

      const scored = tasks.map(t => {
        const timeRemainingHours = (new Date(t.dueDate).getTime() - now) / (1000 * 60 * 60);
        const wVal = weights[t.priority] || 2;
        const estH = t.estimatedTime / 60;

        // Formula: urgency-based, discounted by high-priority, with a minor duration penalty
        const score = timeRemainingHours - (wVal * 16) + (estH * 2);
        return { ...t, score };
      });

      scored.sort((a, b) => a.score - b.score);

      // Update local storage order indexes
      const allTasks = getLocalTasks();
      scored.forEach((t, i) => {
        const match = allTasks.find(at => at.id === t.id);
        if (match) match.aiPriorityOrder = i + 1;
      });
      localStorage.setItem('studyflow_tasks', JSON.stringify(allTasks));

      return {
        message: 'Smart Plan generated offline.',
        tasks: allTasks.sort((a, b) => {
          if (a.status !== b.status) return a.status === 'completed' ? 1 : -1;
          const diff = new Date(a.dueDate) - new Date(b.dueDate);
          if (diff !== 0) return diff;
          return (a.aiPriorityOrder || 99) - (b.aiPriorityOrder || 99);
        })
      };
    },

    chat: async (message, history) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message, history })
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, generating chat reply locally');
        }
      }

      // Local chat responses engine
      const query = message.toLowerCase();
      let reply = '';

      if (query.includes('feynman')) {
        reply = `### The Feynman Technique 🧠 (Offline Mode)
Here is how you can learn any complex topic quickly using this Nobel-prize winning technique:
1. **Choose a Concept:** Write down the title of the topic at the top of a page.
2. **Teach it to a Child:** Write out an explanation as if you were teaching it to a 10-year-old. Keep it simple.
3. **Identify Gaps:** Look at where your explanation broke down. Re-study that section.
4. **Simplify & Use Analogies:** Refine and find a simple analogy.`;
      } else if (query.includes('pomodoro')) {
        reply = `### The Pomodoro Study Technique ⏱️ (Offline Mode)
Increase your focus using timed intervals:
*   **Step 1:** Select a task (e.g. "Math Homework").
*   **Step 2:** Focus 100% on the task for **25 minutes** (one *Pomodoro*).
*   **Step 3:** Take a **5-minute break** to walk around.
*   **Step 4:** Repeat the cycle. After **4 Pomodoros**, take a longer **15-30 minute break**.`;
      } else if (query.includes('active recall') || query.includes('recall')) {
        reply = `### Active Recall & Spaced Repetition 💡 (Offline Mode)
Instead of re-reading notes (passive study), force your brain to retrieve the information.
1.  **Feynman Questions:** Write questions for yourself while reading and test yourself later.
2.  **Closed Book Recall:** Read a chapter, close the book, and write down everything you remember.
3.  **Spaced Repetition:** Review at expanding intervals (1 day, 3 days, 7 days, 14 days later) to solidify long-term memory.`;
      } else {
        reply = `Hello! I am **StudyFlow AI**, your offline study coach. 🎓
I can explain study techniques like **Feynman**, **Pomodoro**, and **Active Recall**, or suggest study schedules. How can I help you today?`;
      }

      return { reply };
    }
  },

  // Analytics routes
  analytics: {
    getStats: async () => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/analytics`, {
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, computing analytics locally');
        }
      }

      // Fallback analytics compiler
      const tasks = getLocalTasks();
      const sessions = getLocalSessions();

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const completedTasksCount = completedTasks.length;
      const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
      const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress').length;

      // Score
      let productivityScore = 0;
      if (totalTasks > 0) {
        productivityScore = Math.round((completedTasksCount / totalTasks) * 80 + 20); // mock calculation
      } else {
        productivityScore = 80;
      }

      // Subject breakdown
      const subMap = {};
      tasks.forEach(t => {
        if (!subMap[t.subject]) subMap[t.subject] = { total: 0, completed: 0 };
        subMap[t.subject].total++;
        if (t.status === 'completed') subMap[t.subject].completed++;
      });
      const subjectBreakdown = Object.keys(subMap).map(sub => ({
        subject: sub,
        total: subMap[sub].total,
        completed: subMap[sub].completed,
        completionRate: Math.round((subMap[sub].completed / subMap[sub].total) * 100)
      }));

      // StudyHoursTrend last 7 days
      const days = [];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // sum durations
        const duration = sessions
          .filter(s => s.date === dateStr)
          .reduce((acc, curr) => acc + curr.durationMinutes, 0);

        days.push({
          date: dateStr,
          day: weekdays[d.getDay()],
          minutes: duration,
          hours: parseFloat((duration / 60).toFixed(1))
        });
      }

      const totalMins = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const totalStudyHours = parseFloat((totalMins / 60).toFixed(1));

      return {
        summary: {
          totalTasks,
          completedTasks: completedTasksCount,
          pendingTasks: pendingTasksCount,
          inProgressTasks: inProgressTasksCount,
          productivityScore,
          totalStudyHours
        },
        subjectBreakdown,
        studyHoursTrend: days
      };
    },

    recordSession: async (taskId, subject, durationMinutes) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/analytics/session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ taskId, subject, durationMinutes })
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, recording session locally');
        }
      }

      // Fallback
      const sessions = getLocalSessions();
      const newSession = {
        id: 's-' + Math.random().toString(36).substr(2, 9),
        taskId: taskId || null,
        subject: subject || 'General',
        durationMinutes: parseInt(durationMinutes),
        date: new Date().toISOString().split('T')[0]
      };
      sessions.push(newSession);
      localStorage.setItem('studyflow_sessions', JSON.stringify(sessions));
      return newSession;
    }
  },

  // Profile preferences routes
  profile: {
    get: async () => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/profile`, {
            headers: getHeaders()
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, retrieving profile locally');
        }
      }

      // Fallback
      const stored = localStorage.getItem('studyflow_user');
      if (stored) return JSON.parse(stored);

      const userObj = {
        id: 'mock-user-id',
        name: 'Demo Student',
        email: 'student@example.com',
        academicGoals: 'Score top grades and keep schedules streamlined!',
        theme: 'dark',
        notificationsEnabled: true
      };
      localStorage.setItem('studyflow_user', JSON.stringify(userObj));
      return userObj;
    },

    update: async (profileData) => {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn('API error, updating profile locally');
        }
      }

      // Fallback
      const current = await api.profile.get();
      const updated = { ...current, ...profileData };
      localStorage.setItem('studyflow_user', JSON.stringify(updated));
      return updated;
    }
  }
};
