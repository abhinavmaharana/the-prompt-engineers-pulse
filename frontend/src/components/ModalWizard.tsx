import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  MapPinIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface ModalWizardProps {
  latitude: number
  longitude: number
  onSubmit: (description: string, image?: File) => void
  onClose: () => void
}

type Step = 'location' | 'description' | 'photo' | 'confirm'

const ModalWizard = ({ latitude, longitude, onSubmit, onClose }: ModalWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('location')
  const [description, setDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps: { key: Step; title: string; icon: React.ReactNode }[] = [
    { key: 'location', title: 'Location', icon: <MapPinIcon className="w-5 h-5" /> },
    { key: 'description', title: 'Description', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { key: 'photo', title: 'Photo', icon: <PhotoIcon className="w-5 h-5" /> },
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
    if (description.trim()) {
      onSubmit(description.trim(), selectedImage || undefined)
    }
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
        return true
      case 'description':
        return description.trim().length > 0
      case 'photo':
        return true
      case 'confirm':
        return true
      default:
        return false
    }
  }

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
        className="bg-white rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-hidden border border-border/50"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Report Issue</h2>
              <p className="text-sm text-text-secondary mt-0.5">Help improve your city</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-light transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-text-secondary" />
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
                      'bg-neutral-light text-text-secondary'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isCompleted ? <CheckIcon className="w-4 h-4" /> : step.icon}
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
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[200px]"
            >
              {currentStep === 'location' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MapPinIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-medium text-text mb-2">Location Confirmed</h3>
                    <p className="text-sm text-text-secondary">We've captured the location where you clicked.</p>
                  </div>
                  <div className="bg-neutral-light rounded-lg p-4 border border-border/50">
                    <div className="text-xs font-medium text-text-secondary mb-2">📍 Coordinates</div>
                    <div className="font-mono text-sm text-text bg-white rounded-lg p-3 shadow-soft">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'description' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <DocumentTextIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-medium text-text mb-2">Describe the Issue</h3>
                    <p className="text-sm text-text-secondary">Provide details about the civic issue.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text mb-2">📝 Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Large pothole causing traffic, broken street light..."
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white shadow-soft"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {currentStep === 'photo' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <PhotoIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-medium text-text mb-2">Add a Photo (Optional)</h3>
                    <p className="text-sm text-text-secondary">A picture helps us understand the issue better.</p>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors bg-white shadow-soft ${
                      isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
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
                          className="text-primary hover:text-primary-hover font-medium text-sm"
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                          <PhotoIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary hover:text-primary-hover font-medium text-sm"
                          >
                            Click to upload
                          </button>
                          <span className="text-text-secondary text-sm"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-text-muted">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {currentStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-medium text-text mb-2">Confirm Report</h3>
                    <p className="text-sm text-text-secondary">Please review your report before submitting.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-neutral-light rounded-lg p-4 border border-border/50">
                      <div className="text-xs font-medium text-text-secondary mb-2">📝 Description</div>
                      <div className="text-text bg-white rounded-lg p-3 shadow-soft text-sm">{description}</div>
                    </div>
                    
                    <div className="bg-neutral-light rounded-lg p-4 border border-border/50">
                      <div className="text-xs font-medium text-text-secondary mb-2">📍 Location</div>
                      <div className="font-mono text-text bg-white rounded-lg p-3 shadow-soft text-sm">{latitude.toFixed(6)}, {longitude.toFixed(6)}</div>
                    </div>
                    
                    {imagePreview && (
                      <div className="bg-neutral-light rounded-lg p-4 border border-border/50">
                        <div className="text-xs font-medium text-text-secondary mb-2">📸 Photo</div>
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
        <div className="p-6 border-t border-border/50 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 'location'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              currentStep === 'location'
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text hover:bg-neutral-light'
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
                : 'bg-border text-text-muted cursor-not-allowed'
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