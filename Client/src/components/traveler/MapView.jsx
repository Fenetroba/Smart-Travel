import '../../lib/leafletIconFix'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import LoadingOverlay from '../shared/LoadingOverlay'

export default function MapView({ hubs, analysisResult, isAnalyzing }) {
  const hubSequence = analysisResult?.route?.hubSequence ?? []

  const sequenceHubs = hubSequence
    .map((id) => hubs.find((h) => h.id === id))
    .filter(Boolean)

  const waypoints = sequenceHubs.map((h) => [h.lat, h.lng])

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      <LoadingOverlay isVisible={isAnalyzing} />
      <MapContainer
        key="main-map"
        center={[9.0054, 38.7636]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {analysisResult && sequenceHubs.map((hub) => (
          <Marker key={hub.id} position={[hub.lat, hub.lng]}>
            <Popup>{hub.name}</Popup>
          </Marker>
        ))}
        {analysisResult && waypoints.length > 1 && (
          <Polyline
            positions={waypoints}
            pathOptions={{ color: '#2563EB', weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  )
}
