import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { api } from '../utils/api';

const Calendar = ({ tasks, refreshTasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month navigation helpers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // HTML5 Drag and Drop events
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dateString) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Find the task to extract the time part
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const originalTime = new Date(task.dueDate);
    const targetDate = new Date(dateString);
    
    // Set hours and minutes to match original task due time
    targetDate.setHours(originalTime.getHours());
    targetDate.setMinutes(originalTime.getMinutes());

    try {
      await api.tasks.update(taskId, { dueDate: targetDate.toISOString() });
      refreshTasks();
    } catch (err) {
      alert(err.message || 'Failed to reschedule task');
    } finally {
      setDraggedTaskId(null);
    }
  };

  // Compile dates for monthly calendar
  const getMonthCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Prior month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const d = new Date(year, month - 1, day);
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: false,
        dateString: d.toISOString().split('T')[0]
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: true,
        dateString: d.toISOString().split('T')[0]
      });
    }

    // Next month overflow days (to fill 42 cells grid)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      cells.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: false,
        dateString: d.toISOString().split('T')[0]
      });
    }

    return cells;
  };

  // Compile dates for weekly calendar
  const getWeekCells = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // roll back to Sunday

    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      cells.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: true,
        dateString: d.toISOString().split('T')[0]
      });
    }
    return cells;
  };

  // Map tasks to dates
  const getTasksForDate = (dateString) => {
    return tasks.filter(t => {
      const taskDateStr = new Date(t.dueDate).toISOString().split('T')[0];
      return taskDateStr === dateString;
    });
  };

  const monthCells = getMonthCells();
  const weekCells = getWeekCells();
  const activeCells = viewMode === 'month' ? monthCells : weekCells;

  return (
    <div className="calendar-container animate-fade-in">
      {/* Calendar Header Panel */}
      <div className="calendar-header glass-panel">
        <div className="calendar-title-nav">
          <h2 className="calendar-month-year">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'week' ? { day: 'numeric' } : {}) 
            })}
          </h2>
          <div className="nav-arrows">
            <button onClick={handlePrev} className="nav-arrow-btn">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNext} className="nav-arrow-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-views-row">
          <button 
            onClick={() => setViewMode('month')} 
            className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
          >
            Month View
          </button>
          <button 
            onClick={() => setViewMode('week')} 
            className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
          >
            Week View
          </button>
        </div>
      </div>

      {/* Weekdays indicator bar */}
      <div className="weekdays-bar">
        {weekdays.map(d => <span key={d} className="weekday-label">{d}</span>)}
      </div>

      {/* Calendar Grid cells */}
      <div className={`calendar-grid grid-view-${viewMode}`}>
        {activeCells.map((cell, idx) => {
          const dayTasks = getTasksForDate(cell.dateString);
          const isToday = new Date().toISOString().split('T')[0] === cell.dateString;
          
          return (
            <div
              key={idx}
              className={`calendar-cell ${!cell.isCurrentMonth ? 'inactive-cell' : ''} ${isToday ? 'today-cell' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, cell.dateString)}
            >
              <span className="cell-day-num">{cell.dayNumber}</span>
              
              <div className="cell-tasks-container">
                {dayTasks.map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    className={`calendar-task-card p-${t.priority} status-${t.status}`}
                    title={`${t.title} (${t.subject})`}
                  >
                    <span className="task-bullet"></span>
                    <span className="task-title-text">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-instructions glass-panel">
        <p>💡 <strong>Smart Re-scheduling:</strong> Drag and drop any task between calendar days to instantly reschedule its due date.</p>
      </div>

      <style>{`
        .calendar-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-radius: 16px;
        }

        .calendar-title-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .calendar-month-year {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .nav-arrows {
          display: flex;
          gap: 0.25rem;
        }

        .nav-arrow-btn {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          color: var(--text-secondary);
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-arrow-btn:hover {
          color: var(--text-primary);
          border-color: var(--primary);
        }

        .calendar-views-row {
          display: flex;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 2px;
        }

        .view-toggle-btn {
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

        .view-toggle-btn.active {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .weekdays-bar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          padding: 0.5rem 0;
          background: rgba(255,255,255,0.01);
          border-radius: 8px;
          border-bottom: 1px solid var(--card-border);
        }

        .weekday-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--card-border);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }

        .grid-view-month {
          grid-template-rows: repeat(6, minmax(100px, 1fr));
        }

        .grid-view-week {
          grid-template-rows: minmax(200px, 1fr);
        }

        .calendar-cell {
          background: var(--bg-secondary);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 0;
          position: relative;
          transition: all 0.2s ease;
        }

        .calendar-cell:hover {
          background: rgba(255,255,255,0.02);
        }

        .inactive-cell {
          opacity: 0.35;
        }

        .today-cell {
          background: rgba(99, 102, 241, 0.04);
        }

        .today-cell .cell-day-num {
          background: var(--primary);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .cell-day-num {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .cell-tasks-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          flex: 1;
        }

        .calendar-task-card {
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          cursor: grab;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid transparent;
          transition: transform 0.15s ease;
        }

        .calendar-task-card:active {
          cursor: grabbing;
          transform: scale(0.98);
        }

        .calendar-task-card.p-high {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.15);
        }
        
        .calendar-task-card.p-medium {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.15);
        }

        .calendar-task-card.p-low {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.15);
        }

        .calendar-task-card.status-completed {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .task-bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .task-title-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .calendar-instructions {
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .grid-view-month {
            grid-template-rows: repeat(6, minmax(70px, 1fr));
          }
          .calendar-task-card {
            padding: 2px 4px;
          }
          .task-title-text {
            display: none;
          }
          .task-bullet {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
