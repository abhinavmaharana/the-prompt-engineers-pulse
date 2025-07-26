import { useState, useRef } from 'react'

interface ReportModalProps {
  latitude: number
  longitude: number
  onSubmit: (description: string, image?: File) => void
  onClose: () => void
}

const ReportModal = ({ latitude, longitude, onSubmit, onClose }: ReportModalProps) => {
  const [description, setDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim()) {
      onSubmit(description.trim(), selectedImage || undefined)
    }
  }

  const handleClose = () => {
    setDescription('')
    setSelectedImage(null)
    setImagePreview(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md shadow-large modal-enter">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary">Report Civic Issue</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text transition-all duration-200 p-2 rounded-lg hover:bg-background-secondary hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Location Coordinates
            </label>
            <div className="bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm text-text">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
              Issue Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the civic issue (e.g., 'Large pothole causing traffic')"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 resize-none transition-all"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Upload Photo (Optional)
            </label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-secondary hover:border-primary hover:bg-background-secondary transition-all duration-200 hover:shadow-soft active:scale-95"
              >
                {selectedImage ? selectedImage.name : 'Choose Image'}
              </button>
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-background-secondary hover:bg-gray-200 text-text font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:shadow-medium active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-soft hover:shadow-medium hover:scale-105 active:scale-95"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal 