'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Compass,
  LocateFixed,
  MapPinned,
  Navigation,
  Route,
  ShieldCheck,
  Volume2,
} from 'lucide-react'

type RawStop = {
  id?: string | number
  title?: string
  title_nl?: string
  name?: string
  subtitle?: string
  description?: string
  latitude?: number | string
  longitude?: number | string
  lat?: number | string
  lng?: number | string
  order?: number
  sort_order?: number
  sequence?: number
}

export type NavigationTour = {
  id?: string | number
  title?: string
  title_nl?: string
  subtitle?: string
  description?: string
  stops?: RawStop[]
}

type Props = {
  token: string
  tour: NavigationTour
}

type CleanStop = {
  id: string
  title: string
  subtitle?: string
  lat: number
  lng: number
  order: number
}

type UserPosition = {
  lat: number
  lng: number
  accuracy?: number
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'))
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function distanceInMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const radius = 6371000
  const phi1 = (a.lat * Math.PI) / 180
  const phi2 = (b.lat * Math.PI) / 180
  const deltaPhi = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLambda = ((b.lng - a.lng) * Math.PI) / 180

  const x =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2)

  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function formatDistance(meters: number | null) {
  if (meters === null) return 'Onbekend'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
}

function getCleanStops(tour: NavigationTour): CleanStop[] {
  const rawStops = Array.isArray(tour?.stops) ? tour.stops : []

  return rawStops
    .map((stop, index) => {
      const lat = toNumber(stop.latitude ?? stop.lat)
      const lng = toNumber(stop.longitude ?? stop.lng)

      if (lat === null || lng === null) return null

      return {
        id: String(stop.id ?? index),
        title: stop.title_nl ?? stop.title ?? stop.name ?? `Stop ${index + 1}`,
        subtitle: stop.subtitle ?? stop.description,
        lat,
        lng,
        order: Number(stop.order ?? stop.sort_order ?? stop.sequence ?? index + 1),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a!.order - b!.order) as CleanStop[]
}

export function PremiumNavigation({ token, tour }: Props) {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const accuracyCircleRef = useRef<any>(null)

  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)

  const stops = useMemo(() => getCleanStops(tour), [tour])
  const selectedStop = useMemo(
    () => stops.find((stop) => stop.id === selectedStopId) ?? stops[0] ?? null,
    [selectedStopId, stops]
  )

  const nearestStop = useMemo(() => {
    if (!userPosition || stops.length === 0) return null

    return stops
      .map((stop) => ({
        stop,
        distance: distanceInMeters(userPosition, stop),
      }))
      .sort((a, b) => a.distance - b.distance)[0]
  }, [userPosition, stops])

  const tourTitle = tour?.title_nl ?? tour?.title ?? 'Audiotour Ameland'

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationError('Locatiebepaling wordt niet ondersteund door deze browser.')
      return
    }

    setLocationStatus('loading')
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLocationStatus('ready')
      },
      () => {
        setLocationStatus('error')
        setLocationError('We kunnen je locatie nog niet bepalen. Controleer of locatie-toegang aan staat.')
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 5000,
      }
    )
  }

  useEffect(() => {
    requestLocation()

    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLocationStatus('ready')
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 12000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function setupMap() {
      if (!mapElementRef.current || mapRef.current || stops.length === 0) return

      const leaflet = await import('leaflet')
      if (cancelled || !mapElementRef.current) return

      const L = leaflet.default

      const center = selectedStop ?? stops[0]
      const map = L.map(mapElementRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
      }).setView([center.lat, center.lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const bounds = L.latLngBounds([])

      stops.forEach((stop, index) => {
        const marker = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({
            className: '',
            html: `
              <div style="
                width: 38px;
                height: 38px;
                border-radius: 999px;
                background: #123c2f;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 14px;
                border: 3px solid #f2eadb;
                box-shadow: 0 14px 30px rgba(0,0,0,.25);
              ">
                ${index + 1}
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          }),
        }).addTo(map)

        marker.bindPopup(`<strong>${stop.title}</strong>`)
        marker.on('click', () => setSelectedStopId(stop.id))
        bounds.extend([stop.lat, stop.lng])
      })

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [42, 42],
          maxZoom: 16,
        })
      }

      mapRef.current = map
    }

    setupMap()

    return () => {
      cancelled = true
    }
  }, [selectedStop, stops])

  useEffect(() => {
    async function updateUserMarker() {
      if (!mapRef.current || !userPosition) return

      const leaflet = await import('leaflet')
      const L = leaflet.default
      const map = mapRef.current

      const userIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 999px;
            background: #2563eb;
            border: 4px solid white;
            box-shadow: 0 12px 24px rgba(37,99,235,.35);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map)
      } else {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng])
      }

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([userPosition.lat, userPosition.lng])
        accuracyCircleRef.current.setRadius(userPosition.accuracy ?? 20)
      } else {
        accuracyCircleRef.current = L.circle([userPosition.lat, userPosition.lng], {
          radius: userPosition.accuracy ?? 20,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map)
      }
    }

    updateUserMarker()
  }, [userPosition])

  function focusOnUser() {
    if (!mapRef.current || !userPosition) {
      requestLocation()
      return
    }

    mapRef.current.setView([userPosition.lat, userPosition.lng], 17, {
      animate: true,
    })
  }

  function focusOnStop(stop: CleanStop) {
    setSelectedStopId(stop.id)

    if (mapRef.current) {
      mapRef.current.setView([stop.lat, stop.lng], 17, {
        animate: true,
      })
    }
  }

  const selectedDistance =
    userPosition && selectedStop ? distanceInMeters(userPosition, selectedStop) : null

  return (
    <main className="min-h-screen bg-[#f5efe3] text-[#123c2f]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#123c2f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),transparent_45%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/player/${token}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar audio
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-white/80">
              <Compass className="h-4 w-4" />
              Live navigatie
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold text-white/70">Je route</p>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                {tourTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/75">
                Volg de route over het eiland, bekijk waar je bent en zie welke stop het dichtstbij is.
                Gebruik bij voorkeur één oortje of open-ear audio, zodat je het verkeer en je omgeving goed blijft horen.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#123c2f]">
                  <MapPinned className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Dichtstbijzijnde stop</p>
                  <p className="mt-1 text-xl font-black">
                    {nearestStop?.stop.title ?? selectedStop?.title ?? 'Nog onbekend'}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Afstand: {nearestStop ? formatDistance(nearestStop.distance) : 'Locatie laden...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[1.35fr_.65fr]">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#123c2f]">Kaart</p>
              <p className="text-xs text-black/50">
                Blauwe punt = jouw locatie. Genummerde punten = audiostops.
              </p>
            </div>

            <button
              type="button"
              onClick={focusOnUser}
              className="inline-flex items-center gap-2 rounded-full bg-[#123c2f] px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
            >
              <LocateFixed className="h-4 w-4" />
              Mijn locatie
            </button>
          </div>

          {stops.length > 0 ? (
            <div ref={mapElementRef} className="h-[62vh] min-h-[480px] w-full" />
          ) : (
            <div className="flex h-[62vh] min-h-[480px] items-center justify-center p-8 text-center">
              <div>
                <MapPinned className="mx-auto h-10 w-10 text-black/30" />
                <h2 className="mt-4 text-xl font-black">Geen coördinaten gevonden</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-black/60">
                  Deze tour heeft nog geen stops met latitude/longitude. Voeg coördinaten toe in Supabase
                  om de kaart automatisch te vullen.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#f5efe3] p-3">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
                  Geselecteerde stop
                </p>
                <h2 className="text-xl font-black">
                  {selectedStop?.title ?? 'Geen stop geselecteerd'}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5efe3] p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-black/40">Afstand</p>
                <p className="mt-1 text-2xl font-black">{formatDistance(selectedDistance)}</p>
              </div>

              <div className="rounded-2xl bg-[#f5efe3] p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-black/40">Stops</p>
                <p className="mt-1 text-2xl font-black">{stops.length}</p>
              </div>
            </div>

            {locationStatus === 'error' && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {locationError}
              </div>
            )}

            {locationStatus === 'loading' && (
              <div className="mt-4 rounded-2xl border border-black/10 bg-[#f5efe3] p-4 text-sm text-black/60">
                Je locatie wordt opgehaald...
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">Route</p>
                <h2 className="text-lg font-black">Audiostops</h2>
              </div>
              <Route className="h-5 w-5 text-black/40" />
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {stops.map((stop, index) => {
                const distance = userPosition ? distanceInMeters(userPosition, stop) : null
                const active = selectedStop?.id === stop.id

                return (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => focusOnStop(stop)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      active
                        ? 'border-[#123c2f] bg-[#123c2f] text-white shadow-lg'
                        : 'border-black/10 bg-[#f5efe3] hover:border-[#123c2f]/30 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          active ? 'bg-white text-[#123c2f]' : 'bg-[#123c2f] text-white'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-black leading-5">{stop.title}</p>
                        <p className={`mt-1 text-xs ${active ? 'text-white/70' : 'text-black/50'}`}>
                          {formatDistance(distance)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#123c2f] p-5 text-white shadow-xl">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-white/80" />
              <div>
                <h2 className="font-black">Veilig op pad</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Gebruik één oortje of open-ear audio. Blijf letten op verkeer, fietsers en wandelaars.
                  Je kunt audiofragmenten altijd pauzeren en later veilig terugluisteren.
                </p>
              </div>
            </div>

            <Link
              href={`/player/${token}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-[#123c2f] transition hover:scale-[1.01]"
            >
              <Volume2 className="h-4 w-4" />
              Naar de audioplayer
            </Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
