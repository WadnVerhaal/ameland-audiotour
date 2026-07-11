import { NextResponse } from 'next/server'

type LatLng = {
  lat: number
  lng: number
}

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
    endLng === null
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

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

      return [lat, lng] as [number, number]
    })
    .filter((point): point is [number, number] => Array.isArray(point))
}

async function tryRoute(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AmelandAudiotours/1.0',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const route = data?.routes?.[0]
  const coordinates = normalizeGeoJsonCoordinates(route?.geometry?.coordinates)

  if (coordinates.length < 2) {
    return null
  }

  return {
    coordinates,
    distanceMeters: typeof route.distance === 'number' ? route.distance : null,
    durationSeconds: typeof route.duration === 'number' ? route.duration : null,
  }
}

async function getWalkingRoute(start: LatLng, end: LatLng) {
  const lngLat = `${start.lng},${start.lat};${end.lng},${end.lat}`

  const urls = [
    `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${lngLat}?overview=full&geometries=geojson&steps=false`,
    `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${lngLat}?overview=full&geometries=geojson&steps=false`,
    `https://router.project-osrm.org/route/v1/foot/${lngLat}?overview=full&geometries=geojson&steps=false`,
    `https://router.project-osrm.org/route/v1/walking/${lngLat}?overview=full&geometries=geojson&steps=false`,
  ]

  for (const url of urls) {
    try {
      const result = await tryRoute(url)
      if (result) return result
    } catch {
      // probeer volgende router
    }
  }

  return null
}

export async function GET(req: Request) {
  const coordinates = getCoordinates(req)

  if (!coordinates) {
    return NextResponse.json(
      { ok: false, error: 'Missing coordinates' },
      { status: 400 }
    )
  }

  const route = await getWalkingRoute(coordinates.start, coordinates.end)

  if (!route) {
    return NextResponse.json(
      {
        ok: false,
        error: 'No walking route found',
        coordinates: [],
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    ok: true,
    mode: 'walking',
    coordinates: route.coordinates,
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
  })
}
