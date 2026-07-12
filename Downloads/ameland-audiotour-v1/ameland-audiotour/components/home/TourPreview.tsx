'use client'

import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

type Language = 'nl' | 'en' | 'de'

type Props = {
  audioUrl: string
  title: string
  imageUrl?: string
  language: Language
}

const COPY = {
  nl: {
    eyebrow: 'Luister alvast',
    intro: 'Een voorproefje van 20 seconden uit de tour.',
    play: 'Speel fragment',
    pause: 'Pauzeer',
    replay: 'Opnieuw',
    seconds: '20 seconden preview',
  },
  en: {
    eyebrow: 'Listen first',
    intro: 'A 20-second preview from the tour.',
    play: 'Play preview',
    pause: 'Pause',
    replay: 'Replay',
    seconds: '20-second preview',
  },
  de: {
    eyebrow: 'Jetzt reinhören',
    intro: 'Eine 20-sekündige Hörprobe aus der Tour.',
    play: 'Hörprobe starten',
    pause: 'Pause',
    replay: 'Noch einmal',
    seconds: '20 Sekunden Hörprobe',
  },
} as const

const PREVIEW_SECONDS = 20

export default function TourPreview({ audioUrl, title, imageUrl, language }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const t = COPY[language]

  const progress = useMemo(
    () => Math.min(100, Math.max(0, (elapsed / PREVIEW_SECONDS) * 100)),
    [elapsed]
  )

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    if (audio.currentTime >= PREVIEW_SECONDS) audio.currentTime = 0
    try {
      await audio.play()
    } catch {
      setPlaying(false)
    }
  }

  function restart() {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setElapsed(0)
    void audio.play().catch(() => setPlaying(false))
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950 text-white shadow-2xl">
      <div className="relative min-h-48 overflow-hidden p-5 sm:p-7">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-teal-950/50" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200 backdrop-blur">
            <Volume2 className="h-4 w-4" /> {t.eyebrow}
          </div>
          <h2 className="mt-5 max-w-md text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">{t.intro}</p>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950 p-4 sm:p-5">
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const audio = event.currentTarget
            const next = Math.min(audio.currentTime, PREVIEW_SECONDS)
            setElapsed(next)
            if (audio.currentTime >= PREVIEW_SECONDS) {
              audio.pause()
              audio.currentTime = PREVIEW_SECONDS
            }
          }}
          onEnded={() => setPlaying(false)}
        />

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
          <span>{Math.floor(elapsed)} sec</span>
          <span>{t.seconds}</span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => void toggle()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {playing ? t.pause : t.play}
          </button>
          <button
            type="button"
            onClick={restart}
            className="grid min-h-12 min-w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
            aria-label={t.replay}
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
