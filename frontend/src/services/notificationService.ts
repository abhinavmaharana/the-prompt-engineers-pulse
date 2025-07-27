import { generatePredictiveAlerts, analyzeEventPatterns } from './eventAnalysisService'
import { getRecentReports } from './firestoreService'
import type { Report } from '../App'

export interface NotificationSubscription {
  id: string
  userId: string
  areas: string[]
  interests: ('traffic' | 'safety' | 'infrastructure' | 'power' | 'water' | 'weather')[]
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  notificationType: 'push' | 'email' | 'sms'
  isActive: boolean
  createdAt: Date
}

export interface AIGeneratedSummary {
  id: string
  area: string
  timeRange: string
  summary: string
  keyHighlights: string[]
  trends: string[]
  recommendations: string[]
  moodAnalysis: {
    overallMood: string
    moodTrend: 'improving' | 'stable' | 'worsening'
    topConcerns: string[]
  }
  generatedAt: Date
}

export interface IntelligentNotification {
  id: string
  type: 'summary' | 'alert' | 'prediction' | 'trend'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  area: string
  category: string
  actionItems: string[]
  relatedData: any
  expiresAt: Date
  createdAt: Date
}

// Generate AI-powered area summary
export const generateAreaSummary = async (area: string, hours: number = 24): Promise<AIGeneratedSummary> => {
  try {
    const reports = await getRecentReports(hours)
    const areaReports = reports.filter(report => {
      // Simple area matching - in production, use proper geocoding
      const reportArea = getAreaFromCoordinates(report.latitude, report.longitude)
      return reportArea === area
    })

    if (areaReports.length === 0) {
      return {
        id: `summary_${area}_${Date.now()}`,
        area,
        timeRange: `Last ${hours} hours`,
        summary: `No significant activity reported in ${area} in the last ${hours} hours.`,
        keyHighlights: ['Area is currently quiet'],
        trends: ['No trends detected'],
        recommendations: ['Continue monitoring'],
        moodAnalysis: {
          overallMood: 'neutral',
          moodTrend: 'stable',
          topConcerns: []
        },
        generatedAt: new Date()
      }
    }

    // Analyze reports for summary
    const totalReports = areaReports.length
    const categories = categorizeReports(areaReports)
    const moodAnalysis = analyzeMoodTrends(areaReports)
    const trends = identifyTrends(areaReports)
    const recommendations = generateRecommendations(categories, moodAnalysis)

    const summary = generateSummaryText(area, totalReports, categories, moodAnalysis)

    return {
      id: `summary_${area}_${Date.now()}`,
      area,
      timeRange: `Last ${hours} hours`,
      summary,
      keyHighlights: generateKeyHighlights(categories, totalReports),
      trends,
      recommendations,
      moodAnalysis,
      generatedAt: new Date()
    }
  } catch (error) {
    console.error('Error generating area summary:', error)
    throw error
  }
}

// Generate intelligent notifications
export const generateIntelligentNotifications = async (): Promise<IntelligentNotification[]> => {
  try {
    const notifications: IntelligentNotification[] = []
    
    // Get predictive alerts
    const alerts = await generatePredictiveAlerts()
    alerts.forEach(alert => {
      notifications.push({
        id: `notif_${alert.id}`,
        type: 'prediction',
        title: alert.title,
        message: alert.message,
        priority: alert.severity === 'critical' ? 'urgent' : 
                 alert.severity === 'high' ? 'high' : 
                 alert.severity === 'medium' ? 'medium' : 'low',
        area: alert.area,
        category: 'predictive',
        actionItems: alert.recommendations,
        relatedData: alert,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        createdAt: new Date()
      })
    })

    // Get event patterns
    const patterns = await analyzeEventPatterns()
    patterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        notifications.push({
          id: `notif_pattern_${pattern.id}`,
          type: 'trend',
          title: `Pattern Detected: ${pattern.type} in ${pattern.affectedArea}`,
          message: `${pattern.description}. Confidence: ${Math.round(pattern.confidence * 100)}%`,
          priority: pattern.severity === 'critical' ? 'urgent' : 
                   pattern.severity === 'high' ? 'high' : 'medium',
          area: pattern.affectedArea,
          category: pattern.type,
          actionItems: pattern.recommendations,
          relatedData: pattern,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
          createdAt: new Date()
        })
      }
    })

    return notifications
  } catch (error) {
    console.error('Error generating intelligent notifications:', error)
    return []
  }
}

// Subscribe to notifications
export const subscribeToNotifications = async (subscription: Omit<NotificationSubscription, 'id' | 'createdAt'>): Promise<NotificationSubscription> => {
  // In a real implementation, this would save to Firestore
  const newSubscription: NotificationSubscription = {
    ...subscription,
    id: `sub_${Date.now()}`,
    createdAt: new Date()
  }
  
  // Store subscription (implement with Firestore)
  console.log('Subscription created:', newSubscription)
  return newSubscription
}

// Get personalized notifications for a user
export const getPersonalizedNotifications = async (userId: string): Promise<IntelligentNotification[]> => {
  try {
    // In a real implementation, get user's subscription preferences
    const userSubscription: NotificationSubscription = {
      id: 'demo_sub',
      userId,
      areas: ['HSR Layout', 'Koramangala', 'Indiranagar'],
      interests: ['traffic', 'safety', 'infrastructure'],
      frequency: 'realtime',
      notificationType: 'push',
      isActive: true,
      createdAt: new Date()
    }

    const allNotifications = await generateIntelligentNotifications()
    
    // Filter notifications based on user preferences
    return allNotifications.filter(notification => {
      const areaMatch = userSubscription.areas.includes(notification.area)
      const interestMatch = userSubscription.interests.some(interest => 
        notification.category === interest || 
        notification.message.toLowerCase().includes(interest)
      )
      
      return areaMatch || interestMatch
    })
  } catch (error) {
    console.error('Error getting personalized notifications:', error)
    return []
  }
}

// Helper functions
const getAreaFromCoordinates = (lat: number, lng: number): string => {
  // Enhanced area detection with proper distance calculation
  const areas = {
    'HSR Layout': { lat: 12.9716, lng: 77.5946, radius: 0.02 },
    'Koramangala': { lat: 12.9349, lng: 77.6057, radius: 0.02 },
    'Indiranagar': { lat: 12.9789, lng: 77.5917, radius: 0.02 },
    'Whitefield': { lat: 12.9692, lng: 77.7499, radius: 0.03 },
    'Electronic City': { lat: 12.8458, lng: 77.6658, radius: 0.03 }
  }
  
  // Calculate distance using Haversine formula
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
  
  for (const [area, coords] of Object.entries(areas)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance <= coords.radius) {
      return area
    }
  }
  
  // If no exact match, find closest area
  let closestArea = 'HSR Layout'
  let minDistance = Infinity
  
  for (const [area, coords] of Object.entries(areas)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      closestArea = area
    }
  }
  
  return closestArea
}

const categorizeReports = (reports: Report[]): Record<string, number> => {
  const categories: Record<string, number> = {}
  
  reports.forEach(report => {
    const text = report.description.toLowerCase()
    if (text.includes('traffic') || text.includes('congestion') || text.includes('jam')) {
      categories.traffic = (categories.traffic || 0) + 1
    }
    if (text.includes('accident') || text.includes('safety') || text.includes('dangerous')) {
      categories.safety = (categories.safety || 0) + 1
    }
    if (text.includes('pothole') || text.includes('road') || text.includes('construction')) {
      categories.infrastructure = (categories.infrastructure || 0) + 1
    }
    if (text.includes('power') || text.includes('electricity')) {
      categories.power = (categories.power || 0) + 1
    }
    if (text.includes('water') || text.includes('supply')) {
      categories.water = (categories.water || 0) + 1
    }
    if (text.includes('rain') || text.includes('weather')) {
      categories.weather = (categories.weather || 0) + 1
    }
  })
  
  return categories
}

const analyzeMoodTrends = (reports: Report[]) => {
  const moods = reports.map(r => r.sentiment?.mood || 'neutral')
  const moodCounts = moods.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const totalReports = reports.length
  const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  )[0]
  
  // Determine trend based on recent vs older reports
  const recentReports = reports.slice(0, Math.ceil(totalReports / 2))
  const olderReports = reports.slice(Math.ceil(totalReports / 2))
  
  const recentMood = recentReports.reduce((acc, r) => {
    const mood = r.sentiment?.mood || 'neutral'
    acc[mood] = (acc[mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const olderMood = olderReports.reduce((acc, r) => {
    const mood = r.sentiment?.mood || 'neutral'
    acc[mood] = (acc[mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  let trend: 'improving' | 'stable' | 'worsening' = 'stable'
  const recentPositive = (recentMood.positive || 0) + (recentMood.satisfied || 0)
  const olderPositive = (olderMood.positive || 0) + (olderMood.satisfied || 0)
  
  if (recentPositive > olderPositive) trend = 'improving'
  else if (recentPositive < olderPositive) trend = 'worsening'
  
  return {
    overallMood: dominantMood,
    moodTrend: trend,
    topConcerns: Object.entries(moodCounts)
      .filter(([mood]) => ['frustrated', 'concerned', 'negative'].includes(mood))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([mood]) => mood)
  }
}

const identifyTrends = (reports: Report[]): string[] => {
  const trends: string[] = []
  const categories = categorizeReports(reports)
  
  if (categories.traffic && categories.traffic > 3) {
    trends.push('Increasing traffic congestion')
  }
  if (categories.safety && categories.safety > 2) {
    trends.push('Rising safety concerns')
  }
  if (categories.infrastructure && categories.infrastructure > 2) {
    trends.push('Infrastructure issues on the rise')
  }
  
  return trends.length > 0 ? trends : ['No significant trends detected']
}

const generateRecommendations = (categories: Record<string, number>, moodAnalysis: any): string[] => {
  const recommendations: string[] = []
  
  if (categories.traffic && categories.traffic > 3) {
    recommendations.push('Consider alternative routes during peak hours')
  }
  if (categories.safety && categories.safety > 2) {
    recommendations.push('Exercise caution in affected areas')
  }
  if (moodAnalysis.moodTrend === 'worsening') {
    recommendations.push('Monitor situation closely for further developments')
  }
  
  return recommendations.length > 0 ? recommendations : ['Continue monitoring the area']
}

const generateSummaryText = (area: string, totalReports: number, categories: Record<string, number>, moodAnalysis: any): string => {
  const categoryText = Object.entries(categories)
    .map(([category, count]) => `${count} ${category} issues`)
    .join(', ')
  
  return `${area} experienced ${totalReports} reports in the last 24 hours, primarily ${categoryText}. Overall mood is ${moodAnalysis.overallMood} with a ${moodAnalysis.moodTrend} trend.`
}

const generateKeyHighlights = (categories: Record<string, number>, totalReports: number): string[] => {
  const highlights: string[] = []
  
  Object.entries(categories).forEach(([category, count]) => {
    if (count > 2) {
      highlights.push(`${count} ${category} issues reported`)
    }
  })
  
  if (highlights.length === 0) {
    highlights.push(`${totalReports} total reports`)
  }
  
  return highlights
} 