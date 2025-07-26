import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">Route Planner</DialogTitle>
          <DialogDescription>
            Plan your route from point A to point B using Google Places
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Origin Input */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="w-4 h-4 text-green-600" />
              <label className="text-sm font-medium text-gray-700">From</label>
            </div>
            <Input
              type="text"
              placeholder="Enter starting point"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="bg-white/70 backdrop-blur-sm border-white/30 focus:bg-white/90"
              onFocus={() => setShowOriginSuggestions(true)}
            />
            {showOriginSuggestions && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {originSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => selectOrigin(place)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    {place.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Arrow Icon */}
          <div className="flex justify-center">
            <ArrowRightIcon className="w-5 h-5 text-gray-400 rotate-90" />
          </div>

          {/* Destination Input */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="w-4 h-4 text-red-600" />
              <label className="text-sm font-medium text-gray-700">To</label>
            </div>
            <Input
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="bg-white/70 backdrop-blur-sm border-white/30 focus:bg-white/90"
              onFocus={() => setShowDestinationSuggestions(true)}
            />
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {destinationSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => selectDestination(place)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    {place.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plan Route Button */}
          <Button
            onClick={handlePlanRoute}
            disabled={!origin || !destination || isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Planning Route...' : 'Plan Route'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoutePlanner 