
import { motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
// import { useState, useEffect } from 'react'

interface HeaderProps {
  onReportClick: () => void
}

const Header = ({ onReportClick }: HeaderProps) => {
  // const [isDark, setIsDark] = useState(false)

  // // Initialize theme from localStorage or system preference
  // useEffect(() => {
  //   const savedTheme = localStorage.getItem('theme')
  //   const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
  //   if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  //     setIsDark(true)
  //     document.documentElement.classList.add('dark')
  //   } else {
  //     setIsDark(false)
  //     document.documentElement.classList.remove('dark')
  //   }
  // }, [])

  // const toggleTheme = () => {
  //   const newTheme = !isDark
  //   setIsDark(newTheme)
    
  //   if (newTheme) {
  //     document.documentElement.classList.add('dark')
  //     localStorage.setItem('theme', 'dark')
  //   } else {
  //     document.documentElement.classList.remove('dark')
  //     localStorage.setItem('theme', 'light')
  //   }
  // }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-white/20 shadow-mirror"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-glass border border-white/20 backdrop-blur-sm">
              <span className="text-white font-bold text-xl">CP</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent drop-shadow-lg">
                CityPulse
              </h1>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {/* <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hidden md:flex bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-300 shadow-glass"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button> */}

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                onClick={onReportClick}
                size="icon"
                className="md:hidden bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-300 shadow-glass"
                aria-label="Report Issue"
              >
                <PlusIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
