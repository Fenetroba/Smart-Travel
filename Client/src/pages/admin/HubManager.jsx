import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import HubModal from '../../components/admin/HubModal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

export default function HubManager() {
  const { hubs, addHub, updateHub, deleteHub } = useAppContext()
  const [modalHub, setModalHub] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleSave = (hub) => {
    if (hubs.some((h) => h.id === hub.id)) {
      updateHub(hub.id, hub)
    } else {
      addHub(hub)
    }
    setModalHub(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Manage Hubs</h1>
        <button
          onClick={() => setModalHub(undefined)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
        >
          Add Hub
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-4 py-3 font-medium text-white/70">Name</th>
              <th className="text-left px-4 py-3 font-medium text-white/70">Latitude</th>
              <th className="text-left px-4 py-3 font-medium text-white/70">Longitude</th>
              <th className="text-left px-4 py-3 font-medium text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hubs.map((hub) => (
              <tr key={hub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">{hub.name}</td>
                <td className="px-4 py-3">{hub.lat}</td>
                <td className="px-4 py-3">{hub.lng}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button
                    onClick={() => setModalHub(hub)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(hub)}
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

      {modalHub !== null && (
        <HubModal
          hub={modalHub === undefined ? null : modalHub}
          onSave={handleSave}
          onClose={() => setModalHub(null)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteHub(deleteTarget.id)
          setDeleteTarget(null)
        }}
        title="Delete Hub"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
