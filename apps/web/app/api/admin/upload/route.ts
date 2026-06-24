// Admin: şəkil yükləmə R2-yə
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImageToR2, type UploadFolder } from '@/lib/r2-upload'

const ALLOWED_FOLDERS: UploadFolder[] = ['products', 'categories', 'variants']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const folderRaw = (formData.get('folder') as string) || 'products'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fayl tapılmadı' }, { status: 400 })
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: 'Yalnız JPEG, PNG, WebP və ya GIF qəbul olunur' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fayl ölçüsü 10MB-dan böyük olmamalıdır' },
        { status: 400 }
      )
    }

    const folder: UploadFolder = ALLOWED_FOLDERS.includes(folderRaw as UploadFolder)
      ? (folderRaw as UploadFolder)
      : 'products'

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadImageToR2(buffer, file.type, folder)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[upload]:', error)
    return NextResponse.json({ error: 'Yükləmə alınmadı' }, { status: 500 })
  }
}
