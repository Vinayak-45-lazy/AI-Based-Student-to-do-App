import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  FileDown, 
  Calendar as CalendarIcon, 
  Tag, 
  BookOpen, 
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import Modal from '../components/Modal';

const Tasks = ({ tasks, refreshTasks, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedTime, setEstimatedTime] = useState(45);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('pending');

  // Filter States
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const subjectsList = ['General', 'Math', 'Science', 'History', 'Chemistry', 'Biology', 'Coding', 'English', 'Physics'];

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSubject('General');
    setPriority('medium');
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    setDueTime('17:00');
    
    setEstimatedTime(45);
    setTags('');
    setStatus('pending');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubject(task.subject);
    setPriority(task.priority);
    
    const taskDateObj = new Date(task.dueDate);
    setDueDate(taskDateObj.toISOString().split('T')[0]);
    
    const hours = String(taskDateObj.getHours()).padStart(2, '0');
    const minutes = String(taskDateObj.getMinutes()).padStart(2, '0');
    setDueTime(`${hours}:${minutes}`);
    
    setEstimatedTime(task.estimatedTime);
    setTags(task.tags || '');
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const taskDateTime = new Date(`${dueDate}T${dueTime}`);
    const taskData = {
      title,
      description,
      subject,
      priority,
      dueDate: taskDateTime.toISOString(),
      estimatedTime: parseInt(estimatedTime),
      tags,
      status
    };

    try {
      if (editingTask) {
        await api.tasks.update(editingTask.id, taskData);
      } else {
        await api.tasks.create(taskData);
      }
      setIsModalOpen(false);
      refreshTasks();
    } catch (err) {
      alert(err.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.tasks.delete(id);
        refreshTasks();
      } catch (err) {
        alert(err.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusToggle = async (task, e) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.tasks.update(task.id, { status: newStatus });
      refreshTasks();
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  // Compile PDF Export printable page layout
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const filteredList = getFilteredTasks();

    const tasksHtml = filteredList.map((t, idx) => `
      <tr class="print-row">
        <td>${idx + 1}</td>
        <td><strong>${t.title}</strong><div style="font-size: 0.8rem; color: #555;">${t.description || ''}</div></td>
        <td>${t.subject}</td>
        <td><span class="print-priority p-${t.priority}">${t.priority}</span></td>
        <td>${new Date(t.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })} at ${new Date(t.dueDate).toLocaleTimeString('en-US', { timeStyle: 'short' })}</td>
        <td>${t.estimatedTime} mins</td>
        <td><span class="print-status s-${t.status}">${t.status.replace('_', ' ')}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>StudyFlow AI Study Plan</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; padding: 2rem; }
            .header-banner { border-bottom: 2px solid #6366F1; padding-bottom: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
            h1 { color: #6366F1; margin: 0; font-size: 1.8rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 0.9rem; }
            th { background-color: #f3f4f6; color: #374151; font-weight: bold; }
            .print-priority { font-weight: bold; text-transform: uppercase; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; }
            .p-high { background-color: #fee2e2; color: #ef4444; }
            .p-medium { background-color: #fef3c7; color: #d97706; }
            .p-low { background-color: #d1fae5; color: #059669; }
            .print-status { text-transform: capitalize; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; }
            .s-completed { background-color: #d1fae5; color: #059669; text-decoration: line-through; }
            .s-pending { background-color: #f3f4f6; color: #374151; }
            .s-in_progress { background-color: #dbeafe; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <h1>StudyFlow AI - Tasks Agenda</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold; color: #6366F1;">Academic Schedule</p>
              <p style="margin: 3px 0 0 0; font-size: 0.85rem; color: #666;">Total Tasks Listed: ${filteredList.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Task Details</th>
                <th style="width: 12%;">Subject</th>
                <th style="width: 10%;">Priority</th>
                <th style="width: 20%;">Due Date</th>
                <th style="width: 10%;">Est. Time</th>
                <th style="width: 8%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tasksHtml || '<tr><td colspan="7" style="text-align: center;">No active tasks found in this view.</td></tr>'}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compile matching tasks list
  const getFilteredTasks = () => {
    return tasks.filter(t => {
      // Search match
      const textMatch = searchTerm 
        ? (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())))
        : true;
      
      // Subject filter match
      const subMatch = filterSubject === 'All' ? true : t.subject === filterSubject;
      
      // Priority filter match
      const prioMatch = filterPriority === 'All' ? true : t.priority === filterPriority.toLowerCase();

      // Status filter match
      const statusMatch = filterStatus === 'All' 
        ? true 
        : filterStatus === 'Completed' 
          ? t.status === 'completed'
          : filterStatus === 'In Progress' 
            ? t.status === 'in_progress'
            : t.status === 'pending';

      return textMatch && subMatch && prioMatch && statusMatch;
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="tasks-container animate-fade-in">
      {/* Controls panel */}
      <div className="tasks-controls glass-panel">
        {/* Filters Selectors */}
        <div className="filters-row">
          <div className="filter-item">
            <label className="filter-lbl">Subject</label>
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="subject-select-input"
            >
              <option value="All">All Subjects</option>
              {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-lbl">Priority</label>
            <div className="tab-pill-container">
              {['All', 'High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`tab-pill-btn ${filterPriority === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-item">
            <label className="filter-lbl">Status</label>
            <div className="tab-pill-container">
              {['All', 'Pending', 'In Progress', 'Completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`tab-pill-btn ${filterStatus === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="action-buttons-row">
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Assignment</span>
          </button>
          
          <button onClick={handleExportPDF} className="btn btn-secondary" title="Export schedule to PDF">
            <FileDown size={16} />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* Grid of Tasks */}
      <div className="tasks-list-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-view glass-panel">
            <div className="empty-icon">📂</div>
            <h3>No assignments found</h3>
            <p>Try clearing filters or add a new task using the voice micro button or "+ Add Assignment".</p>
          </div>
        ) : (
          filteredTasks.map(t => (
            <div 
              key={t.id} 
              className={`task-card glass-panel status-${t.status}`}
              onClick={() => openEditModal(t)}
            >
              <div className="task-card-header">
                <button 
                  onClick={(e) => handleStatusToggle(t, e)}
                  className={`task-checkbox-btn ${t.status === 'completed' ? 'checked' : ''}`}
                  title="Toggle status"
                >
                  {t.status === 'completed' ? '✓' : ''}
                </button>
                <h4 className="task-card-title">{t.title}</h4>
                <button 
                  onClick={(e) => handleDelete(t.id, e)}
                  className="task-delete-btn"
                  title="Delete assignment"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {t.description && <p className="task-card-desc">{t.description}</p>}

              <div className="task-card-footer">
                <div className="footer-left-meta">
                  <span className="task-meta-pill text-glow-primary">
                    <BookOpen size={10} />
                    <span>{t.subject}</span>
                  </span>
                  
                  <span className={`badge badge-${t.priority}`}>
                    {t.priority}
                  </span>
                </div>

                <div className="footer-right-meta">
                  <span className="task-meta-date" title="Due Date">
                    <CalendarIcon size={12} />
                    <span>
                      {new Date(t.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </span>

                  <span className="task-meta-time" title="Estimated study time">
                    <Clock size={12} />
                    <span>{t.estimatedTime}m</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Creation/Editing Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Assignment' : 'Create Assignment'}
      >
        <form onSubmit={handleFormSubmit} className="task-modal-form">
          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Write Literature Essay"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              placeholder="Add details, links or specific notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input textarea-input"
              rows="3"
            />
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Subject / Course</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
              >
                {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="form-input"
              >
                <option value="high">🔥 High</option>
                <option value="medium">⚡ Medium</option>
                <option value="low">🌱 Low</option>
              </select>
            </div>
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label">Est. Time (minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <div className="input-with-icon">
              <Tag size={14} className="input-icon" />
              <input
                type="text"
                placeholder="homework, essay, exam-prep"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2rem' }}
              />
            </div>
          </div>

          <div className="modal-actions-row">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .tasks-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tasks-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border-radius: 16px;
        }

        .filters-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-lbl {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .tab-pill-container {
          display: flex;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 2px;
        }

        .tab-pill-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: all 0.2s ease;
        }

        .tab-pill-btn.active {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .action-buttons-row {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        /* Tasks Grid */
        .tasks-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .task-card {
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
        }

        .task-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--primary);
        }

        .task-card.status-in_progress::before {
          background: var(--accent);
        }

        .task-card.status-completed::before {
          background: var(--success);
        }

        .task-card-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.5rem;
        }

        .task-checkbox-btn {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid var(--input-border);
          background: transparent;
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .task-checkbox-btn.checked {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--success);
        }

        .task-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-card.status-completed .task-card-title {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .task-delete-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.08);
        }

        .task-card-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--card-border);
          padding-top: 0.75rem;
          margin-top: auto;
        }

        .footer-left-meta, .footer-right-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .task-meta-pill {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .task-meta-date, .task-meta-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Empty tasks card */
        .empty-tasks-view {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4rem 2rem;
          gap: 0.5rem;
        }

        .empty-icon {
          font-size: 3rem;
        }

        /* Modal Forms Layout */
        .task-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .textarea-input {
          resize: none;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid var(--card-border);
          padding-top: 1.25rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
          .form-row-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .filters-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Tasks;
