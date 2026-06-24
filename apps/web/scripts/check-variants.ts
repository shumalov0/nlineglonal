import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

const raw = readFileSync(join(process.cwd(), '..', '..', '.env'), 'utf8')
for (const line of raw.split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const eq = t.indexOf('=')
  if (eq === -1) continue
  const k = t.slice(0, eq).trim()
  let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  if (!process.env[k]) process.env[k] = v
}

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaNeon(pool) })

async function main() {
  const total = await prisma.product.count()
  const withVariants = await prisma.product.count({ where: { hasVariants: true } })
  const variants = await prisma.productVariant.count()
  const attrTypes = await prisma.attributeType.count()
  const attrValues = await prisma.attributeValue.count()
  const cats = await prisma.category.count()

  console.log('─── Baza vəziyyəti ───')
  console.log('Məhsul:', total)
  console.log('Variantlı məhsul:', withVariants)
  console.log('Variant sayı:', variants)
  console.log('Atribut tipi:', attrTypes)
  console.log('Atribut dəyəri:', attrValues)
  console.log('Kateqoriya:', cats)

  // Bir variantlı məhsulu nümunə göstər
  const sample = await prisma.product.findFirst({
    where: { hasVariants: true },
    include: {
      variants: { include: { attributes: { include: { attributeType: true } } } },
    },
  })
  if (sample) {
    console.log('\n─── Nümunə variantlı məhsul ───')
    console.log('Ad:', sample.name, '| basePrice:', sample.basePrice.toString())
    for (const v of sample.variants) {
      const attrs = v.attributes
        .map((a) => `${a.attributeType.name}: ${a.value}`)
        .join(', ')
      console.log(`  • SKU ${v.sku} | qiymət ${v.price?.toString() ?? 'baza'} | [${attrs}]`)
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
