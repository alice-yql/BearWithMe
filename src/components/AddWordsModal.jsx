import React, { useState, useEffect } from 'react'
import { getRecommendedWords, generatePronunciationBreakdown } from '../services/geminiService'
import { Icons } from '../utils/icons'
import './AddWordsModal.css'

function AddWordsModal({ isOpen, onClose, onAddWord, onDeleteWord, wordData, child }) {
  const [wordInput, setWordInput] = useState('')
  const [breakdownInput, setBreakdownInput] = useState('')
  const [typedWords, setTypedWords] = useState([])
  const [recommendedWords, setRecommendedWords] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [generatingBreakdown, setGeneratingBreakdown] = useState(false)

  // Fetch recommended words when modal opens (only once)
  useEffect(() => {
    if (isOpen && recommendedWords.length === 0) {
      fetchRecommendations()
    }
  }, [isOpen]) // Removed wordData and child from dependencies to prevent auto-refresh

  // Fetch recommendations function
  const fetchRecommendations = async () => {
    const hasMasteredWords = wordData.some(w => w.status === 'mastered')
    if (!hasMasteredWords) return

    setLoadingRecommendations(true)
    try {
      const masteredWords = wordData.filter(w => w.status === 'mastered')
      const inProgressWords = wordData.filter(w => w.status === 'in-progress')
      const strugglingWords = wordData.filter(w => w.status === 'struggling')
      
      const recommendations = await getRecommendedWords({
        masteredWords,
        inProgressWords,
        strugglingWords,
        allWords: wordData,
        childName: child?.name || ''
      })
      
      setRecommendedWords(recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWordInput('')
      setBreakdownInput('')
      setTypedWords([])
      setRecommendedWords([]) // Clear recommendations so they refresh next time
    }
  }, [isOpen])

  const handleAddTypedWord = async () => {
    if (!wordInput.trim()) return

    const wordText = wordInput.trim()
    let breakdown = breakdownInput.trim()

    // If no breakdown provided, generate one using Gemini
    if (!breakdown) {
      setGeneratingBreakdown(true)
      try {
        breakdown = await generatePronunciationBreakdown(wordText)
      } catch (error) {
        console.error('Error generating breakdown:', error)
        breakdown = wordText // Fallback to word itself
      } finally {
        setGeneratingBreakdown(false)
      }
    }

    const newWord = {
      text: wordText,
      breakdown: breakdown || wordText
    }

    setTypedWords(prev => [...prev, newWord])
    setWordInput('')
    setBreakdownInput('')
  }

  const handleAddWord = (word) => {
    onAddWord(word)
    // Remove from typed words if it was there
    setTypedWords(prev => prev.filter(w => w.text !== word.text))
    // Remove from recommended words if it was there (but don't refresh)
    setRecommendedWords(prev => prev.filter(w => w.text !== word.text))
    // Note: We don't refresh recommendations here to prevent auto-refresh
  }

  const handleDeleteWord = (wordText) => {
    // Delete from localStorage via callback
    if (onDeleteWord) {
      onDeleteWord(wordText)
    }
    // Also remove from typed words if it's in the list
    setTypedWords(prev => prev.filter(w => w.text !== wordText))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTypedWord()
    }
  }

  if (!isOpen) return null

  return (
    <div className="add-words-modal-overlay" onClick={onClose}>
      <div className="add-words-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Words</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {/* Input Section */}
          <div className="add-words-input-section">
            <h3 className="input-section-title">Type New Words</h3>
            <div className="word-input-group">
              <div className="input-field">
                <label htmlFor="word-input">Word</label>
                <input
                  id="word-input"
                  type="text"
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter word (e.g. Butterfly)"
                  className="word-input"
                />
              </div>
              <div className="input-field">
                <label htmlFor="breakdown-input">Pronunciation Breakdown (optional)</label>
                <input
                  id="breakdown-input"
                  type="text"
                  value={breakdownInput}
                  onChange={(e) => setBreakdownInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="But - ter - fly"
                  className="breakdown-input"
                />
              </div>
              <button 
                className="add-word-btn"
                onClick={handleAddTypedWord}
                disabled={!wordInput.trim() || generatingBreakdown}
              >
                {generatingBreakdown ? 'Generating...' : 'Add to List'}
              </button>
            </div>

            {/* Typed Words Cards */}
            {typedWords.length > 0 && (
              <div className="typed-words-section">
                <h4 className="typed-words-title">Words to Add</h4>
                <div className="typed-words-grid">
                  {typedWords.map((word, idx) => (
                    <div key={idx} className="typed-word-card">
                      <div className="typed-word-content">
                        <div className="typed-word-name">{word.text}</div>
                        <div className="typed-word-breakdown">
                          {word.breakdown?.replace(/\s*-\s*/g, ' · ') || word.text}
                        </div>
                      </div>
                      <div className="typed-word-actions">
                        <button 
                          className="add-typed-word-btn"
                          onClick={() => handleAddWord(word)}
                        >
                          Add
                        </button>
                        <button 
                          className="delete-typed-word-btn"
                          onClick={() => handleDeleteWord(word.text)}
                          aria-label="Delete word"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommended Words Section */}
          {wordData.some(w => w.status === 'mastered') && (
            <div className="recommended-words-section">
              <div className="recommended-words-header">
                <div>
                  <h3 className="recommended-words-title">Recommended Words</h3>
                  <p className="recommended-words-subtitle">Suggested based on your progress</p>
                </div>
                <button 
                  className="refresh-recommendations-btn"
                  onClick={fetchRecommendations}
                  disabled={loadingRecommendations}
                  aria-label="Refresh recommendations"
                >
                  <svg className="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 8v5M21 8h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 16v-5M3 16h5"/>
                  </svg>
                  {loadingRecommendations ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loadingRecommendations ? (
                <div className="recommended-words-loading">
                  <p>Generating recommendations...</p>
                </div>
              ) : recommendedWords.length > 0 ? (
                <div className="recommended-words-grid">
                  {recommendedWords.map((word, idx) => (
                    <div key={idx} className="recommended-word-card">
                      <div className="recommended-word-content">
                        <div className="recommended-word-header">
                          <div className="recommended-word-name">{word.text}</div>
                          <div className="recommended-word-badge">AI</div>
                        </div>
                        <div className="recommended-word-breakdown">
                          {word.breakdown?.replace(/\s*-\s*/g, ' · ') || word.text}
                        </div>
                      </div>
                      <button 
                        className="add-recommended-word-btn"
                        onClick={() => handleAddWord(word)}
                        aria-label={`Add ${word.text}`}
                      >
                        <Icons.Plus className="add-word-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="recommended-words-empty">
                  <p>No recommendations available at this time.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddWordsModal

