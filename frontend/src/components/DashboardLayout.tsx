import React, { useState } from 'react';
import MapDashboard from './MapDashboard';
import EventFeed from './EventFeed';
import ReportUploader from './ReportUploader';

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
      <div className="flex-1 relative">
        <MapDashboard />
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setShowAlertsPanel(!showAlertsPanel)}
            className="btn-primary flex items-center space-x-2"
          >
            <span>🤖</span>
            <span>AI Alerts</span>
          </button>
        </div>
        {showAlertsPanel && <AIAlertsPanel onClose={() => setShowAlertsPanel(false)} />}
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

      {/* Floating Report Button */}
      <ReportUploader />
    </div>
  );
};

// AI Alerts Panel Component
const AIAlertsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const alerts = [
    {
      id: 1,
      type: 'prediction',
      title: 'Traffic Surge Predicted',
      description: 'High traffic expected on Outer Ring Road due to cricket match at Chinnaswamy Stadium',
      confidence: 87,
      timeframe: 'Next 2 hours',
      severity: 'medium',
    },
    {
      id: 2,
      type: 'weather',
      title: 'Rain Alert',
      description: 'Heavy rainfall predicted in Electronic City area. Waterlogging likely.',
      confidence: 94,
      timeframe: 'Next 1 hour',
      severity: 'high',
    },
    {
      id: 3,
      type: 'event',
      title: 'Mass Transit Disruption',
      description: 'Namma Metro Blue Line experiencing delays due to technical issues',
      confidence: 100,
      timeframe: 'Current',
      severity: 'high',
    },
  ];

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-[var(--bg-tertiary)] border-l border-[var(--border-light)] shadow-xl slide-up-enter z-30">
      <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🤖</span>
          <h3 className="font-semibold text-[var(--text-primary)]">AI Alerts</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className="card p-4 hover:shadow-md">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-[var(--status-error)]' :
                  alert.severity === 'medium' ? 'bg-[var(--status-warning)]' :
                  'bg-[var(--status-success)]'
                }`}></div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">{alert.title}</h4>
              </div>
              <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-1 rounded">
                {alert.confidence}% confidence
              </span>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {alert.description}
            </p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-tertiary)]">{alert.timeframe}</span>
              <span className="text-[var(--accent-violet)] font-medium">Gemini AI</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardLayout; 