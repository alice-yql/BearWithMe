import React from 'react'
import './AchievementTeaser.css'
import { Icons } from '../utils/icons'

function AchievementTeaser({ wordData, practiceHistory, streak, onNavigate }) {
  const masteredCount = wordData.filter(w => w.status === 'mastered').length
  const totalWords = wordData.length
  const practiceDays = practiceHistory.length

  // Define achievements with prerequisites (same logic as Achievements component)
  const allAchievements = [
    {
      id: 'first-word',
      name: 'First Steps',
      description: 'Master your first word',
      emoji: '⭐',
      icon: null,
      progress: Math.min(masteredCount, 1),
      target: 1,
      prerequisite: null
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Practice for 7 days straight',
      emoji: '🔥',
      icon: null,
      progress: Math.min(streak, 7),
      target: 7,
      prerequisite: 'first-word'
    },
    {
      id: 'master-5',
      name: 'Word Master',
      description: 'Master 5 words',
      emoji: '🏆',
      icon: null,
      progress: Math.min(masteredCount, 5),
      target: 5,
      prerequisite: 'first-word'
    },
    {
      id: 'practice-30',
      name: 'Dedicated Learner',
      description: 'Practice for 30 days',
      emoji: '🎖️',
      icon: null,
      progress: Math.min(practiceDays, 30),
      target: 30,
      prerequisite: 'first-word'
    },
    {
      id: 'all-mastered',
      name: 'Perfect Score',
      description: 'Master all words',
      emoji: '💯',
      icon: null,
      progress: masteredCount,
      target: totalWords,
      prerequisite: 'master-5'
    }
  ]
  
  // Calculate unlocked status with prerequisites
  const achievements = allAchievements.map(achievement => {
    let unlocked = false
    
    // Check if prerequisite is met
    if (achievement.prerequisite) {
      const prereqUnlocked = achievement.prerequisite === 'first-word' ? masteredCount >= 1 :
                            achievement.prerequisite === 'master-5' ? masteredCount >= 5 : false
      
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
      // No prerequisite
      if (achievement.id === 'first-word') {
        unlocked = masteredCount >= 1
      }
    }
    
    return {
      ...achievement,
      unlocked
    }
  })

  const nextAchievement = achievements.find(a => !a.unlocked)

  if (!nextAchievement) {
    return null // All achievements unlocked
  }

  const progressPercent = (nextAchievement.progress / nextAchievement.target) * 100
  const remaining = nextAchievement.target - nextAchievement.progress
  
  return (
    <div className="achievement-teaser">
      {nextAchievement.emoji && (
        <div className="teaser-emoji">{nextAchievement.emoji}</div>
      )}
      <div className="teaser-content">
        <div className="teaser-title">Next Achievement</div>
        <div className="teaser-name">{nextAchievement.name}</div>
        <div className="teaser-progress">
          <div className="teaser-progress-bar">
            <div 
              className="teaser-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="teaser-progress-text">
            {nextAchievement.progress} / {nextAchievement.target}
          </div>
        </div>
        <div className="teaser-message">
          {remaining === 1 ? '1 more' : `${remaining} more`} {getProgressUnit(nextAchievement.id)}{remaining !== 1 ? 's' : ''} needed for {nextAchievement.name}
        </div>
      </div>
      <button 
        className="teaser-view-all"
        onClick={() => onNavigate && onNavigate('achievements')}
        title="View All Achievements"
      >
        Learn More →
      </button>
    </div>
  )
}

function getProgressUnit(achievementId) {
  if (achievementId === 'streak-7' || achievementId === 'practice-30') {
    return 'day'
  }
  if (achievementId === 'master-5' || achievementId === 'first-word' || achievementId === 'all-mastered') {
    return 'word'
  }
  return ''
}

export default AchievementTeaser

