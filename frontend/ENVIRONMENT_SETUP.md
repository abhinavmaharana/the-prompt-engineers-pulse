# Environment Variables Setup Guide

This guide explains how to set up the required environment variables for the City Pulse application.

## Required Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# Google Maps API Key (Required for map functionality)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Cloud Vision API Key (Required for real image analysis)
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key_here

# Bland AI API Key (Required for callback functionality)
VITE_BLAND_AI_API_KEY=org_1fb62a7f68a9a0b2519e374b689c574efd586d993b0b4147c31606b8216d5f699d050bcdcda8489ca47469

# ElevenLabs API Key (Optional - for voice features)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## How to Get API Keys

### 1. Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Google Cloud Vision API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Enable the Cloud Vision API
4. Create credentials (API Key) or use the same API key as Maps
5. The Vision API will analyze uploaded images for:
   - Object detection (cars, roads, signs, etc.)
   - Text detection (road signs, labels)
   - Label detection (traffic-related content)
   - Safe search detection

### 3. Bland AI API Key
- Already provided: `org_1fb62a7f68a9a0b2519e374b689c574efd586d993b0b4147c31606b8216d5f699d050bcdcda8489ca47469`
- This enables automated phone callbacks for reported incidents

### 4. ElevenLabs API Key (Optional)
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Create an account
3. Get your API key from the dashboard
4. Used for voice notifications and AI voice features

## Features Enabled by Each API

### With Google Maps API:
- Interactive map display
- Location selection for reports
- Route planning
- Traffic layer overlay

### With Google Cloud Vision API:
- **Real image analysis** (not static/simulated)
- Automatic detection of:
  - Traffic infrastructure (roads, signs, signals)
  - Vehicles and traffic conditions
  - Construction work and barriers
  - Accidents and emergency situations
  - Water logging and drainage issues
  - Text on signs and labels
- Dynamic issue type prediction
- Accurate urgency assessment
- Context-aware recommendations

### With Bland AI API:
- Automated phone callbacks
- Voice-based incident follow-up
- Emergency response coordination

### With ElevenLabs API:
- Voice notifications
- AI voice assistant
- Audio feedback for actions

## Fallback Behavior

If any API key is missing:
- **Google Maps**: Map will not load, but other features work
- **Google Cloud Vision**: Falls back to text-based analysis only
- **Bland AI**: Callback feature disabled
- **ElevenLabs**: Voice features disabled

## Security Notes

1. **Never commit your `.env` file** to version control
2. **Restrict API keys** to your domain in Google Cloud Console
3. **Monitor API usage** to avoid unexpected charges
4. **Use environment-specific keys** for development/production

## Testing the Setup

1. Start the development server: `npm run dev`
2. Check the browser console for any API-related errors
3. Test image upload to verify Vision API is working
4. Test map functionality to verify Maps API is working
5. Test callback feature to verify Bland AI is working

## Troubleshooting

### Image Analysis Not Working
- Check if `VITE_GOOGLE_CLOUD_VISION_API_KEY` is set
- Verify the Vision API is enabled in Google Cloud Console
- Check browser console for API errors
- Ensure the API key has Vision API permissions

### Map Not Loading
- Check if `VITE_GOOGLE_MAPS_API_KEY` is set
- Verify Maps JavaScript API is enabled
- Check for domain restrictions on the API key

### Callbacks Not Working
- Verify Bland AI API key is correct
- Check network connectivity
- Review browser console for errors 