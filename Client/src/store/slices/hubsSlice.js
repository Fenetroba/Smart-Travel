import { createSlice } from '@reduxjs/toolkit'
import seedHubs from '../../data/hubs'

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
  items: seedHubs,
  loading: false,
  error: null,
}

const hubsSlice = createSlice({
  name: 'hubs',
  initialState,
  reducers: {
    setHubs: (state, action) => {
      state.items = action.payload
      state.loading = false
    },
    addHub: (state, action) => {
      state.items.push(action.payload)
    },
    updateHub: (state, action) => {
      const index = state.items.findIndex(h => h.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteHub: (state, action) => {
      state.items = state.items.filter(h => h.id !== action.payload)
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

export const { setHubs, addHub, updateHub, deleteHub, setLoading, setError } = hubsSlice.actions

// Thunk to fetch hubs
export const fetchHubs = () => async (dispatch) => {
  const token = getAuthToken()
  if (!token) return

  try {
    dispatch(setLoading(true))
    
    const res = await fetch(`${API_BASE}/api/hubs`, {
      credentials: 'include'
    })
    
    const data = await res.json()
    
    if (data.success && data.data) {
      const hubs = data.data.map(h => ({
        id: h._id,
        name: h.name,
        lat: h.latitude,
        lng: h.longitude,
        importanceScore: h.importanceScore
      }))
      dispatch(setHubs(hubs))
    }
  } catch (err) {
    dispatch(setError('Failed to fetch hubs'))
  }
}

// Thunk to create hub
export const createHub = (hub) => async (dispatch) => {
  const token = getAuthToken()
  
  try {
    const res = await fetch(`${API_BASE}/api/hubs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify({
        name: hub.name,
        latitude: hub.lat,
        longitude: hub.lng,
        importanceScore: hub.importanceScore || 3
      })
    })
    
    const data = await res.json()
    
    if (data.success) {
      dispatch(addHub({
        id: data.data._id,
        name: data.data.name,
        lat: data.data.latitude,
        lng: data.data.longitude,
        importanceScore: data.data.importanceScore
      }))
    }
  } catch (err) {
    console.error('Failed to create hub:', err)
  }
}

// Thunk to update hub
export const updateHubData = (id, updated) => async (dispatch) => {
  const token = getAuthToken()
  
  try {
    const res = await fetch(`${API_BASE}/api/hubs/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify({
        name: updated.name,
        latitude: updated.lat,
        longitude: updated.lng,
        importanceScore: updated.importanceScore
      })
    })
    
    const data = await res.json()
    
    if (data.success) {
      dispatch(updateHub({
        id: data.data._id,
        name: data.data.name,
        lat: data.data.latitude,
        lng: data.data.longitude,
        importanceScore: data.data.importanceScore
      }))
    }
  } catch (err) {
    console.error('Failed to update hub:', err)
  }
}

// Thunk to delete hub
export const deleteHubData = (id) => async (dispatch) => {
  const token = getAuthToken()
  
  try {
    const res = await fetch(`${API_BASE}/api/hubs/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include'
    })
    
    const data = await res.json()
    
    if (data.success) {
      dispatch(deleteHub(id))
    }
  } catch (err) {
    console.error('Failed to delete hub:', err)
  }
}

export default hubsSlice.reducer