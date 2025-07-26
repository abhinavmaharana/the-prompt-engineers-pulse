/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			'background-secondary': '#F8FAFC',
  			'background-tertiary': '#F1F5F9',
  			'background-card': '#FFFFFF',
  			'background-overlay': 'rgba(0, 0, 0, 0.5)',
  			'glass': 'rgba(255, 255, 255, 0.1)',
  			'glass-dark': 'rgba(0, 0, 0, 0.1)',
  			'mirror': 'rgba(255, 255, 255, 0.25)',
  			'mirror-dark': 'rgba(0, 0, 0, 0.25)',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-hover': '#C53030',
  			'primary-light': '#FC8181',
  			'primary-dark': '#9B2C2C',
  			'primary-50': '#FED7D7',
  			'primary-100': '#FEB2B2',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			'secondary-hover': '#2F855A',
  			'secondary-light': '#68D391',
  			'secondary-dark': '#276749',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'accent-hover': '#2C5AA0',
  			'accent-light': '#63B3ED',
  			'accent-dark': '#2A4365',
  			text: '#1A202C',
  			'text-secondary': '#4A5568',
  			'text-muted': '#718096',
  			'text-light': '#FFFFFF',
  			'text-inverse': '#2D3748',
  			border: 'hsl(var(--border))',
  			'border-hover': '#CBD5E0',
  			'border-light': '#F7FAFC',
  			'border-dark': '#A0AEC0',
  			success: '#38A169',
  			warning: '#D69E2E',
  			error: '#E53E3E',
  			info: '#3182CE',
  			'traffic-green': '#38A169',
  			'traffic-yellow': '#D69E2E',
  			'traffic-orange': '#DD6B20',
  			'traffic-red': '#E53E3E',
  			neutral: '#4A5568',
  			'neutral-light': '#F7FAFC',
  			'neutral-dark': '#2D3748',
  			header: '#FFFFFF',
  			'header-text': '#1A202C',
  			'nav-hover': '#F7FAFC',
  			feed: '#F7FAFC',
  			'feed-card': '#FFFFFF',
  			'card-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
  			'card-shadow-hover': '0 4px 6px rgba(0, 0, 0, 0.07)',
  			'card-shadow-large': '0 10px 15px rgba(0, 0, 0, 0.1)',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			soft: '0 1px 2px rgba(0, 0, 0, 0.05)',
  			medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
  			large: '0 10px 15px rgba(0, 0, 0, 0.1)',
  			card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  			'card-hover': '0 4px 6px rgba(0, 0, 0, 0.07)',
  			elevated: '0 20px 25px rgba(0, 0, 0, 0.1)',
  			floating: '0 25px 50px rgba(0, 0, 0, 0.15)',
  			inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  			'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
  			'mirror': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  			'glass-light': '0 8px 32px rgba(255, 255, 255, 0.3)',
  			'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.6s ease-out',
  			'slide-up': 'slideUp 0.6s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'pulse-slow': 'pulse 1.5s ease-in-out infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 