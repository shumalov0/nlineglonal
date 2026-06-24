/**
 * Mebaks.az (WooCommerce) → Nline Global import skripti
 *
 * İşlətmək (apps/web qovluğundan):
 *   npx tsx scripts/import-mebaks.ts                 # ilk 50 məhsul (test)
 *   IMPORT_ALL=1 npx tsx scripts/import-mebaks.ts    # bütün məhsullar
 *   IMPORT_R2=1 IMPORT_ALL=1 npx tsx scripts/import-mebaks.ts  # şəkilləri R2-yə yüklə
 *
 * Standart: şəkillər mebaks.az orijinal URL-i ilə saxlanır (sürətli, anında görünür).
 * IMPORT_R2=1: şəkillər endirilib öz R2 bucket-imizə köçürülür (tam müstəqillik).
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// ─── .env yüklə (repo kökündən) ──────────────────────────────
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '..', '..', '.env')
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      const key = t.slice(0, eq).trim()
      let val = t.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    console.warn('⚠️  .env tapılmadı')
  }
}
loadEnv()

// Neon pooled URL-dən Prisma native engine üçün uyğunsuz parametri təmizlə
function sanitizeDbUrl(url: string | undefined): string | undefined {
  if (!url) return url
  return url.replace(/[&?]channel_binding=require/g, '')
}

// Uzun skript üçün Neon WebSocket adapter əvəzinə standart TCP bağlantısı
// (WebSocket uzun əməliyyatlarda qopur). Native Prisma Neon pooler-ə TCP ilə qoşulur.
const prisma = new PrismaClient({
  datasources: { db: { url: sanitizeDbUrl(process.env.DATABASE_URL) } },
})

// ─── Konfiqurasiya ───────────────────────────────────────────
const BASE = 'https://mebaks.az/wp-json/wc/store/v1'
const IMPORT_ALL = process.env.IMPORT_ALL === '1'
const UPLOAD_R2 = process.env.IMPORT_R2 === '1'
const MAX_PRODUCTS = IMPORT_ALL ? Infinity : 50
const PER_PAGE = 100
const DELAY_MS = 400

// ─── R2 client (yalnız UPLOAD_R2 olduqda) ────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
})
const R2_BUCKET = process.env.R2_BUCKET_NAME ?? ''
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? ''

// ─── Köməkçilər ──────────────────────────────────────────────
const AZ_MAP: Record<string, string> = {
  ə: 'e', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ı: 'i', ç: 'c',
  Ə: 'e', Ş: 's', Ğ: 'g', Ü: 'u', Ö: 'o', I: 'i', İ: 'i', Ç: 'c',
}
function slugify(text: string): string {
  return text
    .split('').map((ch) => AZ_MAP[ch] ?? ch).join('')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8380;/g, '₼')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim()
}
function minorToDecimal(value: string, minorUnit = 2): number {
  const n = parseInt(value, 10)
  return isNaN(n) ? 0 : n / Math.pow(10, minorUnit)
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'NlineGlobal-Importer/1.0 (partner sync)' },
  })
  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`)
  return res.json() as Promise<T>
}

// Şəkli R2-yə yüklə, public URL qaytar
async function uploadToR2(srcUrl: string): Promise<{ url: string; key: string } | null> {
  try {
    const res = await fetch(srcUrl)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer = Buffer.from(await res.arrayBuffer())
    const ext = (contentType.split('/')[1] ?? 'jpg').split(';')[0]
    const key = `products/${randomUUID()}.${ext}`
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      })
    )
    return { key, url: `${R2_PUBLIC_URL}/${key}` }
  } catch (e) {
    console.warn(`   ⚠️ şəkil yüklənmədi: ${srcUrl}`)
    return null
  }
}

// ─── WooCommerce tipləri ─────────────────────────────────────
interface WooCategory {
  id: number
  name: string
  slug: string
  parent: number
  count: number
}
interface WooProduct {
  id: number
  name: string
  slug: string
  type: string
  sku: string
  short_description: string
  description: string
  on_sale: boolean
  prices: {
    regular_price: string
    sale_price: string
    currency_minor_unit: number
  }
  images: { src: string; alt: string }[]
  categories: { id: number; name: string; slug: string }[]
  variations: { id: number; attributes?: { name: string; value: string }[] }[]
  weight: string
  is_purchasable: boolean
}

// ─── 1. Kateqoriyaları sinxronlaşdır ─────────────────────────
// WooCommerce kateqoriya id → bizim Category id map-i qaytarır
async function syncCategories(): Promise<Map<number, string>> {
  console.log('📂 Kateqoriyalar yüklənir...')
  const wooCats: WooCategory[] = []
  let page = 1
  while (true) {
    const batch = await fetchJson<WooCategory[]>(
      `${BASE}/products/categories?per_page=100&page=${page}`
    )
    if (batch.length === 0) break
    wooCats.push(...batch)
    if (batch.length < 100) break
    page++
    await sleep(DELAY_MS)
  }

  // Boş kateqoriyaları (count=0) atla
  const active = wooCats.filter((c) => c.count > 0)
  const wooIdToOurId = new Map<number, string>()

  // Əvvəlcə kök (parent=0), sonra alt kateqoriyalar
  const sorted = [...active].sort((a, b) => a.parent - b.parent)

  for (const cat of sorted) {
    const slug = cat.slug.includes('%')
      ? slugify(cat.name)
      : decodeURIComponent(cat.slug)
    const cleanSlug = slugify(slug) || `cat-${cat.id}`

    const parentId =
      cat.parent && wooIdToOurId.has(cat.parent)
        ? wooIdToOurId.get(cat.parent)!
        : null

    const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } })
    if (existing) {
      wooIdToOurId.set(cat.id, existing.id)
      continue
    }

    const created = await prisma.category.create({
      data: {
        name: stripHtml(cat.name),
        slug: cleanSlug,
        parentId,
        isActive: true,
      },
    })
    wooIdToOurId.set(cat.id, created.id)
  }

  console.log(`   ✓ ${wooIdToOurId.size} kateqoriya hazır`)
  return wooIdToOurId
}

// ─── 2. Bütün məhsulları gətir ───────────────────────────────
async function fetchAllProducts(): Promise<WooProduct[]> {
  console.log('📦 Məhsullar yüklənir...')
  const all: WooProduct[] = []
  let page = 1
  while (all.length < MAX_PRODUCTS) {
    const batch = await fetchJson<WooProduct[]>(
      `${BASE}/products?per_page=${PER_PAGE}&page=${page}`
    )
    if (batch.length === 0) break
    all.push(...batch)
    console.log(`   ... ${all.length} məhsul`)
    if (batch.length < PER_PAGE) break
    page++
    await sleep(DELAY_MS)
  }
  return all.slice(0, MAX_PRODUCTS)
}

// Junk / test məhsullarını filtrlə
function isValidProduct(p: WooProduct): boolean {
  const name = p.name.toLowerCase()
  if (name.includes('add new product') || name.includes('test')) return false
  if (!p.name.trim()) return false
  return true
}

// ─── 3. Şəkilləri hazırla ────────────────────────────────────
async function prepareImages(
  p: WooProduct
): Promise<{ url: string; key: string | null; isPrimary: boolean; sortOrder: number }[]> {
  const result: { url: string; key: string | null; isPrimary: boolean; sortOrder: number }[] = []
  const images = p.images.slice(0, 6) // maks 6 şəkil

  for (let i = 0; i < images.length; i++) {
    const src = images[i].src
    if (UPLOAD_R2) {
      const uploaded = await uploadToR2(src)
      if (uploaded) {
        result.push({ url: uploaded.url, key: uploaded.key, isPrimary: i === 0, sortOrder: i })
      }
    } else {
      // Orijinal mebaks.az URL-i saxla (sürətli)
      result.push({ url: src, key: null, isPrimary: i === 0, sortOrder: i })
    }
  }
  return result
}

// ─── 4. Variantları import et (variable məhsullar) ───────────
interface WooVariationDetail {
  sku: string
  prices: { regular_price: string; sale_price: string; currency_minor_unit: number }
}

// Atributlar parent-dən gəlir, qiymət standalone fetch-dən.
// Yaradılan variantların min qiymətini qaytarır (parent basePrice üçün)
async function importVariants(
  productId: string,
  baseSku: string,
  variationRefs: { id: number; attributes?: { name: string; value: string }[] }[]
): Promise<{ minPrice: number | null; minSale: number | null }> {
  const attrTypeCache = new Map<string, string>()
  const attrValueCache = new Map<string, string>()

  let order = 0
  let minPrice: number | null = null
  let minSale: number | null = null

  for (const ref of variationRefs.slice(0, 25)) {
    // Atributları parent ref-dən oxu (standalone boş gəlir!)
    const valueIds: string[] = []
    for (const attr of ref.attributes ?? []) {
      const typeSlug = slugify(attr.name) || 'option'
      let typeId = attrTypeCache.get(typeSlug)
      if (!typeId) {
        const existingType = await prisma.attributeType.findUnique({ where: { slug: typeSlug } })
        const displayType = /reng|color|rəng/i.test(attr.name) ? 'COLOR' : 'BUTTON'
        const type =
          existingType ??
          (await prisma.attributeType.create({
            data: { name: attr.name, slug: typeSlug, displayType },
          }))
        typeId = type.id
        attrTypeCache.set(typeSlug, typeId)
      }
      const valueKey = `${typeId}:${attr.value}`
      let valueId = attrValueCache.get(valueKey)
      if (!valueId) {
        const existingVal = await prisma.attributeValue.findFirst({
          where: { attributeTypeId: typeId, value: attr.value },
        })
        const val =
          existingVal ??
          (await prisma.attributeValue.create({
            data: { attributeTypeId: typeId, value: attr.value },
          }))
        valueId = val.id
        attrValueCache.set(valueKey, valueId)
      }
      valueIds.push(valueId)
    }

    // Qiymət üçün standalone variation fetch
    let reg = 0
    let sale: number | null = null
    let vSku = `${baseSku}-V${ref.id}`
    try {
      const detail = await fetchJson<WooVariationDetail>(`${BASE}/products/${ref.id}`)
      const minor = detail.prices?.currency_minor_unit ?? 2
      reg = minorToDecimal(detail.prices?.regular_price ?? '0', minor)
      const s = detail.prices?.sale_price ? minorToDecimal(detail.prices.sale_price, minor) : 0
      sale = s > 0 && s < reg ? s : null
      if (detail.sku) vSku = detail.sku
      await sleep(DELAY_MS)
    } catch {
      // qiymət alınmadısa baza qiymətə düşəcək
    }

    const effective = sale ?? (reg > 0 ? reg : null)
    if (effective !== null) {
      if (minPrice === null || effective < minPrice) {
        minPrice = reg > 0 ? reg : effective
        minSale = sale
      }
    }

    try {
      await prisma.productVariant.create({
        data: {
          productId,
          sku: vSku,
          price: reg > 0 ? reg : null,
          salePrice: sale,
          stock: 99,
          isActive: true,
          sortOrder: order++,
          attributes: valueIds.length
            ? { connect: valueIds.map((id) => ({ id })) }
            : undefined,
        },
      })
    } catch {
      // sku təkrarı — atla
    }
  }

  return { minPrice, minSale }
}

// ─── 5. Tək məhsulu import et ────────────────────────────────
async function importProduct(
  p: WooProduct,
  catMap: Map<number, string>,
  fallbackCategoryId: string
): Promise<'created' | 'updated' | 'skipped'> {
  const slug = (p.slug.includes('%') ? slugify(p.name) : decodeURIComponent(p.slug)) || `p-${p.id}`
  const cleanSlug = slugify(slug) || `p-${p.id}`

  // Kateqoriya: məhsulun son (ən spesifik) kateqoriyası
  let categoryId = fallbackCategoryId
  for (const c of p.categories) {
    if (catMap.has(c.id)) categoryId = catMap.get(c.id)!
  }

  const minor = p.prices?.currency_minor_unit ?? 2
  const regular = minorToDecimal(p.prices?.regular_price ?? '0', minor)
  const sale = p.prices?.sale_price ? minorToDecimal(p.prices.sale_price, minor) : 0
  const basePrice = regular > 0 ? regular : sale > 0 ? sale : 0.01
  const salePrice = p.on_sale && sale > 0 && sale < regular ? sale : null

  const sku = (p.sku && p.sku.trim()) || `MBK-${p.id}`
  const isVariable = p.type === 'variable' && p.variations.length > 0

  // Mövcuddursa atla (idempotent)
  const existing = await prisma.product.findUnique({ where: { slug: cleanSlug } })
  if (existing) return 'skipped'

  const images = await prepareImages(p)

  const product = await prisma.product.create({
    data: {
      name: stripHtml(p.name),
      slug: cleanSlug,
      sku,
      description: p.description ? stripHtml(p.description) : null,
      shortDesc: p.short_description ? stripHtml(p.short_description).slice(0, 250) : null,
      categoryId,
      basePrice,
      salePrice,
      weight: p.weight ? parseFloat(p.weight) || null : null,
      isActive: true,
      isFeatured: false,
      hasVariants: isVariable,
      tags: [],
      images: {
        create: images.map((img) => ({
          url: img.url,
          key: img.key,
          altText: stripHtml(p.name),
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      },
    },
  })

  if (isVariable) {
    const { minPrice, minSale } = await importVariants(product.id, sku, p.variations)
    // Variantlı məhsulun baza qiymətini min variant qiymətinə uyğunlaşdır
    if (minPrice !== null && minPrice > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { basePrice: minPrice, salePrice: minSale },
      })
    }
  }

  return 'created'
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════')
  console.log('  Mebaks.az → Nline Global import')
  console.log(`  Rejim: ${IMPORT_ALL ? 'BÜTÜN məhsullar' : 'TEST (50 məhsul)'}`)
  console.log(`  Şəkillər: ${UPLOAD_R2 ? 'R2-yə yüklənir' : 'orijinal URL (sürətli)'}`)
  console.log('═══════════════════════════════════════\n')

  const catMap = await syncCategories()

  // İstəyə görə əvvəlki import datasını təmizlə (IMPORT_WIPE=1)
  if (process.env.IMPORT_WIPE === '1') {
    console.log('🧹 Köhnə məhsul datası silinir...')
    await prisma.cartItem.deleteMany({})
    await prisma.productImage.deleteMany({})
    await prisma.productVariant.deleteMany({})
    await prisma.product.deleteMany({})
    console.log('   ✓ təmizləndi\n')
  }

  // Fallback kateqoriya (kateqoriyasız məhsullar üçün)
  const fallback = await prisma.category.upsert({
    where: { slug: 'diger' },
    update: {},
    create: { name: 'Digər', slug: 'diger', isActive: true, sortOrder: 999 },
  })

  const products = (await fetchAllProducts()).filter(isValidProduct)
  console.log(`\n🔄 ${products.length} məhsul import edilir...\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    try {
      const result = await importProduct(p, catMap, fallback.id)
      if (result === 'created') created++
      else if (result === 'skipped') skipped++
      const tag = result === 'created' ? '✓' : '–'
      console.log(`[${i + 1}/${products.length}] ${tag} ${stripHtml(p.name).slice(0, 50)}`)
    } catch (e) {
      failed++
      console.warn(`[${i + 1}/${products.length}] ✗ ${stripHtml(p.name).slice(0, 40)} — ${(e as Error).message}`)
    }
    if (!UPLOAD_R2) await sleep(120) // şəkil yükləmiriksə yüngül fasilə
  }

  console.log('\n═══════════════════════════════════════')
  console.log(`  ✅ Yaradıldı: ${created}`)
  console.log(`  ⏭️  Atlandı (mövcud): ${skipped}`)
  console.log(`  ❌ Xəta: ${failed}`)
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
