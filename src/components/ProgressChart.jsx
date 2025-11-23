import React from 'react'
import './ProgressChart.css'

function ProgressChart({ practiceSessions }) {
  // Group sessions by date and calculate daily accuracy
  const dailyData = practiceSessions.reduce((acc, session) => {
    const date = new Date(session.date).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { date, accuracies: [], count: 0 }
    }
    acc[date].accuracies.push(session.accuracy)
    acc[date].count++
    return acc
  }, {})

  const chartData = Object.values(dailyData)
    .map(item => ({
      date: item.date,
      avgAccuracy: item.accuracies.reduce((a, b) => a + b, 0) / item.accuracies.length,
      count: item.count
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7) // Last 7 days

  if (chartData.length === 0) {
    return (
      <div className="progress-chart">
        <h3 className="section-title">Progress Trend</h3>
        <div className="empty-state">
          <p>Start practicing to see your progress chart!</p>
        </div>
      </div>
    )
  }

  const maxAccuracy = Math.max(...chartData.map(d => d.avgAccuracy), 100)
  const minAccuracy = Math.min(...chartData.map(d => d.avgAccuracy), 0)

  return (
    <div className="progress-chart">
      <h3 className="section-title">7-Day Accuracy Trend</h3>
      <div className="chart-container">
        <div className="chart-bars">
          {chartData.map((data, idx) => {
            const height = ((data.avgAccuracy - minAccuracy) / (maxAccuracy - minAccuracy || 1)) * 100
            return (
              <div key={idx} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    title={`${Math.round(data.avgAccuracy)}% - ${data.count} sessions`}
                  >
                    <span className="chart-value">{Math.round(data.avgAccuracy)}%</span>
                  </div>
                </div>
                <div className="chart-label">
                  {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ background: 'var(--success)' }} />
            <span>Average Accuracy</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressChart

