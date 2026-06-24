import * as React from 'react'
import { cn } from '@/lib/utils'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'block w-full rounded-lg px-3 py-2 text-sm',
        'bg-[var(--color-bg)] border border-[var(--color-border)]',
        'text-[var(--color-text)]',
        'focus:outline-none focus:border-[var(--color-border-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'
