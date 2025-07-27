import { addReport as firebaseAddReport, getReports as firebaseGetReports } from './firestoreService'
import { uploadImageWithAnalysis as firebaseUploadImage } from './imageAnalysisService'
import { FallbackService, FallbackImageService } from './fallbackService'
import type { Report } from '../App'

// Service wrapper that handles Firebase failures gracefully
export class ServiceWrapper {
  private static fallbackService = FallbackService.getInstance()
  private static useFallback = false

  // Check if Firebase is available
  private static async checkFirebase(): Promise<boolean> {
    try {
      // Try a simple Firestore operation
      await firebaseGetReports()
      return true
    } catch (error) {
      console.warn('Firebase not available, using fallback service:', error)
      this.useFallback = true
      return false
    }
  }

  // Add report with fallback
  static async addReport(report: Omit<Report, 'id'>): Promise<Report> {
    try {
      if (!this.useFallback) {
        await this.checkFirebase()
      }
      
      if (this.useFallback) {
        return await this.fallbackService.addReport(report)
      } else {
        return await firebaseAddReport(report)
      }
    } catch (error) {
      console.error('Error adding report, using fallback:', error)
      this.useFallback = true
      return await this.fallbackService.addReport(report)
    }
  }

  // Get reports with fallback
  static async getReports(): Promise<Report[]> {
    try {
      if (!this.useFallback) {
        await this.checkFirebase()
      }
      
      if (this.useFallback) {
        return await this.fallbackService.getReports()
      } else {
        return await firebaseGetReports()
      }
    } catch (error) {
      console.error('Error getting reports, using fallback:', error)
      this.useFallback = true
      return await this.fallbackService.getReports()
    }
  }

  // Upload image with analysis and fallback
  static async uploadImageWithAnalysis(
    file: File,
    reportId: string,
    description: string = ''
  ): Promise<{ imageUrl: string; analysis: any }> {
    try {
      if (!this.useFallback) {
        await this.checkFirebase()
      }
      
      let result
      if (this.useFallback) {
        result = await FallbackImageService.uploadImageWithAnalysis(file, reportId, description)
      } else {
        result = await firebaseUploadImage(file, reportId, description)
      }
      
      console.log('Image analysis result:', result)
      return result
    } catch (error) {
      console.error('Error uploading image, using fallback:', error)
      this.useFallback = true
      const result = await FallbackImageService.uploadImageWithAnalysis(file, reportId, description)
      console.log('Fallback image analysis result:', result)
      return result
    }
  }

  // Get service status
  static getServiceStatus(): { usingFirebase: boolean; usingFallback: boolean } {
    return {
      usingFirebase: !this.useFallback,
      usingFallback: this.useFallback
    }
  }

  // Reset to try Firebase again
  static resetService() {
    this.useFallback = false
  }
} 