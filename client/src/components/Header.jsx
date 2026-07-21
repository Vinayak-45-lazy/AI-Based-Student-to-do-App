import React from 'react';
import { Search, Mic, User as UserIcon, Sparkles } from 'lucide-react';

const Header = ({ title, searchTerm, setSearchTerm, user, onVoiceClick }) => {
  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {title === 'Dashboard' && (
          <div className="header-subtitle">
            Welcome back, <span className="student-name">{user?.name || 'Student'}</span>! ✨
          </div>
        )}
      </div>

      <div className="header-right">
        {/* Global Search Bar */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Voice Input Trigger Button */}
        <button 
          onClick={onVoiceClick} 
          className="voice-btn-trigger" 
          title="Create task with your voice"
        >
          <Mic size={18} />
          <span className="voice-btn-text">Voice Task</span>
        </button>

        {/* User profile widget */}
        <div className="user-profile-badge">
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-info-text">
            <span className="user-name-span">{user?.name || 'Student'}</span>
            <span className="user-role-span">Premium Plan</span>
          </div>
        </div>
      </div>

      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          border-radius: 16px;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .header-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .student-name {
          color: var(--primary);
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .search-input {
          padding: 0.55rem 1rem 0.55rem 2.2rem;
          font-size: 0.85rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 10px;
          color: var(--text-primary);
          outline: none;
          width: 220px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          width: 280px;
          border-color: var(--primary);
        }

        .voice-btn-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15));
          color: var(--accent);
          border: 1px solid rgba(6, 182, 212, 0.3);
          padding: 0.55rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .voice-btn-trigger:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(99, 102, 241, 0.25));
          border-color: var(--accent);
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding-left: 0.75rem;
          border-left: 1px solid var(--card-border);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 10px var(--primary-glow);
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
        }

        .user-name-span {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-role-span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .search-input {
            width: 150px;
          }
          .search-input:focus {
            width: 180px;
          }
        }

        @media (max-width: 768px) {
          .app-header {
            margin-bottom: 1.5rem;
          }
          .search-wrapper, .user-info-text, .voice-btn-text {
            display: none;
          }
          .user-profile-badge {
            border: none;
            padding-left: 0;
          }
          .voice-btn-trigger {
            padding: 0.55rem;
            border-radius: 50%;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
