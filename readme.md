# Pulse Bengaluru - Frontend

## 🚀 Overview

Pulse Bengaluru is a modern React web application built with TypeScript and styled entirely with Tailwind CSS. The app provides real-time traffic intelligence for Bengaluru city, featuring a live map interface, real-time event feed, and user-generated traffic reports.

### Key Features

- **Live Map Dashboard** - Interactive Google Maps with real-time traffic events
- **Event Feed** - Live streaming of traffic incidents and updates
- **Report System** - Anonymous traffic reports with image uploads
- **Real-time Data** - Firebase Firestore integration for live updates

## 🛠 Tech Stack

- **React 18** - Modern React with functional components and hooks
- **TypeScript** - Full type safety throughout the application
- **Firebase SDK v9+** - Firestore and Cloud Storage (no authentication)
- **Google Maps API** - Interactive maps with custom styling
- **Tailwind CSS v3.4.1** - Utility-first CSS framework (no separate CSS files)
- **Vite** - Fast build tool and development server

## 📋 Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn** package manager
3. **Google Maps API Key** with following APIs enabled:
   - Maps JavaScript API
   - Places API (optional)
4. **Firebase Project** with:
   - Firestore Database
   - Cloud Storage

## ⚙️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Firebase Configuration

Update `src/firebaseConfig.ts` with your Firebase project credentials:

```typescript
const firebaseConfig: FirebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗 Project Structure

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
├── index.css                  # Tailwind CSS directives only
├── firebaseConfig.ts          # Firebase configuration (Firestore + Storage)
├── types/
│   └── google-maps.d.ts      # Google Maps type declarations
└── components/
    ├── Header.tsx            # Application header with branding
    ├── MapDashboard.tsx      # Google Maps integration
    ├── EventFeed.tsx         # Live event feed component
    └── ReportUploader.tsx    # Anonymous file upload modal
```

## 🎨 Design System

### Color Palette (TomTom-inspired)
All colors are applied using Tailwind's arbitrary values:
- **Primary Background**: `bg-[#1A1A2E]` (Dark Blue/Charcoal)
- **Primary Yellow**: `text-[#FFC947]` (Actions & Highlights)
- **Accent Red**: `text-[#E84545]` (Alerts & Critical)
- **Light Text**: `text-[#F0F0F0]` (Primary Text)
- **Dark Text**: `text-[#16213E]` (On Light Backgrounds)

### Styling Approach
- **Pure Tailwind CSS** - No separate CSS files, all styling with utility classes
- **Arbitrary Values** - Custom colors and spacing using `[value]` syntax
- **Responsive Design** - Mobile-first approach with Tailwind breakpoints
- **TypeScript** - Full type safety for all components and props

### Typography
- **Font Family**: Inter (Google Fonts) - `font-['Inter',sans-serif]`
- **Weights**: 300, 400, 500, 600, 700 - Applied via Tailwind classes

## 🔥 Firebase Integration

### Firestore Collections

The app expects the following Firestore structure:

```
synthesized_events/
├── {docId}/
    ├── category: string        # "Accident", "Traffic Jam", etc.
    ├── description: string     # Event description
    ├── location: GeoPoint      # Latitude/Longitude
    ├── createdAt: Timestamp    # Event timestamp
    └── ...other fields
```

### Cloud Storage

Anonymous user uploads are stored in the path:
```
user-uploads/anonymous/{timestamp}_{filename}
```

## 🗺 Google Maps Features

- **Custom Dark Theme** - Professional dark styling via map styles
- **Real-time Markers** - Event markers with category-based colors
- **Info Windows** - Detailed event information on marker click
- **TypeScript Integration** - Full type safety for Google Maps API

## 📱 Components Guide

### Header Component (`Header.tsx`)
- App branding and title
- Clean, centered design
- Styled with Tailwind utility classes

### MapDashboard Component (`MapDashboard.tsx`)
- Google Maps integration with TypeScript
- Real-time Firestore listeners
- Custom markers and info windows
- Dark theme styling with Tailwind

### EventFeed Component (`EventFeed.tsx`)
- Live scrolling event feed
- Real-time updates from Firestore
- Category icons and colors
- Custom scrollbar styling

### ReportUploader Component (`ReportUploader.tsx`)
- Floating Action Button (FAB)
- Modal dialog for uploads
- Drag & drop file support
- Image preview functionality
- Anonymous Firebase Storage integration

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure these environment variables are set in your deployment platform:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_api_key
```

### Hosting Options

- **Firebase Hosting** (Recommended)
- **Vercel**
- **Netlify**
- **AWS S3 + CloudFront**

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### TypeScript Features

- **Strict Type Checking** - Full type safety
- **Interface Definitions** - Clear component prop types
- **Firebase Types** - Type-safe database operations
- **Google Maps Types** - Complete API type coverage

### Tailwind CSS Benefits

- **No CSS Files** - All styling via utility classes
- **Design System** - Consistent spacing and colors
- **Responsive** - Mobile-first responsive design
- **Performance** - Only used utilities included in build

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**
   - Check Google Maps API key
   - Verify API restrictions
   - Check browser console for errors

2. **Firebase connection issues**
   - Verify Firebase configuration
   - Check Firestore security rules
   - Ensure APIs are enabled

3. **TypeScript errors**
   - Check type imports
   - Verify interface definitions
   - Ensure proper type declarations

4. **Build errors**
   - Clear node_modules and reinstall
   - Check for missing dependencies
   - Verify environment variables

### Performance Optimization

- Events are limited to 50 items for performance
- Images are optimized for web upload
- Map markers are efficiently managed
- TypeScript provides compile-time optimization
- Tailwind CSS purges unused styles automatically

## 📄 License

This project is part of the Pulse-AI hackathon submission.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with TypeScript
4. Style with Tailwind CSS only
5. Test thoroughly
6. Submit a pull request

---

For questions or support, please refer to the project documentation or create an issue in the repository.
