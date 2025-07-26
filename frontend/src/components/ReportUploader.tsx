import React, { useState, useRef, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebaseConfig';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const ReportUploader: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('traffic');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'traffic', label: 'Traffic Jam', icon: '🚦', color: '#f59e0b' },
    { id: 'accident', label: 'Accident', icon: '🚗', color: '#ef4444' },
    { id: 'waterlogging', label: 'Waterlogging', icon: '💧', color: '#06b6d4' },
    { id: 'construction', label: 'Road Work', icon: '🚧', color: '#f97316' },
    { id: 'emergency', label: 'Emergency', icon: '🚨', color: '#dc2626' },
    { id: 'other', label: 'Other', icon: '📍', color: '#8b5cf6' },
  ];

  const handleFileSelect = useCallback((file: File) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    simulateProgress();

    try {
      // Get current location (simplified)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      // Upload file to Firebase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, `user-uploads/anonymous/${fileName}`);
      const uploadResult = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Add report to Firestore
      await addDoc(collection(db, 'user_reports'), {
        category,
        description,
        imageUrl: downloadURL,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        createdAt: serverTimestamp(),
        severity: 'medium', // Default severity
        status: 'pending'
      });

      setUploadStatus('success');
      
      // Reset form after delay
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      
      // Reset status after delay
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setDescription('');
    setCategory('traffic');
    setUploadStatus('idle');
    setUploadProgress(0);
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (uploadStatus !== 'uploading') {
      resetForm();
    }
  };



  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 pulse-animation"
        aria-label="Report an incident"
      >
        <span className="text-2xl">📸</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-tertiary)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden slide-up-enter">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-light)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)] flex items-center justify-center">
                    <span className="text-white text-lg">📱</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Report Issue</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Help improve city services</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  disabled={uploadStatus === 'uploading'}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                        category === cat.id
                          ? 'border-[var(--accent-violet)] bg-[var(--accent-violet)] bg-opacity-10'
                          : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                  Photo/Video
                </label>
                
                {!selectedFile ? (
                  <div
                    ref={dropZoneRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                      isDragOver
                        ? 'border-[var(--accent-violet)] bg-[var(--accent-violet)] bg-opacity-5'
                        : 'border-[var(--border-medium)] hover:border-[var(--accent-violet)]'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-[var(--text-primary)] font-medium mb-1">
                      Drop your photo/video here
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      or click to browse
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="border border-[var(--border-light)] rounded-xl overflow-hidden">
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-[var(--bg-secondary)] flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-3xl">🎥</span>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">
                              Video selected
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-[var(--status-error)] text-white rounded-full hover:bg-opacity-80 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's happening? Any additional details..."
                  className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)] focus:border-transparent text-[var(--text-primary)] bg-[var(--bg-secondary)] placeholder-[var(--text-tertiary)]"
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border-light)] bg-[var(--bg-secondary)]">
              {uploadStatus === 'uploading' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Uploading...
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border-light)] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-blue)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="mb-4 p-3 bg-[var(--status-success)] bg-opacity-10 border border-[var(--status-success)] border-opacity-20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✅</span>
                    <span className="text-sm font-medium text-[var(--status-success)]">
                      Report submitted successfully!
                    </span>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="mb-4 p-3 bg-[var(--status-error)] bg-opacity-10 border border-[var(--status-error)] border-opacity-20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">❌</span>
                    <span className="text-sm font-medium text-[var(--status-error)]">
                      Upload failed. Please try again.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  disabled={uploadStatus === 'uploading'}
                  className="flex-1 px-4 py-3 border border-[var(--border-medium)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || uploadStatus === 'uploading'}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-blue)] text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Report</span>
                      <span className="text-lg">🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportUploader; 