import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Reads the stored auth token from sessionStorage.
 * Returns null if missing or expired (basic check).
 */
function getStoredAuth() {
  try {
    const raw = sessionStorage.getItem('adminAuth')
    if (!raw) return null
    return JSON.parse(raw) // { token, user: { id, name, email, role } }
  } catch {
    return null
  }
}

export default function AdminLayout() {
  const [auth, setAuth] = useState(() => getStoredAuth())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogin = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      const authData = { token: data.token, user: data.user }
      sessionStorage.setItem('adminAuth', JSON.stringify(authData))
      setAuth(authData)
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [email, password])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('adminAuth')
    setAuth(null)
    setEmail('')
    setPassword('')
  }, [])

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-4xl">🗺️</span>
            <h1 className="text-white text-2xl font-semibold mt-2">Admin Login</h1>
            <p className="text-white/40 text-sm mt-1">Smart Travel Addis Ababa</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Authenticated layout ────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#0F172A] text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={auth.user.role} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F172A]">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>

          <span className="font-semibold hidden lg:block">Smart Travel AA — Admin</span>

          {/* User info + logout */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{auth.user.name}</p>
              <p className="text-xs text-white/40 capitalize">{auth.user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ auth }} />
        </main>
      </div>
    </div>
  )
}
