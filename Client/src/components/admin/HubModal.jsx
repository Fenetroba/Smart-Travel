import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import Modal from '../shared/Modal'
import ValidationError from '../shared/ValidationError'
import '../../lib/leafletIconFix'

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat.toFixed(4), e.latlng.lng.toFixed(4))
    },
  })
  return null
}

export default function HubModal({ hub, onSave, onClose }) {
  const isEdit = hub !== null && hub !== undefined
  const [name, setName] = useState(hub?.name ?? '')
  const [lat, setLat] = useState(hub?.lat !== undefined ? String(hub.lat) : '')
  const [lng, setLng] = useState(hub?.lng !== undefined ? String(hub.lng) : '')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    const latNum = parseFloat(lat)
    if (lat === '' || isNaN(latNum) || latNum < -90 || latNum > 90)
      e.lat = 'Latitude must be a number between -90 and 90'
    const lngNum = parseFloat(lng)
    if (lng === '' || isNaN(lngNum) || lngNum < -180 || lngNum > 180)
      e.lng = 'Longitude must be a number between -180 and 180'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSave({
      id: hub?.id || name.toLowerCase().replace(/\s+/g, '_'),
      name: name.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    })
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  const markerPos =
    !isNaN(latNum) && !isNaN(lngNum) ? [latNum, lngNum] : null

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Hub' : 'Add Hub'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
            placeholder="Hub name"
          />
          <ValidationError message={errors.name} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              min={-90}
              max={90}
              step="any"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
              placeholder="-90 to 90"
            />
            <ValidationError message={errors.lat} />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              min={-180}
              max={180}
              step="any"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
              placeholder="-180 to 180"
            />
            <ValidationError message={errors.lng} />
          </div>
        </div>

        <div>
          <p className="text-sm text-white/70 mb-1">Click map to set coordinates</p>
          <div style={{ height: 200 }} className="rounded-lg overflow-hidden">
            <MapContainer
              key={`hub-modal-map-${hub?.id ?? 'new'}`}
              center={markerPos ?? [9.0054, 38.7636]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <MapClickHandler onMapClick={(la, ln) => { setLat(la); setLng(ln) }} />
              {markerPos && <Marker position={markerPos} />}
            </MapContainer>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isEdit ? 'Save Changes' : 'Add Hub'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
