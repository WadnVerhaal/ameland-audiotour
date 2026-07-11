'use client'

import { useEffect, useState } from 'react'
import { APP_LANGUAGE_STORAGE_KEY, AppLanguage, isAppLanguage, languages } from '@/lib/i18n/translations'
import { useLanguage } from './LanguageProvider'

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage()
  const [isReady, setIsReady] = useState(false)
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlLanguage = params.get('lang')
    const storedLanguage = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY)

    if (isAppLanguage(urlLanguage)) {
      setLanguage(urlLanguage)
      setHasChosenLanguage(true)
      setIsReady(true)
      return
    }

    if (isAppLanguage(storedLanguage)) {
      setHasChosenLanguage(true)
      setIsReady(true)
      return
    }

    setHasChosenLanguage(false)
    setIsReady(true)
  }, [setLanguage])

  function chooseLanguage(nextLanguage: AppLanguage) {
    setLanguage(nextLanguage)
    setHasChosenLanguage(true)
  }

  if (!isReady) {
    return null
  }

  if (hasChosenLanguage) {
    return <>{children}</>
  }

  return (
    <main className="min-h-screen bg-[#f3eee4] px-5 py-8 text-stone-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-stone-900/10 backdrop-blur">
          <div className="bg-gradient-to-br from-stone-950 via-stone-800 to-[#32463d] px-6 py-8 text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              {t.appName}
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              {t.chooseLanguage}
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
              {t.chooseLanguageSubtitle}
            </p>
          </div>

          <div className="grid gap-3 p-5">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => chooseLanguage(item.code)}
                className={[
                  'flex items-center justify-between rounded-2xl border px-4 py-4 text-left shadow-sm transition',
                  item.code === language
                    ? 'border-stone-950 bg-stone-950 text-white'
                    : 'border-stone-200 bg-white text-stone-950 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md',
                ].join(' ')}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{item.flag}</span>
                  <span>
                    <span className="block text-base font-semibold">
                      {item.label}
                    </span>
                    <span
                      className={[
                        'block text-xs',
                        item.code === language ? 'text-white/60' : 'text-stone-500',
                      ].join(' ')}
                    >
                      {item.shortLabel}
                    </span>
                  </span>
                </span>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    item.code === language
                      ? 'bg-white text-stone-950'
                      : 'bg-stone-950 text-white',
                  ].join(' ')}
                >
                  {t.continue}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
