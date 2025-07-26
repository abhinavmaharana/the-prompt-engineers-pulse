import React, { useState } from 'react';
import MapDashboard from './MapDashboard';
import EventFeed from './EventFeed';
import ReportUploader from './ReportUploader';
import GeminiAICards from './GeminiAICards';
import PredictiveAlertsPanel from './PredictiveAlertsPanel';

interface FilterState {
  categories: string[];
  severity: string[];
  timeRange: string;
  showMoodMap: boolean;
}

interface DashboardLayoutProps {
  activeSection: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ activeSection }) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    severity: [],
    timeRange: '24h',
    showMoodMap: false
  });

  const [showAlertsPanel, setShowAlertsPanel] = useState(false);

  const categories = [
    { id: 'accident', label: 'Accidents', icon: '🚗', color: 'var(--status-error)' },
    { id: 'traffic', label: 'Traffic Jams', icon: '🚦', color: 'var(--status-warning)' },
    { id: 'waterlogging', label: 'Waterlogging', icon: '💧', color: 'var(--accent-blue)' },
    { id: 'construction', label: 'Road Work', icon: '🚧', color: 'var(--accent-coral)' },
    { id: 'emergency', label: 'Emergency', icon: '🚨', color: 'var(--status-error)' },
  ];

  const severityLevels = [
    { id: 'low', label: 'Low', color: 'var(--status-success)' },
    { id: 'medium', label: 'Medium', color: 'var(--status-warning)' },
    { id: 'high', label: 'High', color: 'var(--status-error)' },
  ];

  const timeRanges = [
    { id: '1h', label: 'Last Hour' },
    { id: '6h', label: 'Last 6 Hours' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last Week' },
  ];

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleSeverity = (severityId: string) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity.includes(severityId)
        ? prev.severity.filter(id => id !== severityId)
        : [...prev.severity, severityId]
    }));
  };

  if (activeSection === 'mood') {
    return (
      <div className="flex-1 relative">
        <MapDashboard showMoodMap={true} />
        <ReportUploader />
      </div>
    );
  }

  if (activeSection === 'reports') {
    return (
      <div className="flex-1 flex">
        <div className="flex-1">
          <MapDashboard />
        </div>
        <div className="w-80 xl:w-96 border-l border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <EventFeed />
        </div>
        <ReportUploader />
      </div>
    );
  }

  if (activeSection === 'alerts') {
    return (
      <div className="flex-1 flex flex-col">
        {/* Alerts Section Header */}
        <div className="bg-[var(--bg-tertiary)] border-b border-[var(--border-light)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)] flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Intelligence Center</h1>
                <p className="text-[var(--text-secondary)]">Powered by Gemini AI • Real-time predictions and insights</p>
              </div>
            </div>
            <button
              onClick={() => setShowAlertsPanel(true)}
              className="px-4 py-2 bg-gradient-to-r from-[var(--accent-coral)] to-[var(--status-error)] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔮</span>
              <span>Predictive Alerts</span>
            </button>
          </div>
        </div>

        {/* AI Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <GeminiAICards maxCards={8} showFilters={true} />
          </div>
        </div>

        {/* Predictive Alerts Panel */}
        <PredictiveAlertsPanel 
          isOpen={showAlertsPanel} 
          onClose={() => setShowAlertsPanel(false)}
          position="right"
        />
        
        <ReportUploader />
      </div>
    );
  }

  // Default Dashboard view
  return (
    <div className="flex-1 flex flex-col">
      {/* Filters Bar */}
      <div className="bg-[var(--bg-tertiary)] border-b border-[var(--border-light)] px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Categories:</span>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      filters.categories.includes(category.id)
                        ? 'bg-[var(--accent-violet)] text-white shadow-md'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Severity:</span>
              <div className="flex gap-2">
                {severityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => toggleSeverity(level.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      filters.severity.includes(level.id)
                        ? 'text-white shadow-md'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]'
                    }`}
                    style={{
                      backgroundColor: filters.severity.includes(level.id) ? level.color : undefined
                    }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Time:</span>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]"
              >
                {timeRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood Map Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, showMoodMap: !prev.showMoodMap }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filters.showMoodMap
                  ? 'bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-violet)] text-white shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]'
              }`}
            >
              <span>🎭</span>
              <span>Mood Map</span>
            </button>

            {/* AI Insights Quick Access */}
            <button
              onClick={() => setShowAlertsPanel(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-blue)] text-white shadow-md hover:shadow-lg"
            >
              <span>🤖</span>
              <span>AI Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <MapDashboard 
            filters={filters}
            showMoodMap={filters.showMoodMap}
          />
        </div>

        {/* Event Feed */}
        <div className="w-80 xl:w-96 border-l border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <EventFeed filters={filters} />
        </div>
      </div>

      {/* Predictive Alerts Panel */}
      <PredictiveAlertsPanel 
        isOpen={showAlertsPanel} 
        onClose={() => setShowAlertsPanel(false)}
        position="right"
      />

      {/* Floating Report Button */}
      <ReportUploader />
    </div>
  );
};

export default DashboardLayout; 