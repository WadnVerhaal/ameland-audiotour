'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="mb-2 text-sm text-stone-500">Stop {currentIndex + 1} van {stops.length}</div>
        <h1 className="text-2xl font-semibold">{currentStop?.title}</h1>
        <p className="mt-2 text-sm text-stone-600">
          {currentStop?.short_description ?? 'Luister naar het verhaal op deze plek.'}
        </p>
      </div>

      <div className="rounded-3xl bg-stone-950 p-4 text-white shadow-soft">
        <audio
          ref={audioRef}
          onEnded={() => {
            setPlaying(false);
            if (currentIndex < stops.length - 1) setCurrentIndex((prev) => prev + 1);
          }}
        />
        <div className="text-sm text-stone-300">{gpsAllowed ? 'GPS actief' : 'Wachten op GPS'}</div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => (playing ? pauseCurrentStop() : playCurrentStop())} className="rounded-2xl bg-white px-4 py-3 font-medium text-stone-900">
            {playing ? 'Pauzeer' : 'Speel af'}
          </button>
          <button onClick={nextStop} className="rounded-2xl border border-white/20 px-4 py-3 font-medium text-white">
            Volgende stop
          </button>
        </div>
      </div>

      {error ? <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{error}</div> : null}

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h2 className="font-semibold">Stops</h2>
        <div className="mt-3 space-y-2">
          {stops.map((stop, index) => (
            <button
              key={stop.id}
              onClick={() => setCurrentIndex(index)}
              className={`block w-full rounded-2xl p-3 text-left text-sm ${currentIndex === index ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-700'}`}
            >
              {index + 1}. {stop.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
