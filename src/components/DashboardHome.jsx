import React from 'react'
import { calculateStreak } from '../utils/formatTime'
import ActivityTimeline from './ActivityTimeline'
import NeedsAttention from './NeedsAttention'
import AchievementTeaser from './AchievementTeaser'
import { Icons } from '../utils/icons'
import './DashboardHome.css'

function DashboardHome({ child, wordData, practiceHistory, practiceSessions, totalPracticeTime, onNavigate }) {
  const streak = calculateStreak(practiceHistory)
  const today = new Date().toISOString().split('T')[0]
  const practicedToday = practiceHistory.includes(today)
  
  // Calculate today's practice time
  const todaySessions = practiceSessions.filter(session => {
    const sessionDate = new Date(session.date).toISOString().split('T')[0]
    return sessionDate === today
  })
  const todayPracticeTime = todaySessions.reduce((total, session) => total + (session.timeSpent || 0), 0)
  const todayMinutes = Math.floor(todayPracticeTime / 60)
  
  const stats = {
    mastered: wordData.filter(w => w.status === 'mastered').length,
    inProgress: wordData.filter(w => w.status === 'in-progress').length,
    struggling: wordData.filter(w => w.status === 'struggling').length,
    notStarted: wordData.filter(w => w.status === 'not-started').length,
    total: wordData.length
  }

  const motivationalMessages = [
    "Keep up the amazing work!",
    "You're doing fantastic!",
    "Every practice session counts!",
    "Progress looks great!",
    "Excellent progress today!",
    "You're getting better every day!",
    "Practice makes perfect!",
    "Keep going, you've got this!"
  ]
  const motivationalMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  return (
    <div className="dashboard-home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-avatar">{child.avatar || child.name.charAt(0).toUpperCase()}</div>
          <div className="hero-info">
            <h1 className="hero-name">{child.name}'s Progress</h1>
            <div className="hero-streak">
              <span className="streak-emoji">🔥</span>
              <span className="streak-value">{streak}</span>
              <span className="streak-label">day streak</span>
            </div>
          </div>
        </div>
        <div className="hero-status">
          <div className={`today-status ${practicedToday ? 'practiced' : 'not-practiced'}`}>
            {practicedToday 
              ? `✓ Practiced for ${todayMinutes} min${todayMinutes !== 1 ? 's' : ''}`
              : 'Not Practiced Today'}
          </div>
          <div className="motivational-message">{motivationalMessage}</div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon">
            <Icons.Check />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.mastered}</div>
            <div className="metric-label">Words Mastered</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Icons.Book />
          </div>
          <div className="metric-content">
            <div className="metric-value">{stats.inProgress}</div>
            <div className="metric-label">In Progress</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Icons.Clock />
          </div>
          <div className="metric-content">
            <div className="metric-value">{formatTime(totalPracticeTime)}</div>
            <div className="metric-label">Total Practice Time</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <ActivityTimeline 
        practiceSessions={practiceSessions} 
        wordData={wordData} 
        onNavigate={onNavigate}
      />

      {/* Focus Areas Section (Conditional) */}
      <NeedsAttention 
        wordData={wordData}
        practicedToday={practicedToday}
        onNavigate={onNavigate}
        child={child}
      />

      {/* Next Achievement Teaser */}
      <AchievementTeaser
        wordData={wordData}
        practiceHistory={practiceHistory}
        streak={streak}
        onNavigate={onNavigate}
      />
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds) return '0m'
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}

export default DashboardHome

