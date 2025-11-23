import React from 'react'
import './StrugglingWords.css'

function StrugglingWords({ wordData }) {
  const strugglingWords = wordData.filter(w => w.status === 'struggling' && w.accuracy !== null)

  if (strugglingWords.length === 0) {
    return (
      <div className="struggling-words">
        <h3 className="section-title">Struggling Words</h3>
        <div className="empty-state positive">
          <p>Great job! No words are currently struggling. Keep up the excellent work!</p>
        </div>
      </div>
    )
  }

  const tips = [
    "Practice breaking the word into syllables",
    "Try saying it slowly, then gradually speed up",
    "Focus on the sounds that are most challenging",
    "Practice 5 minutes daily for better results"
  ]

  return (
    <div className="struggling-words">
      <h3 className="section-title">Words Needing Attention</h3>
      <div className="struggling-list">
        {strugglingWords.map((word, idx) => (
          <div key={idx} className="struggling-card">
            <div className="struggling-header">
              <div className="struggling-word-name">{word.text}</div>
              <div className="struggling-accuracy">{Math.round(word.accuracy)}%</div>
            </div>
            <div className="struggling-tips">
              <div className="tips-label">Tips:</div>
              <ul className="tips-list">
                {tips.slice(0, 2).map((tip, tipIdx) => (
                  <li key={tipIdx}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="struggling-practice-count">
              Practiced {word.practiceCount} {word.practiceCount === 1 ? 'time' : 'times'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StrugglingWords

