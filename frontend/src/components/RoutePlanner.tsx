import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, ArrowPathIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RoutePlannerProps {
  onRouteSelect: (origin: string, destination: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Place {
  place_id: string
  description: string
}

const RoutePlanner = ({ onRouteSelect, open, onOpenChange }: RoutePlannerProps) => {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState<Place[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<Place[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  
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

  // Handle route planning
  const handlePlanRoute = async () => {
    if (!origin || !destination) return
    
    setIsLoading(true)
    try {
      onRouteSelect(origin, destination)
      onOpenChange(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 text-blue-600" />
            Plan Your Route
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Find the best route from point A to point B with real-time traffic updates
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Route Details Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* From Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
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
                  className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* To Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="p-4 border-2 border-blue-400 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="font-semibold text-blue-800">Fastest Route</span>
                </div>
                <div className="text-sm text-blue-600">Recommended</div>
              </div>
              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-semibold text-gray-700">Shortest Route</span>
                </div>
                <div className="text-sm text-gray-500">Less distance</div>
              </div>
              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-semibold text-gray-700">Avoid Tolls</span>
                </div>
                <div className="text-sm text-gray-500">Save money</div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <Button
              onClick={handlePlanRoute}
              disabled={!origin || !destination || isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Planning Route...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  PLAN ROUTE
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoutePlanner 