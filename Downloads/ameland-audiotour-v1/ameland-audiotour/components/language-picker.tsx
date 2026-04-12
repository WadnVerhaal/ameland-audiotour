'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  APP_LANGUAGE_COOKIE,
  APP_LANGUAGE_STORAGE_KEY,
  AppLanguage,
} from '@/lib/app-language'

const options: Array<{ code: AppLanguage; flag: string; label: string }> = [
  { code: 'nl', flag: '🇳🇱', label: 'NL' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
]

export function LanguagePicker({
  currentLanguage,
}: {
  currentLanguage: AppLanguage
}) {
  const [language, setLanguage] = useState<AppLanguage>(currentLanguage)
  const router = useRouter()

  useEffect(() => {
    setLanguage(currentLanguage)
  }, [currentLanguage])

  function changeLanguage(nextLanguage: AppLanguage) {
    setLanguage(nextLanguage)
    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, nextLanguage)
    document.cookie = `${APP_LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 p-1 shadow-card">
      {options.map((option) => (
        <button
          key={option.code}
          onClick={() => changeLanguage(option.code)}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            language === option.code
              ? 'bg-app-accent text-white'
              : 'text-app-accent hover:bg-app-soft'
          }`}
        >
          <span>{option.flag}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}