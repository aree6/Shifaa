import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import TopBar from './TopBar'
import { seedIfNeeded } from '../lib/storage'

export default function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    seedIfNeeded()
  }, [])

  return (
    <div className="min-h-screen bg-shiffa-50">
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <SidebarNav />
        </div>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw]">
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col md:ml-72">
          <TopBar onOpenNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
