'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LogoutButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut size={16} /> Çıxış et
    </Button>
  )
}
