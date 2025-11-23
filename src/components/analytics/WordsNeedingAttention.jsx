import React, { useMemo } from 'react'
import './WordsNeedingAttention.css'

function WordsNeedingAttention({ wordData, dateRange, onNavigate }) {
  const strugglingWords = useMemo(() => {
    return wordData
      .filter(word => {
        // Status: "In Progress" (not mastered yet)
        const isInProgress = word.status === 'in-progress' || word.status === 'struggling'
        
        // Accuracy score below 75%
        const hasLowAccuracy = word.accuracy !== null && word.accuracy < 75
        
        // Attempted 3+ times
        const hasEnoughAttempts = (word.practiceCount || 0) >= 3
        
        return isInProgress && hasLowAccuracy && hasEnoughAttempts
      })
      .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0)) // Sort by lowest accuracy first
      .slice(0, 10) // Max 10 words
  }, [wordData])

  const getTip = (word) => {
    const accuracy = word.accuracy || 0
    if (accuracy < 50) {
      return "Needs extra practice on pronunciation"
    } else if (accuracy < 65) {
      return "Struggling with specific sounds"
    } else {
      return "Close to mastery, keep practicing!"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 50) return 'red'
    if (accuracy < 65) return 'yellow'
    return 'blue'
  }

  return (
    <div className="words-needing-attention">
      <h2 className="section-title">Words Needing Attention</h2>
      {strugglingWords.length === 0 ? (
        <div className="empty-state">
          <p>Great job! No words currently need extra attention.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="words-table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Accuracy</th>
                  <th>Attempts</th>
                  <th>Last Practiced</th>
                  <th>Insight</th>
                </tr>
              </thead>
              <tbody>
                {strugglingWords.map((word, idx) => (
                  <tr key={idx}>
                    <td className="word-name">{word.text}</td>
                    <td>
                      <span className={`accuracy-badge accuracy-${getAccuracyColor(word.accuracy || 0)}`}>
                        {Math.round(word.accuracy || 0)}%
                      </span>
                    </td>
                    <td className="attempts">{word.practiceCount || 0}</td>
                    <td className="last-practiced">{formatDate(word.lastPracticed)}</td>
                    <td className="insight">{getTip(word)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {wordData.filter(w => {
            const isInProgress = w.status === 'in-progress' || w.status === 'struggling'
            const hasLowAccuracy = w.accuracy !== null && w.accuracy < 75
            const hasEnoughAttempts = (w.practiceCount || 0) >= 3
            return isInProgress && hasLowAccuracy && hasEnoughAttempts
          }).length > 10 && (
            <div className="view-all-link-container">
              <button 
                className="view-all-link"
                onClick={() => onNavigate && onNavigate('word-library')}
              >
                View All Struggling Words →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WordsNeedingAttention

