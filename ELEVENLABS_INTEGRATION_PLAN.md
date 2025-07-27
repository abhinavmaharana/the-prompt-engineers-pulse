# 🎤 ElevenLabs Integration Plan for City Pulse
## Voice-Enabled Smart City Platform

---

## 📁 **File Structure & Integration Points**

### **1. New Service Files to Create**

```
frontend/src/services/
├── voiceService.ts          # Main ElevenLabs integration
├── audioPlayerService.ts    # Audio playback management
├── speechToTextService.ts   # Voice input processing
└── voiceNotificationService.ts # Voice alert system
```

### **2. Enhanced Existing Files**

```
frontend/src/
├── components/
│   ├── VoiceAssistant.tsx      # Voice interaction component
│   ├── AudioPlayer.tsx         # Audio playback component
│   ├── VoiceReportButton.tsx   # Voice reporting button
│   └── VoiceAlertBanner.tsx    # Voice alert display
├── hooks/
│   ├── useVoiceAssistant.ts    # Voice assistant hook
│   └── useAudioPlayer.ts       # Audio player hook
├── utils/
│   ├── voiceUtils.ts           # Voice utility functions
│   └── audioUtils.ts           # Audio processing utilities
└── types/
    └── voiceTypes.ts           # Voice-related TypeScript types
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Install Dependencies**
```bash
cd frontend
npm install @elevenlabs/api
npm install react-speech-recognition
npm install howler
npm install @types/react-speech-recognition
```

### **Step 2: Environment Configuration**
```env
# .env file
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID_BENGALURU=your_bengaluru_voice_id
VITE_ELEVENLABS_VOICE_ID_EMERGENCY=your_emergency_voice_id
VITE_ELEVENLABS_VOICE_ID_ASSISTANT=your_assistant_voice_id
```

### **Step 3: Core Voice Service Implementation**

#### **`frontend/src/services/voiceService.ts`**
```typescript
import { ElevenLabsAPI } from '@elevenlabs/api'

const elevenLabs = new ElevenLabsAPI({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY
})

export interface VoiceConfig {
  voice_id: string
  model_id: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
}

export const voiceService = {
  // Generate traffic alert voice
  generateTrafficAlert: async (alert: string, urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const voiceConfig: VoiceConfig = {
      voice_id: urgency === 'critical' 
        ? import.meta.env.VITE_ELEVENLABS_VOICE_ID_EMERGENCY
        : import.meta.env.VITE_ELEVENLABS_VOICE_ID_BENGALURU,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: urgency === 'critical' ? 0.3 : 0.7,
        similarity_boost: urgency === 'critical' ? 0.9 : 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }

    try {
      const audioBuffer = await elevenLabs.generateSpeech({
        text: alert,
        ...voiceConfig
      })
      
      return audioBuffer
    } catch (error) {
      console.error('Error generating voice alert:', error)
      throw error
    }
  },

  // Generate area summary voice
  generateAreaSummary: async (summary: string) => {
    const voiceConfig: VoiceConfig = {
      voice_id: import.meta.env.VITE_ELEVENLABS_VOICE_ID_ASSISTANT,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }

    try {
      const audioBuffer = await elevenLabs.generateSpeech({
        text: summary,
        ...voiceConfig
      })
      
      return audioBuffer
    } catch (error) {
      console.error('Error generating voice summary:', error)
      throw error
    }
  },

  // Generate multilingual voice (Kannada, Hindi, English)
  generateMultilingualVoice: async (text: string, language: 'kannada' | 'hindi' | 'english') => {
    const languagePrefix = {
      kannada: 'ಕನ್ನಡ: ',
      hindi: 'हिंदी: ',
      english: 'English: '
    }

    const voiceConfig: VoiceConfig = {
      voice_id: import.meta.env.VITE_ELEVENLABS_VOICE_ID_BENGALURU,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }

    try {
      const audioBuffer = await elevenLabs.generateSpeech({
        text: `${languagePrefix[language]}${text}`,
        ...voiceConfig
      })
      
      return audioBuffer
    } catch (error) {
      console.error('Error generating multilingual voice:', error)
      throw error
    }
  }
}
```

#### **`frontend/src/services/audioPlayerService.ts`**
```typescript
import { Howl } from 'howler'

export interface AudioPlayerConfig {
  volume?: number
  rate?: number
  loop?: boolean
  onEnd?: () => void
  onError?: (error: any) => void
}

export const audioPlayerService = {
  // Play audio buffer
  playAudioBuffer: async (audioBuffer: ArrayBuffer, config: AudioPlayerConfig = {}) => {
    const {
      volume = 1.0,
      rate = 1.0,
      loop = false,
      onEnd,
      onError
    } = config

    try {
      // Convert ArrayBuffer to Blob
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      const sound = new Howl({
        src: [url],
        volume,
        rate,
        loop,
        onend: () => {
          URL.revokeObjectURL(url)
          onEnd?.()
        },
        onloaderror: (id, error) => {
          URL.revokeObjectURL(url)
          onError?.(error)
        }
      })

      sound.play()
      return sound
    } catch (error) {
      console.error('Error playing audio:', error)
      throw error
    }
  },

  // Stop all audio
  stopAll: () => {
    Howler.stop()
  },

  // Pause all audio
  pauseAll: () => {
    Howler.pause()
  },

  // Resume all audio
  resumeAll: () => {
    Howler.resume()
  }
}
```

#### **`frontend/src/services/voiceNotificationService.ts`**
```typescript
import { voiceService } from './voiceService'
import { audioPlayerService } from './audioPlayerService'
import type { PredictiveAlert, IntelligentNotification } from './notificationService'

export interface VoiceNotification {
  id: string
  type: 'traffic_alert' | 'area_summary' | 'emergency' | 'route_update'
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  area?: string
  audioBuffer?: ArrayBuffer
  createdAt: Date
}

export const voiceNotificationService = {
  // Generate and play traffic alert
  playTrafficAlert: async (alert: PredictiveAlert) => {
    const alertMessage = `🚨 Traffic Alert: ${alert.title}. ${alert.message}. 
      This is affecting ${alert.area}. Please consider alternative routes.`

    try {
      const audioBuffer = await voiceService.generateTrafficAlert(
        alertMessage, 
        alert.severity as 'low' | 'medium' | 'high' | 'critical'
      )

      await audioPlayerService.playAudioBuffer(audioBuffer, {
        volume: alert.severity === 'critical' ? 1.0 : 0.8,
        rate: alert.severity === 'critical' ? 1.1 : 1.0
      })

      return audioBuffer
    } catch (error) {
      console.error('Error playing traffic alert:', error)
      throw error
    }
  },

  // Generate and play area summary
  playAreaSummary: async (summary: string, area: string) => {
    const summaryMessage = `Area intelligence for ${area}: ${summary}`

    try {
      const audioBuffer = await voiceService.generateAreaSummary(summaryMessage)

      await audioPlayerService.playAudioBuffer(audioBuffer, {
        volume: 0.7,
        rate: 0.9 // Slightly slower for better comprehension
      })

      return audioBuffer
    } catch (error) {
      console.error('Error playing area summary:', error)
      throw error
    }
  },

  // Generate and play emergency broadcast
  playEmergencyBroadcast: async (incident: any) => {
    const emergencyMessage = `🚨 EMERGENCY: ${incident.type} reported in ${incident.area}. 
      Emergency services are responding. Please avoid the area and follow official instructions.`

    try {
      const audioBuffer = await voiceService.generateTrafficAlert(
        emergencyMessage, 
        'critical'
      )

      // Play with higher volume and repeat once
      await audioPlayerService.playAudioBuffer(audioBuffer, {
        volume: 1.0,
        rate: 1.0,
        loop: false,
        onEnd: () => {
          // Repeat once for critical alerts
          setTimeout(() => {
            audioPlayerService.playAudioBuffer(audioBuffer, {
              volume: 1.0,
              rate: 1.0
            })
          }, 1000)
        }
      })

      return audioBuffer
    } catch (error) {
      console.error('Error playing emergency broadcast:', error)
      throw error
    }
  },

  // Generate and play route update
  playRouteUpdate: async (route: any) => {
    const routeMessage = `Route update: Your journey from ${route.origin} to ${route.destination} 
      will take ${route.duration}. Current traffic conditions: ${route.trafficCondition}. 
      ${route.alternative ? `Consider alternative route via ${route.alternative}.` : ''}`

    try {
      const audioBuffer = await voiceService.generateTrafficAlert(routeMessage, 'medium')

      await audioPlayerService.playAudioBuffer(audioBuffer, {
        volume: 0.6,
        rate: 0.95
      })

      return audioBuffer
    } catch (error) {
      console.error('Error playing route update:', error)
      throw error
    }
  }
}
```

### **Step 4: React Components Implementation**

#### **`frontend/src/components/VoiceAssistant.tsx`**
```typescript
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MicrophoneIcon, SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline'
import { voiceService } from '../services/voiceService'
import { audioPlayerService } from '../services/audioPlayerService'

interface VoiceAssistantProps {
  onVoiceCommand?: (command: string) => void
  isListening?: boolean
  onToggleListening?: () => void
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onVoiceCommand,
  isListening = false,
  onToggleListening
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  const handleVoiceCommand = async (command: string) => {
    setLastCommand(command)
    setIsProcessing(true)

    try {
      // Process voice command
      const response = await processVoiceCommand(command)
      
      // Generate voice response
      const audioBuffer = await voiceService.generateAreaSummary(response)
      
      setIsPlaying(true)
      await audioPlayerService.playAudioBuffer(audioBuffer, {
        onEnd: () => setIsPlaying(false)
      })

      onVoiceCommand?.(command)
    } catch (error) {
      console.error('Error processing voice command:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processVoiceCommand = async (command: string): Promise<string> => {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('traffic') || lowerCommand.includes('congestion')) {
      return 'Current traffic conditions are moderate. There are 3 active reports in your area.'
    }
    
    if (lowerCommand.includes('route') || lowerCommand.includes('directions')) {
      return 'I can help you plan a route. Please specify your destination.'
    }
    
    if (lowerCommand.includes('report') || lowerCommand.includes('issue')) {
      return 'I can help you report an issue. Please describe what you see.'
    }
    
    return 'I heard your command. How can I help you with traffic information?'
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={onToggleListening}
            disabled={isProcessing || isPlaying}
            className={`rounded-full p-3 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-all duration-300`}
          >
            {isListening ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </Button>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">
              {isListening ? 'Listening...' : 'Voice Assistant'}
            </div>
            {lastCommand && (
              <div className="text-xs text-gray-600 mt-1">
                Last command: "{lastCommand}"
              </div>
            )}
          </div>

          {isPlaying && (
            <SpeakerWaveIcon className="w-5 h-5 text-green-500 animate-pulse" />
          )}

          {isProcessing && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default VoiceAssistant
```

#### **`frontend/src/components/VoiceAlertBanner.tsx`**
```typescript
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { voiceNotificationService } from '../services/voiceNotificationService'
import type { PredictiveAlert } from '../services/eventAnalysisService'

interface VoiceAlertBannerProps {
  alert: PredictiveAlert
  onDismiss: () => void
}

const VoiceAlertBanner: React.FC<VoiceAlertBannerProps> = ({ alert, onDismiss }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBuffer, setAudioBuffer] = useState<ArrayBuffer | null>(null)

  useEffect(() => {
    // Auto-play critical alerts
    if (alert.severity === 'critical') {
      playAlert()
    }
  }, [alert])

  const playAlert = async () => {
    try {
      setIsPlaying(true)
      const buffer = await voiceNotificationService.playTrafficAlert(alert)
      setAudioBuffer(buffer)
    } catch (error) {
      console.error('Error playing alert:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 left-4 right-4 z-50 ${getSeverityColor(alert.severity)} text-white rounded-lg shadow-lg`}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SpeakerWaveIcon className="w-5 h-5" />
              <h3 className="font-semibold">{alert.title}</h3>
              {isPlaying && (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-sm opacity-90">{alert.message}</p>
            <div className="text-xs opacity-75 mt-1">
              📍 {alert.area} • 🎯 {Math.round(alert.confidence * 100)}% confidence
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alert.severity !== 'critical' && (
              <Button
                onClick={playAlert}
                disabled={isPlaying}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <SpeakerWaveIcon className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceAlertBanner
```

### **Step 5: Integration into Main App**

#### **Update `frontend/src/App.tsx`**
```typescript
// Add these imports
import VoiceAssistant from './components/VoiceAssistant'
import VoiceAlertBanner from './components/VoiceAlertBanner'
import { voiceNotificationService } from './services/voiceNotificationService'

// Add these state variables
const [isVoiceListening, setIsVoiceListening] = useState(false)
const [activeVoiceAlert, setActiveVoiceAlert] = useState<PredictiveAlert | null>(null)

// Add voice command handler
const handleVoiceCommand = (command: string) => {
  console.log('Voice command received:', command)
  // Process voice commands for navigation, reporting, etc.
}

// Add voice alert handler
const handleVoiceAlert = async (alert: PredictiveAlert) => {
  setActiveVoiceAlert(alert)
  
  // Auto-dismiss after 10 seconds for non-critical alerts
  if (alert.severity !== 'critical') {
    setTimeout(() => {
      setActiveVoiceAlert(null)
    }, 10000)
  }
}

// Add this JSX in the return statement
return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-text overflow-x-hidden relative">
    {/* Voice Alert Banner */}
    {activeVoiceAlert && (
      <VoiceAlertBanner
        alert={activeVoiceAlert}
        onDismiss={() => setActiveVoiceAlert(null)}
      />
    )}

    {/* Voice Assistant */}
    <div className="fixed bottom-20 right-6 z-40">
      <VoiceAssistant
        onVoiceCommand={handleVoiceCommand}
        isListening={isVoiceListening}
        onToggleListening={() => setIsVoiceListening(!isVoiceListening)}
      />
    </div>

    {/* Rest of your existing JSX */}
  </div>
)
```

### **Step 6: Enhanced Predictive Analytics with Voice**

#### **Update `frontend/src/components/PredictiveAnalytics.tsx`**
```typescript
// Add voice integration to predictive analytics
import { voiceNotificationService } from '../services/voiceNotificationService'

// Add voice alert functionality
const handleVoiceAlert = async (alert: PredictiveAlert) => {
  try {
    await voiceNotificationService.playTrafficAlert(alert)
  } catch (error) {
    console.error('Error playing voice alert:', error)
  }
}

// Add voice summary functionality
const handleVoiceSummary = async (summary: AIGeneratedSummary) => {
  try {
    await voiceNotificationService.playAreaSummary(summary.summary, summary.area)
  } catch (error) {
    console.error('Error playing voice summary:', error)
  }
}

// Add voice buttons to your existing JSX
<Button 
  onClick={() => handleVoiceAlert(alert)}
  className="bg-blue-500 hover:bg-blue-600 text-white"
>
  🔊 Play Alert
</Button>

<Button 
  onClick={() => handleVoiceSummary(currentSummary)}
  className="bg-green-500 hover:bg-green-600 text-white"
>
  🔊 Play Summary
</Button>
```

---

## 🎯 **Integration Priority**

### **Phase 1: Core Voice Features (Week 1)**
1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Implement `voiceService.ts`
4. ✅ Implement `audioPlayerService.ts`
5. ✅ Create `VoiceAlertBanner.tsx`

### **Phase 2: Voice Assistant (Week 2)**
1. ✅ Implement `VoiceAssistant.tsx`
2. ✅ Add voice command processing
3. ✅ Integrate with main App.tsx
4. ✅ Test voice alerts and notifications

### **Phase 3: Advanced Features (Week 3)**
1. ✅ Multilingual voice support
2. ✅ Voice-based reporting
3. ✅ Custom voice cloning
4. ✅ Emergency broadcast system

### **Phase 4: Polish & Optimization (Week 4)**
1. ✅ Performance optimization
2. ✅ Error handling
3. ✅ Accessibility improvements
4. ✅ User testing and feedback

---

## 🚀 **Getting Started Commands**

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install @elevenlabs/api react-speech-recognition howler @types/react-speech-recognition

# 3. Add environment variables to .env
echo "VITE_ELEVENLABS_API_KEY=your_api_key_here" >> .env
echo "VITE_ELEVENLABS_VOICE_ID_BENGALURU=your_voice_id" >> .env
echo "VITE_ELEVENLABS_VOICE_ID_EMERGENCY=your_emergency_voice_id" >> .env
echo "VITE_ELEVENLABS_VOICE_ID_ASSISTANT=your_assistant_voice_id" >> .env

# 4. Create the service files
touch src/services/voiceService.ts
touch src/services/audioPlayerService.ts
touch src/services/voiceNotificationService.ts

# 5. Create the component files
touch src/components/VoiceAssistant.tsx
touch src/components/VoiceAlertBanner.tsx

# 6. Start development
npm run dev
```

This integration plan will transform City Pulse into a **voice-enabled smart city platform** with:
- 🔊 **Voice traffic alerts** for real-time notifications
- 🎤 **Voice assistant** for hands-free operation
- 🌍 **Multilingual support** (Kannada, Hindi, English)
- 🚨 **Emergency voice broadcasts** for critical incidents
- 📊 **Voice area summaries** for accessibility

The voice features will significantly enhance your Google AI integration score and make City Pulse stand out as an innovative, accessible platform! 🎤🚦✨ 