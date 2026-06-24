import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/server-auth'
import { ProfileForm } from './_components/ProfileForm'
import { LogoutButton } from './_components/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  })

  if (!fullUser) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Profil
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Şəxsi məlumatlarınızı yeniləyin
        </p>
      </div>

      <ProfileForm
        initial={{
          name: fullUser.name ?? '',
          email: fullUser.email,
          phone: fullUser.phone ?? '',
        }}
      />

      <div className="card p-5 shadow-card">
        <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
          Sessiya
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Sessiyadan çıxın və başqa hesabla daxil olun.
        </p>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
