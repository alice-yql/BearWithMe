// Utility to generate fake data for testing analytics

export function generateFakeData(initialWords, childId) {
  const now = new Date()
  const practiceSessions = []
  const practiceHistory = []
  const wordData = initialWords.map((word, wordIndex) => {
    // Generate different statuses for variety
    // Ensure at least first word is mastered, others vary
    let status
    if (wordIndex === 0) {
      status = 'mastered' // First word always mastered
    } else {
      const statuses = ['mastered', 'in-progress', 'struggling']
      status = statuses[wordIndex % statuses.length]
    }
    
    // Generate practice sessions for the last 90 days
    const wordSessions = []
    let practiceCount = 0
    let totalAccuracy = 0
    let lastPracticed = null
    
    // Ensure at least some practice for each word (guarantee at least 5-10 sessions)
    const minSessions = 5 + Math.floor(Math.random() * 6) // 5-10 sessions minimum
    let sessionsGenerated = 0
    
    // Generate sessions over the last 90 days
    for (let i = 0; i < 90; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // For first few days, guarantee some practice, then random
      const shouldPractice = sessionsGenerated < minSessions || Math.random() < 0.4
      
      if (shouldPractice) {
        // Determine accuracy based on status
        let accuracy
        if (status === 'mastered') {
          accuracy = Math.floor(Math.random() * 10 + 90) // 90-100%
        } else if (status === 'struggling') {
          accuracy = Math.floor(Math.random() * 20 + 50) // 50-70%
        } else if (status === 'in-progress') {
          accuracy = Math.floor(Math.random() * 25 + 70) // 70-95%
        } else {
          accuracy = Math.floor(Math.random() * 30 + 60) // 60-90%
        }
        
        const timeSpent = Math.floor(Math.random() * 120 + 30) // 30-150 seconds
        const sessionDate = date.toISOString()
        
        const session = {
          wordIndex,
          date: sessionDate,
          accuracy,
          timeSpent
        }
        
        wordSessions.push(session)
        practiceSessions.push(session)
        practiceCount++
        sessionsGenerated++
        totalAccuracy += accuracy
        
        if (!lastPracticed || new Date(sessionDate) > new Date(lastPracticed)) {
          lastPracticed = sessionDate
        }
        
        // Add to practice history
        const dateKey = sessionDate.split('T')[0]
        if (!practiceHistory.includes(dateKey)) {
          practiceHistory.push(dateKey)
        }
      }
    }
    
    // Calculate average accuracy
    const accuracy = practiceCount > 0 ? Math.round(totalAccuracy / practiceCount) : null
    
    // Update status based on actual data
    let finalStatus = status
    if (practiceCount === 0) {
      finalStatus = 'not-started'
    } else if (accuracy >= 90 && practiceCount >= 3) {
      finalStatus = 'mastered'
    } else if (accuracy < 60 && practiceCount >= 2) {
      finalStatus = 'struggling'
    } else {
      finalStatus = 'in-progress'
    }
    
    return {
      text: word.text,
      breakdown: word.breakdown,
      isComplete: finalStatus === 'mastered',
      lastPracticed,
      accuracy,
      practiceCount,
      practiceSessions: wordSessions.slice(-10), // Keep last 10
      status: finalStatus
    }
  })
  
  // Sort practice sessions by date (newest first)
  practiceSessions.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // Sort practice history (newest first)
  practiceHistory.sort((a, b) => new Date(b) - new Date(a))
  
  return {
    wordData,
    practiceSessions: practiceSessions.slice(0, 100), // Keep last 100
    practiceHistory
  }
}

export function loadFakeData(initialWords, childId) {
  if (!childId) {
    console.log('loadFakeData: No childId provided')
    return null
  }
  
  console.log('loadFakeData: Generating fake data for child:', childId)
  const fakeData = generateFakeData(initialWords, childId)
  console.log('loadFakeData: Generated data:', {
    wordDataCount: fakeData.wordData.length,
    practiceSessionsCount: fakeData.practiceSessions.length,
    practiceHistoryCount: fakeData.practiceHistory.length,
    sampleWord: fakeData.wordData[0]
  })
  
  // Save to localStorage
  try {
    const key = `wordData_${childId}`
    const sessionsKey = `practiceSessions_${childId}`
    const historyKey = `practiceHistory_${childId}`
    
    localStorage.setItem(key, JSON.stringify(fakeData.wordData))
    localStorage.setItem(sessionsKey, JSON.stringify(fakeData.practiceSessions))
    localStorage.setItem(historyKey, JSON.stringify(fakeData.practiceHistory))
    
    console.log('loadFakeData: Data saved to localStorage')
    
    // Verify it was saved
    const verify = JSON.parse(localStorage.getItem(key) || 'null')
    console.log('loadFakeData: Verification - loaded back from localStorage:', verify?.length, 'items')
    
    return fakeData
  } catch (e) {
    console.error('Failed to save fake data:', e)
    return null
  }
}

