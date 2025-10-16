import Head from 'next/head'
import Sidebar from './Sidebar'

export default function Layout({ children, title = 'Pulsa Admin' }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Head>
        <title>{title}</title>
      </Head>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center py-4 px-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin User</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                A
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
