import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  generatePredictiveAlerts, 
  analyzeEventPatterns,
  type PredictiveAlert,
  type EventPattern 
} from '../services/eventAnalysisService'
import { 
  generateIntelligentNotifications,
  generateAreaSummary,
  type IntelligentNotification,
  type AIGeneratedSummary 
} from '../services/notificationService'

const PredictiveAnalytics = () => {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([])
  const [patterns, setPatterns] = useState<EventPattern[]>([])
  const [notifications, setNotifications] = useState<IntelligentNotification[]>([])
  const [areaSummaries, setAreaSummaries] = useState<AIGeneratedSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArea, setSelectedArea] = useState('HSR Layout')

  const areas = ['HSR Layout', 'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City']

  useEffect(() => {
    loadPredictiveData()
  }, [])

  const loadPredictiveData = async () => {
    try {
      setIsLoading(true)
      
      // Load all predictive data
      const [alertsData, patternsData, notificationsData] = await Promise.all([
        generatePredictiveAlerts(),
        analyzeEventPatterns(),
        generateIntelligentNotifications()
      ])
      
      setAlerts(alertsData)
      setPatterns(patternsData)
      setNotifications(notificationsData)
      
      // Generate area summaries
      const summaries = await Promise.all(
        areas.map(area => generateAreaSummary(area, 24))
      )
      console.log('Generated area summaries:', summaries.map(s => ({ area: s.area, id: s.id })))
      setAreaSummaries(summaries)
      
    } catch (error) {
      console.error('Error loading predictive data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing city patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI-Powered City Intelligence</h2>
        <p className="text-gray-600">Predictive analytics and intelligent insights for Bengaluru</p>
      </div>

      {/* Active Alerts */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <span>🚨</span>
            Active Predictive Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-gray-600">No active alerts at the moment. City is running smoothly!</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{alert.message}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>📍 {alert.area}</span>
                    <span>•</span>
                    <span>🎯 {Math.round(alert.confidence * 100)}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Patterns */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <span>📊</span>
            Detected Event Patterns ({patterns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <p className="text-gray-600">No significant patterns detected in the last 24 hours.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map(pattern => (
                <div key={pattern.id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 capitalize">{pattern.type}</h4>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{pattern.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📍 {pattern.affectedArea}</span>
                      <span>•</span>
                      <span>⏱️ {pattern.predictedDuration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>🎯 {Math.round(pattern.confidence * 100)}% confidence</span>
                      <span>•</span>
                      <span>📈 {pattern.relatedReports.length} related reports</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Area Intelligence */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <span>🧠</span>
            Area Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {areas.map(area => (
                <Button
                  key={area}
                  variant={selectedArea === area ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArea(area)}
                >
                  {area}
                </Button>
              ))}
            </div>
          </div>
          
          {(() => {
            console.log('Selected area:', selectedArea)
            console.log('Available summaries:', areaSummaries.map(s => s.area))
            const currentSummary = areaSummaries.find(summary => summary.area === selectedArea)
            console.log('Current summary found:', !!currentSummary)
            
            if (!currentSummary) {
              return (
                <div className="bg-white rounded-lg p-6 border border-green-200">
                  <div className="text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading intelligence for {selectedArea}...</p>
                    <p className="text-xs mt-2">Available areas: {areaSummaries.map(s => s.area).join(', ')}</p>
                  </div>
                </div>
              )
            }
            
            return (
              <div key={currentSummary.id} className="bg-white rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{currentSummary.area}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    {currentSummary.timeRange}
                  </Badge>
                </div>
                
                <p className="text-gray-700 mb-4">{currentSummary.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🎯 Key Highlights</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {currentSummary.keyHighlights.map((highlight, index) => (
                        <li key={index}>• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📈 Trends</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {currentSummary.trends.map((trend, index) => (
                        <li key={index}>• {trend}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">😊 Mood Analysis</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Overall: <Badge className="bg-blue-100 text-blue-800">{currentSummary.moodAnalysis.overallMood}</Badge></span>
                    <span>Trend: <Badge className="bg-purple-100 text-purple-800">{currentSummary.moodAnalysis.moodTrend}</Badge></span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {currentSummary.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Intelligent Notifications */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <span>🔔</span>
            Intelligent Notifications ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-600">No notifications at the moment.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <div key={notification.id} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>📍 {notification.area}</span>
                    <span>•</span>
                    <span>📂 {notification.category}</span>
                    <span>•</span>
                    <span>🕒 {notification.type}</span>
                  </div>
                  {notification.actionItems.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 text-sm mb-1">Action Items:</h5>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {notification.actionItems.slice(0, 2).map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="text-center">
        <Button onClick={loadPredictiveData} className="bg-gradient-to-r from-blue-500 to-purple-600">
          🔄 Refresh Intelligence
        </Button>
      </div>
    </div>
  )
}

export default PredictiveAnalytics 