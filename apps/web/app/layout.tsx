import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Nline Global — Mebel E-Commerce',
    template: '%s | Nline Global',
  },
  description: 'Keyfiyyətli mebel və xırda detallar — geniş çeşid, sərfəli qiymətlər.',
  keywords: ['mebel', 'mobilya', 'furniture', 'nline global', 'azerbaycan'],
  authors: [{ name: 'Nline Global' }],
  creator: 'Nline Global',
  openGraph: {
    type: 'website',
    locale: 'az_AZ',
    siteName: 'Nline Global',
    title: 'Nline Global — Mebel E-Commerce',
    description: 'Keyfiyyətli mebel və xırda detallar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nline Global',
    description: 'Keyfiyyətli mebel və xırda detallar.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
