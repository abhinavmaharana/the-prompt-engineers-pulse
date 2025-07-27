import type { Report } from '../App'

// Local storage key
const STORAGE_KEY = 'city_pulse_reports'

// Fallback service for when Firebase is not available
export class FallbackService {
  private static instance: FallbackService
  private reports: Report[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): FallbackService {
    if (!FallbackService.instance) {
      FallbackService.instance = new FallbackService()
    }
    return FallbackService.instance
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.reports = JSON.parse(stored).map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      this.reports = []
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  async addReport(report: Omit<Report, 'id'>): Promise<Report> {
    const newReport: Report = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...report
    }
    
    this.reports.unshift(newReport)
    this.saveToStorage()
    
    return newReport
  }

  async getReports(): Promise<Report[]> {
    return [...this.reports]
  }

  async getReportsByMood(mood: string): Promise<Report[]> {
    return this.reports.filter(report => report.sentiment?.mood === mood)
  }

  async getRecentReports(hours: number = 24): Promise<Report[]> {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - hours)
    
    return this.reports.filter(report => report.timestamp >= cutoffTime)
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<void> {
    const index = this.reports.findIndex(report => report.id === id)
    if (index !== -1) {
      this.reports[index] = { ...this.reports[index], ...updates }
      this.saveToStorage()
    }
  }

  async deleteReport(id: string): Promise<void> {
    this.reports = this.reports.filter(report => report.id !== id)
    this.saveToStorage()
  }

  async getReportStats() {
    const total = this.reports.length
    const today = this.reports.filter(report => {
      const today = new Date()
      const reportDate = new Date(report.timestamp)
      return today.toDateString() === reportDate.toDateString()
    }).length

    const moodCounts = this.reports.reduce((acc, report) => {
      const mood = report.sentiment?.mood || 'neutral'
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      today,
      moodCounts
    }
  }
}

// Fallback image storage service
export class FallbackImageService {
  static async uploadImage(file: File, _reportId: string): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        resolve(dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  static async uploadImageWithAnalysis(
    file: File, 
    reportId: string, 
    description: string = ''
  ): Promise<{ imageUrl: string; analysis: any }> {
    const imageUrl = await this.uploadImage(file, reportId)
    
    // Get image dimensions
    const dimensions = await this.getImageDimensions(file)
    
    // Analyze description and image for intelligent predictions
    const analysis = this.analyzeImageAndDescription(file, description, dimensions)
    
    return { imageUrl, analysis }
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  private static analyzeImageAndDescription(
    file: File, 
    description: string, 
    dimensions: { width: number; height: number }
  ) {
    const text = description.toLowerCase()
    const keywords = text.split(' ')
    
    // Analyze content based on description keywords
    const content = []
    const categories = []
    
    // Detect issue types from description
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
    
    // Determine issue type
    const issueType = this.determineIssueType(text)
    
    // Calculate urgency based on keywords and context
    const urgency = this.calculateUrgency(text)
    
    // Determine severity
    const severity = this.determineSeverity(urgency)
    
    // Estimate response time
    const estimatedResponseTime = this.estimateResponseTime(urgency, issueType)
    
    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(issueType, urgency)
    
    // Calculate confidence based on description length and specificity
    const confidence = Math.min(0.9, 0.5 + (description.length / 100) + (content.length * 0.1))
    
    return {
      content,
      confidence,
      categories,
      severity,
      predictions: {
        issueType,
        urgency,
        estimatedResponseTime,
        recommendedActions
      },
      metadata: {
        fileSize: file.size,
        dimensions,
        format: file.type,
        uploadTime: new Date()
      }
    }
  }

  private static determineIssueType(description: string): string {
    const text = description.toLowerCase()
    
    if (text.includes('pothole') || text.includes('hole') || text.includes('damage')) {
      return 'Road Damage'
    }
    if (text.includes('accident') || text.includes('crash') || text.includes('collision')) {
      return 'Traffic Incident'
    }
    if (text.includes('signal') || text.includes('light') || text.includes('traffic light')) {
      return 'Traffic Signal'
    }
    if (text.includes('water') || text.includes('flood') || text.includes('logging')) {
      return 'Water Logging'
    }
    if (text.includes('construction') || text.includes('work') || text.includes('barrier')) {
      return 'Construction Work'
    }
    if (text.includes('congestion') || text.includes('jam') || text.includes('traffic')) {
      return 'Traffic Congestion'
    }
    if (text.includes('parking') || text.includes('vehicle') || text.includes('car')) {
      return 'Parking Issue'
    }
    if (text.includes('emergency') || text.includes('urgent') || text.includes('dangerous')) {
      return 'Emergency Situation'
    }
    
    return 'General Issue'
  }

  private static calculateUrgency(description: string): number {
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

  private static determineSeverity(urgency: number): 'low' | 'medium' | 'high' | 'critical' {
    if (urgency >= 80) return 'critical'
    if (urgency >= 60) return 'high'
    if (urgency >= 40) return 'medium'
    return 'low'
  }

  private static estimateResponseTime(urgency: number, _issueType: string): string {
    if (urgency >= 80) return 'Immediate (0-2 hours)'
    if (urgency >= 60) return 'High Priority (2-6 hours)'
    if (urgency >= 40) return 'Medium Priority (6-24 hours)'
    return 'Standard (24-48 hours)'
  }

  private static generateRecommendedActions(issueType: string, urgency: number): string[] {
    const actions = []
    
    switch (issueType) {
      case 'Traffic Incident':
        actions.push('Dispatch emergency services')
        actions.push('Set up traffic diversion')
        actions.push('Notify traffic police')
        break
      case 'Road Damage':
        actions.push('Assess damage severity')
        actions.push('Schedule repair work')
        actions.push('Install warning signs')
        break
      case 'Traffic Signal':
        actions.push('Send technician for inspection')
        actions.push('Implement manual traffic control')
        actions.push('Update signal timing')
        break
      case 'Water Logging':
        actions.push('Deploy water pumps')
        actions.push('Clear drainage systems')
        actions.push('Monitor water levels')
        break
      case 'Construction Work':
        actions.push('Verify work permits')
        actions.push('Set up proper signage')
        actions.push('Monitor traffic flow')
        break
      case 'Traffic Congestion':
        actions.push('Analyze traffic patterns')
        actions.push('Implement traffic diversion')
        actions.push('Update traffic signals')
        break
      case 'Parking Issue':
        actions.push('Send traffic warden')
        actions.push('Issue parking violation')
        actions.push('Clear obstruction')
        break
      case 'Emergency Situation':
        actions.push('Immediate response required')
        actions.push('Dispatch emergency services')
        actions.push('Set up safety barriers')
        break
      default:
        actions.push('Review report')
        actions.push('Assess situation')
        actions.push('Schedule inspection')
    }
    
    if (urgency >= 70) {
      actions.unshift('Immediate response required')
    }
    
    return actions
  }
} 