import type React from 'react'
import { cn } from '../lib/utils'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

export default function Select({ className, ...props }: Props) {
  return (
    <select
      {...props}
      className={cn(
        'h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-shiffa-500 focus:outline-none focus:ring-2 focus:ring-shiffa-100',
        className,
      )}
    />
  )
}
