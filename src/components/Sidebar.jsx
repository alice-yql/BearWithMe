import React, { useState } from 'react'
import './Sidebar.css'

function Sidebar({ currentView, onNavigate, onSwitchProfile }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'word-library', label: 'Word Library', icon: '📚' },
    { id: 'analytics', label: 'Progress Analytics', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ]

  return (
    <aside 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-content">
        <div className="sidebar-nav-items">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {isExpanded && <span className="sidebar-label">{item.label}</span>}
            </button>
          ))}
          {onSwitchProfile && (
            <button
              className="sidebar-item sidebar-switch-profile"
              onClick={onSwitchProfile}
              title="Select Child"
            >
              <span className="sidebar-icon">👤</span>
              {isExpanded && <span className="sidebar-label">Select Child</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

