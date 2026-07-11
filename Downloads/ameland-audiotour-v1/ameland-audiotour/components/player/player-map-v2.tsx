'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import type { PlayerLanguage, PlayerStop } from './tour-player'

type GeoPoint = {
  lat: number
  lng: number
  accuracy: number
  at: number
}

type Props = {
  stops: PlayerStop[]
  language: PlayerLanguage
  location: GeoPoint | null
  selectedIndex: number
  arrivedIndex: number | null
  reachedKeys: string[]
  onSelect: (index: number) => void
}

const DEFAULT_CENTER: [number, number] = [53.4394, 5.6399]
const MAX_ZOOM = 19
const MIN_ZOOM = 14

const COPY = {
  nl: {
    walkingRoute: 'Wandelroute naar de gekozen stop',
    directRoute: 'Route niet beschikbaar · rechte lijn',
    myLocation: 'Mijn locatie',
    centerRoute: 'Toon route',
    maps: 'Open in Maps',
    gps: 'GPS zoeken',
    selected: 'Gekozen stop',
    completed: 'Beluisterd',
    arrived: 'Je bent hier',
  },
  en: {
    walkingRoute: 'Walking route to the selected stop',
    directRoute: 'Route unavailable · direct line',
    myLocation: 'My location',
    centerRoute: 'Show route',
    maps: 'Open in Maps',
    gps: 'Finding GPS',
    selected: 'Selected stop',
    completed: 'Played',
    arrived: 'You are here',
  },
  de: {
    walkingRoute: 'Fußweg zum ausgewählten Stopp',
    directRoute: 'Route nicht verfügbar · direkte Linie',
    myLocation: 'Mein Standort',
    centerRoute: 'Route anzeigen',
    maps: 'In Maps öffnen',
    gps: 'GPS wird gesucht',
    selected: 'Ausgewählter Stopp',
    completed: 'Gehört',
    arrived: 'Du bist hier',
  },
} as const

function stringValue(source: PlayerStop | null, keys: string[]) {
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

function titleFor(stop: PlayerStop | null, language: PlayerLanguage) {
  if (language === 'nl') return stringValue(stop, ['title_nl', 'title', 'title_en', 'title_de'])
  if (language === 'en') return stringValue(stop, ['title_en', 'title_nl', 'title', 'title_de'])
  return stringValue(stop, ['title_de', 'title_nl', 'title', 'title_en'])
}

function coordinatesFor(stop: PlayerStop | null) {
  const lat = numberValue(stop, ['latitude', 'lat'])
  const lng = numberValue(stop, ['longitude', 'lng'])
  if (lat === null || lng === null) return null
  return [lat, lng] as [number, number]
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

function stopKey(stop: PlayerStop | null, index: number) {
  return String(stop?.id ?? stop?.order_index ?? index)
}

function distanceMeters(a: [number, number], b: [number, number]) {
  const earthRadius = 6371000
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function stopIcon(number: number, state: 'pending' | 'selected' | 'arrived' | 'completed') {
  const palette = {
    pending: { background: '#0f172a', color: '#ffffff', ring: 'rgba(255,255,255,.28)' },
    selected: { background: '#ffffff', color: '#0f172a', ring: 'rgba(94,234,212,.75)' },
    arrived: { background: '#fcd34d', color: '#0f172a', ring: 'rgba(252,211,77,.7)' },
    completed: { background: '#6ee7b7', color: '#0f172a', ring: 'rgba(110,231,183,.65)' },
  }[state]

  return L.divIcon({
    className: '',
    html: `<div style="width:40px;height:40px;border-radius:999px;background:${palette.background};color:${palette.color};display:flex;align-items:center;justify-content:center;font:900 14px Arial;border:3px solid white;box-shadow:0 0 0 5px ${palette.ring},0 14px 28px rgba(2,6,23,.35)">${number}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

function userIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;border-radius:999px;background:#3b82f6;border:4px solid white;box-shadow:0 0 0 6px rgba(59,130,246,.25),0 12px 24px rgba(2,6,23,.35)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function googleMapsUrl(destination: [number, number], location: GeoPoint | null) {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination[0]},${destination[1]}`,
    travelmode: 'walking',
  })
  if (location) params.set('origin', `${location.lat},${location.lng}`)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function InteractionTracker({ onInteract }: { onInteract: () => void }) {
  useMapEvents({ dragstart: onInteract, zoomstart: onInteract })
  return null
}

function ViewportController({
  location,
  target,
  route,
  selectedIndex,
  userTouched,
}: {
  location: GeoPoint | null
  target: [number, number] | null
  route: [number, number][]
  selectedIndex: number
  userTouched: boolean
}) {
  const map = useMap()
  const lastFit = useRef('')

  useEffect(() => {
    if (!target || userTouched) return
    const key = `${selectedIndex}-${location ? 'gps' : 'target'}`
    if (lastFit.current === key) return
    lastFit.current = key

    const points = route.length > 1
      ? route
      : location
      ? ([[location.lat, location.lng], target] as [number, number][])
      : [target]

    const timer = window.setTimeout(() => {
      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), {
          paddingTopLeft: [34, 72],
          paddingBottomRight: [34, 90],
          maxZoom: 18.5,
          animate: true,
          duration: 0.35,
        })
      } else {
        map.setView(points[0], 18, { animate: true })
      }
    }, 180)

    return () => window.clearTimeout(timer)
  }, [location, map, route, selectedIndex, target, userTouched])

  return null
}

function MapControls({
  language,
  location,
  target,
  route,
}: {
  language: PlayerLanguage
  location: GeoPoint | null
  target: [number, number] | null
  route: [number, number][]
}) {
  const map = useMap()
  const t = COPY[language]

  function showRoute() {
    const points = route.length > 1
      ? route
      : location && target
      ? ([[location.lat, location.lng], target] as [number, number][])
      : target
      ? [target]
      : []
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        padding: [36, 36],
        maxZoom: 18.5,
        animate: true,
      })
    } else if (points[0]) {
      map.flyTo(points[0], 18, { animate: true })
    }
  }

  return (
    <div className="absolute bottom-3 right-3 z-[800] flex max-w-[52%] flex-col gap-2">
      <button
        type="button"
        onClick={() => location && map.flyTo([location.lat, location.lng], 19, { animate: true })}
        disabled={!location}
        className="rounded-full border border-white/15 bg-slate-950/90 px-3 py-2 text-xs font-black text-white shadow-2xl backdrop-blur disabled:opacity-45"
      >
        {location ? t.myLocation : t.gps}
      </button>
      <button
        type="button"
        onClick={showRoute}
        disabled={!target}
        className="rounded-full border border-white/15 bg-slate-950/90 px-3 py-2 text-xs font-black text-white shadow-2xl backdrop-blur disabled:opacity-45"
      >
        {t.centerRoute}
      </button>
      {target ? (
        <a
          href={googleMapsUrl(target, location)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-300 px-3 py-2 text-center text-xs font-black text-slate-950 shadow-2xl"
        >
          {t.maps}
        </a>
      ) : null}
    </div>
  )
}

export function PlayerMap({
  stops,
  language,
  location,
  selectedIndex,
  arrivedIndex,
  reachedKeys,
  onSelect,
}: Props) {
  const t = COPY[language]
  const selectedStop = stops[selectedIndex] || stops[0] || null
  const target = useMemo(() => coordinatesFor(selectedStop), [selectedStop])
  const initialCenter = useRef<[number, number]>(target ?? DEFAULT_CENTER)
  const [userTouched, setUserTouched] = useState(false)
  const [route, setRoute] = useState<[number, number][]>([])
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle')
  const lastRequest = useRef<{ index: number; from: [number, number] | null } | null>(null)

  useEffect(() => setUserTouched(false), [selectedIndex])

  const fallbackRoute = useMemo<[number, number][]>(() => {
    if (!target) return []
    return location ? [[location.lat, location.lng], target] : [target]
  }, [location, target])

  useEffect(() => {
    let cancelled = false

    async function loadRoute() {
      if (!target) {
        setRoute([])
        setRouteStatus('idle')
        return
      }
      if (!location) {
        setRoute([target])
        setRouteStatus('fallback')
        return
      }

      const from: [number, number] = [location.lat, location.lng]
      const previous = lastRequest.current
      if (
        previous?.index === selectedIndex &&
        previous.from &&
        distanceMeters(previous.from, from) < 35 &&
        route.length > 1
      ) {
        return
      }
      lastRequest.current = { index: selectedIndex, from }
      setRouteStatus('loading')

      const fromLngLat = `${location.lng},${location.lat}`
      const toLngLat = `${target[1]},${target[0]}`
      const urls = [
        `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${fromLngLat};${toLngLat}?overview=full&geometries=geojson`,
        `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${fromLngLat};${toLngLat}?overview=full&geometries=geojson`,
      ]

      for (const url of urls) {
        try {
          const response = await fetch(url, { cache: 'no-store' })
          if (!response.ok) continue
          const data = await response.json()
          const raw = data?.routes?.[0]?.geometry?.coordinates
          if (!Array.isArray(raw) || raw.length < 2) continue
          const points = raw
            .map((point: unknown) => {
              if (!Array.isArray(point) || point.length < 2) return null
              const lng = Number(point[0])
              const lat = Number(point[1])
              return Number.isFinite(lat) && Number.isFinite(lng)
                ? ([lat, lng] as [number, number])
                : null
            })
            .filter(Boolean) as [number, number][]
          if (points.length > 1 && !cancelled) {
            setRoute(points)
            setRouteStatus('ready')
            return
          }
        } catch {
          // Probeer de volgende routebron.
        }
      }

      if (!cancelled) {
        setRoute(fallbackRoute)
        setRouteStatus('fallback')
      }
    }

    void loadRoute()
    return () => {
      cancelled = true
    }
  }, [fallbackRoute, location, route.length, selectedIndex, target])

  const routeLine = route.length ? route : fallbackRoute
  const selectedTitle = titleFor(selectedStop, language) || `${selectedIndex + 1}`

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <MapContainer
        center={initialCenter.current}
        zoom={17.5}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        preferCanvas
        dragging
        touchZoom
        scrollWheelZoom
        doubleClickZoom
        keyboard
      >
        <ZoomControl position="bottomleft" />
        <InteractionTracker onInteract={() => setUserTouched(true)} />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
          maxZoom={MAX_ZOOM}
        />
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
          opacity={0.9}
          maxZoom={MAX_ZOOM}
        />

        <ViewportController
          location={location}
          target={target}
          route={routeLine}
          selectedIndex={selectedIndex}
          userTouched={userTouched}
        />

        {routeLine.length > 1 ? (
          <>
            <Polyline positions={routeLine} pathOptions={{ color: '#020617', weight: 10, opacity: 0.5, lineCap: 'round', lineJoin: 'round' }} />
            <Polyline positions={routeLine} pathOptions={{ color: routeStatus === 'fallback' ? '#fbbf24' : '#5eead4', weight: 5, opacity: 0.98, lineCap: 'round', lineJoin: 'round' }} />
          </>
        ) : null}

        {stops.map((stop, index) => {
          const coordinates = coordinatesFor(stop)
          if (!coordinates) return null
          const key = stopKey(stop, index)
          const state =
            arrivedIndex === index
              ? 'arrived'
              : reachedKeys.includes(key)
              ? 'completed'
              : selectedIndex === index
              ? 'selected'
              : 'pending'
          return (
            <Marker
              key={key}
              position={coordinates}
              icon={stopIcon(index + 1, state)}
              eventHandlers={{ click: () => onSelect(index) }}
              zIndexOffset={selectedIndex === index ? 700 : state === 'completed' ? 300 : 0}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {index + 1}. {titleFor(stop, language)} · {state === 'completed' ? t.completed : state === 'arrived' ? t.arrived : state === 'selected' ? t.selected : ''}
              </Tooltip>
            </Marker>
          )
        })}

        {target ? (
          <Circle
            center={target}
            radius={triggerRadiusFor(selectedStop)}
            pathOptions={{ color: '#5eead4', weight: 2, opacity: 0.9, fillColor: '#5eead4', fillOpacity: 0.12 }}
          />
        ) : null}

        {location ? (
          <>
            <Circle
              center={[location.lat, location.lng]}
              radius={Math.max(8, location.accuracy)}
              pathOptions={{ color: '#60a5fa', weight: 1.5, opacity: 0.78, fillColor: '#60a5fa', fillOpacity: 0.14 }}
            />
            <Marker position={[location.lat, location.lng]} icon={userIcon()} zIndexOffset={1000}>
              <Tooltip direction="top" offset={[0, -14]} opacity={1}>{t.myLocation}</Tooltip>
            </Marker>
          </>
        ) : null}

        <MapControls language={language} location={location} target={target} route={routeLine} />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[750] max-w-[66%] rounded-2xl border border-white/15 bg-slate-950/85 px-3 py-2 text-white shadow-2xl backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
          {routeStatus === 'fallback' ? t.directRoute : t.walkingRoute}
        </p>
        <p className="mt-1 truncate text-sm font-black">{selectedIndex + 1}. {selectedTitle}</p>
      </div>
    </div>
  )
}
