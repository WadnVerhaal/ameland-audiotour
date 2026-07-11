'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  getTranslation,
  isAppLanguage,
} from '@/lib/i18n/translations'

type LanguageContextValue = {
  language: AppLanguage
  hasChosenLanguage: boolean
  setLanguage: (language: AppLanguage) => void
  t: ReturnType<typeof getTranslation>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LANGUAGE_KEYS = [
  'ameland-audiotours-language',
  'amelandaudiotours-language',
]

const CHOSEN_KEYS = [
  'ameland-audiotours-language-chosen',
  'amelandaudiotours-language-chosen',
]

function readCookie(name: string) {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))

  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function writeLanguageEverywhere(language: AppLanguage) {
  if (typeof window === 'undefined') return

  for (const key of LANGUAGE_KEYS) {
    window.localStorage.setItem(key, language)
    document.cookie = `${key}=${language}; path=/; max-age=31536000; SameSite=Lax`
  }

  for (const key of CHOSEN_KEYS) {
    window.localStorage.setItem(key, 'true')
    document.cookie = `${key}=true; path=/; max-age=31536000; SameSite=Lax`
  }

  document.documentElement.lang = language
}

function readInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const urlLanguage = new URLSearchParams(window.location.search).get('lang')
  if (isAppLanguage(urlLanguage)) return urlLanguage

  for (const key of LANGUAGE_KEYS) {
    const stored = window.localStorage.getItem(key)
    if (isAppLanguage(stored)) return stored

    const cookie = readCookie(key)
    if (isAppLanguage(cookie)) return cookie
  }

  return DEFAULT_LANGUAGE
}

function readHasChosenLanguage() {
  if (typeof window === 'undefined') return false

  const urlLanguage = new URLSearchParams(window.location.search).get('lang')
  if (isAppLanguage(urlLanguage)) return true

  for (const key of CHOSEN_KEYS) {
    if (window.localStorage.getItem(key) === 'true') return true
    if (readCookie(key) === 'true') return true
  }

  for (const key of LANGUAGE_KEYS) {
    if (isAppLanguage(window.localStorage.getItem(key))) return true
    if (isAppLanguage(readCookie(key))) return true
  }

  return false
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE)
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false)

  useEffect(() => {
    const initialLanguage = readInitialLanguage()
    const chosen = readHasChosenLanguage()

    setLanguageState(initialLanguage)
    setHasChosenLanguage(chosen)

    if (chosen) {
      writeLanguageEverywhere(initialLanguage)
    }
  }, [])

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage)
    setHasChosenLanguage(true)
    writeLanguageEverywhere(nextLanguage)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ameland-language-change', { detail: nextLanguage })
      )
    }
  }, [])

  const value = useMemo(
    () => ({
      language,
      hasChosenLanguage,
      setLanguage,
      t: getTranslation(language),
    }),
    [language, hasChosenLanguage, setLanguage]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
