import React from 'react'
import './Navigation.css'

function Navigation({ currentView, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'word-library', label: 'Word Library', icon: '📚' },
    { id: 'analytics', label: 'Progress Analytics', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ]

  return (
    <nav className="main-navigation">
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default Navigation

