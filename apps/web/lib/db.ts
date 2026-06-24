// Prisma client — Neon serverless driver ilə
// Lazy initialization — DATABASE_URL yalnız ilk istifadədə tələb olunur
// (Next.js build zamanı module-load uğurla tamamlansın deyə)
import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL təyin edilməyib')
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

// Lazy proxy — yalnız ilk məhsuldar istifadə zamanı PrismaClient yarat
let cachedClient: PrismaClient | undefined = globalForPrisma.prisma

function getClient(): PrismaClient {
  if (!cachedClient) {
    cachedClient = createPrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = cachedClient
    }
  }
  return cachedClient
}

// Proxy ilə lazy access — module yüklənəndə nə pool yaradılır, nə də env yoxlanılır
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
