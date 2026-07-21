import React, { useState } from 'react';
import { Sparkles, Loader, ArrowUp, ArrowDown, CheckSquare, Clock } from 'lucide-react';
import { api } from '../utils/api';

const Planner = ({ tasks, refreshTasks }) => {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const generateAIPlan = async () => {
    setLoading(true);
    setNotice('');
    try {
      const response = await api.ai.getSmartPlan();
      setNotice(response.message || 'AI Plan compiled successfully.');
      refreshTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to generate smart scheduling agenda.');
    } finally {
      setLoading(false);
    }
  };

  const moveTaskOrder = async (index, direction) => {
    // Local re-ordering logic syncs to database
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= activeTasks.length) return;

    // Swap positions
    const taskA = activeTasks[index];
    const taskB = activeTasks[targetIndex];

    try {
      await api.tasks.update(taskA.id, { aiPriorityOrder: targetIndex + 1 });
      await api.tasks.update(taskB.id, { aiPriorityOrder: index + 1 });
      refreshTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to reorder plan');
    }
  };

  const getActiveTasks = () => {
    return tasks.filter(t => t.status !== 'completed');
  };

  const activeTasks = getActiveTasks();
  
  // Calculate total study time
  const totalMins = activeTasks.reduce((acc, curr) => acc + curr.estimatedTime, 0);
  const formattedDuration = totalMins > 60 
    ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` 
    : `${totalMins}m`;

  return (
    <div className="planner-container animate-fade-in">
      {/* Overview Card */}
      <div className="glass-panel planner-intro">
        <div className="intro-text">
          <h2>AI Smart Study Planner</h2>
          <p>Let StudyFlow AI analyze your deadlines, priority states, and task complexities to compile your daily study path.</p>
        </div>
        <button 
          onClick={generateAIPlan} 
          disabled={loading} 
          className="btn btn-primary generate-plan-btn"
        >
          {loading ? <Loader className="spinner" size={16} /> : <Sparkles size={16} />}
          <span>{loading ? 'Prioritizing...' : 'Generate AI Study Plan'}</span>
        </button>
      </div>

      {notice && (
        <div className="planner-notice-alert glass-panel">
          <Sparkles size={14} className="notice-icon" />
          <span>{notice}</span>
        </div>
      )}

      {/* Schedule breakdown list */}
      <div className="schedule-layout-row">
        <div className="schedule-list-column">
          {activeTasks.length === 0 ? (
            <div className="empty-schedule-view glass-panel">
              <div className="schedule-empty-icon">✨</div>
              <h3>Schedule is clear!</h3>
              <p>Create active assignments in the "Tasks" page to start organizing your schedule.</p>
            </div>
          ) : (
            <div className="schedule-timeline">
              <div className="timeline-meta-bar">
                <span>Recommended Order of Study</span>
                <span className="timeline-total-time"><Clock size={12} /> Total study: {formattedDuration}</span>
              </div>
              
              <div className="timeline-list">
                {activeTasks.map((t, idx) => (
                  <div key={t.id} className="timeline-node glass-panel">
                    {/* Reordering handles */}
                    <div className="timeline-order-controls">
                      <button 
                        onClick={() => moveTaskOrder(idx, -1)} 
                        disabled={idx === 0}
                        className="order-btn"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <span className="order-number">{idx + 1}</span>
                      <button 
                        onClick={() => moveTaskOrder(idx, 1)} 
                        disabled={idx === activeTasks.length - 1}
                        className="order-btn"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {/* Task Info */}
                    <div className="timeline-node-info">
                      <div className="node-title-row">
                        <h4 className="node-title">{t.title}</h4>
                        <span className="node-subject-pill">{t.subject}</span>
                      </div>
                      {t.description && <p className="node-desc">{t.description}</p>}
                      <div className="node-meta">
                        <span className={`badge badge-${t.priority}`}>{t.priority} priority</span>
                        <span className="node-eta"><Clock size={12} /> {t.estimatedTime} mins estimation</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .planner-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .planner-intro {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem;
          border-radius: 20px;
          gap: 2rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);
        }

        .intro-text h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .intro-text p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .generate-plan-btn {
          font-size: 0.95rem;
          padding: 0.75rem 1.5rem;
          flex-shrink: 0;
        }

        .planner-notice-alert {
          background-color: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: var(--accent);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .notice-icon {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Timeline list styles */
        .schedule-list-column {
          width: 100%;
        }

        .timeline-meta-bar {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          padding: 0 0.5rem;
        }

        .timeline-total-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--accent);
        }

        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }

        .timeline-node {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border-radius: 16px;
          padding: 1.25rem;
        }

        .timeline-order-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--card-border);
          padding: 6px;
          border-radius: 8px;
          width: 36px;
          flex-shrink: 0;
        }

        .order-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .order-btn:hover:not(:disabled) {
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
        }

        .order-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .order-number {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .timeline-node-info {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .node-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .node-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .node-subject-pill {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          color: var(--text-secondary);
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .node-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .node-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .node-eta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .empty-schedule-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4rem 2rem;
          gap: 0.5rem;
        }

        .schedule-empty-icon {
          font-size: 3rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .planner-intro {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Planner;
