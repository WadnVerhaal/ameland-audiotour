'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  NormalizedStopAudio,
  StopLike,
  distanceMeters,
  getBrowserAudioLanguage,
  normalizeStopAudio,
} from '@/lib/player/stop-audio'

type PositionState = {
  lat: number
  lng: number
  accuracy?: number
}

type NearestStopState = {
  stop: NormalizedStopAudio
  distance: number
}

type StopAudioAutoplayerProps = {
  stops: StopLike[]
  defaultRadiusMeters?: number
}

function getSessionKey() {
  if (typeof window === 'undefined') return 'ameland-audio-played-stops'

  const tokenFromPath = window.location.pathname.split('/').filter(Boolean).pop() || 'unknown'
  const lang = new URLSearchParams(window.location.search).get('lang') || 'nl'

  return `ameland-audio-played-stops:${tokenFromPath}:${lang}`
}

function readPlayedStops(): string[] {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(window.sessionStorage.getItem(getSessionKey()) || '[]')
  } catch {
    return []
  }
}

function writePlayedStops(ids: string[]) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(getSessionKey(), JSON.stringify(Array.from(new Set(ids))))
}

function getSpeechVoiceLanguage(language: string) {
  if (language === 'de') return 'de-DE'
  if (language === 'en') return 'en-GB'

  return 'nl-NL'
}

async function unlockAudioSystems() {
  if (typeof window === 'undefined') return

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (AudioContextClass) {
      const audioContext = new AudioContextClass()

      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      gain.gain.value = 0.0001
      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.03)
    }
  } catch {
    // Browser audio unlock is best effort.
  }

  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(' ')
      utterance.volume = 0
      window.speechSynthesis.speak(utterance)
      window.speechSynthesis.cancel()
    }
  } catch {
    // Speech unlock is best effort.
  }
}

export function StopAudioAutoplayer({
  stops,
  defaultRadiusMeters = Number(process.env.NEXT_PUBLIC_AUDIO_TRIGGER_RADIUS_METERS || 25),
}: StopAudioAutoplayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const [enabled, setEnabled] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'watching' | 'blocked' | 'unavailable'>('idle')
  const [position, setPosition] = useState<PositionState | null>(null)
  const [playedStopIds, setPlayedStopIds] = useState<string[]>([])
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null)
  const [manualRequiredStopId, setManualRequiredStopId] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Audio staat klaar.')
  const [errorText, setErrorText] = useState('')

  const language = useMemo(() => getBrowserAudioLanguage(), [])

  const normalizedStops = useMemo(() => {
    return (stops || [])
      .map((stop, index) => normalizeStopAudio(stop, index, language, defaultRadiusMeters))
      .filter((stop) => stop.lat !== null && stop.lng !== null)
      .sort((a, b) => a.order - b.order)
  }, [stops, language, defaultRadiusMeters])

  const nearest = useMemo<NearestStopState | null>(() => {
    if (!position || normalizedStops.length === 0) return null

    const distances = normalizedStops.map((stop) => ({
      stop,
      distance: distanceMeters(
        { lat: position.lat, lng: position.lng },
        { lat: stop.lat as number, lng: stop.lng as number }
      ),
    }))

    distances.sort((a, b) => a.distance - b.distance)

    return distances[0] || null
  }, [position, normalizedStops])

  const nextUnplayedStop = useMemo(() => {
    return normalizedStops.find((stop) => !playedStopIds.includes(stop.id)) || null
  }, [normalizedStops, playedStopIds])

  useEffect(() => {
    setPlayedStopIds(readPlayedStops())
  }, [])

  useEffect(() => {
    if (!enabled) return

    if (!('geolocation' in navigator)) {
      setPermissionStatus('unavailable')
      setErrorText('Locatie is niet beschikbaar op dit apparaat.')
      return
    }

    setPermissionStatus('watching')
    setStatusText('Audio is actief. We starten het verhaal automatisch bij een stop.')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (geoPosition) => {
        setPosition({
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
        })
        setErrorText('')
      },
      (error) => {
        setPermissionStatus('blocked')

        if (error.code === error.PERMISSION_DENIED) {
          setErrorText('Locatie-toegang is geweigerd. Zet locatie aan om audio automatisch te starten.')
        } else {
          setErrorText('Je locatie kon niet worden bepaald. Probeer het straks opnieuw.')
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 12000,
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [enabled])

  async function playStop(stop: NormalizedStopAudio, manual = false) {
    if (!enabled && !manual) return

    setManualRequiredStopId(null)
    setCurrentlyPlayingId(stop.id)
    setErrorText('')

    const markPlayed = () => {
      const next = Array.from(new Set([...playedStopIds, stop.id]))
      setPlayedStopIds(next)
      writePlayedStops(next)
    }

    if (stop.audioUrl) {
      try {
        if (!audioRef.current) return

        audioRef.current.pause()
        audioRef.current.src = stop.audioUrl
        audioRef.current.currentTime = 0

        await audioRef.current.play()

        markPlayed()
        setStatusText(`Nu speelt: ${stop.title}`)
        return
      } catch {
        setManualRequiredStopId(stop.id)
        setStatusText(`Tik om het verhaal van ${stop.title} af te spelen.`)
        return
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && stop.fallbackText) {
      try {
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(stop.fallbackText)
        utterance.lang = getSpeechVoiceLanguage(language)
        utterance.rate = 0.95
        utterance.pitch = 1
        utterance.volume = 1

        utterance.onend = () => {
          setCurrentlyPlayingId(null)
        }

        window.speechSynthesis.speak(utterance)

        markPlayed()
        setStatusText(`Nu speelt: ${stop.title}`)
        return
      } catch {
        setManualRequiredStopId(stop.id)
        setStatusText(`Tik om het verhaal van ${stop.title} af te spelen.`)
        return
      }
    }

    setCurrentlyPlayingId(null)
    setErrorText(`Er is nog geen audiobericht gekoppeld aan ${stop.title}.`)
  }

  useEffect(() => {
    if (!enabled || !nearest) return

    const { stop, distance } = nearest
    const alreadyPlayed = playedStopIds.includes(stop.id)
    const isInsideTriggerRadius = distance <= stop.radiusMeters

    if (!alreadyPlayed && isInsideTriggerRadius && currentlyPlayingId !== stop.id) {
      void playStop(stop)
    }
  }, [enabled, nearest, playedStopIds, currentlyPlayingId])

  async function handleEnable() {
    await unlockAudioSystems()
    setEnabled(true)
    setStatusText('Audio is geactiveerd. Geef locatie-toegang als je telefoon daarom vraagt.')
  }

  function handleResetPlayedStops() {
    setPlayedStopIds([])
    writePlayedStops([])
    setCurrentlyPlayingId(null)
    setManualRequiredStopId(null)
    setStatusText('Audiostops zijn gereset. Je kunt de verhalen opnieuw beluisteren.')
  }

  function handlePause() {
    audioRef.current?.pause()

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    setCurrentlyPlayingId(null)
    setStatusText('Audio gepauzeerd.')
  }

  if (!stops || stops.length === 0) {
    return null
  }

  const nearestDistance = nearest ? Math.round(nearest.distance) : null
  const canPlayNearestManually = Boolean(nearest?.stop)

  return (
    <section className="mx-auto mt-4 w-full max-w-5xl rounded-3xl border border-emerald-900/10 bg-[#fffaf1] p-4 shadow-sm">
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlayingId(null)}
        preload="none"
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800/70">
            Audio per stop
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#244439]">
            Verhalen starten automatisch bij de juiste plek
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Zet audio één keer aan. Daarna speelt de app bij iedere stop het juiste verhaal af.
            Gebruik één oordopje of open-ear audio en blijf letten op verkeer en je omgeving.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!enabled ? (
            <button
              type="button"
              onClick={handleEnable}
              className="rounded-full bg-[#244439] px-5 py-3 text-sm font-bold text-white shadow-sm"
            >
              Audio activeren
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="rounded-full bg-[#dfc9a6] px-5 py-3 text-sm font-bold text-[#244439] shadow-sm"
            >
              Pauzeer audio
            </button>
          )}

          <button
            type="button"
            onClick={handleResetPlayedStops}
            className="rounded-full border border-[#244439]/20 bg-white px-5 py-3 text-sm font-bold text-[#244439]"
          >
            Opnieuw luisteren
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-[#edf4ee] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800/70">
            Status
          </p>
          <p className="mt-2 text-sm font-semibold text-[#244439]">
            {statusText}
          </p>
          {permissionStatus === 'blocked' ? (
            <p className="mt-2 text-xs leading-5 text-red-700">
              Locatie staat uit of is geweigerd.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800/70">
            Dichtstbijzijnde stop
          </p>

          <p className="mt-2 text-sm font-semibold text-[#244439]">
            {nearest?.stop.title || 'Locatie wordt bepaald...'}
          </p>

          {nearestDistance !== null ? (
            <p className="mt-1 text-xs text-slate-600">
              Ongeveer {nearestDistance} meter van jou.
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-600">
              Activeer audio en locatie om dit te bepalen.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800/70">
            Volgende verhaal
          </p>

          <p className="mt-2 text-sm font-semibold text-[#244439]">
            {nextUnplayedStop?.title || 'Alle verhalen zijn afgespeeld.'}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {playedStopIds.length} van {normalizedStops.length} audiostops beluisterd.
          </p>
        </div>
      </div>

      {errorText ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorText}
        </div>
      ) : null}

      {manualRequiredStopId && nearest?.stop.id === manualRequiredStopId ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Je telefoon vraagt om een handmatige tik om audio te starten.
          </p>

          <button
            type="button"
            onClick={() => playStop(nearest.stop, true)}
            className="mt-3 rounded-full bg-[#244439] px-5 py-3 text-sm font-bold text-white"
          >
            Speel {nearest.stop.title} af
          </button>
        </div>
      ) : null}

      {canPlayNearestManually ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => nearest && playStop(nearest.stop, true)}
            className="rounded-full border border-[#244439]/20 bg-white px-4 py-2 text-sm font-bold text-[#244439]"
          >
            Speel dichtstbijzijnde stop
          </button>
        </div>
      ) : null}
    </section>
  )
}
