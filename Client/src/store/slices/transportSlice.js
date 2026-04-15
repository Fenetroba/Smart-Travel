import { createSlice } from '@reduxjs/toolkit'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Helper to get auth token
const getAuthToken = () => {
  try {
    const raw = sessionStorage.getItem('adminAuth')
    if (!raw) return null
    const auth = JSON.parse(raw)
    return auth.token
  } catch {
    return null
  }
}

const initialState = {
  modes: [],  // Start empty, fetch from API
  loading: false,
  error: null,
}

const transportSlice = createSlice({
  name: 'transport',
  initialState,
  reducers: {
    setTransportModes: (state, action) => {
      state.modes = action.payload
      state.loading = false
    },
    updateTransportMode: (state, action) => {
      const index = state.modes.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.modes[index] = { ...state.modes[index], ...action.payload }
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setTransportModes, updateTransportMode, setLoading, setError } = transportSlice.actions

// =======================
// THUNKS
// =======================

/**
 * Fetch transports from API on mount
 * Maps server field speedKmPerHour to client field speedKmh
 */
export const fetchTransports = () => async (dispatch) => {
  const token = getAuthToken()
  if (!token) return

  try {
    dispatch(setLoading(true))

    const res = await fetch(`${API_BASE}/api/transports`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include'
    })

    const data = await res.json()

    if (data.success && data.data) {
      // Map server fields to client fields
      const modes = data.data.map(t => ({
        id: t.type,
        label: t.label,
        pricePerKm: t.pricePerKm,
        speedKmh: t.speedKmPerHour,  // Server uses speedKmPerHour, client uses speedKmh
        description: t.description,
        icon: t.type === 'taxi' ? '🚖' : t.type === 'bus' ? '🚌' : '🚶'
      }))
      dispatch(setTransportModes(modes))
    }
  } catch (err) {
    dispatch(setError('Failed to fetch transports'))
  }
}

/**
 * Update transport config via PUT /api/transports/:id
 * Persists updates to database and updates Redux state
 */
export const updateTransportConfig = (id, config) => async (dispatch) => {
  const token = getAuthToken()

  if (!token) {
    dispatch(setError('Authentication required'))
    return
  }

  try {
    // First, fetch all transports to find the database ID for this transport type
    const listRes = await fetch(`${API_BASE}/api/transports`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include'
    })

    const listData = await listRes.json()

    if (!listData.success || !listData.data) {
      dispatch(setError('Failed to fetch transport list'))
      return
    }

    // Find the transport by type (client id = server type)
    const dbTransport = listData.data.find(t => t.type === id)

    if (!dbTransport) {
      dispatch(setError(`Transport type '${id}' not found`))
      return
    }

    // Update the transport via API
    const updateRes = await fetch(`${API_BASE}/api/transports/${dbTransport._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify({
        pricePerKm: config.pricePerKm,
        speedKmPerHour: config.speedKmh  // Client uses speedKmh, server expects speedKmPerHour
      })
    })

    const updateData = await updateRes.json()

    if (updateData.success) {
      // Update Redux state with the new values
      dispatch(updateTransportMode({
        id,
        pricePerKm: config.pricePerKm,
        speedKmh: config.speedKmh
      }))
    } else {
      dispatch(setError(updateData.message || 'Failed to update transport'))
    }
  } catch (err) {
    console.error('Failed to update transport:', err)
    dispatch(setError('Failed to update transport'))
  }
}

export default transportSlice.reducer
