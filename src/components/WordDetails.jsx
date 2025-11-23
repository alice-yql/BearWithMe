import React from 'react'
import './WordDetails.css'

// Azure Speech SDK accuracy color helper
function getAccuracyColorClass(color) {
  switch (color) {
    case 'good':
      return '#7A9B76' // Green (matches status badge)
    case 'mid':
      return '#D4A574' // Yellow/Orange
    case 'poor':
      return '#C97D60' // Red/Orange (matches status badge)
    default:
      return '#CCCCCC' // Neutral gray
  }
}

function WordDetails({ word, wordIndex, onBack, onMarkComplete, isComplete, practiceSessions }) {
  // Get most recent accuracy score for this word
  const wordSessions = practiceSessions?.filter(session => session.wordIndex === wordIndex) || []
  const mostRecentSession = wordSessions.length > 0 
    ? wordSessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null
  const recentAccuracy = mostRecentSession?.accuracy || word.accuracy || null

  // Determine the correct status based on word data
  const getWordStatus = () => {
    // Use the word's status if available, otherwise determine from practice data
    if (word.status) {
      return word.status
    }
    // If no practice sessions and no practice count, it's not started
    if ((word.practiceCount || 0) === 0 && wordSessions.length === 0) {
      return 'not-started'
    }
    // If there's practice data, check if it's complete
    if (isComplete) {
      return 'mastered'
    }
    // Otherwise it's in progress
    return 'in-progress'
  }

  const wordStatus = getWordStatus()
  const statusLabel = wordStatus === 'not-started' ? 'Not Started' 
    : wordStatus === 'mastered' ? '✓ Mastered'
    : wordStatus === 'struggling' ? 'Struggling'
    : 'In Progress'

  // Azure Speech SDK accuracy ranges
  const getAccuracyColor = (accuracy) => {
    if (accuracy === null) return 'neutral'
    if (accuracy >= 85) return 'good'      // Good: 85%+
    if (accuracy >= 60) return 'mid'       // Mid: 60-84%
    return 'poor'                          // Poor: <60%
  }

  const accuracyColor = getAccuracyColor(recentAccuracy)
  const accuracyPercent = recentAccuracy !== null ? Math.round(recentAccuracy) : 0

  // Calculate circle progress (0-100%)
  const circleProgress = accuracyPercent
  const radius = 70 // Increased radius for bigger ring to prevent overlap
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circleProgress / 100) * circumference

  return (
    <div className="word-details">
      <div className="word-details-header">
        <button className="back-arrow-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <div className="word-details-container">
        <div className="word-details-card">
          <div className="word-details-display">
            <div className="word-details-text">{word.text}</div>
            <div className="word-details-breakdown">{word.breakdown?.replace(/\s*-\s*/g, ' · ') || word.breakdown}</div>
          </div>
        </div>

        {/* Performance Stats Section - Side by side */}
        <div className="performance-stats-section">
          <div className="performance-stats-header">
            <h3 className="performance-stats-title">Performance</h3>
            <div className={`status-badge ${wordStatus}`}>
              {statusLabel}
            </div>
          </div>
        
        {recentAccuracy !== null && (word.practiceCount || 0) > 0 ? (
          <div className="performance-stats-content">
            {/* Circular Performance Indicator */}
            <div className="performance-indicator">
              <div className="performance-circle-wrapper">
                <svg className="performance-circle" width="200" height="200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="var(--beige)"
                    strokeWidth="10"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={getAccuracyColorClass(accuracyColor)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 100 100)"
                    className="performance-progress"
                  />
                </svg>
                <div className="performance-value">
                  <span className="performance-percent">{accuracyPercent}%</span>
                  <span className="performance-label">Accuracy</span>
                </div>
              </div>
            </div>

            {/* Stats List */}
            <div className="performance-stats-list">
              <div className="performance-stat-item">
                <span className="stat-label">Latest Accuracy Score</span>
                <span className={`stat-value ${accuracyColor}`}>{accuracyPercent}%</span>
              </div>
              
              <div className="performance-stat-item">
                <span className="stat-label">Times Practiced</span>
                <span className="stat-value">{word.practiceCount || 0}</span>
              </div>
              
              {word.lastPracticed && (
                <div className="performance-stat-item">
                  <span className="stat-label">Last Practiced Date</span>
                  <span className="stat-value">
                    {new Date(word.lastPracticed).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="performance-empty-state">
            <p>No practice data yet. Start practicing to see your performance metrics here!</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default WordDetails

