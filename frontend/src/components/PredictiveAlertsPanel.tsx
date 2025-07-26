import React, { useState, useEffect } from 'react';

interface PredictiveAlert {
  id: string;
  type: 'traffic' | 'weather' | 'infrastructure' | 'event' | 'emergency';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  timeframe: string;
  estimatedDuration: string;
  affectedAreas: string[];
  recommendedActions: string[];
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface PredictiveAlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
}

const PredictiveAlertsPanel: React.FC<PredictiveAlertsPanelProps> = ({ 
  isOpen, 
  onClose, 
  position = 'right' 
}) => {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Mock data - in production, this would come from AI prediction service
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate AI prediction loading
      setTimeout(() => {
        const mockAlerts: PredictiveAlert[] = [
          {
            id: '1',
            type: 'traffic',
            title: 'Major Congestion Expected',
            description: 'Cricket match at Chinnaswamy Stadium will cause severe traffic on Outer Ring Road',
            severity: 'high',
            probability: 92,
            timeframe: 'In 3 hours',
            estimatedDuration: '4-6 hours',
            affectedAreas: ['Outer Ring Road', 'MG Road', 'Brigade Road'],
            recommendedActions: [
              'Use Bellary Road as alternate route',
              'Avoid area between 5-9 PM',
              'Consider Metro/Bus for travel'
            ],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
            isActive: true
          },
          {
            id: '2',
            type: 'weather',
            title: 'Flash Flood Risk',
            description: 'Heavy rainfall predicted to cause waterlogging in low-lying areas',
            severity: 'critical',
            probability: 87,
            timeframe: 'In 45 minutes',
            estimatedDuration: '2-3 hours',
            affectedAreas: ['Electronic City', 'Silk Board', 'Bommanahalli'],
            recommendedActions: [
              'Avoid low-lying roads',
              'Stay indoors if possible',
              'Emergency contacts ready'
            ],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
            isActive: true
          },
          {
            id: '3',
            type: 'infrastructure',
            title: 'Power Grid Strain Anticipated',
            description: 'High demand expected during peak hours may cause localized outages',
            severity: 'medium',
            probability: 73,
            timeframe: 'In 2 hours',
            estimatedDuration: '1-2 hours',
            affectedAreas: ['Whitefield', 'Electronic City', 'HSR Layout'],
            recommendedActions: [
              'Charge devices in advance',
              'Backup power arrangements',
              'Delay non-essential electricity usage'
            ],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
            isActive: true
          },
          {
            id: '4',
            type: 'event',
            title: 'Metro Service Reduction',
            description: 'Planned maintenance will reduce Purple Line frequency by 50%',
            severity: 'medium',
            probability: 100,
            timeframe: 'Tomorrow 10 AM',
            estimatedDuration: '6 hours',
            affectedAreas: ['Purple Line stations', 'Connecting bus routes'],
            recommendedActions: [
              'Plan alternate transport',
              'Allow extra travel time',
              'Use Blue/Green lines where possible'
            ],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isActive: true
          },
          {
            id: '5',
            type: 'emergency',
            title: 'Air Quality Deterioration',
            description: 'Poor air quality expected due to weather conditions and increased traffic',
            severity: 'medium',
            probability: 68,
            timeframe: 'Tomorrow morning',
            estimatedDuration: '12 hours',
            affectedAreas: ['City-wide', 'Especially heavy traffic areas'],
            recommendedActions: [
              'Wear N95 masks outdoors',
              'Limit outdoor activities',
              'Keep windows closed'
            ],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
            isActive: true
          }
        ];
        setAlerts(mockAlerts);
        setLoading(false);
      }, 800);
    }
  }, [isOpen]);

  const filteredAlerts = selectedSeverity === 'all' 
    ? alerts.filter(alert => alert.isActive)
    : alerts.filter(alert => alert.isActive && alert.severity === selectedSeverity);

  const getTypeIcon = (type: string): string => {
    const icons = {
      'traffic': '🚦',
      'weather': '🌦️',
      'infrastructure': '⚡',
      'event': '📅',
      'emergency': '🚨'
    };
    return icons[type as keyof typeof icons] || '⚠️';
  };

  const getSeverityColor = (severity: string): string => {
    const colors = {
      'critical': 'var(--status-error)',
      'high': '#ff6b35',
      'medium': 'var(--status-warning)',
      'low': 'var(--status-info)'
    };
    return colors[severity as keyof typeof colors] || 'var(--accent-violet)';
  };

  const getSeverityBg = (severity: string): string => {
    const colors = {
      'critical': 'bg-red-50 border-red-200',
      'high': 'bg-orange-50 border-orange-200',
      'medium': 'bg-yellow-50 border-yellow-200',
      'low': 'bg-blue-50 border-blue-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-purple-50 border-purple-200';
  };

  const formatTimeframe = (timeframe: string): string => {
    return timeframe;
  };

  const getProbabilityColor = (probability: number): string => {
    if (probability >= 85) return 'var(--status-error)';
    if (probability >= 70) return 'var(--status-warning)';
    return 'var(--status-info)';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 ${position}-0 h-full w-96 xl:w-[28rem] bg-[var(--bg-tertiary)] shadow-2xl z-50 slide-up-enter flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-light)] bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-blue)] text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-lg">🔮</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Predictive Alerts</h2>
                <p className="text-sm opacity-90">AI-powered future disruptions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedSeverity === 'all'
                  ? 'bg-white text-[var(--accent-violet)] shadow-md'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              All Levels
            </button>
            {['critical', 'high', 'medium', 'low'].map((severity) => (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  selectedSeverity === severity
                    ? 'bg-white text-[var(--accent-violet)] shadow-md'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            // Loading State
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start space-x-3">
                    <div className="loading-shimmer w-10 h-10 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="loading-shimmer h-4 w-3/4 rounded"></div>
                      <div className="loading-shimmer h-3 w-full rounded"></div>
                      <div className="loading-shimmer h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No alerts for selected severity
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                AI is monitoring for potential disruptions
              </p>
            </div>
          ) : (
            // Alerts List
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`card p-4 border-l-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${getSeverityBg(alert.severity)}`}
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {getTypeIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-[var(--text-primary)] text-sm leading-tight">
                        {alert.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-2">
                        <span 
                          className="text-xs font-bold px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: getProbabilityColor(alert.probability) }}
                        >
                          {alert.probability}%
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-3">
                      {alert.description}
                    </p>

                    {/* Time Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-[var(--text-tertiary)]">
                          ⏰ {formatTimeframe(alert.timeframe)}
                        </span>
                        <span className="text-[var(--text-tertiary)]">
                          ⏳ {alert.estimatedDuration}
                        </span>
                      </div>
                      <div className={`transform transition-transform duration-200 ${
                        expandedAlert === alert.id ? 'rotate-180' : ''
                      }`}>
                        <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedAlert === alert.id && (
                      <div className="mt-4 pt-4 border-t border-[var(--border-light)] space-y-3 slide-up-enter">
                        {/* Affected Areas */}
                        <div>
                          <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                            Affected Areas
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {alert.affectedAreas.map((area) => (
                              <span
                                key={area}
                                className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-md"
                              >
                                📍 {area}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                            Recommended Actions
                          </h4>
                          <div className="space-y-1">
                            {alert.recommendedActions.map((action, idx) => (
                              <div key={idx} className="flex items-start space-x-2">
                                <div className="w-1 h-1 bg-[var(--accent-violet)] rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-xs text-[var(--text-secondary)]">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <button className="flex-1 px-3 py-2 bg-[var(--accent-violet)] text-white text-xs rounded-lg hover:shadow-md transition-all">
                            Set Reminder
                          </button>
                          <button className="flex-1 px-3 py-2 border border-[var(--border-medium)] text-[var(--text-secondary)] text-xs rounded-lg hover:bg-[var(--bg-secondary)] transition-all">
                            Share Alert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--status-success)] rounded-full pulse-animation"></div>
              <span className="text-[var(--text-secondary)]">
                AI monitoring active
              </span>
            </div>
            <span className="text-[var(--text-tertiary)]">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictiveAlertsPanel; 