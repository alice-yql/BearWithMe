import React, { useState, useEffect } from 'react'
import ProfileSelection from './components/ProfileSelection'
import DashboardHome from './components/DashboardHome'
import WordLibrary from './components/WordLibrary'
import WordDetails from './components/WordDetails'
import AchievementsPage from './components/AchievementsPage'
import AnalyticsPage from './components/AnalyticsPage'
import NavDropdown from './components/NavDropdown'
import { useWordData } from './hooks/useWordData'
import { calculateStreak } from './utils/formatTime'
import './App.css'

const WORDS = [
  { text: 'Hello', breakdown: 'Hel - lo' },
  { text: 'Teddy', breakdown: 'Ted - dy' },
  { text: 'Apple', breakdown: 'Ap - ple' },
  { text: 'Ball', breakdown: 'Ball' }
]

function App() {
  const [selectedChild, setSelectedChild] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' | 'word-library' | 'analytics' | 'achievements' | 'word-details'
  const [selectedWordIndex, setSelectedWordIndex] = useState(null)

  const { wordData, practiceHistory, practiceSessions, totalPracticeTime, recordPractice, resetData, markWordComplete, addWord, deleteWord } = useWordData(
    WORDS,
    selectedChild?.id
  )

  // Handle adding new words
  const handleAddWord = (word) => {
    addWord(word)
  }

  // Handle deleting words
  const handleDeleteWord = (wordText) => {
    deleteWord(wordText)
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view)
        if (event.state.wordIndex !== undefined) {
          setSelectedWordIndex(event.state.wordIndex)
        } else {
          setSelectedWordIndex(null)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Update browser history when view changes
  const navigateToView = (view, wordIndex = null) => {
    setCurrentView(view)
    if (wordIndex !== null) {
      setSelectedWordIndex(wordIndex)
      window.history.pushState({ view, wordIndex }, '', `#${view}${wordIndex !== null ? `-${wordIndex}` : ''}`)
    } else {
      setSelectedWordIndex(null)
      window.history.pushState({ view, wordIndex: null }, '', `#${view}`)
    }
  }

  // Initialize history on mount
  useEffect(() => {
    if (selectedChild) {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const parts = hash.split('-')
        const view = parts[0]
        const wordIndex = parts[1] ? parseInt(parts[1]) : null
        if (['dashboard', 'word-library', 'analytics', 'achievements', 'word-details'].includes(view)) {
          setCurrentView(view)
          if (wordIndex !== null && !isNaN(wordIndex)) {
            setSelectedWordIndex(wordIndex)
          }
        }
      } else {
        window.history.replaceState({ view: 'dashboard', wordIndex: null }, '', '#dashboard')
      }
    }
  }, [selectedChild])

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView])

  // If no child selected, show profile selection
  if (!selectedChild) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <img 
                src="/Bear.png" 
                alt="Bear With Me Logo" 
                className="header-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1>Bear With Me</h1>
            </div>
          </div>
        </header>
        <main className="app-main">
          <ProfileSelection onSelectChild={setSelectedChild} />
        </main>
      </div>
    )
  }

  // After child selection, show dashboard by default
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <img 
              src="/Bear.png" 
              alt="Bear With Me Logo" 
              className="header-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1>Bear With Me</h1>
          </div>
          <NavDropdown
            currentView={currentView}
            onNavigate={navigateToView}
            onSwitchProfile={() => {
              setSelectedChild(null)
              setCurrentView('dashboard')
              window.history.replaceState({ view: 'dashboard', wordIndex: null }, '', '#dashboard')
            }}
          />
        </div>
      </header>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <DashboardHome
            child={selectedChild}
            wordData={wordData}
            practiceHistory={practiceHistory}
            practiceSessions={practiceSessions}
            totalPracticeTime={totalPracticeTime}
            onNavigate={navigateToView}
          />
        )}

        {currentView === 'word-library' && (
          <WordLibrary
            child={selectedChild}
            wordData={wordData}
            onWordClick={(index) => {
              navigateToView('word-details', index)
            }}
            onAddWord={handleAddWord}
            onDeleteWord={handleDeleteWord}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsPage
            child={selectedChild}
            wordData={wordData}
            practiceHistory={practiceHistory}
            practiceSessions={practiceSessions}
            totalPracticeTime={totalPracticeTime}
            onNavigate={navigateToView}
          />
        )}

        {currentView === 'achievements' && (
          <AchievementsPage
            wordData={wordData}
            practiceHistory={practiceHistory}
            streak={calculateStreak(practiceHistory)}
          />
        )}

        {currentView === 'word-details' && selectedWordIndex !== null && (
          <WordDetails
            word={wordData[selectedWordIndex]}
            wordIndex={selectedWordIndex}
            isComplete={wordData[selectedWordIndex].isComplete}
            practiceSessions={practiceSessions}
            onBack={() => {
              navigateToView('word-library', null)
            }}
            onMarkComplete={markWordComplete}
          />
        )}
      </main>

    </div>
  )
}

export default App

