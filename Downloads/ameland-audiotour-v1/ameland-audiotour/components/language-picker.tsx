'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  APP_LANGUAGE_COOKIE,
  APP_LANGUAGE_STORAGE_KEY,
  AppLanguage,
} from '@/lib/app-language'

const options: Array<{ code: AppLanguage; label: string }> = [
  { code: 'nl', label: 'NL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
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
    <div className="flex items-center gap-2 rounded-full border border-[#d8e9ea] bg-[#f7ffff] p-1">
      {options.map((option) => {
        const active = language === option.code

        return (
          <button
            key={option.code}
            onClick={() => changeLanguage(option.code)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.08em] transition ${
              active
                ? 'bg-[#0f4b58] text-white'
                : 'text-[#2b5a64] hover:bg-white'
            }`}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}