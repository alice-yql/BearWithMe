import React, { useMemo, useState } from 'react'
import './GrowthTracking.css'

function GrowthTracking({ practiceSessions, wordData, dateRange }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const chartData = useMemo(() => {
    const now = new Date()
    const daysBack = parseInt(dateRange)
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    
    // Group sessions by date
    const dailyData = {}
    practiceSessions.forEach(session => {
      const sessionDate = new Date(session.date)
      if (sessionDate >= startDate) {
        const dateKey = sessionDate.toISOString().split('T')[0]
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { accuracies: [], date: dateKey }
        }
        dailyData[dateKey].accuracies.push(session.accuracy)
      }
    })

    // Calculate average accuracy per day
    const dataPoints = Object.values(dailyData)
      .map(item => ({
        date: item.date,
        accuracy: Math.round(item.accuracies.reduce((a, b) => a + b, 0) / item.accuracies.length)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    return dataPoints
  }, [practiceSessions, dateRange])

  const maxAccuracy = Math.max(...chartData.map(d => d.accuracy), 100)
  const minAccuracy = Math.min(...chartData.map(d => d.accuracy), 0)

  const getYPosition = (accuracy) => {
    const range = maxAccuracy - minAccuracy || 100
    return 100 - ((accuracy - minAccuracy) / range) * 100
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Generate SVG path for line chart
  const pathData = chartData.length > 0
    ? chartData.map((point, idx) => {
        const x = (idx / (chartData.length - 1 || 1)) * 100
        const y = getYPosition(point.accuracy)
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')
    : ''

  const handlePointHover = (event, point) => {
    const rect = event.currentTarget.closest('.chart-wrapper').getBoundingClientRect()
    setHoveredPoint(point)
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
  }

  const handlePointLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <div className="growth-tracking">
      <h2 className="section-title">Growth Tracking</h2>
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Accuracy Over Time</h3>
        </div>
        {chartData.length === 0 ? (
          <div className="empty-state">
            <p>Start practicing to see your accuracy trends!</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Trend line */}
              <path
                d={pathData}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                className="trend-line"
              />
              
              {/* Data points */}
              {chartData.map((point, idx) => {
                const x = (idx / (chartData.length - 1 || 1)) * 100
                const y = getYPosition(point.accuracy)
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="#3B82F6"
                    className="data-point"
                    onMouseEnter={(e) => handlePointHover(e, point)}
                    onMouseLeave={handlePointLeave}
                  />
                )
              })}
            </svg>
            
            {/* Tooltip */}
            {hoveredPoint && (
              <div 
                className="chart-tooltip"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y - 60}px`
                }}
              >
                <div className="tooltip-date">{formatDate(hoveredPoint.date)}</div>
                <div className="tooltip-accuracy">{hoveredPoint.accuracy}% accuracy</div>
              </div>
            )}
            
            {/* Y-axis labels */}
            <div className="y-axis-labels">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            
            {/* X-axis labels */}
            <div className="x-axis-labels">
              {chartData.length > 0 && (
                <>
                  <span>{formatDate(chartData[0].date)}</span>
                  {chartData.length > 1 && (
                    <span>{formatDate(chartData[chartData.length - 1].date)}</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GrowthTracking
