import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded-lg px-3 py-2 text-sm min-h-[80px]',
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
Textarea.displayName = 'Textarea'
