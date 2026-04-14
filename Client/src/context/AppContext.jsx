import { createContext, useContext, useState } from 'react'
import seedHubs from '../data/hubs'
import seedRoutes from '../data/routes'
import seedTransportModes from '../data/transportModes'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [hubs, setHubs] = useState(seedHubs)
  const [routes, setRoutes] = useState(seedRoutes)
  const [transportModes, setTransportModes] = useState(seedTransportModes)

  const addHub = (hub) => setHubs(prev => [...prev, hub])
  const updateHub = (id, updated) => setHubs(prev => prev.map(h => h.id === id ? { ...h, ...updated } : h))
  const deleteHub = (id) => setHubs(prev => prev.filter(h => h.id !== id))

  const addRoute = (route) => setRoutes(prev => [...prev, route])
  const updateRoute = (id, updated) => setRoutes(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r))
  const deleteRoute = (id) => setRoutes(prev => prev.filter(r => r.id !== id))

  const updateTransportMode = (id, config) => setTransportModes(prev =>
    prev.map(m => m.id === id ? { ...m, ...config } : m)
  )

  return (
    <AppContext.Provider value={{
      hubs, routes, transportModes,
      addHub, updateHub, deleteHub,
      addRoute, updateRoute, deleteRoute,
      updateTransportMode,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}

export default AppContext
