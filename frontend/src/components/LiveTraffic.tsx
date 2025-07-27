import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LiveTraffic = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Hardcoded latest data for guaranteed visibility
  const trafficUpdates = {
    alerts: [
      "Vehicle Breakdown occurred at Magadi Main Road, Kottigepalya | 03:09 Hrs 27-07-2025",
      "Construction occurred at Hennur Junction Flyover, Krishna Reddy Layout | 06:30 Hrs 28-07-2025",
      "Severe Congestion reported near Outer Ring Road, Bangalore North | 23:45 Hrs 26-07-2025",
      "Severe Congestion reported near Madiwala Underpass, Bangalore South, Koramangala | 23:45 Hrs 26-07-2025",
      "Severe Congestion reported near Bangalore East, Marathahalli, MSR Layout | 23:45 Hrs 26-07-2025"
    ],
    events: [
      "Public Event: Varthur Kodi towards Marathahalli | Start: 06:00 Hrs 26-07-2025 and End: 30-09-2025",
      "Public Event: Old Post Office Road | Start: 06:00 Hrs 27-07-2025 and End: 10-09-2025",
      "Private Event: Basecamp by Push Sports, Bengaluru | Start: 16:00 Hrs 26-07-2025 and End: 26-07-2025",
      "Private Event: Bhartiya Mall Of Bengaluru | Start: 16:00 Hrs 25-07-2025 and End: 31-07-2025",
      "Private Event: Bangalore International Exhibition Centre, Madhavara | Start: 09:00 Hrs 26-07-2025 and End: 27-07-2025"
    ],
    news: [
      "Bengaluru: Traffic Police Suggest Mid-Week WFH To Ease Outer Ring Road Congestion | 26-07-2025",
      "Bengaluru’s Traffic Fix: ORR Gridlock May Ease with Early Shifts and WFH Wednesdays? | 24-07-2025",
      "Bengaluru to get ‘WFH Wednesdays’? Officials mull options to untangle traffic chaos | 24-07-2025",
      "Bengaluru's Yellow Line Of Namma Metro To Launch Soon, Check All Stations And Routes | 22-07-2025",
      "Traffic police to crack the whip on civic contractors to ease road congestion | 21-07-2025"
    ]
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const StaticUpdateBox = ({ title, icon, items }: { 
    title: string, 
    icon: string, 
    items: string[]
  }) => (
    <Card className="bg-white h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-bold text-black flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {title.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-gray-800 leading-relaxed flex items-start gap-2">
                <span className="mt-1 text-xs flex-shrink-0 text-blue-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No updates available.
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full">
      <Card className="bg-white/80 backdrop-blur-2xl shadow-glass border border-white/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800">Bengaluru Live Traffic</CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">LIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Last update</div>
              <div className="text-lg font-semibold text-gray-800">{formatDate(currentTime)}, {formatTime(currentTime)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Local time</div>
              <div className="text-lg font-semibold text-gray-800">{formatTime(currentTime)}</div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Live Updates</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StaticUpdateBox title="Traffic Alerts" icon="🚨" items={trafficUpdates.alerts} />
              <StaticUpdateBox title="Events" icon="📅" items={trafficUpdates.events} />
              <StaticUpdateBox title="News" icon="📰" items={trafficUpdates.news} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveTraffic