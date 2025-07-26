# Pulse - Civic Issue Reporting Platform

A modern, professional web application for citizens to report civic issues on an interactive map. Built with React, TypeScript, and Google Maps API, designed to match the TomTom Traffic Index interface for a familiar and intuitive user experience.

## Features

- **TomTom-Inspired Interface**: Professional design matching the TomTom Traffic Index layout and styling
- **Interactive Map**: Click anywhere on the map to report traffic issues with traffic light color coding
- **Traffic Controls**: Map overlay controls for "All traffic", "Traffic flow", and "Traffic incidents"
- **Real-time Feed**: Live updates of traffic reports with current status indicators
- **Multi-step Reporting**: Guided wizard for submitting detailed traffic issue reports
- **Photo Upload**: Drag-and-drop image upload with preview for visual documentation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Animated UI**: Smooth transitions and micro-interactions powered by Framer Motion
- **Traffic Color System**: Green, yellow, orange, and red indicators for issue severity
- **Professional Navigation**: Header with search, settings, and share functionality
- **Focus Navigation**: Click feed items to focus map on specific traffic issues
- **Accessibility**: Full keyboard navigation and screen reader support

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4.1
- **Maps**: Google Maps JavaScript API
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **State Management**: React Hooks

## Design Inspiration

This application's design is directly inspired by the [TomTom Traffic Index](https://www.tomtom.com/traffic-index/bengaluru-traffic/), featuring:

- Professional header with navigation and search functionality
- Traffic-focused color palette (red, yellow, green, orange)
- Map overlay controls for traffic visualization
- Clean, data-driven interface design
- Traffic light system for issue severity
- Professional typography and spacing
- Real-time status indicators

## Color Palette

The application uses a TomTom-inspired traffic color palette:

- **Primary**: `#E53E3E` (Red) - Main brand color for buttons and traffic issues
- **Primary Hover**: `#C53030` (Darker red) - Hover states
- **Secondary**: `#38A169` (Green) - Success states and resolved issues
- **Accent**: `#3182CE` (Blue) - Links and tertiary actions
- **Background**: `#FFFFFF` (White) - Main background
- **Background Secondary**: `#F7FAFC` (Light gray) - Secondary backgrounds
- **Text**: `#1A202C` (Dark gray) - Primary text
- **Text Secondary**: `#4A5568` (Medium gray) - Secondary text
- **Border**: `#E2E8F0` (Light gray) - Borders and dividers
- **Traffic Colors**: 
  - `#38A169` (Green) - Resolved issues
  - `#D69E2E` (Yellow) - Pending issues
  - `#DD6B20` (Orange) - Moderate issues
  - `#E53E3E` (Red) - Active issues

## Animations & Interactions

- **Page Load**: Smooth fade-in animation for the entire application
- **Header**: Glassmorphism header with gradient logo and responsive buttons
- **Modal Wizard**: Multi-step animated wizard with progress indicators
- **Feed Cards**: Staggered slide-up animations for report cards
- **Map Markers**: Drop-in and bounce animations on hover
- **Floating Action Button**: Spring animations with scale effects
- **Mobile Feed**: Slide-up panel with drag handle
- **Form Elements**: Enhanced focus states and micro-interactions
- **Photo Upload**: Drag-and-drop with visual feedback
- **Focus Navigation**: Smooth map panning to selected reports

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Maps API Key:
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a `.env` file in the frontend directory
   - Add your API key: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

## Usage

### Desktop Experience
1. **Split Layout**: Map on the left, live feed on the right
2. **Report Issue**: Click the "Report Issue" button in the header or click on the map
3. **Multi-Step Process**: Follow the animated wizard through location, description, photo, and confirmation
4. **Feed Interaction**: Click any report card to focus the map on that location
5. **Toggle Feed**: Use the hamburger menu to show/hide the feed panel

### Mobile Experience
1. **Full-Screen Map**: Map takes the full screen for optimal viewing
2. **Floating Action Button**: Prominent FAB for quick reporting access
3. **Slide-Up Feed**: Swipe up from bottom to view recent reports
4. **Touch-Optimized**: Large touch targets and gesture-friendly interactions
5. **Responsive Design**: Adapts seamlessly to all screen sizes

### Advanced Features
- **Drag & Drop**: Upload photos by dragging files onto the upload area
- **Real-Time Updates**: New reports appear instantly in the feed
- **Focus Navigation**: Seamless map-to-feed interaction
- **Accessibility**: Full keyboard and screen reader support

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Glassmorphism header with responsive controls
│   ├── MapComponent.tsx    # Interactive map with animated markers
│   ├── ModalWizard.tsx     # Multi-step animated reporting wizard
│   ├── Feed.tsx            # Real-time report feed with cards
│   └── FAB.tsx             # Floating action button for mobile
├── App.tsx                 # Main application with responsive layout
├── main.tsx               # Application entry point
└── index.css              # Global styles, animations, and glassmorphism
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Pulse AI hackathon project.
