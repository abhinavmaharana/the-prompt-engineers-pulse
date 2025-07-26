import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/solid'

interface FABProps {
  onClick: () => void
  show?: boolean
}

const FAB = ({ onClick, show = true }: FABProps) => (
  <AnimatePresence>
    {show && (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onClick}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-2xl shadow-elevated w-16 h-16 flex items-center justify-center hover:bg-primary-hover hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30 md:hidden transition-all duration-200"
        aria-label="Report an Issue"
      >
        <PlusIcon className="w-8 h-8" />
      </motion.button>
    )}
  </AnimatePresence>
)

export default FAB 