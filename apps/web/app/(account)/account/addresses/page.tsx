import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/server-auth'
import { AddressList } from './_components/AddressList'

export const dynamic = 'force-dynamic'

export default async function MyAddressesPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Ünvanlarım
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Çatdırılma üçün saxlanmış ünvanlar
        </p>
      </div>

      <AddressList
        initial={addresses.map((a) => ({
          id: a.id,
          title: a.title,
          fullName: a.fullName,
          phone: a.phone,
          city: a.city,
          district: a.district,
          street: a.street,
          zipCode: a.zipCode,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  )
}
