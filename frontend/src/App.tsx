import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from './components/Header'
import MapComponent from './components/MapComponent'
import ModalWizard from './components/ModalWizard'
import Feed from './components/Feed'
import FAB from './components/FAB'
import RoutePlannerSection from './components/RoutePlannerSection'
import LiveTraffic from './components/LiveTraffic'
import MoodFilter from './components/MoodFilter'
import MoodAnalytics from './components/MoodAnalytics'
import PredictiveAnalytics from './components/PredictiveAnalytics'
import ServiceStatus from './components/ServiceStatus'
import { analyzeSentiment } from './utils/sentimentAnalysis'
import { ServiceWrapper } from './services/serviceWrapper'
import { CallbackServiceWrapper } from './services/callbackService'

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
  imageUrl?: string
  timestamp: Date
  sentiment?: {
    mood: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'concerned' | 'satisfied'
    score: number
    confidence: number
    keywords: string[]
    emotion: string
  }
  imageAnalysis?: {
    content: string[]
    confidence: number
    categories: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    predictions: {
      issueType: string
      urgency: number
      estimatedResponseTime: string
      recommendedActions: string[]
    }
    metadata: {
      fileSize: number
      dimensions: { width: number; height: number }
      format: string
      uploadTime: Date
    }
  }
}

function App() {
  const [reports, setReports] = useState<Report[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null)
  const [trafficView, setTrafficView] = useState<'all' | 'flow' | 'incidents'>('all')
  const [incidentType, setIncidentType] = useState<'all' | 'traffic' | 'accident' | 'blocking' | 'normal' | 'moderate' | 'heavy' | 'severe'>('all')
  const [moodFilter, setMoodFilter] = useState<'all' | 'positive' | 'negative' | 'frustrated' | 'concerned' | 'satisfied' | 'neutral'>('all')

  const [route, setRoute] = useState<{ origin: string; destination: string; routeType?: string; transportMode?: string } | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setIsModalOpen(true)
  }

  const handleSubmitReport = async (description: string, image?: File, callbackInfo?: { phoneNumber: string; requestCallback: boolean }) => {
    if (selectedLocation) {
      try {
        // Analyze sentiment of the report
        const sentiment = analyzeSentiment(description)
        
        // Create report object without ID (Firestore will generate it)
        const reportData = {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          description,
          timestamp: new Date(),
          sentiment
        }
        
        // Add report using service wrapper
        const savedReport = await ServiceWrapper.addReport(reportData)
        
        // Upload image with AI analysis if provided
        let finalReport = savedReport
        
        if (image) {
          try {
            const uploadResult = await ServiceWrapper.uploadImageWithAnalysis(image, savedReport.id, description)
            
            // Create updated report with image analysis
            finalReport = {
              ...savedReport,
              imageUrl: uploadResult.imageUrl,
              imageAnalysis: uploadResult.analysis
            }
            
            // Update the report in the service
            await ServiceWrapper.addReport({ 
              ...reportData, 
              imageUrl: uploadResult.imageUrl, 
              imageAnalysis: uploadResult.analysis
            })
          } catch (error) {
            console.error('Error uploading image with analysis:', error)
            // Fallback is handled by ServiceWrapper
          }
        }
        
        // Update local state with the final report (including image analysis if available)
        console.log('Final report with analysis:', finalReport)
        setReports(prev => [finalReport, ...prev])
        
        // Handle callback request if requested
        if (callbackInfo?.requestCallback && callbackInfo.phoneNumber) {
          try {
            console.log('Requesting callback for report:', finalReport.id)
            const callbackResponse = await CallbackServiceWrapper.requestCallback({
              phoneNumber: callbackInfo.phoneNumber,
              reportId: finalReport.id,
              description: finalReport.description,
              location: `${finalReport.latitude}, ${finalReport.longitude}`,
              issueType: finalReport.imageAnalysis?.predictions?.issueType || 'Traffic Issue',
              urgency: finalReport.imageAnalysis?.predictions?.urgency || 50
            })
            
            console.log('Callback scheduled successfully:', callbackResponse)
            // Show success notification
            alert(`✅ Callback scheduled! We'll call you at ${callbackInfo.phoneNumber} in 5 minutes.`)
          } catch (error) {
            console.error('Error scheduling callback:', error)
            // Show error notification but don't fail the report submission
            alert('⚠️ Report submitted successfully, but callback scheduling failed. We\'ll contact you through other means.')
          }
        }
        
        setIsModalOpen(false)
        setSelectedLocation(null)
      } catch (error) {
        console.error('Error submitting report:', error)
        // Handle error (show notification, etc.)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedLocation(null)
  }

  const handleFocusReport = (reportId: string) => {
    setFocusedReportId(reportId)
  }

  const handleRouteSelect = (origin: string, destination: string, routeType: string, transportMode: string) => {
    console.log('Route selected:', { origin, destination, routeType, transportMode })
    setRoute({ origin, destination, routeType, transportMode })
    // Here you would integrate with Google Directions API to draw the route on map
    // The routeType parameter can be used to configure the route calculation:
    // - 'fastest': Optimize for time
    // - 'shortest': Optimize for distance
    // - 'avoidTolls': Avoid toll roads
    // The transportMode parameter can be used to set the travel mode:
    // - 'driving': Car route
    // - 'walking': Walking route
    // - 'bicycling': Cycling route
    // - 'transit': Public transit route
  }

  const handleMoodFilterChange = (mood: 'all' | 'positive' | 'negative' | 'frustrated' | 'concerned' | 'satisfied' | 'neutral') => {
    setMoodFilter(mood)
  }

  // Load reports from Firestore on component mount
  useEffect(() => {
    const loadReports = async () => {
      try {
        const firestoreReports = await ServiceWrapper.getReports()
        setReports(firestoreReports)
      } catch (error) {
        console.error('Error loading reports:', error)
        // Fallback to sample data if Firestore fails
        setReports([
          {
            id: '1',
            description: 'Large pothole causing traffic congestion - very frustrated with this terrible road condition',
            latitude: 12.9716,
            longitude: 77.5946,
            timestamp: new Date(),
            sentiment: analyzeSentiment('Large pothole causing traffic congestion - very frustrated with this terrible road condition'),
            imageAnalysis: {
              content: ['road damage', 'infrastructure issue'],
              confidence: 0.85,
              categories: ['infrastructure', 'road'],
              severity: 'medium',
              predictions: {
                issueType: 'Road Damage',
                urgency: 65,
                estimatedResponseTime: 'High Priority (2-6 hours)',
                recommendedActions: ['Assess damage severity', 'Schedule repair work', 'Install warning signs']
              },
              metadata: {
                fileSize: 1024000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          },
          {
            id: '2',
            description: 'Traffic accident on main road - concerned about safety',
            latitude: 12.9789,
            longitude: 77.5917,
            timestamp: new Date(Date.now() - 300000),
            sentiment: analyzeSentiment('Traffic accident on main road - concerned about safety'),
            imageAnalysis: {
              content: ['traffic incident', 'emergency situation'],
              confidence: 0.92,
              categories: ['safety', 'emergency'],
              severity: 'critical',
              predictions: {
                issueType: 'Traffic Incident',
                urgency: 90,
                estimatedResponseTime: 'Immediate (0-2 hours)',
                recommendedActions: ['Immediate response required', 'Dispatch emergency services', 'Set up traffic diversion', 'Notify traffic police']
              },
              metadata: {
                fileSize: 2048000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          },
          {
            id: '3',
            description: 'Heavy traffic jam near mall - stuck here for hours',
            latitude: 12.9655,
            longitude: 77.5855,
            timestamp: new Date(Date.now() - 600000),
            sentiment: analyzeSentiment('Heavy traffic jam near mall - stuck here for hours'),
            imageAnalysis: {
              content: ['traffic congestion', 'road blockage'],
              confidence: 0.78,
              categories: ['traffic', 'congestion'],
              severity: 'high',
              predictions: {
                issueType: 'Traffic Congestion',
                urgency: 75,
                estimatedResponseTime: 'High Priority (2-6 hours)',
                recommendedActions: ['Analyze traffic patterns', 'Implement traffic diversion', 'Update traffic signals']
              },
              metadata: {
                fileSize: 1536000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          },
          {
            id: '4',
            description: 'Road blocking due to construction work',
            latitude: 12.9730,
            longitude: 77.6090,
            timestamp: new Date(Date.now() - 900000),
            sentiment: analyzeSentiment('Road blocking due to construction work'),
            imageAnalysis: {
              content: ['construction', 'road blocking'],
              confidence: 0.88,
              categories: ['construction', 'blocking'],
              severity: 'medium',
              predictions: {
                issueType: 'Road Blocking',
                urgency: 60,
                estimatedResponseTime: 'Medium Priority (4-8 hours)',
                recommendedActions: ['Check construction permits', 'Set up detour signs', 'Coordinate with construction team']
              },
              metadata: {
                fileSize: 1280000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          },
          {
            id: '5',
            description: 'Normal traffic flow on main highway',
            latitude: 12.9810,
            longitude: 77.5940,
            timestamp: new Date(Date.now() - 1200000),
            sentiment: analyzeSentiment('Normal traffic flow on main highway'),
            imageAnalysis: {
              content: ['normal flow', 'clear road'],
              confidence: 0.95,
              categories: ['traffic', 'flow'],
              severity: 'low',
              predictions: {
                issueType: 'Normal Flow',
                urgency: 10,
                estimatedResponseTime: 'No action required',
                recommendedActions: ['Monitor traffic patterns', 'Maintain current flow']
              },
              metadata: {
                fileSize: 960000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          },
          {
            id: '6',
            description: 'Moderate congestion on ring road',
            latitude: 12.9550,
            longitude: 77.5800,
            timestamp: new Date(Date.now() - 1500000),
            sentiment: analyzeSentiment('Moderate congestion on ring road'),
            imageAnalysis: {
              content: ['moderate congestion', 'slow traffic'],
              confidence: 0.82,
              categories: ['traffic', 'congestion'],
              severity: 'medium',
              predictions: {
                issueType: 'Moderate Congestion',
                urgency: 45,
                estimatedResponseTime: 'Medium Priority (4-8 hours)',
                recommendedActions: ['Monitor traffic signals', 'Adjust timing if needed', 'Consider alternative routes']
              },
              metadata: {
                fileSize: 1120000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          },
          {
            id: '7',
            description: 'Severe congestion on airport road',
            latitude: 12.9900,
            longitude: 77.6000,
            timestamp: new Date(Date.now() - 1800000),
            sentiment: analyzeSentiment('Severe congestion on airport road'),
            imageAnalysis: {
              content: ['severe congestion', 'traffic jam'],
              confidence: 0.90,
              categories: ['traffic', 'congestion'],
              severity: 'critical',
              predictions: {
                issueType: 'Severe Congestion',
                urgency: 85,
                estimatedResponseTime: 'Immediate (0-2 hours)',
                recommendedActions: ['Implement emergency traffic diversion', 'Deploy traffic police', 'Update navigation apps']
              },
              metadata: {
                fileSize: 1760000,
                dimensions: { width: 1920, height: 1080 },
                format: 'image/jpeg',
                uploadTime: new Date()
              }
            }
          }
        ])
      }
    }

    loadReports()
  }, [])

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
      <ServiceStatus />
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
             <RoutePlannerSection
               onRouteSelect={handleRouteSelect}
               route={route}
             />

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
              <MoodFilter
                moodFilter={moodFilter}
                onMoodFilterChange={handleMoodFilterChange}
              />
              <MapComponent
                reports={reports}
                onMapClick={handleMapClick}
                focusedReportId={focusedReportId || undefined}
                trafficView={trafficView}
                incidentType={incidentType}
                moodFilter={moodFilter}
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

         {/* Incidents Legend with Toggle */}
         {trafficView === 'incidents' && (
           <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-32 z-10">
             <Card className="bg-white/90 backdrop-blur-2xl shadow-glass border border-white/30">
               <CardContent className="p-4">
                 <div className="space-y-4">
                                       {/* Incident Type Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Incident Type</div>
                        {incidentType !== 'all' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIncidentType('all')}
                            className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant={incidentType === 'all' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('all')}
                          className="text-xs h-8"
                        >
                          All
                        </Button>
                        <Button
                          size="sm"
                          variant={incidentType === 'traffic' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('traffic')}
                          className="text-xs h-8"
                        >
                          Traffic
                        </Button>
                        <Button
                          size="sm"
                          variant={incidentType === 'accident' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('accident')}
                          className="text-xs h-8"
                        >
                          Accident
                        </Button>
                        <Button
                          size="sm"
                          variant={incidentType === 'blocking' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('blocking')}
                          className="text-xs h-8"
                        >
                          Road Blocking
                        </Button>
                      </div>
                    </div>

                                       {/* Traffic Flow Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Traffic Flow</div>
                        {incidentType !== 'all' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIncidentType('all')}
                            className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant={incidentType === 'normal' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('normal')}
                          className="text-xs h-8"
                        >
                          Normal Flow
                        </Button>
                        <Button
                          size="sm"
                          variant={incidentType === 'moderate' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('moderate')}
                          className="text-xs h-8"
                        >
                          Moderate
                        </Button>
                        <Button
                          size="sm"
                          variant={incidentType === 'heavy' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('heavy')}
                          className="text-xs h-8"
                        >
                          Heavy Traffic
                        </Button>
                        <Button
                          size="sm"
                          variant={incidentType === 'severe' ? 'default' : 'outline'}
                          onClick={() => setIncidentType('severe')}
                          className="text-xs h-8"
                        >
                          Severe
                        </Button>
                      </div>
                    </div>

                   {/* Legend */}
                   <div className="border-t border-gray-200 pt-3">
                     <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Legend</div>
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Traffic incident</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Accident</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Road blocking</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Normal flow</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Moderate congestion</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Heavy traffic</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                         <span className="text-xs font-medium text-gray-800">Severe congestion</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}
      </section>

                   {/* Predictive Analytics Section */}
                   <section className="px-6 py-8">
                     <div className="max-w-7xl mx-auto">
                       <PredictiveAnalytics />
                     </div>
                   </section>

                   {/* Mood Analytics Section */}
                   <section className="px-6 py-8">
                     <div className="max-w-7xl mx-auto">
                       <MoodAnalytics reports={reports} />
                     </div>
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
                       <Feed reports={reports} onFocusReport={handleFocusReport} />
                     </div>
                   </section>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-4"
          onClick={() => window.open('https://wa.me/14155238886?text=Hi! I need help with traffic reporting on CityPulse.', '_blank')}
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
