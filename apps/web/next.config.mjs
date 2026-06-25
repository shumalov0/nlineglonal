/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Şəkillər onsuz da Cloudflare R2 CDN-dən gəlir — Vercel optimizasiyasını söndür
    // (Vercel image transformation limitini doldurmamaq üçün)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'media.nlineglobal.az',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mebaks.az',
      },
    ],
  },
  experimental: {
    // Neon WebSocket adapter-ini Next.js bundle etməsin
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@prisma/adapter-neon',
      '@neondatabase/serverless',
      'ws',
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
