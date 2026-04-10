'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
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
} from 'lucide-react';
import { TourStop } from '@/types/tour';
import { distanceInMeters } from '@/lib/utils/geo';

type Props = {
  token: string;
  stops: TourStop[];
};

type Position = {
  lat: number;
  lng: number;
  accuracy?: number;
};

type RoutePoint = [number, number];
type GeoPermissionState = 'unknown' | 'granted' | 'prompt' | 'denied';

const userIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,.18)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const stopIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:9999px;background:#dc2626;border:3px solid white;box-shadow:0 0 0 3px rgba(220,38,38,.16)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function formatDistance(meters: number) {
  const roundedMeters = Math.round(meters);
  if (roundedMeters < 1000) return `${roundedMeters} m`;
  return `${(roundedMeters / 1000).toFixed(1)} km`;
}

function estimateWalkingTime(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}u` : `${hours}u ${remaining}m`;
}

function estimateWalkingSecondsFromMeters(meters: number) {
  const walkingSpeedMetersPerSecond = 1.3;
  return Math.max(60, Math.round(meters / walkingSpeedMetersPerSecond));
}

function RecenterMap({
  position,
  stop,
}: {
  position: Position | null;
  stop: TourStop | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position && !stop) return;

    if (position && stop?.lat && stop?.lng) {
      const bounds = L.latLngBounds(
        [position.lat, position.lng],
        [Number(stop.lat), Number(stop.lng)]
      );
      map.fitBounds(bounds, { padding: [28, 28], animate: true, maxZoom: 17 });
      return;
    }

    if (position) {
      map.setView([position.lat, position.lng], 16, { animate: true });
      return;
    }

    if (stop?.lat && stop?.lng) {
      map.setView([Number(stop.lat), Number(stop.lng)], 16, { animate: true });
    }
  }, [position, stop, map]);

  return null;
}

export function TourPlayer({ stops }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastRoutePositionRef = useRef<Position | null>(null);
  const lastRouteRequestAtRef = useRef<number>(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [gpsAllowed, setGpsAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [showStops, setShowStops] = useState(false);
  const [permissionState, setPermissionState] = useState<GeoPermissionState>('unknown');
  const [routeLine, setRouteLine] = useState<RoutePoint[]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDurationSeconds, setRouteDurationSeconds] = useState<number | null>(null);

  const currentStop = useMemo(() => stops[currentIndex] ?? null, [stops, currentIndex]);

  async function checkPermissionState() {
    try {
      if (!navigator.permissions) {
        setPermissionState('unknown');
        return;
      }

      const result = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });

      setPermissionState(result.state as GeoPermissionState);

      result.onchange = () => {
        setPermissionState(result.state as GeoPermissionState);
      };
    } catch {
      setPermissionState('unknown');
    }
  }

  function startWatchingLocation() {
    if (!navigator.geolocation) {
      setError('Je apparaat ondersteunt geen locatie.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsAllowed(true);
        setPermissionState('granted');
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
      },
      (geoError) => {
        setGpsAllowed(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionState('denied');
          setError(
            'Locatie is geweigerd. Klik op het slotje links van de adresbalk en sta locatie toe, of gebruik de knop "Locatie inschakelen".'
          );
          return;
        }

        setError('Locatie kon niet worden opgehaald. Je kunt de tour nog wel handmatig volgen.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    watchIdRef.current = watchId;
  }

  function requestLocationAgain() {
    setError(null);
    void checkPermissionState();

    if (!navigator.geolocation) {
      setError('Je apparaat ondersteunt geen locatie.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsAllowed(true);
        setPermissionState('granted');
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        startWatchingLocation();
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionState('denied');
          setError(
            'Locatie is nog steeds geweigerd. Klik op het slotje links van de adresbalk en zet locatie op toestaan.'
          );
          return;
        }

        setError('Locatie kon niet opnieuw worden gestart.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }

  useEffect(() => {
    void checkPermissionState();
    startWatchingLocation();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setHasArrived(false);
    setPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  const fallbackDistanceToStop = useMemo(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng) return null;

    return distanceInMeters(
      position.lat,
      position.lng,
      Number(currentStop.lat),
      Number(currentStop.lng)
    );
  }, [position, currentStop]);

  const distanceToStop = routeDistance ?? fallbackDistanceToStop;
  const timeToStopSeconds =
    routeDurationSeconds ??
    (fallbackDistanceToStop !== null
      ? estimateWalkingSecondsFromMeters(fallbackDistanceToStop)
      : null);

  useEffect(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng || !currentStop.audio_url || playing) {
      return;
    }

    const triggerRadius = Number(currentStop.trigger_radius_meters ?? 35);
    const distance = distanceInMeters(
      position.lat,
      position.lng,
      Number(currentStop.lat),
      Number(currentStop.lng)
    );

    if (distance <= triggerRadius) {
      setHasArrived(true);
      void playCurrentStop();
    }
  }, [position, currentStop, playing]);

  useEffect(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng) {
      setRouteLine([]);
      setRouteDistance(null);
      setRouteDurationSeconds(null);
      return;
    }

    const lastPos = lastRoutePositionRef.current;
    const movedEnough =
      !lastPos ||
      distanceInMeters(position.lat, position.lng, lastPos.lat, lastPos.lng) > 20;

    const waitedLongEnough = Date.now() - lastRouteRequestAtRef.current > 12000;

    if (!movedEnough && !waitedLongEnough) return;

    const controller = new AbortController();
    const startLat = position.lat;
    const startLng = position.lng;
    const stopLat = Number(currentStop.lat);
    const stopLng = Number(currentStop.lng);

    async function loadWalkingRoute() {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/foot/` +
          `${startLng},${startLat};${stopLng},${stopLat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Route request failed: ${response.status}`);
        }

        const data = await response.json();
        const route = data?.routes?.[0];

        if (!route?.geometry?.coordinates?.length) {
          throw new Error('No route found');
        }

        const coordinates: RoutePoint[] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        setRouteLine(coordinates);
        setRouteDistance(route.distance ?? null);
        setRouteDurationSeconds(route.duration ?? null);
      } catch {
        const straightDistance = distanceInMeters(
          startLat,
          startLng,
          stopLat,
          stopLng
        );

        setRouteLine([
          [startLat, startLng],
          [stopLat, stopLng],
        ]);
        setRouteDistance(straightDistance);
        setRouteDurationSeconds(estimateWalkingSecondsFromMeters(straightDistance));
      } finally {
        lastRoutePositionRef.current = { lat: startLat, lng: startLng };
        lastRouteRequestAtRef.current = Date.now();
      }
    }

    void loadWalkingRoute();

    return () => controller.abort();
  }, [position, currentStop]);

  async function playCurrentStop() {
    if (!audioRef.current || !currentStop?.audio_url) return;

    audioRef.current.src = currentStop.audio_url;

    try {
      await audioRef.current.play();
      setPlaying(true);
      setError(null);
    } catch {
      setError('Audio kon niet automatisch starten. Druk op afspelen om handmatig te starten.');
    }
  }

  function pauseCurrentStop() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlaying(false);
  }

  function nextStop() {
    pauseCurrentStop();
    setCurrentIndex((prev) => Math.min(prev + 1, stops.length - 1));
  }

  function previousStop() {
    pauseCurrentStop();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }

  function goToStop(index: number) {
    pauseCurrentStop();
    setCurrentIndex(index);
  }

  function openWalkingRoute() {
    if (!currentStop?.lat || !currentStop?.lng) return;

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${Number(currentStop.lat)},${Number(
        currentStop.lng
      )}&travelmode=walking`,
      '_blank'
    );
  }

  const mapCenter: [number, number] = position
    ? [position.lat, position.lng]
    : currentStop?.lat && currentStop?.lng
      ? [Number(currentStop.lat), Number(currentStop.lng)]
      : [53.4396, 5.77];

  const progress = stops.length > 0 ? ((currentIndex + 1) / stops.length) * 100 : 0;

  const mapStyle: CSSProperties = {
    height: '300px',
    width: '100%',
  };

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        onEnded={() => {
          setPlaying(false);
          if (currentIndex < stops.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          }
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      <section className="overflow-hidden rounded-[1.5rem] border border-app bg-app-card shadow-card">
        <div className="bg-[linear-gradient(135deg,#10233f_0%,#163863_40%,#245a8b_100%)] p-3 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                Tour actief
              </div>
              <h1 className="mt-2 line-clamp-2 break-words pr-2 text-base font-semibold leading-5 sm:text-lg">
                {currentStop?.title ?? 'Tour'}
              </h1>
              <p className="mt-1 text-xs text-white/75">
                Stop {currentIndex + 1} van {stops.length}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-3 py-2 text-right">
              <div className="text-[11px] text-white/70">Status</div>
              <div className="text-xs font-semibold">
                {hasArrived ? 'Aangekomen' : 'Onderweg'}
              </div>
            </div>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-app bg-app-card shadow-card">
        <div className="relative">
          <MapContainer center={mapCenter} zoom={16} style={mapStyle} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap position={position} stop={currentStop} />

            {position ? (
              <>
                <Marker position={[position.lat, position.lng]} icon={userIcon}>
                  <Popup>Jij bent hier</Popup>
                </Marker>
                {position.accuracy ? (
                  <Circle center={[position.lat, position.lng]} radius={position.accuracy} />
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
                    <div className="font-medium">{currentStop.title}</div>
                    <div className="text-sm text-slate-500">Volgende stop</div>
                  </Popup>
                </Marker>
                <Circle
                  center={[Number(currentStop.lat), Number(currentStop.lng)]}
                  radius={Number(currentStop.trigger_radius_meters ?? 35)}
                />
              </>
            ) : null}

            {routeLine.length > 1 ? (
              <Polyline
                positions={routeLine}
                pathOptions={{
                  color: '#2563eb',
                  weight: 5,
                  opacity: 0.85,
                }}
              />
            ) : null}
          </MapContainer>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-app bg-app-card p-3 shadow-card">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-[#f8f4eb] p-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-app-muted">
              <LocateFixed className="h-3.5 w-3.5 text-app-accent" />
              Jij
            </div>
            <p className="mt-1 text-xs font-medium text-app-accent">
              {gpsAllowed ? 'Locatie actief' : 'Locatie uit'}
            </p>
          </div>

          <div className="rounded-xl bg-[#f8f4eb] p-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-app-muted">
              <Route className="h-3.5 w-3.5 text-app-accent" />
              Richting
            </div>
            <p className="mt-1 text-xs font-medium text-app-accent">
              Route over wegen
            </p>
          </div>

          <div className="rounded-xl bg-[#f8f4eb] p-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-app-muted">
              <Compass className="h-3.5 w-3.5 text-app-accent" />
              Afstand
            </div>
            <p className="mt-1 text-xs font-medium text-app-accent">
              {distanceToStop !== null ? formatDistance(distanceToStop) : '--'}
            </p>
          </div>

          <div className="rounded-xl bg-[#f8f4eb] p-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-app-muted">
              <Navigation className="h-3.5 w-3.5 text-app-accent" />
              Tijd
            </div>
            <p className="mt-1 text-xs font-medium text-app-accent">
              {timeToStopSeconds !== null ? estimateWalkingTime(timeToStopSeconds) : '--'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-app bg-app-card p-3 shadow-card">
        <div className="grid grid-cols-3 items-center gap-3">
          <button
            onClick={previousStop}
            disabled={currentIndex === 0}
            className="inline-flex items-center justify-center rounded-xl border border-app px-3 py-2.5 text-sm font-medium text-app-accent disabled:opacity-40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Vorige
          </button>

          <button
            onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
            className="inline-flex h-12 w-12 items-center justify-center justify-self-center rounded-full bg-app-accent text-white shadow-soft"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>

          <button
            onClick={nextStop}
            disabled={currentIndex === stops.length - 1}
            className="inline-flex items-center justify-center rounded-xl border border-app px-3 py-2.5 text-sm font-medium text-app-accent disabled:opacity-40"
          >
            Volgende
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            onClick={requestLocationAgain}
            className="inline-flex items-center justify-center rounded-xl border border-app bg-white px-4 py-2.5 text-sm font-medium text-app-accent"
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            {permissionState === 'denied' ? 'Probeer locatie opnieuw' : 'Locatie inschakelen'}
          </button>

          <button
            onClick={openWalkingRoute}
            className="inline-flex items-center justify-center rounded-xl bg-app-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Open wandelroute
          </button>

          <button
            onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
            className="inline-flex items-center justify-center rounded-xl border border-app bg-white px-4 py-2.5 text-sm font-medium text-app-accent"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {playing ? 'Pauzeer audio' : 'Speel audio af'}
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-[#e5d3a4] bg-[#fff7df] p-4 text-sm text-[#7c5b16]">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.5rem] border border-app bg-app-card p-3 shadow-card">
        <button
          onClick={() => setShowStops((prev) => !prev)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-app-accent" />
            <h2 className="font-semibold text-app-accent">Alle stops</h2>
          </div>
          {showStops ? (
            <ChevronUp className="h-5 w-5 text-app-accent" />
          ) : (
            <ChevronDown className="h-5 w-5 text-app-accent" />
          )}
        </button>

        {showStops ? (
          <div className="mt-3 space-y-2">
            {stops.map((stop, index) => (
              <button
                key={stop.id}
                onClick={() => goToStop(index)}
                className={`block w-full rounded-xl p-3 text-left text-sm transition ${
                  currentIndex === index
                    ? 'bg-app-accent text-white'
                    : 'bg-white text-app shadow-card'
                }`}
              >
                <div className="font-medium">
                  {index + 1}. {stop.title}
                </div>
                {stop.short_description ? (
                  <div
                    className={`mt-1 text-xs ${
                      currentIndex === index ? 'text-white/80' : 'text-app-muted'
                    }`}
                  >
                    {stop.short_description}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}