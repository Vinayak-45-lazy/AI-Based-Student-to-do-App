import React from 'react';
import { Sparkles, Calendar, FileText, CheckCircle2, Mic, Clock, BarChart2 } from 'lucide-react';

const Landing = ({ onNavigateToAuth }) => {
  return (
    <div className="landing-container animate-fade-in">
      {/* Background Neon Blobs */}
      <div className="gradient-bg-blob blob-indigo"></div>
      <div className="gradient-bg-blob blob-cyan"></div>

      {/* Navbar */}
      <header className="landing-nav glass-panel">
        <div className="nav-logo">
          <span>✨ StudyFlow <span className="logo-accent">AI</span></span>
        </div>
        <div className="nav-buttons">
          <button onClick={() => onNavigateToAuth('login')} className="btn btn-secondary nav-btn">Sign In</button>
          <button onClick={() => onNavigateToAuth('register')} className="btn btn-primary nav-btn">Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tag glass-panel">
            <Sparkles size={14} className="tag-icon" />
            <span>AI-Powered Student Planner</span>
          </div>
          <h1 className="hero-title">
            Streamline Your Studies. <br />
            <span className="gradient-text">Crush Your Goals.</span>
          </h1>
          <p className="hero-description">
            StudyFlow AI automatically organizes your assignments, suggests optimal revision schedules, and answers academic questions using machine learning.
          </p>
          <div className="hero-actions">
            <button onClick={() => onNavigateToAuth('register')} className="btn btn-primary hero-btn">
              Get Started for Free
            </button>
            <button onClick={() => onNavigateToAuth('login')} className="btn btn-secondary hero-btn">
              Explore Demo Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard Preview Widget */}
        <div className="hero-preview glass-panel">
          <div className="preview-header">
            <div className="preview-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="preview-title">StudyFlow AI Dashboard</div>
          </div>
          <div className="preview-body">
            <div className="preview-stats-row">
              <div className="stat-card glass-panel">
                <span className="stat-num text-glow-accent">87%</span>
                <span className="stat-label">Productivity</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-num text-glow-primary">12.5 hrs</span>
                <span className="stat-label">Focus Earned</span>
              </div>
            </div>
            <div className="preview-checklist">
              <div className="checklist-title">Today's Smart Schedule</div>
              <div className="checklist-item checked">
                <div className="checkbox">✓</div>
                <span>Solve Physics Worksheet 3</span>
                <span className="preview-badge priority-high">High</span>
              </div>
              <div className="checklist-item">
                <div className="checkbox"></div>
                <span>Draft Chemistry lab introduction</span>
                <span className="preview-badge priority-medium">Medium</span>
              </div>
              <div className="checklist-item">
                <div className="checkbox"></div>
                <span>Outline Biology essay Chapter 5</span>
                <span className="preview-badge priority-low">Low</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title">Everything a student needs, in one workspace</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <Sparkles className="feature-icon text-glow-primary" />
            <h3>AI Smart Scheduler</h3>
            <p>Our algorithm ranks your active homework by urgency and duration to output the perfect hourly study guide.</p>
          </div>
          <div className="feature-card glass-panel">
            <Mic className="feature-icon text-glow-accent" />
            <h3>Voice Task Creator</h3>
            <p>Just talk! dictation inputs automatically parse course subjects, deadlines, and priorities instantly.</p>
          </div>
          <div className="feature-card glass-panel">
            <Clock className="feature-icon" />
            <h3>Focus Timers</h3>
            <p>Built-in customizable Pomodoro and stopwatch trackers log study duration directly to study statistics.</p>
          </div>
          <div className="feature-card glass-panel">
            <Calendar className="feature-icon" />
            <h3>Interactive Calendar</h3>
            <p>Drag and drop tasks between dates to dynamically reschedule, with clear visual priority categories.</p>
          </div>
          <div className="feature-card glass-panel">
            <FileText className="feature-icon" />
            <h3>Connected Notes</h3>
            <p>Take lectures and revision summaries in a rich editor linked directly to specific task cards.</p>
          </div>
          <div className="feature-card glass-panel">
            <BarChart2 className="feature-icon" />
            <h3>Analytics Dashboard</h3>
            <p>View completion trends and tracking ratios across courses with responsive charts.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 StudyFlow AI. Designed for students, powered by intelligence.</p>
      </footer>

      <style>{`
        .landing-container {
          min-height: 100vh;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-radius: 20px;
          margin-bottom: 4rem;
        }

        .nav-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.3rem;
          color: var(--text-primary);
        }

        .nav-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .nav-btn {
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
        }

        /* Hero */
        .hero-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: center;
          margin-bottom: 6rem;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(6, 182, 212, 0.2);
        }

        .tag-icon {
          color: var(--accent);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary) 50%, var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-btn {
          padding: 0.85rem 1.75rem;
          font-size: 1rem;
        }

        /* Hero Preview Dashboard */
        .hero-preview {
          padding: 0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        }

        .preview-header {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--card-border);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .preview-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }

        .preview-title {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .preview-body {
          padding: 1.5rem;
        }

        .preview-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .preview-stats-row .stat-card {
          padding: 1rem;
          text-align: center;
          border-radius: 12px;
        }

        .stat-num {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-display);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .preview-checklist {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid var(--card-border);
        }

        .checklist-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
        }

        .checklist-item.checked {
          background: rgba(16, 185, 129, 0.05);
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid var(--input-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .checklist-item.checked .checkbox {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .preview-badge {
          margin-left: auto;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .priority-high { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
        .priority-medium { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .priority-low { background: rgba(16, 185, 129, 0.15); color: var(--success); }

        /* Features Section */
        .features-section {
          margin-bottom: 6rem;
        }

        .section-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 3rem;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .feature-card {
          border-radius: 16px;
          padding: 2rem;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .feature-card p {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .landing-footer {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid var(--card-border);
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          .hero-content {
            align-items: center;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .landing-nav {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
