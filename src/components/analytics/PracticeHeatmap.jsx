import React, { useMemo } from 'react'
import './PracticeHeatmap.css'

function PracticeHeatmap({ practiceSessions, dateRange }) {
  const { heatmapData, weeks, maxMinutes, daysBack, squareSize } = useMemo(() => {
    const now = new Date()
    const days = parseInt(dateRange)
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    // Calculate square size based on number of days
    // 7 days: large squares (40px), 30 days: medium (24px), 90 days: small (10px)
    let size
    if (days === 7) {
      size = 40
    } else if (days === 30) {
      size = 24
    } else {
      size = 10
    }
    
    // Group sessions by date
    const sessionsByDate = {}
    practiceSessions.forEach(session => {
      const sessionDate = new Date(session.date)
      if (sessionDate >= startDate) {
        const dateKey = sessionDate.toISOString().split('T')[0]
        if (!sessionsByDate[dateKey]) {
          sessionsByDate[dateKey] = { minutes: 0, words: new Set() }
        }
        sessionsByDate[dateKey].minutes += Math.floor((session.timeSpent || 0) / 60)
        sessionsByDate[dateKey].words.add(session.wordIndex)
      }
    })

    // Create array of all dates in range
    const dates = []
    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dates.unshift(date.toISOString().split('T')[0])
    }

    const data = dates.map(date => ({
      date,
      minutes: sessionsByDate[date]?.minutes || 0,
      wordCount: sessionsByDate[date]?.words.size || 0
    }))

    // Organize into weeks (7 days per column) - except for 7 days, show in single row
    const weeksData = []
    if (days === 7) {
      // For 7 days, show as single row
      weeksData.push(data)
    } else {
      // For other periods, organize into weeks
      for (let i = 0; i < data.length; i += 7) {
        weeksData.push(data.slice(i, i + 7))
      }
    }

    // Get max minutes for intensity calculation
    const max = Math.max(...data.map(d => d.minutes), 1)

    return {
      heatmapData: data,
      weeks: weeksData,
      maxMinutes: max,
      daysBack: days,
      squareSize: size
    }
  }, [practiceSessions, dateRange])

  const getIntensity = (minutes) => {
    if (minutes === 0) return 0
    const ratio = minutes / maxMinutes
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    return 4
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDayLabel = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  const getMonthLabel = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  const isSingleRow = daysBack === 7

  return (
    <div className="practice-heatmap">
      <h2 className="section-title">Practice Heatmap</h2>
      <div className="heatmap-container">
        <div className={`heatmap-wrapper ${isSingleRow ? 'single-row' : ''}`}>
          {!isSingleRow && (
            <div className="heatmap-content">
                {/* Month labels */}
                <div className="heatmap-month-labels">
                  {weeks.map((week, weekIdx) => {
                    if (!week || week.length === 0) return <div key={weekIdx} className="month-label" />
                    const firstDay = week[0]
                    const month = getMonthLabel(firstDay.date)
                    const prevWeek = weeks[weekIdx - 1]
                    const prevMonth = prevWeek && prevWeek[0] ? getMonthLabel(prevWeek[0].date) : null
                    const showMonth = weekIdx === 0 || prevMonth !== month
                    return (
                      <div key={weekIdx} className="month-label">
                        {showMonth && <span>{month}</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Week columns */}
                <div className="heatmap-weeks">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="heatmap-week">
                      {week.map((day, dayIdx) => {
                        const intensity = getIntensity(day.minutes)
                        return (
                          <div
                            key={dayIdx}
                            className={`heatmap-day intensity-${intensity}`}
                            style={{ width: `${squareSize}px`, height: `${squareSize}px` }}
                            title={`${formatDate(day.date)}: ${day.minutes} minutes, ${day.wordCount} word${day.wordCount !== 1 ? 's' : ''} practiced`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
          )}

          {isSingleRow && (
            <div className="heatmap-single-row">
              {heatmapData.map((day, idx) => {
                const intensity = getIntensity(day.minutes)
                const date = new Date(day.date)
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                return (
                  <div key={idx} className="heatmap-day-wrapper">
                    <div className="day-label-top">{dayName}</div>
                    <div
                      className={`heatmap-day intensity-${intensity}`}
                      style={{ width: `${squareSize}px`, height: `${squareSize}px` }}
                      title={`${formatDate(day.date)}: ${day.minutes} minutes, ${day.wordCount} word${day.wordCount !== 1 ? 's' : ''} practiced`}
                    />
                    <div className="day-label-bottom">{date.getDate()}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Legend - always small size */}
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <div className="legend-colors">
            <div className="legend-color intensity-0" />
            <div className="legend-color intensity-1" />
            <div className="legend-color intensity-2" />
            <div className="legend-color intensity-3" />
            <div className="legend-color intensity-4" />
          </div>
          <span className="legend-label">More</span>
        </div>
      </div>
    </div>
  )
}

export default PracticeHeatmap

