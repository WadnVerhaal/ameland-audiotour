'use client'

import {
  Award,
  CheckCircle2,
  Clock3,
  ImageIcon,
  MapPin,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Language = 'nl' | 'en' | 'de'

type Props = {
  token: string
  tourId: string
  language: Language
  currentIndex: number
  totalStops: number
  completedStops: number
  distanceMeters: number | null
  arrived: boolean
  selectedCompleted: boolean
  title: string
  imageUrls: string[]
}

const COPY = {
  nl: {
    stop: 'Stop',
    remaining: 'verhalen te gaan',
    completed: 'voltooid',
    walking: 'minuten lopen',
    arrived: 'Je bent er. Kijk rustig om je heen en laat het verhaal beginnen.',
    close: 'Je bent er bijna. Houd de omgeving voor je in de gaten.',
    route: 'Volg de wandelroute naar de volgende stop.',
    heard: 'Mooi verhaal. Wanneer je klaar bent, staat de volgende stop voor je klaar.',
    enjoy: 'Geniet je van de tour?',
    enjoyText: 'Eén tik is genoeg. De uitgebreide beoordeling komt pas na afloop.',
    thanks: 'Dank je! We bewaren je indruk.',
    first: 'Eerste verhaal',
    halfway: 'Halverwege',
    explorer: 'Hollum Explorer',
    milestone3: 'Mooi bezig — drie verhalen ontdekt!',
    milestoneHalf: 'Je bent over de helft van de route.',
    milestoneDone: 'Alle verhalen voltooid. Jij bent Hollum Explorer!',
    images: 'Kijk om je heen',
  },
  en: {
    stop: 'Stop',
    remaining: 'stories remaining',
    completed: 'completed',
    walking: 'minutes walking',
    arrived: 'You have arrived. Take a moment to look around and let the story begin.',
    close: 'You are almost there. Keep an eye on the surroundings ahead.',
    route: 'Follow the walking route to the next stop.',
    heard: 'A story completed. The next stop is ready when you are.',
    enjoy: 'Enjoying the tour?',
    enjoyText: 'One tap is enough. The full review comes after the tour.',
    thanks: 'Thank you. We saved your impression.',
    first: 'First story',
    halfway: 'Halfway',
    explorer: 'Hollum Explorer',
    milestone3: 'Great progress — three stories discovered!',
    milestoneHalf: 'You are more than halfway through the route.',
    milestoneDone: 'All stories complete. You are a Hollum Explorer!',
    images: 'Look around',
  },
  de: {
    stop: 'Stopp',
    remaining: 'Geschichten übrig',
    completed: 'abgeschlossen',
    walking: 'Minuten zu Fuß',
    arrived: 'Du bist angekommen. Schau dich in Ruhe um und lass die Geschichte beginnen.',
    close: 'Du bist fast da. Achte auf die Umgebung vor dir.',
    route: 'Folge dem Fußweg zum nächsten Stopp.',
    heard: 'Eine Geschichte ist geschafft. Der nächste Stopp wartet auf dich.',
    enjoy: 'Gefällt dir die Tour?',
    enjoyText: 'Ein Tipp genügt. Die ausführliche Bewertung folgt erst am Ende.',
    thanks: 'Danke! Wir haben deinen Eindruck gespeichert.',
    first: 'Erste Geschichte',
    halfway: 'Halbzeit',
    explorer: 'Hollum Explorer',
    milestone3: 'Sehr gut — drei Geschichten entdeckt!',
    milestoneHalf: 'Du bist über die Hälfte der Route.',
    milestoneDone: 'Alle Geschichten abgeschlossen. Du bist Hollum Explorer!',
    images: 'Schau dich um',
  },
} as const

function uniqueImages(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 3)
}

export function TourExperiencePanel({
  token,
  tourId,
  language,
  currentIndex,
  totalStops,
  completedStops,
  distanceMeters,
  arrived,
  selectedCompleted,
  title,
  imageUrls,
}: Props) {
  const [pulseRating, setPulseRating] = useState<number | null>(null)
  const [milestone, setMilestone] = useState<string | null>(null)
  const t = COPY[language]
  const images = useMemo(() => uniqueImages(imageUrls), [imageUrls])
  const remaining = Math.max(0, totalStops - completedStops)
  const progress = totalStops > 0 ? Math.min(100, Math.round((completedStops / totalStops) * 100)) : 0
  const walkMinutes =
    distanceMeters !== null && Number.isFinite(distanceMeters)
      ? Math.max(1, Math.ceil(distanceMeters / 75))
      : null

  const guidance = selectedCompleted
    ? t.heard
    : arrived
    ? t.arrived
    : distanceMeters !== null && distanceMeters <= 120
    ? t.close
    : t.route

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`aat.pulse.${token}`)
      if (saved) setPulseRating(Number(saved))
    } catch {
      // De tour blijft werken zonder lokale opslag.
    }
  }, [token])

  useEffect(() => {
    const half = Math.ceil(totalStops / 2)
    const message =
      completedStops >= totalStops && totalStops > 0
        ? t.milestoneDone
        : completedStops === half
        ? t.milestoneHalf
        : completedStops === 3
        ? t.milestone3
        : null

    if (!message) return
    const key = `aat.milestone.${token}.${completedStops}`
    try {
      if (window.localStorage.getItem(key)) return
      window.localStorage.setItem(key, '1')
    } catch {
      // Niet kritisch.
    }

    setMilestone(message)
    const timer = window.setTimeout(() => setMilestone(null), 5200)
    return () => window.clearTimeout(timer)
  }, [completedStops, t.milestone3, t.milestoneDone, t.milestoneHalf, token, totalStops])

  async function submitPulse(rating: number) {
    setPulseRating(rating)
    try {
      window.localStorage.setItem(`aat.pulse.${token}`, String(rating))
    } catch {
      // Niet kritisch.
    }

    try {
      await fetch('/api/tours/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, tourId, rating, stopIndex: currentIndex + 1 }),
        keepalive: true,
      })
    } catch {
      // Feedback mag de tour nooit onderbreken.
    }
  }

  return (
    <>
      {milestone ? (
        <div className="fixed inset-x-3 top-3 z-[1200] mx-auto max-w-lg rounded-2xl border border-amber-200/30 bg-amber-300 p-4 text-slate-950 shadow-2xl">
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-6 w-6 shrink-0" />
            <p className="flex-1 font-black">{milestone}</p>
            <button type="button" onClick={() => setMilestone(null)} aria-label="Sluiten">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.055] shadow-xl backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_.85fr]">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                  {t.stop} {currentIndex + 1} / {totalStops}
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-white">{title}</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-slate-200">
                {remaining} {t.remaining}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-300 transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{completedStops} {t.completed}</span>
              <span>{progress}%</span>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4">
              <div className="flex items-start gap-3">
                {arrived ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                ) : (
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                )}
                <p className="text-sm font-bold leading-6 text-emerald-50">{guidance}</p>
              </div>
              {walkMinutes && !arrived ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950/35 px-3 py-1.5 text-xs font-black text-slate-200">
                  <Clock3 className="h-4 w-4" /> ± {walkMinutes} {t.walking}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1.5 text-xs font-black ${completedStops >= 1 ? 'bg-emerald-300 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                {t.first}
              </span>
              <span className={`rounded-full px-3 py-1.5 text-xs font-black ${completedStops >= Math.ceil(totalStops / 2) ? 'bg-emerald-300 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                {t.halfway}
              </span>
              <span className={`rounded-full px-3 py-1.5 text-xs font-black ${completedStops >= totalStops && totalStops > 0 ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                {t.explorer}
              </span>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="border-t border-white/10 bg-slate-950/50 p-4 lg:border-l lg:border-t-0">
              <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <ImageIcon className="h-4 w-4" /> {t.images}
              </p>
              <div className="flex snap-x gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${title} ${index + 1}`}
                    className="h-40 min-w-[86%] snap-center rounded-2xl object-cover sm:min-w-[72%] lg:min-w-full"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {completedStops >= 3 && completedStops < totalStops ? (
          <div className="border-t border-white/10 bg-slate-950/65 p-4 sm:p-5">
            {pulseRating ? (
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                <Sparkles className="h-5 w-5" /> {t.thanks}
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-white">{t.enjoy}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{t.enjoyText}</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => void submitPulse(rating)}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-amber-300 transition hover:bg-white/20"
                      aria-label={`${rating} sterren`}
                    >
                      <Star className="h-5 w-5" fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </>
  )
}
