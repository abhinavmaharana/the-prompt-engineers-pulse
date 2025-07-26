import { motion } from 'framer-motion'
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Report } from '../App'

interface FeedProps {
  reports: Report[]
  onFocusReport: (id: string) => void
}

const Feed = ({ reports, onFocusReport }: FeedProps) => {
  return (
    <aside className="w-full md:w-[400px] bg-white border-l border-border h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black mb-2">Traffic Reports</h2>
          <p className="text-sm text-black">Real-time civic issue reports from Bengaluru</p>
        </div>

        {/* Traffic Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-light rounded-lg p-4 mb-6 border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-black">Current Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-traffic-green rounded-full"></div>
              <span className="text-xs text-black">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-500">{reports.length}</div>
              <div className="text-xs text-black">Active Issues</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-500">3</div>
              <div className="text-xs text-black">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-500">12</div>
              <div className="text-xs text-black">Resolved</div>
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-3">
          {reports.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-neutral-light rounded-lg p-8 text-center border border-border"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-base font-medium text-black mb-2">No Traffic Issues</h3>
              <p className="text-sm text-black">All roads are clear in Bengaluru</p>
            </motion.div>
          )}
          
          {reports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4, type: 'spring' }}
              className="bg-neutral-light rounded-lg p-4 hover:bg-white transition-all duration-200 cursor-pointer group border border-border hover:border-primary/30"
              onClick={() => onFocusReport(report.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-traffic-red/10 flex items-center justify-center">
                  <span className="text-traffic-red font-semibold text-xs">
                    {report.description.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-text text-sm truncate">{report.description}</h4>
                    <div className="w-1.5 h-1.5 bg-traffic-red rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>📍 Bengaluru</span>
                    <span>🕒 {report.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-white hover:bg-primary/10 transition-colors group-hover:bg-primary/10"
                  aria-label="Focus map on report"
                >
                  <ArrowRightIcon className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Feed
