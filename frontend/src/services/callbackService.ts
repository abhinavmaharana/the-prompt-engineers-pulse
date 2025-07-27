// Bland AI Callback Service
export interface CallbackRequest {
  phoneNumber: string
  reportId: string
  description: string
  location: string
  issueType?: string
  urgency?: number
}

export interface BlandAIResponse {
  call_id: string
  status: string
  message?: string
}

// Bland AI API Configuration
const BLAND_AI_CONFIG = {
  baseUrl: 'https://api.bland.ai/v1/calls',
  apiKey: import.meta.env.VITE_BLAND_AI_API_KEY || 'org_1fb62a7f68a9a0b2519e374b689c574efd586d993b0b4147c31606b8216d5f699d050bcdcda8489ca47469'
}

// Request a callback using Bland AI
export const requestCallback = async (callbackData: CallbackRequest): Promise<BlandAIResponse> => {
  try {
    const payload = {
      phone_number: callbackData.phoneNumber,
      voice: "Alena",
      wait_for_greeting: false,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: false,
      interruption_threshold: 100,
      block_interruptions: false,
      max_duration: 12,
      model: "base",
      language: "en",
      background_track: "none",
      endpoint: "https://api.bland.ai",
      voicemail_action: "hangup",
      task: generateTaskDescription(callbackData),
      first_sentence: generateFirstSentence(callbackData)
    }

    const response = await fetch(BLAND_AI_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': BLAND_AI_CONFIG.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Bland AI API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Bland AI callback request successful:', result)
    
    return {
      call_id: result.call_id,
      status: 'scheduled',
      message: 'Callback scheduled successfully'
    }
  } catch (error) {
    console.error('Error requesting callback:', error)
    throw error
  }
}

// Generate task description for Bland AI
const generateTaskDescription = (data: CallbackRequest): string => {
  return `You are a calm, helpful, and empathetic voice assistant calling a citizen who has uploaded a geo-tagged image related to a traffic issue in Bengaluru.

Start the call politely. Confirm if they are safe and if this is a good time to speak. Then, based on the image and location data, offer the following:

1. Ask what kind of help they need: medical, towing, police assistance, or just reporting the issue.
2. If it's an emergency, offer to contact the appropriate local service (like Bengaluru traffic police, ambulance, or breakdown service).
3. If they are simply reporting, thank them and assure them the issue will be passed on to authorities.
4. Speak naturally, don't sound robotic. Use a warm, understanding tone.
5. If they need nothing else, end the call politely, wishing them a safe day.

Report details: ${data.description}. Location: ${data.location}.${data.issueType ? ` Issue type: ${data.issueType}.` : ''}

Keep the tone helpful, warm, and efficient.`
}

// Generate first sentence for the call
const generateFirstSentence = (_data: CallbackRequest): string => {
  return "Hi, this is the Bengaluru Traffic Assistant calling. We noticed you submitted a traffic-related report. Are you okay, and is this a good time to talk?"
}

// Fallback callback service for when Bland AI is not available
export class FallbackCallbackService {
  static async requestCallback(callbackData: CallbackRequest): Promise<BlandAIResponse> {
    // Simulate callback request
    console.log('Fallback callback service - simulating callback request:', callbackData)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      call_id: `fallback_${Date.now()}`,
      status: 'scheduled',
      message: 'Callback scheduled (simulated)'
    }
  }
}

// Service wrapper for callback requests
export class CallbackServiceWrapper {
  private static useFallback = false

  static async requestCallback(callbackData: CallbackRequest): Promise<BlandAIResponse> {
    try {
      if (!this.useFallback) {
        return await requestCallback(callbackData)
      } else {
        return await FallbackCallbackService.requestCallback(callbackData)
      }
    } catch (error) {
      console.error('Error with Bland AI, using fallback:', error)
      this.useFallback = true
      return await FallbackCallbackService.requestCallback(callbackData)
    }
  }

  static getServiceStatus(): { usingBlandAI: boolean; usingFallback: boolean } {
    return {
      usingBlandAI: !this.useFallback,
      usingFallback: this.useFallback
    }
  }
} 