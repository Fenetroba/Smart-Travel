import { useAppContext } from '../../context/AppContext'
import TransportConfigCard from '../../components/admin/TransportConfigCard'

export default function TransportManager() {
  const { transportModes, updateTransportMode } = useAppContext()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Transport</h1>
        <p className="text-white/50 text-sm">Configure transport mode pricing and speed</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {transportModes.map(mode => (
          <TransportConfigCard key={mode.id} mode={mode} onUpdate={updateTransportMode} />
        ))}
      </div>
    </div>
  )
}
