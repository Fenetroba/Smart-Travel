import UsageChart from '../../components/admin/UsageChart'

export default function Analytics() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/50 text-sm">System usage statistics</p>
      </div>
      <UsageChart />
    </div>
  )
}
