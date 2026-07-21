import React, { useState } from 'react';
import { User, Shield, Key, Download, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

const Profile = ({ user, theme, toggleTheme, onUserUpdate }) => {
  const [name, setName] = useState(user?.name || '');
  const [academicGoals, setAcademicGoals] = useState(user?.academicGoals || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  
  const [status, setStatus] = useState(''); // 'saving' | 'saved' | ''

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('saving');

    try {
      const updatedUser = await api.profile.update({
        name,
        academicGoals,
        notificationsEnabled
      });
      
      onUserUpdate(updatedUser);
      setStatus('saved');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleExportWorkspace = () => {
    // Export data to json file
    const tasks = localStorage.getItem('studyflow_tasks') || '[]';
    const notes = localStorage.getItem('studyflow_notes') || '[]';
    const sessions = localStorage.getItem('studyflow_sessions') || '[]';
    
    const exportData = {
      profile: user,
      tasks: JSON.parse(tasks),
      notes: JSON.parse(notes),
      sessions: JSON.parse(sessions),
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `studyflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (confirm('🚨 Warning: This will clear all local storage data, tasks, notes, and study sessions, and log you out. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="dashboard-grid">
        
        {/* Left Column: Academic goal configs */}
        <div className="col-8">
          <form onSubmit={handleSave} className="glass-panel profile-settings-card">
            <div className="card-header-icon-title">
              <User size={20} className="header-icon" />
              <h3>Academic Profile & Goals</h3>
            </div>
            
            <div className="profile-form-body">
              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Academic Targets / Goals Statement</label>
                <textarea
                  rows="4"
                  value={academicGoals}
                  onChange={(e) => setAcademicGoals(e.target.value)}
                  placeholder="e.g. Graduate with Honors, submit calculus assignments on time, maintain study routine."
                  className="form-input goals-textarea"
                />
              </div>

              <div className="form-group notification-checkbox-row">
                <input
                  type="checkbox"
                  id="notif-toggle"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="notif-check-box"
                />
                <label htmlFor="notif-toggle" className="notif-check-lbl">
                  Enable smart reminders (upcoming deadline dashboard warnings)
                </label>
              </div>

              <div className="form-submit-row">
                {status === 'saving' && <span className="save-status-txt">Saving preferences...</span>}
                {status === 'saved' && <span className="save-status-txt success"><CheckCircle size={12} /> Saved</span>}
                {status === 'error' && <span className="save-status-txt error"><AlertTriangle size={12} /> Save error</span>}

                <button type="submit" className="btn btn-primary">
                  Save Preferences
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Theme & Backup configurations */}
        <div className="col-4">
          <div className="glass-panel settings-sidebar-card">
            <div className="card-header-icon-title">
              <Shield size={18} className="header-icon" />
              <h3>App Settings</h3>
            </div>

            <div className="settings-sidebar-body">
              {/* Theme Settings toggle block */}
              <div className="setting-block">
                <span className="block-title">Visual Layout Theme</span>
                <p className="block-desc">Adjust the visual style of your workspace dashboard</p>
                <button onClick={toggleTheme} className="btn btn-secondary theme-toggle-wide-btn">
                  <span>Current Theme: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong></span>
                </button>
              </div>

              {/* Data backups */}
              <div className="setting-block">
                <span className="block-title">Workspace Backups</span>
                <p className="block-desc">Download a JSON copy of all tasks, sessions, and notes</p>
                <button onClick={handleExportWorkspace} className="btn btn-secondary w-full-btn">
                  <Download size={14} />
                  <span>Download Backup</span>
                </button>
              </div>

              {/* Reset Utilities */}
              <div className="setting-block reset-block">
                <span className="block-title warning-text">Clear Cache & Settings</span>
                <p className="block-desc">Permanently wipe database details and start fresh</p>
                <button onClick={handleResetData} className="btn btn-secondary warning-border-btn w-full-btn">
                  <RefreshCw size={14} />
                  <span>Reset Local Storage</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .profile-container {
          display: flex;
          flex-direction: column;
        }

        .profile-settings-card, .settings-sidebar-card {
          border-radius: 20px;
        }

        .card-header-icon-title {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--card-border);
        }

        .header-icon {
          color: var(--primary);
        }

        .card-header-icon-title h3 {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .profile-form-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .goals-textarea {
          resize: none;
        }

        .notification-checkbox-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }

        .notif-check-box {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        .notif-check-lbl {
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .form-submit-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid var(--card-border);
          padding-top: 1.25rem;
        }

        .save-status-txt {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .save-status-txt.success { color: var(--success); }
        .save-status-txt.error { color: var(--danger); }

        /* Settings Sidebar */
        .settings-sidebar-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .setting-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .block-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .block-title.warning-text {
          color: var(--danger);
        }

        .block-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .theme-toggle-wide-btn, .w-full-btn {
          width: 100%;
          justify-content: center;
          font-size: 0.8rem;
          padding: 0.6rem;
        }

        .warning-border-btn {
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .warning-border-btn:hover {
          background: rgba(239, 68, 68, 0.05);
          border-color: var(--danger);
        }
      `}</style>
    </div>
  );
};

export default Profile;
