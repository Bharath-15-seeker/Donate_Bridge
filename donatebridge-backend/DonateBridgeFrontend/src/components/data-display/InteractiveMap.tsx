import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

// Fix default Leaflet icon paths in Vite/Webpack bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapRecenterProps {
  lat: number
  lng: number
}

function MapRecenter({ lat, lng }: MapRecenterProps) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

interface InteractiveMapProps {
  latitude?: number | null
  longitude?: number | null
  title?: string
  address?: string
  height?: string
  className?: string
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  title = 'Location',
  address,
  height = '240px',
  className = '',
}) => {
  const hasCoords =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude))

  if (!hasCoords) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-2xl bg-[#eaf2ef]/70 border border-[#cfded8] flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white text-[#912f56] flex items-center justify-center mb-2 shadow-sm">
          <MapPin className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-[#23332f]">{title}</p>
        <p className="text-xs text-[#66736f] max-w-xs mt-1">
          {address || 'No geographical coordinates available for this location'}
        </p>
      </div>
    )
  }

  const lat = Number(latitude)
  const lng = Number(longitude)

  return (
    <div
      style={{ height }}
      className={`w-full rounded-2xl overflow-hidden border border-[#cfded8] shadow-sm relative z-0 ${className}`}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>
            <div className="text-xs space-y-1">
              <strong className="block text-[#23332f]">{title}</strong>
              {address && <span className="text-[#66736f]">{address}</span>}
              <span className="block text-slate-400 font-mono text-[10px]">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
        <MapRecenter lat={lat} lng={lng} />
      </MapContainer>
    </div>
  )
}
