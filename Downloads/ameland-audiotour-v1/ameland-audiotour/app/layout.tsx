import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppLanguageBar from '@/components/i18n/AppLanguageBar'
import AppAutoTranslator from '@/components/i18n/AppAutoTranslator'
import { SkipperHiddeChat } from '@/components/support/skipper-hidde-chat'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>
        <AppLanguageBar />
        <AppAutoTranslator />
        {children}
        <SkipperHiddeChat />
      </body>
    </html>
  )
}
