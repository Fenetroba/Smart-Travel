import { useState } from 'react'
import Modal from '../shared/Modal'
import ValidationError from '../shared/ValidationError'
import { totalDistance } from '../../lib/geoUtils'

export default function RouteForm({ hubs, onSave, onClose }) {
  const [name, setName] = useState('')
  const [hubSequence, setHubSequence] = useState([])
  const [selectedHub, setSelectedHub] = useState(hubs[0]?.id || '')
  const [errors, setErrors] = useState({})

  const addHub = () => {
    if (selectedHub) {
      setHubSequence(prev => [...prev, selectedHub])
    }
  }

  const removeHub = (index) => {
    setHubSequence(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Route name is required'
    if (hubSequence.length < 2) newErrors.sequence = 'At least 2 hubs are required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const distanceKm = totalDistance(hubSequence, hubs)
    onSave({
      id: 'route_' + Date.now(),
      name: name.trim(),
      hubSequence,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
    })
  }

  const getHubName = (id) => hubs.find(h => h.id === id)?.name || id

  return (
    <Modal isOpen title="Add Route" onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Route Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
            placeholder="e.g. Bole–Piassa Line"
          />
          <ValidationError message={errors.name} />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Hub Sequence</label>
          <div className="flex gap-2 mb-2">
            <select
              value={selectedHub}
              onChange={e => setSelectedHub(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
            >
              {hubs.map(hub => (
                <option key={hub.id} value={hub.id} className="bg-gray-800">
                  {hub.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addHub}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
            >
              Add Hub
            </button>
          </div>

          {hubSequence.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {hubSequence.map((hubId, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm text-white"
                >
                  {getHubName(hubId)}
                  <button
                    type="button"
                    onClick={() => removeHub(index)}
                    className="text-white/60 hover:text-white ml-1 leading-none"
                    aria-label={`Remove ${getHubName(hubId)}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <ValidationError message={errors.sequence} />
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
            Save Route
          </button>
        </div>
      </form>
    </Modal>
  )
}
