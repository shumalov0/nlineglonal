// Cloudflare R2 client — AWS S3 SDK uyğunluğu ilə
import { S3Client } from '@aws-sdk/client-s3'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} mühit dəyişəni təyin edilməyib`)
  }
  return value
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
})

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? ''
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? ''

export function assertR2Configured(): void {
  requireEnv('CF_ACCOUNT_ID')
  requireEnv('R2_ACCESS_KEY_ID')
  requireEnv('R2_SECRET_ACCESS_KEY')
  requireEnv('R2_BUCKET_NAME')
  requireEnv('R2_PUBLIC_URL')
}
