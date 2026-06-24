// Yeni istifadəçi qeydiyyatı
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { applyRateLimit } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email('Email düzgün deyil'),
  password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit: IP başına 5 register cəhdi / 15 dəq
  const rl = applyRateLimit(req, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    key: 'register',
  })
  if (rl) return rl

  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation xətası', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, name, phone } = parsed.data
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        phone,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Bu email artıq qeydiyyatdan keçib' },
          { status: 409 }
        )
      }
    }
    console.error('[register]:', error)
    return NextResponse.json({ error: 'Server xətası' }, { status: 500 })
  }
}
