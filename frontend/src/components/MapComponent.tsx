import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { Report } from '../App'

interface MapComponentProps {
  reports: Report[]
  onMapClick: (lat: number, lng: number) => void
  focusedReportId?: string
}

const MapComponent = ({ reports, onMapClick, focusedReportId }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
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

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 12.9716, lng: 77.5946 },
            zoom: 13,
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
    if (!mapInstanceRef.current) return

    markersRef.current.forEach(marker => marker.setMap(null))
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close())
    markersRef.current = []
    infoWindowsRef.current = []

    reports.forEach((report) => {
      const markerIcon = {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNFRjQ0NDQiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMjEuNTIgMjYgMjYgMjEuNTIgMjYgMTZDMjYgMTAuNDggMjEuNTIgNiAxMiA2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K',
        scaledSize: new google.maps.Size(30, 50),
        anchor: new google.maps.Point(15, 50)
      }

      const marker = new google.maps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        map: mapInstanceRef.current,
        icon: markerIcon,
        title: report.description,
        animation: google.maps.Animation.DROP
      })

      marker.addListener('mouseover', () => marker.setAnimation(google.maps.Animation.BOUNCE))
      marker.addListener('mouseout', () => marker.setAnimation(null))

              const infoWindow = new google.maps.InfoWindow({
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
          pixelOffset: new google.maps.Size(0, -30)
        })

      marker.addListener('click', () => {
        infoWindowsRef.current.forEach(iw => iw.close())
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
      infoWindowsRef.current.push(infoWindow)
    })
  }, [reports])

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
    <div className="h-[calc(100vh-80px)] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background-secondary flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-text-secondary font-medium">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}

export default MapComponent
