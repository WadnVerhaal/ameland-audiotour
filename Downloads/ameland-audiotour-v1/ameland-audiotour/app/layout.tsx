import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppChrome from '@/components/app/AppChrome'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Ameland Audiotours',
  description: 'Audiotours op Ameland',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const storedLanguage = cookieStore.get('ameland-audiotours-language')?.value
  const language = storedLanguage === 'en' || storedLanguage === 'de' ? storedLanguage : 'nl'

  return (
    <html lang={language}>
      <body>
        <AppChrome />
        {children}
      </body>
    </html>
  )
}
