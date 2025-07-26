import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Type definitions
interface EventData {
  id: string;
  category?: string;
  description?: string;
  createdAt?: Timestamp;
  severity?: string;
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface FilterState {
  categories: string[];
  severity: string[];
  timeRange: string;
  showMoodMap: boolean;
}

interface EventFeedProps {
  filters?: FilterState;
}

const EventFeed: React.FC<EventFeedProps> = ({ filters }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const eventsQuery = query(
      collection(db, 'synthesized_events'),
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to latest 50 events for performance
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData: EventData[] = [];
      snapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as EventData);
      });
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter events based on filters
  const filteredEvents = events.filter(event => {
    if (filters?.categories.length && !filters.categories.includes(event.category || '')) {
      return false;
    }
    if (filters?.severity.length && !filters.severity.includes(event.severity || '')) {
      return false;
    }
    // Add time range filtering logic here
    return true;
  });

  const getCategoryIcon = (category?: string): string => {
    const icons: Record<string, string> = {
      'Accident': '🚗',
      'Traffic Jam': '🚦',
      'Waterlogging': '💧',
      'Road Work': '🚧',
      'Emergency': '🚨',
      'Police': '👮',
      'default': '📍'
    };
    return icons[category || 'default'] || icons.default;
  };

  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      'Accident': '#ef4444',
      'Traffic Jam': '#f59e0b',
      'Waterlogging': '#06b6d4',
      'Road Work': '#f97316',
      'Emergency': '#dc2626',
      'Police': '#9c27b0',
      'default': '#8b5cf6'
    };
    return colors[category || 'default'] || colors.default;
  };

  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#8b5cf6';
    }
  };

  const formatTime = (timestamp?: Timestamp): string => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
        <div className="p-6 border-b border-[var(--border-light)]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 loading-shimmer rounded-lg"></div>
            <div className="flex-1">
              <div className="loading-shimmer h-4 w-32 rounded mb-2"></div>
              <div className="loading-shimmer h-3 w-20 rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="flex space-x-3">
                <div className="loading-shimmer w-12 h-12 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="loading-shimmer h-4 w-3/4 rounded"></div>
                  <div className="loading-shimmer h-3 w-full rounded"></div>
                  <div className="loading-shimmer h-3 w-1/2 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">📝</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Citizen Reports</h2>
              <p className="text-sm text-[var(--text-secondary)]">AI-verified incidents</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[var(--status-success)] rounded-full pulse-animation"></div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {filteredEvents.length} reports
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {['high', 'medium', 'low'].map((severity) => {
            const count = filteredEvents.filter(e => e.severity === severity).length;
            return (
              <div key={severity} className="text-center p-2 rounded-lg bg-[var(--bg-secondary)]">
                <div 
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: getSeverityColor(severity) }}
                ></div>
                <div className="text-xs font-medium text-[var(--text-primary)]">{count}</div>
                <div className="text-xs text-[var(--text-tertiary)] capitalize">{severity}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-medium) var(--bg-secondary)'
      }}>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No reports found
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="card p-4 hover:shadow-lg transition-all duration-200 border-l-4 slide-up-enter"
              style={{ borderLeftColor: getCategoryColor(event.category) }}
            >
              <div className="flex space-x-3">
                {/* Event Icon/Image */}
                <div className="flex-shrink-0">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt="Event" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    >
                      {getCategoryIcon(event.category)}
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                      {event.category || 'Traffic Event'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getSeverityColor(event.severity) }}
                      ></div>
                      <span className="text-xs text-[var(--text-tertiary)] font-medium">
                        {formatTime(event.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                    {event.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-[var(--text-tertiary)]">
                      <span>🤖</span>
                      <span>AI Verified</span>
                    </div>
                    {event.location && (
                      <button className="text-xs text-[var(--accent-violet)] hover:text-[var(--accent-blue)] font-medium transition-colors">
                        View on map
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventFeed; 