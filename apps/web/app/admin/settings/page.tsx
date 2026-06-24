import { prisma } from '@/lib/db'
import { SettingsForm } from './_components/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const row = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Tənzimləmələr
        </h2>
        <p className="text-[var(--color-muted)]">
          Əlaqə nömrələri və sosial media linkləri — saytda hər yerdə istifadə olunur
        </p>
      </div>

      <SettingsForm
        initial={{
          storeName: row?.storeName ?? 'Nline Global',
          phoneNumber: row?.phoneNumber ?? '',
          whatsappNumber: row?.whatsappNumber ?? '',
          email: row?.email ?? '',
          address: row?.address ?? '',
          instagramUrl: row?.instagramUrl ?? '',
          facebookUrl: row?.facebookUrl ?? '',
          tiktokUrl: row?.tiktokUrl ?? '',
          youtubeUrl: row?.youtubeUrl ?? '',
        }}
      />
    </div>
  )
}
