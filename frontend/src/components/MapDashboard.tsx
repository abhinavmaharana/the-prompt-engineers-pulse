import React, { useState, useEffect, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Type definitions
interface EventData {
  id: string;
  category?: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Timestamp;
  severity?: string;
  mood?: string;
}

interface FilterState {
  categories: string[];
  severity: string[];
  timeRange: string;
  showMoodMap: boolean;
}

interface MapDashboardProps {
  filters?: FilterState;
  showMoodMap?: boolean;
}

interface MarkerIconConfig {
  path: google.maps.SymbolPath;
  scale: number;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
}

// Light map style
const mapStyle: google.maps.MapTypeStyle[] = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#475569"}]
  },
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#64748b"}]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{"color": "#f8fafc"}]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{"saturation": -100}, {"lightness": 45}]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{"visibility": "simplified"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{"color": "#e2e8f0"}, {"visibility": "on"}]
  }
];

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="h-full flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center space-y-4">
            <div className="loading-shimmer w-16 h-16 rounded-xl mx-auto"></div>
            <p className="text-[var(--text-secondary)] font-medium">Loading city pulse...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="h-full flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center space-y-4">
            <div className="text-4xl">🚫</div>
            <p className="text-[var(--status-error)] font-medium">Failed to load map</p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return <MapComponent />;
    default:
      return <div />;
  }
};

const MapComponent: React.FC<MapDashboardProps> = ({ filters, showMoodMap }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [moodOverlay, setMoodOverlay] = useState<google.maps.OverlayView | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node !== null && window.google) {
      const mapInstance = new window.google.maps.Map(node, {
        center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru coordinates
        zoom: 11,
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        mapId: 'pulse-bengaluru-map'
      });
      setMap(mapInstance);
      setInfoWindow(new window.google.maps.InfoWindow());
    }
  }, []);

  // Listen to Firestore events in real-time
  useEffect(() => {
    const eventsQuery = query(
      collection(db, 'synthesized_events'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData: EventData[] = [];
      snapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as EventData);
      });
      setEvents(eventsData);
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

  // Create markers when events or map change
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = filteredEvents.map(event => {
      if (!event.location || !event.location.latitude || !event.location.longitude) {
        return null;
      }

      const position = {
        lat: event.location.latitude,
        lng: event.location.longitude
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: event.description,
        icon: getMarkerIcon(event.category, event.severity),
        animation: google.maps.Animation.DROP
      });

      marker.addListener('click', () => {
        const content = `
          <div class="p-4 min-w-[250px] font-['Inter',sans-serif]">
            <div class="flex items-center space-x-2 mb-3">
              <div class="w-3 h-3 rounded-full" style="background: ${getStatusColor(event.severity)}"></div>
              <h3 class="text-lg font-semibold text-[var(--text-primary)] m-0">${event.category || 'Traffic Event'}</h3>
            </div>
            <p class="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">${event.description || 'No description available'}</p>
            <div class="flex items-center justify-between text-xs">
              <span class="text-[var(--text-tertiary)]">${formatTime(event.createdAt)}</span>
              <span class="bg-[var(--bg-secondary)] px-2 py-1 rounded text-[var(--text-secondary)]">AI Verified</span>
            </div>
          </div>
        `;
        infoWindow?.setContent(content);
        infoWindow?.open(map, marker);
      });

      return marker;
    }).filter((marker): marker is google.maps.Marker => marker !== null);

    setMarkers(newMarkers);
  }, [map, filteredEvents, infoWindow, markers]);

  // Mood map overlay
  useEffect(() => {
    if (!map || !showMoodMap) {
      if (moodOverlay) {
        moodOverlay.setMap(null);
        setMoodOverlay(null);
      }
      return;
    }

    // Create simple mood overlay using data layer
    const moodData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [77.4, 12.8],
              [77.8, 12.8],
              [77.8, 13.2],
              [77.4, 13.2],
              [77.4, 12.8]
            ]]
          },
          properties: {
            mood: 'happy'
          }
        }
      ]
    };

    const dataLayer = new window.google.maps.Data();
    dataLayer.addGeoJson(moodData as any);
    dataLayer.setStyle({
      fillColor: '#10b981',
      fillOpacity: 0.3,
      strokeWeight: 0
    });
    dataLayer.setMap(map);

    return () => {
      dataLayer.setMap(null);
    };
  }, [map, showMoodMap, moodOverlay]);

  const getMarkerIcon = (category?: string, severity?: string): MarkerIconConfig => {
    const iconColors: Record<string, string> = {
      'Accident': '#ef4444',
      'Traffic Jam': '#f59e0b',
      'Waterlogging': '#06b6d4',
      'Road Work': '#f97316',
      'Emergency': '#dc2626',
      'default': '#8b5cf6'
    };

    const severityScale: Record<string, number> = {
      'low': 6,
      'medium': 8,
      'high': 10
    };

    const color = iconColors[category || 'default'] || iconColors.default;
    const scale = severityScale[severity || 'medium'] || 8;
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: scale,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2
    };
  };

  const getStatusColor = (severity?: string): string => {
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

  return (
    <div className="h-full w-full relative">
      <div ref={ref} className="h-full w-full rounded-lg overflow-hidden" />
      
      {/* Live indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 glass-effect px-3 py-2 rounded-lg">
        <div className="w-2 h-2 bg-[var(--status-success)] rounded-full pulse-animation"></div>
        <span className="text-sm font-medium text-[var(--text-primary)]">Live</span>
      </div>

      {/* Events counter */}
      <div className="absolute bottom-4 left-4 glass-effect px-3 py-2 rounded-lg">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {filteredEvents.length} active events
        </span>
      </div>
    </div>
  );
};

const MapDashboard: React.FC<MapDashboardProps> = (props) => {
  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} render={render}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default MapDashboard; 