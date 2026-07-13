'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type Lang = 'nl' | 'de' | 'en'

const languages: Array<{ code: Lang; label: string }> = [
  { code: 'nl', label: 'NL' },
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
]

function getCurrentLang(): Lang {
  if (typeof window === 'undefined') return 'nl'

  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('lang')
  const stored = window.localStorage.getItem('ameland-audiotours-language')

  if (fromUrl === 'de' || fromUrl === 'en' || fromUrl === 'nl') return fromUrl
  if (stored === 'de' || stored === 'en' || stored === 'nl') return stored
  return 'nl'
}

export default function AppLanguageBar() {
  const pathname = usePathname() || '/'
  const [current, setCurrent] = useState<Lang>('nl')
  const home = pathname === '/'

  useEffect(() => {
    setCurrent(getCurrentLang())
  }, [pathname])

  function setLang(lang: Lang) {
    setCurrent(lang)
    document.documentElement.lang = lang
    window.localStorage.setItem('ameland-audiotours-language', lang)
    document.cookie = `ameland-audiotours-language=${lang}; path=/; max-age=31536000; SameSite=Lax`
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`
    window.dispatchEvent(new CustomEvent('app-language-change', { detail: { language: lang } }))

    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    window.location.assign(url.toString())
  }

  return (
    <header
      className={home ? 'absolute inset-x-0 top-0 z-50 text-white' : 'relative z-50 text-[#20372f]'}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pb-3 pt-[max(1.1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
        <a href={`/?lang=${current}`} aria-label="Ameland Audiotours home" className="inline-flex min-w-0 items-center gap-3 no-underline">
          <Image
            src="/images/ameland-audiotours-logo.webp"
            alt="Ameland Audiotours"
            width={48}
            height={48}
            className="h-11 w-11 shrink-0 rounded-full border border-white/30 object-cover shadow-xl"
            priority
          />
          <span className={`min-w-0 text-sm font-black tracking-tight sm:text-base ${home ? 'text-white' : 'text-[#20372f]'}`}>
            Ameland Audiotours
          </span>
        </a>

        <nav
          aria-label="Taal kiezen"
          className={`flex items-center rounded-full border p-1 shadow-lg backdrop-blur-xl ${
            home
              ? 'border-white/20 bg-slate-950/30'
              : 'border-[#ddd4c4] bg-[#fffdf8]/95'
          }`}
        >
          {languages.map((lang) => {
            const active = lang.code === current
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLang(lang.code)}
                aria-pressed={active}
                className={`grid h-9 min-w-10 place-items-center rounded-full px-3 text-xs font-black transition ${
                  active
                    ? home
                      ? 'bg-white text-slate-950'
                      : 'bg-[#153f45] text-white'
                    : home
                    ? 'text-white/75 hover:bg-white/10 hover:text-white'
                    : 'text-[#53635a] hover:bg-[#efe8dc] hover:text-[#20372f]'
                }`}
              >
                {lang.label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export { AppLanguageBar }
