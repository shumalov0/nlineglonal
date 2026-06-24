// R2 upload helper-ləri
import {
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { r2, R2_BUCKET, R2_PUBLIC_URL, assertR2Configured } from './r2'

export type UploadFolder = 'products' | 'categories' | 'variants'

export interface UploadResult {
  url: string
  key: string
}

export async function uploadImageToR2(
  file: Buffer,
  contentType: string,
  folder: UploadFolder = 'products'
): Promise<UploadResult> {
  assertR2Configured()
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `${folder}/${randomUUID()}.${ext}`

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    })
  )

  return { key, url: `${R2_PUBLIC_URL}/${key}` }
}

// Böyük fayllar üçün — client birbaşa R2-yə yükləsin
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  assertR2Configured()
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  )
}

export async function deleteFromR2(key: string): Promise<void> {
  assertR2Configured()
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  )
}
