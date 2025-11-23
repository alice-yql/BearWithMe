import React, { useState } from 'react'
import './ProfileSelection.css'

function ProfileSelection({ onSelectChild }) {
  // For now, using localStorage to store child profiles
  // In production, this would come from a backend
  const [children, setChildren] = useState(() => {
    const saved = localStorage.getItem('childProfiles')
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Emma', avatar: '👧' },
      { id: '2', name: 'Lucas', avatar: '👦' }
    ]
  })

  const handleSelect = (child) => {
    onSelectChild(child)
  }

  const handleAddNew = () => {
    const name = prompt('Enter child\'s name:')
    if (name && name.trim()) {
      const newChild = {
        id: Date.now().toString(),
        name: name.trim(),
        avatar: '👶'
      }
      const updated = [...children, newChild]
      setChildren(updated)
      localStorage.setItem('childProfiles', JSON.stringify(updated))
    }
  }

  return (
    <div className="profile-selection">
      <div className="profile-selection-container">
        <h2 className="profile-selection-title">Select a Child</h2>
        <p className="profile-selection-subtitle">Choose a profile to view progress</p>
        
        <div className="profile-grid">
          {children.map((child) => (
            <button
              key={child.id}
              className="profile-card"
              onClick={() => handleSelect(child)}
            >
              <div className="profile-avatar">{child.avatar}</div>
              <div className="profile-name">{child.name}</div>
            </button>
          ))}
          
          <button
            className="profile-card add-new"
            onClick={handleAddNew}
          >
            <div className="profile-avatar">➕</div>
            <div className="profile-name">Add New</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSelection

