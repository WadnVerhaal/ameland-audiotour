'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Pause,
  Play,
  Route,
} from 'lucide-react'

const PlayerMap = dynamic(
  () => import('./player-map').then((mod) => mod.PlayerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-900 text-sm font-bold text-slate-300">
        Kaart laden…
      </div>
    ),
  }
)

export type PlayerLanguage = 'nl' | 'en' | 'de'

export type PlayerStop = {
  id?: string | number | null
  title?: string | null
  title_nl?: string | null
  title_en?: string | null
  title_de?: string | null
  description?: string | null
  description_nl?: string | null
  description_en?: string | null
  description_de?: string | null
  short_description?: string | null
  short_description_nl?: string | null
  short_description_en?: string | null
  short_description_de?: string | null
  audio_url?: string | null
  audio_url_nl?: string | null
  audio_url_en?: string | null
  audio_url_de?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  lat?: string | number | null
  lng?: string | number | null
  order_index?: string | number | null
  trigger_radius_meters?: string | number | null
  trigger_radius_m?: string | number | null
  trigger_radius?: string | number | null
  radius_m?: string | number | null
  image_url?: string | null
  [key: string]: unknown
}

export type PlayerTour = {
  id?: string | number | null
  slug?: string | null
  title?: string | null
  title_nl?: string | null
  title_en?: string | null
  title_de?: string | null
  description?: string | null
  description_nl?: string | null
  description_en?: string | null
  description_de?: string | null
  duration?: string | number | null
  duration_minutes?: string | number | null
  duration_label?: string | null
  distance?: string | number | null
  distance_km?: string | number | null
  [key: string]: unknown
}

type Props = {
  token: string
  tour: PlayerTour
  stops: PlayerStop[]
  initialLanguage: PlayerLanguage
  expiresAt: string | null
}

type GeoPoint = {
  lat: number
  lng: number
  accuracy: number
  at: number
}

type PersistedProgress = {
  selectedIndex?: number
  completedKeys?: string[]
  language?: PlayerLanguage
}

const THANK_YOU_PATH = '/bedankt'
const MAX_AUTO_ARRIVAL_ACCURACY_M = 60

const LANGUAGES: Array<{ code: PlayerLanguage; label: string }> = [
  { code: 'nl', label: 'NL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

const COPY = {
  nl: {
    brand: 'Ameland Audiotours',
    gpsActive: 'GPS actief',
    gpsWaiting: 'GPS zoeken',
    gpsDenied: 'Locatie geweigerd',
    gpsUnsupported: 'GPS niet ondersteund',
    currentStory: 'Huidig verhaal',
    distance: 'Afstand',
    progress: 'Voortgang',
    previous: 'Vorige',
    next: 'Volgende',
    nextStop: 'Volgende stop',
    finish: 'Tour afronden',
    finishing: 'Afronden…',
    openRoute: 'Open looproute',
    playAudio: 'Start audio',
    pauseAudio: 'Pauzeer',
    noAudio: 'Voor deze stop is nog geen audio in deze taal beschikbaar.',
    audioBlocked: 'Tik nogmaals op afspelen. Je telefoon blokkeerde het automatisch starten.',
    arrived: 'Je bent bij deze stop',
    walkToStop: 'Loop naar dit punt',
    routePoints: 'Routepunten',
    expires: 'Toegang actief',
    selected: 'Geselecteerd',
    completed: 'Beluisterd',
    away: 'afstand',
    allStops: 'Alle stops',
    gpsRequest: 'Locatie opnieuw vragen',
    map: 'Kaart',
    route: 'Route',
    resume: 'Ga verder waar je was gebleven',
  },
  en: {
    brand: 'Ameland Audiotours',
    gpsActive: 'GPS active',
    gpsWaiting: 'Finding GPS',
    gpsDenied: 'Location denied',
    gpsUnsupported: 'GPS unsupported',
    currentStory: 'Current story',
    distance: 'Distance',
    progress: 'Progress',
    previous: 'Previous',
    next: 'Next',
    nextStop: 'Next stop',
    finish: 'Finish tour',
    finishing: 'Finishing…',
    openRoute: 'Open walking route',
    playAudio: 'Start audio',
    pauseAudio: 'Pause',
    noAudio: 'No audio is available for this stop in the selected language yet.',
    audioBlocked: 'Tap play again. Your phone blocked automatic audio playback.',
    arrived: 'You are at this stop',
    walkToStop: 'Walk to this point',
    routePoints: 'Route stops',
    expires: 'Access active',
    selected: 'Selected',
    completed: 'Played',
    away: 'away',
    allStops: 'All stops',
    gpsRequest: 'Ask location again',
    map: 'Map',
    route: 'Route',
    resume: 'Continue where you left off',
  },
  de: {
    brand: 'Ameland Audiotours',
    gpsActive: 'GPS aktiv',
    gpsWaiting: 'GPS wird gesucht',
    gpsDenied: 'Standort abgelehnt',
    gpsUnsupported: 'GPS nicht unterstützt',
    currentStory: 'Aktuelle Geschichte',
    distance: 'Entfernung',
    progress: 'Fortschritt',
    previous: 'Zurück',
    next: 'Weiter',
    nextStop: 'Nächster Stopp',
    finish: 'Tour beenden',
    finishing: 'Wird beendet…',
    openRoute: 'Fußweg öffnen',
    playAudio: 'Audio starten',
    pauseAudio: 'Pause',
    noAudio: 'Für diesen Stopp ist in der gewählten Sprache noch kein Audio verfügbar.',
    audioBlocked: 'Tippe erneut auf Abspielen. Dein Telefon hat den automatischen Start blockiert.',
    arrived: 'Du bist bei diesem Stopp',
    walkToStop: 'Gehe zu diesem Punkt',
    routePoints: 'Routenpunkte',
    expires: 'Zugang aktiv',
    selected: 'Ausgewählt',
    completed: 'Gehört',
    away: 'entfernt',
    allStops: 'Alle Stopps',
    gpsRequest: 'Standort erneut anfragen',
    map: 'Karte',
    route: 'Route',
    resume: 'Dort weitermachen, wo du aufgehört hast',
  },
} as const

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function stringValue(source: PlayerStop | PlayerTour | null, keys: string[]) {
  if (!source) return ''
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return ''
}

function numberValue(source: PlayerStop | null, keys: string[]) {
  if (!source) return null
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(',', '.'))
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

function titleFor(source: PlayerStop | PlayerTour | null, language: PlayerLanguage) {
  if (language === 'nl') return stringValue(source, ['title_nl', 'title', 'title_en', 'title_de'])
  if (language === 'en') return stringValue(source, ['title_en', 'title_nl', 'title', 'title_de'])
  return stringValue(source, ['title_de', 'title_nl', 'title', 'title_en'])
}

function descriptionFor(source: PlayerStop | null, language: PlayerLanguage) {
  if (language === 'nl') {
    return stringValue(source, [
      'short_description_nl',
      'short_description',
      'description_nl',
      'description',
      'short_description_en',
      'description_en',
    ])
  }
  if (language === 'en') {
    return stringValue(source, [
      'short_description_en',
      'description_en',
      'short_description_nl',
      'short_description',
      'description_nl',
      'description',
    ])
  }
  return stringValue(source, [
    'short_description_de',
    'description_de',
    'short_description_nl',
    'short_description',
    'description_nl',
    'description',
  ])
}

function audioFor(stop: PlayerStop | null, language: PlayerLanguage) {
  if (!stop) return ''
  if (language === 'nl') return stringValue(stop, ['audio_url_nl', 'audio_url'])
  if (language === 'en') return stringValue(stop, ['audio_url_en'])
  return stringValue(stop, ['audio_url_de'])
}

function stopKey(stop: PlayerStop | null, index: number) {
  return String(stop?.id ?? stop?.order_index ?? index)
}

function coordinatesFor(stop: PlayerStop | null) {
  if (!stop) return null
  const lat = numberValue(stop, ['latitude', 'lat'])
  const lng = numberValue(stop, ['longitude', 'lng'])
  if (lat === null || lng === null) return null
  return { lat, lng }
}

function triggerRadiusFor(stop: PlayerStop | null) {
  const configured = numberValue(stop, [
    'trigger_radius_meters',
    'trigger_radius_m',
    'trigger_radius',
    'radius_m',
  ])
  return Math.min(75, Math.max(15, configured ?? 25))
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadius = 6371000
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function formatDistance(meters: number | null) {
  if (meters === null || !Number.isFinite(meters)) return '—'
  if (meters < 1000) return `${Math.max(0, Math.round(meters))} m`
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
}

function formatExpiry(expiresAt: string | null, language: PlayerLanguage) {
  if (!expiresAt) return COPY[language].expires
  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) return COPY[language].expires
  return `${COPY[language].expires} · ${date.toLocaleDateString(
    language === 'nl' ? 'nl-NL' : language === 'de' ? 'de-DE' : 'en-GB',
    { day: '2-digit', month: 'short' }
  )}`
}

function LanguageSwitch({
  language,
  setLanguage,
}: {
  language: PlayerLanguage
  setLanguage: (language: PlayerLanguage) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1">
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          aria-pressed={language === item.code}
          onClick={() => setLanguage(item.code)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-black transition',
            language === item.code
              ? 'bg-white text-slate-950 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-white/10 bg-white/[0.055] p-3 shadow-lg">
      <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-black tracking-tight text-white">{value}</p>
      {helper ? <p className="mt-0.5 truncate text-xs text-slate-400">{helper}</p> : null}
    </div>
  )
}

export function TourPlayer({ token, tour, stops, initialLanguage, expiresAt }: Props) {
  const [language, setLanguageState] = useState<PlayerLanguage>(initialLanguage)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [arrivedIndex, setArrivedIndex] = useState<number | null>(null)
  const [completedKeys, setCompletedKeys] = useState<string[]>([])
  const [location, setLocation] = useState<GeoPoint | null>(null)
  const [locationState, setLocationState] = useState<'waiting' | 'active' | 'denied' | 'unsupported'>('waiting')
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [restoredProgress, setRestoredProgress] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const lastAcceptedLocationRef = useRef<GeoPoint | null>(null)
  const playedAutomaticallyRef = useRef<Set<string>>(new Set())
  const completingRef = useRef(false)
  const startedAtRef = useRef(Date.now())

  const copy = COPY[language]
  const cleanStops = useMemo(() => stops.filter(Boolean), [stops])
  const selectedStop = cleanStops[selectedIndex] || cleanStops[0] || null
  const selectedCoordinates = coordinatesFor(selectedStop)
  const selectedAudioUrl = audioFor(selectedStop, language)
  const selectedKey = stopKey(selectedStop, selectedIndex)
  const selectedTitle = titleFor(selectedStop, language) || `${copy.routePoints} ${selectedIndex + 1}`
  const selectedDescription = descriptionFor(selectedStop, language)
  const selectedIsCompleted = completedKeys.includes(selectedKey)
  const isLastStop = selectedIndex >= cleanStops.length - 1
  const progress = `${Math.min(completedKeys.length, cleanStops.length)}/${cleanStops.length}`
  const storageKey = `aat.progress.${token}`

  const selectedDistance = useMemo(() => {
    if (!location || !selectedCoordinates) return null
    return distanceMeters(location, selectedCoordinates)
  }, [location, selectedCoordinates])

  const selectedIsArrived = arrivedIndex === selectedIndex

  function setLanguage(nextLanguage: PlayerLanguage) {
    setLanguageState(nextLanguage)
    try {
      window.localStorage.setItem('aat.language', nextLanguage)
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set('lang', nextLanguage)
      window.history.replaceState(null, '', nextUrl.toString())
    } catch {
      // Niet kritisch voor de tour.
    }
  }

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setLocationState('unsupported')
      return
    }

    setLocationState('waiting')
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 999,
          at: Date.now(),
        }
        const previous = lastAcceptedLocationRef.current
        const moved = previous ? distanceMeters(previous, next) : Number.POSITIVE_INFINITY
        const accuracyImproved = previous ? next.accuracy < previous.accuracy * 0.75 : true
        const stale = previous ? Date.now() - previous.at > 20000 : true

        if (!previous || moved >= 5 || accuracyImproved || stale) {
          lastAcceptedLocationRef.current = next
          setLocation(next)
        }
        setLocationState('active')
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, maximumAge: 6000, timeout: 15000 }
    )
  }

  function goToStop(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), cleanStops.length - 1)
    setSelectedIndex(nextIndex)
    setAudioBlocked(false)
  }

  function openWalkingRoute() {
    if (!selectedCoordinates) return
    const url = new URL('https://www.google.com/maps/dir/')
    url.searchParams.set('api', '1')
    if (location) url.searchParams.set('origin', `${location.lat},${location.lng}`)
    url.searchParams.set('destination', `${selectedCoordinates.lat},${selectedCoordinates.lng}`)
    url.searchParams.set('travelmode', 'walking')
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }

  async function playOrPause() {
    const audio = audioRef.current
    if (!audio || !selectedAudioUrl) return
    setAudioBlocked(false)
    if (!audio.paused) {
      audio.pause()
      return
    }
    try {
      await audio.play()
    } catch {
      setAudioBlocked(true)
    }
  }

  function findNextIncomplete(currentKeys: string[]) {
    for (let index = selectedIndex + 1; index < cleanStops.length; index += 1) {
      if (!currentKeys.includes(stopKey(cleanStops[index], index))) return index
    }
    for (let index = 0; index < selectedIndex; index += 1) {
      if (!currentKeys.includes(stopKey(cleanStops[index], index))) return index
    }
    return Math.min(selectedIndex + 1, cleanStops.length - 1)
  }

  async function completeTour(nextCompletedKeys: string[]) {
    if (completingRef.current) return
    completingRef.current = true
    setIsCompleting(true)

    let reviewToken = ''
    try {
      const response = await fetch('/api/tours/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          language,
          durationSeconds: Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
          stopsCompleted: nextCompletedKeys.length,
          stopsTotal: cleanStops.length,
        }),
      })

      if (response.ok) {
        const result = (await response.json()) as { reviewUrl?: string }
        if (result.reviewUrl) {
          const reviewUrl = new URL(result.reviewUrl)
          reviewToken = reviewUrl.pathname.split('/').filter(Boolean).pop() || ''
        }
      }
    } catch {
      // De bedankpagina blijft bereikbaar als registratie tijdelijk niet lukt.
    }

    const params = new URLSearchParams({ lang: language, completed: '1' })
    if (reviewToken) params.set('review', reviewToken)
    window.location.assign(`${THANK_YOU_PATH}?${params.toString()}`)
  }

  async function handleAudioEnded() {
    setPlaying(false)
    const nextCompletedKeys = completedKeys.includes(selectedKey)
      ? completedKeys
      : [...completedKeys, selectedKey]
    setCompletedKeys(nextCompletedKeys)

    if (isLastStop) {
      await completeTour(nextCompletedKeys)
      return
    }

    const nextIndex = findNextIncomplete(nextCompletedKeys)
    window.setTimeout(() => goToStop(nextIndex), 500)
  }

  async function handleNext() {
    if (isLastStop) {
      const nextCompletedKeys = completedKeys.includes(selectedKey)
        ? completedKeys
        : [...completedKeys, selectedKey]
      setCompletedKeys(nextCompletedKeys)
      await completeTour(nextCompletedKeys)
      return
    }
    goToStop(selectedIndex + 1)
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        const progress = JSON.parse(stored) as PersistedProgress
        if (Array.isArray(progress.completedKeys)) setCompletedKeys(progress.completedKeys)
        if (Array.isArray(progress.completedKeys) && progress.completedKeys.length > 0) {
          const nextIncomplete = cleanStops.findIndex(
            (stop, index) => !progress.completedKeys!.includes(stopKey(stop, index))
          )
          setSelectedIndex(nextIncomplete >= 0 ? nextIncomplete : Math.max(0, cleanStops.length - 1))
        } else if (Number.isInteger(progress.selectedIndex)) {
          setSelectedIndex(Math.max(0, Math.min(progress.selectedIndex || 0, cleanStops.length - 1)))
        }
        if (!window.location.search.includes('lang=') && progress.language) {
          setLanguageState(progress.language)
        }
      } else {
        const storedLanguage = window.localStorage.getItem('aat.language')
        if (!window.location.search.includes('lang=') && (storedLanguage === 'nl' || storedLanguage === 'en' || storedLanguage === 'de')) {
          setLanguageState(storedLanguage)
        }
      }
    } catch {
      // Local storage kan in privémodus beperkt zijn.
    }
    setRestoredProgress(true)
  }, [cleanStops.length, storageKey])

  useEffect(() => {
    if (!restoredProgress) return
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ selectedIndex, completedKeys, language } satisfies PersistedProgress)
      )
    } catch {
      // De tour blijft zonder lokale opslag werken.
    }
  }, [completedKeys, language, restoredProgress, selectedIndex, storageKey])

  useEffect(() => {
    requestLocation()
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  useEffect(() => {
    if (!location || !selectedStop || selectedDistance === null) {
      setArrivedIndex(null)
      return
    }

    const configuredRadius = triggerRadiusFor(selectedStop)
    const accuracyAllowance = Math.min(10, Math.max(0, location.accuracy - 10))
    const arrivalRadius = configuredRadius + accuracyAllowance
    const leaveRadius = arrivalRadius + 12
    const wasAlreadyArrived = arrivedIndex === selectedIndex
    const isInside = selectedDistance <= (wasAlreadyArrived ? leaveRadius : arrivalRadius)
    const isAccurateEnough = location.accuracy <= MAX_AUTO_ARRIVAL_ACCURACY_M

    setArrivedIndex(isAccurateEnough && isInside ? selectedIndex : null)
  }, [arrivedIndex, location, selectedDistance, selectedIndex, selectedStop])

  useEffect(() => {
    setAudioBlocked(false)
    setPlaying(false)
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.load()
  }, [language, selectedAudioUrl, selectedIndex])

  useEffect(() => {
    if (arrivedIndex === null || arrivedIndex !== selectedIndex || !selectedAudioUrl) return
    const key = `${language}-${selectedKey}`
    if (playedAutomaticallyRef.current.has(key)) return
    playedAutomaticallyRef.current.add(key)

    const timer = window.setTimeout(() => {
      audioRef.current?.play().catch(() => setAudioBlocked(true))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [arrivedIndex, language, selectedAudioUrl, selectedIndex, selectedKey])

  const locationLabel =
    locationState === 'active'
      ? copy.gpsActive
      : locationState === 'denied'
      ? copy.gpsDenied
      : locationState === 'unsupported'
      ? copy.gpsUnsupported
      : copy.gpsWaiting

  if (!cleanStops.length) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-black">Ameland Audiotours</h1>
          <p className="mt-3 text-slate-300">Route klaar</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-slate-950 pb-28 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-5">
        <header className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-3 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">{copy.brand}</p>
              <h1 className="mt-1 truncate text-lg font-black tracking-tight text-white sm:text-xl">
                {selectedIndex + 1}. {selectedTitle}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={requestLocation}
                className={cn(
                  'rounded-full border px-3 py-2 text-xs font-black',
                  locationState === 'active'
                    ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
                    : 'border-amber-300/30 bg-amber-300/10 text-amber-100'
                )}
              >
                {locationLabel}
              </button>
              <LanguageSwitch language={language} setLanguage={setLanguage} />
            </div>
          </div>
        </header>

        {restoredProgress && completedKeys.length > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{copy.resume} · {progress}</span>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur">
          <div className="h-[46vh] min-h-[350px] max-h-[560px]">
            <PlayerMap
              stops={cleanStops}
              language={language}
              location={location}
              selectedIndex={selectedIndex}
              arrivedIndex={arrivedIndex}
              reachedKeys={completedKeys}
              onSelect={goToStop}
            />
          </div>

          <div className="border-t border-white/10 bg-slate-950/94 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                  {selectedIsArrived ? copy.arrived : copy.currentStory}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  {selectedIndex + 1}. {selectedTitle}
                </h2>
              </div>
              {selectedIsCompleted ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-black text-slate-950">
                  <CheckCircle2 className="h-4 w-4" /> {copy.completed}
                </span>
              ) : null}
            </div>

            {selectedDescription ? <p className="mt-3 text-sm leading-7 text-slate-200">{selectedDescription}</p> : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard label={copy.distance} value={formatDistance(selectedDistance)} helper={copy.walkToStop} />
              <MetricCard label={copy.progress} value={progress} helper={selectedIsCompleted ? copy.completed : copy.selected} />
            </div>

            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-3">
              {selectedAudioUrl ? (
                <>
                  <audio
                    ref={audioRef}
                    src={selectedAudioUrl}
                    controls
                    preload="metadata"
                    playsInline
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => void handleAudioEnded()}
                    className="w-full"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void playOrPause()}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-3 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
                    >
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {playing ? copy.pauseAudio : copy.playAudio}
                    </button>
                    <button
                      type="button"
                      onClick={openWalkingRoute}
                      disabled={!selectedCoordinates}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-40"
                    >
                      <Route className="h-4 w-4" /> {copy.openRoute}
                    </button>
                  </div>
                  {audioBlocked ? (
                    <p className="mt-3 rounded-2xl bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">{copy.audioBlocked}</p>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">{copy.noAudio}</div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">{copy.allStops}</h2>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">{formatExpiry(expiresAt, language)}</span>
          </div>

          <div className="space-y-2">
            {cleanStops.map((stop, index) => {
              const key = stopKey(stop, index)
              const coordinates = coordinatesFor(stop)
              const distance = location && coordinates ? distanceMeters(location, coordinates) : null
              const isSelected = selectedIndex === index
              const isArrived = arrivedIndex === index
              const isCompleted = completedKeys.includes(key)

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => goToStop(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[1.05rem] border p-3 text-left transition',
                    isSelected
                      ? 'border-emerald-300/45 bg-emerald-300/12'
                      : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black',
                      isArrived
                        ? 'bg-amber-300 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-300 text-slate-950'
                        : isSelected
                        ? 'bg-white text-slate-950'
                        : 'bg-slate-800 text-white'
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-white">
                      {titleFor(stop, language) || `${copy.routePoints} ${index + 1}`}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {isArrived
                        ? copy.arrived
                        : isCompleted
                        ? copy.completed
                        : distance !== null
                        ? `${formatDistance(distance)} ${copy.away}`
                        : copy.walkToStop}
                    </span>
                  </span>
                  {isSelected ? <Navigation className="h-5 w-5 shrink-0 text-emerald-300" /> : null}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-white/10 bg-slate-950/94 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_50px_rgba(0,0,0,.4)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-[1fr_1.35fr_1fr] gap-2">
          <button
            type="button"
            onClick={() => goToStop(selectedIndex - 1)}
            disabled={selectedIndex === 0 || isCompleting}
            className="inline-flex min-h-14 items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-black text-white disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" /> {copy.previous}
          </button>
          <button
            type="button"
            onClick={() => void playOrPause()}
            disabled={!selectedAudioUrl || isCompleting}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-3 text-sm font-black text-slate-950 shadow-xl disabled:opacity-40"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {playing ? copy.pauseAudio : copy.playAudio}
          </button>
          <button
            type="button"
            onClick={() => void handleNext()}
            disabled={isCompleting}
            className="inline-flex min-h-14 items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-black text-white disabled:opacity-40"
          >
            {isCompleting ? copy.finishing : isLastStop ? copy.finish : copy.next}
            {!isCompleting ? <ChevronRight className="h-5 w-5" /> : null}
          </button>
        </div>
      </nav>
    </main>
  )
}
