export const dynamic = 'force-dynamic'
export const revalidate = 0

import './globals.css'
import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Ameland Audiotours",
  description: 'Ontdek Ameland met verhalen in je oor.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-app text-app">{children}</body>
    </html>
  )
}
