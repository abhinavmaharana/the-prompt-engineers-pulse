import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  EyeIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface ImageAnalysisDisplayProps {
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
}

const ImageAnalysisDisplay: React.FC<ImageAnalysisDisplayProps> = ({ analysis }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 80) return 'text-red-600'
    if (urgency >= 60) return 'text-orange-600'
    if (urgency >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUrgencyIcon = (urgency: number) => {
    if (urgency >= 80) return <ExclamationTriangleIcon className="w-4 h-4" />
    if (urgency >= 60) return <InformationCircleIcon className="w-4 h-4" />
    return <CheckCircleIcon className="w-4 h-4" />
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">AI Analysis</h4>
            </div>
            <Badge className={getSeverityColor(analysis.severity)}>
              {analysis.severity.toUpperCase()}
            </Badge>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Confidence:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysis.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>

          {/* Issue Type and Urgency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-xs text-gray-500 mb-1">Issue Type</div>
              <div className="font-medium text-gray-800">{analysis.predictions.issueType}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-xs text-gray-500 mb-1">Urgency</div>
              <div className={`flex items-center gap-1 font-medium ${getUrgencyColor(analysis.predictions.urgency)}`}>
                {getUrgencyIcon(analysis.predictions.urgency)}
                {analysis.predictions.urgency}/100
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Estimated Response</span>
            </div>
            <div className="font-medium text-gray-800">{analysis.predictions.estimatedResponseTime}</div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-xs text-gray-500 mb-2">Detected Categories</div>
            <div className="flex flex-wrap gap-1">
              {analysis.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-xs text-gray-500 mb-2">Recommended Actions</div>
            <ul className="space-y-1">
              {analysis.predictions.recommendedActions.map((action, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Image Metadata */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-2">Image Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Size: {(analysis.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</div>
              <div>Format: {analysis.metadata.format}</div>
              <div>Dimensions: {analysis.metadata.dimensions.width} × {analysis.metadata.dimensions.height}</div>
              <div>Uploaded: {new Date(analysis.metadata.uploadTime).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ImageAnalysisDisplay 