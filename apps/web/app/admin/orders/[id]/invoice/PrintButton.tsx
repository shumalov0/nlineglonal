'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="
        inline-flex items-center gap-2 rounded-lg
        bg-[#1565C0] px-4 py-2 text-sm font-medium text-white
        hover:bg-[#0D47A1] transition-colors print:hidden
      "
    >
      <Printer size={16} /> Çap et
    </button>
  )
}
