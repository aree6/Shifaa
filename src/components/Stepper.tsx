import { Check } from 'lucide-react'
import { cn } from '../lib/utils'

export type StepperStep = {
  key: string
  label: string
}

type StepperProps = {
  steps: StepperStep[]
  activeKey?: string
  activeIndex?: number
  className?: string
  size?: 'sm' | 'md'
}

function clampIndex(index: number, max: number) {
  if (!Number.isFinite(index)) return 0
  if (index < 0) return 0
  if (index > max) return max
  return index
}

export default function Stepper({
  steps,
  activeKey,
  activeIndex,
  className,
  size = 'md',
}: StepperProps) {
  const computedIndex = (() => {
    if (typeof activeIndex === 'number') return activeIndex
    if (activeKey) return steps.findIndex((s) => s.key === activeKey)
    return 0
  })()

  const current = clampIndex(computedIndex, Math.max(0, steps.length - 1))

  const circleSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const labelSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const lineTop = size === 'sm' ? 'top-3' : 'top-4'

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className={cn('min-w-[420px] pb-1', size === 'sm' && 'min-w-[320px]')}>
        <div className="relative flex items-center justify-between">
          <div className={cn('absolute left-0 right-0 h-1 rounded-full bg-slate-200', lineTop)} />
          <div
            className={cn('absolute left-0 h-1 rounded-full bg-shiffa-600 transition-[width]', lineTop)}
            style={{ width: `${steps.length <= 1 ? 0 : (current === steps.length - 1 ? 100 : ((current + 0.5) / steps.length) * 100)}%` }}
          />

          {steps.map((step, idx) => {
            const isCurrent = idx === current
            const isPastOrCurrent = idx <= current

            const circleClasses = cn(
              'relative z-10 flex items-center justify-center rounded-full border-2 transition-colors',
              circleSize,
              isPastOrCurrent && 'border-shiffa-600',
              isPastOrCurrent && 'bg-shiffa-600 text-white',
              !isPastOrCurrent && 'border-slate-300 bg-white text-slate-500',
            )

            return (
              <div key={step.key} className="flex w-full flex-1 flex-col items-center">
                <div className={circleClasses} aria-current={isCurrent ? 'step' : undefined}>
                  {isPastOrCurrent ? <Check className={iconSize} /> : <span className={cn('font-extrabold', labelSize)}>{idx + 1}</span>}
                </div>
                <div
                  className={cn(
                    'mt-2 max-w-[10rem] text-center font-semibold',
                    labelSize,
                    isPastOrCurrent ? 'text-slate-900' : 'text-slate-500',
                  )}
                >
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
