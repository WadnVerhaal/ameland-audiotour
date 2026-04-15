'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import {
  Pause,
  Play,
  Navigation,
  ArrowRight,
  ArrowLeft,
  LocateFixed,
  CheckCircle2,
  Volume2,
  Compass,
  Route,
  ChevronDown,
  ChevronUp,
  Waves,
  MapPinned,
} from 'lucide-react'
import type { TourStop } from '@/types/tour'
import {
  APP_LANGUAGE_STORAGE_KEY,
  type AppLanguage,
  getStopShortDescription,
  getStopTitle,
  isAppLanguage,
  translations,
} from '@/lib/app-language'
import { distanceInMeters } from '@/lib/utils/geo'
import TourCompletionContainer from '@/components/tour/tour-completion-container'

function getStopAudioUrl(stop: TourStop, language: string) {
  if (language === 'en') {
    return stop.audio_url_en || stop.audio_url_nl || stop.audio_url_de || stop.audio_url || null
  }

  if (language === 'de') {
    return stop.audio_url_de || stop.audio_url_nl || stop.audio_url_en || stop.audio_url || null
  }

  return stop.audio_url_nl || stop.audio_url_en || stop.audio_url_de || stop.audio_url || null
}

type Props = {
  token: string
  stops: TourStop[]
  language: AppLanguage
  tourId?: string
  tourSlug?: string
  tourTitle?: string
  customerEmail?: string | null
  distanceKm?: number | null
}

type Position = {
  lat: number
  lng: number
  accuracy?: number
}

type RoutePoint = [number, number]
type GeoPermissionState = 'unknown' | 'granted' | 'prompt' | 'denied'

const BRAND = {
  pageBg: '#f4fbfb',
  panelBg: '#ffffff',
  panelSoft: '#f7ffff',
  border: '#dbecef',
  borderStrong: '#cfe3e5',
  heading: '#0d3d48',
  body: '#143a43',
  muted: '#5b757b',
  accent: '#0f4b58',
  accentAlt: '#12879a',
  coral: '#ef7f63',
  successSoft: '#eef8f8',
  shadow: '0 24px 70px rgba(15,75,88,0.08)',
  shadowStrong: '0 34px 90px rgba(15,75,88,0.14)',
}

const userIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:18px;
      height:18px;
      border-radius:9999px;
      background:#0f4b58;
      border:3px solid #ffffff;
      box-shadow:0 0 0 4px rgba(15,75,88,.16);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const stopIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:20px;
      height:20px;
      border-radius:9999px;
      background:#ef7f63;
      border:3px solid #ffffff;
      box-shadow:0 0 0 4px rgba(239,127,99,.16);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function formatDistance(meters: number) {
  const roundedMeters = Math.round(meters)
  if (roundedMeters < 1000) return `${roundedMeters} m`
  return `${(roundedMeters / 1000).toFixed(1)} km`
}

function estimateWalkingTime(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining === 0 ? `${hours}u` : `${hours}u ${remaining}m`
}

function estimateWalkingSecondsFromMeters(meters: number) {
  const walkingSpeedMetersPerSecond = 1.3
  return Math.max(60, Math.round(meters / walkingSpeedMetersPerSecond))
}

function normalizeWalkingDuration(
  distanceMeters: number,
  apiDurationSeconds: number | null | undefined
) {
  const baseline = estimateWalkingSecondsFromMeters(distanceMeters)

  if (!apiDurationSeconds || !Number.isFinite(apiDurationSeconds)) {
    return baseline
  }

  return Math.max(Math.round(apiDurationSeconds), baseline)
}

async function snapToWalkingNetwork(lat: number, lng: number, signal?: AbortSignal) {
  const url =
    `https://router.project-osrm.org/nearest/v1/foot/` +
    `${lng},${lat}?number=1`

  const response = await fetch(url, {
    method: 'GET',
    signal,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Nearest request failed: ${response.status}`)
  }

  const data = await response.json()
  const waypoint = data?.waypoints?.[0]
  const location = waypoint?.location

  if (!location || !Array.isArray(location) || location.length < 2) {
    throw new Error('No snapped point found')
  }

  return {
    lat: Number(location[1]),
    lng: Number(location[0]),
  }
}

function RecenterMap({
  position,
  stop,
}: {
  position: Position | null
  stop: TourStop | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!position && !stop) return

    if (position && stop?.lat && stop?.lng) {
      const bounds = L.latLngBounds(
        [position.lat, position.lng],
        [Number(stop.lat), Number(stop.lng)]
      )
      map.fitBounds(bounds, { padding: [28, 28], animate: true, maxZoom: 17 })
      return
    }

    if (position) {
      map.setView([position.lat, position.lng], 16, { animate: true })
      return
    }

    if (stop?.lat && stop?.lng) {
      map.setView([Number(stop.lat), Number(stop.lng)], 16, { animate: true })
    }
  }, [position, stop, map])

  return null
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      className="rounded-[1.35rem] border bg-white p-3"
      style={{
        borderColor: BRAND.border,
        boxShadow: '0 12px 35px rgba(18,75,84,0.06)',
      }}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5a8d93]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[#143a43]">{value}</p>
    </div>
  )
}

export function TourPlayer({
  token,
  stops,
  language: initialLanguage,
  tourId,
  tourSlug,
  tourTitle,
  customerEmail,
  distanceKm,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const lastRoutePositionRef = useRef<Position | null>(null)
  const lastRouteRequestAtRef = useRef<number>(0)
  const startedAtRef = useRef<number>(Date.now())

  const [language, setLanguage] = useState<AppLanguage>(initialLanguage)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gpsAllowed, setGpsAllowed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [hasArrived, setHasArrived] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [showStops, setShowStops] = useState(false)
  const [permissionState, setPermissionState] = useState<GeoPermissionState>('unknown')
  const [routeLine, setRouteLine] = useState<RoutePoint[]>([])
  const [connectorLine, setConnectorLine] = useState<RoutePoint[]>([])
  const [routeDistance, setRouteDistance] = useState<number | null>(null)
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const currentStop = useMemo(() => stops[currentIndex] ?? null, [stops, currentIndex])
  const t = translations[language]
  const currentStopTitle = getStopTitle(currentStop, language) ?? t.activeStopFallback
  const resolvedTourId = tourId ?? token
  const resolvedTourSlug = tourSlug ?? token
  const resolvedTourTitle = tourTitle ?? 'Ameland audiotour'
  const isLastStop = currentIndex === stops.length - 1

  useEffect(() => {
    setLanguage(initialLanguage)

    try {
      const storedLanguage = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY)
      if (isAppLanguage(storedLanguage)) {
        setLanguage(storedLanguage)
      }
    } catch {
      // ignore
    }
  }, [initialLanguage])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  async function checkPermissionState() {
    try {
      if (!navigator.permissions) {
        setPermissionState('unknown')
        return
      }

      const result = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      })

      setPermissionState(result.state as GeoPermissionState)

      result.onchange = () => {
        setPermissionState(result.state as GeoPermissionState)
      }
    } catch {
      setPermissionState('unknown')
    }
  }

  function applyPosition(pos: GeolocationPosition) {
    setGpsAllowed(true)
    setPermissionState('granted')
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    })
    setError(null)
  }

  function clearLocationWatch() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  function startWatchingLocation() {
    if (!navigator.geolocation) {
      setError(t.permissionUnsupported)
      return
    }

    clearLocationWatch()

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        applyPosition(pos)
      },
      (geoError) => {
        setGpsAllowed(false)

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionState('denied')
          setError(t.locationDenied)
          return
        }

        setError(t.locationUnavailable)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    watchIdRef.current = watchId
  }

  function requestLocationAgain() {
    setError(null)

    if (!navigator.geolocation) {
      setError(t.permissionUnsupported)
      return
    }

    clearLocationWatch()

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPosition(pos)
        startWatchingLocation()
      },
      async (geoError) => {
        await checkPermissionState()

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGpsAllowed(false)

          if (navigator.permissions) {
            try {
              const result = await navigator.permissions.query({
                name: 'geolocation' as PermissionName,
              })

              if (result.state === 'prompt') {
                setPermissionState('prompt')
                setError(t.locationPromptNotOpened)
                return
              }

              if (result.state === 'denied') {
                setPermissionState('denied')
                setError(t.locationStillBlocked)
                return
              }
            } catch {
              // fallback below
            }
          }

          setPermissionState('denied')
          setError(t.locationRetryFailed)
          return
        }

        setError(t.locationRestartFailed)
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )
  }

  function pauseCurrentStop() {
    if (!audioRef.current) return

    audioRef.current.pause()
    setPlaying(false)
  }

  async function playCurrentStop() {
    if (!audioRef.current || !currentStop) return

    const nextAudioUrl = getStopAudioUrl(currentStop, language)
    if (!nextAudioUrl) return

    const audio = audioRef.current
    if (audio.src !== nextAudioUrl) {
      audio.src = nextAudioUrl
      audio.load()
    }

    try {
      await audio.play()
      setPlaying(true)
      setError(null)
    } catch {
      setError(t.audioAutoStartFailed)
    }
  }

  useEffect(() => {
    void checkPermissionState()
    startWatchingLocation()

    return () => {
      clearLocationWatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setHasArrived(false)
    setPlaying(false)

    if (!audioRef.current) return

    const nextAudioUrl = currentStop ? getStopAudioUrl(currentStop, language) : null

    audioRef.current.pause()
    audioRef.current.currentTime = 0

    if (nextAudioUrl) {
      audioRef.current.src = nextAudioUrl
      audioRef.current.load()
    } else {
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
  }, [currentIndex, currentStop, language])

  const fallbackDistanceToStop = useMemo(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng) return null

    return distanceInMeters(
      position.lat,
      position.lng,
      Number(currentStop.lat),
      Number(currentStop.lng)
    )
  }, [position, currentStop])

  const distanceToStop = routeDistance ?? fallbackDistanceToStop
  const timeToStopSeconds =
    distanceToStop !== null
      ? normalizeWalkingDuration(distanceToStop, routeDurationSeconds)
      : null

  useEffect(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng) {
      setRouteLine([])
      setConnectorLine([])
      setRouteDistance(null)
      setRouteDurationSeconds(null)
      return
    }

    const currentAudioUrl = getStopAudioUrl(currentStop, language)
    if (!currentAudioUrl || playing) return

    const triggerRadius = Number(currentStop.trigger_radius_meters ?? 35)
    const distance = distanceInMeters(
      position.lat,
      position.lng,
      Number(currentStop.lat),
      Number(currentStop.lng)
    )

    if (distance <= triggerRadius) {
      setHasArrived(true)
      void playCurrentStop()
    }
  }, [position, currentStop, playing, language])

  useEffect(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng) {
      setRouteLine([])
      setConnectorLine([])
      setRouteDistance(null)
      setRouteDurationSeconds(null)
      return
    }

    const lastPos = lastRoutePositionRef.current
    const movedEnough =
      !lastPos ||
      distanceInMeters(position.lat, position.lng, lastPos.lat, lastPos.lng) > 20

    const waitedLongEnough = Date.now() - lastRouteRequestAtRef.current > 12000

    if (!movedEnough && !waitedLongEnough) return

    const controller = new AbortController()
    const startLat = position.lat
    const startLng = position.lng
    const stopLat = Number(currentStop.lat)
    const stopLng = Number(currentStop.lng)

    async function loadWalkingRoute() {
      try {
        const [snappedStart, snappedStop] = await Promise.all([
          snapToWalkingNetwork(startLat, startLng, controller.signal),
          snapToWalkingNetwork(stopLat, stopLng, controller.signal),
        ])

        const url =
          `https://router.project-osrm.org/route/v1/foot/` +
          `${snappedStart.lng},${snappedStart.lat};${snappedStop.lng},${snappedStop.lat}` +
          `?overview=full&geometries=geojson&alternatives=false&steps=false`

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Route request failed: ${response.status}`)
        }

        const data = await response.json()
        const route = data?.routes?.[0]

        if (!route?.geometry?.coordinates?.length) {
          throw new Error('No route found')
        }

        const coordinates: RoutePoint[] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        )

        const startConnectorDistance = distanceInMeters(
          startLat,
          startLng,
          snappedStart.lat,
          snappedStart.lng
        )

        const stopConnectorDistance = distanceInMeters(
          snappedStop.lat,
          snappedStop.lng,
          stopLat,
          stopLng
        )

        const connectorSegments: RoutePoint[] = []

        if (startConnectorDistance > 8) {
          connectorSegments.push([startLat, startLng], [snappedStart.lat, snappedStart.lng])
        }

        if (stopConnectorDistance > 8) {
          setConnectorLine([
            [snappedStop.lat, snappedStop.lng],
            [stopLat, stopLng],
          ])
        } else {
          setConnectorLine([])
        }

        const nextDistance =
          (route.distance ?? distanceInMeters(snappedStart.lat, snappedStart.lng, snappedStop.lat, snappedStop.lng)) +
          startConnectorDistance +
          stopConnectorDistance

        setRouteLine(coordinates)
        setRouteDistance(nextDistance)
        setRouteDurationSeconds(normalizeWalkingDuration(nextDistance, route.duration ?? null))
      } catch {
        const straightDistance = distanceInMeters(startLat, startLng, stopLat, stopLng)

        setRouteLine([
          [startLat, startLng],
          [stopLat, stopLng],
        ])
        setConnectorLine([])
        setRouteDistance(straightDistance)
        setRouteDurationSeconds(estimateWalkingSecondsFromMeters(straightDistance))
      } finally {
        lastRoutePositionRef.current = { lat: startLat, lng: startLng }
        lastRouteRequestAtRef.current = Date.now()
      }
    }

    void loadWalkingRoute()

    return () => controller.abort()
  }, [position, currentStop])

  function nextStop() {
    pauseCurrentStop()
    setCurrentIndex((prev) => Math.min(prev + 1, stops.length - 1))
  }

  function previousStop() {
    pauseCurrentStop()
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  function goToStop(index: number) {
    pauseCurrentStop()
    setCurrentIndex(index)
  }

  function openWalkingRoute() {
    if (!currentStop?.lat || !currentStop?.lng) return

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${Number(currentStop.lat)},${Number(
        currentStop.lng
      )}&travelmode=walking`,
      '_blank'
    )
  }

  function handleAudioEnded() {
    setPlaying(false)

    if (isLastStop) {
      setShowCompletionScreen(true)
      return
    }

    setCurrentIndex((prev) => Math.min(prev + 1, stops.length - 1))
  }

  const mapCenter: [number, number] = position
    ? [position.lat, position.lng]
    : currentStop?.lat && currentStop?.lng
      ? [Number(currentStop.lat), Number(currentStop.lng)]
      : [53.4396, 5.77]

  const progress = stops.length > 0 ? ((currentIndex + 1) / stops.length) * 100 : 0

  const mapStyle: CSSProperties = {
    height: '340px',
    width: '100%',
  }

  if (showCompletionScreen) {
    return (
      <TourCompletionContainer
        tourId={resolvedTourId}
        tourSlug={resolvedTourSlug}
        tourTitle={resolvedTourTitle}
        email={customerEmail ?? null}
        stopsTotal={stops.length}
        stopsCompleted={stops.length}
        durationSeconds={elapsedSeconds}
        distanceKm={distanceKm ?? 0}
        language={language}
      />
    )
  }

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      <section
        className="relative overflow-hidden rounded-[2.4rem] border bg-white"
        style={{
          borderColor: BRAND.border,
          boxShadow: BRAND.shadowStrong,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(27,150,165,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(239,127,99,0.08),transparent_24%)]" />
        <div className="relative p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef8f8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4f8a8e]">
                <Waves className="h-3.5 w-3.5" />
                {t.tourActive}
              </div>

              <h1 className="mt-3 text-xl font-semibold leading-tight text-[#143a43]">
                {currentStopTitle}
              </h1>

              <p className="mt-2 text-sm text-[#5b757b]">
                {t.stopLabel} {currentIndex + 1} {t.of} {stops.length}
              </p>
            </div>

            <div
              className="shrink-0 rounded-2xl px-3 py-2 text-right"
              style={{
                background: hasArrived ? '#eef8f8' : '#ffffff',
                color: BRAND.accent,
                border: `1px solid ${BRAND.border}`,
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#5a8d93]">
                {t.status}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {hasArrived ? t.arrived : t.underway}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#e7f1f2]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: BRAND.accent }}
            />
          </div>

          <div
            className="mt-4 overflow-hidden rounded-[1.8rem] border bg-white"
            style={{
              borderColor: BRAND.borderStrong,
              boxShadow: '0 12px 35px rgba(18,75,84,0.08)',
            }}
          >
            <MapContainer center={mapCenter} zoom={16} style={mapStyle} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <RecenterMap position={position} stop={currentStop} />

              {position ? (
                <>
                  <Marker position={[position.lat, position.lng]} icon={userIcon}>
                    <Popup>{t.youAreHere}</Popup>
                  </Marker>
                  {position.accuracy ? (
                    <Circle
                      center={[position.lat, position.lng]}
                      radius={position.accuracy}
                      pathOptions={{
                        color: BRAND.accent,
                        fillColor: BRAND.accent,
                        fillOpacity: 0.08,
                        opacity: 0.18,
                      }}
                    />
                  ) : null}
                </>
              ) : null}

              {currentStop?.lat && currentStop?.lng ? (
                <>
                  <Marker
                    position={[Number(currentStop.lat), Number(currentStop.lng)]}
                    icon={stopIcon}
                  >
                    <Popup>
                      <div className="font-medium">{currentStopTitle}</div>
                      <div className="text-sm text-slate-500">{t.nextStop}</div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[Number(currentStop.lat), Number(currentStop.lng)]}
                    radius={Number(currentStop.trigger_radius_meters ?? 35)}
                    pathOptions={{
                      color: BRAND.coral,
                      fillColor: BRAND.coral,
                      fillOpacity: 0.1,
                      opacity: 0.28,
                    }}
                  />
                </>
              ) : null}

              {routeLine.length > 1 ? (
                <Polyline
                  positions={routeLine}
                  pathOptions={{
                    color: BRAND.accentAlt,
                    weight: 5,
                    opacity: 0.9,
                  }}
                />
              ) : null}

              {connectorLine.length > 1 ? (
                <Polyline
                  positions={connectorLine}
                  pathOptions={{
                    color: BRAND.coral,
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '6 10',
                  }}
                />
              ) : null}
            </MapContainer>
          </div>

          <div
            className="mt-4 rounded-[1.6rem] border bg-[#f8ffff] p-4"
            style={{ borderColor: BRAND.borderStrong }}
          >
            <div className="flex items-start gap-3">
              <Volume2 className="mt-0.5 h-5 w-5 text-[#12879a]" />
              <div>
                <p className="text-sm font-semibold text-[#143a43]">{t.safeListeningTitle}</p>
                <p className="mt-1 text-sm leading-6 text-[#5b757b]">{t.safeListeningText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-[2rem] border bg-white p-3"
        style={{
          borderColor: BRAND.border,
          boxShadow: BRAND.shadow,
        }}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCard
            icon={<LocateFixed className="h-3.5 w-3.5 text-[#12879a]" />}
            label={t.you}
            value={gpsAllowed ? t.locationActive : t.locationOff}
          />
          <InfoCard
            icon={<Route className="h-3.5 w-3.5 text-[#12879a]" />}
            label={t.direction}
            value={t.shortestWalkingRoute}
          />
          <InfoCard
            icon={<Compass className="h-3.5 w-3.5 text-[#12879a]" />}
            label={t.distance}
            value={distanceToStop !== null ? formatDistance(distanceToStop) : '--'}
          />
          <InfoCard
            icon={<Navigation className="h-3.5 w-3.5 text-[#12879a]" />}
            label={t.time}
            value={timeToStopSeconds !== null ? estimateWalkingTime(timeToStopSeconds) : '--'}
          />
        </div>
      </section>

      <section
        className="rounded-[2rem] border bg-white p-4"
        style={{
          borderColor: BRAND.border,
          boxShadow: BRAND.shadow,
        }}
      >
        <div className="grid grid-cols-3 items-center gap-3">
          <button
            onClick={previousStop}
            disabled={currentIndex === 0}
            className="inline-flex items-center justify-center rounded-2xl border bg-white px-3 py-3 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f8ffff] disabled:opacity-40"
            style={{ borderColor: BRAND.borderStrong }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.previous}
          </button>

          <button
            onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
            className="inline-flex h-14 w-14 items-center justify-center justify-self-center rounded-full text-white transition hover:opacity-95"
            style={{
              background: BRAND.accent,
              boxShadow: '0 16px 38px rgba(15,75,88,0.20)',
            }}
            aria-label={playing ? t.pauseAudio : t.playAudio}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>

          <button
            onClick={nextStop}
            disabled={currentIndex === stops.length - 1}
            className="inline-flex items-center justify-center rounded-2xl border bg-white px-3 py-3 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f8ffff] disabled:opacity-40"
            style={{ borderColor: BRAND.borderStrong }}
          >
            {t.next}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            onClick={requestLocationAgain}
            className="inline-flex items-center justify-center rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f8ffff]"
            style={{ borderColor: BRAND.borderStrong }}
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            {t.enableLocation}
          </button>

          <button
            onClick={openWalkingRoute}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            style={{
              background: BRAND.accent,
              boxShadow: '0 12px 30px rgba(15,75,88,0.18)',
            }}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            {t.openWalkingRoute}
          </button>

          <button
            onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
            className="inline-flex items-center justify-center rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f8ffff]"
            style={{ borderColor: BRAND.borderStrong }}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {playing ? t.pauseAudio : t.playAudio}
          </button>
        </div>
      </section>

      {error ? (
        <div
          className="rounded-[1.6rem] border p-4 text-sm leading-6"
          style={{
            borderColor: '#ffd7cc',
            background: '#fff4f1',
            color: '#b85c45',
            boxShadow: '0 12px 35px rgba(239,127,99,0.10)',
          }}
        >
          {error}
        </div>
      ) : null}

      <section
        className="rounded-[2rem] border bg-white p-4"
        style={{
          borderColor: BRAND.border,
          boxShadow: BRAND.shadow,
        }}
      >
        <button
          onClick={() => setShowStops((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#12879a]" />
            <h2 className="text-base font-semibold text-[#143a43]">{t.allStops}</h2>
          </div>
          {showStops ? (
            <ChevronUp className="h-5 w-5 text-[#0f4b58]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#0f4b58]" />
          )}
        </button>

        {showStops ? (
          <div className="mt-4 space-y-2">
            {stops.map((stop, index) => {
              const stopTitle = getStopTitle(stop, language) ?? stop.title
              const stopDescription = getStopShortDescription(stop, language)

              return (
                <button
                  key={stop.id}
                  onClick={() => goToStop(index)}
                  className={`block w-full rounded-[1.35rem] border p-4 text-left transition ${
                    currentIndex === index ? 'text-white' : 'bg-white text-[#143a43] hover:bg-[#f8ffff]'
                  }`}
                  style={{
                    background: currentIndex === index ? BRAND.accent : '#ffffff',
                    borderColor: currentIndex === index ? BRAND.accent : BRAND.borderStrong,
                    boxShadow: currentIndex === index
                      ? '0 16px 38px rgba(15,75,88,0.16)'
                      : '0 10px 28px rgba(18,75,84,0.05)',
                  }}
                >
                  <div className="font-semibold">
                    {index + 1}. {stopTitle}
                  </div>
                  {stopDescription ? (
                    <div
                      className={`mt-2 text-sm leading-6 ${
                        currentIndex === index ? 'text-white/80' : 'text-[#5b757b]'
                      }`}
                    >
                      {stopDescription}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </section>

      {permissionState === 'denied' ? (
        <section
          className="rounded-[1.6rem] border bg-white p-4"
          style={{
            borderColor: BRAND.border,
            boxShadow: BRAND.shadow,
          }}
        >
          <p className="text-sm font-semibold text-[#143a43]">{t.locationOffTitle}</p>
          <p className="mt-1 text-sm leading-6 text-[#5b757b]">{t.locationOffText}</p>
        </section>
      ) : null}
    </div>
  )
}