/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TomTom-inspired color palette
        background: '#FFFFFF',
        'background-secondary': '#F8FAFC',
        'background-tertiary': '#F1F5F9',
        'background-card': '#FFFFFF',
        'background-overlay': 'rgba(0, 0, 0, 0.5)',
        
        // Primary colors - TomTom red
        primary: '#E53E3E',
        'primary-hover': '#C53030',
        'primary-light': '#FC8181',
        'primary-dark': '#9B2C2C',
        'primary-50': '#FED7D7',
        'primary-100': '#FEB2B2',
        
        // Secondary colors - Traffic colors
        secondary: '#38A169',
        'secondary-hover': '#2F855A',
        'secondary-light': '#68D391',
        'secondary-dark': '#276749',
        
        // Accent colors - Blue
        accent: '#3182CE',
        'accent-hover': '#2C5AA0',
        'accent-light': '#63B3ED',
        'accent-dark': '#2A4365',
        
        // Text colors
        text: '#1A202C',
        'text-secondary': '#4A5568',
        'text-muted': '#718096',
        'text-light': '#FFFFFF',
        'text-inverse': '#2D3748',
        
        // Border colors
        border: '#E2E8F0',
        'border-hover': '#CBD5E0',
        'border-light': '#F7FAFC',
        'border-dark': '#A0AEC0',
        
        // Status colors - Traffic light system
        success: '#38A169',
        warning: '#D69E2E',
        error: '#E53E3E',
        info: '#3182CE',
        
        // Traffic colors
        'traffic-green': '#38A169',
        'traffic-yellow': '#D69E2E',
        'traffic-orange': '#DD6B20',
        'traffic-red': '#E53E3E',
        
        // Neutral colors
        neutral: '#4A5568',
        'neutral-light': '#F7FAFC',
        'neutral-dark': '#2D3748',
        
        // Header and navigation
        header: '#FFFFFF',
        'header-text': '#1A202C',
        'nav-hover': '#F7FAFC',
        
        // Feed and cards
        feed: '#F7FAFC',
        'feed-card': '#FFFFFF',
        'card-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-shadow-hover': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'card-shadow-large': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'large': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'elevated': '0 20px 25px rgba(0, 0, 0, 0.1)',
        'floating': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} 