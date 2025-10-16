import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Pulsa Admin Dashboard</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 Pulsa Admin Dashboard
            </h1>
            <div className="text-sm text-gray-500">
              {loading ? 'Loading...' : `Status: ${stats.status}`}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Transactions
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  -
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Today's Revenue
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  Rp 0
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Users
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  -
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  System Uptime
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {loading ? '-' : `${Math.floor(stats.uptime / 60)}m`}
                </dd>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition">
                  📊 View Reports
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition">
                  👥 Manage Users
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition">
                  ⚙️ Products
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition">
                  💰 Transactions
                </button>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">API Status</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {loading ? 'Checking...' : stats.status === 'healthy' ? '✅ Operational' : '❌ Down'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Memory Usage</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {loading ? '-' : `${Math.round(stats.memory?.used / 1024 / 1024)}MB`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bot Status</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {loading ? '-' : stats.polling ? '✅ Running' : '❌ Stopped'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Update</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {loading ? '-' : new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Pulsa Admin Dashboard &copy; 2024
          </p>
        </div>
      </footer>
    </div>
  )
}
