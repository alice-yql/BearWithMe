import React from 'react'
import './NeedsAttention.css'
import { Icons } from '../utils/icons'

function NeedsAttention({ wordData, practicedToday, onNavigate, child }) {
  const strugglingWords = wordData.filter(w => w.status === 'struggling' && w.accuracy !== null)
  const topStruggling = strugglingWords
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))
    .slice(0, 3)

  // Hide section if nothing needs attention
  if (topStruggling.length === 0 && practicedToday) {
    return null
  }

  return (
    <div className="needs-attention">
      <h3 className="section-title">Focus Areas</h3>
      
      {topStruggling.length > 0 ? (
        <>
          <div className="struggling-words-list">
            {topStruggling.map((word, idx) => (
              <div key={idx} className="struggling-word-card">
                <div className="struggling-word-header">
                  <span className="struggling-word-name">{word.text}</span>
                  <span className="struggling-word-accuracy">{Math.round(word.accuracy)}%</span>
                </div>
                <div className="struggling-word-tip">
                  <Icons.LightBulb className="tip-icon" />
                  <span>Try breaking it into syllables</span>
                </div>
              </div>
            ))}
          </div>
          {strugglingWords.length > 3 && (
            <div className="needs-attention-footer">
              <button className="view-all-link" onClick={() => onNavigate && onNavigate('word-library')}>
                View All →
              </button>
            </div>
          )}
        </>
      ) : !practicedToday ? (
        <div className="practice-reminder">
          <div className="reminder-content">
            <div className="reminder-title">Time to Practice!</div>
            <div className="reminder-message">{child?.name || 'Your child'} hasn't practiced today. Start a session to keep the streak going!</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NeedsAttention

