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
} from 'react-leaflet'
import {
  Layers3,
  LocateFixed,
  Route as RouteIcon,
} from 'lucide-react'
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
  focusRequest: number
}

type CameraMode = 'route' | 'follow'
type MapStyle = 'street' | 'satellite'
type RouteStatus = 'idle' | 'loading' | 'live' | 'planned' | 'unavailable'
type RouteResult = {
  points: [number, number][]
  distanceMeters: number | null
  durationSeconds: number | null
}

type ProgrammaticMoveRef = { current: boolean }

const DEFAULT_CENTER: [number, number] = [53.4394, 5.6399]
const MAX_ZOOM = 19
const MIN_ZOOM = 14
const ROUTE_REFRESH_DISTANCE_M = 40
const FOLLOW_ZOOM = 18.5

const COPY = {
  nl: {
    walkingRoute: 'Wandelroute',
    plannedRoute: 'Vaste wandelroute',
    routeLoading: 'Wandelroute bijwerken…',
    routeUnavailable: 'Wandelroute opnieuw laden',
    myLocation: 'Mijn locatie',
    followMe: 'Volg mij',
    routeOverview: 'Route in beeld',
    gps: 'GPS zoeken',
    selected: 'Gekozen stop',
    completed: 'Beluisterd',
    arrived: 'Je bent hier',
    street: 'Kaart',
    satellite: 'Satelliet',
    fixedMap: 'Kaart volgt automatisch de actieve stop',
    minutes: 'min',
  },
  en: {
    walkingRoute: 'Walking route',
    plannedRoute: 'Planned walking route',
    routeLoading: 'Updating walking route…',
    routeUnavailable: 'Reload walking route',
    myLocation: 'My location',
    followMe: 'Follow me',
    routeOverview: 'Show route',
    gps: 'Finding GPS',
    selected: 'Selected stop',
    completed: 'Played',
    arrived: 'You are here',
    street: 'Map',
    satellite: 'Satellite',
    fixedMap: 'Map automatically follows the active stop',
    minutes: 'min',
  },
  de: {
    walkingRoute: 'Fußweg',
    plannedRoute: 'Geplanter Fußweg',
    routeLoading: 'Fußweg wird aktualisiert…',
    routeUnavailable: 'Fußweg neu laden',
    myLocation: 'Mein Standort',
    followMe: 'Mir folgen',
    routeOverview: 'Route anzeigen',
    gps: 'GPS wird gesucht',
    selected: 'Ausgewählter Stopp',
    completed: 'Gehört',
    arrived: 'Du bist hier',
    street: 'Karte',
    satellite: 'Satellit',
    fixedMap: 'Karte folgt automatisch dem aktiven Stopp',
    minutes: 'Min.',
  },
} as const

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

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
  return Math.min(60, Math.max(15, configured ?? 25))
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

function formatDistance(value: number | null, language: PlayerLanguage) {
  if (value === null || !Number.isFinite(value)) return ''
  if (value < 1000) return `${Math.max(0, Math.round(value / 10) * 10)} m`
  const formatted = (value / 1000).toFixed(1)
  return `${language === 'nl' || language === 'de' ? formatted.replace('.', ',') : formatted} km`
}

function formatDuration(value: number | null, language: PlayerLanguage) {
  if (value === null || !Number.isFinite(value)) return ''
  return `${Math.max(1, Math.round(value / 60))} ${COPY[language].minutes}`
}

function routeCacheKey(start: [number, number], end: [number, number]) {
  return `${start[0].toFixed(5)},${start[1].toFixed(5)}>${end[0].toFixed(5)},${end[1].toFixed(5)}`
}

function parseRoutePoint(point: unknown): [number, number] | null {
  if (!Array.isArray(point) || point.length < 2) return null
  const lat = Number(point[0])
  const lng = Number(point[1])
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
}

async function requestWalkingRoute(
  start: [number, number],
  end: [number, number],
  cache: Map<string, RouteResult>,
  signal?: AbortSignal
): Promise<RouteResult> {
  const key = routeCacheKey(start, end)
  const cached = cache.get(key)
  if (cached) return cached

  const params = new URLSearchParams({
    from: `${start[0]},${start[1]}`,
    to: `${end[0]},${end[1]}`,
  })
  const response = await fetch(`/api/routing/walking?${params.toString()}`, {
    cache: 'no-store',
    signal,
  })
  if (!response.ok) throw new Error('route-unavailable')

  const payload = (await response.json()) as {
    coordinates?: unknown
    distanceMeters?: unknown
    durationSeconds?: unknown
  }
  if (!Array.isArray(payload.coordinates)) throw new Error('route-empty')

  const points = payload.coordinates
    .map(parseRoutePoint)
    .filter((point): point is [number, number] => Boolean(point))
  if (points.length < 2) throw new Error('route-invalid')

  const route = {
    points,
    distanceMeters:
      typeof payload.distanceMeters === 'number' && Number.isFinite(payload.distanceMeters)
        ? payload.distanceMeters
        : null,
    durationSeconds:
      typeof payload.durationSeconds === 'number' && Number.isFinite(payload.durationSeconds)
        ? payload.durationSeconds
        : null,
  }
  cache.set(key, route)
  return route
}

function stopIcon(number: number, state: 'pending' | 'selected' | 'arrived' | 'completed') {
  const palette = {
    pending: { background: '#0f172a', color: '#ffffff', ring: 'rgba(255,255,255,.24)' },
    selected: { background: '#ffffff', color: '#0f172a', ring: 'rgba(94,234,212,.78)' },
    arrived: { background: '#fcd34d', color: '#0f172a', ring: 'rgba(252,211,77,.72)' },
    completed: { background: '#6ee7b7', color: '#0f172a', ring: 'rgba(110,231,183,.68)' },
  }[state]

  return L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:999px;background:${palette.background};color:${palette.color};display:flex;align-items:center;justify-content:center;font:800 13px Arial;border:2px solid white;box-shadow:0 0 0 2px ${palette.ring},0 8px 18px rgba(2,6,23,.28)">${number}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function userIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:24px;height:24px;border-radius:999px;background:#2563eb;border:4px solid white;box-shadow:0 0 0 7px rgba(37,99,235,.24),0 12px 24px rgba(2,6,23,.35)"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function runProgrammaticMove(
  map: L.Map,
  programmaticMoveRef: ProgrammaticMoveRef,
  action: () => void
) {
  programmaticMoveRef.current = true
  const release = () => {
    programmaticMoveRef.current = false
    map.off('moveend', release)
    map.off('zoomend', release)
  }
  map.once('moveend', release)
  map.once('zoomend', release)
  action()
  window.setTimeout(release, 900)
}

function fitRoute(
  map: L.Map,
  points: [number, number][],
  programmaticMoveRef: ProgrammaticMoveRef
) {
  if (!points.length) return
  runProgrammaticMove(map, programmaticMoveRef, () => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [30, 78],
        paddingBottomRight: [30, 112],
        maxZoom: 18.25,
        animate: true,
        duration: 0.35,
      })
    } else {
      map.flyTo(points[0], 18, { animate: true, duration: 0.35 })
    }
  })
}

function NavigationCamera({
  location,
  route,
  selectedIndex,
  cameraMode,
  programmaticMoveRef,
  focusRequest,
}: {
  location: GeoPoint | null
  route: [number, number][]
  selectedIndex: number
  cameraMode: CameraMode
  programmaticMoveRef: ProgrammaticMoveRef
  focusRequest: number
}) {
  const map = useMap()
  const lastRouteFit = useRef('')
  const lastFollowPoint = useRef<[number, number] | null>(null)

  useEffect(() => {
    if (cameraMode !== 'route' || !route.length) return
    const first = route[0]
    const last = route[route.length - 1]
    const key = `${selectedIndex}-${first[0].toFixed(5)}-${first[1].toFixed(5)}-${last[0].toFixed(5)}-${last[1].toFixed(5)}-${focusRequest}`
    if (lastRouteFit.current === key) return
    lastRouteFit.current = key
    const timer = window.setTimeout(() => fitRoute(map, route, programmaticMoveRef), 120)
    return () => window.clearTimeout(timer)
  }, [cameraMode, focusRequest, map, programmaticMoveRef, route, selectedIndex])

  useEffect(() => {
    if (cameraMode !== 'follow' || !location) return
    const next: [number, number] = [location.lat, location.lng]
    const previous = lastFollowPoint.current
    if (previous && distanceMeters(previous, next) < 7 && focusRequest === 0) return
    lastFollowPoint.current = next
    runProgrammaticMove(map, programmaticMoveRef, () => {
      map.panTo(next, { animate: true, duration: 0.25 })
      if (map.getZoom() < FOLLOW_ZOOM) map.setZoom(FOLLOW_ZOOM, { animate: true })
    })
  }, [cameraMode, focusRequest, location, map, programmaticMoveRef])

  return null
}

function NavigationControls({
  language,
  location,
  target,
  route,
  cameraMode,
  setCameraMode,
  mapStyle,
  setMapStyle,
  programmaticMoveRef,
}: {
  language: PlayerLanguage
  location: GeoPoint | null
  target: [number, number] | null
  route: [number, number][]
  cameraMode: CameraMode
  setCameraMode: (mode: CameraMode) => void
  mapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void
  programmaticMoveRef: ProgrammaticMoveRef
}) {
  const map = useMap()
  const t = COPY[language]

  function showRoute() {
    setCameraMode('route')
    fitRoute(map, route.length ? route : target ? [target] : [], programmaticMoveRef)
  }

  function followLocation() {
    if (!location) return
    setCameraMode('follow')
    runProgrammaticMove(map, programmaticMoveRef, () => {
      map.flyTo([location.lat, location.lng], Math.max(FOLLOW_ZOOM, map.getZoom()), {
        animate: true,
        duration: 0.35,
      })
    })
  }

  function toggleMapStyle() {
    const next = mapStyle === 'street' ? 'satellite' : 'street'
    setMapStyle(next)
    try {
      window.localStorage.setItem('aat.mapStyle', next)
    } catch {
      // De kaart blijft zonder lokale opslag werken.
    }
  }

  return (
    <>
      <div className="absolute right-3 top-3 z-[800] flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleMapStyle}
          aria-label={mapStyle === 'street' ? t.satellite : t.street}
          title={mapStyle === 'street' ? t.satellite : t.street}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-slate-950/90 text-white shadow-2xl backdrop-blur transition active:scale-95"
        >
          <Layers3 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={showRoute}
          disabled={!target}
          aria-pressed={cameraMode === 'route'}
          aria-label={t.routeOverview}
          title={t.routeOverview}
          className={cn(
            'grid h-11 w-11 place-items-center rounded-full border shadow-2xl backdrop-blur transition active:scale-95 disabled:opacity-40',
            cameraMode === 'route'
              ? 'border-emerald-200 bg-emerald-300 text-slate-950'
              : 'border-white/15 bg-slate-950/90 text-white'
          )}
        >
          <RouteIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={followLocation}
          disabled={!location}
          aria-pressed={cameraMode === 'follow'}
          aria-label={location ? t.followMe : t.gps}
          title={location ? t.followMe : t.gps}
          className={cn(
            'grid h-11 w-11 place-items-center rounded-full border shadow-2xl backdrop-blur transition active:scale-95 disabled:opacity-40',
            cameraMode === 'follow'
              ? 'border-blue-200 bg-blue-500 text-white'
              : 'border-white/15 bg-slate-950/90 text-white'
          )}
        >
          <LocateFixed className="h-5 w-5" />
        </button>
      </div>

    </>
  )
}

export function PlayerMap({
  stops,
  language,
  location,
  selectedIndex,
  arrivedIndex,
  reachedKeys,
  focusRequest,
}: Props) {
  const t = COPY[language]
  const selectedStop = stops[selectedIndex] || stops[0] || null
  const previousStop = selectedIndex > 0 ? stops[selectedIndex - 1] || null : null
  const nextStop = selectedIndex < stops.length - 1 ? stops[selectedIndex + 1] || null : null
  const target = useMemo(() => coordinatesFor(selectedStop), [selectedStop])
  const plannedOrigin = useMemo(() => coordinatesFor(previousStop), [previousStop])
  const nextTarget = useMemo(() => coordinatesFor(nextStop), [nextStop])
  const initialCenter = useRef<[number, number]>(target ?? DEFAULT_CENTER)
  const programmaticMoveRef = useRef(false)
  const navigationStartRef = useRef<{ index: number; point: [number, number] } | null>(null)
  const routeCache = useRef(new Map<string, RouteResult>())
  const plannedController = useRef<AbortController | null>(null)
  const liveController = useRef<AbortController | null>(null)
  const lastLiveRequest = useRef<{ index: number; from: [number, number] | null } | null>(null)
  const plannedRouteRef = useRef<RouteResult | null>(null)
  const [cameraMode, setCameraMode] = useState<CameraMode>('route')
  const [mapStyle, setMapStyle] = useState<MapStyle>('street')
  const [plannedRoute, setPlannedRoute] = useState<RouteResult | null>(null)
  const [liveRoute, setLiveRoute] = useState<RouteResult | null>(null)
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle')

  useEffect(() => {
    plannedRouteRef.current = plannedRoute
  }, [plannedRoute])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('aat.mapStyle')
      if (stored === 'street' || stored === 'satellite') setMapStyle(stored)
    } catch {
      // Geen blokkade voor de kaart.
    }
  }, [])

  useEffect(() => {
    setCameraMode('route')
    plannedController.current?.abort()
    liveController.current?.abort()
    lastLiveRequest.current = null
    setPlannedRoute(null)
    setLiveRoute(null)

    if (!target) {
      setRouteStatus('idle')
      return
    }
    if (!plannedOrigin) {
      setRouteStatus(location ? 'loading' : 'idle')
      return
    }

    const controller = new AbortController()
    plannedController.current = controller
    setRouteStatus('loading')
    void requestWalkingRoute(plannedOrigin, target, routeCache.current, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setPlannedRoute(result)
        setRouteStatus((current) => (current === 'live' ? current : 'planned'))
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setRouteStatus((current) => (current === 'live' ? current : 'unavailable'))
      })

    return () => controller.abort()
  }, [location, plannedOrigin, selectedIndex, target])

  useEffect(() => {
    if (focusRequest <= 0) return
    if (!location) {
      setCameraMode('route')
      return
    }

    const point: [number, number] = [location.lat, location.lng]
    const start = navigationStartRef.current

    // De eerste start toont bewust de hele route. Een latere tik op 'Volg mij'
    // centreert direct; tijdens de eerste start gebeurt dat pas als iemand loopt.
    if (focusRequest > 1) {
      setCameraMode('follow')
      return
    }

    if (!start || start.index !== selectedIndex) {
      navigationStartRef.current = { index: selectedIndex, point }
      setCameraMode('route')
      return
    }

    const movementThreshold = Math.max(8, Math.min(15, location.accuracy * 0.35))
    if (distanceMeters(start.point, point) >= movementThreshold) {
      setCameraMode('follow')
    }
  }, [focusRequest, location, selectedIndex])

  useEffect(() => {
    if (!target || !location) return
    const from: [number, number] = [location.lat, location.lng]
    const previous = lastLiveRequest.current
    if (
      previous?.index === selectedIndex &&
      previous.from &&
      distanceMeters(previous.from, from) < ROUTE_REFRESH_DISTANCE_M &&
      liveRoute
    ) {
      return
    }

    lastLiveRequest.current = { index: selectedIndex, from }
    liveController.current?.abort()
    const controller = new AbortController()
    liveController.current = controller
    setRouteStatus('loading')

    const timer = window.setTimeout(() => {
      void requestWalkingRoute(from, target, routeCache.current, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return
          setLiveRoute(result)
          setRouteStatus('live')
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setLiveRoute(null)
          setRouteStatus(plannedRouteRef.current ? 'planned' : 'unavailable')
        })
    }, 250)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [liveRoute, location, selectedIndex, target])

  useEffect(() => {
    if (!target || !nextTarget) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void requestWalkingRoute(target, nextTarget, routeCache.current, controller.signal).catch(() => undefined)
    }, 1200)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [nextTarget, target])

  const activeRoute = liveRoute ?? plannedRoute
  const routeLine = activeRoute?.points ?? []
  const cameraRoute = routeLine.length ? routeLine : target ? [target] : []
  const selectedTitle = titleFor(selectedStop, language) || `${selectedIndex + 1}`
  const routeDistance = formatDistance(activeRoute?.distanceMeters ?? null, language)
  const routeDuration = formatDuration(activeRoute?.durationSeconds ?? null, language)
  const routeSummary = [routeDistance, routeDuration].filter(Boolean).join(' · ')

  function retryRoute() {
    lastLiveRequest.current = null
    if (location) {
      setLiveRoute(null)
      setRouteStatus('loading')
      return
    }
    if (plannedOrigin && target) {
      setPlannedRoute(null)
      setRouteStatus('loading')
      const controller = new AbortController()
      plannedController.current = controller
      void requestWalkingRoute(plannedOrigin, target, routeCache.current, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return
          setPlannedRoute(result)
          setRouteStatus('planned')
        })
        .catch(() => {
          if (!controller.signal.aborted) setRouteStatus('unavailable')
        })
    }
  }

  const routeLabel =
    routeStatus === 'loading'
      ? t.routeLoading
      : routeStatus === 'planned'
      ? t.plannedRoute
      : t.walkingRoute

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <MapContainer
        center={initialCenter.current}
        zoom={17.5}
        zoomSnap={0.25}
        zoomDelta={0.25}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        preferCanvas
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
      >

        {mapStyle === 'street' ? (
          <TileLayer
            key="street"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            maxZoom={MAX_ZOOM}
            keepBuffer={4}
            updateWhenIdle
          />
        ) : (
          <>
            <TileLayer
              key="satellite"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri"
              maxZoom={MAX_ZOOM}
              keepBuffer={4}
              updateWhenIdle
            />
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution="Labels © Esri"
              opacity={0.9}
              maxZoom={MAX_ZOOM}
              keepBuffer={4}
              updateWhenIdle
            />
          </>
        )}

        <NavigationCamera
          location={location}
          route={cameraRoute}
          selectedIndex={selectedIndex}
          cameraMode={cameraMode}
          programmaticMoveRef={programmaticMoveRef}
          focusRequest={focusRequest}
        />

        {routeLine.length > 1 ? (
          <>
            <Polyline
              positions={routeLine}
              pathOptions={{ color: '#ffffff', weight: 10, opacity: 0.94, lineCap: 'round', lineJoin: 'round' }}
            />
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: routeStatus === 'planned' ? '#0f766e' : '#2563eb',
                weight: 6,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        ) : null}

        {target ? (
          <Marker
            position={target}
            icon={stopIcon(
              selectedIndex + 1,
              arrivedIndex === selectedIndex
                ? 'arrived'
                : reachedKeys.includes(stopKey(selectedStop, selectedIndex))
                ? 'completed'
                : 'selected'
            )}
            zIndexOffset={700}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={1}>
              {selectedIndex + 1}. {selectedTitle}
            </Tooltip>
          </Marker>
        ) : null}

        {target ? (
          <Circle
            center={target}
            radius={triggerRadiusFor(selectedStop)}
            pathOptions={{ color: '#0f766e', weight: 2, opacity: 0.95, fillColor: '#5eead4', fillOpacity: 0.16 }}
          />
        ) : null}

        {location ? (
          <>
            <Circle
              center={[location.lat, location.lng]}
              radius={Math.min(100, Math.max(8, location.accuracy))}
              pathOptions={{ color: '#2563eb', weight: 1.5, opacity: 0.75, fillColor: '#60a5fa', fillOpacity: 0.12 }}
            />
            <Marker position={[location.lat, location.lng]} icon={userIcon()} zIndexOffset={1000}>
              <Tooltip direction="top" offset={[0, -15]} opacity={1}>{t.myLocation}</Tooltip>
            </Marker>
          </>
        ) : null}

        <NavigationControls
          language={language}
          location={location}
          target={target}
          route={cameraRoute}
          cameraMode={cameraMode}
          setCameraMode={setCameraMode}
          mapStyle={mapStyle}
          setMapStyle={setMapStyle}
          programmaticMoveRef={programmaticMoveRef}
        />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[750] max-w-[68%] rounded-2xl border border-white/15 bg-slate-950/88 px-3 py-2 text-white shadow-2xl backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">{routeLabel}</p>
        {routeSummary ? <p className="mt-0.5 text-xs font-bold text-slate-300">{routeSummary}</p> : null}
        <p className="mt-1 text-[11px] font-semibold text-slate-300">{t.fixedMap}</p>
      </div>

      {routeStatus === 'unavailable' ? (
        <button
          type="button"
          onClick={retryRoute}
          className="absolute bottom-4 left-1/2 z-[840] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-slate-950/92 px-5 py-3 text-sm font-black text-white shadow-2xl backdrop-blur"
        >
          {t.routeUnavailable}
        </button>
      ) : null}
    </div>
  )
}
