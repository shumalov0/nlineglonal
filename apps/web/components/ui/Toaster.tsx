'use client'

import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore, type ToastType } from '@/stores/toastStore'
import { cn } from '@/lib/utils'

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES: Record<ToastType, string> = {
  success:
    'border-l-4 border-[var(--color-success)] [&_.toast-icon]:text-[var(--color-success)]',
  error:
    'border-l-4 border-[var(--color-error)] [&_.toast-icon]:text-[var(--color-error)]',
  warning:
    'border-l-4 border-[var(--color-warning)] [&_.toast-icon]:text-[var(--color-warning)]',
  info:
    'border-l-4 border-[var(--color-primary)] [&_.toast-icon]:text-[var(--color-primary)]',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Bildirişlər"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type]
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              'flex items-start gap-3 rounded-lg p-4 shadow-card-lg',
              'bg-[var(--color-bg)] border border-[var(--color-border-light)]',
              'animate-in slide-in-from-right-5 fade-in duration-200',
              STYLES[t.type]
            )}
          >
            <Icon size={20} className="toast-icon shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-text)]">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Bildirişi bağla"
              className="shrink-0 rounded-md p-1 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
