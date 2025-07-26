import { motion } from 'framer-motion'
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Report } from '../App'

interface FeedProps {
  reports: Report[]
  onFocusReport: (id: string) => void
}

const Feed = ({ reports, onFocusReport }: FeedProps) => {
  return (
    <div className="w-full bg-transparent">
      <div className="p-4 space-y-4">
        {/* Header */}
                  <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-3">Traffic Reports</h2>
            <p className="text-base text-muted-foreground font-medium">Real-time civic issue reports from Bengaluru</p>
          </div>

        {/* Traffic Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-800">Current Status</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm font-medium text-gray-600">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500 mb-1">{reports.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Active Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500 mb-1">3</div>
                  <div className="text-sm text-gray-600 font-medium">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500 mb-1">12</div>
                  <div className="text-sm text-gray-600 font-medium">Resolved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PlusIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">No Traffic Issues</h3>
                  <p className="text-base text-gray-600 font-medium">All roads are clear in Bengaluru</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {reports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4, type: 'spring' }}
            >
              <Card 
                className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-white/80 backdrop-blur-sm border-0 shadow-md"
                onClick={() => onFocusReport(report.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                      <span className="text-red-600 font-bold text-lg">
                        {report.description.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-800 text-base truncate">{report.description}</h4>
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                        <span className="flex items-center gap-1">📍 Bengaluru</span>
                        <span className="flex items-center gap-1">🕒 {report.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-10 w-10 rounded-xl hover:bg-red-50 group-hover:bg-red-50"
                      aria-label="Focus map on report"
                    >
                      <ArrowRightIcon className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Feed
