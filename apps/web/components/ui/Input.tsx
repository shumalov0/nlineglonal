import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'block w-full rounded-lg px-3 py-2 text-sm',
        'bg-[var(--color-bg)] border border-[var(--color-border)]',
        'text-[var(--color-text)] placeholder:text-[var(--color-muted)]',
        'focus:outline-none focus:border-[var(--color-border-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
