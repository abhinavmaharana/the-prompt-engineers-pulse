import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { Report } from '../App'

interface MapComponentProps {
  reports: Report[]
  onMapClick: (lat: number, lng: number) => void
  focusedReportId?: string
  trafficView: 'all' | 'flow' | 'incidents'
}

const MapComponent = ({ reports, onMapClick, focusedReportId, trafficView }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const googleRef = useRef<typeof google | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
        version: 'weekly',
        libraries: ['places']
      })

      try {
        const google = await loader.load()
        googleRef.current = google

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 12.9716, lng: 77.5946 },
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { featureType: 'all', elementType: 'geometry.fill', stylers: [{ color: '#f5f5f5' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e3f2fd' }] },
              { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1976d2' }] },
              { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8f5e8' }] },
              { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#2e7d32' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
              { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fafafa' }] },
              { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#d0d0d0' }] },
              { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
              { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9c9c9' }] }
            ]
          })

          mapInstanceRef.current = map

          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              onMapClick(event.latLng.lat(), event.latLng.lng())
            }
          })

          map.addListener('tilesloaded', () => setIsLoading(false))
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        setIsLoading(false)
      }
    }

    initMap()
  }, [onMapClick])

  useEffect(() => {
    if (!mapInstanceRef.current || !googleRef.current) return

    console.log('Creating markers...')
    console.log('Google Maps available:', !!googleRef.current)
    console.log('Map instance available:', !!mapInstanceRef.current)

    markersRef.current.forEach(marker => marker.setMap(null))
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close())
    markersRef.current = []
    infoWindowsRef.current = []

    // Filter reports based on traffic view
    let filteredReports = reports
    if (trafficView === 'incidents') {
      // Show only incident reports
      filteredReports = reports.filter(report => 
        report.description.toLowerCase().includes('incident') || 
        report.description.toLowerCase().includes('accident') ||
        report.description.toLowerCase().includes('blocking')
      )
    } else if (trafficView === 'flow') {
      // Show only flow-related reports (congestion, slow traffic, etc.)
      filteredReports = reports.filter(report => 
        report.description.toLowerCase().includes('congestion') || 
        report.description.toLowerCase().includes('slow') || 
        report.description.toLowerCase().includes('jam') ||
        report.description.toLowerCase().includes('construction')
      )
    }
    // 'all' shows all reports

    console.log('Traffic View:', trafficView)
    console.log('Total Reports:', reports.length)
    console.log('Filtered Reports:', filteredReports.length)
    console.log('Filtered Reports:', filteredReports)

    // Test with a simple default marker first
    if (filteredReports.length > 0) {
      const testMarker = new googleRef.current!.maps.Marker({
        position: { lat: 12.9716, lng: 77.5946 },
        map: mapInstanceRef.current,
        title: 'Test Marker'
      })
      console.log('Test marker created:', testMarker)
    }

    filteredReports.forEach((report) => {
      // Different marker colors based on traffic view
      let markerColor = '#EF4444' // Default red
      if (trafficView === 'flow') {
        markerColor = '#F59E0B' // Yellow for flow
      } else if (trafficView === 'incidents') {
        markerColor = '#DC2626' // Dark red for incidents
      }

      // Create a simple colored circle marker
      const markerIcon = {
        path: googleRef.current!.maps.SymbolPath.CIRCLE,
        fillColor: markerColor,
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 8
      }

      console.log('Creating marker for:', report.description, 'at:', report.latitude, report.longitude)

      const marker = new googleRef.current!.maps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        map: mapInstanceRef.current,
        icon: markerIcon,
        title: report.description,
        animation: googleRef.current!.maps.Animation.DROP
      })

      console.log('Marker created successfully:', marker)

      marker.addListener('mouseover', () => marker.setAnimation(googleRef.current!.maps.Animation.BOUNCE))
      marker.addListener('mouseout', () => marker.setAnimation(null))

      const infoWindow = new googleRef.current!.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; background: #fff; border-radius: 8px; max-width: 260px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <div style="width: 24px; height: 24px; background: #E53E3E; color: white; font-weight: 600; font-size: 12px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                ${report.description.charAt(0).toUpperCase()}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px; color: #1A202C;">
                  ${report.description}
                </div>
                <div style="font-size: 10px; color: #4A5568;">
                  📍 Bengaluru • 🕒 ${report.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div style="background: #F7FAFC; border: 1px solid #E2E8F0; padding: 6px; border-radius: 6px; font-size: 10px; font-family: monospace; color: #4A5568;">
              ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}
            </div>
          </div>
        `,
        maxWidth: 280,
        pixelOffset: new googleRef.current!.maps.Size(0, -30)
      })

      marker.addListener('click', () => {
        infoWindowsRef.current.forEach(iw => iw.close())
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
      infoWindowsRef.current.push(infoWindow)
    })
  }, [reports, trafficView])

  useEffect(() => {
    if (focusedReportId && mapInstanceRef.current) {
      const report = reports.find(r => r.id === focusedReportId)
      if (report) {
        mapInstanceRef.current.panTo({ lat: report.latitude, lng: report.longitude })
        mapInstanceRef.current.setZoom(16)

        const markerIndex = reports.findIndex(r => r.id === focusedReportId)
        if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
          infoWindowsRef.current[markerIndex].open(mapInstanceRef.current, markersRef.current[markerIndex])
        }
      }
    }
  }, [focusedReportId, reports])

  return (
    <div className="h-screen relative w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 mb-2">Loading Map</p>
              <p className="text-sm text-gray-600">Preparing Bengaluru traffic view...</p>
            </div>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`w-full h-full transition-all duration-700 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      />
    </div>
  )
}

export default MapComponent
