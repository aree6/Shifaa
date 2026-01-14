import type React from 'react'
import { cn } from '../lib/utils'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: Props) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-shiffa-500 focus:outline-none focus:ring-2 focus:ring-shiffa-100',
        className,
      )}
    />
  )
}
