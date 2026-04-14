import { useState } from 'react'
import ValidationError from '../shared/ValidationError'

export default function TransportConfigCard({ mode, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(String(mode.pricePerKm))
  const [speed, setSpeed] = useState(String(mode.speedKmh))
  const [errors, setErrors] = useState({})

  const handleSave = () => {
    const newErrors = {}
    const parsedPrice = parseFloat(price)
    const parsedSpeed = parseFloat(speed)

    if (isNaN(parsedPrice) || (mode.id !== 'walk' && parsedPrice <= 0) || (mode.id === 'walk' && parsedPrice < 0)) {
      newErrors.price = mode.id === 'walk' ? 'Price must be 0 or more' : 'Price must be greater than 0'
    }
    if (isNaN(parsedSpeed) || parsedSpeed <= 0) {
      newErrors.speed = 'Speed must be greater than 0'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onUpdate(mode.id, { pricePerKm: parsedPrice, speedKmh: parsedSpeed })
    setErrors({})
    setEditing(false)
  }

  const handleCancel = () => {
    setPrice(String(mode.pricePerKm))
    setSpeed(String(mode.speedKmh))
    setErrors({})
    setEditing(false)
  }

  const priceDisplay = mode.pricePerKm === 0 ? 'Free' : `${mode.pricePerKm} ETB/km`

  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-4xl">{mode.icon}</span>
        <div>
          <h3 className="text-white font-semibold text-lg">{mode.label}</h3>
          <p className="text-white/50 text-sm">{mode.description}</p>
        </div>
      </div>

      {!editing ? (
        <div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Price</span>
              <span className="text-white">{priceDisplay}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Speed</span>
              <span className="text-white">{mode.speedKmh} km/h</span>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Edit
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-white/60 text-sm block mb-1">Price (ETB/km)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
              <ValidationError message={errors.price} />
            </div>
            <div>
              <label className="text-white/60 text-sm block mb-1">Speed (km/h)</label>
              <input
                type="number"
                value={speed}
                onChange={e => setSpeed(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
              <ValidationError message={errors.speed} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
