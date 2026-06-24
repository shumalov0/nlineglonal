# CLAUDE.md — Mebel E-Commerce Platformu (Senior Level)

## 📌 Layihə Haqqında

Bu layihə **tam funksional mebel e-commerce platformu**dur. Xırda mebel detalları da daxil olmaqla geniş məhsul çeşidi var. Platforma responsiv frontend, güclü admin panel və PostgreSQL backend-dən ibarətdir.

---

## 🏗️ Tech Stack

| Qat | Texnologiya |
|-----|-------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express.js (REST API) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (JWT + Session) |
| Database Host | Neon (Serverless PostgreSQL) |
| File Storage | Cloudflare R2 (S3-uyğun, egress pulsuz) |
| CDN | Cloudflare (R2 ilə avtomatik) |
| State Management | Zustand + React Query (TanStack) |
| Deploy | Vercel (frontend) + Neon (PostgreSQL) |
| Cache | Redis (opsional, sonradan əlavə ediləcək) |

---

## 📁 Qovluq Strukturu

```
/
├── apps/
│   ├── web/                        # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (shop)/             # Public mağaza route-ları
│   │   │   │   ├── page.tsx        # Ana səhifə
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx    # Məhsul siyahısı
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx # Məhsul detalı
│   │   │   │   ├── categories/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   └── orders/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── admin/              # Admin Panel (qorunan route)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx        # Dashboard
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   └── [id]/edit/
│   │   │   │   ├── categories/
│   │   │   │   ├── orders/
│   │   │   │   ├── customers/
│   │   │   │   └── settings/
│   │   │   └── api/                # Next.js API Routes
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui komponentlər
│   │   │   ├── shop/               # Mağaza komponentləri
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── VariantSelector.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   ├── SizeSelector.tsx
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   └── FilterSidebar.tsx
│   │   │   ├── admin/              # Admin komponentləri
│   │   │   └── layout/
│   │   ├── lib/
│   │   │   ├── db.ts               # Prisma client
│   │   │   ├── auth.ts             # NextAuth konfiq
│   │   │   ├── r2.ts               # Cloudflare R2 client
│   │   │   ├── r2-upload.ts        # Upload helper (presigned URL)
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── public/
```

---

## ☁️ Xidmət Konfiqurasiyaları

### Neon — Serverless PostgreSQL

```bash
# neon.tech → yeni proje yarat → Connection string al
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Neon-un xüsusiyyətləri:
# • Dev branch → prisma migrate dev
# • Prod branch → prisma migrate deploy
# • Avtomatik suspend (pulsuz planda aktiv olmadıqda yatır)
```

```typescript
// lib/db.ts — Neon + Prisma (connection pooling ilə)
import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

### Cloudflare R2 — Object Storage

```bash
# Cloudflare Dashboard → R2 → Bucket yarat: "furniture-media"
# Settings → Custom Domain: media.yourdomain.com (CDN avtomatik aktivdir)
# API Tokens → R2 Token yarat (Object Read & Write)
```

```typescript
// lib/r2.ts — AWS S3 SDK ilə Cloudflare R2
import { S3Client } from '@aws-sdk/client-s3'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const R2_BUCKET     = process.env.R2_BUCKET_NAME!   // "furniture-media"
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!    // "https://media.yourdomain.com"
```

```typescript
// lib/r2-upload.ts — Şəkil yükləmə
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from './r2'
import { randomUUID } from 'crypto'

export async function uploadImageToR2(
  file: Buffer,
  contentType: string,
  folder: 'products' | 'categories' | 'variants' = 'products'
): Promise<{ url: string; key: string }> {
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `${folder}/${randomUUID()}.${ext}`

  await r2.send(new PutObjectCommand({
    Bucket:       R2_BUCKET,
    Key:          key,
    Body:         file,
    ContentType:  contentType,
    CacheControl: 'public, max-age=31536000',
  }))

  return { key, url: `${R2_PUBLIC_URL}/${key}` }
}

// Presigned URL — client birbaşa R2-yə yükləsin (böyük fayllar üçün)
export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  )
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
}
```

```typescript
// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToR2 } from '@/lib/r2-upload'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })
  }
  const formData = await req.formData()
  const file = formData.get('file') as File
  const folder = (formData.get('folder') as string) || 'products'
  if (!file) return NextResponse.json({ error: 'Fayl tapılmadı' }, { status: 400 })
  const buffer = Buffer.from(await file.arrayBuffer())
  const { url, key } = await uploadImageToR2(buffer, file.type, folder as any)
  return NextResponse.json({ url, key })
}
```

---

## 🗄️ PostgreSQL Verilənlər Bazası Sxemi (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── İstifadəçi ──────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          UserRole  @default(CUSTOMER)
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  addresses     Address[]
  orders        Order[]
  cart          Cart?

  @@map("users")
}

enum UserRole {
  ADMIN
  MANAGER
  CUSTOMER
}

// ─── Ünvan ───────────────────────────────────────────────────
model Address {
  id         String  @id @default(cuid())
  userId     String
  title      String  // "Ev", "İş" və s.
  fullName   String
  phone      String
  city       String
  district   String
  street     String
  zipCode    String?
  isDefault  Boolean @default(false)

  user       User    @relation(fields: [userId], references: [id])
  orders     Order[]

  @@map("addresses")
}

// ─── Kateqoriya ──────────────────────────────────────────────
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  imageUrl    String?
  parentId    String?    // Alt kateqoriyalar üçün (xırda detallar)
  sortOrder   Int        @default(0)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())

  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]

  @@map("categories")
}

// ─── Məhsul ──────────────────────────────────────────────────
model Product {
  id              String         @id @default(cuid())
  name            String
  slug            String         @unique
  description     String?
  shortDesc       String?
  sku             String         @unique
  categoryId      String
  basePrice       Decimal        @db.Decimal(10, 2)
  salePrice       Decimal?       @db.Decimal(10, 2)
  costPrice       Decimal?       @db.Decimal(10, 2)
  weight          Float?         // kg
  dimensions      Json?          // { width, height, depth } cm
  material        String?
  isActive        Boolean        @default(true)
  isFeatured      Boolean        @default(false)
  hasVariants     Boolean        @default(false)
  metaTitle       String?
  metaDesc        String?
  tags            String[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  category        Category       @relation(fields: [categoryId], references: [id])
  images          ProductImage[]
  variants        ProductVariant[]
  attributes      ProductAttribute[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  reviews         Review[]

  @@map("products")
}

// ─── Məhsul Şəkilləri ─────────────────────────────────────────
model ProductImage {
  id         String  @id @default(cuid())
  productId  String
  url        String
  altText    String?
  sortOrder  Int     @default(0)
  isPrimary  Boolean @default(false)

  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

// ─── Variant Tipi (Rəng, Ölçü, Material...) ──────────────────
model AttributeType {
  id          String              @id @default(cuid())
  name        String              // "Rəng", "Ölçü", "Material"
  slug        String              @unique // "color", "size", "material"
  displayType AttributeDisplay    @default(TEXT)

  values      AttributeValue[]

  @@map("attribute_types")
}

enum AttributeDisplay {
  TEXT        // Yazı şəklində
  COLOR       // Rəng picker
  IMAGE       // Şəkil kimi
  BUTTON      // Düymə kimi
}

// ─── Variant Dəyərləri ────────────────────────────────────────
model AttributeValue {
  id              String         @id @default(cuid())
  attributeTypeId String
  value           String         // "Qırmızı", "XL", "Palıd"
  colorCode       String?        // #FF0000 (rəng üçün)
  imageUrl        String?        // rəng swatch şəkli
  sortOrder       Int            @default(0)

  attributeType   AttributeType  @relation(fields: [attributeTypeId], references: [id])
  variants        ProductVariant[] @relation("VariantAttributes")
  productAttr     ProductAttribute[]

  @@map("attribute_values")
}

// ─── Məhsul + Atribut əlaqəsi ────────────────────────────────
model ProductAttribute {
  id               String         @id @default(cuid())
  productId        String
  attributeValueId String

  product          Product        @relation(fields: [productId], references: [id])
  attributeValue   AttributeValue @relation(fields: [attributeValueId], references: [id])

  @@unique([productId, attributeValueId])
  @@map("product_attributes")
}

// ─── Məhsul Variantı (Rəng+Ölçü kombinasiyası) ───────────────
model ProductVariant {
  id            String           @id @default(cuid())
  productId     String
  sku           String           @unique
  price         Decimal?         @db.Decimal(10, 2) // null = base qiymət
  salePrice     Decimal?         @db.Decimal(10, 2)
  stock         Int              @default(0)
  imageUrl      String?          // Bu varianta aid xüsusi şəkil
  isActive      Boolean          @default(true)
  sortOrder     Int              @default(0)

  product       Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributes    AttributeValue[] @relation("VariantAttributes")
  orderItems    OrderItem[]
  cartItems     CartItem[]

  @@map("product_variants")
}

// ─── Sifariş ─────────────────────────────────────────────────
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique @default(cuid())
  userId          String?
  addressId       String?
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentMethod   String?
  subtotal        Decimal       @db.Decimal(10, 2)
  shippingCost    Decimal       @default(0) @db.Decimal(10, 2)
  discountAmount  Decimal       @default(0) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  notes           String?
  guestName       String?       // Qeydiyyatsız alış
  guestEmail      String?
  guestPhone      String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User?         @relation(fields: [userId], references: [id])
  address         Address?      @relation(fields: [addressId], references: [id])
  items           OrderItem[]

  @@map("orders")
}

enum OrderStatus {
  PENDING       // Gözləyir
  CONFIRMED     // Təsdiqləndi
  PROCESSING    // Hazırlanır
  SHIPPED       // Göndərildi
  DELIVERED     // Çatdırıldı
  CANCELLED     // Ləğv edildi
  RETURNED      // Qaytarıldı
}

enum PaymentStatus {
  UNPAID
  PAID
  PARTIAL
  REFUNDED
}

// ─── Sifariş Elementi ─────────────────────────────────────────
model OrderItem {
  id          String          @id @default(cuid())
  orderId     String
  productId   String
  variantId   String?
  name        String          // Snapshot — məhsul silinse belə qalsın
  sku         String
  imageUrl    String?
  price       Decimal         @db.Decimal(10, 2)
  quantity    Int
  total       Decimal         @db.Decimal(10, 2)

  order       Order           @relation(fields: [orderId], references: [id])
  product     Product         @relation(fields: [productId], references: [id])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])

  @@map("order_items")
}

// ─── Səbət ───────────────────────────────────────────────────
model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique
  sessionId String?    @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User?      @relation(fields: [userId], references: [id])
  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id         String          @id @default(cuid())
  cartId     String
  productId  String
  variantId  String?
  quantity   Int             @default(1)
  addedAt    DateTime        @default(now())

  cart       Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product    Product         @relation(fields: [productId], references: [id])
  variant    ProductVariant? @relation(fields: [variantId], references: [id])

  @@unique([cartId, productId, variantId])
  @@map("cart_items")
}

// ─── Rəylər ──────────────────────────────────────────────────
model Review {
  id         String   @id @default(cuid())
  productId  String
  userId     String?
  authorName String
  rating     Int      // 1-5
  comment    String?
  isApproved Boolean  @default(false)
  createdAt  DateTime @default(now())

  product    Product  @relation(fields: [productId], references: [id])

  @@map("reviews")
}
```

---

## 🔐 Auth & Rol Sistemi

```typescript
// Rollara görə icazələr
const PERMISSIONS = {
  ADMIN: ['*'],                              // Hər şeyə giriş
  MANAGER: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'categories:read', 'categories:write',
  ],
  CUSTOMER: [
    'orders:own:read',
    'profile:own:write',
    'cart:own:write',
  ]
}
```

- **Admin Panel** `/admin/*` — yalnız `ADMIN` və `MANAGER` rolu
- **Middleware** ilə hər route-u qoruyun
- Şifrələr **bcrypt** ilə hash edilməlidir (salt rounds: 12)
- JWT token 7 gün, refresh token 30 gün

---

## 🛍️ Variant Sistemi (Xırda Detallar Daxil)

### Variant Seçim Məntiqi

```typescript
// Rəng seçildikdə mövcud ölçüləri filtrələ
// Ölçü seçildikdə mövcud rəngləri filtrələ
// Variant mövcud deyilsə — "Stokda yoxdur" göstər

interface VariantMatrix {
  [colorId: string]: {
    [sizeId: string]: {
      variantId: string;
      stock: number;
      price: number;
      imageUrl?: string;
    }
  }
}
```

### Xırda Detal Kateqoriyaları üçün Xüsusi Davranış

- Vida, bolt, rəzə kimi məhsullar üçün **ədəd seçimi** (1, 10, 50, 100, 500)
- Toplu alış üçün **kəmiyyət endirimləri**
- **Minimal sifariş miqdarı** (MOQ) dəstəyi

---

## 🎨 UI/UX Standartları

### Dizayn Sistemi

```css
/*
 * Rəng Palitası — Nline Global loqosundan götürülüb
 *
 *  Loqo rəngləri:
 *    Dərin mavi    #1565C0  → primary
 *    Parlaq mavi   #2196F3  → accent / swoosh
 *    Qara-lacivert #1A1A2E  → dark mode fonu
 *    Boz           #607080  → muted text
 *
 *  Rejim:
 *    LIGHT — ağ fon, tünd mətn
 *    DARK  — #1A1A2E (loqo tündi) fon, açıq mətn
 */

/* ════════════════════════════════════════════════════
   LIGHT MODE  (default — :root)
════════════════════════════════════════════════════ */
:root {
  /* Əsas rənglər — hər iki rejimdə eyni qalır */
  --color-primary:        #1565C0;
  --color-primary-hover:  #0D47A1;
  --color-primary-light:  #E3F2FD;
  --color-accent:         #2196F3;
  --color-accent-hover:   #1976D2;

  /* Fon */
  --color-bg:             #FFFFFF;   /* Ağ                              */
  --color-surface:        #F4F7FB;   /* Kartlar — soyuq açıq            */
  --color-surface-2:      #EBF2FF;   /* İkinci səviyyə                  */

  /* Mətn */
  --color-text:           #0F172A;   /* Demək olar qara                 */
  --color-text-secondary: #334155;
  --color-muted:          #607080;
  --color-on-primary:     #FFFFFF;

  /* Border */
  --color-border:         #CBD5E1;
  --color-border-light:   #E2E8F0;
  --color-border-focus:   #1565C0;

  /* Status */
  --color-success:        #16A34A;
  --color-success-light:  #DCFCE7;
  --color-warning:        #D97706;
  --color-warning-light:  #FEF3C7;
  --color-error:          #DC2626;
  --color-error-light:    #FEE2E2;

  /* Admin sidebar — hər iki rejimdə tünd qalır */
  --color-admin-sidebar:        #1A1A2E;
  --color-admin-sidebar-active: #1565C0;
  --color-admin-header:         #FFFFFF;
  --color-admin-border:         #2D3A4F;
}

/* ════════════════════════════════════════════════════
   DARK MODE  (.dark class — <html class="dark">)
   Fon: loqonun öz #1A1A2E tündi
════════════════════════════════════════════════════ */
.dark {
  /* Əsas rənglər — bir az açılır ki, tünd fonda görünsün */
  --color-primary:        #2196F3;   /* Dark-da accent daha parlaq      */
  --color-primary-hover:  #42A5F5;
  --color-primary-light:  #1565C020; /* Şəffaf tünd badge               */
  --color-accent:         #64B5F6;
  --color-accent-hover:   #90CAF9;

  /* Fon — loqonun öz rəngləri */
  --color-bg:             #1A1A2E;   /* Loqo tündi — əsas fon           */
  --color-surface:        #16213E;   /* Kartlar — bir az tündlüyü var   */
  --color-surface-2:      #0D1B2A;   /* Ən dərin səth                   */

  /* Mətn — açıq, oxunaqlı */
  --color-text:           #F1F5F9;   /* Demək olar ağ                   */
  --color-text-secondary: #CBD5E1;
  --color-muted:          #94A3B8;
  --color-on-primary:     #FFFFFF;

  /* Border — görünən amma həddindən artıq deyil */
  --color-border:         #2D3A4F;
  --color-border-light:   #1E2D40;
  --color-border-focus:   #2196F3;

  /* Status — bir az açıq çalar */
  --color-success:        #22C55E;
  --color-success-light:  #16A34A20;
  --color-warning:        #F59E0B;
  --color-warning-light:  #D9770620;
  --color-error:          #F87171;
  --color-error-light:    #DC262620;

  /* Admin sidebar — dark-da daha da tündləşir */
  --color-admin-sidebar:        #0D1117;
  --color-admin-sidebar-active: #2196F3;
  --color-admin-header:         #16213E;
  --color-admin-border:         #1E2D40;
}

/* Tipografiya — hər iki rejimdə eyni */
:root, .dark {
  --font-display:  'Plus Jakarta Sans', sans-serif;
  --font-body:     'Inter', sans-serif;
  --font-mono:     'JetBrains Mono', monospace;
}

/*
 * Google Fonts import (layout.tsx-ə əlavə et):
 * import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
 * const inter   = Inter({ subsets: ['latin'], variable: '--font-body' })
 * const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
 */
```

### Dark Mode Toggle — İmplementasiya

```typescript
// providers/ThemeProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Sistem seçimini oxu, sonra localStorage-i yoxla
    const saved = localStorage.getItem('theme') as Theme | null
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initial = saved ?? system
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

```typescript
// components/layout/ThemeToggle.tsx
'use client'
import { useTheme } from '@/providers/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Tema dəyiş"
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
```

```typescript
// app/layout.tsx — ThemeProvider-i bura qoş
import { ThemeProvider } from '@/providers/ThemeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```css
/* app/globals.css — bütün elementlər CSS variable-lardan rəng alsın */
* { box-sizing: border-box; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Kart komponenti üçün base stil */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
}
```

---

### Tailwind Konfiqurasiyası (loqo rəngləri ilə)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class', // <html class="dark"> ilə toggle
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          hover:   '#0D47A1',
          light:   '#E3F2FD',
        },
        accent: {
          DEFAULT: '#2196F3',
          hover:   '#1976D2',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          2:       '#16213E',
        },
        surface: {
          DEFAULT: '#F4F7FB',
          2:       '#EBF2FF',
        },
        nline: {
          // Loqodan birbaşa götürülmüş
          'blue-deep':   '#1565C0',
          'blue-bright': '#2196F3',
          'dark':        '#1A1A2E',
          'gray':        '#607080',
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(21,101,192,0.08), 0 1px 2px rgba(21,101,192,0.06)',
        'card-lg': '0 10px 30px rgba(21,101,192,0.12)',
        'primary': '0 4px 14px rgba(21,101,192,0.35)',
      }
    },
  },
  plugins: [],
}
export default config
```

### Responsiv Breakpoint-lər

```
mobile:   < 640px   (tək sütun, aşağı naviqasiya)
tablet:   640-1024px (2 sütun grid)
desktop:  > 1024px  (3-4 sütun grid, yan filterlər)
```

---

## ⚙️ Admin Panel Funksionallığı

### Dashboard

- [ ] Bugünkü / aylıq / illik satış statistikası
- [ ] Son sifarişlər cədvəli (real-time)
- [ ] Stoku azalan məhsullar xəbərdarlığı (< 5 ədəd)
- [ ] Populyar məhsullar sıralması
- [ ] Gəlir qrafiki (recharts ilə)

### Məhsul İdarəetməsi

- [ ] Məhsul əlavə / düzəliş / silmə
- [ ] **Bulk əməliyyatlar** (çoxlu seçim, toplu qiymət dəyişikliyi)
- [ ] Çoxlu şəkil yükləmə (drag & drop, R2 presigned URL)
- [ ] Variant matrisi redaktoru (rəng × ölçü)
- [ ] Stok idarəetməsi (variant səviyyəsində)
- [ ] CSV import/export
- [ ] SEO sahələri (meta title, description, slug)

### Sifariş İdarəetməsi

- [ ] Sifariş statusunu dəyişdirmə
- [ ] Faktura çapı (PDF)
- [ ] Sifariş detalı (müştəri, ünvan, məhsullar)
- [ ] Filtrləmə: status, tarix, ödəniş növü

### Kateqoriya İdarəetməsi

- [ ] Drag & drop ilə kateqoriya sıralaması
- [ ] Alt kateqoriya yaratma (ağac strukturu)
- [ ] Kateqoriya şəkli yükləmə

---

## 🔧 API Endpoint-ləri

### Public API

```
GET    /api/products                    # Siyahı (filtr + səhifə)
GET    /api/products/:slug              # Tək məhsul + variantlar
GET    /api/categories                  # Kateqoriya ağacı
GET    /api/products/:id/variants       # Variantlar matrisi
POST   /api/cart                        # Səbətə əlavə
GET    /api/cart                        # Səbəti al
PATCH  /api/cart/:itemId               # Miqdar dəyiş
DELETE /api/cart/:itemId               # Sil
POST   /api/orders                      # Sifariş yarat
GET    /api/orders/:id                  # Sifariş statusu
```

### Admin API (Qorunan)

```
GET    /api/admin/dashboard/stats
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/:id/images
POST   /api/admin/products/bulk-update
GET    /api/admin/orders
PATCH  /api/admin/orders/:id/status
GET    /api/admin/customers
GET    /api/admin/analytics/sales
```

### Filtrasiya Parametrləri

```
GET /api/products?
  category=living-room
  &minPrice=10
  &maxPrice=500
  &colors=red,blue
  &sizes=s,m,l
  &inStock=true
  &sort=price_asc|price_desc|newest|popular
  &page=1
  &limit=24
```

---

## 🧪 Kod Standartları

### TypeScript

- Bütün interfeyslər `/types/index.ts` faylında
- `any` istifadəsi **qadağandır**
- Hər API response üçün Zod validation

```typescript
// Nümunə: Product service
export class ProductService {
  static async findBySlug(slug: string): Promise<ProductWithVariants | null> {
    return prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: { attributes: { include: { attributeType: true } } }
        },
        category: true,
      }
    });
  }
}
```

### Komponent Strukturu

```typescript
// Hər komponent üçün:
// 1. Props interfeysi
// 2. Default export
// 3. Named export-lar (hook-lar)

interface ProductCardProps {
  product: ProductSummary;
  onAddToCart?: (variantId: string) => void;
  className?: string;
}

export default function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  // ...
}
```

### Error Handling

```typescript
// API route-larda
try {
  // ...
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu dəyər artıq mövcuddur' }, { status: 409 });
    }
  }
  console.error('[API Error]:', error);
  return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
}
```

---

## 🚀 Performans Tələbləri

- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Məhsul siyahısı: ISR (Incremental Static Regeneration) — hər 60 dəq
- [ ] Şəkillər: Next.js `<Image>` komponenti, WebP format, lazy loading
- [ ] Database: `categoryId`, `slug`, `status` sütunlarında **index**
- [ ] Səbət: `sessionId` ilə qeydiyyatsız istifadəçi dəstəyi
- [ ] API: Rate limiting (100 req/min per IP)

---

## 🌐 SEO

- [ ] Dinamik `metadata` hər məhsul səhifəsi üçün
- [ ] `sitemap.xml` auto-generate
- [ ] `robots.txt`
- [ ] Structured Data (JSON-LD: Product, BreadcrumbList)
- [ ] Open Graph şəkilləri

---

## 📦 Deployment Addımları

```bash
# 1. Mühit dəyişənləri
DATABASE_URL="postgresql://user:pass@host:5432/furniture_db"
NEXTAUTH_SECRET="super-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
CF_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret"
R2_BUCKET_NAME="furniture-media"
R2_PUBLIC_URL="https://media.yourdomain.com"

# 2. Database migrate
npx prisma migrate deploy
npx prisma db seed

# 3. Build
npm run build

# 4. Admin istifadəçi yarat (seed)
npx ts-node prisma/seed.ts
```

---

## 🗓️ İnkişaf Mərhələləri

### Faza 1 — Əsas (2 həftə)
- [ ] DB sxemi + Prisma setup
- [ ] Auth sistemi (login/register/admin)
- [ ] Kateqoriya CRUD
- [ ] Məhsul CRUD (variant daxil)
- [ ] Şəkil yükləmə (Cloudflare R2)

### Faza 2 — Mağaza (2 həftə)
- [ ] Ana səhifə (hero, featured, categories)
- [ ] Məhsul siyahısı + filtr + axtarış
- [ ] Məhsul detalı (variant seçim + rəng picker)
- [ ] Səbət + Checkout
- [ ] Sifariş yaratma

### Faza 3 — Admin Panel (1 həftə)
- [ ] Dashboard statistikaları
- [ ] Sifariş idarəetməsi
- [ ] Müştəri siyahısı

### Faza 4 — Polishing (1 həftə)
- [ ] SEO optimizasiya
- [ ] Performans testi
- [ ] Responsiv test (mobile/tablet)
- [ ] Deploy + domain

---

## 💡 Claude üçün Xüsusi Qaydalar

> Bu qaydaları hər yeni context-də oxu.

1. **Variant məntiqi** — Hər zaman `ProductVariant` cədvəlini istifadə et. Variantsız məhsul üçün də boş variant yox, `hasVariants: false` flag-i istifadə et.

2. **Qiymət məntiqi** — Variantın `price` null-dırsa, `Product.basePrice` istifadə et. Ekranda həmişə effektiv qiymət göstər: `effectivePrice = variant.salePrice ?? variant.price ?? product.salePrice ?? product.basePrice`

3. **Stok yoxlaması** — Sifariş zamanı transaction-da stoku yoxla və azalt. Race condition-u önləmək üçün `SELECT ... FOR UPDATE` istifadə et.

4. **Şəkil yükləmə** — `uploadImageToR2()` funksiyasını istifadə et. DB-yə `url` və `key` saxla (`key` silmək üçün lazımdır). Şəkil silinəndə `deleteFromR2(key)` çağır.

5. **Slug generasiyası** — Azərbaycan dilindəki hərfləri (ə→e, ş→s, ğ→g, ü→u, ö→o, ı→i, ç→c) dəyiş, sonra slugify et.

6. **Admin route qoruması** — `middleware.ts`-də `/admin/*` route-larını yoxla. Client-side yoxlama yetərli deyil.

7. **Xırda detal kateqoriyaları** — `Category.parentId` null olmayan kateqoriyalar alt kateqoriyadır. UI-da accordion/tree şəklində göstər.

8. **Hər commit-dən əvvəl** — `npm run type-check && npm run lint` işlət.

9. **Dark/Light mode** — Heç vaxt `bg-white` və ya `text-black` kimi hard-coded Tailwind rəng class-ları istifadə etmə. Həmişə CSS variable-lardan istifadə et: `bg-[var(--color-bg)]`, `text-[var(--color-text)]`. Komponentlər hər iki rejimdə avtomatik düzgün görünməlidir.

10. **Dark mode testi** — Hər yeni komponent yazılanda `<html class="dark">` ilə yoxla. Light: ağ fon + tünd mətn. Dark: `#1A1A2E` fon (loqo rəngi) + açıq mətn.
