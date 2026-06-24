// Guest istifadəçilər üçün cart sessionId-ni cookie-də saxla
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

const COOKIE_NAME = 'cart_session'
const MAX_AGE = 60 * 60 * 24 * 90 // 90 gün

export function getCartSessionId(): string | null {
  return cookies().get(COOKIE_NAME)?.value ?? null
}

export function ensureCartSessionId(): string {
  const store = cookies()
  let id = store.get(COOKIE_NAME)?.value
  if (!id) {
    id = randomUUID()
    store.set(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
    })
  }
  return id
}

export function clearCartSession() {
  cookies().delete(COOKIE_NAME)
}
