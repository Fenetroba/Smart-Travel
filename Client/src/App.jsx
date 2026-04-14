import { Routes, Route, Navigate } from 'react-router-dom'
import TravelerPage from './pages/TravelerPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardHome from './pages/admin/DashboardHome'
import Analytics from './pages/admin/Analytics'
import HubManager from './pages/admin/HubManager'
import TransportManager from './pages/admin/TransportManager'
import RouteManager from './pages/admin/RouteManager'
import UserManager from './pages/admin/UserManager'
import Chat from './pages/admin/Chat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TravelerPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="hubs" element={<HubManager />} />
        <Route path="transport" element={<TransportManager />} />
        <Route path="routes" element={<RouteManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<UserManager />} />
        <Route path="chat" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
