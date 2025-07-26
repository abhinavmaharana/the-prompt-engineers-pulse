import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from './components/Header'
import MapComponent from './components/MapComponent'
import ModalWizard from './components/ModalWizard'
import Feed from './components/Feed'
import FAB from './components/FAB'

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

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      {/* Header */}
      <Header onReportClick={() => console.log('Desktop report clicked')} />

      {/* Hero/Intro Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-10 border-b">
        <div className="max-w-7xl mx-auto px-6 mt-32 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Bengaluru Traffic
          </h1>
          <div className="flex justify-center items-center gap-2 text-gray-600 text-lg font-medium">
            <span>🇮🇳</span>
            <span>India</span>
          </div>
          <p className="text-gray-500 mt-2 font-medium text-sm">
            Real-time traffic monitoring and civic issue reporting
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative h-[100vh] w-full">
                 <MapComponent
           reports={reports}
           onMapClick={handleMapClick}
           focusedReportId={focusedReportId || undefined}
           trafficView={trafficView}
         />

                 {/* Map Controls */}
         <div className="absolute top-6 left-6 z-10">
           <Card className="p-4 bg-white/90 backdrop-blur-lg shadow-xl border-0">
             <CardContent className="p-0">
               <div className="flex gap-2">
                 <Button 
                   size="sm" 
                   className={trafficView === 'all' ? 'bg-primary text-white font-semibold' : 'bg-gray-100 hover:bg-gray-200'}
                   onClick={() => setTrafficView('all')}
                 >
                   All traffic
                 </Button>
                 <Button 
                   size="sm" 
                   variant="ghost"
                   className={trafficView === 'flow' ? 'bg-primary text-white font-semibold' : ''}
                   onClick={() => setTrafficView('flow')}
                 >
                   Flow
                 </Button>
                 <Button 
                   size="sm" 
                   variant="ghost"
                   className={trafficView === 'incidents' ? 'bg-primary text-white font-semibold' : ''}
                   onClick={() => setTrafficView('incidents')}
                 >
                   Incidents
                 </Button>
               </div>
             </CardContent>
           </Card>
         </div>

        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 z-10">
          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="rounded-none border-b hover:bg-gray-100">
                  <PlusIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-none hover:bg-gray-100">
                  <MinusIcon className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feed Section */}
      <section className="w-full px-6 py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Feed reports={reports} onFocusReport={handleFocusReport} />
          </div>
        </div>
      </section>

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
