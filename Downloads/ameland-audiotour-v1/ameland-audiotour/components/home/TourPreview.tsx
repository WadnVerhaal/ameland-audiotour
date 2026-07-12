'use client'

import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

type Language = 'nl' | 'en' | 'de'

type Props = {
  audioUrl: string
  language: Language
}

const COPY = {
  nl: { label: 'Luisterfragment · 20 seconden', play: 'Afspelen', pause: 'Pauzeren', replay: 'Opnieuw' },
  en: { label: 'Audio preview · 20 seconds', play: 'Play', pause: 'Pause', replay: 'Replay' },
  de: { label: 'Hörprobe · 20 Sekunden', play: 'Abspielen', pause: 'Pause', replay: 'Noch einmal' },
} as const

const PREVIEW_SECONDS = 20

function formatTime(seconds: number) {
  return `0:${Math.max(0, Math.floor(seconds)).toString().padStart(2, '0')}`
}

export default function TourPreview({ audioUrl, language }: Props) {
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
    <section className="rounded-[1.8rem] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-300 text-slate-950">
          <Volume2 className="h-5 w-5" />
        </span>
        <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-200">{t.label}</p>
      </div>

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

      <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-300 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
        <span>{formatTime(elapsed)}</span>
        <span>0:20</span>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void toggle()}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-100"
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
    </section>
  )
}
