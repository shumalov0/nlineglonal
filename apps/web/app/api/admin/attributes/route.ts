// Admin: bütün atribut tipləri və dəyərləri
// VariantSelector / VariantMatrix komponentləri üçün lazımdır
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const types = await prisma.attributeType.findMany({
      include: {
        values: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: types })
  } catch (error) {
    return handleApiError(error)
  }
}
