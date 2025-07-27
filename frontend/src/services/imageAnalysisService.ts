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

    // Analyze image content using Google Cloud Vision API
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

// Perform AI analysis on the image using Google Cloud Vision API
const performImageAnalysis = async (imageFile: File, description: string): Promise<ImageAnalysis['analysis']> => {
  try {
    console.log('🔍 STARTING IMAGE ANALYSIS PROCESS...')
    console.log('File:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type)
    console.log('Description:', description)
    
    // Convert image to base64 for analysis
    const base64Image = await fileToBase64(imageFile)
    console.log('✅ Image converted to base64')
    
    // Analyze image content using Google Cloud Vision API
    console.log('🔍 Analyzing image content...')
    const contentAnalysis = await analyzeImageContent(base64Image)
    console.log('✅ Image content analysis complete:', contentAnalysis)
    
    // Analyze text description for context
    console.log('🔍 Analyzing text description...')
    const textAnalysis = await analyzeTextContent(description)
    console.log('✅ Text analysis complete:', textAnalysis)
    
    // Combine image and text analysis
    console.log('🔍 Combining analyses...')
    const combinedAnalysis = combineAnalysis(contentAnalysis, textAnalysis)
    console.log('✅ Combined analysis:', combinedAnalysis)
    
    // Generate predictions based on analysis
    console.log('🔍 Generating predictions...')
    const predictions = generatePredictions(combinedAnalysis, description)
    console.log('✅ Predictions generated:', predictions)
    
    // Determine severity based on analysis
    console.log('🔍 Determining severity...')
    const severity = determineSeverity(combinedAnalysis, predictions)
    console.log('✅ Severity determined:', severity)
    
    const result = {
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
    
    console.log('🎯 FINAL ANALYSIS RESULT:', result)
    return result
    
  } catch (error) {
    console.error('❌ Error performing image analysis:', error)
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

// Analyze image content using Google Cloud Vision API
const analyzeImageContent = async (base64Image: string) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY
    
    if (!apiKey) {
      console.warn('Google Cloud Vision API key not found, using fallback analysis')
      console.log('🔍 FALLBACK MODE: No real image analysis available')
      return getFallbackImageAnalysis()
    }

    console.log('🔍 ANALYZING IMAGE WITH GOOGLE CLOUD VISION API...')

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 15
                },
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 10
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 15
                },
                {
                  type: 'SAFE_SEARCH_DETECTION'
                }
              ]
            }
          ]
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`)
    }

    const result = await response.json()
    const annotations = result.responses[0]

    // Extract labels from Vision API response
    const labels = annotations.labelAnnotations || []
    const objects = annotations.localizedObjectAnnotations || []
    const text = annotations.textAnnotations || []
    const safeSearch = annotations.safeSearchAnnotation || {}

    console.log('📊 RAW VISION API RESPONSE:')
    console.log('Labels detected:', labels.map((l: any) => `${l.description} (${Math.round(l.score * 100)}%)`))
    console.log('Objects detected:', objects.map((o: any) => `${o.name} (${Math.round(o.score * 100)}%)`))
    console.log('Text detected:', text.slice(1).map((t: any) => t.description))
    console.log('Safe search:', safeSearch)

    // Process labels for traffic-related content
    const content = []
    const categories = []
    let confidence = 0.5

    // Analyze labels for traffic infrastructure
    const trafficKeywords = [
      'road', 'street', 'highway', 'traffic', 'vehicle', 'car', 'bus', 'truck',
      'pothole', 'damage', 'construction', 'barrier', 'cone', 'sign', 'signal',
      'light', 'crossing', 'intersection', 'bridge', 'tunnel', 'parking',
      'accident', 'crash', 'emergency', 'police', 'ambulance', 'fire truck',
      'water', 'flood', 'drainage', 'sewer', 'manhole', 'ditch', 'motorcycle',
      'bicycle', 'pedestrian', 'walking', 'building', 'tree', 'grass', 'sky',
      'cloud', 'rain', 'weather', 'night', 'day', 'sun', 'shadow'
    ]

    // Process labels
    labels.forEach((label: any) => {
      const labelText = label.description.toLowerCase()
      const labelConfidence = label.score || 0
      
      // Add ALL detected labels to content for transparency
      content.push(`${labelText} (${Math.round(labelConfidence * 100)}%)`)
      
      if (trafficKeywords.some(keyword => labelText.includes(keyword))) {
        confidence = Math.max(confidence, labelConfidence)
        
        // Categorize based on label
        if (['road', 'street', 'highway', 'pothole', 'damage'].some(k => labelText.includes(k))) {
          categories.push('infrastructure')
        }
        if (['traffic', 'vehicle', 'car', 'bus', 'truck'].some(k => labelText.includes(k))) {
          categories.push('traffic')
        }
        if (['construction', 'barrier', 'cone'].some(k => labelText.includes(k))) {
          categories.push('construction')
        }
        if (['accident', 'crash', 'emergency'].some(k => labelText.includes(k))) {
          categories.push('safety')
        }
        if (['water', 'flood', 'drainage'].some(k => labelText.includes(k))) {
          categories.push('weather')
        }
      }
    })

    // Process detected objects
    objects.forEach((obj: any) => {
      const objectName = obj.name.toLowerCase()
      const objectConfidence = obj.score || 0
      content.push(`object: ${objectName} (${Math.round(objectConfidence * 100)}%)`)
      
      if (trafficKeywords.some(keyword => objectName.includes(keyword))) {
        categories.push('objects')
      }
    })

    // Process detected text (signs, labels, etc.)
    if (text.length > 1) { // First element is the entire text, skip it
      const detectedText = text.slice(1).map((t: any) => t.description.toLowerCase()).join(' ')
      if (detectedText) {
        content.push(`text: ${detectedText}`)
        categories.push('signage')
      }
    }

    // Check for unsafe content
    if (safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY') {
      content.push('inappropriate content detected')
      categories.push('inappropriate')
    }

    // If no traffic-related content found, add general urban content
    if (content.length === 0) {
      content.push('urban environment', 'general scene')
      categories.push('urban', 'general')
    }

    // Remove duplicates
    const uniqueContent = [...new Set(content)]
    const uniqueCategories = [...new Set(categories)]

    console.log('🎯 PROCESSED IMAGE CONTENT:')
    console.log('Content detected:', uniqueContent)
    console.log('Categories:', uniqueCategories)
    console.log('Confidence:', Math.min(confidence + 0.2, 0.95))

    return {
      content: uniqueContent,
      categories: uniqueCategories,
      confidence: Math.min(confidence + 0.2, 0.95) // Boost confidence for detected content
    }

  } catch (error) {
    console.error('❌ Error calling Google Cloud Vision API:', error)
    return getFallbackImageAnalysis()
  }
}

// Fallback image analysis when API is not available
const getFallbackImageAnalysis = () => {
  console.log('⚠️ USING FALLBACK IMAGE ANALYSIS (No API key)')
  return {
    content: [
      'image uploaded (no AI analysis available)',
      'manual analysis required',
      'please add VITE_GOOGLE_CLOUD_VISION_API_KEY to .env file'
    ],
    categories: ['general', 'fallback'],
    confidence: 0.1
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

// Determine issue type based on image and text analysis
const determineIssueType = (analysis: any, description: string): string => {
  const text = description.toLowerCase()
  const imageContent = analysis.content.join(' ').toLowerCase()
  
  console.log('🔍 DETERMINING ISSUE TYPE:')
  console.log('Text description:', text)
  console.log('Image content:', imageContent)
  
  // Priority-based issue detection (most specific first)
  
  // 1. Emergency/Safety Issues (highest priority)
  if (text.includes('accident') || text.includes('crash') || text.includes('collision') ||
      imageContent.includes('accident') || imageContent.includes('crash') || 
      imageContent.includes('emergency') || imageContent.includes('police') ||
      imageContent.includes('ambulance') || imageContent.includes('fire truck')) {
    console.log('🎯 Detected: Traffic Incident')
    return 'Traffic Incident'
  }
  
  // 2. Infrastructure Damage
  if (text.includes('pothole') || text.includes('hole') || text.includes('damage') ||
      imageContent.includes('pothole') || imageContent.includes('damage') ||
      imageContent.includes('broken') || imageContent.includes('crack')) {
    console.log('🎯 Detected: Road Damage')
    return 'Road Damage'
  }
  
  // 3. Traffic Signal Issues
  if (text.includes('signal') || text.includes('light') || text.includes('traffic light') ||
      imageContent.includes('signal') || imageContent.includes('light') ||
      imageContent.includes('traffic light') || imageContent.includes('stop light')) {
    console.log('🎯 Detected: Traffic Signal')
    return 'Traffic Signal'
  }
  
  // 4. Water/Weather Issues
  if (text.includes('water') || text.includes('flood') || text.includes('logging') ||
      imageContent.includes('water') || imageContent.includes('flood') ||
      imageContent.includes('rain') || imageContent.includes('drainage')) {
    console.log('🎯 Detected: Water Logging')
    return 'Water Logging'
  }
  
  // 5. Construction Work
  if (text.includes('construction') || text.includes('work') || text.includes('barrier') ||
      imageContent.includes('construction') || imageContent.includes('barrier') ||
      imageContent.includes('cone') || imageContent.includes('work')) {
    console.log('🎯 Detected: Construction Work')
    return 'Construction Work'
  }
  
  // 6. Traffic Congestion
  if (text.includes('congestion') || text.includes('jam') || text.includes('traffic jam') ||
      imageContent.includes('traffic') || imageContent.includes('congestion') ||
      imageContent.includes('jam') || imageContent.includes('vehicle')) {
    console.log('🎯 Detected: Traffic Congestion')
    return 'Traffic Congestion'
  }
  
  // 7. Parking Issues
  if (text.includes('parking') || text.includes('parked') ||
      imageContent.includes('parking') || imageContent.includes('parked')) {
    console.log('🎯 Detected: Parking Issue')
    return 'Parking Issue'
  }
  
  // 8. Vehicle-related issues
  if (imageContent.includes('vehicle') || imageContent.includes('car') || 
      imageContent.includes('bus') || imageContent.includes('truck')) {
    console.log('🎯 Detected: Vehicle Related Issue')
    return 'Vehicle Related Issue'
  }
  
  // 9. Road/Street issues
  if (imageContent.includes('road') || imageContent.includes('street') || 
      imageContent.includes('highway') || imageContent.includes('pavement')) {
    console.log('🎯 Detected: Road Issue')
    return 'Road Issue'
  }
  
  console.log('🎯 Detected: General Issue (default)')
  return 'General Issue'
}

// Calculate urgency score (0-100) based on image and text analysis
const calculateUrgency = (analysis: any, description: string): number => {
  let urgency = 30 // Base urgency
  
  const text = description.toLowerCase()
  const imageContent = analysis.content.join(' ').toLowerCase()
  
  console.log('🚨 CALCULATING URGENCY:')
  console.log('Text description:', text)
  console.log('Image content:', imageContent)
  
  // Emergency/Safety Issues (highest urgency)
  if (text.includes('accident') || text.includes('crash') || text.includes('collision') || text.includes('emergency') ||
      imageContent.includes('accident') || imageContent.includes('crash') || imageContent.includes('emergency') ||
      imageContent.includes('police') || imageContent.includes('ambulance') || imageContent.includes('fire truck')) {
    urgency += 45
    console.log('🚨 Emergency detected: +45 urgency')
  }
  
  // Dangerous/Unsafe conditions
  if (text.includes('dangerous') || text.includes('unsafe') || text.includes('urgent') ||
      imageContent.includes('dangerous') || imageContent.includes('unsafe')) {
    urgency += 35
    console.log('🚨 Dangerous condition: +35 urgency')
  }
  
  // Blocking/Obstruction issues
  if (text.includes('blocking') || text.includes('closed') || text.includes('stuck') || text.includes('obstruction') ||
      imageContent.includes('blocking') || imageContent.includes('barrier') || imageContent.includes('obstruction')) {
    urgency += 30
    console.log('🚨 Blocking detected: +30 urgency')
  }
  
  // Severe/Major issues
  if (text.includes('severe') || text.includes('major') || text.includes('heavy') ||
      imageContent.includes('severe') || imageContent.includes('major')) {
    urgency += 25
    console.log('🚨 Severe issue: +25 urgency')
  }
  
  // Infrastructure damage
  if (text.includes('broken') || text.includes('damage') || text.includes('hole') || text.includes('crack') ||
      imageContent.includes('damage') || imageContent.includes('broken') || imageContent.includes('crack')) {
    urgency += 20
    console.log('🚨 Infrastructure damage: +20 urgency')
  }
  
  // Traffic congestion
  if (text.includes('traffic') || text.includes('congestion') || text.includes('jam') || text.includes('heavy traffic') ||
      imageContent.includes('traffic') || imageContent.includes('congestion') || imageContent.includes('jam')) {
    urgency += 15
    console.log('🚨 Traffic congestion: +15 urgency')
  }
  
  // Construction work
  if (text.includes('construction') || text.includes('work') ||
      imageContent.includes('construction') || imageContent.includes('work')) {
    urgency += 10
    console.log('🚨 Construction work: +10 urgency')
  }
  
  // Boost urgency based on image analysis confidence
  if (analysis.confidence > 0.8) {
    urgency += 15
    console.log('🚨 High confidence boost: +15 urgency')
  } else if (analysis.confidence > 0.6) {
    urgency += 10
    console.log('🚨 Medium confidence boost: +10 urgency')
  }
  
  // Additional urgency for specific image content
  if (imageContent.includes('vehicle') && imageContent.includes('damage')) {
    urgency += 15
    console.log('🚨 Vehicle damage detected: +15 urgency')
  }
  
  if (imageContent.includes('water') && imageContent.includes('road')) {
    urgency += 20
    console.log('🚨 Water on road detected: +20 urgency')
  }
  
  const finalUrgency = Math.min(urgency, 100)
  console.log(`🚨 Final urgency score: ${finalUrgency}/100`)
  
  return finalUrgency
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
  
  console.log('📋 GENERATING RECOMMENDED ACTIONS:')
  console.log('Issue type:', issueType)
  console.log('Urgency:', urgency)
  
  // Issue-specific actions
  if (issueType === 'Traffic Incident') {
    actions.push('Dispatch emergency services immediately')
    actions.push('Set up traffic diversion and roadblocks')
    actions.push('Notify traffic police and ambulance services')
    actions.push('Coordinate with fire department if needed')
  } else if (issueType === 'Road Damage') {
    actions.push('Assess damage severity and safety risks')
    actions.push('Install temporary warning signs and barriers')
    actions.push('Schedule repair work with priority')
    actions.push('Notify local authorities and residents')
  } else if (issueType === 'Traffic Signal') {
    actions.push('Send technician for immediate inspection')
    actions.push('Implement manual traffic control if needed')
    actions.push('Update signal timing and synchronization')
    actions.push('Install backup power systems')
  } else if (issueType === 'Water Logging') {
    actions.push('Deploy water pumps and drainage equipment')
    actions.push('Clear blocked drainage systems')
    actions.push('Monitor water levels and weather conditions')
    actions.push('Set up flood warning systems')
  } else if (issueType === 'Construction Work') {
    actions.push('Verify construction permits and safety protocols')
    actions.push('Set up proper signage and traffic management')
    actions.push('Coordinate with construction team and authorities')
    actions.push('Monitor construction progress and safety')
  } else if (issueType === 'Traffic Congestion') {
    actions.push('Analyze traffic patterns and bottlenecks')
    actions.push('Implement traffic diversion and alternative routes')
    actions.push('Update traffic signals and timing')
    actions.push('Deploy traffic police for manual control')
  } else if (issueType === 'Parking Issue') {
    actions.push('Assess parking violation and obstruction')
    actions.push('Contact vehicle owner if possible')
    actions.push('Coordinate with towing services if needed')
    actions.push('Update parking regulations and enforcement')
  } else if (issueType === 'Vehicle Related Issue') {
    actions.push('Assess vehicle condition and safety')
    actions.push('Contact vehicle owner or authorities')
    actions.push('Coordinate with towing or repair services')
    actions.push('Update traffic management if needed')
  } else if (issueType === 'Road Issue') {
    actions.push('Assess road condition and safety')
    actions.push('Schedule maintenance or repair work')
    actions.push('Update traffic management and signage')
    actions.push('Notify relevant departments')
  } else {
    // General issue actions
    actions.push('Review and assess the reported issue')
    actions.push('Coordinate with relevant departments')
    actions.push('Schedule inspection and follow-up')
    actions.push('Update incident tracking system')
  }
  
  // Urgency-based actions
  if (urgency >= 90) {
    actions.unshift('🚨 IMMEDIATE EMERGENCY RESPONSE REQUIRED')
    actions.unshift('Alert all emergency services')
  } else if (urgency >= 70) {
    actions.unshift('⚠️ IMMEDIATE RESPONSE REQUIRED')
  } else if (urgency >= 50) {
    actions.unshift('⚡ HIGH PRIORITY RESPONSE NEEDED')
  } else if (urgency >= 30) {
    actions.unshift('📞 STANDARD RESPONSE SCHEDULED')
  }
  
  console.log('📋 Generated actions:', actions)
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