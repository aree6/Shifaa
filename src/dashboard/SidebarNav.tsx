import {
  Activity,
  BadgeDollarSign,
  ClipboardList,
  History,
  LogOut,
  Pill,
  TriangleAlert,
} from 'lucide-react'
import type React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuth } from '../auth/auth-context'

type NavItem = {
  to: string
  label: string
  icon: React.ReactNode
  roles: Array<'doctor' | 'pharmacist' | 'patient' | 'donor'>
}

const NAV: NavItem[] = [
  {
    to: '/app/prescription',
    label: 'Prescription',
    icon: <Pill className="h-4 w-4" />,
    roles: ['doctor', 'pharmacist', 'patient'],
  },
  {
    to: '/app/history',
    label: 'History',
    icon: <History className="h-4 w-4" />,
    roles: ['doctor', 'pharmacist', 'patient'],
  },
  {
    to: '/app/shortages',
    label: 'Shortages',
    icon: <TriangleAlert className="h-4 w-4" />,
    roles: ['doctor', 'pharmacist', 'donor'],
  },
  {
    to: '/app/analysis',
    label: 'Analysis',
    icon: <Activity className="h-4 w-4" />,
    roles: ['doctor', 'pharmacist'],
  },
  {
    to: '/app/donations',
    label: 'Donations',
    icon: <BadgeDollarSign className="h-4 w-4" />,
    roles: ['donor'],
  },
]

export default function SidebarNav() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-72 shrink-0 bg-shiffa-800 text-white">
      <div className="px-6 py-6">
        <div className="text-3xl font-extrabold">Shifaa'</div>
        <div className="mt-1 text-sm font-medium text-white/70">Healthcare System</div>
      </div>

      <div className="px-4">
        <div className="rounded-2xl bg-white/5 p-3 text-sm">
          <div className="flex items-center gap-2 text-white/90">
            <ClipboardList className="h-4 w-4" />
            <div className="font-semibold">Signed in</div>
          </div>
          <div className="mt-2 text-xs text-white/70">{user?.name}</div>
          <div className="mt-1 text-xs text-white/70">Role: {user?.role}</div>
        </div>
      </div>

      <nav className="mt-5 px-4">
        <div className="space-y-2">
          {NAV.filter((i) => (user ? i.roles.includes(user.role) : false)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white',
                  isActive && 'bg-shiffa-700 text-white',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto px-4 pb-6 pt-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
