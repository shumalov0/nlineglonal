'use client'

import { useTheme } from '@/providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Light rejimə keç' : 'Dark rejimə keç'}
      className="
        p-2 rounded-lg transition-colors
        text-[var(--color-muted)] hover:text-[var(--color-text)]
        hover:bg-[var(--color-surface)]
      "
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
