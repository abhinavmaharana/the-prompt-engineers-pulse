import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  CloudIcon, 
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { ServiceWrapper } from '../services/serviceWrapper'

const ServiceStatus: React.FC = () => {
  const [status, setStatus] = React.useState(ServiceWrapper.getServiceStatus())

  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(ServiceWrapper.getServiceStatus())
    }

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (status.usingFirebase) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CloudIcon className="w-3 h-3" />
          Firebase Connected
        </Badge>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
        <ComputerDesktopIcon className="w-3 h-3" />
        Local Mode
      </Badge>
    </div>
  )
}

export default ServiceStatus 