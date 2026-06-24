// Server-side auth helper-ləri
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'
import type { UserRole } from '@prisma/client'

export interface AuthorizedUser {
  id: string
  email: string
  name: string | null
  role: UserRole
}

export async function getCurrentUser(): Promise<AuthorizedUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? null,
    role: session.user.role,
  }
}

// API route-larda admin/manager yoxlaması
export async function requireAdmin(): Promise<
  | { ok: true; user: AuthorizedUser }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 }),
    }
  }
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 }),
    }
  }
  return { ok: true, user }
}
