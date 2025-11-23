import React, { useState } from 'react'
import './AnalyticsPage.css'
import DateRangeDropdown from './DateRangeDropdown'
import PerformanceOverview from './analytics/PerformanceOverview'
import PracticeHeatmap from './analytics/PracticeHeatmap'
import GrowthTracking from './analytics/GrowthTracking'
import WordsNeedingAttention from './analytics/WordsNeedingAttention'

function AnalyticsPage({ child, wordData, practiceHistory, practiceSessions, totalPracticeTime, onNavigate }) {
  const [dateRange, setDateRange] = useState('30') // '7', '30', '90'

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' }
  ]

  const handleExportReport = () => {
    // TODO: Implement PDF export
    alert('Export functionality coming soon!')
  }

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <div className="analytics-header-info">
            <h1 className="analytics-page-title">Progress Analytics</h1>
            <p className="analytics-subtitle">Track progress and identify areas for improvement</p>
          </div>
        </div>
        <div className="analytics-header-right">
          <DateRangeDropdown
            value={dateRange}
            onChange={setDateRange}
            options={dateRangeOptions}
          />
          <button className="export-btn" onClick={handleExportReport}>
            Export Report
          </button>
        </div>
      </div>

      {/* Section 1: Performance Overview */}
      <PerformanceOverview
        wordData={wordData}
        practiceHistory={practiceHistory}
        practiceSessions={practiceSessions}
        totalPracticeTime={totalPracticeTime}
        dateRange={dateRange}
      />

      {/* Section 2: Practice Heatmap */}
      <PracticeHeatmap
        practiceSessions={practiceSessions}
        dateRange={dateRange}
      />

      {/* Section 3: Growth Tracking */}
      <GrowthTracking
        practiceSessions={practiceSessions}
        wordData={wordData}
        dateRange={dateRange}
      />

      {/* Section 4: Words Needing Attention */}
      <WordsNeedingAttention
        wordData={wordData}
        dateRange={dateRange}
        onNavigate={onNavigate}
      />
    </div>
  )
}

export default AnalyticsPage

