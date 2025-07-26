import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeMoodTrends, getMoodEmoji } from '../utils/sentimentAnalysis'
import type { Report } from '../App'

interface MoodAnalyticsProps {
  reports: Report[]
}

const MoodAnalytics = ({ reports }: MoodAnalyticsProps) => {
  const moodTrends = analyzeMoodTrends(reports.map(r => ({ description: r.description, timestamp: r.timestamp })))
  
  const moodStats = [
    { mood: 'positive', label: 'Happy', emoji: '😊', color: '#10B981' },
    { mood: 'satisfied', label: 'Satisfied', emoji: '😌', color: '#10B981' },
    { mood: 'neutral', label: 'Neutral', emoji: '😐', color: '#6B7280' },
    { mood: 'concerned', label: 'Concerned', emoji: '😟', color: '#F59E0B' },
    { mood: 'frustrated', label: 'Frustrated', emoji: '😤', color: '#EF4444' },
    { mood: 'negative', label: 'Angry', emoji: '😠', color: '#EF4444' }
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>🎭</span>
          Mood Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Sentiment */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {moodTrends.averageSentiment > 0.3 ? '😊' : 
             moodTrends.averageSentiment > -0.3 ? '😐' : '😤'}
          </div>
          <div className="text-sm font-medium text-gray-600">
            Overall Sentiment: {moodTrends.averageSentiment > 0.3 ? 'Positive' : 
                               moodTrends.averageSentiment > -0.3 ? 'Neutral' : 'Negative'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Based on {moodTrends.totalReports} reports
          </div>
        </div>

        {/* Mood Distribution */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Mood Distribution</h4>
          <div className="space-y-2">
            {moodStats.map(({ mood, label, emoji, color }) => {
              const count = moodTrends.moodCounts[mood as keyof typeof moodTrends.moodCounts] || 0
              const percentage = moodTrends.totalReports > 0 ? (count / moodTrends.totalReports) * 100 : 0
              
              return (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: color 
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dominant Mood */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-1">
              {getMoodEmoji(moodTrends.dominantMood)}
            </div>
            <div className="text-sm font-semibold text-gray-800">
              Most Common Mood: {moodTrends.dominantMood.charAt(0).toUpperCase() + moodTrends.dominantMood.slice(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MoodAnalytics 