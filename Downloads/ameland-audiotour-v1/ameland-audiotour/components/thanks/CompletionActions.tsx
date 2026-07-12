'use client'

import { Download, Share2 } from 'lucide-react'
import { useState } from 'react'

type Language = 'nl' | 'en' | 'de'

type Props = {
  language: Language
  title: string
  text: string
}

const COPY = {
  nl: { share: 'Deel je resultaat', print: 'Bewaar certificaat', copied: 'Link gekopieerd' },
  en: { share: 'Share your result', print: 'Save certificate', copied: 'Link copied' },
  de: { share: 'Ergebnis teilen', print: 'Zertifikat speichern', copied: 'Link kopiert' },
} as const

export default function CompletionActions({ language, title, text }: Props) {
  const [copied, setCopied] = useState(false)
  const t = COPY[language]

  async function share() {
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // Delen is optioneel en mag de bedankpagina niet onderbreken.
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 print:hidden">
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
      >
        <Share2 className="h-5 w-5" /> {copied ? t.copied : t.share}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/20"
      >
        <Download className="h-5 w-5" /> {t.print}
      </button>
    </div>
  )
}
