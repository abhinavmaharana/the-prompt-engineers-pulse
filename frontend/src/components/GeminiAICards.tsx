import React, { useState, useEffect } from 'react';

interface AIInsight {
  id: string;
  type: 'traffic' | 'weather' | 'event' | 'prediction' | 'analysis';
  title: string;
  summary: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  timeframe: string;
  sources: string[];
  location?: string;
  createdAt: Date;
  tags: string[];
}

interface GeminiAICardsProps {
  maxCards?: number;
  showFilters?: boolean;
}

const GeminiAICards: React.FC<GeminiAICardsProps> = ({ maxCards = 6, showFilters = true }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Mock data - in production, this would come from Firestore or API
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'prediction',
          title: 'Traffic Surge Expected',
          summary: 'High traffic volume predicted on Outer Ring Road between 5-7 PM due to cricket match at Chinnaswamy Stadium. Alternate routes via Bellary Road recommended.',
          confidence: 87,
          severity: 'medium',
          timeframe: 'Next 2 hours',
          sources: ['Traffic cameras', 'Event data', 'Historical patterns'],
          location: 'Outer Ring Road',
          createdAt: new Date(),
          tags: ['traffic', 'sports-event', 'prediction']
        },
        {
          id: '2',
          type: 'weather',
          title: 'Heavy Rain Alert',
          summary: 'Intense rainfall predicted in Electronic City and Whitefield areas. Waterlogging expected on major roads including NICE Road and ORR.',
          confidence: 94,
          severity: 'high',
          timeframe: 'Next 1 hour',
          sources: ['Weather stations', 'Satellite data', 'IMD forecasts'],
          location: 'Electronic City, Whitefield',
          createdAt: new Date(),
          tags: ['weather', 'waterlogging', 'alert']
        },
        {
          id: '3',
          type: 'analysis',
          title: 'Peak Hour Congestion Analysis',
          summary: 'Analysis of morning rush hour shows 23% increase in congestion compared to last week. Primary bottlenecks identified at Silk Board and Hebbal flyovers.',
          confidence: 76,
          severity: 'medium',
          timeframe: 'Current',
          sources: ['Traffic sensors', 'Mobile data', 'Historical analysis'],
          location: 'Silk Board, Hebbal',
          createdAt: new Date(),
          tags: ['analysis', 'congestion', 'peak-hours']
        },
        {
          id: '4',
          type: 'event',
          title: 'Metro Service Disruption',
          summary: 'Namma Metro Blue Line experiencing 15-minute delays due to technical issues at Majestic station. Purple Line operating normally.',
          confidence: 100,
          severity: 'medium',
          timeframe: 'Current',
          sources: ['BMRCL official', 'Station reports', 'Passenger feedback'],
          location: 'Majestic Station',
          createdAt: new Date(),
          tags: ['metro', 'disruption', 'public-transport']
        },
        {
          id: '5',
          type: 'traffic',
          title: 'Accident Impact Assessment',
          summary: 'Multi-vehicle accident on Hosur Road causing 3km backup. Emergency services on scene. Traffic being diverted via Bannerghatta Road.',
          confidence: 91,
          severity: 'high',
          timeframe: 'Current',
          sources: ['Emergency services', 'Traffic police', 'CCTV footage'],
          location: 'Hosur Road',
          createdAt: new Date(),
          tags: ['accident', 'emergency', 'traffic-diversion']
        },
        {
          id: '6',
          type: 'prediction',
          title: 'Air Quality Forecast',
          summary: 'Air quality expected to deteriorate to "Moderate" levels by evening due to reduced wind speed and increased vehicular emissions during peak hours.',
          confidence: 68,
          severity: 'low',
          timeframe: 'Next 6 hours',
          sources: ['Air quality sensors', 'Weather models', 'Emission data'],
          location: 'City-wide',
          createdAt: new Date(),
          tags: ['air-quality', 'health', 'forecast']
        }
      ];
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInsights = selectedType === 'all' 
    ? insights.slice(0, maxCards)
    : insights.filter(insight => insight.type === selectedType).slice(0, maxCards);

  const getTypeIcon = (type: string): string => {
    const icons = {
      'prediction': '🔮',
      'weather': '🌦️',
      'event': '📢',
      'traffic': '🚦',
      'analysis': '📊'
    };
    return icons[type as keyof typeof icons] || '🤖';
  };

  const getTypeColor = (type: string): string => {
    const colors = {
      'prediction': 'var(--accent-violet)',
      'weather': 'var(--accent-blue)',
      'event': 'var(--accent-coral)',
      'traffic': 'var(--status-warning)',
      'analysis': 'var(--accent-emerald)'
    };
    return colors[type as keyof typeof colors] || 'var(--accent-violet)';
  };

  const getSeverityColor = (severity: string): string => {
    const colors = {
      'high': 'var(--status-error)',
      'medium': 'var(--status-warning)',
      'low': 'var(--status-success)'
    };
    return colors[severity as keyof typeof colors] || 'var(--accent-violet)';
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-start space-x-4">
              <div className="loading-shimmer w-12 h-12 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="loading-shimmer h-4 w-3/4 rounded"></div>
                <div className="loading-shimmer h-3 w-full rounded"></div>
                <div className="loading-shimmer h-3 w-2/3 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)] flex items-center justify-center">
            <span className="text-white text-lg">🧠</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Gemini AI Insights</h2>
            <p className="text-sm text-[var(--text-secondary)]">Real-time city intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[var(--status-success)] rounded-full pulse-animation"></div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {filteredInsights.length} insights
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              selectedType === 'all'
                ? 'bg-[var(--accent-violet)] text-white shadow-md'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]'
            }`}
          >
            All Types
          </button>
          {['prediction', 'weather', 'event', 'traffic', 'analysis'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                selectedType === type
                  ? 'text-white shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]'
              }`}
              style={{
                backgroundColor: selectedType === type ? getTypeColor(type) : undefined
              }}
            >
              <span>{getTypeIcon(type)}</span>
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      )}

      {/* AI Cards */}
      <div className="space-y-4">
        {filteredInsights.map((insight, index) => (
          <div
            key={insight.id}
            className={`card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${
              expandedCard === insight.id ? 'shadow-xl' : ''
            }`}
            style={{ 
              borderLeftColor: getTypeColor(insight.type),
              transform: `translateY(${index * 2}px)`,
              zIndex: filteredInsights.length - index
            }}
            onClick={() => setExpandedCard(expandedCard === insight.id ? null : insight.id)}
          >
            <div className="flex items-start space-x-4">
              {/* Type Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ backgroundColor: getTypeColor(insight.type) }}
              >
                {getTypeIcon(insight.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                      {insight.title}
                    </h3>
                    {insight.location && (
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        📍 {insight.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSeverityColor(insight.severity) }}
                    ></div>
                    <span className="text-xs font-medium text-[var(--text-tertiary)]">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                  {insight.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {insight.timeframe}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatTimeAgo(insight.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[var(--accent-violet)] font-medium">
                      Gemini AI
                    </span>
                    <div className={`transform transition-transform duration-200 ${
                      expandedCard === insight.id ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCard === insight.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-light)] space-y-3 slide-up-enter">
                    {/* Tags */}
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-tertiary)] text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sources */}
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">Data Sources</h4>
                      <div className="space-y-1">
                        {insight.sources.map((source, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-[var(--accent-violet)] rounded-full"></div>
                            <span className="text-xs text-[var(--text-secondary)]">{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {insights.length > maxCards && (
        <div className="text-center pt-4">
          <button className="px-6 py-3 bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-blue)] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200">
            View All Insights ({insights.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default GeminiAICards; 