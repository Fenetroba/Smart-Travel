import { createSlice } from '@reduxjs/toolkit'
import seedRoutes from '../../data/routes'

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
  items: [],  // Start empty, fetch from API
  loading: false,
  error: null,
}

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setRoutes: (state, action) => {
      state.items = action.payload
      state.loading = false
    },
    addRoute: (state, action) => {
      state.items.push(action.payload)
    },
    updateRoute: (state, action) => {
      const index = state.items.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteRoute: (state, action) => {
      state.items = state.items.filter(r => r.id !== action.payload)
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

export const { setRoutes, addRoute, updateRoute, deleteRoute, setLoading, setError } = routesSlice.actions

// Thunk to fetch routes
export const fetchRoutes = () => async (dispatch) => {
  const token = getAuthToken()
  if (!token) return

  try {
    dispatch(setLoading(true))
    
    const res = await fetch(`${API_BASE}/api/routes`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include'
    })
    
    const data = await res.json()
    
    if (data.success && data.data) {
      const routes = data.data.map(r => ({
        id: r._id,
        name: r.name,
        hubSequence: r.hubSequence,
        distanceKm: r.distanceKm,
        estimatedTime: r.estimatedTime
      }))
      dispatch(setRoutes(routes))
    }
  } catch (err) {
    dispatch(setError('Failed to fetch routes'))
  }
}

// Thunk to create route
export const createRoute = (route) => async (dispatch) => {
  const token = getAuthToken()
  
  try {
    const res = await fetch(`${API_BASE}/api/routes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      body: JSON.stringify({
        name: route.name,
        hubSequence: route.hubSequence,
        distanceKm: route.distanceKm,
        estimatedTime: route.estimatedTime
      })
    })
    
    const data = await res.json()
    
    if (data.success) {
      dispatch(addRoute({
        id: data.data._id,
        name: data.data.name,
        hubSequence: data.data.hubSequence,
        distanceKm: data.data.distanceKm,
        estimatedTime: data.data.estimatedTime
      }))
    }
  } catch (err) {
    console.error('Failed to create route:', err)
  }
}

// Thunk to delete route
export const deleteRouteData = (id) => async (dispatch) => {
  const token = getAuthToken()
  
  try {
    const res = await fetch(`${API_BASE}/api/routes/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include'
    })
    
    const data = await res.json()
    
    if (data.success) {
      dispatch(deleteRoute(id))
    }
  } catch (err) {
    console.error('Failed to delete route:', err)
  }
}

export default routesSlice.reducer
