# CityPulse - Real-Time Traffic & Civic Issue Reporting Platform

A modern, professional web application for real-time traffic monitoring and civic issue reporting in Bengaluru. Built with React, TypeScript, and Google Maps API, featuring live traffic data, route planning, and comprehensive traffic visualization.

## 🚦 Features

### **Real-Time Traffic Monitoring**
- **Live Traffic Data**: Real-time Google Maps traffic layer showing current road conditions
- **Traffic Color Coding**: Green (normal), Yellow (moderate), Red (heavy), Dark Red (severe)
- **Bengaluru Focus**: Optimized for Bengaluru traffic patterns and road network
- **Live Updates**: Traffic conditions update automatically

### **Interactive Traffic Views**
- **All Traffic**: Complete view with real-time traffic + user reports
- **Flow**: Traffic flow issues (congestion, slow traffic, jams, construction)
- **Incidents**: Traffic incidents (accidents, road blocking, incidents)
- **Dynamic Legends**: Color-coded legends for each view type

### **Route Planning**
- **Google Places Integration**: Smart location autocomplete for route planning
- **Real-Time Directions**: Live route calculation with traffic consideration
- **Dynamic Route Colors**: Route lines change color based on traffic view
- **Start/End Markers**: Clear visual indicators for route start and end points

### **Civic Issue Reporting**
- **Multi-Step Wizard**: Guided reporting process with location, photo, and description
- **Photo Upload**: Mandatory photo upload with drag-and-drop support
- **Location Options**: Choose between coordinates or manual location input
- **Google Places Autocomplete**: Smart location search for manual input
- **Real-Time Feed**: Live updates of submitted reports

### **Advanced Map Features**
- **Color-Coded Markers**: Different colored markers for different issue types
- **Interactive Markers**: Hover animations and detailed info windows
- **Zoom Controls**: Custom zoom in/out buttons
- **Traffic Toggle**: Easy switching between traffic views
- **Focus Navigation**: Click reports to focus map on specific locations

### **Professional UI/UX**
- **Modern Design**: Clean, professional interface with glassmorphism effects
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Accessibility**: Full keyboard navigation and screen reader support
- **WhatsApp Integration**: Direct contact button for support

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4.1 with custom animations
- **Maps**: Google Maps JavaScript API with Places and Directions
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **UI Components**: shadcn/ui (New York style)
- **State Management**: React Hooks

## 🎨 Design System

### **Color Palette**
- **Primary**: `#3B82F6` (Blue) - Main brand color
- **Secondary**: `#10B981` (Emerald) - Success states
- **Accent**: `#8B5CF6` (Purple) - Tertiary actions
- **Traffic Colors**:
  - `#10B981` (Green) - Normal flow
  - `#F59E0B` (Yellow) - Moderate congestion
  - `#EF4444` (Red) - Heavy traffic
  - `#991B1B` (Dark Red) - Severe congestion

### **Flow View Colors**
- `#F97316` (Orange) - Traffic congestion
- `#EAB308` (Yellow) - Slow moving traffic
- `#EF4444` (Red) - Traffic jam
- `#3B82F6` (Blue) - Construction work

### **Incidents View Colors**
- `#DC2626` (Red) - Traffic incident
- `#991B1B` (Dark Red) - Accident
- `#9333EA` (Purple) - Road blocking

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Google Maps API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd pulse-ai/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Google Maps API**:
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable these APIs:
     - Maps JavaScript API
     - Places API
     - Directions API
   - Create a `.env` file in the frontend directory:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and visit `http://localhost:5173`

## 📱 Usage Guide

### **Traffic Monitoring**
1. **View Real Traffic**: Click "All traffic" to see live Google traffic data
2. **Filter by Type**: Use "Flow" for traffic flow issues or "Incidents" for accidents
3. **Read Legends**: Check the bottom-left legend for color meanings
4. **Zoom & Pan**: Use zoom controls or mouse wheel to navigate

### **Route Planning**
1. **Plan Route**: Click "Plan Route" button in the route section
2. **Enter Locations**: Use autocomplete for origin and destination
3. **View Route**: Route appears on map with start/end markers
4. **Traffic Consideration**: Route considers current traffic conditions

### **Reporting Issues**
1. **Click Map**: Click anywhere on the map to report an issue
2. **Choose Location**: Use coordinates or search for location
3. **Upload Photo**: Mandatory photo upload (drag & drop supported)
4. **Add Description**: Optional description of the issue
5. **Submit Report**: Review and submit your report

### **Mobile Experience**
- **Full-Screen Map**: Optimized for mobile viewing
- **Floating Action Button**: Easy access to reporting
- **Touch-Friendly**: Large touch targets and gestures
- **Responsive Legends**: Adapts to mobile screen size

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Main header with navigation
│   │   ├── MapComponent.tsx        # Interactive map with traffic layer
│   │   ├── ModalWizard.tsx         # Multi-step reporting wizard
│   │   ├── Feed.tsx                # Real-time report feed
│   │   ├── FAB.tsx                 # Floating action button
│   │   ├── RoutePlanner.tsx        # Route planning dialog
│   │   └── LiveTraffic.tsx         # Live traffic status component
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles and animations
├── public/                         # Static assets
├── tailwind.config.js              # Tailwind configuration
├── package.json                    # Dependencies and scripts
└── .env                           # Environment variables
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features

### **Real-Time Traffic Integration**
- Live Google Maps traffic data
- Color-coded road conditions
- Automatic updates
- Bengaluru-specific optimization

### **Smart Route Planning**
- Google Places autocomplete
- Real-time directions
- Traffic-aware routing
- Dynamic route visualization

### **Enhanced Reporting System**
- Multi-step wizard interface
- Mandatory photo upload
- Location autocomplete
- Real-time feed updates

### **Professional Visualization**
- Color-coded markers by type
- Dynamic legends per view
- Interactive map controls
- Smooth animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Pulse AI hackathon project.

## 🆘 Support

- **WhatsApp Support**: Click the green WhatsApp button for direct support
- **Documentation**: Check this README for detailed usage instructions
- **Issues**: Report bugs or feature requests through the repository

---

**CityPulse** - Making Bengaluru's traffic smarter, one report at a time! 🚦🗺️✨
