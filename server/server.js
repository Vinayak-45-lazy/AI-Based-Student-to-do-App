require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const notesRoutes = require('./routes/notes');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StudyFlow AI Server is active and healthy.' });
});

// Serve frontend static build in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback to React index.html for single page routing
app.get('*', (req, res) => {
  const apiRouteCheck = req.path.startsWith('/api/');
  if (apiRouteCheck) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      // If client build doesn't exist yet, show a developer notice
      res.status(200).send(`
        <div style="font-family: system-ui, sans-serif; text-align: center; padding: 4rem;">
          <h1>StudyFlow AI Backend is Running!</h1>
          <p>Please build the client application using <code>npm run build</code> inside the client directory, or run the app in development mode using <code>npm run dev</code> at the root.</p>
        </div>
      `);
    }
  });
});

// Sync Database and Start Server
const startServer = async () => {
  try {
    // Sync models to SQLite database
    await sequelize.sync({ alter: true });
    console.log('✔ SQLite Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`✔ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('✘ Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
