export type LatLng = {
  lat: number;
  lng: number;
};

export type WalkingRoute = {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: LatLng[];
};

export async function getWalkingRoute(
  start: LatLng,
  end: LatLng
): Promise<WalkingRoute | null> {
  const url =
    `https://router.project-osrm.org/route/v1/foot/` +
    `${start.lng},${start.lat};${end.lng},${end.lat}` +
    `?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Routing request failed: ${response.status}`);
    }

    const data = await response.json();
    const route = data?.routes?.[0];

    if (!route?.geometry?.coordinates?.length) {
      return null;
    }

    return {
      distanceMeters: route.distance ?? 0,
      durationSeconds: route.duration ?? 0,
      coordinates: route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({ lat, lng })
      ),
    };
  } catch (error) {
    console.error('getWalkingRoute error:', error);
    return null;
  }
}