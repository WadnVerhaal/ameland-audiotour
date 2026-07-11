'use client'

import { languages } from '@/lib/i18n/translations'
import { useLanguage } from './LanguageProvider'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white/90 p-1 shadow-sm backdrop-blur">
      {languages.map((item) => {
        const isActive = item.code === language

        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={[
              'rounded-full px-3 py-1.5 text-xs font-semibold transition',
              isActive
                ? 'bg-stone-950 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950',
            ].join(' ')}
            aria-pressed={isActive}
            aria-label={`Select ${item.label}`}
          >
            <span className="mr-1">{item.flag}</span>
            {item.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
