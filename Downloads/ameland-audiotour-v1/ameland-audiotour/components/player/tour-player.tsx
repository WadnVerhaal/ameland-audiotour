'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, MapPinned, Navigation, Headphones } from 'lucide-react';
import { TourStop } from '@/types/tour';
import { distanceInMeters } from '@/lib/utils/geo';

type Props = {
  token: string;
  stops: TourStop[];
};

export function TourPlayer({ stops }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gpsAllowed, setGpsAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const currentStop = useMemo(() => stops[currentIndex], [stops, currentIndex]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Je apparaat ondersteunt geen locatie.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsAllowed(true);
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError('Locatie kon niet worden opgehaald. Je kunt stops handmatig starten.'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!position || !currentStop?.lat || !currentStop?.lng || !currentStop.audio_url || playing) return;
    const distance = distanceInMeters(position.lat, position.lng, Number(currentStop.lat), Number(currentStop.lng));
    if (distance <= currentStop.trigger_radius_meters) void playCurrentStop();
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

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] border border-app bg-app-card shadow-card">
        <div className="h-36 w-full bg-[linear-gradient(135deg,#e9dfbf_0%,#f4efe4_45%,#d9e3de_100%)]" />
        <div className="p-4">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            Stop {currentIndex + 1} van {stops.length}
          </div>
          <h1 className="mt-3 text-2xl font-semibold leading-tight text-app-accent">
            {currentStop?.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            {currentStop?.short_description ?? 'Luister naar het verhaal op deze plek.'}
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-app bg-app-accent p-4 text-white shadow-soft">
        <audio
          ref={audioRef}
          onEnded={() => {
            setPlaying(false);
            if (currentIndex < stops.length - 1) setCurrentIndex((prev) => prev + 1);
          }}
        />

        <div className="flex items-center gap-2 text-sm text-white/80">
          <Navigation className="h-4 w-4" />
          {gpsAllowed ? 'GPS actief' : 'Wachten op GPS'}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            onClick={previousStop}
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-white"
          >
            Vorige
          </button>

          <button
            onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-app-accent"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>

          <button
            onClick={nextStop}
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-white"
          >
            Volgende
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-white/85">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Start handmatig of laat audio automatisch afspelen wanneer je op de juiste plek bent.
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
          <MapPinned className="h-4 w-4 text-app-accent" />
          <h2 className="font-semibold text-app-accent">Stops in deze tour</h2>
        </div>

        <div className="mt-4 space-y-2">
          {stops.map((stop, index) => (
            <button
              key={stop.id}
              onClick={() => setCurrentIndex(index)}
              className={`block w-full rounded-2xl p-3 text-left text-sm transition ${
                currentIndex === index
                  ? 'bg-app-accent text-white'
                  : 'bg-white text-app shadow-card'
              }`}
            >
              {index + 1}. {stop.title}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}