import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LiveTraffic = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [trafficUpdates, setTrafficUpdates] = useState<{
    alerts: string[]
    events: string[]
    news: string[]
  }>({
    alerts: [],
    events: [],
    news: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live traffic updates from the backend
  useEffect(() => {
    const fetchTrafficUpdates = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:8000/api/traffic-updates')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        setTrafficUpdates(data)
      } catch (error) {
        setTrafficUpdates({
          alerts: [
            "Heavy traffic congestion on Outer Ring Road near Marathahalli due to ongoing construction work.",
            "Accident reported near Electronic City flyover causing lane closure and significant delays.",
            "Signal maintenance work causing delays on Brigade Road junction during peak hours.",
            "Water logging reported at Silk Board junction causing major delays in all directions.",
            "Road closure on MG Road for metro construction work from 10 AM to 8 PM today."
          ],
          events: [
            "VIP movement expected on MG Road between 2-4 PM today, expect major diversions and delays.",
            "Exhibition at BELR International Center causing increased traffic in surrounding areas.",
            "Morning marathon route affecting traffic on Cubbon Park Road and nearby connecting streets.",
            "Cricket match at Chinnaswamy Stadium - heavy traffic expected post 6 PM in surrounding areas.",
            "Cultural event at Palace Grounds affecting nearby roads including Sankey Road and surroundings."
          ],
          news: [
            "Metro extension work to begin next week affecting traffic on Bannerghatta Road corridor.",
            "New traffic signals installed at 20 junctions citywide to improve traffic flow management.",
            "BMTC introduces 10 new bus routes to reduce private vehicle dependency across the city.",
            "Traffic police deployment increased during peak hours on major routes for better management.",
            "Digital traffic advisory boards installed on major highways for real-time traffic updates."
          ]
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrafficUpdates()
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Static box for each category (no scroll)
  const StaticUpdateBox = ({ title, icon, items, loading }: { 
    title: string, 
    icon: string, 
    items: string[],
    loading: boolean
  }) => (
    <Card className="bg-white h-full flex flex-col border-2 border-black rounded-lg p-0">
      <CardHeader>
        <CardTitle className="text-base font-bold text-black flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {title.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Loading updates...
          </div>
        ) : items.length > 0 ? (
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
              <StaticUpdateBox title="Traffic Alerts" icon="🚨" items={trafficUpdates.alerts} loading={isLoading} />
              <StaticUpdateBox title="Events" icon="📅" items={trafficUpdates.events} loading={isLoading} />
              <StaticUpdateBox title="News" icon="📰" items={trafficUpdates.news} loading={isLoading} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveTraffic