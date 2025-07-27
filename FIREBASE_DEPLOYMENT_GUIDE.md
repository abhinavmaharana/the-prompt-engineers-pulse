# 🚀 Firebase Deployment Guide for City Pulse
## Deploy Your Smart City Platform to Production

---

## 📋 **Prerequisites Check**

### **✅ What You Already Have:**
- Firebase project: `blr-traffic-pilot`
- Firebase configuration in `src/config/firebase.ts`
- Firebase hosting config in `firebase.json`
- Firestore rules and indexes
- Storage rules

### **🔧 What You Need to Install:**
- Firebase CLI (if not already installed)

---

## 🛠️ **Step-by-Step Deployment Process**

### **Step 1: Install Firebase CLI (if not installed)**
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### **Step 2: Login to Firebase**
```bash
# Login to your Firebase account
firebase login

# This will open a browser window for authentication
# Use the same Google account that owns your Firebase project
```

### **Step 3: Initialize Firebase Project (if not done)**
```bash
# Navigate to frontend directory
cd frontend

# Initialize Firebase (if .firebaserc doesn't exist)
firebase init

# Select the following options:
# - Choose "Hosting: Configure files for Firebase Hosting"
# - Choose "Use an existing project"
# - Select "blr-traffic-pilot"
# - Public directory: "dist"
# - Configure as single-page app: "Yes"
# - Set up automatic builds: "No"
```

### **Step 4: Build Your Application**
```bash
# Make sure you're in the frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Build the application for production
npm run build

# This will create a 'dist' folder with your built application
```

### **Step 5: Deploy to Firebase**
```bash
# Deploy everything (hosting, firestore, storage)
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting

# Or deploy specific services
firebase deploy --only hosting,firestore,storage
```

---

## 🎯 **Deployment Commands Reference**

### **Quick Deploy (All Services)**
```bash
cd frontend
npm run build
firebase deploy
```

### **Deploy Only Hosting**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### **Deploy Firestore Rules**
```bash
cd frontend
firebase deploy --only firestore
```

### **Deploy Storage Rules**
```bash
cd frontend
firebase deploy --only storage
```

### **Preview Before Deploy**
```bash
cd frontend
npm run build
firebase serve
# This will serve your app locally at http://localhost:5000
```

---

## 🔧 **Environment Variables Setup**

### **Step 1: Create Production Environment File**
```bash
# Create .env.production file
cd frontend
touch .env.production
```

### **Step 2: Add Environment Variables**
```env
# .env.production
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=AIzaSyDblj4kIKd2OmZg29H5pgidaBQW8MLc4WQ
VITE_FIREBASE_AUTH_DOMAIN=blr-traffic-pilot.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blr-traffic-pilot
VITE_FIREBASE_STORAGE_BUCKET=blr-traffic-pilot.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=183390900351
VITE_FIREBASE_APP_ID=1:183390900351:web:508b4639b9d246242cef4a

# Add ElevenLabs keys when you implement voice features
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_VOICE_ID_BENGALURU=your_bengaluru_voice_id
VITE_ELEVENLABS_VOICE_ID_EMERGENCY=your_emergency_voice_id
VITE_ELEVENLABS_VOICE_ID_ASSISTANT=your_assistant_voice_id
```

### **Step 3: Update Vite Config for Production**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          maps: ['@googlemaps/js-api-loader']
        }
      }
    }
  }
})
```

---

## 🚀 **Deployment Scripts**

### **Add to package.json**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:firestore": "firebase deploy --only firestore",
    "deploy:storage": "firebase deploy --only storage",
    "serve": "npm run build && firebase serve"
  }
}
```

### **One-Command Deployment**
```bash
# Deploy everything
npm run deploy

# Deploy only hosting
npm run deploy:hosting

# Deploy only firestore rules
npm run deploy:firestore

# Deploy only storage rules
npm run deploy:storage
```

---

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --force
```

### **Issue 2: Firebase CLI Not Found**
```bash
# Reinstall Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools

# Or use npx
npx firebase-tools deploy
```

### **Issue 3: Permission Errors**
```bash
# Check if you're logged in
firebase login --reauth

# Check project access
firebase projects:list
```

### **Issue 4: Environment Variables Not Working**
```bash
# Make sure .env.production exists
ls -la .env*

# Check if variables are being read
echo $VITE_GOOGLE_MAPS_API_KEY
```

---

## 📊 **Post-Deployment Checklist**

### **✅ Verify Deployment**
1. **Check hosting URL**: https://blr-traffic-pilot.web.app
2. **Test all features**:
   - Google Maps integration
   - Traffic monitoring
   - Report submission
   - Predictive analytics
   - Real-time updates

### **✅ Monitor Performance**
1. **Check Firebase Console**:
   - Hosting: Page views and bandwidth
   - Firestore: Read/write operations
   - Storage: File uploads/downloads

2. **Monitor API Usage**:
   - Google Maps API quota
   - Firebase usage limits

### **✅ Security Check**
1. **Verify Firestore rules** are working
2. **Check Storage rules** for file uploads
3. **Test authentication** if implemented

---

## 🌐 **Custom Domain Setup (Optional)**

### **Step 1: Add Custom Domain**
```bash
# Add custom domain
firebase hosting:channel:deploy production

# Or through Firebase Console:
# 1. Go to Firebase Console > Hosting
# 2. Click "Add custom domain"
# 3. Enter your domain (e.g., citypulse.bengaluru.gov.in)
```

### **Step 2: Configure DNS**
```bash
# Add DNS records as instructed by Firebase
# Usually CNAME records pointing to your Firebase hosting URL
```

---

## 📱 **Mobile Optimization**

### **Add to index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3B82F6" />
    <meta name="description" content="City Pulse - Bengaluru's AI-Powered Smart City Platform" />
    <title>City Pulse - Smart Traffic Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 🚀 **Quick Start Commands**

### **First Time Setup**
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Navigate to frontend
cd frontend

# 4. Install dependencies
npm install

# 5. Build and deploy
npm run deploy
```

### **Regular Deployment**
```bash
cd frontend
npm run deploy
```

### **Development with Live Preview**
```bash
cd frontend
npm run serve
# Visit http://localhost:5000
```

---

## 🎯 **Your Live URLs**

After successful deployment, your City Pulse platform will be available at:

- **Main URL**: https://blr-traffic-pilot.web.app
- **Alternative URL**: https://blr-traffic-pilot.firebaseapp.com

### **Firebase Console Links**
- **Project Console**: https://console.firebase.google.com/project/blr-traffic-pilot
- **Hosting**: https://console.firebase.google.com/project/blr-traffic-pilot/hosting
- **Firestore**: https://console.firebase.google.com/project/blr-traffic-pilot/firestore
- **Storage**: https://console.firebase.google.com/project/blr-traffic-pilot/storage

---

## 🎉 **Deployment Success!**

Once deployed, your City Pulse platform will be:
- ✅ **Live and accessible** to 12+ million Bengaluru residents
- ✅ **Scalable** with Firebase's global infrastructure
- ✅ **Real-time** with Firestore database
- ✅ **Secure** with proper rules and authentication
- ✅ **Mobile-optimized** for all devices
- ✅ **Ready for voice features** when you implement ElevenLabs

**Your smart city platform is now live and ready to revolutionize Bengaluru's traffic management!** 🚦🤖✨ 