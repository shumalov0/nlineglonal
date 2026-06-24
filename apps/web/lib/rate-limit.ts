// Sadə in-memory rate limiter — production üçün Redis tövsiyə olunur
import { NextRequest, NextResponse } from 'next/server'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Müntəzəm təmizləmə (memory leak-i önlə)
const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}

export interface RateLimitOptions {
  // Müddət (ms) ərzində icazə verilən maksimum sorğu sayı
  limit: number
  // Pəncərə müddəti (ms)
  windowMs: number
  // Açar — IP, userId və ya custom
  key: string
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  cleanup()
  const now = Date.now()
  const fullKey = `${opts.key}:${opts.windowMs}`
  let bucket = buckets.get(fullKey)

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + opts.windowMs }
    buckets.set(fullKey, bucket)
  }

  bucket.count += 1
  const remaining = Math.max(0, opts.limit - bucket.count)
  return {
    ok: bucket.count <= opts.limit,
    remaining,
    resetAt: bucket.resetAt,
  }
}

// IP-ni request-dən çıxart
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

// API route-ları üçün rahat istifadə
// Limit aşılırsa 429 cavab qaytarır, əks halda null
export function applyRateLimit(
  req: NextRequest,
  options: { limit: number; windowMs: number; key?: string }
): NextResponse | null {
  const ip = getClientIp(req)
  const key = options.key ? `${options.key}:${ip}` : ip
  const result = checkRateLimit({ ...options, key })

  if (!result.ok) {
    const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Çoxlu sorğu. Bir az sonra cəhd edin.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetIn),
          'X-RateLimit-Limit': String(options.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      }
    )
  }
  return null
}
