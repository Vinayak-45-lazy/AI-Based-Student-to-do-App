import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Flame, 
  TrendingUp, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Bell, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../utils/api';

const Dashboard = ({ user, tasks, refreshTasks, navigateTo }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    productivityScore: 80,
    totalStudyHours: 0.0
  });

  // Pomodoro Timer States
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work' | 'break'
  const [selectedSubject, setSelectedSubject] = useState('General');

  // AI Quote State
  const [quote, setQuote] = useState("Focus is a muscle, and you're training it well today.");
  const quotesList = [
    "Focus is a muscle, and you're training it well today.",
    "Your future self will thank you for studying today.",
    "Small steps every day lead to massive achievements.",
    "Procrastination is the thief of time. Master your agenda!",
    "Success isn't overnight. It's the sum of details managed well.",
    "Believe you can and you're halfway there. Keep pushing!",
    "Great work requires focus and structured study. You've got this!"
  ];

  useEffect(() => {
    fetchStats();
    // Set a random motivational quote
    const randIdx = Math.floor(Math.random() * quotesList.length);
    setQuote(quotesList[randIdx]);
  }, [tasks]);

  // Pomodoro Countdown Logic
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Timer Finished
            handleTimerComplete();
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds]);

  const fetchStats = async () => {
    try {
      const result = await api.analytics.getStats();
      setStats(result.summary);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const handleTimerComplete = async () => {
    setTimerActive(false);
    
    // Play alert sound (optional mock)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio check blocked or unsupported');
    }

    if (timerMode === 'work') {
      const sessionDuration = 25; // default pomodoro
      alert(`🎉 Excellent! You've completed a 25-minute Pomodoro study block for ${selectedSubject}!`);
      try {
        await api.analytics.recordSession(null, selectedSubject, sessionDuration);
        fetchStats();
        if (refreshTasks) refreshTasks();
      } catch (err) {
        console.error(err);
      }
      // Switch to break
      setTimerMode('break');
      setTimerMinutes(5);
    } else {
      alert("☕ Break time is over! Ready to get back to work?");
      setTimerMode('work');
      setTimerMinutes(25);
    }
    setTimerSeconds(0);
  };

  const toggleTimer = () => setTimerActive(!timerActive);
  
  const resetTimer = () => {
    setTimerActive(false);
    setTimerMinutes(timerMode === 'work' ? 25 : 5);
    setTimerSeconds(0);
  };

  // Filter tasks due within 48 hours (pending or in_progress)
  const getUrgentTasks = () => {
    const now = Date.now();
    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      const dueTime = new Date(t.dueDate).getTime();
      const hoursDiff = (dueTime - now) / (1000 * 60 * 60);
      return hoursDiff > -1 && hoursDiff <= 48;
    }).slice(0, 3);
  };

  const urgentTasks = getUrgentTasks();

  // Progress Circle variables
  const completionPercentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Metrics Row */}
      <div className="dashboard-grid">
        <div className="col-3 stat-card-wrapper">
          <div className="glass-panel stat-card-inner">
            <div className="stat-card-icon icon-cyan">
              <CheckCircle size={20} />
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">{stats.completedTasks}</span>
              <span className="stat-card-lbl">Tasks Done</span>
            </div>
          </div>
        </div>

        <div className="col-3 stat-card-wrapper">
          <div className="glass-panel stat-card-inner">
            <div className="stat-card-icon icon-indigo">
              <Flame size={20} />
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">{stats.pendingTasks}</span>
              <span className="stat-card-lbl">Pending Tasks</span>
            </div>
          </div>
        </div>

        <div className="col-3 stat-card-wrapper">
          <div className="glass-panel stat-card-inner">
            <div className="stat-card-icon icon-purple">
              <TrendingUp size={20} />
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">{stats.productivityScore}%</span>
              <span className="stat-card-lbl">Productivity Score</span>
            </div>
          </div>
        </div>

        <div className="col-3 stat-card-wrapper">
          <div className="glass-panel stat-card-inner">
            <div className="stat-card-icon icon-yellow">
              <Clock size={20} />
            </div>
            <div className="stat-card-details">
              <span className="stat-card-num">{stats.totalStudyHours}h</span>
              <span className="stat-card-lbl">Study Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row */}
      <div className="dashboard-grid dashboard-main-row">
        {/* Progress & Focus Column */}
        <div className="col-8 dashboard-left-col">
          {/* Progress Overview Panel */}
          <div className="glass-panel progress-overview-panel">
            <div className="panel-title-container">
              <h3>Academic Goal Progress</h3>
            </div>
            <div className="progress-panel-body">
              <div className="progress-circle-wrapper">
                <svg className="progress-svg-circle" width="140" height="140">
                  <circle 
                    className="circle-bg" 
                    cx="70" 
                    cy="70" 
                    r={radius} 
                    strokeWidth="8"
                  />
                  <circle 
                    className="circle-progress" 
                    cx="70" 
                    cy="70" 
                    r={radius} 
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="progress-percentage-label">
                  <span className="percent-num">{completionPercentage}%</span>
                  <span className="percent-lbl">Completed</span>
                </div>
              </div>
              <div className="progress-text-details">
                <h4>Focusing on your targets</h4>
                <p>Academic Goal: <em>"{user?.academicGoals || 'Keep organized and study efficiently!'}"</em></p>
                <div className="progress-bullets">
                  <div className="bullet-row">
                    <span className="bullet bullet-green"></span>
                    <span>Completed {stats.completedTasks} tasks out of {stats.totalTasks} total.</span>
                  </div>
                  <div className="bullet-row">
                    <span className="bullet bullet-indigo"></span>
                    <span>Currently working on {stats.inProgressTasks} assignments.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pomodoro Focus Timer Panel */}
          <div className="glass-panel pomodoro-panel">
            <div className="panel-header-timer">
              <h3>Pomodoro Study Timer</h3>
              <div className="timer-subject-selector">
                <label>Subject: </label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="subject-select-input"
                >
                  <option value="General">General</option>
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Coding">Coding</option>
                </select>
              </div>
            </div>

            <div className="timer-body">
              <div className="timer-modes">
                <button 
                  onClick={() => { setTimerMode('work'); setTimerMinutes(25); setTimerSeconds(0); setTimerActive(false); }}
                  className={`timer-mode-btn ${timerMode === 'work' ? 'active' : ''}`}
                >
                  Study Block (25m)
                </button>
                <button 
                  onClick={() => { setTimerMode('break'); setTimerMinutes(5); setTimerSeconds(0); setTimerActive(false); }}
                  className={`timer-mode-btn ${timerMode === 'break' ? 'active' : ''}`}
                >
                  Short Break (5m)
                </button>
              </div>

              <div className="timer-display">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>

              <div className="timer-controls">
                <button onClick={toggleTimer} className={`btn ${timerActive ? 'btn-secondary' : 'btn-primary'} timer-ctrl-btn`}>
                  {timerActive ? <Pause size={18} /> : <Play size={18} />}
                  <span>{timerActive ? 'Pause' : 'Start'}</span>
                </button>
                <button onClick={resetTimer} className="btn btn-secondary timer-ctrl-btn">
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reminders & Quotes Column */}
        <div className="col-4 dashboard-right-col">
          {/* AI Motivational Quote Box */}
          <div className="glass-panel quote-box">
            <div className="quote-header">
              <span className="quote-badge">AI MOTIVATOR</span>
            </div>
            <blockquote className="quote-text">
              "{quote}"
            </blockquote>
            <span className="quote-author">— StudyFlow AI Coach</span>
          </div>

          {/* Smart Reminders Panel */}
          <div className="glass-panel reminders-panel">
            <div className="panel-title-container">
              <Bell size={18} className="icon-bell" />
              <h3>Urgent Deadlines</h3>
            </div>
            
            <div className="reminders-list">
              {urgentTasks.length === 0 ? (
                <div className="empty-reminders">
                  <span className="check-all-clear">✨</span>
                  <p>All clean! No tasks due in the next 48 hours.</p>
                </div>
              ) : (
                urgentTasks.map(t => {
                  const hoursLeft = Math.round((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60));
                  const isOverdue = hoursLeft < 0;
                  return (
                    <div key={t.id} className={`reminder-item ${hoursLeft <= 24 ? 'deadline-critical' : ''}`} onClick={() => navigateTo('tasks')}>
                      <div className="reminder-alert-icon">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="reminder-info">
                        <span className="reminder-task-title">{t.title}</span>
                        <span className="reminder-task-sub">{t.subject} • {t.priority} priority</span>
                        <span className="reminder-time-alert">
                          {isOverdue ? 'Overdue' : `Due in ${hoursLeft} hours`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stat-card-wrapper {
          min-height: 90px;
        }

        .stat-card-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
          height: 100%;
          border-radius: 16px;
        }

        .stat-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-cyan { background: rgba(6, 182, 212, 0.12); color: var(--accent); }
        .icon-indigo { background: rgba(99, 102, 241, 0.12); color: var(--primary); }
        .icon-purple { background: rgba(139, 92, 246, 0.12); color: var(--secondary); }
        .icon-yellow { background: rgba(245, 158, 11, 0.12); color: var(--warning); }

        .stat-card-details {
          display: flex;
          flex-direction: column;
        }

        .stat-card-num {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-card-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .dashboard-main-row {
          margin-top: 0.5rem;
        }

        .dashboard-left-col, .dashboard-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Progress Overview */
        .progress-overview-panel {
          border-radius: 16px;
        }

        .panel-title-container {
          margin-bottom: 1.25rem;
        }

        .progress-panel-body {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .progress-circle-wrapper {
          position: relative;
          width: 140px;
          height: 140px;
          flex-shrink: 0;
        }

        .progress-svg-circle {
          transform: rotate(-90deg);
        }

        .circle-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.03);
          [data-theme='light'] & {
            stroke: rgba(99, 102, 241, 0.05);
          }
        }

        .circle-progress {
          fill: none;
          stroke: url(#indigoGradient);
          stroke: var(--primary);
          stroke-linecap: round;
          transition: stroke-dashoffset 0.8s ease-in-out;
        }

        .progress-percentage-label {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .percent-num {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .percent-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .progress-text-details h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
        }

        .progress-text-details p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .progress-bullets {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bullet-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bullet-green { background: var(--success); }
        .bullet-indigo { background: var(--primary); }

        /* Pomodoro Panel */
        .panel-header-timer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .timer-subject-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .subject-select-input {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 6px;
          color: var(--text-primary);
          padding: 3px 8px;
          outline: none;
          font-size: 0.8rem;
        }

        .timer-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 0;
        }

        .timer-modes {
          display: flex;
          gap: 0.5rem;
        }

        .timer-mode-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          border: 1px solid var(--input-border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.8rem;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: all 0.2s ease;
        }

        .timer-mode-btn.active {
          background: var(--sidebar-active);
          color: var(--primary);
          border-color: var(--primary);
          font-weight: 500;
        }

        .timer-display {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 4rem;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.02);
          line-height: 1;
        }

        .timer-controls {
          display: flex;
          gap: 0.75rem;
        }

        .timer-ctrl-btn {
          font-size: 0.85rem;
          padding: 0.55rem 1.25rem;
        }

        /* Quotes */
        .quote-box {
          border-left: 4px solid var(--accent);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.04), rgba(99, 102, 241, 0.04));
        }

        .quote-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--accent);
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .quote-text {
          font-style: italic;
          color: var(--text-primary);
          line-height: 1.5;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }

        .quote-author {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Reminders Panel */
        .reminders-panel h3 {
          font-size: 1.1rem;
        }

        .panel-title-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .icon-bell {
          color: var(--warning);
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .reminder-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reminder-item:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .reminder-alert-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 158, 11, 0.12);
          color: var(--warning);
          flex-shrink: 0;
        }

        .reminder-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .reminder-task-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .reminder-task-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 1px 0;
        }

        .reminder-time-alert {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--warning);
        }

        .reminder-item.deadline-critical {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.04);
        }

        .reminder-item.deadline-critical .reminder-alert-icon {
          background: rgba(239, 68, 68, 0.12);
          color: var(--danger);
        }

        .reminder-item.deadline-critical .reminder-time-alert {
          color: var(--danger);
        }

        .empty-reminders {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 0;
          gap: 0.5rem;
        }

        .check-all-clear {
          font-size: 2rem;
        }

        .empty-reminders p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .progress-panel-body {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
