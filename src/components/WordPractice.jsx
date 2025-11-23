import React, { useState, useEffect } from 'react'
import './WordPractice.css'

function WordPractice({ words, wordData, recordPractice, resetData }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentWord = wordData[currentIndex]

  useEffect(() => {
    // Record practice when viewing a word
    recordPractice(currentIndex)
  }, [currentIndex, recordPractice])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % words.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)
  }

  const handleReset = () => {
    if (window.confirm('Clear all progress? This cannot be undone.')) {
      resetData()
    }
  }

  return (
    <div className="word-practice">
      <div className="practice-card">
        <div className="card-header">
          <div className={`status-indicator ${currentWord.isComplete ? 'complete' : 'in-progress'}`}>
            {currentWord.isComplete ? '✓ Complete' : 'In Progress'}
          </div>
        </div>

        <div className="word-display">
          <div className="word-text">{currentWord.text}</div>
          <div className="word-breakdown">{currentWord.breakdown}</div>
        </div>

        <div className="controls">
          <button className="control-btn prev-btn" onClick={handlePrev}>
            ← Previous
          </button>
          <button className="control-btn next-btn" onClick={handleNext}>
            Next →
          </button>
        </div>

        <button className="reset-btn" onClick={handleReset}>
          Reset All Progress
        </button>
      </div>

      <div className="word-indicators">
        {words.map((word, idx) => (
          <button
            key={idx}
            className={`word-indicator ${idx === currentIndex ? 'active' : ''} ${wordData[idx].isComplete ? 'complete' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            title={word.text}
          >
            {word.text[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WordPractice

