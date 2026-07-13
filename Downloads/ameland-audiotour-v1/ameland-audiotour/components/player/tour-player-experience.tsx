'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Footprints,
  Headphones,
  LocateFixed,
  MapPin,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Smartphone,
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

type LocationState = 'idle' | 'waiting' | 'active' | 'denied' | 'unsupported'

type PersistedProgress = {
  started?: boolean
  selectedIndex?: number
  completedKeys?: string[]
  manualArrivalKeys?: string[]
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
    beforeStart: 'Voor vertrek',
    startTitle: 'Klaar om te beginnen?',
    startText: 'Druk op start wanneer je klaarstaat. Vanaf dat moment volg je de route en je locatie volledig in deze app.',
    startButton: 'Start tour en navigatie',
    startPrivacy: 'Je locatie wordt pas gevraagd nadat je op Start de wandeling drukt.',
    firstStop: 'Eerste stop',
    startCheckLocation: 'GPS begeleidt je naar de volgende stop',
    startCheckAudio: 'Gebruik bij voorkeur één oortje of open-ear audio',
    startCheckPace: 'Je loopt de tour volledig in je eigen tempo',
    stopOf: 'Stop',
    of: 'van',
    onTheWay: 'Op weg naar stop',
    arrived: 'Aangekomen bij stop',
    listened: 'Beluisterd',
    walkInstruction: 'Volg de wandelroute. Het verhaal komt vrij wanneer je bij de stop bent.',
    arrivedInstruction: 'Je bent op de juiste plek. Neem rustig de tijd en start het verhaal.',
    distance: 'Nog te lopen',
    progress: 'Voortgang',
    openRoute: 'Volg mij in de app',
    confirmArrival: 'Ik ben bij de stop',
    confirmArrivalHelp: 'Gebruik dit alleen wanneer GPS je niet automatisch herkent.',
    listen: 'Luister naar het verhaal',
    play: 'Afspelen',
    pause: 'Pauzeren',
    noAudio: 'Voor deze stop is nog geen audio in deze taal beschikbaar.',
    completeStop: 'Stop afronden',
    stopDone: 'Stop afgerond',
    nextStop: 'Verder naar volgende stop',
    nextStopHint: 'De route wordt automatisch ingesteld op',
    finishTour: 'Tour afronden',
    audioBlocked: 'Tik nogmaals op afspelen. Je telefoon blokkeerde de eerste poging.',
    gpsActive: 'GPS actief',
    gpsWaiting: 'GPS zoeken…',
    gpsDenied: 'Locatie staat uit',
    gpsUnsupported: 'GPS niet beschikbaar',
    enableLocation: 'Locatie opnieuw inschakelen',
    overview: 'Touroverzicht',
    current: 'Volgende stop',
    allStops: 'Alle stops',
    access: 'Toegang actief',
    completing: 'Tour afronden…',
    noStops: 'Deze tour heeft nog geen actieve stops.',
  },
  en: {
    brand: 'Ameland Audiotours',
    beforeStart: 'Before you leave',
    startTitle: 'Ready to begin?',
    startText: 'Press start when you are ready. From that moment, follow the route and your location entirely in this app.',
    startButton: 'Start tour and navigation',
    startPrivacy: 'Your location is only requested after you press Start the walk.',
    firstStop: 'First stop',
    startCheckLocation: 'GPS guides you to the next stop',
    startCheckAudio: 'Use one earbud or open-ear audio if possible',
    startCheckPace: 'You complete the tour entirely at your own pace',
    stopOf: 'Stop',
    of: 'of',
    onTheWay: 'Walking to stop',
    arrived: 'Arrived at stop',
    listened: 'Played',
    walkInstruction: 'Follow the walking route. The story unlocks when you reach the stop.',
    arrivedInstruction: 'You are in the right place. Take your time and start the story.',
    distance: 'Distance to go',
    progress: 'Progress',
    openRoute: 'Follow me in the app',
    confirmArrival: 'I am at the stop',
    confirmArrivalHelp: 'Use this only when GPS does not recognise your location.',
    listen: 'Listen to the story',
    play: 'Play',
    pause: 'Pause',
    noAudio: 'No audio is available for this stop in the selected language yet.',
    completeStop: 'Complete this stop',
    stopDone: 'Stop completed',
    nextStop: 'Continue to next stop',
    nextStopHint: 'The route will automatically switch to',
    finishTour: 'Finish tour',
    audioBlocked: 'Tap play again. Your phone blocked the first attempt.',
    gpsActive: 'GPS active',
    gpsWaiting: 'Finding GPS…',
    gpsDenied: 'Location is off',
    gpsUnsupported: 'GPS unavailable',
    enableLocation: 'Enable location again',
    overview: 'Tour overview',
    current: 'Next stop',
    allStops: 'All stops',
    access: 'Access active',
    completing: 'Finishing tour…',
    noStops: 'This tour has no active stops yet.',
  },
  de: {
    brand: 'Ameland Audiotours',
    beforeStart: 'Vor dem Start',
    startTitle: 'Bereit loszugehen?',
    startText: 'Drücke auf Start, wenn du bereit bist. Ab dann folgst du Route und Standort vollständig in dieser App.',
    startButton: 'Tour und Navigation starten',
    startPrivacy: 'Dein Standort wird erst abgefragt, nachdem du auf Wanderung starten gedrückt hast.',
    firstStop: 'Erster Stopp',
    startCheckLocation: 'GPS führt dich zum nächsten Stopp',
    startCheckAudio: 'Nutze möglichst einen Ohrhörer oder Open-Ear-Audio',
    startCheckPace: 'Du gehst die Tour vollständig in deinem eigenen Tempo',
    stopOf: 'Stopp',
    of: 'von',
    onTheWay: 'Unterwegs zu Stopp',
    arrived: 'Angekommen bei Stopp',
    listened: 'Gehört',
    walkInstruction: 'Folge dem Fußweg. Die Geschichte wird freigeschaltet, sobald du den Stopp erreichst.',
    arrivedInstruction: 'Du bist am richtigen Ort. Nimm dir Zeit und starte die Geschichte.',
    distance: 'Noch zu gehen',
    progress: 'Fortschritt',
    openRoute: 'Mir in der App folgen',
    confirmArrival: 'Ich bin am Stopp',
    confirmArrivalHelp: 'Nutze dies nur, wenn GPS deinen Standort nicht automatisch erkennt.',
    listen: 'Geschichte anhören',
    play: 'Abspielen',
    pause: 'Pausieren',
    noAudio: 'Für diesen Stopp ist in der gewählten Sprache noch kein Audio verfügbar.',
    completeStop: 'Stopp abschließen',
    stopDone: 'Stopp abgeschlossen',
    nextStop: 'Weiter zum nächsten Stopp',
    nextStopHint: 'Die Route wechselt automatisch zu',
    finishTour: 'Tour abschließen',
    audioBlocked: 'Tippe erneut auf Abspielen. Dein Telefon hat den ersten Versuch blockiert.',
    gpsActive: 'GPS aktiv',
    gpsWaiting: 'GPS wird gesucht…',
    gpsDenied: 'Standort ist aus',
    gpsUnsupported: 'GPS nicht verfügbar',
    enableLocation: 'Standort erneut aktivieren',
    overview: 'Tourübersicht',
    current: 'Nächster Stopp',
    allStops: 'Alle Stopps',
    access: 'Zugang aktiv',
    completing: 'Tour wird beendet…',
    noStops: 'Diese Tour hat noch keine aktiven Stopps.',
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

function numberValue(source: PlayerStop | PlayerTour | null, keys: string[]) {
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
    return stringValue(source, ['short_description_nl', 'short_description', 'description_nl', 'description'])
  }
  if (language === 'en') {
    return stringValue(source, ['short_description_en', 'description_en', 'short_description_nl', 'short_description', 'description'])
  }
  return stringValue(source, ['short_description_de', 'description_de', 'short_description_nl', 'short_description', 'description'])
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

function formatDistance(meters: number | null, language: PlayerLanguage) {
  if (meters === null || !Number.isFinite(meters)) return '—'
  if (meters < 1000) return `${Math.max(0, Math.round(meters))} m`
  const formatted = (meters / 1000).toFixed(1)
  return `${language === 'nl' || language === 'de' ? formatted.replace('.', ',') : formatted} km`
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

function formatExpiry(expiresAt: string | null, language: PlayerLanguage) {
  if (!expiresAt) return COPY[language].access
  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) return COPY[language].access
  return `${COPY[language].access} · ${date.toLocaleDateString(
    language === 'nl' ? 'nl-NL' : language === 'de' ? 'de-DE' : 'en-GB',
    { day: '2-digit', month: 'short' }
  )}`
}

function tourDuration(tour: PlayerTour, language: PlayerLanguage) {
  const minutes = numberValue(tour, ['duration_minutes', 'duration'])
  if (minutes !== null) return `${Math.round(minutes)} min`
  return stringValue(tour, ['duration_label']) || (language === 'de' ? '90 Min.' : '90 min')
}

function tourDistance(tour: PlayerTour, language: PlayerLanguage) {
  const distance = numberValue(tour, ['distance_km', 'distance'])
  if (distance === null) return language === 'en' ? '6.5 km' : '6,5 km'
  const formatted = distance.toFixed(distance % 1 === 0 ? 0 : 1)
  return `${language === 'en' ? formatted : formatted.replace('.', ',')} km`
}

function LanguageSwitch({
  language,
  setLanguage,
  light = false,
}: {
  language: PlayerLanguage
  setLanguage: (language: PlayerLanguage) => void
  light?: boolean
}) {
  return (
    <div className={cn('flex shrink-0 items-center gap-1 rounded-full border p-1', light ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/10')}>
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          aria-pressed={language === item.code}
          onClick={() => setLanguage(item.code)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-black transition',
            language === item.code
              ? light
                ? 'bg-[#153f45] text-white shadow'
                : 'bg-white text-slate-950 shadow'
              : light
              ? 'text-slate-500 hover:bg-slate-100'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black tracking-tight text-white">{value}</p>
    </div>
  )
}

export function TourPlayer({ token, tour, stops, initialLanguage, expiresAt }: Props) {
  const [language, setLanguageState] = useState<PlayerLanguage>(initialLanguage)
  const [started, setStarted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [arrivedIndex, setArrivedIndex] = useState<number | null>(null)
  const [completedKeys, setCompletedKeys] = useState<string[]>([])
  const [manualArrivalKeys, setManualArrivalKeys] = useState<string[]>([])
  const [location, setLocation] = useState<GeoPoint | null>(null)
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [audioTime, setAudioTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [restored, setRestored] = useState(false)
  const [overviewOpen, setOverviewOpen] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [navigationFocusRequest, setNavigationFocusRequest] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const lastAcceptedLocationRef = useRef<GeoPoint | null>(null)
  const completingRef = useRef(false)
  const startedAtRef = useRef(Date.now())

  const cleanStops = useMemo(() => stops.filter(Boolean), [stops])
  const copy = COPY[language]
  const selectedStop = cleanStops[selectedIndex] || cleanStops[0] || null
  const selectedCoordinates = coordinatesFor(selectedStop)
  const selectedAudioUrl = audioFor(selectedStop, language)
  const selectedKey = stopKey(selectedStop, selectedIndex)
  const selectedTitle = titleFor(selectedStop, language) || `${copy.stopOf} ${selectedIndex + 1}`
  const selectedDescription = descriptionFor(selectedStop, language)
  const selectedIsCompleted = completedKeys.includes(selectedKey)
  const selectedIsArrived = arrivedIndex === selectedIndex || manualArrivalKeys.includes(selectedKey)
  const selectedCanListen = selectedIsArrived || selectedIsCompleted
  const isLastStop = selectedIndex >= cleanStops.length - 1
  const progress = `${Math.min(completedKeys.length, cleanStops.length)}/${cleanStops.length}`
  const storageKey = `aat.progress.${token}`

  const selectedDistance = useMemo(() => {
    if (!location || !selectedCoordinates) return null
    return distanceMeters(location, selectedCoordinates)
  }, [location, selectedCoordinates])

  function setLanguage(nextLanguage: PlayerLanguage) {
    setLanguageState(nextLanguage)
    try {
      window.localStorage.setItem('aat.language', nextLanguage)
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set('lang', nextLanguage)
      window.history.replaceState(null, '', nextUrl.toString())
    } catch {
      // De tour blijft zonder lokale opslag werken.
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

  function beginTour() {
    const nextIncomplete = cleanStops.findIndex(
      (stop, index) => !completedKeys.includes(stopKey(stop, index))
    )
    setSelectedIndex(nextIncomplete >= 0 ? nextIncomplete : 0)
    startedAtRef.current = Date.now()
    setStarted(true)
    requestLocation()
  }

  function goToStop(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), cleanStops.length - 1)
    setSelectedIndex(nextIndex)
    setArrivedIndex(null)
    setAudioBlocked(false)
    setOverviewOpen(false)
  }

  function focusAppNavigation() {
    if (!selectedCoordinates) return
    if (locationState !== 'active') requestLocation()
    setNavigationFocusRequest((current) => current + 1)
  }

  function confirmArrival() {
    setManualArrivalKeys((current) => current.includes(selectedKey) ? current : [...current, selectedKey])
    setArrivedIndex(selectedIndex)
  }

  function markSelectedComplete() {
    audioRef.current?.pause()
    setCompletedKeys((current) => current.includes(selectedKey) ? current : [...current, selectedKey])
    setPlaying(false)
  }

  function seekAudio(seconds: number) {
    const audio = audioRef.current
    if (!audio) return
    const maximum = Number.isFinite(audio.duration) ? audio.duration : Math.max(0, audio.currentTime + seconds)
    const next = Math.min(maximum, Math.max(0, audio.currentTime + seconds))
    audio.currentTime = next
    setAudioTime(next)
  }

  async function playOrPause() {
    const audio = audioRef.current
    if (!audio || !selectedAudioUrl || !selectedCanListen) return
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
  }

  async function advanceFromCurrent() {
    if (!selectedIsCompleted) return
    if (isLastStop) {
      await completeTour(completedKeys)
      return
    }
    goToStop(findNextIncomplete(completedKeys))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        const saved = JSON.parse(stored) as PersistedProgress
        if (Array.isArray(saved.completedKeys)) setCompletedKeys(saved.completedKeys)
        if (Array.isArray(saved.manualArrivalKeys)) setManualArrivalKeys(saved.manualArrivalKeys)
        setStarted(Boolean(saved.started))

        if (Array.isArray(saved.completedKeys) && saved.completedKeys.length > 0) {
          const nextIncomplete = cleanStops.findIndex(
            (stop, index) => !saved.completedKeys!.includes(stopKey(stop, index))
          )
          setSelectedIndex(nextIncomplete >= 0 ? nextIncomplete : Math.max(0, cleanStops.length - 1))
        } else if (Number.isInteger(saved.selectedIndex)) {
          setSelectedIndex(Math.max(0, Math.min(saved.selectedIndex || 0, cleanStops.length - 1)))
        }

        if (!window.location.search.includes('lang=') && saved.language) {
          setLanguageState(saved.language)
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
    setRestored(true)
  }, [cleanStops, storageKey])

  useEffect(() => {
    if (!restored) return
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          started,
          selectedIndex,
          completedKeys,
          manualArrivalKeys,
          language,
        } satisfies PersistedProgress)
      )
    } catch {
      // De tour blijft zonder lokale opslag werken.
    }
  }, [completedKeys, language, manualArrivalKeys, restored, selectedIndex, started, storageKey])

  useEffect(() => {
    if (restored && started && locationState === 'idle') requestLocation()
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [restored, started])

  useEffect(() => {
    if (!started || !location || !selectedStop || selectedDistance === null) {
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
  }, [arrivedIndex, location, selectedDistance, selectedIndex, selectedStop, started])

  useEffect(() => {
    setAudioBlocked(false)
    setPlaying(false)
    setAudioTime(0)
    setAudioDuration(0)
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.load()
  }, [language, selectedAudioUrl, selectedIndex])

  const nextStopIndex = isLastStop ? null : findNextIncomplete(completedKeys)
  const nextStopTitle = nextStopIndex === null
    ? ''
    : titleFor(cleanStops[nextStopIndex], language) || `${copy.stopOf} ${nextStopIndex + 1}`

  if (!cleanStops.length) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-black">{copy.brand}</h1>
          <p className="mt-3 text-slate-300">{copy.noStops}</p>
        </div>
      </main>
    )
  }

  if (!restored) {
    return <main className="min-h-[100dvh] bg-[#edf4f0]" />
  }

  if (!started) {
    return (
      <main className="min-h-[100dvh] bg-[#edf4f0] px-4 py-5 text-[#20372f] sm:py-10">
        <div className="mx-auto max-w-2xl">
          <header className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/images/ameland-audiotours-logo.webp"
                alt="Ameland Audiotours"
                width={52}
                height={52}
                className="h-12 w-12 rounded-full border border-white object-cover shadow-lg"
                priority
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{copy.brand}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#688076]">{formatExpiry(expiresAt, language)}</p>
              </div>
            </div>
            <LanguageSwitch language={language} setLanguage={setLanguage} light />
          </header>

          <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#d5e1da] bg-[#fffdf8] shadow-[0_24px_70px_rgba(32,55,47,.12)]">
            <div className="bg-[#153f45] p-6 text-white sm:p-9">
              <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-200">{copy.beforeStart}</p>
              <h1 className="mt-4 text-5xl font-black leading-[.92] tracking-[-.055em] sm:text-6xl">{copy.startTitle}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">{copy.startText}</p>

              <div className="mt-7 flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-full bg-white/10 px-3 py-2">{tourDuration(tour, language)}</span>
                <span className="rounded-full bg-white/10 px-3 py-2">{tourDistance(tour, language)}</span>
                <span className="rounded-full bg-white/10 px-3 py-2">{cleanStops.length} stops</span>
              </div>
            </div>

            <div className="p-6 sm:p-9">
              <div className="rounded-[1.4rem] border border-[#d9e4de] bg-[#edf4f0] p-5">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#6f8178]">{copy.firstStop}</p>
                <div className="mt-3 flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#153f45] text-sm font-black text-white">1</span>
                  <div>
                    <p className="font-black text-[#20372f]">{titleFor(cleanStops[0], language)}</p>
                    <p className="mt-1 text-sm leading-6 text-[#66746c]">{descriptionFor(cleanStops[0], language)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <p className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]"><LocateFixed className="mt-0.5 h-5 w-5 shrink-0 text-[#0f6f73]" />{copy.startCheckLocation}</p>
                <p className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]"><Headphones className="mt-0.5 h-5 w-5 shrink-0 text-[#0f6f73]" />{copy.startCheckAudio}</p>
                <p className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]"><Footprints className="mt-0.5 h-5 w-5 shrink-0 text-[#0f6f73]" />{copy.startCheckPace}</p>
              </div>

              <button
                type="button"
                onClick={beginTour}
                className="mt-8 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#e47750] px-6 text-lg font-black text-white shadow-[0_18px_40px_rgba(228,119,80,.28)] transition active:scale-[.99]"
              >
                <Footprints className="h-6 w-6" /> {copy.startButton}
              </button>
              <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-5 text-[#728078]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{copy.startPrivacy}</p>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const mapArrivedIndex = selectedIsArrived ? selectedIndex : arrivedIndex
  const locationLabel =
    locationState === 'active'
      ? copy.gpsActive
      : locationState === 'denied'
      ? copy.gpsDenied
      : locationState === 'unsupported'
      ? copy.gpsUnsupported
      : copy.gpsWaiting

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-slate-950 pb-28 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.10),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-5">
        <header className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-3 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/images/ameland-audiotours-logo.webp"
                alt="Ameland Audiotours"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full border border-white/20 object-cover shadow-lg"
                priority
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{copy.brand}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[.18em] text-emerald-300">{copy.stopOf} {selectedIndex + 1} {copy.of} {cleanStops.length}</p>
              </div>
            </div>
            <LanguageSwitch language={language} setLanguage={setLanguage} />
          </div>
        </header>

        <section className={cn('rounded-[1.5rem] border p-4 shadow-xl', selectedCanListen ? 'border-emerald-300/30 bg-emerald-300/10' : 'border-blue-300/20 bg-blue-400/10')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn('text-[10px] font-black uppercase tracking-[.2em]', selectedCanListen ? 'text-emerald-200' : 'text-blue-200')}>
                {selectedCanListen ? `${copy.arrived} ${selectedIndex + 1}` : `${copy.onTheWay} ${selectedIndex + 1}`}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{selectedTitle}</h1>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              className={cn('shrink-0 rounded-full border px-3 py-2 text-xs font-black', locationState === 'active' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/30 bg-amber-300/10 text-amber-100')}
            >
              {locationLabel}
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{selectedCanListen ? copy.arrivedInstruction : copy.walkInstruction}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label={copy.distance} value={formatDistance(selectedDistance, language)} />
            <Metric label={copy.progress} value={progress} />
          </div>
        </section>

        {locationState === 'denied' ? (
          <button
            type="button"
            onClick={requestLocation}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 text-sm font-black text-amber-100"
          >
            <LocateFixed className="h-5 w-5" /> {copy.enableLocation}
          </button>
        ) : null}

        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur">
          <div className="h-[48vh] min-h-[360px] max-h-[590px]">
            <PlayerMap
              stops={cleanStops}
              language={language}
              location={location}
              selectedIndex={selectedIndex}
              arrivedIndex={mapArrivedIndex}
              reachedKeys={completedKeys}
              focusRequest={navigationFocusRequest}
            />
          </div>

          <div className="border-t border-white/10 bg-slate-950/94 p-4">
            {!selectedCanListen ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={focusAppNavigation}
                  disabled={!selectedCoordinates}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 text-sm font-black text-white shadow-lg disabled:opacity-40"
                >
                  <Navigation className="h-5 w-5" /> {copy.openRoute}
                </button>
                <button
                  type="button"
                  onClick={confirmArrival}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white"
                >
                  <MapPin className="h-5 w-5" /> {copy.confirmArrival}
                </button>
                <p className="text-xs leading-5 text-slate-400 sm:col-span-2 sm:text-right">{copy.confirmArrivalHelp}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-300">{copy.listen}</p>
                    {selectedDescription ? <p className="mt-2 text-sm leading-6 text-slate-300">{selectedDescription}</p> : null}
                  </div>
                  {selectedIsCompleted ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-black text-slate-950"><CheckCircle2 className="h-4 w-4" />{copy.listened}</span> : null}
                </div>

                {selectedAudioUrl ? (
                  <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-3">
                    <audio
                      ref={audioRef}
                      src={selectedAudioUrl}
                      preload="metadata"
                      playsInline
                      onLoadedMetadata={(event) => setAudioDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
                      onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime)}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => void handleAudioEnded()}
                    />
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, audioDuration)}
                      step={1}
                      value={Math.min(audioTime, Math.max(0, audioDuration))}
                      onChange={(event) => {
                        const next = Number(event.currentTarget.value)
                        if (audioRef.current) audioRef.current.currentTime = next
                        setAudioTime(next)
                      }}
                      className="h-2 w-full cursor-pointer accent-emerald-300"
                      aria-label="Audio position"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>{formatAudioTime(audioTime)}</span>
                      <span>{formatAudioTime(audioDuration)}</span>
                    </div>
                    {audioBlocked ? <p className="mt-3 rounded-2xl bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">{copy.audioBlocked}</p> : null}
                    {!selectedIsCompleted ? (
                      <button
                        type="button"
                        onClick={markSelectedComplete}
                        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition active:scale-[.99]"
                      >
                        <CheckCircle2 className="h-5 w-5" /> {copy.completeStop}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                    <p>{copy.noAudio}</p>
                    {!selectedIsCompleted ? (
                      <button
                        type="button"
                        onClick={markSelectedComplete}
                        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-black text-slate-950"
                      >
                        <CheckCircle2 className="h-5 w-5" /> {copy.completeStop}
                      </button>
                    ) : null}
                  </div>
                )}

                {selectedIsCompleted ? (
                  <div aria-live="polite" className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4">
                    <p className="flex items-center gap-2 text-sm font-black text-emerald-200"><CheckCircle2 className="h-5 w-5" /> {copy.stopDone}</p>
                    {nextStopTitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{copy.nextStopHint} <strong className="text-white">{nextStopTitle}</strong>.</p> : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={() => setOverviewOpen((current) => !current)}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
            aria-expanded={overviewOpen}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">{copy.overview}</p>
              <p className="mt-1 text-sm font-black text-white">{progress} · {formatExpiry(expiresAt, language)}</p>
            </div>
            {overviewOpen ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
          </button>

          {overviewOpen ? (
            <div className="space-y-2 border-t border-white/10 p-3">
              {cleanStops.map((stop, index) => {
                const key = stopKey(stop, index)
                const completed = completedKeys.includes(key)
                const current = index === selectedIndex
                const coordinates = coordinatesFor(stop)
                const distance = location && coordinates ? distanceMeters(location, coordinates) : null

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => goToStop(index)}
                    className={cn('flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition', current ? 'border-emerald-300/40 bg-emerald-300/10' : 'border-white/10 bg-white/[0.03]')}
                  >
                    <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black', completed ? 'bg-emerald-300 text-slate-950' : current ? 'bg-white text-slate-950' : 'bg-slate-800 text-white')}>
                      {completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-black text-white">{titleFor(stop, language)}</span>
                    {current ? <Navigation className="h-5 w-5 shrink-0 text-emerald-300" /> : distance !== null ? <span className="shrink-0 text-xs font-bold text-slate-400">{formatDistance(distance, language)}</span> : null}
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-white/10 bg-slate-950/94 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_50px_rgba(0,0,0,.4)] backdrop-blur-xl">
        <div className="mx-auto max-w-xl">
          {isCompleting ? (
            <div className="flex min-h-14 items-center justify-center rounded-2xl bg-emerald-300 px-5 text-sm font-black text-slate-950">{copy.completing}</div>
          ) : selectedIsCompleted ? (
            <button
              type="button"
              onClick={() => void advanceFromCurrent()}
              className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#e96551] px-5 text-base font-black text-white shadow-[0_16px_42px_rgba(233,101,81,.32)] transition active:scale-[.99]"
            >
              {isLastStop ? <CheckCircle2 className="h-6 w-6" /> : <Navigation className="h-6 w-6" />}
              {isLastStop ? copy.finishTour : copy.nextStop}
            </button>
          ) : selectedCanListen && selectedAudioUrl ? (
            <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-2">
              <button type="button" onClick={() => seekAudio(-15)} className="inline-flex min-h-14 items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/10 text-sm font-black text-white"><RotateCcw className="h-5 w-5" />15</button>
              <button type="button" onClick={() => void playOrPause()} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-3 text-sm font-black text-slate-950 shadow-xl">{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}{playing ? copy.pause : copy.play}</button>
              <button type="button" onClick={() => seekAudio(15)} className="inline-flex min-h-14 items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/10 text-sm font-black text-white">15<RotateCw className="h-5 w-5" /></button>
            </div>
          ) : (
            <div className="grid grid-cols-[1.35fr_1fr] gap-2">
              <button type="button" onClick={focusAppNavigation} disabled={!selectedCoordinates} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#e96551] px-4 text-sm font-black text-white shadow-xl disabled:opacity-40"><Navigation className="h-5 w-5" />{copy.openRoute}</button>
              <button type="button" onClick={confirmArrival} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-black text-white"><MapPin className="h-5 w-5" />{copy.confirmArrival}</button>
            </div>
          )}
        </div>
      </nav>
    </main>
  )
}
