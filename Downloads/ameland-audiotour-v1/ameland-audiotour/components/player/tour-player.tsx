"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

const PlayerMap = dynamic(
  () => import("./player-map").then((mod) => mod.PlayerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-900 text-sm font-bold text-slate-300">
        Kaart laden…
      </div>
    ),
  }
);

export type PlayerLanguage = "nl" | "en" | "de";

export type PlayerStop = {
  id?: string | number | null;
  title?: string | null;
  title_nl?: string | null;
  title_en?: string | null;
  title_de?: string | null;
  description?: string | null;
  description_nl?: string | null;
  description_en?: string | null;
  description_de?: string | null;
  audio_url?: string | null;
  audio_url_nl?: string | null;
  audio_url_en?: string | null;
  audio_url_de?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  lat?: string | number | null;
  lng?: string | number | null;
  order_index?: string | number | null;
  trigger_radius_m?: string | number | null;
  trigger_radius?: string | number | null;
  radius_m?: string | number | null;
  image_url?: string | null;
  [key: string]: unknown;
};

export type PlayerTour = {
  id?: string | number | null;
  title?: string | null;
  title_nl?: string | null;
  title_en?: string | null;
  title_de?: string | null;
  description?: string | null;
  description_nl?: string | null;
  description_en?: string | null;
  description_de?: string | null;
  duration?: string | number | null;
  duration_label?: string | null;
  distance?: string | number | null;
  [key: string]: unknown;
};

type Props = {
  token: string;
  tour: PlayerTour;
  stops: PlayerStop[];
  initialLanguage: PlayerLanguage;
  expiresAt: string | null;
};

type GeoPoint = {
  lat: number;
  lng: number;
  accuracy: number;
  at: number;
};

const AUTO_PLAY_RADIUS_M = 10;
const THANK_YOU_PATH = "/bedankt";

const LANGUAGES: Array<{ code: PlayerLanguage; label: string }> = [
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

const COPY: Record<PlayerLanguage, Record<string, string>> = {
  nl: {
    brand: "Ameland Audiotours",
    gpsActive: "GPS actief",
    gpsWaiting: "GPS zoeken",
    gpsDenied: "Locatie geweigerd",
    gpsUnsupported: "GPS niet ondersteund",
    currentStory: "Huidig verhaal",
    distance: "Afstand",
    progress: "Voortgang",
    previous: "Vorige",
    next: "Volgende",
    openRoute: "Open looproute",
    playAudio: "Start audio",
    noAudio: "Voor deze stop is nog geen audio in deze taal beschikbaar.",
    audioBlocked:
      "Tik op afspelen. Je telefoon blokkeert soms automatisch starten van audio.",
    arrived: "Je bent op de juiste plek",
    walkToStop: "Loop naar dit punt",
    stops: "Routepunten",
    expires: "Toegang actief",
    selected: "Geselecteerd",
    completed: "Beluisterd",
    metersAway: "afstand",
    allStops: "Alle stops",
    gpsRequest: "Locatie opnieuw vragen",
  },
  en: {
    brand: "Ameland Audiotours",
    gpsActive: "GPS active",
    gpsWaiting: "Finding GPS",
    gpsDenied: "Location denied",
    gpsUnsupported: "GPS unsupported",
    currentStory: "Current story",
    distance: "Distance",
    progress: "Progress",
    previous: "Previous",
    next: "Next",
    openRoute: "Open walking route",
    playAudio: "Start audio",
    noAudio: "No audio is available for this stop in the selected language yet.",
    audioBlocked:
      "Tap play. Your phone may block audio from starting automatically.",
    arrived: "You are at the right place",
    walkToStop: "Walk to this point",
    stops: "Route stops",
    expires: "Access active",
    selected: "Selected",
    completed: "Played",
    metersAway: "away",
    allStops: "All stops",
    gpsRequest: "Ask location again",
  },
  de: {
    brand: "Ameland Audiotours",
    gpsActive: "GPS aktiv",
    gpsWaiting: "GPS wird gesucht",
    gpsDenied: "Standort abgelehnt",
    gpsUnsupported: "GPS nicht unterstützt",
    currentStory: "Aktuelle Geschichte",
    distance: "Entfernung",
    progress: "Fortschritt",
    previous: "Zurück",
    next: "Weiter",
    openRoute: "Route öffnen",
    playAudio: "Audio starten",
    noAudio:
      "Für diesen Stopp ist in der gewählten Sprache noch kein Audio verfügbar.",
    audioBlocked:
      "Tippe auf Abspielen. Dein Telefon blockiert manchmal den automatischen Audiostart.",
    arrived: "Du bist am richtigen Ort",
    walkToStop: "Gehe zu diesem Punkt",
    stops: "Routenpunkte",
    expires: "Zugang aktiv",
    selected: "Ausgewählt",
    completed: "Gehört",
    metersAway: "entfernt",
    allStops: "Alle Stopps",
    gpsRequest: "Standort erneut anfragen",
  },
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function stringValue(source: PlayerStop | PlayerTour | null, keys: string[]) {
  if (!source) return "";

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
}

function numberValue(source: PlayerStop | null, keys: string[]) {
  if (!source) return null;

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string" && value.trim()) {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }

  return null;
}

function titleFor(source: PlayerStop | PlayerTour | null, lang: PlayerLanguage) {
  if (lang === "nl") return stringValue(source, ["title_nl", "title", "title_en", "title_de"]);
  if (lang === "en") return stringValue(source, ["title_en", "title_nl", "title", "title_de"]);
  return stringValue(source, ["title_de", "title_nl", "title", "title_en"]);
}

function descriptionFor(source: PlayerStop | PlayerTour | null, lang: PlayerLanguage) {
  if (lang === "nl") {
    return stringValue(source, ["description_nl", "description", "description_en", "description_de"]);
  }

  if (lang === "en") {
    return stringValue(source, ["description_en", "description_nl", "description", "description_de"]);
  }

  return stringValue(source, ["description_de", "description_nl", "description", "description_en"]);
}

function audioFor(stop: PlayerStop | null, lang: PlayerLanguage) {
  if (!stop) return "";

  if (lang === "nl") return stringValue(stop, ["audio_url_nl", "audio_nl", "audioUrlNl", "audio_url"]);
  if (lang === "en") return stringValue(stop, ["audio_url_en", "audio_en", "audioUrlEn"]);
  return stringValue(stop, ["audio_url_de", "audio_de", "audioUrlDe"]);
}

function stopKey(stop: PlayerStop | null, index: number) {
  return String(stop?.id ?? stop?.order_index ?? index);
}

function coordinatesFor(stop: PlayerStop | null) {
  if (!stop) return null;

  const lat = numberValue(stop, ["latitude", "lat"]);
  const lng = numberValue(stop, ["longitude", "lng"]);

  if (lat === null || lng === null) return null;

  return { lat, lng };
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function bearingDegrees(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function compassLabel(degrees: number) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(degrees / 45) % 8];
}

function formatDistance(meters: number | null) {
  if (meters === null || !Number.isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.max(0, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatExpiry(expiresAt: string | null, lang: PlayerLanguage) {
  if (!expiresAt) return COPY[lang].expires;

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return COPY[lang].expires;

  return `${COPY[lang].expires} · ${date.toLocaleDateString(
    lang === "nl" ? "nl-NL" : lang === "de" ? "de-DE" : "en-GB",
    { day: "2-digit", month: "short" }
  )}`;
}

function LanguageSwitch({
  language,
  setLanguage,
}: {
  language: PlayerLanguage;
  setLanguage: (language: PlayerLanguage) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1">
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          aria-pressed={language === item.code}
          onClick={() => setLanguage(item.code)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-black transition",
            language === item.code
              ? "bg-white text-slate-950 shadow"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-white/10 bg-white/[0.055] p-3 shadow-lg">
      <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xl font-black tracking-tight text-white">
        {value}
      </p>
      {helper ? <p className="mt-0.5 truncate text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

export function TourPlayer({ token, tour, stops, initialLanguage, expiresAt }: Props) {
  const [language, setLanguageState] = useState<PlayerLanguage>(initialLanguage);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [arrivedIndex, setArrivedIndex] = useState<number | null>(null);
  const [reachedKeys, setReachedKeys] = useState<string[]>([]);
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [locationState, setLocationState] = useState<"waiting" | "active" | "denied" | "unsupported">("waiting");
  const [audioBlocked, setAudioBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastAcceptedLocationRef = useRef<GeoPoint | null>(null);
  const playedAutomaticallyRef = useRef<Set<string>>(new Set());

  const copy = COPY[language];

  const cleanStops = useMemo(
    () => stops.filter((stop): stop is PlayerStop => Boolean(stop)),
    [stops]
  );

  const selectedStop = cleanStops[selectedIndex] || cleanStops[0] || null;
  const selectedStopCoordinates = coordinatesFor(selectedStop);
  const selectedAudioUrl = audioFor(selectedStop, language);

  const selectedDistance = useMemo(() => {
    if (!location || !selectedStopCoordinates) return null;
    return distanceMeters(location, selectedStopCoordinates);
  }, [location, selectedStopCoordinates]);

  const direction = useMemo(() => {
    if (!location || !selectedStopCoordinates) return null;
    const degrees = bearingDegrees(location, selectedStopCoordinates);
    return { degrees, label: compassLabel(degrees) };
  }, [location, selectedStopCoordinates]);

  const progress = cleanStops.length
    ? `${Math.min(reachedKeys.length, cleanStops.length)}/${cleanStops.length}`
    : "0/0";

  const selectedTitle = titleFor(selectedStop, language) || `${copy.stops} ${selectedIndex + 1}`;
  const selectedDescription = descriptionFor(selectedStop, language);
  const selectedKey = stopKey(selectedStop, selectedIndex);
  const selectedIsReached = reachedKeys.includes(selectedKey);
  const selectedIsArrived =
    arrivedIndex === selectedIndex ||
    (selectedDistance !== null && selectedDistance <= AUTO_PLAY_RADIUS_M);

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("waiting");

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 999,
          at: Date.now(),
        };

        const previous = lastAcceptedLocationRef.current;
        const moved = previous ? distanceMeters(previous, next) : Number.POSITIVE_INFINITY;
        const accuracyImproved = previous ? next.accuracy < previous.accuracy * 0.75 : true;
        const stale = previous ? Date.now() - previous.at > 20000 : true;

        if (!previous || moved >= 6 || accuracyImproved || stale) {
          lastAcceptedLocationRef.current = next;
          setLocation(next);
        }

        setLocationState("active");
      },
      () => {
        setLocationState("denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 8000,
        timeout: 15000,
      }
    );
  }

  function setLanguage(nextLanguage: PlayerLanguage) {
    setLanguageState(nextLanguage);

    try {
      window.localStorage.setItem("aat.language", nextLanguage);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("lang", nextLanguage);
      window.history.replaceState(null, "", nextUrl.toString());
    } catch {
      // niet kritiek
    }
  }

  function openWalkingRoute() {
    if (!selectedStopCoordinates) return;

    const url = new URL("https://www.google.com/maps/dir/");
    url.searchParams.set("api", "1");
    url.searchParams.set("destination", `${selectedStopCoordinates.lat},${selectedStopCoordinates.lng}`);
    url.searchParams.set("travelmode", "walking");

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function playAudio() {
    setAudioBlocked(false);
    audioRef.current?.play().catch(() => setAudioBlocked(true));
  }

  function goToStop(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), cleanStops.length - 1);
    setSelectedIndex(nextIndex);
    setAudioBlocked(false);
  }

  function goToThankYouPage() {
    const params = new URLSearchParams();
    params.set("lang", language);
    params.set("token", token);
    params.set("completed", "1");

    window.location.assign(`${THANK_YOU_PATH}?${params.toString()}`);
  }

  function handleAudioEnded() {
    setReachedKeys((current) =>
      current.includes(selectedKey) ? current : [...current, selectedKey]
    );

    if (selectedIndex >= cleanStops.length - 1) {
      window.setTimeout(goToThankYouPage, 450);
    }
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("aat.language");

      if (
        stored &&
        LANGUAGES.some((item) => item.code === stored) &&
        !window.location.search.includes("lang=")
      ) {
        setLanguageState(stored as PlayerLanguage);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    requestLocation();

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (!cleanStops.length) return;
    if (selectedIndex > cleanStops.length - 1) setSelectedIndex(0);
  }, [cleanStops.length, selectedIndex]);

  useEffect(() => {
    if (!location || !cleanStops.length) return;

    const nearbyIndex = cleanStops.findIndex((stop) => {
      const coordinates = coordinatesFor(stop);
      if (!coordinates) return false;
      return distanceMeters(location, coordinates) <= AUTO_PLAY_RADIUS_M;
    });

    setArrivedIndex(nearbyIndex >= 0 ? nearbyIndex : null);
  }, [location, cleanStops]);

  useEffect(() => {
    if (arrivedIndex === null) return;

    const stop = cleanStops[arrivedIndex];
    const key = stopKey(stop, arrivedIndex);

    setSelectedIndex(arrivedIndex);
    setReachedKeys((current) => (current.includes(key) ? current : [...current, key]));
  }, [arrivedIndex, cleanStops]);

  useEffect(() => {
    setAudioBlocked(false);
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load();
  }, [selectedAudioUrl, selectedIndex, language]);

  useEffect(() => {
    if (arrivedIndex === null || arrivedIndex !== selectedIndex || !selectedAudioUrl) return;

    const key = `${language}-${selectedKey}`;
    if (playedAutomaticallyRef.current.has(key)) return;

    playedAutomaticallyRef.current.add(key);

    const timer = window.setTimeout(() => {
      audioRef.current?.play().catch(() => setAudioBlocked(true));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [arrivedIndex, language, selectedAudioUrl, selectedIndex, selectedKey]);

  const locationLabel =
    locationState === "active"
      ? copy.gpsActive
      : locationState === "denied"
      ? copy.gpsDenied
      : locationState === "unsupported"
      ? copy.gpsUnsupported
      : copy.gpsWaiting;

  if (!cleanStops.length) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-black">Ameland Audiotours</h1>
          <p className="mt-3 text-slate-300">Route klaar</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-5">
        <header className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-3 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                {copy.brand}
              </p>
              <h1 className="mt-1 truncate text-lg font-black tracking-tight text-white sm:text-xl">
                {selectedIndex + 1}. {selectedTitle}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-black",
                  locationState === "active"
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                    : locationState === "denied" || locationState === "unsupported"
                    ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                    : "border-white/10 bg-white/10 text-slate-200"
                )}
              >
                {locationLabel}
              </span>
              <LanguageSwitch language={language} setLanguage={setLanguage} />
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur">
          <div className="h-[43vh] min-h-[330px] max-h-[520px]">
            <PlayerMap
              stops={cleanStops}
              language={language}
              location={location}
              selectedIndex={selectedIndex}
              arrivedIndex={arrivedIndex}
              reachedKeys={reachedKeys}
              onSelect={goToStop}
            />
          </div>

          <div className="border-t border-white/10 bg-slate-950/94 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
              {selectedIsArrived ? copy.arrived : copy.currentStory}
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
              {selectedIndex + 1}. {selectedTitle}
            </h2>

            {selectedDescription ? (
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {selectedDescription}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard
                label={copy.distance}
                value={formatDistance(selectedDistance)}
                helper={direction ? direction.label : copy.walkToStop}
              />
              <MetricCard
                label={copy.progress}
                value={progress}
                helper={selectedIsReached ? copy.completed : copy.selected}
              />
            </div>

            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-3">
              {selectedAudioUrl ? (
                <>
                  <audio
                    ref={audioRef}
                    src={selectedAudioUrl}
                    controls
                    preload="metadata"
                    playsInline
                    onEnded={handleAudioEnded}
                    className="w-full"
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={playAudio}
                      className="rounded-full bg-emerald-300 px-3 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
                    >
                      {copy.playAudio}
                    </button>

                    <button
                      type="button"
                      onClick={openWalkingRoute}
                      disabled={!selectedStopCoordinates}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copy.openRoute}
                    </button>

                    <button
                      type="button"
                      onClick={() => goToStop(selectedIndex - 1)}
                      disabled={selectedIndex === 0}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copy.previous}
                    </button>

                    <button
                      type="button"
                      onClick={() => goToStop(selectedIndex + 1)}
                      disabled={selectedIndex >= cleanStops.length - 1}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copy.next}
                    </button>
                  </div>

                  {audioBlocked ? (
                    <p className="mt-3 rounded-2xl bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                      {copy.audioBlocked}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                    {copy.noAudio}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => goToStop(selectedIndex - 1)}
                      disabled={selectedIndex === 0}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copy.previous}
                    </button>

                    <button
                      type="button"
                      onClick={() => goToStop(selectedIndex + 1)}
                      disabled={selectedIndex >= cleanStops.length - 1}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copy.next}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-300">
              {copy.allStops}
            </h2>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
              {formatExpiry(expiresAt, language)}
            </span>
          </div>

          <div className="space-y-2">
            {cleanStops.map((stop, index) => {
              const key = stopKey(stop, index);
              const coordinates = coordinatesFor(stop);
              const distance = location && coordinates ? distanceMeters(location, coordinates) : null;
              const isSelected = selectedIndex === index;
              const isArrived = arrivedIndex === index;
              const isReached = reachedKeys.includes(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => goToStop(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[1.05rem] border p-3 text-left transition",
                    isSelected
                      ? "border-emerald-300/45 bg-emerald-300/12"
                      : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black",
                      isArrived
                        ? "bg-amber-300 text-slate-950"
                        : isReached
                        ? "bg-emerald-300 text-slate-950"
                        : isSelected
                        ? "bg-white text-slate-950"
                        : "bg-slate-800 text-white"
                    )}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-white">
                      {titleFor(stop, language) || `${copy.stops} ${index + 1}`}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {isArrived
                        ? copy.arrived
                        : distance !== null
                        ? `${formatDistance(distance)} ${copy.metersAway}`
                        : copy.walkToStop}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={requestLocation}
            className="mt-3 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            {copy.gpsRequest}
          </button>
        </section>
      </div>
    </main>
  );
}
