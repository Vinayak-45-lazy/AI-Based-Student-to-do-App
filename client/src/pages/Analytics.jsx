import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';
import { api } from '../utils/api';

const Analytics = ({ tasks }) => {
  const [statsSummary, setStatsSummary] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    productivityScore: 80,
    totalStudyHours: 0
  });

  const [subjectBreakdown, setSubjectBreakdown] = useState([]);
  const [studyHoursTrend, setStudyHoursTrend] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [tasks]);

  const fetchAnalyticsData = async () => {
    try {
      const result = await api.analytics.getStats();
      setStatsSummary(result.summary);
      setSubjectBreakdown(result.subjectBreakdown);
      setStudyHoursTrend(result.studyHoursTrend);
    } catch (e) {
      console.error('Failed to load analytics', e);
    }
  };

  // --- SVG Chart Calculations ---
  
  // 1. Weekly Study Hours Bar Chart (last 7 days)
  const maxHoursVal = Math.max(...studyHoursTrend.map(d => d.hours), 4); // minimum ceiling of 4 hours
  const barChartHeight = 160;
  const barChartWidth = 460;
  const paddingX = 40;
  const paddingY = 20;
  
  const graphHeight = barChartHeight - 2 * paddingY;
  const graphWidth = barChartWidth - 2 * paddingX;
  const stepX = studyHoursTrend.length > 1 ? graphWidth / (studyHoursTrend.length - 1) : graphWidth;

  // 2. Subject Share Donut Chart
  const totalSubjectTasks = subjectBreakdown.reduce((acc, curr) => acc + curr.total, 0);
  const donutRadius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * donutRadius;
  
  // Color palette for subjects
  const subjectColors = {
    Math: '#6366F1',      // Indigo
    Science: '#06B6D4',   // Cyan
    History: '#8B5CF6',   // Purple
    Coding: '#10B981',    // Success Green
    Chemistry: '#F59E0B', // Warning Yellow
    Biology: '#EC4899',   // Pink
    Physics: '#3B82F6',   // Blue
    General: '#6B7280',   // Gray
    English: '#F43F5E'    // Rose
  };
  const fallbackColor = '#6B7280';

  let accumulatedAngle = 0;
  const donutSlices = subjectBreakdown.map((item) => {
    const share = item.total / (totalSubjectTasks || 1);
    const strokeDashoffset = circumference - share * circumference;
    const rotation = accumulatedAngle;
    accumulatedAngle += share * 360;

    return {
      subject: item.subject,
      total: item.total,
      percentage: Math.round(share * 100),
      color: subjectColors[item.subject] || fallbackColor,
      strokeDashoffset,
      rotation
    };
  });

  return (
    <div className="analytics-container animate-fade-in">
      {/* Productivity Ribbon */}
      <div className="dashboard-grid">
        <div className="col-4">
          <div className="glass-panel summary-metric-card">
            <TrendingUp size={24} className="metric-icon color-primary" />
            <div className="metric-info">
              <h3>{statsSummary.productivityScore}%</h3>
              <p>Weekly Productivity Index</p>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="glass-panel summary-metric-card">
            <Clock size={24} className="metric-icon color-accent" />
            <div className="metric-info">
              <h3>{statsSummary.totalStudyHours} hrs</h3>
              <p>Total Focus Session Hours</p>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="glass-panel summary-metric-card">
            <CheckCircle2 size={24} className="metric-icon color-success" />
            <div className="metric-info">
              <h3>{statsSummary.completedTasks} / {statsSummary.totalTasks}</h3>
              <p>Assignments Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Layout */}
      <div className="dashboard-grid charts-row">
        {/* Weekly Study hours bar */}
        <div className="col-8">
          <div className="glass-panel chart-box">
            <h3>Study Hours Trend (Last 7 Days)</h3>
            <p className="chart-subtitle">Focus tracking registered via Pomodoro stopwatch sessions</p>

            <div className="svg-container">
              <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} width="100%" height="100%">
                {/* Gridlines */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = paddingY + graphHeight * (1 - ratio);
                  return (
                    <g key={idx}>
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={barChartWidth - paddingX} 
                        y2={y} 
                        stroke="var(--card-border)" 
                        strokeWidth="1" 
                        strokeDasharray="4,4"
                      />
                      <text 
                        x={paddingX - 10} 
                        y={y + 4} 
                        textAnchor="end" 
                        fontSize="9" 
                        fill="var(--text-muted)"
                      >
                        {parseFloat((maxHoursVal * ratio).toFixed(1))}h
                      </text>
                    </g>
                  );
                })}

                {/* Bars or Lines */}
                {studyHoursTrend.map((d, idx) => {
                  const x = paddingX + idx * stepX;
                  const ratio = d.hours / (maxHoursVal || 1);
                  const barH = graphHeight * ratio;
                  const y = paddingY + graphHeight - barH;
                  
                  return (
                    <g key={idx} className="bar-group">
                      {/* Bar Glow */}
                      <rect 
                        x={x - 10} 
                        y={y} 
                        width="20" 
                        height={barH} 
                        rx="4" 
                        fill="var(--primary)" 
                        opacity="0.15" 
                      />
                      {/* Bar Solid */}
                      <rect 
                        x={x - 10} 
                        y={y} 
                        width="20" 
                        height={barH} 
                        rx="4" 
                        fill="url(#barGradient)" 
                        className="interactive-bar"
                      />
                      {/* Hours Label on hover */}
                      <text 
                        x={x} 
                        y={y - 6} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fontWeight="600"
                        fill="var(--accent)"
                        className="bar-value-label"
                      >
                        {d.hours}h
                      </text>
                      {/* Day Label */}
                      <text 
                        x={x} 
                        y={barChartHeight - 4} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="var(--text-secondary)"
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}

                {/* SVG Gradients */}
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--primary)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Subject Share Donut Chart */}
        <div className="col-4">
          <div className="glass-panel chart-box">
            <h3>Course Load Share</h3>
            <p className="chart-subtitle">Distribution of assignments across subjects</p>

            <div className="donut-chart-wrapper">
              {totalSubjectTasks === 0 ? (
                <div className="empty-donut-state">
                  <span>📊</span>
                  <p>Add assignments to visualize course load share.</p>
                </div>
              ) : (
                <>
                  <div className="svg-donut-container">
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                      {donutSlices.map((slice, idx) => (
                        <circle
                          key={idx}
                          cx="60"
                          cy="60"
                          r={donutRadius}
                          fill="none"
                          stroke={slice.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={slice.strokeDashoffset}
                          transform={`rotate(${slice.rotation - 90} 60 60)`}
                          strokeLinecap={donutSlices.length > 1 ? 'butt' : 'round'}
                          className="donut-slice-interactive"
                        />
                      ))}
                    </svg>
                    <div className="donut-center-label">
                      <span className="donut-center-num">{totalSubjectTasks}</span>
                      <span className="donut-center-lbl">Tasks</span>
                    </div>
                  </div>
                  
                  {/* Legend list */}
                  <div className="donut-legend">
                    {donutSlices.map((slice, idx) => (
                      <div key={idx} className="legend-row-item">
                        <span className="legend-indicator" style={{ backgroundColor: slice.color }}></span>
                        <span className="legend-subject-label">{slice.subject}</span>
                        <span className="legend-percent">{slice.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Grid lists */}
      <div className="dashboard-grid performance-subject-grid">
        <div className="col-12">
          <div className="glass-panel perf-breakdown-card">
            <h3>Subject Performance Metrics</h3>
            <div className="subject-progress-grid">
              {subjectBreakdown.length === 0 ? (
                <p className="empty-perf-msg">No subject logs logged yet. Create assignments to populate statistics.</p>
              ) : (
                subjectBreakdown.map((sub, idx) => (
                  <div key={idx} className="subject-progress-row">
                    <div className="row-meta">
                      <span className="sub-title"><BookOpen size={12} className="inline-icon" /> {sub.subject}</span>
                      <span className="sub-rates">{sub.completed} / {sub.total} completed ({sub.completionRate}%)</span>
                    </div>
                    <div className="row-bar-wrapper">
                      <div 
                        className="row-bar-fill" 
                        style={{ 
                          width: `${sub.completionRate}%`,
                          background: `linear-gradient(90deg, var(--primary), ${subjectColors[sub.subject] || 'var(--accent)'})`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-metric-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border-radius: 16px;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          padding: 10px;
          flex-shrink: 0;
        }
        .color-primary { background: rgba(99,102,241,0.12); color: var(--primary); }
        .color-accent { background: rgba(6,182,212,0.12); color: var(--accent); }
        .color-success { background: rgba(16,185,129,0.12); color: var(--success); }

        .metric-info h3 {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .metric-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .charts-row {
          margin-top: 0.5rem;
        }

        .chart-box {
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-height: 250px;
        }

        .chart-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .svg-container {
          width: 100%;
          height: 170px;
        }

        .interactive-bar {
          cursor: pointer;
          transition: fill-opacity 0.2s ease, height 0.3s ease, y 0.3s ease;
        }

        .bar-group:hover .interactive-bar {
          fill-opacity: 0.85;
        }

        .bar-value-label {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .bar-group:hover .bar-value-label {
          opacity: 1;
        }

        /* Donut Chart */
        .donut-chart-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .svg-donut-container {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .donut-slice-interactive {
          transition: stroke-width 0.2s ease;
        }

        .donut-slice-interactive:hover {
          stroke-width: 15;
          cursor: pointer;
        }

        .donut-center-label {
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

        .donut-center-num {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .donut-center-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .legend-row-item {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .legend-indicator {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }

        .legend-subject-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .legend-percent {
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .empty-donut-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 0;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        /* Performance breakdowns */
        .perf-breakdown-card {
          border-radius: 20px;
        }

        .perf-breakdown-card h3 {
          margin-bottom: 1.5rem;
        }

        .subject-progress-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .subject-progress-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .row-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .sub-title {
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .inline-icon {
          color: var(--primary);
        }

        .sub-rates {
          color: var(--text-secondary);
        }

        .row-bar-wrapper {
          height: 6px;
          background: rgba(255,255,255,0.03);
          border-radius: 99px;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }

        .row-bar-fill {
          height: 100%;
          border-radius: 99px;
        }

        .empty-perf-msg {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 1.5rem 0;
        }

        @media (max-width: 900px) {
          .donut-chart-wrapper {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
