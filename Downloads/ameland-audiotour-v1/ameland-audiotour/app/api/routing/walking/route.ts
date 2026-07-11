import { NextResponse } from 'next/server'

type LatLng = {
  lat: number
  lng: number
}

type WalkingRoute = {
  coordinates: Array<[number, number]>
  distanceMeters: number
  durationSeconds: number | null
  provider: string
}

const ROUTER_TIMEOUT_MS = 6500
const SUCCESS_CACHE = 'public, s-maxage=21600, stale-while-revalidate=604800'

function asNumber(value: string | null) {
  if (!value) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function getCoordinates(req: Request) {
  const { searchParams } = new URL(req.url)

  let startLat =
    asNumber(searchParams.get('startLat')) ??
    asNumber(searchParams.get('fromLat')) ??
    asNumber(searchParams.get('lat1'))
  let startLng =
    asNumber(searchParams.get('startLng')) ??
    asNumber(searchParams.get('fromLng')) ??
    asNumber(searchParams.get('lng1'))
  let endLat =
    asNumber(searchParams.get('endLat')) ??
    asNumber(searchParams.get('toLat')) ??
    asNumber(searchParams.get('lat2'))
  let endLng =
    asNumber(searchParams.get('endLng')) ??
    asNumber(searchParams.get('toLng')) ??
    asNumber(searchParams.get('lng2'))

  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if ((startLat === null || startLng === null) && from) {
    const [lat, lng] = from.split(',').map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      startLat = lat
      startLng = lng
    }
  }

  if ((endLat === null || endLng === null) && to) {
    const [lat, lng] = to.split(',').map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      endLat = lat
      endLng = lng
    }
  }

  if (
    startLat === null ||
    startLng === null ||
    endLat === null ||
    endLng === null ||
    Math.abs(startLat) > 90 ||
    Math.abs(endLat) > 90 ||
    Math.abs(startLng) > 180 ||
    Math.abs(endLng) > 180
  ) {
    return null
  }

  return {
    start: { lat: startLat, lng: startLng },
    end: { lat: endLat, lng: endLng },
  }
}

function normalizeGeoJsonCoordinates(value: unknown): Array<[number, number]> {
  if (!Array.isArray(value)) return []
  return value
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null
      const lng = Number(point[0])
      const lat = Number(point[1])
      return Number.isFinite(lat) && Number.isFinite(lng)
        ? ([lat, lng] as [number, number])
        : null
    })
    .filter((point): point is [number, number] => Boolean(point))
}

function distanceMeters(a: LatLng | [number, number], b: LatLng | [number, number]) {
  const aLat = Array.isArray(a) ? a[0] : a.lat
  const aLng = Array.isArray(a) ? a[1] : a.lng
  const bLat = Array.isArray(b) ? b[0] : b.lat
  const bLng = Array.isArray(b) ? b[1] : b.lng
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function geometryDistance(points: Array<[number, number]>) {
  let distance = 0
  for (let index = 1; index < points.length; index += 1) {
    distance += distanceMeters(points[index - 1], points[index])
  }
  return distance
}

function isPlausibleRoute(
  start: LatLng,
  end: LatLng,
  coordinates: Array<[number, number]>,
  reportedDistance: number | null
) {
  if (coordinates.length < 2) return false
  const direct = distanceMeters(start, end)
  const measured = reportedDistance ?? geometryDistance(coordinates)
  const first = coordinates[0]
  const last = coordinates[coordinates.length - 1]

  return (
    distanceMeters(start, first) <= 350 &&
    distanceMeters(end, last) <= 350 &&
    measured >= Math.max(5, direct * 0.82) &&
    measured <= Math.max(25000, direct * 10)
  )
}

async function tryRoute(
  url: string,
  provider: string,
  start: LatLng,
  end: LatLng
): Promise<WalkingRoute | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ROUTER_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AmelandAudiotours/1.0 (info@amelandaudiotours.nl)',
      },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) return null

    const data = await response.json()
    const route = data?.routes?.[0]
    const coordinates = normalizeGeoJsonCoordinates(route?.geometry?.coordinates)
    const reportedDistance =
      typeof route?.distance === 'number' && Number.isFinite(route.distance)
        ? route.distance
        : null

    if (!isPlausibleRoute(start, end, coordinates, reportedDistance)) return null

    return {
      coordinates,
      distanceMeters: reportedDistance ?? geometryDistance(coordinates),
      durationSeconds:
        typeof route?.duration === 'number' && Number.isFinite(route.duration)
          ? route.duration
          : null,
      provider,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function getWalkingRoute(start: LatLng, end: LatLng) {
  const lngLat = `${start.lng},${start.lat};${end.lng},${end.lat}`
  const providers = [
    {
      name: 'osm-foot',
      url: `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${lngLat}?overview=full&geometries=geojson&steps=false&alternatives=false`,
    },
    {
      name: 'osm-walking',
      url: `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${lngLat}?overview=full&geometries=geojson&steps=false&alternatives=false`,
    },
    {
      name: 'osrm-foot',
      url: `https://router.project-osrm.org/route/v1/foot/${lngLat}?overview=full&geometries=geojson&steps=false&alternatives=false`,
    },
    {
      name: 'osrm-walking',
      url: `https://router.project-osrm.org/route/v1/walking/${lngLat}?overview=full&geometries=geojson&steps=false&alternatives=false`,
    },
  ]

  for (let attempt = 0; attempt < 2; attempt += 1) {
    for (const provider of providers) {
      const result = await tryRoute(provider.url, provider.name, start, end)
      if (result) return result
    }
    await new Promise((resolve) => setTimeout(resolve, 180))
  }

  return null
}

export async function GET(req: Request) {
  const coordinates = getCoordinates(req)
  if (!coordinates) {
    return NextResponse.json(
      { ok: false, error: 'Missing or invalid coordinates' },
      { status: 400 }
    )
  }

  const route = await getWalkingRoute(coordinates.start, coordinates.end)
  if (!route) {
    return NextResponse.json(
      { ok: false, error: 'No walking route found', coordinates: [] },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(
    {
      ok: true,
      mode: 'walking',
      coordinates: route.coordinates,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      provider: route.provider,
    },
    { headers: { 'Cache-Control': SUCCESS_CACHE } }
  )
}
