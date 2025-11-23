export function formatMs(ms) {
  const s = ms / 1000
  if (s < 60) return s.toFixed(1) + 's'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export function calculateStreak(practiceHistory) {
  if (practiceHistory.length === 0) return 0
  
  const sortedDates = [...new Set(practiceHistory)]
    .map(d => new Date(d))
    .sort((a, b) => b - a) // Most recent first
  
  if (sortedDates.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const mostRecent = new Date(sortedDates[0])
  mostRecent.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 1) return 0
  
  let checkDate = new Date(today)
  if (daysDiff === 1) checkDate.setDate(checkDate.getDate() - 1)
  
  for (let i = 0; i < sortedDates.length; i++) {
    const practiceDate = new Date(sortedDates[i])
    practiceDate.setHours(0, 0, 0, 0)
    
    const diff = Math.floor((checkDate - practiceDate) / (1000 * 60 * 60 * 24))
    
    if (diff === 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (diff > 0) {
      break
    }
  }
  
  return streak
}

