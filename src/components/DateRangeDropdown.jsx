import React, { useState, useRef, useEffect } from 'react'
import './DateRangeDropdown.css'

function DateRangeDropdown({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="date-range-dropdown" ref={dropdownRef}>
      <button
        className="date-range-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selectedOption.label}</span>
        <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 9L1 4h10z" fill="#000" />
        </svg>
      </button>

      {isOpen && (
        <div className="date-range-dropdown-menu">
          {options.map((option, idx) => (
            <button
              key={option.value}
              className={`dropdown-option ${value === option.value ? 'selected' : ''} ${idx === options.length - 1 ? 'last' : ''}`}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DateRangeDropdown

