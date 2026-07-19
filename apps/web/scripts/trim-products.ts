/**
 * Məhsulları maksimum 600-ə endirir (DB kvotasını qorumaq üçün).
 * Kateqoriya müxtəlifliyini qorumaq üçün round-robin seçim edir.
 *
 * İşlətmək (apps/web qovluğundan):
 *   npx tsx scripts/trim-products.ts            # test — nə silinəcəyini göstərir
 *   TRIM_APPLY=1 npx tsx scripts/trim-products.ts  # həqiqətən silir
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

// ─── .env yüklə (repo kökündən) ──────────────────────────────
try {
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
} catch {
  console.warn('⚠️  .env tapılmadı')
}

function sanitize(url: string | undefined) {
  return url?.replace(/[&?]channel_binding=require/g, '')
}

const prisma = new PrismaClient({
  datasources: { db: { url: sanitize(process.env.DATABASE_URL) } },
})

const KEEP_MAX = Number(process.env.TRIM_KEEP ?? 600)
const APPLY = process.env.TRIM_APPLY === '1'

// Massivi bərabər hissələrə böl (batch)
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(`  Məhsul azaltma — maksimum ${KEEP_MAX} saxla`)
  console.log(`  Rejim: ${APPLY ? 'TƏTBİQ (silinəcək)' : 'TEST (yalnız hesabat)'}`)
  console.log('═══════════════════════════════════════\n')

  // Yalnız id + categoryId oxu (minimal transfer)
  const products = await prisma.product.findMany({
    select: { id: true, categoryId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  console.log(`Cəmi məhsul: ${products.length}`)

  if (products.length <= KEEP_MAX) {
    console.log(`✓ Onsuz da ${KEEP_MAX}-dən azdır, silməyə ehtiyac yoxdur.`)
    return
  }

  // Kateqoriya üzrə qrupla
  const byCat = new Map<string, string[]>()
  for (const p of products) {
    const arr = byCat.get(p.categoryId) ?? []
    arr.push(p.id)
    byCat.set(p.categoryId, arr)
  }

  // Round-robin: hər kateqoriyadan növbə ilə götür (müxtəliflik üçün)
  const keep = new Set<string>()
  const catQueues = Array.from(byCat.values())
  let idx = 0
  while (keep.size < KEEP_MAX) {
    let added = false
    for (const q of catQueues) {
      if (q[idx]) {
        keep.add(q[idx])
        added = true
        if (keep.size >= KEEP_MAX) break
      }
    }
    if (!added) break // bütün kateqoriyalar bitdi
    idx++
  }

  const toDelete = products.filter((p) => !keep.has(p.id)).map((p) => p.id)
  console.log(`Saxlanılacaq: ${keep.size}`)
  console.log(`Silinəcək: ${toDelete.length}`)
  console.log(`Kateqoriya sayı (paylanma): ${byCat.size}`)

  if (!APPLY) {
    console.log('\n⚠️  Bu TEST rejimidir. Həqiqətən silmək üçün:')
    console.log('   TRIM_APPLY=1 npx tsx scripts/trim-products.ts')
    return
  }

  // Sifarişdə olan məhsulları silmə (snapshot qorunsun) — onları keep-ə əlavə et
  const orderedItems = await prisma.orderItem.findMany({
    where: { productId: { in: toDelete } },
    select: { productId: true },
    distinct: ['productId'],
  })
  const orderedIds = new Set(orderedItems.map((o) => o.productId))
  const finalDelete = toDelete.filter((id) => !orderedIds.has(id))
  if (orderedIds.size > 0) {
    console.log(`ℹ️  ${orderedIds.size} məhsul sifarişdə olduğu üçün saxlanıldı`)
  }

  console.log(`\n🗑️  ${finalDelete.length} məhsul silinir...`)
  const batches = chunk(finalDelete, 200)
  let deleted = 0
  for (let i = 0; i < batches.length; i++) {
    const ids = batches[i]
    // Əvvəl səbət elementlərini sil (FK), sonra məhsulları (images/variants cascade)
    await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } })
    const res = await prisma.product.deleteMany({ where: { id: { in: ids } } })
    deleted += res.count
    console.log(`   [${i + 1}/${batches.length}] ${deleted} silindi`)
  }

  const remaining = await prisma.product.count()
  console.log('\n═══════════════════════════════════════')
  console.log(`  ✅ Silindi: ${deleted}`)
  console.log(`  📦 Qalan məhsul: ${remaining}`)
  console.log('═══════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('FATAL:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
