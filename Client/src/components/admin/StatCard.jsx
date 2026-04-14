export default function StatCard({ icon, label, value }) {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-white/50 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
