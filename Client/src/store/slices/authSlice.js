import { createSlice } from '@reduxjs/toolkit'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Helper to get auth from sessionStorage
const getStoredAuth = () => {
  try {
    const raw = sessionStorage.getItem('adminAuth')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const initialState = {
  user: getStoredAuth()?.user || null,
  token: getStoredAuth()?.token || null,
  isAuthenticated: !!getStoredAuth()?.token,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
      // Store in sessionStorage
      sessionStorage.setItem('adminAuth', JSON.stringify({
        token: action.payload.token,
        user: action.payload.user
      }))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      sessionStorage.removeItem('adminAuth')
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions

// Thunk for login
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginStart())
    
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      dispatch(loginFailure(data.message || 'Login failed'))
      return false
    }

    dispatch(loginSuccess({
      token: data.token,
      user: data.user
    }))
    
    return true
  } catch (err) {
    dispatch(loginFailure('Could not reach the server'))
    return false
  }
}

// Thunk for logout
export const logoutUser = () => async (dispatch) => {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
  } catch (err) {
    console.error('Logout error:', err)
  }
  
  dispatch(logout())
}

export default authSlice.reducer