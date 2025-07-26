
import { motion } from 'framer-motion'
import { PlusIcon, Bars3Icon, MagnifyingGlassIcon, Cog6ToothIcon, ShareIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onReportClick: () => void
  onToggleFeed?: () => void
  showFeed?: boolean
}

const Header = ({ onReportClick, onToggleFeed, showFeed = true }: HeaderProps) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-black">
                Pulse
              </h1>
              {/* <span className="text-sm text-black">Traffic Index</span> */}
            </div>
          </motion.div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-neutral-light rounded-lg px-3 py-2">
              {/* <input
                type="text"
                placeholder="Find your city or country"
                className="bg-transparent text-sm text-text placeholder-text-black outline-none w-48"
              /> */}
              <MagnifyingGlassIcon className="w-4 h-4 text-black" />
            </div>

            {/* Settings and Share Icons */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:flex p-2 rounded-lg hover:bg-neutral-light transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4 text-black" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:flex p-2 rounded-lg hover:bg-neutral-light transition-colors"
            >
              <ShareIcon className="w-4 h-4 text-black" />
            </motion.button>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              {onToggleFeed && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleFeed}
                  className="p-2 rounded-lg bg-neutral-light hover:bg-border transition-colors"
                  aria-label={showFeed ? "Hide feed" : "Show feed"}
                >
                  <Bars3Icon className="w-5 h-5 text-black" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReportClick}
                className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all duration-200"
                aria-label="Report Issue"
              >
                <PlusIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
