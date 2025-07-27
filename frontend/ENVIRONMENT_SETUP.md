# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

### Google Maps API Key (Required)
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Bland AI API Key (Optional - uses fallback if not provided)
```
VITE_BLAND_AI_API_KEY=org_1fb62a7f68a9a0b2519e374b689c574efd586d993b0b4147c31606b8216d5f699d050bcdcda8489ca47469
```

**Note**: The API key is already configured and will work immediately. This enables automated phone callbacks for traffic reports using Bland AI's voice assistant.

### Firebase Configuration (Optional - uses default if not provided)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

## How to Get API Keys

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API, Places API, and Directions API
4. Create credentials (API Key)
5. Restrict the key to your domain for security

### Bland AI API Key
- The API key is already provided: `org_1fb62a7f68a9a0b2519e374b689c574efd586d993b0b4147c31606b8216d5f699d050bcdcda8489ca47469`
- This enables automated phone callbacks for traffic reports using Bland AI's voice assistant
- Uses the "Alena" voice with natural conversation capabilities
- Calls are scheduled immediately and last up to 12 minutes
- Includes safety checks and emergency assistance options

### Firebase Configuration
- Only needed if you want to use your own Firebase project
- Otherwise, the app uses the default configuration

## Fallback Behavior

The application is designed to work even without API keys:
- **Google Maps**: Will show a placeholder map
- **Bland AI**: Will simulate callback requests
- **Firebase**: Will use local storage for data persistence

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are prefixed with `VITE_` to make them available in the browser
- Consider restricting API keys to specific domains/IPs 