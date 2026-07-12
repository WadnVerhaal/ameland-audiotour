'use client'

import type { ReactNode } from 'react'

type Lang = 'nl' | 'de' | 'en'

const languages: Array<{ code: Lang; label: string; flag: string }> = [
  { code: 'nl', label: 'NL', flag: '🇳🇱' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]

function getLang(): Lang {
  if (typeof window === 'undefined') return 'nl'
  const stored = window.localStorage.getItem('ameland-audiotours-language')

  if (stored === 'de' || stored === 'en' || stored === 'nl') return stored
  return 'nl'
}

export default function AppLanguageShell({
  children,
  hideLanguageBar = false,
}: {
  children: ReactNode
  hideLanguageBar?: boolean
}) {
  const current = getLang()

  function setLang(lang: Lang) {
    window.localStorage.setItem('ameland-audiotours-language', lang)
    document.cookie = `ameland-audiotours-language=${lang}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div style={{ minHeight: '100svh', background: '#f4efe4' }}>
      {!hideLanguageBar && (
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            margin: '0 auto',
            padding: '14px 14px 0',
            position: 'relative',
            zIndex: 2,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              borderRadius: 26,
              border: '1px solid #ddd4c4',
              background: 'rgba(255,253,248,0.96)',
              boxShadow: '0 16px 36px rgba(31,39,32,0.10)',
              padding: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  background: '#0f5d67',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 950,
                }}
              >
                ◖
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    color: '#22362e',
                    fontSize: 14,
                    lineHeight: 1.1,
                    fontWeight: 950,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Ameland Audiotours
                </p>
                <p
                  style={{
                    margin: '3px 0 0',
                    color: '#6b7469',
                    fontSize: 12,
                    lineHeight: 1.1,
                    fontWeight: 650,
                  }}
                >
                  Verhalen onderweg
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexShrink: 0,
                alignItems: 'center',
                borderRadius: 999,
                border: '1px solid #e6dfd2',
                background: '#f9f5ed',
                padding: 4,
              }}
            >
              {languages.map((lang) => {
                const active = lang.code === current

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLang(lang.code)}
                    style={{
                      height: 34,
                      border: 0,
                      borderRadius: 999,
                      background: active ? '#111b17' : 'transparent',
                      color: active ? '#fff' : '#31473d',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 950,
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
      )}

      {children}
    </div>
  )
}

export { AppLanguageShell }
