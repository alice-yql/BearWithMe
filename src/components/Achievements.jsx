import React from 'react'
import './Achievements.css'

function Achievements({ wordData, practiceHistory, streak }) {
  const masteredCount = wordData.filter(w => w.status === 'mastered').length
  const totalWords = wordData.length
  const practiceDays = practiceHistory.length

  // Define achievements with prerequisites
  const allAchievements = [
    {
      id: 'first-word',
      name: 'First Steps',
      description: 'Master your first word',
      emoji: '⭐',
      progress: Math.min(masteredCount, 1),
      target: 1,
      prerequisite: null // No prerequisite
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Practice for 7 days straight',
      emoji: '🔥',
      progress: Math.min(streak, 7),
      target: 7,
      prerequisite: 'first-word' // Requires first word
    },
    {
      id: 'master-5',
      name: 'Word Master',
      description: 'Master 5 words',
      emoji: '🏆',
      progress: Math.min(masteredCount, 5),
      target: 5,
      prerequisite: 'first-word' // Requires first word
    },
    {
      id: 'practice-30',
      name: 'Dedicated Learner',
      description: 'Practice for 30 days',
      emoji: '🎖️',
      progress: Math.min(practiceDays, 30),
      target: 30,
      prerequisite: 'first-word' // Requires first word
    },
    {
      id: 'all-mastered',
      name: 'Perfect Score',
      description: 'Master all words',
      emoji: '💯',
      progress: masteredCount,
      target: totalWords,
      prerequisite: 'master-5' // Requires Word Master
    }
  ]
  
  // Calculate unlocked status with prerequisites
  const achievements = allAchievements.map(achievement => {
    let unlocked = false
    
    // Check if prerequisite is met
    if (achievement.prerequisite) {
      const prereq = allAchievements.find(a => a.id === achievement.prerequisite)
      const prereqUnlocked = prereq ? 
        (achievement.prerequisite === 'first-word' ? masteredCount >= 1 :
         achievement.prerequisite === 'master-5' ? masteredCount >= 5 : false) : false
      
      if (!prereqUnlocked) {
        unlocked = false
      } else {
        // Prerequisite met, check achievement condition
        if (achievement.id === 'first-word') {
          unlocked = masteredCount >= 1
        } else if (achievement.id === 'streak-7') {
          unlocked = streak >= 7
        } else if (achievement.id === 'master-5') {
          unlocked = masteredCount >= 5
        } else if (achievement.id === 'practice-30') {
          unlocked = practiceDays >= 30
        } else if (achievement.id === 'all-mastered') {
          unlocked = masteredCount >= totalWords && totalWords > 0
        }
      }
    } else {
      // No prerequisite, check condition directly
      if (achievement.id === 'first-word') {
        unlocked = masteredCount >= 1
      }
    }
    
    return {
      ...achievement,
      unlocked
    }
  })

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const nextAchievement = achievements.find(a => !a.unlocked)

  return (
    <div className="achievements">
      <div className="achievements-header">
        <div className="achievements-summary">
          <span className="achievements-count">{unlockedCount} / {achievements.length}</span>
          <span className="achievements-label">unlocked</span>
        </div>
      </div>

      {nextAchievement && (
        <div className="next-milestone">
          {nextAchievement.emoji && (
            <div className="milestone-emoji">{nextAchievement.emoji}</div>
          )}
          <div className="milestone-content">
            <div className="milestone-name">Next: {nextAchievement.name}</div>
            <div className="milestone-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${(nextAchievement.progress / nextAchievement.target) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                {nextAchievement.progress} / {nextAchievement.target}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="achievements-grid">
        {achievements.map(achievement => {
          return (
            <div 
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              {achievement.emoji && (
                <div className="achievement-emoji">{achievement.emoji}</div>
              )}
              <div className="achievement-info">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-description">{achievement.description}</div>
                {!achievement.unlocked && (
                  <div className="achievement-progress">
                    {achievement.progress} / {achievement.target}
                  </div>
                )}
              </div>
              {achievement.unlocked && (
                <div className="achievement-badge">✓</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Achievements

