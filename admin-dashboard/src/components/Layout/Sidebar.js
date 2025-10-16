import Link from 'next/link'
import { useRouter } from 'next/router'

const menuItems = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Transactions', href: '/transactions', icon: '💰' },
  { name: 'Products', href: '/products', icon: '📦' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Reports', href: '/reports', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' }
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <div className="w-64 bg-gray-800 min-h-screen">
      <div className="p-4">
        <h1 className="text-white text-xl font-bold">🤖 Pulsa Admin</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 cursor-pointer ${
              router.pathname === item.href ? 'bg-gray-700 border-r-4 border-blue-500' : ''
            }`}>
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}
