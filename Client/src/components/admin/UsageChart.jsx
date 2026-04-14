const weeklyData = [
  { day: 'Mon', count: 142 },
  { day: 'Tue', count: 198 },
  { day: 'Wed', count: 175 },
  { day: 'Thu', count: 221 },
  { day: 'Fri', count: 267 },
  { day: 'Sat', count: 189 },
  { day: 'Sun', count: 134 },
]

const maxCount = 267
const barWidth = 60
const barGap = 40

export default function UsageChart() {
  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-semibold text-lg mb-4">Weekly Route Queries</h2>
      <svg width="100%" viewBox="0 0 700 200" aria-label="Weekly route queries bar chart">
        {weeklyData.map((item, i) => {
          const barHeight = (item.count / maxCount) * 160
          const x = i * (barWidth + barGap) + 20
          const y = 200 - barHeight - 20
          return (
            <g key={item.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#2563EB"
                rx={4}
              />
              {/* count above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
              >
                {item.count}
              </text>
              {/* day label below bar */}
              <text
                x={x + barWidth / 2}
                y={195}
                textAnchor="middle"
                fill="#ffffff99"
                fontSize="12"
              >
                {item.day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
