import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PixelScripts } from '@/components/tracking/PixelScripts'
import { PageTracker } from '@/components/tracking/PageTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoWaay - Find Your Perfect Stay',
  description: 'Discover amazing rooms and experiences. Book your perfect stay with GoWaay.',
  keywords: 'hotel booking, room rental, accommodation, travel, stay',
  authors: [{ name: 'GoWaay' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ff385c',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <PixelScripts />
        <PageTracker />
      </body>
    </html>
  )
}
