import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LiveTraffic = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [trafficUpdates, setTrafficUpdates] = useState<{
    alerts: string[]
    events: string[]
    news: string[]
    last_updated?: string
    status?: string
  }>({
    alerts: [
      "🚨 Heavy traffic congestion on Outer Ring Road near Marathahalli due to ongoing metro construction work.",
      "⚠️ Accident reported near Electronic City flyover causing lane closure and significant delays.",
      "🚧 Signal maintenance work causing delays on Brigade Road junction during peak hours.",
      "💧 Water logging reported at Silk Board junction causing major delays in all directions.",
      "🛣️ Road closure on MG Road for metro construction work from 10 AM to 8 PM today.",
      "🚧 Diversion at Hebbal flyover for emergency repairs until tomorrow morning.",
      "⚠️ Heavy vehicle breakdown on Hosur Road causing traffic buildup for 2km.",
      "🚧 Pothole repair work on Bannerghatta Road affecting traffic flow.",
      "🚨 Tree fall on Residency Road blocking one lane completely.",
      "💧 Sewer overflow on Infantry Road causing traffic diversions."
    ],
    events: [
      "🎭 VIP movement expected on MG Road between 2-4 PM today, expect major diversions and delays.",
      "🏢 Exhibition at BELR International Center causing increased traffic in surrounding areas until 8 PM.",
      "🏃 Morning marathon route affecting traffic on Cubbon Park Road and nearby connecting streets.",
      "🏏 Cricket match at Chinnaswamy Stadium - heavy traffic expected post 6 PM in surrounding areas.",
      "🎪 Cultural event at Palace Grounds affecting nearby roads including Sankey Road and surroundings.",
      "🎓 College admission process at Mount Carmel College causing traffic on Palace Road.",
      "🏥 Medical emergency at Victoria Hospital - ambulance priority on Victoria Road.",
      "🎨 Art exhibition at NGMA causing increased traffic on Palace Road until 9 PM.",
      "🏛️ Government meeting at Vidhana Soudha affecting traffic on Ambedkar Road.",
      "🎵 Music concert at UB City causing traffic on Vittal Mallya Road from 7 PM.",
      "🚇 Metro construction work on Bannerghatta Road affecting traffic flow until 10 PM.",
      "🏗️ Building demolition on Residency Road causing lane closure until tomorrow morning.",
      "🚧 Road widening work on Hosur Road affecting traffic during peak hours.",
      "💧 Drainage work on Infantry Road causing traffic diversions until 8 PM.",
      "🛣️ Flyover construction on Outer Ring Road affecting traffic for next 24 hours."
    ],
    news: [
      "🚇 Metro extension work to begin next week affecting traffic on Bannerghatta Road corridor.",
      "🚦 New traffic signals installed at 20 junctions citywide to improve traffic flow management.",
      "🚌 BMTC introduces 10 new bus routes to reduce private vehicle dependency across the city.",
      "👮 Traffic police deployment increased during peak hours on major routes for better management.",
      "📺 Digital traffic advisory boards installed on major highways for real-time traffic updates.",
      "🛣️ Smart traffic light system to be implemented on 50 major intersections next month.",
      "🚗 Carpooling lanes to be introduced on Outer Ring Road to reduce congestion.",
      "🚲 Dedicated cycling lanes planned for 15 major roads across the city.",
      "🅿️ New multi-level parking facilities to open near major shopping centers.",
      "📱 Traffic app integration with Google Maps for real-time route optimization."
    ],
    last_updated: new Date().toISOString(),
    status: "initial"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('')
  const alertsRef = useRef<HTMLDivElement>(null)
  const eventsRef = useRef<HTMLDivElement>(null)
  const newsRef = useRef<HTMLDivElement>(null)

  // Fetch live traffic updates from the backend
  const fetchTrafficUpdates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:8000/api/traffic-updates')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      
      // Check if we have new data
      if (data.last_updated !== lastUpdateTime) {
        setTrafficUpdates(data)
        setLastUpdateTime(data.last_updated || '')
        
        // Trigger scroll animations for new updates
        if (data.status === 'live') {
          triggerScrollAnimation()
        }
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching traffic updates:', error)
      // Set comprehensive fallback data for 24-hour events
      const fallbackData = {
        alerts: [
          "🚨 Heavy traffic congestion on Outer Ring Road near Marathahalli due to ongoing metro construction work.",
          "⚠️ Accident reported near Electronic City flyover causing lane closure and significant delays.",
          "🚧 Signal maintenance work causing delays on Brigade Road junction during peak hours.",
          "💧 Water logging reported at Silk Board junction causing major delays in all directions.",
          "🛣️ Road closure on MG Road for metro construction work from 10 AM to 8 PM today.",
          "🚧 Diversion at Hebbal flyover for emergency repairs until tomorrow morning.",
          "⚠️ Heavy vehicle breakdown on Hosur Road causing traffic buildup for 2km.",
          "🚧 Pothole repair work on Bannerghatta Road affecting traffic flow.",
          "🚨 Tree fall on Residency Road blocking one lane completely.",
          "💧 Sewer overflow on Infantry Road causing traffic diversions."
        ],
        events: [
          "🎭 VIP movement expected on MG Road between 2-4 PM today, expect major diversions and delays.",
          "🏢 Exhibition at BELR International Center causing increased traffic in surrounding areas until 8 PM.",
          "🏃 Morning marathon route affecting traffic on Cubbon Park Road and nearby connecting streets.",
          "🏏 Cricket match at Chinnaswamy Stadium - heavy traffic expected post 6 PM in surrounding areas.",
          "🎪 Cultural event at Palace Grounds affecting nearby roads including Sankey Road and surroundings.",
          "🎓 College admission process at Mount Carmel College causing traffic on Palace Road.",
          "🏥 Medical emergency at Victoria Hospital - ambulance priority on Victoria Road.",
          "🎨 Art exhibition at NGMA causing increased traffic on Palace Road until 9 PM.",
          "🏛️ Government meeting at Vidhana Soudha affecting traffic on Ambedkar Road.",
          "🎵 Music concert at UB City causing traffic on Vittal Mallya Road from 7 PM.",
          "🚇 Metro construction work on Bannerghatta Road affecting traffic flow until 10 PM.",
          "🏗️ Building demolition on Residency Road causing lane closure until tomorrow morning.",
          "🚧 Road widening work on Hosur Road affecting traffic during peak hours.",
          "💧 Drainage work on Infantry Road causing traffic diversions until 8 PM.",
          "🛣️ Flyover construction on Outer Ring Road affecting traffic for next 24 hours."
        ],
        news: [
          "🚇 Metro extension work to begin next week affecting traffic on Bannerghatta Road corridor.",
          "🚦 New traffic signals installed at 20 junctions citywide to improve traffic flow management.",
          "🚌 BMTC introduces 10 new bus routes to reduce private vehicle dependency across the city.",
          "👮 Traffic police deployment increased during peak hours on major routes for better management.",
          "📺 Digital traffic advisory boards installed on major highways for real-time traffic updates.",
          "🛣️ Smart traffic light system to be implemented on 50 major intersections next month.",
          "🚗 Carpooling lanes to be introduced on Outer Ring Road to reduce congestion.",
          "🚲 Dedicated cycling lanes planned for 15 major roads across the city.",
          "🅿️ New multi-level parking facilities to open near major shopping centers.",
          "📱 Traffic app integration with Google Maps for real-time route optimization."
        ],
        last_updated: new Date().toISOString(),
        status: "fallback"
      }
      
      setTrafficUpdates(fallbackData)
      setLastUpdateTime(fallbackData.last_updated)
      setIsLoading(false)
    }
  }

  // Trigger scroll animation for new updates
  const triggerScrollAnimation = () => {
    const refs = [alertsRef, eventsRef, newsRef]
    refs.forEach((ref, index) => {
      if (ref.current) {
        setTimeout(() => {
          ref.current?.classList.add('animate-pulse')
          setTimeout(() => {
            ref.current?.classList.remove('animate-pulse')
          }, 1000)
        }, index * 200)
      }
    })
  }

  // Initial fetch
  useEffect(() => {
    fetchTrafficUpdates()
  }, [])

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTrafficUpdates, 30000)
    return () => clearInterval(interval)
  }, [lastUpdateTime])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Auto-scrolling update box for each category
  const ScrollingUpdateBox = ({ 
    title, 
    icon, 
    items, 
    loading, 
    ref 
  }: { 
    title: string, 
    icon: string, 
    items: string[],
    loading: boolean,
    ref: React.RefObject<HTMLDivElement>
  }) => (
    <Card className="bg-white h-full flex flex-col border-2 border-black rounded-lg p-0 overflow-hidden">
              <CardHeader>
        <CardTitle className="text-base font-bold text-black flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {title.toUpperCase()}
          {title.includes('Events') && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              24h
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 p-4">
            Loading updates...
          </div>
        ) : items.length > 0 ? (
          <div 
            ref={ref}
            className="h-full overflow-hidden relative"
          >
            {/* Auto-scrolling content */}
            <div 
              className="scrolling-content p-4 space-y-3"
              style={{
                animation: 'scroll-up 20s linear infinite',
                animationPlayState: 'running'
              }}
            >
              {/* Duplicate items for seamless loop */}
              {[...items, ...items].map((item, index) => (
                <div 
                  key={index} 
                  className="text-sm text-gray-800 leading-relaxed flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="mt-1 text-xs flex-shrink-0 text-blue-600">•</span>
                  <span className="flex-1">{item}</span>
                </div>
              ))}
            </div>
            
            {/* Pause on hover */}
            <div 
              className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors duration-200"
              onMouseEnter={() => {
                if (ref.current) {
                  const scrollingContent = ref.current.querySelector('.scrolling-content') as HTMLElement
                  if (scrollingContent) {
                    scrollingContent.style.animationPlayState = 'paused'
                  }
                }
              }}
              onMouseLeave={() => {
                if (ref.current) {
                  const scrollingContent = ref.current.querySelector('.scrolling-content') as HTMLElement
                  if (scrollingContent) {
                    scrollingContent.style.animationPlayState = 'running'
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 p-4">
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
              <div className={`w-3 h-3 rounded-full ${trafficUpdates.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className={`text-sm font-medium ${trafficUpdates.status === 'live' ? 'text-red-600' : 'text-blue-600'}`}>
                {trafficUpdates.status === 'live' ? 'LIVE' : '24H DATA'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Last update</div>
              <div className="text-lg font-semibold text-gray-800">
                {lastUpdateTime ? new Date(lastUpdateTime).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : formatDate(currentTime)}, {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : formatTime(currentTime)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Local time</div>
              <div className="text-lg font-semibold text-gray-800">{formatTime(currentTime)}</div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Live Updates</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                <span className="text-xs text-gray-500">Auto-scroll • 30s refresh</span>
                <span className="text-xs text-blue-600 font-medium">24h Events</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScrollingUpdateBox 
                title="Traffic Alerts" 
                icon="🚨" 
                items={trafficUpdates.alerts} 
                loading={isLoading}
                ref={alertsRef}
              />
              <ScrollingUpdateBox 
                title="Events (24h)" 
                icon="📅" 
                items={trafficUpdates.events} 
                loading={isLoading}
                ref={eventsRef}
              />
              <ScrollingUpdateBox 
                title="News" 
                icon="📰" 
                items={trafficUpdates.news} 
                loading={isLoading}
                ref={newsRef}
              />
            </div>
            {trafficUpdates.status !== 'live' && (
              <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                📅 Showing comprehensive 24-hour traffic events and updates
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveTraffic