import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
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
  const [reports, setReports] = useState<Report[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null)
  const [showFeed, setShowFeed] = useState(true)

  // Add scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-[slideUp_0.6s_ease-out]')
        }
      })
    }, observerOptions)

    // Observe all elements that should animate on scroll
    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

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
      setReports(prev => [newReport, ...prev]) // Add to beginning for feed
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

  const handleReportClick = () => {
    // For mobile, we'll use the FAB. For desktop, this is handled by the header button
    if (window.innerWidth >= 768) {
      // On desktop, we need a location first, so this would typically be disabled
      // or we could open a location picker
      console.log('Desktop report button clicked')
    }
  }

  return (
    <div className="min-h-screen bg-background text-text">
                   <Header
               onReportClick={handleReportClick}
               onToggleFeed={() => setShowFeed(!showFeed)}
               showFeed={showFeed}
             />

             {/* Title Section */}
             <div className="pt-20 pb-4 bg-white border-b border-border">
               <div className="max-w-7xl mx-auto px-4 md:px-6">
                 <div className="text-center">
                   <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Bengaluru traffic</h1>
                   <div className="flex items-center justify-center gap-2">
                     <span className="text-2xl">🇮🇳</span>
                     <span className="text-black">India</span>
                   </div>
                 </div>
               </div>
             </div>

             {/* Main Content */}
             <div className="flex h-screen bg-white"> {/* pt-24 to account for fixed header + title */}
        {/* Map Section */}
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <motion.div 
              className="bg-white rounded-lg shadow-card p-3 border border-border"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md">
                  All traffic
                </button>
                <button className="px-3 py-1.5 text-black text-sm font-medium hover:text-black transition-colors">
                  Traffic flow
                </button>
                <button className="px-3 py-1.5 text-black text-sm font-medium hover:text-black transition-colors">
                  Traffic incidents
                </button>
              </div>
            </motion.div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-10">
            <motion.div 
              className="bg-white rounded-lg shadow-card border border-border"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col">
                <button className="p-2 hover:bg-neutral-light transition-colors border-b border-border">
                  <PlusIcon className="w-4 h-4 text-black" />
                </button>
                <button className="p-2 hover:bg-neutral-light transition-colors">
                  <MinusIcon className="w-4 h-4 text-black" />
                </button>
              </div>
            </motion.div>
          </div>

          <MapComponent 
            reports={reports} 
            onMapClick={handleMapClick}
            focusedReportId={focusedReportId || undefined}
          />
        </motion.div>

        {/* Feed Section - Desktop */}
        <AnimatePresence>
          {showFeed && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="hidden md:block"
            >
              <Feed 
                reports={reports} 
                onFocusReport={handleFocusReport}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Section - Mobile (Slide up panel) */}
        <AnimatePresence>
          {showFeed && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl max-h-[60vh]"
            >
              <div className="p-4">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <Feed 
                  reports={reports} 
                  onFocusReport={handleFocusReport}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FAB 
        onClick={() => {
          // For mobile, we'll need to get user's location or let them click on map
          console.log('FAB clicked - need to implement location selection')
        }}
        show={!isModalOpen}
      />

      {/* Modal Wizard */}
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
