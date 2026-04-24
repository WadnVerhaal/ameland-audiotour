import { NextRequest, NextResponse } from 'next/server';

type LatLngPoint = [number, number];

function isValidPoint(point: unknown): point is LatLngPoint {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    typeof point[0] === 'number' &&
    typeof point[1] === 'number' &&
    Number.isFinite(point[0]) &&
    Number.isFinite(point[1])
  );
}

function routeResponse(points: LatLngPoint[], provider: string, routed: boolean) {
  return NextResponse.json(
    {
      provider,
      routed,
      points,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}

async function routeWithOpenRouteService(points: LatLngPoint[]) {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) return null;

  const coordinates = points.map(([lat, lng]) => [lng, lat]);

  const response = await fetch(
    'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
    {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json, application/geo+json',
      },
      body: JSON.stringify({
        coordinates,
        preference: 'recommended',
        instructions: false,
        elevation: false,
      }),
      next: {
        revalidate: 86400,
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const routeCoordinates = data?.features?.[0]?.geometry?.coordinates;

  if (!Array.isArray(routeCoordinates) || routeCoordinates.length < 2) return null;

  return routeCoordinates
    .map((coordinate: unknown) => {
      if (
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        typeof coordinate[0] === 'number' &&
        typeof coordinate[1] === 'number'
      ) {
        return [coordinate[1], coordinate[0]] as LatLngPoint;
      }

      return null;
    })
    .filter(Boolean) as LatLngPoint[];
}

async function routeWithOsrmFoot(points: LatLngPoint[]) {
  if (points.length < 2) return null;

  const routeCoords: LatLngPoint[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    const coordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;
    const url = `https://router.project-osrm.org/route/v1/foot/${coordinates}?overview=full&geometries=geojson`;

    const response = await fetch(url, {
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const geometry = data?.routes?.[0]?.geometry?.coordinates;

    if (!Array.isArray(geometry) || geometry.length < 2) return null;

    const segment = geometry
      .map((coord: unknown) => {
        if (
          Array.isArray(coord) &&
          coord.length >= 2 &&
          typeof coord[0] === 'number' &&
          typeof coord[1] === 'number'
        ) {
          return [coord[1], coord[0]] as LatLngPoint;
        }

        return null;
      })
      .filter(Boolean) as LatLngPoint[];

    if (routeCoords.length > 0) {
      segment.shift();
    }

    routeCoords.push(...segment);
  }

  return routeCoords.length >= 2 ? routeCoords : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const points = body?.points;

    if (!Array.isArray(points) || points.length < 2 || !points.every(isValidPoint)) {
      return NextResponse.json(
        {
          error: 'Invalid points. Expected [[lat,lng],[lat,lng],...].',
        },
        { status: 400 }
      );
    }

    const openRouteServiceRoute = await routeWithOpenRouteService(points);

    if (openRouteServiceRoute && openRouteServiceRoute.length >= 2) {
      return routeResponse(openRouteServiceRoute, 'openrouteservice-foot-walking', true);
    }

    const osrmRoute = await routeWithOsrmFoot(points);

    if (osrmRoute && osrmRoute.length >= 2) {
      return routeResponse(osrmRoute, 'osrm-foot', true);
    }

    return routeResponse(points, 'fallback-straight-line', false);
  } catch {
    return NextResponse.json(
      {
        error: 'Could not calculate walking route.',
      },
      { status: 500 }
    );
  }
}
