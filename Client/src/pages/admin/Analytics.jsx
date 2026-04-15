import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Analytics() {
  const { auth } = useOutletContext()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      const data = await res.json()
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        if (res.status === 401) {
          setError('Authentication expired. Please log in again.')
        } else {
          setError(data.message || 'Failed to load analytics data')
        }
      }
    } catch (err) {
      setError('Failed to connect to analytics service')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-3 text-white/60">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">📊</span>
        <h2 className="text-xl font-semibold text-white mb-2">Analytics Unavailable</h2>
        <p className="text-white/60 mb-4">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Prepare line chart data
  const lineChartData = {
    labels: analyticsData?.dailySearches?.map(item => {
      const date = new Date(item._id)
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }) || [],
    datasets: [
      {
        label: 'Daily Searches',
        data: analyticsData?.dailySearches?.map(item => item.count) || [],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Prepare pie chart data
  const pieChartData = {
    labels: analyticsData?.transportUsage?.map(item => {
      const labels = { taxi: 'Taxi', bus: 'Bus', walk: 'Walking' }
      return labels[item._id] || item._id
    }) || [],
    datasets: [
      {
        data: analyticsData?.transportUsage?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(37, 99, 235)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-white/50 text-sm">System usage statistics and traveler insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Searches</p>
              <p className="text-2xl font-bold text-white">{analyticsData?.totalSearches || 0}</p>
            </div>
            <span className="text-3xl">🔍</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Unique Travelers</p>
              <p className="text-2xl font-bold text-white">{analyticsData?.uniqueUsers || 0}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Popular Transport</p>
              <p className="text-2xl font-bold text-white">
                {analyticsData?.transportUsage?.[0]?._id || 'N/A'}
              </p>
            </div>
            <span className="text-3xl">🚌</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Avg Daily Searches</p>
              <p className="text-2xl font-bold text-white">
                {analyticsData?.dailySearches?.length > 0 
                  ? Math.round(analyticsData.dailySearches.reduce((sum, day) => sum + day.count, 0) / analyticsData.dailySearches.length)
                  : 0
                }
              </p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Line Chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Daily Search Trends</h2>
          {analyticsData?.dailySearches?.length > 0 ? (
            <Line data={lineChartData} options={chartOptions} />
          ) : (
            <div className="text-center py-8 text-white/50">
              <span className="text-4xl block mb-2">📊</span>
              No search data available
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Transport Mode Usage</h2>
          {analyticsData?.transportUsage?.length > 0 ? (
            <Pie data={pieChartData} options={pieOptions} />
          ) : (
            <div className="text-center py-8 text-white/50">
              <span className="text-4xl block mb-2">🥧</span>
              No transport data available
            </div>
          )}
        </div>
      </div>

      {/* Popular Routes */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold text-lg mb-4">Popular Routes</h2>
        {analyticsData?.popularRoutes?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-white/70">From</th>
                  <th className="text-left px-4 py-3 text-white/70">To</th>
                  <th className="text-left px-4 py-3 text-white/70">Searches</th>
                  <th className="text-left px-4 py-3 text-white/70">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.popularRoutes.map((route, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white font-medium">{route._id.start}</td>
                    <td className="px-4 py-3 text-white font-medium">{route._id.end}</td>
                    <td className="px-4 py-3 text-white">{route.count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(route.count / analyticsData.popularRoutes[0].count) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-white/60 text-xs">
                          {Math.round((route.count / analyticsData.popularRoutes[0].count) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <span className="text-4xl block mb-2">🗺️</span>
            No route data available
          </div>
        )}
      </div>
    </div>
  )
}
