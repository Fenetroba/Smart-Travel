import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import { useAuth } from '../../store/hooks/useAuth'
import { useHubs } from '../../store/hooks/useHubs'

export default function AdminLayout() {
  const { user, isAuthenticated, loading: authLoading, error: authError, login, logout, clearError } = useAuth()
  const { fetchHubs } = useHubs()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch hubs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHubs()
    }
  }, [isAuthenticated, fetchHubs])

  const handleLogin = useCallback(async (e) => {
    e.preventDefault()
    clearError()
    const success = await login(email, password)
    if (success) {
      setEmail('')
      setPassword('')
    }
  }, [email, password, login, clearError])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
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

            {authError && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                ⚠ {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {authLoading ? (
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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={user?.role} />

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
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-white/40 capitalize">{user?.role}</p>
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
          <Outlet context={{ auth: { user, token: sessionStorage.getItem('adminAuth') ? JSON.parse(sessionStorage.getItem('adminAuth')).token : null } }} />
        </main>
      </div>
    </div>
  )
}
