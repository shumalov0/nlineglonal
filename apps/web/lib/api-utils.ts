// API route-lar üçün ümumi köməkçilər
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation xətası', details: error.flatten() },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field =
        Array.isArray(error.meta?.target)
          ? (error.meta?.target as string[]).join(', ')
          : 'sahə'
      return NextResponse.json(
        { error: `Bu ${field} artıq mövcuddur` },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Tapılmadı' },
        { status: 404 }
      )
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Bağlı qeyd mövcuddur — əvvəlcə onu silin' },
        { status: 409 }
      )
    }
  }

  console.error('[API Error]:', error)
  return NextResponse.json({ error: 'Server xətası' }, { status: 500 })
}
