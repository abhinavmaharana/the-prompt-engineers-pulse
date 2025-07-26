import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, ArrowPathIcon, CalendarIcon, ClockIcon, MapIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface RoutePlannerSectionProps {
  onRouteSelect: (origin: string, destination: string, routeType: string) => void
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
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedRouteType, setSelectedRouteType] = useState('fastest')
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

  // Get current date and time for defaults
  useEffect(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    }).replace(' ', ' ')
    const timeStr = now.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    setSelectedDate(dateStr)
    setSelectedTime(timeStr)
  }, [])

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
      
      // Calculate fastest route
      const fastestResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      
      // Calculate shortest route
      const shortestResult = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      })
      
      // Calculate avoid tolls route
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
      onRouteSelect(origin, destination, selectedRouteType)
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

  return (
    <section className="w-full px-6 py-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <MapPinIcon className="w-8 h-8 text-blue-600" />
            Plan Your Route
          </h2>
          <p className="text-gray-600 text-lg">Find the best route from point A to point B with real-time traffic updates</p>
        </div>

        {/* Main Route Planner Card */}
        <Card className="bg-white/80 backdrop-blur-xl shadow-glass border border-white/30 overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Route Details Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* From Field */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">From</label>
                    <div className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      showOriginSuggestions ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <Input
                        type="text"
                        placeholder="Enter starting point"
                        value={origin}
                        onChange={(e) => handleOriginChange(e.target.value)}
                        className="border-0 p-0 text-lg font-semibold text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none bg-transparent"
                        onFocus={() => setShowOriginSuggestions(true)}
                      />
                      {origin && (
                        <div className="text-sm text-gray-500 mt-1">
                          📍 Starting location
                        </div>
                      )}
                      {showOriginSuggestions && originSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                          {originSuggestions.map((place) => (
                            <button
                              key={place.place_id}
                              onClick={() => selectOrigin(place)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-800">{place.description.split(',')[0]}</div>
                              <div className="text-gray-500 text-xs">{place.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={swapLocations}
                      className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-md"
                    >
                      <ArrowPathIcon className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  {/* To Field */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">To</label>
                    <div className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                      showDestinationSuggestions ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <Input
                        type="text"
                        placeholder="Enter destination"
                        value={destination}
                        onChange={(e) => handleDestinationChange(e.target.value)}
                        className="border-0 p-0 text-lg font-semibold text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none bg-transparent"
                        onFocus={() => setShowDestinationSuggestions(true)}
                      />
                      {destination && (
                        <div className="text-sm text-gray-500 mt-1">
                          🎯 Destination
                        </div>
                      )}
                      {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                          {destinationSuggestions.map((place) => (
                            <button
                              key={place.place_id}
                              onClick={() => selectDestination(place)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-800">{place.description.split(',')[0]}</div>
                              <div className="text-gray-500 text-xs">{place.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date and Time Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">When do you want to travel?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      Departure Date
                    </label>
                    <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="text-lg font-semibold text-gray-800">{selectedDate}</div>
                      <div className="text-sm text-gray-500">Today</div>
                    </div>
                  </div>

                  {/* Time Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                      Preferred Time
                    </label>
                    <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="text-lg font-semibold text-gray-800">{selectedTime}</div>
                      <div className="text-sm text-gray-500">Current time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Options Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedRouteType('fastest')}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      selectedRouteType === 'fastest' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedRouteType === 'fastest' ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <span className={`font-semibold ${
                        selectedRouteType === 'fastest' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Fastest Route</span>
                    </div>
                    <div className={`text-sm ${
                      selectedRouteType === 'fastest' ? 'text-blue-600' : 'text-gray-500'
                    }`}>Recommended</div>
                    
                    {routeComparison.fastest && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.fastest.time}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Distance:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.fastest.distance}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tolls:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.fastest.tolls}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.fastest.cost}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setSelectedRouteType('shortest')}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      selectedRouteType === 'shortest' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedRouteType === 'shortest' ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <span className={`font-semibold ${
                        selectedRouteType === 'shortest' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Shortest Route</span>
                    </div>
                    <div className={`text-sm ${
                      selectedRouteType === 'shortest' ? 'text-blue-600' : 'text-gray-500'
                    }`}>Less distance</div>
                    
                    {routeComparison.shortest && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.shortest.time}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Distance:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.shortest.distance}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tolls:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.shortest.tolls}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.shortest.cost}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setSelectedRouteType('avoidTolls')}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      selectedRouteType === 'avoidTolls' 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedRouteType === 'avoidTolls' ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <span className={`font-semibold ${
                        selectedRouteType === 'avoidTolls' ? 'text-blue-800' : 'text-gray-700'
                      }`}>Avoid Tolls</span>
                    </div>
                    <div className={`text-sm ${
                      selectedRouteType === 'avoidTolls' ? 'text-blue-600' : 'text-gray-500'
                    }`}>Save money</div>
                    
                    {routeComparison.avoidTolls && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.avoidTolls.time}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Distance:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.avoidTolls.distance}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tolls:</span>
                            <div className="font-semibold text-green-600">0</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost:</span>
                            <div className="font-semibold text-gray-800">{routeComparison.avoidTolls.cost}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
                
                {/* Route Comparison Summary */}
                {routeComparison.fastest && routeComparison.shortest && routeComparison.avoidTolls && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Route Comparison Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 mb-1">Fastest Route</div>
                        <div className="text-gray-600">Best for time-sensitive trips</div>
                        <div className="mt-2 font-semibold text-gray-800">{routeComparison.fastest.time}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600 mb-1">Shortest Route</div>
                        <div className="text-gray-600">Best for fuel efficiency</div>
                        <div className="mt-2 font-semibold text-gray-800">{routeComparison.shortest.distance}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600 mb-1">Avoid Tolls</div>
                        <div className="text-gray-600">Best for cost savings</div>
                        <div className="mt-2 font-semibold text-gray-800">₹0 tolls</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handlePlanRoute}
                  disabled={!origin || !destination || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-12 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Planning Route...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <MapIcon className="w-6 h-6" />
                      PLAN ROUTE
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Route Display */}
        {route && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <MapIcon className="w-6 h-6 text-green-600" />
              <span className="font-bold text-green-800 text-lg">Active Route</span>
            </div>
            <div className="text-green-700 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">From:</span>
                <span>{route.origin}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">To:</span>
                <span>{route.destination}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default RoutePlannerSection 