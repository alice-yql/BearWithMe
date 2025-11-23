import React, { useMemo } from 'react'
import './ActivityTimeline.css'

function ActivityTimeline({ practiceSessions, wordData, onNavigate }) {
  // Generate varied activity items from practice sessions
  const activities = useMemo(() => {
    const items = []
    const now = new Date()
    
    // Group sessions by date
    const sessionsByDate = {}
    practiceSessions.forEach(session => {
      const date = new Date(session.date)
      const dateKey = date.toISOString().split('T')[0]
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = []
      }
      sessionsByDate[dateKey].push(session)
    })
    
    // Track which words were mastered when
    const masteryDates = {}
    wordData.forEach((word, idx) => {
      if (word.status === 'mastered' && word.lastPracticed) {
        const masteryDate = new Date(word.lastPracticed)
        const dateKey = masteryDate.toISOString().split('T')[0]
        if (!masteryDates[dateKey]) {
          masteryDates[dateKey] = []
        }
        masteryDates[dateKey].push({ word, index: idx })
      }
    })
    
    // Create activity items
    const allDates = new Set([...Object.keys(sessionsByDate), ...Object.keys(masteryDates)])
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a))
    
    sortedDates.forEach(dateKey => {
      const date = new Date(dateKey)
      const timeAgo = getTimeAgo(date)
      const isToday = dateKey === now.toISOString().split('T')[0]
      const isYesterday = dateKey === new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Add mastery achievements
      if (masteryDates[dateKey]) {
        masteryDates[dateKey].forEach(({ word, index }) => {
          const timeStr = isToday ? `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 
                          isYesterday ? 'Yesterday' : timeAgo
          items.push({
            type: 'mastery',
            date: date,
            timeStr,
            word: word.text,
            wordIndex: index
          })
        })
      }
      
      // Add daily summary if multiple words practiced
      const daySessions = sessionsByDate[dateKey] || []
      if (daySessions.length >= 3) {
        const totalMinutes = Math.floor(daySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / 60)
        const timeStr = isToday ? 'Today' : isYesterday ? 'Yesterday' : timeAgo
        items.push({
          type: 'summary',
          date: date,
          timeStr,
          wordCount: daySessions.length,
          minutes: totalMinutes
        })
      } else {
        // Add individual practice sessions
        daySessions.forEach(session => {
          const word = wordData[session.wordIndex]
          const sessionDate = new Date(session.date)
          const sessionTimeStr = isToday ? `Today at ${sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` :
                            isYesterday ? 'Yesterday' : getTimeAgo(sessionDate)
          items.push({
            type: 'practice',
            date: sessionDate,
            timeStr: sessionTimeStr,
            word: word?.text || 'Unknown',
            accuracy: session.accuracy,
            wordIndex: session.wordIndex
          })
        })
      }
    })
    
    // Sort by date (newest first) and take top 3
    return items.sort((a, b) => b.date - a.date).slice(0, 3)
  }, [practiceSessions, wordData])

  if (activities.length === 0) {
    return (
      <div className="activity-timeline">
        <h3 className="section-title">Recent Activity</h3>
        <div className="empty-state">
          <p>No practice sessions yet. Start practicing to see activity here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-timeline">
      <h3 className="section-title">Recent Activity</h3>
      <div className="timeline-list">
        {activities.map((activity, idx) => {
          return (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-time">{activity.timeStr}:</span>
                </div>
                <div className="timeline-details">
                  {activity.type === 'mastery' && (
                    <span className="timeline-mastery">
                      {getMasteryMessage(activity.word, activity.timeStr)}
                    </span>
                  )}
                  {activity.type === 'summary' && (
                    <span className="timeline-summary">
                      {getSummaryMessage(activity.wordCount, activity.minutes, activity.timeStr)}
                    </span>
                  )}
                  {activity.type === 'practice' && (
                    <span className={`timeline-score ${getScoreColor(activity.accuracy)}`}>
                      {getPracticeMessage(activity.word, activity.accuracy, activity.timeStr)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {practiceSessions.length > 3 && (
        <div className="timeline-footer">
          <button className="view-all-link" onClick={() => onNavigate && onNavigate('analytics')}>
            View All Activity →
          </button>
        </div>
      )}
    </div>
  )
}

function getTimeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getScoreColor(accuracy) {
  if (accuracy >= 90) return 'excellent'
  if (accuracy >= 70) return 'good'
  if (accuracy >= 50) return 'fair'
  return 'poor'
}

function getMasteryMessage(word, timeStr) {
  // Use word length to deterministically select message
  const index = word.length % 4
  const messages = [
    `Mastered '${word}'! 🎉`,
    `'${word}' is now mastered! 🎉`,
    `Great job mastering '${word}'! 🎉`,
    `'${word}' - Mastered! 🎉`
  ]
  return messages[index]
}

function getSummaryMessage(wordCount, minutes, timeStr) {
  // Use word count to deterministically select message
  const index = wordCount % 4
  const messages = [
    `${wordCount} words practiced, ${minutes} minutes`,
    `Practiced ${wordCount} words for ${minutes} minutes`,
    `${wordCount} words, ${minutes} min practice session`,
    `Completed ${wordCount} words in ${minutes} minutes`
  ]
  return messages[index]
}

function getPracticeMessage(word, accuracy, timeStr) {
  // Use accuracy to deterministically select message
  const index = accuracy % 4
  const messages = [
    `Practiced '${word}' - ${accuracy}% accuracy ⭐`,
    `'${word}' practice: ${accuracy}% ⭐`,
    `Practiced '${word}' and scored ${accuracy}% ⭐`,
    `'${word}' - ${accuracy}% accuracy ⭐`
  ]
  return messages[index]
}

export default ActivityTimeline

