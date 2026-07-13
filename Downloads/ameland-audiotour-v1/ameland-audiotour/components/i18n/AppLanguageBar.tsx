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
    <header className="relative z-50 border-b border-[#dfe3e2] bg-white text-[#082f3e]">
      <div className="mx-auto flex min-h-[82px] w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a href={`/?lang=${current}`} aria-label="Ameland Audiotours home" className="inline-flex min-w-0 items-center gap-3 no-underline">
          <Image
            src="/images/ameland-audiotours-logo.webp"
            alt="Ameland Audiotours"
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full border border-[#0b3443]/20 object-cover"
            priority
          />
          <span className="min-w-0 leading-none text-[#082f3e]">
            <span className="block font-serif text-lg font-medium tracking-[.08em] sm:text-2xl">AMELAND</span>
            <span className="mt-1 block text-[9px] tracking-[.22em] sm:text-xs">AUDIOTOURS</span>
          </span>
        </a>

        <nav
          aria-label="Taal kiezen"
          className="flex items-center rounded-full border border-[#d8d0c2] bg-[#f8f4eb] p-1"
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
                    ? 'bg-[#003b4d] text-white'
                    : 'text-[#53635a] hover:bg-white hover:text-[#082f3e]'
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
