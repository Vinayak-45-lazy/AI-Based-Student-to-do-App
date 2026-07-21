import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Sparkles, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  FileText, 
  BarChart3, 
  User, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, user, theme, toggleTheme, handleLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'AI Planner', icon: Sparkles },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="logo-container">
          <div className="logo-icon">✨</div>
          <span className="logo-text">StudyFlow <span className="logo-accent">AI</span></span>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? (
              <>
                <Sun size={16} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={16} />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav glass-panel">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
        {/* Additional menu button for the rest */}
        <button
          onClick={() => setCurrentPage('profile')}
          className={`mobile-nav-link ${['notes', 'analytics', 'profile'].includes(currentPage) ? 'active' : ''}`}
        >
          <User size={20} />
          <span className="mobile-nav-label">Profile</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 20px;
          left: 20px;
          bottom: 20px;
          width: 240px;
          display: flex;
          flex-direction: column;
          z-index: 100;
          padding: 1.5rem;
          border-radius: 20px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding-left: 0.5rem;
        }

        .logo-icon {
          font-size: 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .logo-accent {
          color: var(--accent);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 12px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          text-align: left;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        .nav-link.active {
          color: var(--primary);
          background: var(--sidebar-active);
          font-weight: 500;
          border-left: 3px solid var(--primary);
          padding-left: calc(1rem - 3px);
        }

        [data-theme='light'] .nav-link.active {
          color: var(--primary);
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        .theme-toggle-btn, .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          text-align: left;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover, .logout-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 12px;
            left: 12px;
            right: 12px;
            height: 64px;
            z-index: 100;
            padding: 0 0.5rem;
            align-items: center;
            justify-content: space-around;
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          }

          .mobile-nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            flex: 1;
            padding: 0.5rem 0;
            gap: 2px;
            transition: all 0.2s ease;
          }

          .mobile-nav-link.active {
            color: var(--primary);
            transform: translateY(-2px);
          }

          .mobile-nav-label {
            font-size: 0.65rem;
            font-family: var(--font-sans);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
