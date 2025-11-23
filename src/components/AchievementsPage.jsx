import React from 'react'
import Achievements from './Achievements'
import './AchievementsPage.css'

function AchievementsPage({ wordData, practiceHistory, streak }) {
  return (
    <div className="achievements-page">
      <div className="page-header">
        <h1 className="page-title">Achievements</h1>
        <p className="page-subtitle">Track your child's learning milestones and celebrate their progress!</p>
      </div>
      <Achievements 
        wordData={wordData}
        practiceHistory={practiceHistory}
        streak={streak}
      />
    </div>
  )
}

export default AchievementsPage

