'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import {
  Pause,
  Play,
  MapPinned,
  Navigation,
  Headphones,
  ArrowRight,
  ArrowLeft,
  LocateFixed,
  CheckCircle2,
  Volume2,
  Compass,
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

const userIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,.18)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const nextStopIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#dc2626;border:3px solid white;box-shadow:0 0 0 4px rgba(220,38,38,.16)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function formatDistance(meters: number) {
  const roundedMeters = Math.round(meters);
  if (roundedMeters < 1000) return `${roundedMeters} m`;
  return `${(roundedMeters / 1000).toFixed(1)} km`;
}

function estimateWalkingTime(meters: number) {
  const roundedMeters = Math.round(meters);
  const minutes = Math.max(1, Math.round(roundedMeters / 78));
  if (minutes < 60) return `${minutes} min lopen`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}u ${remaining}m lopen`;
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
      map.fitBounds(bounds, { padding: [40, 40], animate: true, maxZoom: 17 });
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gpsAllowed, setGpsAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const currentStop = useMemo(() => stops[currentIndex] ?? null, [stops, currentIndex]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Je apparaat ondersteunt geen locatie.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsAllowed(true);
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
      },
      () => {
        setError('Locatie kon niet worden opgehaald. Je kunt de tour nog wel handmatig volgen.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    setHasArrived(false);
    setPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  const distanceToStop = useMemo(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng) return null;
    return distanceInMeters(
      position.lat,
      position.lng,
      Number(currentStop.lat),
      Number(currentStop.lng)
    );
  }, [position, currentStop]);

  useEffect(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng || !currentStop.audio_url || playing) return;

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
      `https://www.google.com/maps/dir/?api=1&destination=${Number(currentStop.lat)},${Number(currentStop.lng)}&travelmode=walking`,
      '_blank'
    );
  }

  const mapCenter: [number, number] = position
    ? [position.lat, position.lng]
    : currentStop?.lat && currentStop?.lng
      ? [Number(currentStop.lat), Number(currentStop.lng)]
      : [53.4396, 5.7700];

  const routeLine: [number, number][] =
    position && currentStop?.lat && currentStop?.lng
      ? [
          [position.lat, position.lng],
          [Number(currentStop.lat), Number(currentStop.lng)],
        ]
      : [];

  const progress = stops.length > 0 ? ((currentIndex + 1) / stops.length) * 100 : 0;

  const mapStyle: CSSProperties = {
    height: '420px',
    width: '100%',
  };

  return (
    <div className="space-y-4">
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

      <section className="overflow-hidden rounded-[1.75rem] border border-app bg-app-card shadow-card">
        <div className="bg-[linear-gradient(135deg,#10233f_0%,#163863_40%,#245a8b_100%)] p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                Stop {currentIndex + 1} van {stops.length}
              </div>
              <h1 className="mt-3 text-2xl font-semibold leading-tight">
                {currentStop?.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {currentStop?.short_description ?? 'Luister naar het verhaal op deze plek.'}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
              <div className="text-xs text-white/70">Status</div>
              <div className="text-sm font-semibold">
                {hasArrived ? 'Aangekomen' : 'Onderweg'}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="flex items-center gap-2 text-sm text-white/85">
                <LocateFixed className="h-4 w-4" />
                {gpsAllowed ? 'GPS actief' : 'Wachten op GPS'}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <div className="flex items-center gap-2 text-sm text-white/85">
                <Compass className="h-4 w-4" />
                {distanceToStop !== null ? formatDistance(distanceToStop) : 'Afstand onbekend'}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <div className="flex items-center gap-2 text-sm text-white/85">
                <Navigation className="h-4 w-4" />
                {distanceToStop !== null ? estimateWalkingTime(distanceToStop) : 'Looptijd onbekend'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-[#f8f4eb] p-4 text-sm text-app-muted">
            <div className="flex items-start gap-2">
              <Headphones className="mt-0.5 h-4 w-4 text-app-accent" />
              <div>
                {hasArrived
                  ? 'Je bent bij de juiste plek. Het verhaal kan nu afspelen.'
                  : 'Loop naar de rode marker. Audio start automatisch zodra je dichtbij genoeg bent.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-app bg-app-card shadow-card">
        <div className="border-b border-app bg-[#f8f4eb] px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-app-accent" />
            <h2 className="font-semibold text-app-accent">Live kaart</h2>
          </div>
        </div>

        <div className="p-0">
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
                  icon={nextStopIcon}
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

            {routeLine.length === 2 ? <Polyline positions={routeLine} /> : null}
          </MapContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-app bg-app-card shadow-card">
        <div className="p-4">
          <div className="grid grid-cols-3 items-center gap-3">
            <button
              onClick={previousStop}
              disabled={currentIndex === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-app px-4 py-3 text-sm font-medium text-app-accent disabled:opacity-40"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vorige
            </button>

            <button
              onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
              className="inline-flex h-14 w-14 items-center justify-center justify-self-center rounded-full bg-app-accent text-white shadow-soft"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>

            <button
              onClick={nextStop}
              disabled={currentIndex === stops.length - 1}
              className="inline-flex items-center justify-center rounded-2xl border border-app px-4 py-3 text-sm font-medium text-app-accent disabled:opacity-40"
            >
              Volgende
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={openWalkingRoute}
              className="inline-flex items-center justify-center rounded-2xl bg-app-accent px-4 py-3 text-sm font-medium text-white"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Open wandelroute
            </button>

            <button
              onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
              className="inline-flex items-center justify-center rounded-2xl border border-app bg-white px-4 py-3 text-sm font-medium text-app-accent"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {playing ? 'Pauzeer audio' : 'Speel audio af'}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-[#e5d3a4] bg-[#fff7df] p-4 text-sm text-[#7c5b16]">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-app bg-app-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-app-accent" />
          <h2 className="font-semibold text-app-accent">Alle stops</h2>
        </div>

        <div className="mt-4 space-y-2">
          {stops.map((stop, index) => (
            <button
              key={stop.id}
              onClick={() => goToStop(index)}
              className={`block w-full rounded-2xl p-3 text-left text-sm transition ${
                currentIndex === index
                  ? 'bg-app-accent text-white'
                  : 'bg-white text-app shadow-card'
              }`}
            >
              <div className="font-medium">
                {index + 1}. {stop.title}
              </div>
              {stop.short_description ? (
                <div className={`mt-1 text-xs ${currentIndex === index ? 'text-white/80' : 'text-app-muted'}`}>
                  {stop.short_description}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
