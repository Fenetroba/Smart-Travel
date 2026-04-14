import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import RouteForm from '../../components/admin/RouteForm'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

export default function RouteManager() {
  const { hubs, routes, addRoute, deleteRoute } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const getHubName = (id) => hubs.find(h => h.id === id)?.name || id

  const handleSave = (route) => {
    addRoute(route)
    setShowForm(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Manage Routes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
        >
          Add Route
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-4 py-3 font-medium text-white/70">Route Name</th>
              <th className="text-left px-4 py-3 font-medium text-white/70">Hub Sequence</th>
              <th className="text-left px-4 py-3 font-medium text-white/70">Distance (km)</th>
              <th className="text-left px-4 py-3 font-medium text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">{route.name}</td>
                <td className="px-4 py-3 text-white/70">
                  {route.hubSequence.map(id => getHubName(id)).join(' → ')}
                </td>
                <td className="px-4 py-3">{route.distanceKm}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDeleteTarget(route)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RouteForm
          hubs={hubs}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRoute(deleteTarget.id)
          setDeleteTarget(null)
        }}
        title="Delete Route"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
