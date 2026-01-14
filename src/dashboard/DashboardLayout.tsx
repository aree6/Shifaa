import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import TopBar from './TopBar'
import { seedIfNeeded } from '../lib/storage'

export default function DashboardLayout() {
  useEffect(() => {
    seedIfNeeded()
  }, [])

  return (
    <div className="min-h-screen bg-shiffa-50">
      <div className="flex min-h-screen">
        <SidebarNav />

        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
