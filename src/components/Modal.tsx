import type React from 'react'
import { cn } from '../lib/utils'
import Button from './Button'

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="text-base font-bold text-slate-900">{title}</div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
              Close
            </Button>
          </div>
          <div className={cn('px-6 py-5')}>{children}</div>
          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
