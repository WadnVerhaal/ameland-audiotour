'use client'

import { usePathname } from 'next/navigation'
import AppLanguageBar from '@/components/i18n/AppLanguageBar'
import { SkipperHiddeChat } from '@/components/support/skipper-hidde-chat'

export default function AppChrome() {
  const pathname = usePathname() || '/'

  const immersive =
    pathname.startsWith('/player/') ||
    pathname.startsWith('/bedankt') ||
    pathname.startsWith('/admin')

  const focusedCheckout = pathname.startsWith('/checkout/')

  return (
    <>
      {!immersive ? <AppLanguageBar /> : null}
      {!immersive && !focusedCheckout ? <SkipperHiddeChat /> : null}
    </>
  )
}
