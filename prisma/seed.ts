// Seed — admin istifadəçi və nümunə kateqoriyalar
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed başlayır...')

  // Admin istifadəçi
  const adminEmail = 'admin@nlineglobal.az'
  const adminPassword = 'Admin123!'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrator',
      passwordHash,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin: ${admin.email} / ${adminPassword}`)

  // Kök kateqoriyalar
  const categories = [
    { name: 'Yataq otağı', slug: 'yataq-otagi', sortOrder: 1 },
    { name: 'Qonaq otağı', slug: 'qonaq-otagi', sortOrder: 2 },
    { name: 'Mətbəx', slug: 'metbex', sortOrder: 3 },
    { name: 'Ofis', slug: 'ofis', sortOrder: 4 },
    { name: 'Xırda detallar', slug: 'xirda-detallar', sortOrder: 5 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ ${categories.length} kateqoriya yaradıldı`)

  // Atribut tipləri
  const colorType = await prisma.attributeType.upsert({
    where: { slug: 'color' },
    update: {},
    create: { name: 'Rəng', slug: 'color', displayType: 'COLOR' },
  })

  const sizeType = await prisma.attributeType.upsert({
    where: { slug: 'size' },
    update: {},
    create: { name: 'Ölçü', slug: 'size', displayType: 'BUTTON' },
  })

  await prisma.attributeType.upsert({
    where: { slug: 'material' },
    update: {},
    create: { name: 'Material', slug: 'material', displayType: 'TEXT' },
  })

  // Rəng dəyərləri
  const colors = [
    { value: 'Qara', colorCode: '#000000' },
    { value: 'Ağ', colorCode: '#FFFFFF' },
    { value: 'Boz', colorCode: '#808080' },
    { value: 'Qəhvəyi', colorCode: '#6B4423' },
    { value: 'Mavi', colorCode: '#1565C0' },
  ]
  for (const c of colors) {
    const exists = await prisma.attributeValue.findFirst({
      where: { attributeTypeId: colorType.id, value: c.value },
    })
    if (!exists) {
      await prisma.attributeValue.create({
        data: { ...c, attributeTypeId: colorType.id },
      })
    }
  }

  // Ölçü dəyərləri
  const sizes = ['S', 'M', 'L', 'XL']
  for (const s of sizes) {
    const exists = await prisma.attributeValue.findFirst({
      where: { attributeTypeId: sizeType.id, value: s },
    })
    if (!exists) {
      await prisma.attributeValue.create({
        data: { value: s, attributeTypeId: sizeType.id },
      })
    }
  }

  console.log('✅ Atribut tipləri və dəyərləri yaradıldı')
  console.log('🎉 Seed tamamlandı!')
}

main()
  .catch((e) => {
    console.error('❌ Seed xətası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
