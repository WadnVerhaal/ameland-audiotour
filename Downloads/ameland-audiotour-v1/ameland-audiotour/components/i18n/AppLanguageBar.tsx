'use client'

import { useEffect, useState } from 'react'

type Lang = 'nl' | 'de' | 'en'

const languages: Array<{ code: Lang; label: string; flag: string }> = [
  { code: 'nl', label: 'NL', flag: '🇳🇱' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]

function getCurrentLang(): Lang {
  if (typeof window === 'undefined') return 'nl'

  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('lang')
  const stored =
    window.localStorage.getItem('ameland-audiotours-language') ||
    window.localStorage.getItem('wadnverhaal-language')

  if (fromUrl === 'de' || fromUrl === 'en' || fromUrl === 'nl') return fromUrl
  if (stored === 'de' || stored === 'en' || stored === 'nl') return stored
  return 'nl'
}

export default function AppLanguageBar() {
  const [current, setCurrent] = useState<Lang>('nl')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const path = window.location.pathname
    setHidden(path.startsWith('/player/'))
    setCurrent(getCurrentLang())
  }, [])

  function setLang(lang: Lang) {
    setCurrent(lang)
    document.documentElement.lang = lang

    window.localStorage.setItem('ameland-audiotours-language', lang)
    window.localStorage.setItem('wadnverhaal-language', lang)

    document.cookie = `ameland-audiotours-language=${lang}; path=/; max-age=31536000; SameSite=Lax`
    document.cookie = `wadnverhaal-language=${lang}; path=/; max-age=31536000; SameSite=Lax`
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`

    window.dispatchEvent(new CustomEvent('app-language-change', { detail: { language: lang } }))

    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    window.location.assign(url.toString())
  }

  if (hidden) return null

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        padding: '14px 14px 0',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 999,
            border: '1px solid #ddd4c4',
            background: 'rgba(255,253,248,0.96)',
            padding: 4,
            boxShadow: '0 12px 30px rgba(31,39,32,0.10)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {languages.map((lang) => {
            const active = lang.code === current

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLang(lang.code)}
                aria-pressed={active}
                style={{
                  height: 36,
                  minWidth: 62,
                  border: 0,
                  borderRadius: 999,
                  background: active ? '#111b17' : 'transparent',
                  color: active ? '#fff' : '#31473d',
                  padding: '0 11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 950,
                  cursor: 'pointer',
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { AppLanguageBar }
