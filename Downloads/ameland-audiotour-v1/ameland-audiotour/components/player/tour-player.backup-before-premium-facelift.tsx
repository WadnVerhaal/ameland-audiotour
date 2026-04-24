'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Compass,
  LocateFixed,
  MapPinned,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { TourStop } from '@/types/tour';
import { distanceInMeters } from '@/lib/utils/geo';

type Props = {
  token: string;
  stops: TourStop[];
  tourTitle?: string;
};

type UserPosition = {
  lat: number;
  lng: number;
  accuracy?: number;
};

type LocationStatus = 'loading' | 'ready' | 'error';

function readField(stop: TourStop | undefined, field: string): unknown {
  if (!stop) return undefined;
  return (stop as unknown as Record<string, unknown>)[field];
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function getStopTitle(stop: TourStop | undefined, fallback = 'Audiostop') {
  return String(
    readField(stop, 'title_nl') ??
      readField(stop, 'title') ??
      readField(stop, 'name') ??
      fallback
  );
}

function getStopDescription(stop: TourStop | undefined) {
  return String(
    readField(stop, 'short_description') ??
      readField(stop, 'description') ??
      readField(stop, 'subtitle') ??
      'Luister naar het verhaal op deze plek.'
  );
}

function getStopLat(stop: TourStop | undefined) {
  return toNumber(readField(stop, 'lat') ?? readField(stop, 'latitude'));
}

function getStopLng(stop: TourStop | undefined) {
  return toNumber(readField(stop, 'lng') ?? readField(stop, 'longitude'));
}

function getStopAudioUrl(stop: TourStop | undefined) {
  const value =
    readField(stop, 'audio_url') ??
    readField(stop, 'audio_url_nl') ??
    readField(stop, 'audioUrl');

  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getTriggerRadius(stop: TourStop | undefined) {
  return (
    toNumber(
      readField(stop, 'trigger_radius_meters') ??
        readField(stop, 'triggerRadiusMeters') ??
        readField(stop, 'radius')
    ) ?? 35
  );
}

function getStopOrder(stop: TourStop, index: number) {
  return (
    toNumber(
      readField(stop, 'order_index') ??
        readField(stop, 'order') ??
        readField(stop, 'sort_order') ??
        readField(stop, 'sequence')
    ) ?? index
  );
}

function pointFromStop(stop: TourStop | undefined): [number, number] | null {
  const lat = getStopLat(stop);
  const lng = getStopLng(stop);

  if (lat === null || lng === null) return null;
  return [lat, lng];
}

function getDistanceFromUser(position: UserPosition | null, stop: TourStop | undefined) {
  const point = pointFromStop(stop);
  if (!position || !point) return null;
  return distanceInMeters(position.lat, position.lng, point[0], point[1]);
}

function formatDistance(meters: number | null) {
  if (meters === null) return 'zoeken';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

function estimateWalkingTime(meters: number | null) {
  if (meters === null) return '—';
  const minutes = Math.max(1, Math.round(meters / 80));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}u ${rest}m` : `${hours}u`;
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

async function fetchWalkingRoute(points: [number, number][]) {
  if (points.length < 2) {
    return {
      points,
      routed: false,
      provider: 'none',
    };
  }

  try {
    const response = await fetch('/api/routing/walking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) throw new Error('Walking route API failed');

    const data = await response.json();

    if (!Array.isArray(data?.points) || data.points.length < 2) {
      return {
        points,
        routed: false,
        provider: 'fallback',
      };
    }

    return {
      points: data.points as [number, number][],
      routed: Boolean(data?.routed),
      provider: String(data?.provider ?? 'walking'),
    };
  } catch {
    return {
      points,
      routed: false,
      provider: 'fallback',
    };
  }
}

export function TourPlayer({
  token,
  stops,
  tourTitle = 'Ameland Audio Tours',
}: Props) {
  void token;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const targetMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const lastRouteKeyRef = useRef<string | null>(null);

  const orderedStops = useMemo(() => {
    return [...stops].sort((a, b) => {
      const indexA = stops.indexOf(a);
      const indexB = stops.indexOf(b);
      return getStopOrder(a, indexA) - getStopOrder(b, indexB);
    });
  }, [stops]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [gpsAllowed, setGpsAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('loading');
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [routeRouted, setRouteRouted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentStop = orderedStops[currentIndex];
  const nextStop = orderedStops[currentIndex + 1] ?? null;
  const previousStop = orderedStops[currentIndex - 1] ?? null;
  const isLastStop = currentIndex >= orderedStops.length - 1;

  const destinationStop = nextStop ?? currentStop;
  const currentPoint = useMemo(() => pointFromStop(currentStop), [currentStop]);
  const destinationPoint = useMemo(() => pointFromStop(destinationStop), [destinationStop]);

  const progressPercentage =
    orderedStops.length > 1 ? Math.round((currentIndex / (orderedStops.length - 1)) * 100) : 100;

  const distanceToCurrentStop = useMemo(() => {
    return getDistanceFromUser(position, currentStop);
  }, [position, currentStop]);

  const distanceToDestination = useMemo(() => {
    return getDistanceFromUser(position, destinationStop);
  }, [position, destinationStop]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Je apparaat ondersteunt geen locatiebepaling.');
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsAllowed(true);
        setLocationStatus('ready');
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
      },
      () => {
        setLocationStatus('error');
        setError('Locatie kon niet worden opgehaald. Je kunt de audiostops handmatig starten.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Je apparaat ondersteunt geen locatiebepaling.');
      return;
    }

    requestLocation();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsAllowed(true);
        setLocationStatus('ready');
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        setLocationStatus('error');
        setError('Locatie kon niet worden opgehaald. Je kunt de audiostops handmatig starten.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!position || !currentStop || playing) return;

    const point = pointFromStop(currentStop);
    const audioUrl = getStopAudioUrl(currentStop);

    if (!point || !audioUrl) return;

    const distance = distanceInMeters(position.lat, position.lng, point[0], point[1]);

    if (distance <= getTriggerRadius(currentStop)) {
      void playCurrentStop();
    }
  }, [position, currentStop, playing]);

  useEffect(() => {
    let active = true;

    async function loadPointToPointRoute() {
      const start = position
        ? ([position.lat, position.lng] as [number, number])
        : currentPoint;

      const end = destinationPoint;

      if (!start || !end) {
        setRouteGeometry([]);
        setRouteRouted(false);
        return;
      }

      const routeKey = [
        currentIndex,
        Math.round(start[0] * 10000),
        Math.round(start[1] * 10000),
        Math.round(end[0] * 10000),
        Math.round(end[1] * 10000),
      ].join(':');

      if (lastRouteKeyRef.current === routeKey) {
        return;
      }

      lastRouteKeyRef.current = routeKey;

      const route = await fetchWalkingRoute([start, end]);

      if (!active) return;

      setRouteGeometry(route.points);
      setRouteRouted(route.routed);
    }

    loadPointToPointRoute();

    return () => {
      active = false;
    };
  }, [position, currentPoint, destinationPoint, currentIndex]);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!mapElementRef.current || mapRef.current) return;

      const center =
        position
          ? ([position.lat, position.lng] as [number, number])
          : destinationPoint ?? currentPoint;

      if (!center) return;

      const leaflet = await import('leaflet');
      if (cancelled || !mapElementRef.current) return;

      const L = (leaflet as any).default ?? leaflet;

      const map = L.map(mapElementRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: true,
      }).setView(center, 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    setupMap();

    return () => {
      cancelled = true;
    };
  }, [position, destinationPoint, currentPoint]);

  useEffect(() => {
    async function updateMap() {
      if (!mapRef.current) return;

      const leaflet = await import('leaflet');
      const L = (leaflet as any).default ?? leaflet;
      const map = mapRef.current;

      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }

      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }

      const startPoint = position
        ? ([position.lat, position.lng] as [number, number])
        : currentPoint;

      const endPoint = destinationPoint;

      const lineToDraw =
        routeGeometry.length > 1
          ? routeGeometry
          : ([startPoint, endPoint].filter(Boolean) as [number, number][]);

      if (lineToDraw.length > 1) {
        routeLineRef.current = L.polyline(lineToDraw, {
          color: routeRouted ? '#0f5a43' : '#8a7c61',
          weight: routeRouted ? 6 : 4,
          opacity: routeRouted ? 0.92 : 0.65,
          dashArray: routeRouted ? undefined : '8 8',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      if (endPoint) {
        targetMarkerRef.current = L.marker(endPoint, {
          icon: L.divIcon({
            className: '',
            html: `
              <div style="
                min-width: 86px;
                height: 32px;
                padding: 0 11px;
                border-radius: 999px;
                background: #123c2f;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 12px;
                border: 2px solid white;
                box-shadow: 0 8px 18px rgba(0,0,0,.13);
                white-space: nowrap;
              ">
                Bestemming
              </div>
            `,
            iconSize: [86, 32],
            iconAnchor: [43, 16],
          }),
        }).addTo(map);
      }

      const bounds = L.latLngBounds([]);
      lineToDraw.forEach((point) => bounds.extend(point));
      if (position) bounds.extend([position.lat, position.lng]);

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [34, 34],
          maxZoom: 17,
        });
      }
    }

    updateMap();
  }, [routeGeometry, routeRouted, position, currentPoint, destinationPoint]);

  useEffect(() => {
    async function updateUserMarker() {
      if (!mapRef.current || !position) return;

      const leaflet = await import('leaflet');
      const L = (leaflet as any).default ?? leaflet;
      const map = mapRef.current;

      const userIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 999px;
            background: #2563eb;
            border: 3px solid white;
            box-shadow: 0 6px 14px rgba(37,99,235,.28);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([position.lat, position.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([position.lat, position.lng]);
      }

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([position.lat, position.lng]);
        accuracyCircleRef.current.setRadius(position.accuracy ?? 20);
      } else {
        accuracyCircleRef.current = L.circle([position.lat, position.lng], {
          radius: position.accuracy ?? 20,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);
      }
    }

    updateUserMarker();
  }, [position]);

  async function playCurrentStop() {
    const audioUrl = getStopAudioUrl(currentStop);

    if (!audioRef.current || !audioUrl) {
      setError('Bij deze stop is nog geen audiobestand gevonden.');
      return;
    }

    if (audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }

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

  function seekAudio(seconds: number) {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const total = audio.duration || duration || 0;
    const targetTime = Math.max(0, Math.min(total, audio.currentTime + seconds));

    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  }

  function goToPreviousStop() {
    pauseCurrentStop();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }

  function goToNextStop() {
    pauseCurrentStop();
    setCurrentIndex((prev) => Math.min(prev + 1, orderedStops.length - 1));
  }

  function focusOnUser() {
    if (!position || !mapRef.current) {
      requestLocation();
      return;
    }

    mapRef.current.setView([position.lat, position.lng], 17, {
      animate: true,
    });
  }

  if (orderedStops.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black text-[#123c2f]">Geen stops gevonden</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Deze tour heeft nog geen actieve stops. Controleer in Supabase of de tourstops actief zijn.
        </p>
      </div>
    );
  }

  const audioProgress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#edf4f1] px-3 py-3 text-[#123c2f] sm:px-5 sm:py-5">
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : 0);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(0);
          if (currentIndex < orderedStops.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          }
        }}
      />

      <section className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl">
          <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#123c2f] px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-white">
                <Compass className="h-3.5 w-3.5" />
                Je volgt nu
              </span>

              <span className="inline-flex items-center rounded-full bg-[#f6f3ea] px-3 py-1.5 text-xs font-bold text-[#123c2f]">
                Stop {currentIndex + 1} / {orderedStops.length}
              </span>

              <span className="inline-flex items-center rounded-full bg-[#f6f3ea] px-3 py-1.5 text-xs font-bold text-[#123c2f]">
                {locationStatus === 'ready' && gpsAllowed
                  ? 'GPS actief'
                  : locationStatus === 'loading'
                    ? 'GPS zoeken'
                    : 'GPS beperkt'}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#123c2f] sm:text-4xl">
              {tourTitle}
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {isLastStop
                ? 'Je bent aangekomen bij de laatste stop van deze tour.'
                : `Navigeer naar ${getStopTitle(destinationStop, 'de volgende stop')} en luister verder op locatie.`}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-[#123c2f] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="border-y border-black/10 bg-[#f8fbf9] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[.14em] text-stone-400">
                  Navigatie
                </p>
                <h2 className="mt-1 line-clamp-2 text-2xl font-black text-[#123c2f] sm:text-3xl">
                  {getStopTitle(destinationStop, 'Volgende stop')}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">
                  {getStopDescription(destinationStop)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#123c2f] ring-1 ring-black/5">
                  {formatDistance(distanceToDestination)}
                </div>
                <div className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#123c2f] ring-1 ring-black/5">
                  {estimateWalkingTime(distanceToDestination)}
                </div>
                <div className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#123c2f] ring-1 ring-black/5">
                  {routeRouted ? 'Wandelroute' : 'Route'}
                </div>

                <button
                  type="button"
                  onClick={goToPreviousStop}
                  disabled={!previousStop}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#123c2f] ring-1 ring-black/5 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Vorige stop"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={goToNextStop}
                  disabled={isLastStop}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#123c2f] text-white transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Volgende stop"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={focusOnUser}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#123c2f] ring-1 ring-black/5 transition hover:scale-[1.03]"
                  aria-label="Mijn locatie"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative h-[66vh] min-h-[540px] bg-[#dbe9e5] lg:h-[74vh]">
            {currentPoint || destinationPoint ? (
              <div ref={mapElementRef} className="absolute inset-0" />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div>
                  <MapPinned className="mx-auto h-10 w-10 text-stone-300" />
                  <h2 className="mt-4 text-xl font-black text-[#123c2f]">
                    Geen coördinaten gevonden
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
                    Voeg lat/lng of latitude/longitude toe aan je tourstops in Supabase.
                  </p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute left-4 top-4 z-[500]">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/86 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-[#123c2f] shadow-sm backdrop-blur">
                <Navigation className="h-3.5 w-3.5" />
                {routeRouted ? 'Wandelroute' : 'Route'}
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2">
              <div className="pointer-events-auto rounded-full border border-white/70 bg-white/86 px-3 py-1.5 text-[11px] font-black text-[#123c2f] shadow-sm backdrop-blur">
                {getStopTitle(destinationStop, 'Volgende stop')}
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#123c2f] px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-white">
                Audio
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f6f3ea] px-3 py-1.5 text-xs font-bold text-[#123c2f]">
                {getStopTitle(currentStop, `Stop ${currentIndex + 1}`)}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#f6f3ea] px-3 py-1.5 text-xs font-bold text-[#123c2f]">
                {formatDistance(distanceToCurrentStop)}
              </span>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-6">{error}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>{formatAudioTime(currentTime)}</span>
                <span>{formatAudioTime(duration)}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-[#123c2f] transition-all"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 sm:gap-5">
                <button
                  type="button"
                  onClick={() => seekAudio(-15)}
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f3ea] text-[#123c2f] shadow-sm transition hover:scale-[1.03]"
                  aria-label="15 seconden terugspoelen"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="absolute bottom-1.5 text-[9px] font-black">15</span>
                </button>

                <button
                  type="button"
                  onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#123c2f] text-white shadow-lg transition hover:scale-[1.03]"
                  aria-label={playing ? 'Pauzeer audio' : 'Speel audio af'}
                >
                  {playing ? <Pause className="h-7 w-7" /> : <Play className="ml-0.5 h-7 w-7" />}
                </button>

                <button
                  type="button"
                  onClick={() => seekAudio(15)}
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f3ea] text-[#123c2f] shadow-sm transition hover:scale-[1.03]"
                  aria-label="15 seconden vooruitspoelen"
                >
                  <RotateCw className="h-5 w-5" />
                  <span className="absolute bottom-1.5 text-[9px] font-black">15</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
