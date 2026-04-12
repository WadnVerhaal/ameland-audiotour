'use client'

import { useEffect } from 'react'
import {
  APP_LANGUAGE_COOKIE,
  APP_LANGUAGE_STORAGE_KEY,
  isAppLanguage,
} from '@/lib/app-language'

export function LanguageParamSync({ lang }: { lang: string | undefined }) {
  useEffect(() => {
    if (!isAppLanguage(lang)) return

    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, lang)
    document.cookie = `${APP_LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
  }, [lang])

  return null
}