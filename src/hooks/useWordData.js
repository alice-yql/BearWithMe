import { useState, useEffect, useCallback } from 'react'
import { loadFakeData } from '../utils/generateFakeData'

export function useWordData(initialWords, childId) {
  const [wordData, setWordData] = useState(() => {
    return initialWords.map(word => ({
      text: word.text,
      breakdown: word.breakdown,
      isComplete: false,
      lastPracticed: null,
      accuracy: null, // Average accuracy score (0-100)
      practiceCount: 0, // Number of practice sessions
      practiceSessions: [], // Array of { date, accuracy, timeSpent }
      status: 'not-started' // 'not-started' | 'in-progress' | 'mastered' | 'struggling'
    }))
  })

  const [practiceHistory, setPracticeHistory] = useState([])
  const [practiceSessions, setPracticeSessions] = useState([]) // Global practice sessions

  // Load data from localStorage on mount or when childId changes
  useEffect(() => {
    if (!childId) {
      // Reset to initial state when no child selected
      setWordData(initialWords.map(word => ({
        text: word.text,
        breakdown: word.breakdown,
        isComplete: false,
        lastPracticed: null,
        accuracy: null,
        practiceCount: 0,
        practiceSessions: [],
        status: 'not-started'
      })))
      setPracticeHistory([])
      setPracticeSessions([])
      return
    }
    
    try {
      const key = `wordData_${childId}`
      const sessionsKey = `practiceSessions_${childId}`
      const historyKey = `practiceHistory_${childId}`
      
      let savedWordData = JSON.parse(localStorage.getItem(key) || 'null')
      let savedSessions = JSON.parse(localStorage.getItem(sessionsKey) || 'null')
      let savedHistory = JSON.parse(localStorage.getItem(historyKey) || 'null')
      
      // Generate fake data if none exists or if saved data is shorter than initial words
      if (!savedWordData || !Array.isArray(savedWordData) || savedWordData.length < initialWords.length) {
        console.log('Generating fake data for child:', childId)
        const fakeData = loadFakeData(initialWords, childId)
        // Reload from localStorage after generating
        savedWordData = JSON.parse(localStorage.getItem(key) || 'null')
        savedSessions = JSON.parse(localStorage.getItem(sessionsKey) || 'null')
        savedHistory = JSON.parse(localStorage.getItem(historyKey) || 'null')
        console.log('Generated fake data - wordData:', savedWordData?.length, 'sessions:', savedSessions?.length, 'history:', savedHistory?.length)
      }
      
      // Load saved data - handle both initial words and dynamically added words
      if (Array.isArray(savedWordData) && savedWordData.length > 0) {
        const mappedData = savedWordData.map((saved, i) => {
          // For initial words, use saved data but preserve initial breakdown if needed
          const initialWord = initialWords[i]
          return {
            text: saved.text || (initialWord ? initialWord.text : ''),
            breakdown: saved.breakdown || (initialWord ? initialWord.breakdown : saved.text || ''),
            isComplete: saved.isComplete || false,
            lastPracticed: saved.lastPracticed || null,
            accuracy: saved.accuracy || null,
            practiceCount: saved.practiceCount || 0,
            practiceSessions: saved.practiceSessions || [],
            status: saved.status || 'not-started'
          }
        })
        console.log('Loading word data:', mappedData.length, 'words (including', mappedData.length - initialWords.length, 'dynamically added)')
        setWordData(mappedData)
      }

      if (Array.isArray(savedSessions) && savedSessions.length > 0) {
        console.log('Loading practice sessions:', savedSessions.length)
        setPracticeSessions(savedSessions)
      } else {
        console.log('No practice sessions found, key:', sessionsKey)
      }
      
      if (Array.isArray(savedHistory) && savedHistory.length > 0) {
        console.log('Loading practice history:', savedHistory.length, 'days')
        setPracticeHistory(savedHistory)
      } else {
        console.log('No practice history found, key:', historyKey)
      }
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }, [initialWords, childId])

  // Save data whenever it changes
  useEffect(() => {
    if (!childId) return
    
    try {
      const key = `wordData_${childId}`
      const historyKey = `practiceHistory_${childId}`
      const sessionsKey = `practiceSessions_${childId}`
      localStorage.setItem(key, JSON.stringify(wordData))
      localStorage.setItem(historyKey, JSON.stringify(practiceHistory))
      localStorage.setItem(sessionsKey, JSON.stringify(practiceSessions))
    } catch (e) {
      console.error('Failed to save data:', e)
    }
  }, [wordData, practiceHistory, practiceSessions, childId])

  const recordPractice = useCallback((wordIndex, accuracy = null, timeSpent = 0) => {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()
    
    setPracticeHistory(prev => {
      if (!prev.includes(today)) {
        return [...prev, today]
      }
      return prev
    })
    
    // Record practice session
    if (wordIndex !== undefined) {
      const session = {
        wordIndex,
        date: now,
        accuracy: accuracy !== null ? accuracy : Math.floor(Math.random() * 30 + 70), // Mock if not provided
        timeSpent: timeSpent || Math.floor(Math.random() * 60 + 30) // Mock if not provided
      }
      
      setPracticeSessions(prev => [session, ...prev].slice(0, 50)) // Keep last 50 sessions
      
      // Update word data
      setWordData(prev => prev.map((word, idx) => {
        if (idx === wordIndex) {
          const newSessions = [...(word.practiceSessions || []), session].slice(-10) // Keep last 10 per word
          const avgAccuracy = newSessions.length > 0
            ? newSessions.reduce((sum, s) => sum + s.accuracy, 0) / newSessions.length
            : (accuracy || 0)
          
          // Determine status
          let status = 'in-progress'
          if (word.practiceCount === 0 && newSessions.length === 0) {
            status = 'not-started'
          } else if (avgAccuracy >= 90 && newSessions.length >= 3) {
            status = 'mastered'
          } else if (avgAccuracy < 60 && newSessions.length >= 2) {
            status = 'struggling'
          } else {
            status = 'in-progress'
          }
          
          return {
            ...word,
            lastPracticed: now,
            practiceCount: (word.practiceCount || 0) + 1,
            practiceSessions: newSessions,
            accuracy: avgAccuracy,
            status,
            isComplete: status === 'mastered'
          }
        }
        return word
      }))
    }
  }, [])

  const resetData = useCallback(() => {
    setWordData(initialWords.map(word => ({
      text: word.text,
      breakdown: word.breakdown,
      isComplete: false,
      lastPracticed: null,
      accuracy: null,
      practiceCount: 0,
      practiceSessions: [],
      status: 'not-started'
    })))
    setPracticeHistory([])
    setPracticeSessions([])
  }, [initialWords])

  const markWordComplete = useCallback((wordIndex, isComplete) => {
    setWordData(prev => prev.map((word, idx) => 
      idx === wordIndex 
        ? { ...word, isComplete }
        : word
    ))
  }, [])

  const addWord = useCallback((word) => {
    const newWord = {
      text: word.text,
      breakdown: word.breakdown,
      isComplete: false,
      lastPracticed: null,
      accuracy: null,
      practiceCount: 0,
      practiceSessions: [],
      status: 'not-started'
    }
    setWordData(prev => [...prev, newWord])
  }, [])

  const deleteWord = useCallback((wordText) => {
    setWordData(prev => prev.filter(w => w.text !== wordText))
  }, [])

  // Calculate total practice time
  const totalPracticeTime = practiceSessions.reduce((sum, session) => sum + (session.timeSpent || 0), 0)

  return {
    wordData,
    practiceHistory,
    practiceSessions,
    totalPracticeTime,
    recordPractice,
    resetData,
    markWordComplete,
    addWord,
    deleteWord
  }
}

