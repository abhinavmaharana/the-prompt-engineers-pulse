import { getRecentReports } from './firestoreService'
import type { Report } from '../App'

export interface EventPattern {
  id: string
  type: 'congestion' | 'infrastructure' | 'safety' | 'weather' | 'power' | 'water'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  affectedArea: string
  description: string
  predictedDuration: string
  recommendations: string[]
  relatedReports: string[]
  createdAt: Date
  predictedImpact: {
    trafficFlow: 'normal' | 'moderate' | 'heavy' | 'severe'
    safetyRisk: 'low' | 'medium' | 'high'
    economicImpact: 'minimal' | 'moderate' | 'significant'
  }
}

export interface PredictiveAlert {
  id: string
  type: 'warning' | 'alert' | 'critical'
  title: string
  message: string
  area: string
  confidence: number
  predictedTime: Date
  recommendations: string[]
  affectedRoutes: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Geographic areas in Bengaluru
const BENGALURU_AREAS = {
  'HSR Layout': { lat: 12.9716, lng: 77.5946, radius: 2 },
  'Koramangala': { lat: 12.9349, lng: 77.6057, radius: 2 },
  'Indiranagar': { lat: 12.9789, lng: 77.5917, radius: 2 },
  'Whitefield': { lat: 12.9692, lng: 77.7499, radius: 3 },
  'Electronic City': { lat: 12.8458, lng: 77.6658, radius: 3 },
  'Marathahalli': { lat: 12.9584, lng: 77.6998, radius: 2 },
  'Bellandur': { lat: 12.9352, lng: 77.6784, radius: 2 },
  'Sarjapur': { lat: 12.8677, lng: 77.6736, radius: 2 }
}

// Pattern detection keywords and rules
const PATTERN_RULES = {
  power: {
    keywords: ['power cut', 'electricity', 'blackout', 'outage', 'grid', 'transformer'],
    threshold: 3, // Minimum reports to trigger pattern
    timeWindow: 2, // Hours
    severity: 'high'
  },
  water: {
    keywords: ['water supply', 'pipeline', 'leak', 'shortage', 'tank'],
    threshold: 2,
    timeWindow: 4,
    severity: 'medium'
  },
  congestion: {
    keywords: ['traffic jam', 'congestion', 'blocked', 'slow', 'stuck'],
    threshold: 5,
    timeWindow: 1,
    severity: 'medium'
  },
  safety: {
    keywords: ['accident', 'collision', 'injury', 'dangerous', 'unsafe'],
    threshold: 2,
    timeWindow: 1,
    severity: 'high'
  },
  infrastructure: {
    keywords: ['pothole', 'road damage', 'construction', 'repair', 'maintenance'],
    threshold: 3,
    timeWindow: 6,
    severity: 'medium'
  },
  weather: {
    keywords: ['rain', 'flood', 'waterlogging', 'storm', 'wind'],
    threshold: 4,
    timeWindow: 2,
    severity: 'medium'
  }
}

// Calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Determine area from coordinates
const getAreaFromCoordinates = (lat: number, lng: number): string => {
  let closestArea = 'Unknown'
  let minDistance = Infinity

  for (const [area, coords] of Object.entries(BENGALURU_AREAS)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      closestArea = area
    }
  }

  return closestArea
}

// Analyze reports for patterns
export const analyzeEventPatterns = async (): Promise<EventPattern[]> => {
  try {
    const reports = await getRecentReports(24) // Last 24 hours
    const patterns: EventPattern[] = []

    // Group reports by area and time
    const areaGroups: Record<string, Report[]> = {}
    reports.forEach(report => {
      const area = getAreaFromCoordinates(report.latitude, report.longitude)
      if (!areaGroups[area]) areaGroups[area] = []
      areaGroups[area].push(report)
    })

    // Analyze each area for patterns
    for (const [area, areaReports] of Object.entries(areaGroups)) {
      for (const [patternType, rules] of Object.entries(PATTERN_RULES)) {
        const matchingReports = areaReports.filter(report => {
          const text = report.description.toLowerCase()
          return rules.keywords.some(keyword => text.includes(keyword))
        })

        if (matchingReports.length >= rules.threshold) {
          const pattern: EventPattern = {
            id: `${patternType}_${area}_${Date.now()}`,
            type: patternType as any,
            severity: rules.severity as any,
            confidence: Math.min(matchingReports.length / rules.threshold, 1),
            affectedArea: area,
            description: generatePatternDescription(patternType, area, matchingReports.length),
            predictedDuration: predictDuration(patternType, matchingReports.length),
            recommendations: generateRecommendations(patternType),
            relatedReports: matchingReports.map(r => r.id),
            createdAt: new Date(),
            predictedImpact: predictImpact(patternType, matchingReports.length)
          }
          patterns.push(pattern)
        }
      }
    }

    return patterns
  } catch (error) {
    console.error('Error analyzing event patterns:', error)
    return []
  }
}

// Generate predictive alerts based on patterns
export const generatePredictiveAlerts = async (): Promise<PredictiveAlert[]> => {
  try {
    const patterns = await analyzeEventPatterns()
    const alerts: PredictiveAlert[] = []

    for (const pattern of patterns) {
      if (pattern.confidence > 0.6) { // Only high-confidence patterns
        const alert: PredictiveAlert = {
          id: `alert_${pattern.id}`,
          type: pattern.severity === 'critical' ? 'critical' : 
                pattern.severity === 'high' ? 'alert' : 'warning',
          title: generateAlertTitle(pattern),
          message: generateAlertMessage(pattern),
          area: pattern.affectedArea,
          confidence: pattern.confidence,
          predictedTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          recommendations: pattern.recommendations,
          affectedRoutes: predictAffectedRoutes(pattern),
          severity: pattern.severity
        }
        alerts.push(alert)
      }
    }

    return alerts
  } catch (error) {
    console.error('Error generating predictive alerts:', error)
    return []
  }
}

// Helper functions
const generatePatternDescription = (type: string, area: string, count: number): string => {
  const descriptions = {
    power: `Multiple power-related issues reported in ${area} (${count} reports)`,
    water: `Water supply problems detected in ${area} (${count} reports)`,
    congestion: `Traffic congestion pattern emerging in ${area} (${count} reports)`,
    safety: `Safety concerns reported in ${area} (${count} reports)`,
    infrastructure: `Infrastructure issues identified in ${area} (${count} reports)`,
    weather: `Weather-related problems affecting ${area} (${count} reports)`
  }
  return descriptions[type as keyof typeof descriptions] || `Pattern detected in ${area}`
}

const predictDuration = (type: string, reportCount: number): string => {
  const baseDurations = {
    power: '2-4 hours',
    water: '4-8 hours',
    congestion: '1-2 hours',
    safety: 'Immediate attention required',
    infrastructure: '6-12 hours',
    weather: '2-6 hours'
  }
  const base = baseDurations[type as keyof typeof baseDurations] || 'Unknown'
  return reportCount > 5 ? `Extended: ${base}` : base
}

const generateRecommendations = (type: string): string[] => {
  const recommendations = {
    power: [
      'Contact BESCOM emergency helpline',
      'Avoid affected area if possible',
      'Use backup power sources',
      'Monitor official updates'
    ],
    water: [
      'Contact BWSSB for updates',
      'Store water for essential use',
      'Check for local water tankers',
      'Report leaks immediately'
    ],
    congestion: [
      'Use alternative routes',
      'Consider public transport',
      'Check real-time traffic updates',
      'Plan travel during off-peak hours'
    ],
    safety: [
      'Contact traffic police immediately',
      'Avoid the affected area',
      'Follow official safety guidelines',
      'Report any additional incidents'
    ],
    infrastructure: [
      'Report to BBMP helpline',
      'Use alternative routes',
      'Follow traffic diversions',
      'Monitor for updates'
    ],
    weather: [
      'Check weather forecasts',
      'Avoid waterlogged areas',
      'Use public transport if possible',
      'Stay updated on road conditions'
    ]
  }
  return recommendations[type as keyof typeof recommendations] || ['Monitor the situation', 'Follow official updates']
}

const predictImpact = (type: string, reportCount: number): EventPattern['predictedImpact'] => {
  const impacts: Record<string, EventPattern['predictedImpact']> = {
    power: {
      trafficFlow: reportCount > 5 ? 'severe' : 'heavy',
      safetyRisk: 'high',
      economicImpact: 'significant'
    },
    water: {
      trafficFlow: 'moderate',
      safetyRisk: 'medium',
      economicImpact: 'moderate'
    },
    congestion: {
      trafficFlow: reportCount > 8 ? 'severe' : 'heavy',
      safetyRisk: 'medium',
      economicImpact: 'moderate'
    },
    safety: {
      trafficFlow: 'heavy',
      safetyRisk: 'high',
      economicImpact: 'significant'
    },
    infrastructure: {
      trafficFlow: 'moderate',
      safetyRisk: 'medium',
      economicImpact: 'moderate'
    },
    weather: {
      trafficFlow: reportCount > 6 ? 'severe' : 'heavy',
      safetyRisk: 'high',
      economicImpact: 'moderate'
    }
  }
  return impacts[type] || {
    trafficFlow: 'normal',
    safetyRisk: 'low',
    economicImpact: 'minimal'
  }
}

const generateAlertTitle = (pattern: EventPattern): string => {
  const titles = {
    power: `⚡ Power Issue Alert - ${pattern.affectedArea}`,
    water: `💧 Water Supply Alert - ${pattern.affectedArea}`,
    congestion: `🚗 Traffic Alert - ${pattern.affectedArea}`,
    safety: `⚠️ Safety Alert - ${pattern.affectedArea}`,
    infrastructure: `🔧 Infrastructure Alert - ${pattern.affectedArea}`,
    weather: `🌧️ Weather Alert - ${pattern.affectedArea}`
  }
  return titles[pattern.type] || `Alert - ${pattern.affectedArea}`
}

const generateAlertMessage = (pattern: EventPattern): string => {
  return `${pattern.description}. Expected duration: ${pattern.predictedDuration}. Please follow recommended actions and stay updated.`
}

const predictAffectedRoutes = (pattern: EventPattern): string[] => {
  // This would integrate with Google Maps API to get actual routes
  const routeTemplates = {
    power: ['Main roads in affected area', 'Commercial district routes'],
    water: ['Residential areas', 'Local service roads'],
    congestion: ['Major arterial roads', 'Highway connections'],
    safety: ['Incident location', 'Surrounding areas'],
    infrastructure: ['Construction zones', 'Maintenance areas'],
    weather: ['Low-lying areas', 'Drainage routes']
  }
  return routeTemplates[pattern.type] || ['Affected area routes']
} 