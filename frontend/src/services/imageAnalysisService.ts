import { storage } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export interface ImageAnalysis {
  id: string
  reportId: string
  imageUrl: string
  analysis: {
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
  createdAt: Date
}

export interface ImageUploadResult {
  imageUrl: string
  analysis: ImageAnalysis
}

// Firebase AI-powered image analysis
export const analyzeImageWithAI = async (
  imageFile: File, 
  reportId: string,
  description: string = ''
): Promise<ImageAnalysis> => {
  try {
    // Upload image to Firebase Storage
    const timestamp = Date.now()
    const fileName = `${reportId}_${timestamp}_${imageFile.name}`
    const storageRef = ref(storage, `report-images/${fileName}`)
    
    const snapshot = await uploadBytes(storageRef, imageFile)
    const imageUrl = await getDownloadURL(snapshot.ref)

    // Analyze image content using Firebase AI
    const analysis = await performImageAnalysis(imageFile, description)
    
    // Create analysis result
    const imageAnalysis: ImageAnalysis = {
      id: `analysis_${reportId}_${timestamp}`,
      reportId,
      imageUrl,
      analysis,
      createdAt: new Date()
    }

    return imageAnalysis
  } catch (error) {
    console.error('Error analyzing image with AI:', error)
    throw error
  }
}

// Perform AI analysis on the image
const performImageAnalysis = async (imageFile: File, description: string): Promise<ImageAnalysis['analysis']> => {
  try {
    // Convert image to base64 for analysis
    const base64Image = await fileToBase64(imageFile)
    
    // Analyze image content using Firebase AI Vision API
    const contentAnalysis = await analyzeImageContent(base64Image)
    
    // Analyze text description for context
    const textAnalysis = await analyzeTextContent(description)
    
    // Combine image and text analysis
    const combinedAnalysis = combineAnalysis(contentAnalysis, textAnalysis)
    
    // Generate predictions based on analysis
    const predictions = generatePredictions(combinedAnalysis, description)
    
    // Determine severity based on analysis
    const severity = determineSeverity(combinedAnalysis, predictions)
    
    return {
      content: combinedAnalysis.content,
      confidence: combinedAnalysis.confidence,
      categories: combinedAnalysis.categories,
      severity,
      predictions,
      metadata: {
        fileSize: imageFile.size,
        dimensions: await getImageDimensions(imageFile),
        format: imageFile.type,
        uploadTime: new Date()
      }
    }
  } catch (error) {
    console.error('Error performing image analysis:', error)
    // Return fallback analysis
    return getFallbackAnalysis(description)
  }
}

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // Remove data URL prefix
    }
    reader.onerror = error => reject(error)
  })
}

// Analyze image content using Firebase AI
const analyzeImageContent = async (_base64Image: string) => {
  try {
    // This would integrate with Firebase AI Vision API
    // For now, we'll simulate the analysis based on common traffic issues
    
    const simulatedContent = [
      'road surface',
      'traffic infrastructure',
      'urban environment',
      'transportation'
    ]
    
    const simulatedCategories = [
      'infrastructure',
      'traffic',
      'urban'
    ]
    
    return {
      content: simulatedContent,
      categories: simulatedCategories,
      confidence: 0.85
    }
  } catch (error) {
    console.error('Error analyzing image content:', error)
    throw error
  }
}

// Analyze text content for context
const analyzeTextContent = async (description: string) => {
  const keywords = description.toLowerCase().split(' ')
  
  const content = []
  const categories = []
  
  // Analyze for traffic-related keywords
  if (keywords.some(word => ['pothole', 'hole', 'damage', 'broken', 'crack'].includes(word))) {
    content.push('road damage', 'infrastructure issue')
    categories.push('infrastructure', 'road')
  }
  
  if (keywords.some(word => ['traffic', 'congestion', 'jam', 'blocked', 'stuck'].includes(word))) {
    content.push('traffic congestion', 'road blockage')
    categories.push('traffic', 'congestion')
  }
  
  if (keywords.some(word => ['accident', 'crash', 'collision', 'emergency'].includes(word))) {
    content.push('traffic incident', 'emergency situation')
    categories.push('safety', 'emergency')
  }
  
  if (keywords.some(word => ['light', 'signal', 'broken', 'not working'].includes(word))) {
    content.push('traffic signal', 'signal malfunction')
    categories.push('infrastructure', 'signals')
  }
  
  if (keywords.some(word => ['water', 'flood', 'logging', 'rain'].includes(word))) {
    content.push('water logging', 'flooding')
    categories.push('weather', 'drainage')
  }
  
  if (keywords.some(word => ['construction', 'work', 'barrier', 'digging'].includes(word))) {
    content.push('construction work', 'road work')
    categories.push('construction', 'maintenance')
  }
  
  if (keywords.some(word => ['parking', 'vehicle', 'car', 'bike'].includes(word))) {
    content.push('parking issue', 'vehicle obstruction')
    categories.push('parking', 'vehicles')
  }
  
  // Default content if no specific keywords found
  if (content.length === 0) {
    content.push('traffic issue', 'urban problem')
    categories.push('general', 'urban')
  }
  
  return {
    content,
    categories,
    confidence: 0.9
  }
}

// Combine image and text analysis
const combineAnalysis = (imageAnalysis: any, textAnalysis: any) => {
  const combinedContent = [...new Set([...imageAnalysis.content, ...textAnalysis.content])]
  const combinedCategories = [...new Set([...imageAnalysis.categories, ...textAnalysis.categories])]
  const combinedConfidence = (imageAnalysis.confidence + textAnalysis.confidence) / 2
  
  return {
    content: combinedContent,
    categories: combinedCategories,
    confidence: combinedConfidence
  }
}

// Generate predictions based on analysis
const generatePredictions = (analysis: any, description: string): ImageAnalysis['analysis']['predictions'] => {
  const issueType = determineIssueType(analysis, description)
  const urgency = calculateUrgency(analysis, description)
  const estimatedResponseTime = estimateResponseTime(urgency, issueType)
  const recommendedActions = generateRecommendedActions(issueType, urgency)
  
  return {
    issueType,
    urgency,
    estimatedResponseTime,
    recommendedActions
  }
}

// Determine issue type
const determineIssueType = (_analysis: any, description: string): string => {
  const text = description.toLowerCase()
  
  if (text.includes('pothole') || text.includes('hole')) return 'Road Damage'
  if (text.includes('accident') || text.includes('crash')) return 'Traffic Incident'
  if (text.includes('signal') || text.includes('light')) return 'Traffic Signal'
  if (text.includes('water') || text.includes('flood')) return 'Water Logging'
  if (text.includes('construction')) return 'Construction Work'
  if (text.includes('congestion') || text.includes('jam')) return 'Traffic Congestion'
  
  return 'General Issue'
}

// Calculate urgency score (0-100)
const calculateUrgency = (_analysis: any, description: string): number => {
  let urgency = 30 // Base urgency
  
  const text = description.toLowerCase()
  
  // High urgency keywords
  if (text.includes('accident') || text.includes('crash') || text.includes('emergency')) {
    urgency += 40
  }
  if (text.includes('dangerous') || text.includes('unsafe') || text.includes('urgent')) {
    urgency += 35
  }
  if (text.includes('blocking') || text.includes('closed') || text.includes('stuck')) {
    urgency += 25
  }
  if (text.includes('heavy') || text.includes('major') || text.includes('severe')) {
    urgency += 20
  }
  if (text.includes('broken') || text.includes('damage') || text.includes('hole')) {
    urgency += 15
  }
  if (text.includes('traffic') || text.includes('congestion') || text.includes('jam')) {
    urgency += 10
  }
  
  return Math.min(urgency, 100)
}

// Estimate response time
const estimateResponseTime = (urgency: number, _issueType: string): string => {
  if (urgency >= 80) return 'Immediate (0-2 hours)'
  if (urgency >= 60) return 'High Priority (2-6 hours)'
  if (urgency >= 40) return 'Medium Priority (6-24 hours)'
  return 'Standard (24-48 hours)'
}

// Generate recommended actions
const generateRecommendedActions = (issueType: string, urgency: number): string[] => {
  const actions = []
  
  if (issueType === 'Traffic Incident') {
    actions.push('Dispatch emergency services')
    actions.push('Set up traffic diversion')
    actions.push('Notify traffic police')
  } else if (issueType === 'Road Damage') {
    actions.push('Assess damage severity')
    actions.push('Schedule repair work')
    actions.push('Install warning signs')
  } else if (issueType === 'Traffic Signal') {
    actions.push('Send technician for inspection')
    actions.push('Implement manual traffic control')
    actions.push('Update signal timing')
  } else if (issueType === 'Water Logging') {
    actions.push('Deploy water pumps')
    actions.push('Clear drainage systems')
    actions.push('Monitor water levels')
  }
  
  if (urgency >= 70) {
    actions.unshift('Immediate response required')
  }
  
  return actions
}

// Determine severity level
const determineSeverity = (_analysis: any, predictions: any): ImageAnalysis['analysis']['severity'] => {
  const urgency = predictions.urgency
  
  if (urgency >= 80) return 'critical'
  if (urgency >= 60) return 'high'
  if (urgency >= 40) return 'medium'
  return 'low'
}

// Get image dimensions
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.src = URL.createObjectURL(file)
  })
}

// Fallback analysis when AI fails
const getFallbackAnalysis = (_description: string): ImageAnalysis['analysis'] => {
  return {
    content: ['image uploaded', 'manual report'],
    confidence: 0.5,
    categories: ['general'],
    severity: 'medium',
    predictions: {
      issueType: 'General Issue',
      urgency: 50,
      estimatedResponseTime: 'Standard (24-48 hours)',
      recommendedActions: ['Review report', 'Assess situation', 'Schedule inspection']
    },
    metadata: {
      fileSize: 0,
      dimensions: { width: 0, height: 0 },
      format: 'unknown',
      uploadTime: new Date()
    }
  }
}

// Upload image with AI analysis
export const uploadImageWithAnalysis = async (
  imageFile: File,
  reportId: string,
  description: string = ''
): Promise<ImageUploadResult> => {
  try {
    const analysis = await analyzeImageWithAI(imageFile, reportId, description)
    
    return {
      imageUrl: analysis.imageUrl,
      analysis
    }
  } catch (error) {
    console.error('Error uploading image with analysis:', error)
    throw error
  }
}

// Get analysis for a report
export const getImageAnalysis = async (_reportId: string): Promise<ImageAnalysis | null> => {
  try {
    // This would fetch from Firestore
    // For now, return null as placeholder
    return null
  } catch (error) {
    console.error('Error getting image analysis:', error)
    return null
  }
} 