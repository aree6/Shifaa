import type React from 'react'
import { cn } from '../lib/utils'

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray'

export default function Badge({
  children,
  variant = 'gray',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'green' && 'bg-emerald-100 text-emerald-800',
        variant === 'yellow' && 'bg-amber-100 text-amber-800',
        variant === 'red' && 'bg-rose-100 text-rose-800',
        variant === 'gray' && 'bg-slate-100 text-slate-700',
        className,
      )}
    >
      {children}
    </span>
  )
}
