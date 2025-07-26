import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, ArrowPathIcon, MapIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface RoutePlannerSectionProps {
  onRouteSelect: (origin: string, destination: string, routeType: string, transportMode: string) => void
  route?: { origin: string; destination: string } | null
}

interface Place {
  place_id: string
  description: string
}

const RoutePlannerSection = ({ onRouteSelect, route }: RoutePlannerSectionProps) => {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState<Place[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<Place[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedRouteType, setSelectedRouteType] = useState('fastest')
  const [selectedTransportMode, setSelectedTransportMode] = useState('driving')
  const [routeComparison, setRouteComparison] = useState<{
    fastest: { time: string; distance: string; tolls: number; cost: string } | null
    shortest: { time: string; distance: string; tolls: number; cost: string } | null
    avoidTolls: { time: string; distance: string; tolls: number; cost: string } | null
  }>({
    fastest: null,
    shortest: null,
    avoidTolls: null
  })


  
  const originTimeoutRef = useRef<number | null>(null)
  const destinationTimeoutRef = useRef<number | null>(null)



  // Autocomplete function for Google Places API
  const getPlaceSuggestions = async (input: string): Promise<Place[]> => {
    if (!input || input.length < 3) return []
    
    try {
      const service = new google.maps.places.AutocompleteService()
      const response = await service.getPlacePredictions({
        input,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['establishment', 'geocode']
      })
      
      return response.predictions.map(prediction => ({
        place_id: prediction.place_id,
        description: prediction.description
      }))
    } catch (error) {
      console.error('Error fetching place suggestions:', error)
      return []
    }
  }

  // Handle origin input changes
  const handleOriginChange = (value: string) => {
    setOrigin(value)
    setShowOriginSuggestions(true)
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current)
    }
    
    originTimeoutRef.current = window.setTimeout(async () => {
      const suggestions = await getPlaceSuggestions(value)
      setOriginSuggestions(suggestions)
    }, 300)
  }

  // Handle destination input changes
  const handleDestinationChange = (value: string) => {
    setDestination(value)
    setShowDestinationSuggestions(true)
    
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current)
    }
    
    destinationTimeoutRef.current = window.setTimeout(async () => {
      const suggestions = await getPlaceSuggestions(value)
      setDestinationSuggestions(suggestions)
    }, 300)
  }

  // Select origin from suggestions
  const selectOrigin = (place: Place) => {
    setOrigin(place.description)
    setOriginSuggestions([])
    setShowOriginSuggestions(false)
  }

  // Select destination from suggestions
  const selectDestination = (place: Place) => {
    setDestination(place.description)
    setDestinationSuggestions([])
    setShowDestinationSuggestions(false)
  }

  // Swap origin and destination
  const swapLocations = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  // Calculate route comparison
  const calculateRouteComparison = async () => {
    if (!origin || !destination) return
    
    try {
      const directionsService = new google.maps.DirectionsService()
      
      // Get the appropriate travel mode
      const getTravelMode = (mode: string) => {
        switch (mode) {
          case 'walking':
            return google.maps.TravelMode.WALKING
          case 'bicycling':
            return google.maps.TravelMode.BICYCLING
          case 'transit':
            return google.maps.TravelMode.TRANSIT
          case 'driving':
          default:
            return google.maps.TravelMode.DRIVING
        }
      }
      
      const travelMode = getTravelMode(selectedTransportMode)
      console.log('Calculating routes for transport mode:', selectedTransportMode, travelMode)
      
      // For non-driving modes, we only calculate one route type
      if (selectedTransportMode !== 'driving') {
        const result = await directionsService.route({
          origin,
          destination,
          travelMode,
        })
        
                           const extractRouteInfo = (result: google.maps.DirectionsResult) => {
            const route = result.routes[0]
            const leg = route.legs[0]
            const time = leg.duration?.text || 'N/A'
            const distance = leg.distance?.text || 'N/A'
            const tolls = 0 // No tolls for non-driving modes
            const cost = '₹0' // No cost for walking/cycling, transit cost would need separate calculation
            return { time, distance, tolls, cost }
          }
          
          const routeInfo = extractRouteInfo(result)
          setRouteComparison({
            fastest: routeInfo,
            shortest: routeInfo,
            avoidTolls: routeInfo
          })
         
         return
      }
      
      // For driving mode, calculate all three route types
      const fastestResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      
      const shortestResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      })
      
      const avoidTollsResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
      })
      
      // Extract route information
      const extractRouteInfo = (result: google.maps.DirectionsResult) => {
        const route = result.routes[0]
        const leg = route.legs[0]
        const time = leg.duration?.text || 'N/A'
        const distance = leg.distance?.text || 'N/A'
        const tolls = Math.floor(Math.random() * 3) // Simulated toll count
        const cost = `₹${Math.floor(Math.random() * 200 + 50)}` // Simulated cost
        return { time, distance, tolls, cost }
      }
      
      setRouteComparison({
        fastest: extractRouteInfo(fastestResult),
        shortest: extractRouteInfo(shortestResult),
        avoidTolls: extractRouteInfo(avoidTollsResult)
      })
    } catch (error) {
      console.error('Error calculating route comparison:', error)
    }
  }

  // Handle route planning
    const handlePlanRoute = async () => {
    if (!origin || !destination) return

    setIsLoading(true)
    try {
      await calculateRouteComparison()
      onRouteSelect(origin, destination, selectedRouteType, selectedTransportMode)
    } catch (error) {
      console.error('Error planning route:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOriginSuggestions(false)
      setShowDestinationSuggestions(false)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])



  // Recalculate routes when transport mode changes
  useEffect(() => {
    if (origin && destination) {
      calculateRouteComparison()
    }
  }, [selectedTransportMode])

  return (
    <section className="w-full px-3 py-2 relative">
      <div className="w-full max-w-6xl mx-auto">
        {/* Compact Route Planner */}
        <Card className="bg-white/90 backdrop-blur-xl shadow-glass border border-white/30 overflow-hidden">
          <CardContent className="p-4">
            {/* Header Inside Card */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-600" />
                Plan Your Route
              </h2>
              <p className="text-gray-600 text-sm">Find the best route from point A to point B with real-time traffic updates</p>
            </div>
            
            <div className="space-y-4">
              {/* Route Input Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  {/* From */}
                  <div className="flex-1 relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">From</label>
                    <div className={`relative p-3 rounded-md border-2 transition-all duration-200 ${
                      showOriginSuggestions ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <Input
                        type="text"
                        placeholder="Enter starting point"
                        value={origin}
                        onChange={(e) => handleOriginChange(e.target.value)}
                        className="border-0 p-0 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none bg-transparent"
                        onFocus={() => setShowOriginSuggestions(true)}
                      />
                      {showOriginSuggestions && originSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-32 overflow-y-auto">
                          {originSuggestions.map((place) => (
                            <button
                              key={place.place_id}
                              onClick={() => selectOrigin(place)}
                              className="w-full text-left px-2 py-1 hover:bg-gray-50 text-xs border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-800">{place.description.split(',')[0]}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex items-center justify-center pt-6">
                    <button
                      onClick={swapLocations}
                      className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-md"
                    >
                      <ArrowPathIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* To */}
                  <div className="flex-1 relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">To</label>
                    <div className={`relative p-3 rounded-md border-2 transition-all duration-200 ${
                      showDestinationSuggestions ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <Input
                        type="text"
                        placeholder="Enter destination"
                        value={destination}
                        onChange={(e) => handleDestinationChange(e.target.value)}
                        className="border-0 p-0 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none bg-transparent"
                        onFocus={() => setShowDestinationSuggestions(true)}
                      />
                      {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-32 overflow-y-auto">
                          {destinationSuggestions.map((place) => (
                            <button
                              key={place.place_id}
                              onClick={() => selectDestination(place)}
                              className="w-full text-left px-2 py-1 hover:bg-gray-50 text-xs border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                              <div className="font-medium text-gray-800">{place.description.split(',')[0]}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Mode Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Mode of Transport</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedTransportMode('driving')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedTransportMode === 'driving' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedTransportMode === 'driving' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                        </svg>
                      </div>
                      <span className={`text-xs font-semibold ${
                        selectedTransportMode === 'driving' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Driving</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedTransportMode('walking')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedTransportMode === 'walking' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedTransportMode === 'walking' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span className={`text-xs font-semibold ${
                        selectedTransportMode === 'walking' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Walking</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedTransportMode('bicycling')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedTransportMode === 'bicycling' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedTransportMode === 'bicycling' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                        </svg>
                      </div>
                      <span className={`text-xs font-semibold ${
                        selectedTransportMode === 'bicycling' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Cycling</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedTransportMode('transit')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedTransportMode === 'transit' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedTransportMode === 'transit' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                        </svg>
                      </div>
                      <span className={`text-xs font-semibold ${
                        selectedTransportMode === 'transit' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Transit</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Route Options Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Route Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedRouteType('fastest')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedRouteType === 'fastest' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedRouteType === 'fastest' ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-semibold ${
                        selectedRouteType === 'fastest' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Fastest Route</span>
                    </div>
                    <div className={`text-xs ${
                      selectedRouteType === 'fastest' ? 'text-blue-600' : 'text-gray-500'
                    }`}>Recommended</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedRouteType('shortest')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedRouteType === 'shortest' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedRouteType === 'shortest' ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-semibold ${
                        selectedRouteType === 'shortest' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Shortest Route</span>
                    </div>
                    <div className={`text-xs ${
                      selectedRouteType === 'shortest' ? 'text-blue-600' : 'text-gray-500'
                    }`}>Less distance</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedRouteType('avoidTolls')}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                      selectedRouteType === 'avoidTolls' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedRouteType === 'avoidTolls' ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-semibold ${
                        selectedRouteType === 'avoidTolls' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Avoid Tolls</span>
                    </div>
                    <div className={`text-xs ${
                      selectedRouteType === 'avoidTolls' ? 'text-blue-600' : 'text-gray-500'
                    }`}>Save money</div>
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handlePlanRoute}
                  disabled={!origin || !destination || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Planning Route...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapIcon className="w-5 h-5" />
                      PLAN ROUTE
                    </div>
                  )}
                </Button>
              </div>

                              {/* Route Comparison (Collapsible) */}
                {routeComparison.fastest && routeComparison.shortest && routeComparison.avoidTolls && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">Fastest</div>
                        <div className="text-gray-600">{routeComparison.fastest.time}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">Shortest</div>
                        <div className="text-gray-600">{routeComparison.shortest.distance}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">No Tolls</div>
                        <div className="text-gray-600">₹0</div>
                      </div>
                    </div>
                  </div>
                )}


            </div>
          </CardContent>
        </Card>

        {/* Compact Active Route Display */}
        {route && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-xs">
              <MapIcon className="w-3 h-3 text-green-600" />
              <span className="font-medium text-green-800">Active Route:</span>
              <span className="text-green-700">{route.origin} → {route.destination}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default RoutePlannerSection 