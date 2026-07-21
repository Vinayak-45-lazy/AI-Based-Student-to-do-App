import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VoiceInput from './components/VoiceInput';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Planner from './pages/Planner';
import AIAssistant from './pages/AIAssistant';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

import { api } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing'); // landing, auth, dashboard, tasks, etc.
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [theme, setTheme] = useState('dark');
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Load initial settings
  useEffect(() => {
    const storedToken = localStorage.getItem('studyflow_token');
    const storedUser = localStorage.getItem('studyflow_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setTheme(parsedUser.theme || 'dark');
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('landing');
    }
  }, []);

  // Sync theme to body element
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch tasks whenever user/token is set
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const data = await api.tasks.getAll();
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const handleLogin = (loggedInUser, userToken) => {
    setUser(loggedInUser);
    setToken(userToken);
    setTheme(loggedInUser.theme || 'dark');
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
    setTasks([]);
    setCurrentPage('landing');
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (user) {
      try {
        const updated = await api.profile.update({ theme: newTheme });
        setUser(updated);
      } catch (e) {
        console.warn('Failed to save theme state online, updated theme locally.');
      }
    }
  };

  const navigateToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentPage('auth');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    setTheme(updatedUser.theme || 'dark');
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  // --- RENDER VIEWS PATHS ---

  if (currentPage === 'landing') {
    return <Landing onNavigateToAuth={navigateToAuth} />;
  }

  if (currentPage === 'auth') {
    return (
      <Auth 
        initialMode={authMode} 
        onAuthSuccess={handleLogin} 
        onNavigateHome={() => setCurrentPage('landing')} 
      />
    );
  }

  // Determine Active Header Title
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Assignment List';
      case 'planner': return 'AI Smart Schedule';
      case 'assistant': return 'AI Study Assistant';
      case 'calendar': return 'Calendar Agenda';
      case 'notes': return 'Study Notes';
      case 'analytics': return 'Productivity Analytics';
      case 'profile': return 'Student Profile';
      default: return 'StudyFlow AI';
    }
  };

  return (
    <div className="app-container">
      {/* Glow decorations background */}
      <div className="gradient-bg-blob blob-indigo"></div>
      <div className="gradient-bg-blob blob-cyan"></div>

      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />

      {/* Main app panel */}
      <main className="main-content">
        <Header 
          title={getPageTitle()} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          user={user}
          onVoiceClick={() => setIsVoiceOpen(true)}
        />

        <div className="page-view-wrapper">
          {currentPage === 'dashboard' && (
            <Dashboard 
              user={user} 
              tasks={tasks} 
              refreshTasks={fetchTasks} 
              navigateTo={setCurrentPage}
            />
          )}

          {currentPage === 'tasks' && (
            <Tasks 
              tasks={tasks} 
              refreshTasks={fetchTasks} 
              searchTerm={searchTerm}
            />
          )}

          {currentPage === 'planner' && (
            <Planner 
              tasks={tasks} 
              refreshTasks={fetchTasks} 
            />
          )}

          {currentPage === 'assistant' && (
            <AIAssistant />
          )}

          {currentPage === 'calendar' && (
            <Calendar 
              tasks={tasks} 
              refreshTasks={fetchTasks} 
            />
          )}

          {currentPage === 'notes' && (
            <Notes 
              tasks={tasks}
            />
          )}

          {currentPage === 'analytics' && (
            <Analytics 
              tasks={tasks} 
            />
          )}

          {currentPage === 'profile' && (
            <Profile 
              user={user} 
              theme={theme}
              toggleTheme={toggleTheme}
              onUserUpdate={handleUserUpdate}
            />
          )}
        </div>
      </main>

      {/* Voice Parser Dialog Overlay */}
      <VoiceInput 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}

export default App;
