import { useAppContext } from '../../context/AppContext'
import StatCard from '../../components/admin/StatCard'

export default function DashboardHome() {
  const { hubs, routes, transportModes } = useAppContext()

  const bus = transportModes.find(m => m.id === 'bus')
  const avgTravelTime =
    routes.length && bus
      ? parseFloat(
          (routes.reduce((sum, r) => sum + (r.distanceKm / bus.speedKmh) * 60, 0) / routes.length).toFixed(1)
        )
      : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 text-sm">System overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🗺️" label="Total Routes" value={routes.length} />
        <StatCard icon="📍" label="Total Hubs" value={hubs.length} />
        <StatCard icon="⏱️" label="Avg Travel Time" value={avgTravelTime + ' min'} />
        <StatCard icon="📊" label="System Usage" value="1,247" />
      </div>
    </div>
  )
}
