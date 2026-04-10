'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Circle,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import { getWalkingRoute } from '@/lib/get-walking-route';
import {
  formatDistance,
  formatDuration,
  haversineDistanceMeters,
} from '@/lib/geo-utils';

type LatLng = {
  lat: number;
  lng: number;
};

type Stop = {
  id: string;
  title: string;
  lat: number;
  lng: number;
};

type PermissionStateLocal = 'unknown' | 'granted' | 'prompt' | 'denied';

type Props = {
  currentStop: Stop;
  nextStop: Stop | null;
};

const userIcon = new L.DivIcon({
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: white;
      border: 4px solid #2563eb;
      border-radius: 9999px;
      box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
    "></div>
  `,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const nextStopIcon = new L.DivIcon({
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    "></div>
  `,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function LiveNavigationMap({
  currentStop,
  nextStop,
}: Props) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [permission, setPermission] = useState<PermissionStateLocal>('unknown');
  const [locationMessage, setLocationMessage] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastRoutedFromRef = useRef<LatLng | null>(null);
  const lastRouteFetchAtRef = useRef<number>(0);

  const fallbackCenter = useMemo<[number, number]>(() => {
    return [currentStop.lat, currentStop.lng];
  }, [currentStop.lat, currentStop.lng]);

  const nextStopPosition = useMemo<[number, number] | null>(() => {
    if (!nextStop) return null;
    return [nextStop.lat, nextStop.lng];
  }, [nextStop]);

  const checkPermission = useCallback(async () => {
    try {
      if (!navigator.permissions) {
        setPermission('unknown');
        return;
      }

      const result = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });

      setPermission(result.state as PermissionStateLocal);

      result.onchange = () => {
        setPermission(result.state as PermissionStateLocal);
      };
    } catch {
      setPermission('unknown');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Je browser ondersteunt geen locatie.');
      return;
    }

    setLocationLoading(true);
    setLocationMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setPermission('granted');
        setLocationLoading(false);
        setLocationMessage('Locatie actief.');
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setPermission('denied');
          setLocationMessage(
            'Locatie is geweigerd. Klik op het slotje links van de adresbalk en sta locatie toe.'
          );
          return;
        }

        setLocationMessage('Locatie ophalen lukt nu niet.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setPermission('granted');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermission('denied');
          setLocationMessage(
            'Locatie is uitgezet. Zet locatie weer aan via het slotje links van de adresbalk.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, []);

  const stopWatchingLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    checkPermission();
    requestLocation();

    return () => {
      stopWatchingLocation();
    };
  }, [checkPermission, requestLocation, stopWatchingLocation]);

  useEffect(() => {
    if (permission === 'granted') {
      startWatchingLocation();
    }
  }, [permission, startWatchingLocation]);

  useEffect(() => {
    if (!userLocation || !nextStop) {
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
      return;
    }

    const now = Date.now();
    const lastFrom = lastRoutedFromRef.current;

    const movedEnough =
      !lastFrom ||
      haversineDistanceMeters(lastFrom, userLocation) > 20;

    const waitedLongEnough = now - lastRouteFetchAtRef.current > 12000;

    if (!movedEnough && !waitedLongEnough) {
      return;
    }

    let cancelled = false;

    async function loadRoute() {
      setRoutingLoading(true);

      const route = await getWalkingRoute(userLocation, {
        lat: nextStop.lat,
        lng: nextStop.lng,
      });

      if (cancelled) return;

      if (route) {
        setRouteCoordinates(route.coordinates.map((p) => [p.lat, p.lng]));
        setRouteDistance(route.distanceMeters);
        setRouteDuration(route.durationSeconds);
      } else {
        const fallbackDistance = haversineDistanceMeters(userLocation, {
          lat: nextStop.lat,
          lng: nextStop.lng,
        });

        setRouteCoordinates([
          [userLocation.lat, userLocation.lng],
          [nextStop.lat, nextStop.lng],
        ]);
        setRouteDistance(fallbackDistance);
        setRouteDuration(Math.round((fallbackDistance / 4500) * 3600));
      }

      lastRoutedFromRef.current = userLocation;
      lastRouteFetchAtRef.current = Date.now();
      setRoutingLoading(false);
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [userLocation, nextStop]);

  const distanceLabel = formatDistance(routeDistance);
  const durationLabel = formatDuration(routeDuration);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white/90 p-3 shadow-sm ring-1 ring-black/5">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationLoading}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {locationLoading
              ? 'Locatie laden...'
              : permission === 'denied'
              ? 'Probeer locatie opnieuw'
              : 'Locatie inschakelen'}
          </button>

          {routingLoading && (
            <div className="rounded-2xl bg-slate-100 px-3 py-3 text-sm text-slate-700">
              Route wordt bijgewerkt...
            </div>
          )}
        </div>

        {locationMessage ? (
          <div className="mb-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {locationMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : fallbackCenter}
            zoom={17}
            scrollWheelZoom={true}
            className="h-[380px] w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation ? (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>Jij bent hier</Popup>
                </Marker>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={55}
                  pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.15 }}
                />
              </>
            ) : null}

            {nextStopPosition ? (
              <Marker position={nextStopPosition} icon={nextStopIcon}>
                <Popup>Volgende stop: {nextStop?.title}</Popup>
              </Marker>
            ) : null}

            {routeCoordinates.length > 1 ? (
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#2563eb',
                  weight: 5,
                  opacity: 0.9,
                }}
              />
            ) : null}
          </MapContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-black/5">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Jij</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {userLocation ? 'Locatie actief' : 'Niet actief'}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Richting</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {nextStop ? nextStop.title : '-'}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Afstand</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {distanceLabel}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Tijd</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {durationLabel}
          </div>
        </div>
      </div>
    </div>
  );
}