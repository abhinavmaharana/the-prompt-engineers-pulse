import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  MapPinIcon,
  PhotoIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ModalWizardProps {
  latitude: number
  longitude: number
  onSubmit: (description: string, image?: File) => void
  onClose: () => void
}

type Step = 'location' | 'details' | 'confirm'

const ModalWizard = ({ latitude, longitude, onSubmit, onClose }: ModalWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('location')
  const [description, setDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [locationType, setLocationType] = useState<'coordinates' | 'manual'>('coordinates')
  const [manualLocation, setManualLocation] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<{ place_id: string; description: string }[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const locationTimeoutRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps: { key: Step; title: string; icon: React.ReactNode }[] = [
    { key: 'location', title: 'Location', icon: <MapPinIcon className="w-5 h-5" /> },
    { key: 'details', title: 'Details', icon: <PhotoIcon className="w-5 h-5" /> },
    { key: 'confirm', title: 'Confirm', icon: <CheckIcon className="w-5 h-5" /> }
  ]

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    onSubmit(description.trim(), selectedImage || undefined)
  }

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'location':
        return locationType === 'coordinates' || (locationType === 'manual' && manualLocation.trim().length > 0)
      case 'details':
        return selectedImage !== null // Photo is mandatory
      case 'confirm':
        return true
      default:
        return false
    }
  }

  // Autocomplete function for Google Places API
  const getLocationSuggestions = async (input: string): Promise<{ place_id: string; description: string }[]> => {
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
      console.error('Error fetching location suggestions:', error)
      return []
    }
  }

  // Handle manual location input changes
  const handleManualLocationChange = (value: string) => {
    setManualLocation(value)
    setShowLocationSuggestions(true)
    
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current)
    }
    
    locationTimeoutRef.current = window.setTimeout(async () => {
      const suggestions = await getLocationSuggestions(value)
      setLocationSuggestions(suggestions)
    }, 300)
  }

  // Select location from suggestions
  const selectLocation = (place: { place_id: string; description: string }) => {
    setManualLocation(place.description)
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
  }

  const getLocationDisplay = () => {
    if (locationType === 'coordinates') {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
    return manualLocation || 'Location not specified'
  }

  // Clear location suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLocationSuggestions(false)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] flex flex-col border"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-black">Report Issue</h2>
              <p className="text-sm text-black mt-0.5">Help improve your city</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-light transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-black" />
            </motion.button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep
              const isCompleted = steps.findIndex(s => s.key === currentStep) > index
              
              return (
                <div key={step.key} className="flex items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-soft ${
                      isActive ? 'bg-primary text-white' : 
                      isCompleted ? 'bg-success text-white' : 
                      'bg-neutral-light text-black'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isCompleted ? <CheckIcon className="w-8 h-8 text-white bg-green-500 rounded-lg" /> : step.icon}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 rounded-full ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[150px]"
            >
              {currentStep === 'location' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MapPinIcon className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-base font-medium text-black mb-2">Set Location</h3>
                    <p className="text-sm text-black">Choose how to specify the issue location.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Location Type Selection */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          variant={locationType === 'coordinates' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLocationType('coordinates')}
                          className="flex-1"
                        >
                          Use Coordinates
                        </Button>
                        <Button
                          variant={locationType === 'manual' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLocationType('manual')}
                          className="flex-1"
                        >
                          Type Location
                        </Button>
                      </div>
                    </div>

                    {/* Coordinates Display */}
                    {locationType === 'coordinates' && (
                      <div className="bg-neutral-light rounded-lg p-4 border">
                        <div className="text-xs font-medium text-black mb-2">📍 Coordinates</div>
                        <div className="font-mono text-sm text-black bg-white rounded-lg p-3 shadow-soft">
                          {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </div>
                      </div>
                    )}

                                         {/* Manual Location Input */}
                     {locationType === 'manual' && (
                       <div className="space-y-3">
                         <div>
                           <label className="block text-xs font-medium text-black mb-2">📍 Location</label>
                           <div className="relative">
                             <Input
                               type="text"
                               value={manualLocation}
                               onChange={(e) => handleManualLocationChange(e.target.value)}
                               placeholder="e.g., MG Road, Bengaluru"
                               className="w-full p-3 border text-black rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-soft pr-10"
                               onFocus={() => setShowLocationSuggestions(true)}
                             />
                             <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                             
                             {showLocationSuggestions && locationSuggestions.length > 0 && (
                               <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                 {locationSuggestions.map((place) => (
                                   <button
                                     key={place.place_id}
                                     onClick={() => selectLocation(place)}
                                     className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                                   >
                                     {place.description}
                                   </button>
                                 ))}
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              )}

                                   {currentStep === 'details' && (
                       <div className="space-y-4">
                         <div className="text-center">
                           <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                             <PhotoIcon className="w-6 h-6 text-primary" />
                           </div>
                           <h3 className="text-base font-medium text-black mb-2">Add Photo & Description</h3>
                           <p className="text-sm text-black">Photo is required, description is optional.</p>
                         </div>

                         {/* Photo Upload Section */}
                         <div className="space-y-3">
                           <label className="block text-xs font-medium text-black mb-2">📸 Photo (Required)</label>
                           <motion.div
                             whileHover={{ scale: 1.02 }}
                             className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors bg-white shadow-soft ${
                               isDragOver ? 'border-primary bg-primary/5' : selectedImage ? 'border-green-500 bg-green-50' : 'border-red-300 bg-red-50'
                             }`}
                             onDragOver={handleDragOver}
                             onDragLeave={handleDragLeave}
                             onDrop={handleDrop}
                           >
                             <input
                               ref={fileInputRef}
                               type="file"
                               accept="image/*"
                               onChange={handleImageChange}
                               className="hidden"
                             />

                             {imagePreview ? (
                               <div className="space-y-3">
                                 <img
                                   src={imagePreview}
                                   alt="Preview"
                                   className="w-full h-32 object-cover rounded-lg mx-auto shadow-soft"
                                 />
                                 <button
                                   onClick={() => fileInputRef.current?.click()}
                                   className="text-black hover:text-primary-hover font-medium text-sm"
                                 >
                                   Change Photo
                                 </button>
                               </div>
                             ) : (
                               <div className="space-y-3">
                                 <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                   <PhotoIcon className="w-6 h-6 text-black" />
                                 </div>
                                 <div>
                                   <button
                                     onClick={() => fileInputRef.current?.click()}
                                     className="text-black hover:text-primary-hover font-medium text-sm"
                                   >
                                     Click to upload
                                   </button>
                                   <span className="text-black text-sm"> or drag and drop</span>
                                 </div>
                                 <p className="text-xs text-black">PNG, JPG up to 10MB</p>
                                 {!selectedImage && (
                                   <p className="text-xs text-red-500 font-medium">Photo is required to continue</p>
                                 )}
                               </div>
                             )}
                           </motion.div>
                         </div>

                         {/* Description Section */}
                         <div className="space-y-3">
                           <label className="block text-xs font-medium text-black mb-2">📝 Description (Optional)</label>
                           <textarea
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                             placeholder="e.g., Large pothole causing traffic, broken street light..."
                             className="w-full p-3 border text-black rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white shadow-soft"
                             rows={3}
                           />
                         </div>
                       </div>
                     )}

              

              {currentStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-medium text-black mb-2">Confirm Report</h3>
                    <p className="text-sm text-black">Please review your report before submitting.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-neutral-light rounded-lg p-4 border">
                      <div className="text-xs font-medium text-black mb-2">📍 Location</div>
                      <div className="font-mono text-black bg-white rounded-lg p-3 shadow-soft text-sm">{getLocationDisplay()}</div>
                    </div>
                    
                    {description && (
                      <div className="bg-neutral-light rounded-lg p-4 border">
                        <div className="text-xs font-medium text-black mb-2">📝 Description</div>
                        <div className="text-black bg-white rounded-lg p-3 shadow-soft text-sm">{description}</div>
                      </div>
                    )}
                    
                    {imagePreview && (
                      <div className="bg-neutral-light rounded-lg p-4 border">
                        <div className="text-xs font-medium text-black mb-2">📸 Photo</div>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg shadow-soft"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 'location'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              currentStep === 'location'
                ? 'text-black cursor-not-allowed'
                : 'text-black hover:bg-neutral-light'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={currentStep === 'confirm' ? handleSubmit : nextStep}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-soft ${
              canProceed()
                ? 'bg-primary hover:bg-primary-hover text-white hover:shadow-medium'
                : 'bg-border text-black cursor-not-allowed'
            }`}
          >
            {currentStep === 'confirm' ? 'Submit Report' : 'Next'}
            {currentStep !== 'confirm' && <ArrowRightIcon className="w-4 h-4" />}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ModalWizard 