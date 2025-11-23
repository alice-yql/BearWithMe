import React from 'react'
import './PerformanceOverview.css'
import { calculateStreak } from '../../utils/formatTime'
import { Icons } from '../../utils/icons'

function PerformanceOverview({ wordData, practiceHistory, practiceSessions, totalPracticeTime, dateRange }) {
  // Calculate stats for the selected date range
  const now = new Date()
  const daysBack = parseInt(dateRange)
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
  
  // Filter sessions by date range
  const filteredSessions = practiceSessions.filter(session => {
    const sessionDate = new Date(session.date)
    return sessionDate >= startDate
  })

  // Previous period for comparison
  const previousStartDate = daysBack === Infinity ? new Date(0) : new Date(now.getTime() - (daysBack * 2) * 24 * 60 * 60 * 1000)
  const previousSessions = practiceSessions.filter(session => {
    const sessionDate = new Date(session.date)
    return sessionDate >= previousStartDate && sessionDate < startDate
  })

  // Calculate average accuracy
  const avgAccuracy = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((sum, s) => sum + s.accuracy, 0) / filteredSessions.length)
    : 0

  const previousAvgAccuracy = previousSessions.length > 0
    ? Math.round(previousSessions.reduce((sum, s) => sum + s.accuracy, 0) / previousSessions.length)
    : 0

  const accuracyTrend = avgAccuracy - previousAvgAccuracy

  // Total words attempted (words that have been practiced at least once)
  const attemptedCount = wordData.filter(w => (w.practiceCount || 0) > 0).length

  // Words mastered
  const masteredCount = wordData.filter(w => w.status === 'mastered').length

  // Current learning velocity (words mastered per week)
  // Calculate words mastered in the last 7 days
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentlyMastered = wordData.filter(w => {
    if (w.status !== 'mastered' || !w.lastPracticed) return false
    const masteredDate = new Date(w.lastPracticed)
    return masteredDate >= weekAgo
  }).length
  
  // Calculate velocity based on the selected time period
  const periodWeeks = daysBack / 7
  const wordsMasteredInPeriod = wordData.filter(w => {
    if (w.status !== 'mastered' || !w.lastPracticed) return false
    const masteredDate = new Date(w.lastPracticed)
    return masteredDate >= startDate
  }).length
  
  const learningVelocity = periodWeeks > 0 ? (wordsMasteredInPeriod / periodWeeks) : 0

  return (
    <div className="performance-overview">
      <h2 className="section-title">Performance Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Icons.Trending />
          </div>
          <div className="stat-content">
            <div className="stat-value">{avgAccuracy}%</div>
            <div className="stat-label">Average Pronunciation Accuracy</div>
            {accuracyTrend !== 0 && (
              <div className={`stat-trend ${accuracyTrend > 0 ? 'positive' : 'negative'}`}>
                {accuracyTrend > 0 ? '↑' : '↓'} {Math.abs(accuracyTrend)}% from previous period
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icons.Book />
          </div>
          <div className="stat-content">
            <div className="stat-value">{attemptedCount}</div>
            <div className="stat-label">Total Words Attempted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icons.Check />
          </div>
          <div className="stat-content">
            <div className="stat-value">{masteredCount}</div>
            <div className="stat-label">Total Words Mastered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icons.Trending />
          </div>
          <div className="stat-content">
            <div className="stat-value">{learningVelocity.toFixed(1)}</div>
            <div className="stat-label">Current Learning Velocity</div>
            <div className="stat-sublabel">words/week</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceOverview

