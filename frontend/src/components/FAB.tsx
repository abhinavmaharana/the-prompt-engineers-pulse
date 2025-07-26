import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface FABProps {
  onClick: () => void
  show?: boolean
}

const FAB = ({ onClick, show = true }: FABProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 md:hidden"
      >
        <Button
          onClick={onClick}
          size="icon"
          className="w-16 h-16 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 bg-gradient-to-br from-primary to-primary-hover border-0"
          aria-label="Report an Issue"
        >
          <PlusIcon className="w-8 h-8" />
        </Button>
      </motion.div>
    )}
  </AnimatePresence>
)

export default FAB 