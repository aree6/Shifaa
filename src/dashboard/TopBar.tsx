import { Bell } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../auth/auth-context'
import { listShortages } from '../lib/storage'
import { useDataChanged } from '../lib/useDataChanged'

export default function TopBar() {
  const { user } = useAuth()

  const dataVersion = useDataChanged()

  const badgeCount = useMemo(() => {
    if (!user) return 0
    const shortages = listShortages()
    if (user.role === 'pharmacist') return shortages.filter((s) => !s.verified).length
    if (user.role === 'donor') return shortages.filter((s) => s.verified).length
    return 0
  }, [dataVersion, user])

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="text-sm font-semibold text-slate-700">{user?.role.toUpperCase()} Portal</div>

      <button
        className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
        onClick={() => {
          toast.message('Notifications', {
            description:
              badgeCount > 0
                ? `You have ${badgeCount} items to review.`
                : 'No new notifications.',
          })
        }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-xs font-bold text-white">
            {badgeCount}
          </span>
        ) : null}
      </button>
    </header>
  )
}
