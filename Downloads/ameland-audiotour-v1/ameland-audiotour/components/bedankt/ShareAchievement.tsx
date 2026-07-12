'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

type Props = {
  language: 'nl' | 'en' | 'de'
}

const COPY = {
  nl: {
    button: 'Deel je prestatie',
    shared: 'Deelvenster geopend',
    copied: 'Tekst gekopieerd',
    title: 'Hollum Ontdekker',
    text: 'Ik heb Hollum ontdekt met Ameland Audiotours — negen verhalen, één bijzonder eiland.',
  },
  en: {
    button: 'Share your achievement',
    shared: 'Share window opened',
    copied: 'Text copied',
    title: 'Hollum Explorer',
    text: 'I discovered Hollum with Ameland Audiotours — nine stories, one remarkable island.',
  },
  de: {
    button: 'Erfolg teilen',
    shared: 'Teilen geöffnet',
    copied: 'Text kopiert',
    title: 'Hollum Entdecker',
    text: 'Ich habe Hollum mit Ameland Audiotours entdeckt — neun Geschichten, eine besondere Insel.',
  },
} as const

export default function ShareAchievement({ language }: Props) {
  const [status, setStatus] = useState('')
  const t = COPY[language]

  async function share() {
    const url = `https://www.amelandaudiotours.nl/${language}`
    try {
      if (navigator.share) {
        await navigator.share({ title: t.title, text: t.text, url })
        setStatus(t.shared)
        return
      }
      await navigator.clipboard.writeText(`${t.text} ${url}`)
      setStatus(t.copied)
    } catch {
      // Annuleren van het deelvenster vraagt geen foutmelding.
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-200"
      >
        <Share2 className="h-4 w-4" /> {t.button}
      </button>
      {status ? <p className="mt-2 text-xs font-bold text-amber-100">{status}</p> : null}
    </div>
  )
}
