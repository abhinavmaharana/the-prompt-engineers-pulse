import { useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PlusIcon, MinusIcon, MapIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from './components/Header'
import MapComponent from './components/MapComponent'
import ModalWizard from './components/ModalWizard'
import Feed from './components/Feed'
import FAB from './components/FAB'
import RoutePlanner from './components/RoutePlanner'
import LiveTraffic from './components/LiveTraffic'

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
)

export interface Report {
  id: string
  latitude: number
  longitude: number
  description: string
  image?: File
  timestamp: Date
}

function App() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      description: 'Large pothole causing traffic congestion',
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: new Date()
    },
    {
      id: '2',
      description: 'Traffic accident on main road',
      latitude: 12.9789,
      longitude: 77.5917,
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: '3',
      description: 'Heavy traffic jam near mall',
      latitude: 12.9655,
      longitude: 77.5855,
      timestamp: new Date(Date.now() - 600000) // 10 minutes ago
    },
    {
      id: '4',
      description: 'Road incident blocking traffic',
      latitude: 12.9833,
      longitude: 77.5833,
      timestamp: new Date(Date.now() - 900000) // 15 minutes ago
    },
    {
      id: '5',
      description: 'Slow moving traffic due to construction',
      latitude: 12.9700,
      longitude: 77.5900,
      timestamp: new Date(Date.now() - 1200000) // 20 minutes ago
    }
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null)
  const [trafficView, setTrafficView] = useState<'all' | 'flow' | 'incidents'>('all')
  const [showRoutePlanner, setShowRoutePlanner] = useState(false)
  const [route, setRoute] = useState<{ origin: string; destination: string } | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setIsModalOpen(true)
  }

  const handleSubmitReport = (description: string, image?: File) => {
    if (selectedLocation) {
      const newReport: Report = {
        id: Date.now().toString(),
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        description,
        image,
        timestamp: new Date()
      }
      setReports(prev => [newReport, ...prev])
      setIsModalOpen(false)
      setSelectedLocation(null)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedLocation(null)
  }

  const handleFocusReport = (reportId: string) => {
    setFocusedReportId(reportId)
  }

  const handleRouteSelect = (origin: string, destination: string) => {
    console.log('Route selected:', { origin, destination })
    setRoute({ origin, destination })
    setShowRoutePlanner(false)
    // Here you would integrate with Google Directions API to draw the route on map
  }

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom()
      if (currentZoom !== undefined && currentZoom < 20) {
        mapRef.current.setZoom(currentZoom + 1)
      }
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom()
      if (currentZoom !== undefined && currentZoom > 1) {
        mapRef.current.setZoom(currentZoom - 1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-text overflow-x-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
                   {/* Header */}
             <Header
               onReportClick={() => console.log('Desktop report clicked')}
             />

                   {/* Hero/Intro Section */}
             <section className="py-10 relative">
               <div className="max-w-7xl mx-auto px-6 mt-32 text-center">
                 <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                   Bengaluru Traffic
                 </h1>
                 <div className="flex justify-center items-center gap-2 text-gray-600 text-xl font-medium mb-2 drop-shadow-lg">
                   <span>🇮🇳</span>
                   <span>India</span>
                 </div>
                 <p className="text-gray-500 text-lg font-medium drop-shadow-md">
                   Real-time traffic monitoring and civic issue reporting
                 </p>
               </div>
             </section>

             {/* Route Planner Section */}
             <section className="w-full px-6 py-8 relative">
               <div className="max-w-7xl mx-auto">
                 <div className="flex items-center justify-between mb-6">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan Your Route</h2>
                     <p className="text-gray-600">Find the best route from point A to point B</p>
                   </div>
                   <Button
                     onClick={() => setShowRoutePlanner(true)}
                     className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
                   >
                     Plan Route
                   </Button>
                 </div>
                 
                 <RoutePlanner
                   open={showRoutePlanner}
                   onOpenChange={setShowRoutePlanner}
                   onRouteSelect={handleRouteSelect}
                 />
                 
                 {route && (
                   <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                       <MapIcon className="w-5 h-5 text-green-600" />
                       <span className="font-semibold text-green-800">Active Route</span>
                     </div>
                     <div className="text-sm text-green-700">
                       <div><strong>From:</strong> {route.origin}</div>
                       <div><strong>To:</strong> {route.destination}</div>
                     </div>
                   </div>
                 )}
               </div>
             </section>

             {/* Map Section */}
      <section className="relative px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Decorative elements */}
          <div className="absolute -top-4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl shadow-glass border border-white/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl"></div>
            
            {/* Map container with enhanced styling */}
            <div className="relative h-[80vh] rounded-3xl overflow-hidden">
                                   <MapComponent
                       reports={reports}
                       onMapClick={handleMapClick}
                       focusedReportId={focusedReportId || undefined}
                       trafficView={trafficView}
                       route={route}
                       onMapReady={handleMapReady}
                     />
            </div>
            
                         {/* Bottom decorative border */}
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
           </div>
         </div>



                 {/* Map Controls */}
         <div className="absolute top-8 left-8 lg:top-12 lg:left-32 z-10">
           <Card className="p-4 bg-white/70 backdrop-blur-2xl shadow-glass border border-white/30">
             <CardContent className="p-0">
               <div className="flex gap-2">
                 <Button 
                   size="sm" 
                   className={`${trafficView === 'all' ? 'bg-primary text-white font-semibold shadow-lg' : 'bg-transparent text-black hover:bg-white/20'} backdrop-blur-sm border border-white/30 transition-all duration-300`}
                   onClick={() => setTrafficView('all')}
                 >
                   All traffic
                 </Button>
                 <Button 
                   size="sm" 
                   className={`${trafficView === 'flow' ? 'bg-primary text-white font-semibold shadow-lg' : 'bg-transparent text-black hover:bg-white/20'} backdrop-blur-sm border border-white/30 transition-all duration-300`}
                   onClick={() => setTrafficView('flow')}
                 >
                   Flow
                 </Button>
                 <Button 
                   size="sm" 
                   className={`${trafficView === 'incidents' ? 'bg-primary text-white font-semibold shadow-lg' : 'bg-transparent text-black hover:bg-white/20'} backdrop-blur-sm border border-white/30 transition-all duration-300`}
                   onClick={() => setTrafficView('incidents')}
                 >
                   Incidents
                 </Button>
               </div>
             </CardContent>
           </Card>
         </div>

                         {/* Zoom Controls */}
         <div className="absolute top-8 right-8 lg:top-12 lg:right-32 z-10">
           <Card className="bg-gray-900/80 backdrop-blur-2xl shadow-glass border border-gray-700/30">
             <CardContent className="p-0">
               <div className="flex flex-col">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="rounded-none border-b border-gray-600/30 hover:bg-gray-700/80 text-white transition-all duration-300"
                   onClick={handleZoomIn}
                 >
                   <PlusIcon className="w-5 h-5" />
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="rounded-none hover:bg-gray-700/80 text-white transition-all duration-300"
                   onClick={handleZoomOut}
                 >
                   <MinusIcon className="w-5 h-5" />
                 </Button>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Traffic Legend */}
         {trafficView === 'all' && (
           <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-32 z-10">
             <Card className="bg-white/90 backdrop-blur-2xl shadow-glass border border-white/30">
               <CardContent className="p-4">
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Normal flow</span>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Moderate congestion</span>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Heavy traffic</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Severe congestion</span>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}

         {/* Flow Legend */}
         {trafficView === 'flow' && (
           <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-32 z-10">
             <Card className="bg-white/90 backdrop-blur-2xl shadow-glass border border-white/30">
               <CardContent className="p-4">
                 <div className="space-y-3">
                   <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Traffic Flow</div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Traffic congestion</span>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Slow moving traffic</span>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Traffic jam</span>
                   </div>
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Construction work</span>
                   </div>
                   
                   <div className="border-t border-gray-200 pt-2">
                     <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Road Traffic</div>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Normal flow</span>
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Moderate congestion</span>
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Heavy traffic</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Severe congestion</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}

         {/* Incidents Legend */}
         {trafficView === 'incidents' && (
           <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-32 z-10">
             <Card className="bg-white/90 backdrop-blur-2xl shadow-glass border border-white/30">
               <CardContent className="p-4">
                 <div className="space-y-3">
                   <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Traffic Incidents</div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Traffic incident</span>
                   </div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Accident</span>
                   </div>
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                     <span className="text-sm font-medium text-gray-800">Road blocking</span>
                   </div>
                   
                   <div className="border-t border-gray-200 pt-2">
                     <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Road Traffic</div>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Normal flow</span>
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Moderate congestion</span>
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Heavy traffic</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                       <span className="text-sm font-medium text-gray-800">Severe congestion</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}
      </section>

                   {/* Live Traffic Section */}
             <section className="w-full px-6 py-8 relative">
               <div className="max-w-7xl mx-auto">
                 <LiveTraffic />
               </div>
             </section>

             {/* Feed Section */}
             <section className="w-full px-6 py-12 relative">
               <div className="max-w-7xl mx-auto">
                 <div className="flex items-center justify-between mb-4">
                   <Feed reports={reports} onFocusReport={handleFocusReport} />
                 </div>
               </div>
             </section>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-4"
          onClick={() => window.open('https://wa.me/919876543210?text=Hi! I need help with traffic reporting on CityPulse.', '_blank')}
          aria-label="Contact via WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* FAB */}
      <FAB
        onClick={() => console.log('FAB clicked')}
        show={!isModalOpen}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedLocation && (
          <ModalWizard
            latitude={selectedLocation.lat}
            longitude={selectedLocation.lng}
            onSubmit={handleSubmitReport}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
