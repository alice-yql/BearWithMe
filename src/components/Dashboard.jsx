import React from 'react'
import { calculateStreak } from '../utils/formatTime'
import './Dashboard.css'

function Dashboard({ wordData, practiceHistory, onWordClick, onBack }) {
  const streak = calculateStreak(practiceHistory)
  const stats = {
    inProgress: wordData.filter(w => !w.isComplete).length,
    complete: wordData.filter(w => w.isComplete).length,
    total: wordData.length
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Progress Dashboard</h2>
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card streak-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-label">Practice Streak</div>
            <div className="stat-value">{streak}</div>
            <div className="stat-unit">days in a row</div>
          </div>
        </div>

        <div className="stat-card progress-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-label">Words In Progress</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-unit">words</div>
          </div>
        </div>

        <div className="stat-card complete-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Words Complete</div>
            <div className="stat-value">{stats.complete}</div>
            <div className="stat-unit">words</div>
          </div>
        </div>
      </div>

      <div className="word-details-section">
        <h3 className="section-title">Word Progress</h3>
        <div className="word-list">
          {wordData.map((word, idx) => (
            <div 
              key={idx} 
              className={`word-detail-card ${word.isComplete ? 'complete' : 'in-progress'} ${onWordClick ? 'clickable' : ''}`}
              onClick={() => onWordClick && onWordClick(idx)}
            >
              <div className="word-detail-header">
                <div className="word-detail-name">{word.text}</div>
                <div className={`word-detail-status ${word.isComplete ? 'complete' : 'in-progress'}`}>
                  {word.isComplete ? '✓ Complete' : 'In Progress'}
                </div>
              </div>
              {word.lastPracticed && (
                <div className="word-last-practiced">
                  Last practiced: {new Date(word.lastPracticed).toLocaleDateString()}
                </div>
              )}
              {onWordClick && (
                <div className="word-detail-hint">Click to view details →</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {practiceHistory.length > 0 && (
        <div className="practice-calendar-section">
          <h3 className="section-title">Practice History</h3>
          <div className="calendar-info">
            <div className="calendar-stats">
              <div className="calendar-stat">
                <span className="calendar-stat-label">Total Practice Days:</span>
                <span className="calendar-stat-value">{practiceHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

