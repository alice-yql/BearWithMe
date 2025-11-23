import React, { useState, useRef, useEffect } from 'react'
import './NavDropdown.css'
import { Icons } from '../utils/icons'

function NavDropdown({ currentView, onNavigate, onSwitchProfile }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: Icons.Dashboard },
    { id: 'word-library', label: 'Word Library', Icon: Icons.WordLibrary },
    { id: 'analytics', label: 'Progress Analytics', Icon: Icons.Analytics },
    { id: 'achievements', label: 'Achievements', Icon: Icons.Achievements }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNavClick = (viewId) => {
    onNavigate(viewId)
    setIsOpen(false)
  }

  const handleSwitchProfile = () => {
    if (onSwitchProfile) {
      onSwitchProfile()
      setIsOpen(false)
    }
  }

  return (
    <div 
      className="nav-dropdown" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className="nav-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Navigation menu"
      >
        <span className="nav-menu-icon">☰</span>
      </button>
      
      {isOpen && (
        <div className="nav-dropdown-menu">
          {navItems.map(item => {
            const Icon = item.Icon
            return (
              <button
                key={item.id}
                className={`nav-dropdown-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {Icon && <Icon className="nav-item-icon" />}
                <span className="nav-item-label">{item.label}</span>
              </button>
            )
          })}
          {onSwitchProfile && (
            <>
              <div className="nav-dropdown-divider" />
              <button
                className="nav-dropdown-item nav-switch-profile"
                onClick={handleSwitchProfile}
              >
                <Icons.User className="nav-item-icon" />
                <span className="nav-item-label">Select Child</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default NavDropdown

