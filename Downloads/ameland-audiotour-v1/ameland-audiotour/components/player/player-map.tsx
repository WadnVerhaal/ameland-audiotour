"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import type { PlayerLanguage, PlayerStop } from "./tour-player";

const AUTO_PLAY_RADIUS_M = 10;
const DEFAULT_CENTER: [number, number] = [53.4394, 5.6399];
const DEFAULT_ZOOM = 18.6;
const MAX_ZOOM = 19;
const MIN_ZOOM = 15;

type GeoPoint = {
  lat: number;
  lng: number;
  accuracy: number;
  at: number;
};

type Props = {
  stops: PlayerStop[];
  language: PlayerLanguage;
  location: GeoPoint | null;
  selectedIndex: number;
  arrivedIndex: number | null;
  reachedKeys: string[];
  onSelect: (index: number) => void;
};

const COPY: Record<
  PlayerLanguage,
  {
    walkingRoute: string;
    directRoute: string;
    myLocation: string;
    centerRoute: string;
    googleMaps: string;
    gpsNeeded: string;
    arrived: string;
    selected: string;
    completed: string;
  }
> = {
  nl: {
    walkingRoute: "Wandelroute",
    directRoute: "Richting",
    myLocation: "Mijn locatie",
    centerRoute: "Route",
    googleMaps: "Maps",
    gpsNeeded: "GPS…",
    arrived: "Aangekomen",
    selected: "Geselecteerd",
    completed: "Beluisterd",
  },
  en: {
    walkingRoute: "Walking route",
    directRoute: "Direction",
    myLocation: "My location",
    centerRoute: "Route",
    googleMaps: "Maps",
    gpsNeeded: "GPS…",
    arrived: "Arrived",
    selected: "Selected",
    completed: "Played",
  },
  de: {
    walkingRoute: "Fußweg",
    directRoute: "Richtung",
    myLocation: "Mein Standort",
    centerRoute: "Route",
    googleMaps: "Maps",
    gpsNeeded: "GPS…",
    arrived: "Angekommen",
    selected: "Ausgewählt",
    completed: "Gehört",
  },
};

function stringValue(source: PlayerStop | null, keys: string[]) {
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

function titleFor(source: PlayerStop | null, lang: PlayerLanguage) {
  if (lang === "nl") {
    return stringValue(source, ["title_nl", "title", "title_en", "title_de"]);
  }

  if (lang === "en") {
    return stringValue(source, ["title_en", "title_nl", "title", "title_de"]);
  }

  return stringValue(source, ["title_de", "title_nl", "title", "title_en"]);
}

function coordinatesFor(stop: PlayerStop | null) {
  if (!stop) return null;

  const lat = numberValue(stop, ["latitude", "lat"]);
  const lng = numberValue(stop, ["longitude", "lng"]);

  if (lat === null || lng === null) return null;

  return [lat, lng] as [number, number];
}

function stopKey(stop: PlayerStop | null, index: number) {
  return String(stop?.id ?? stop?.order_index ?? index);
}

function distanceMeters(a: [number, number], b: [number, number]) {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function stopIcon(number: number, state: "selected" | "arrived" | "reached") {
  return L.divIcon({
    className: "aat-stop-icon-wrap",
    html: `<div class="aat-stop-badge aat-stop-${state}">${number}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function userIcon() {
  return L.divIcon({
    className: "aat-user-icon-wrap",
    html: `<div class="aat-user-dot"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function createGoogleMapsUrl({
  destination,
  location,
}: {
  destination: [number, number];
  location: GeoPoint | null;
}) {
  const params = new URLSearchParams();

  params.set("api", "1");

  if (location) {
    params.set("origin", `${location.lat},${location.lng}`);
  }

  params.set("destination", `${destination[0]},${destination[1]}`);
  params.set("travelmode", "walking");

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function InteractionTracker({ onInteract }: { onInteract: () => void }) {
  useMapEvents({
    dragstart: onInteract,
    zoomstart: onInteract,
  });

  return null;
}

function MapControls({
  language,
  location,
  targetCoord,
  routeLine,
  googleMapsUrl,
}: {
  language: PlayerLanguage;
  location: GeoPoint | null;
  targetCoord: [number, number] | null;
  routeLine: [number, number][];
  googleMapsUrl: string | null;
}) {
  const map = useMap();
  const copy = COPY[language];

  function centerRoute() {
    const points: [number, number][] = [];

    if (routeLine.length > 1) {
      points.push(...routeLine);
    } else {
      if (location) points.push([location.lat, location.lng]);
      if (targetCoord) points.push(targetCoord);
    }

    if (!points.length) return;

    if (points.length === 1) {
      map.flyTo(points[0], 19, { animate: true, duration: 0.4 });
      return;
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [32, 32],
      maxZoom: 18.8,
      animate: true,
      duration: 0.4,
    });
  }

  function centerMe() {
    if (!location) return;

    map.flyTo([location.lat, location.lng], 19, {
      animate: true,
      duration: 0.4,
    });
  }

  return (
    <div className="absolute bottom-3 right-3 z-[800] flex max-w-[46%] flex-col gap-2">
      <button
        type="button"
        onClick={centerMe}
        disabled={!location}
        className="rounded-full border border-white/15 bg-slate-950/88 px-3 py-2 text-xs font-black text-white shadow-2xl backdrop-blur transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {location ? copy.myLocation : copy.gpsNeeded}
      </button>

      <button
        type="button"
        onClick={centerRoute}
        disabled={!targetCoord}
        className="rounded-full border border-white/15 bg-slate-950/88 px-3 py-2 text-xs font-black text-white shadow-2xl backdrop-blur transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {copy.centerRoute}
      </button>

      {googleMapsUrl ? (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-300 px-3 py-2 text-center text-xs font-black text-slate-950 shadow-2xl transition hover:bg-emerald-200"
        >
          {copy.googleMaps}
        </a>
      ) : null}
    </div>
  );
}

function OneTimeInitialFit({
  location,
  targetCoord,
  routeLine,
  userTouchedMap,
  selectedIndex,
}: {
  location: GeoPoint | null;
  targetCoord: [number, number] | null;
  routeLine: [number, number][];
  userTouchedMap: boolean;
  selectedIndex: number;
}) {
  const map = useMap();
  const fittedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!targetCoord || userTouchedMap) return;

    const key = location
      ? `stop-${selectedIndex}-with-location`
      : `stop-${selectedIndex}-target-only`;

    if (fittedKey.current === key) return;
    fittedKey.current = key;

    const points: [number, number][] = [];

    if (routeLine.length > 1) {
      points.push(...routeLine);
    } else {
      if (location) points.push([location.lat, location.lng]);
      points.push(targetCoord);
    }

    window.setTimeout(() => {
      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), {
          padding: [34, 34],
          maxZoom: 18.8,
          animate: true,
          duration: 0.35,
        });
      } else if (points.length === 1) {
        map.setView(points[0], DEFAULT_ZOOM, { animate: true });
      }
    }, 220);
  }, [map, location, targetCoord, routeLine, userTouchedMap, selectedIndex]);

  return null;
}

export function PlayerMap({
  stops,
  language,
  location,
  selectedIndex,
  arrivedIndex,
  reachedKeys,
}: Props) {
  const copy = COPY[language];
  const selectedStop = stops[selectedIndex] || stops[0] || null;

  const targetCoord = useMemo(
    () => coordinatesFor(selectedStop),
    [selectedStop]
  );

  const initialCenterRef = useRef<[number, number]>(
    location ? [location.lat, location.lng] : targetCoord ?? DEFAULT_CENTER
  );

  const [userTouchedMap, setUserTouchedMap] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeStatus, setRouteStatus] = useState<
    "idle" | "loading" | "ready" | "fallback"
  >("idle");

  useEffect(() => {
    setUserTouchedMap(false);
  }, [selectedIndex]);

  const lastRouteRequestRef = useRef<{
    selectedIndex: number;
    from: [number, number] | null;
    to: [number, number] | null;
  } | null>(null);

  const fallbackRoute = useMemo<[number, number][]>(() => {
    if (!targetCoord) return [];
    if (!location) return [targetCoord];
    return [[location.lat, location.lng], targetCoord];
  }, [location, targetCoord]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!targetCoord) {
        setRouteCoords([]);
        setRouteStatus("idle");
        return;
      }

      if (!location) {
        setRouteCoords([targetCoord]);
        setRouteStatus("fallback");
        return;
      }

      const from: [number, number] = [location.lat, location.lng];
      const previous = lastRouteRequestRef.current;

      const sameStop = previous?.selectedIndex === selectedIndex;
      const sameTarget =
        previous?.to && distanceMeters(previous.to, targetCoord) < 3;

      const movedSinceLastRoute = previous?.from
        ? distanceMeters(previous.from, from)
        : Number.POSITIVE_INFINITY;

      if (sameStop && sameTarget && movedSinceLastRoute < 35 && routeCoords.length > 1) {
        return;
      }

      lastRouteRequestRef.current = {
        selectedIndex,
        from,
        to: targetCoord,
      };

      setRouteStatus("loading");

      const fromLngLat = `${location.lng},${location.lat}`;
      const toLngLat = `${targetCoord[1]},${targetCoord[0]}`;

      const walkingUrls = [
        `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${fromLngLat};${toLngLat}?overview=full&geometries=geojson&steps=true`,
        `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${fromLngLat};${toLngLat}?overview=full&geometries=geojson&steps=true`,
      ];

      try {
        let nextRoute: [number, number][] = [];

        for (const url of walkingUrls) {
          try {
            const response = await fetch(url, { cache: "no-store" });

            if (!response.ok) continue;

            const data = await response.json();
            const coordinates = data?.routes?.[0]?.geometry?.coordinates;

            if (!Array.isArray(coordinates) || coordinates.length < 2) continue;

            nextRoute = coordinates
              .map((coord: unknown) => {
                if (!Array.isArray(coord) || coord.length < 2) return null;

                const lng = Number(coord[0]);
                const lat = Number(coord[1]);

                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

                return [lat, lng] as [number, number];
              })
              .filter(Boolean) as [number, number][];

            if (nextRoute.length > 1) break;
          } catch {
            continue;
          }
        }

        if (!nextRoute.length) {
          throw new Error("No walking route available");
        }

        if (!cancelled) {
          setRouteCoords(nextRoute);
          setRouteStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setRouteCoords(fallbackRoute);
          setRouteStatus("fallback");
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [location, targetCoord, selectedIndex, fallbackRoute, routeCoords.length]);

  const selectedKey = stopKey(selectedStop, selectedIndex);
  const isArrived = selectedIndex === arrivedIndex;
  const isReached = reachedKeys.includes(selectedKey);
  const selectedState = isArrived ? "arrived" : isReached ? "reached" : "selected";
  const selectedTitle =
    titleFor(selectedStop, language) || `${copy.walkingRoute} ${selectedIndex + 1}`;

  const routeLine = routeCoords.length ? routeCoords : fallbackRoute;

  const googleMapsUrl = targetCoord
    ? createGoogleMapsUrl({ destination: targetCoord, location })
    : null;

  return (
    <div className="aat-clean-map relative h-full w-full overflow-hidden bg-slate-950">
      <MapContainer
        center={initialCenterRef.current}
        zoom={DEFAULT_ZOOM}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={70}
        zoomControl={false}
        className="h-full w-full"
        preferCanvas={true}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        inertia={true}
        inertiaDeceleration={2800}
      >
        <ZoomControl position="bottomleft" />

        <InteractionTracker onInteract={() => setUserTouchedMap(true)} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
          maxZoom={MAX_ZOOM}
          maxNativeZoom={MAX_ZOOM}
        />

        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
          opacity={0.9}
          maxZoom={MAX_ZOOM}
          maxNativeZoom={MAX_ZOOM}
        />

        <OneTimeInitialFit
          location={location}
          targetCoord={targetCoord}
          routeLine={routeLine}
          userTouchedMap={userTouchedMap}
          selectedIndex={selectedIndex}
        />

        {routeLine.length > 1 ? (
          <>
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: "#020617",
                weight: 10,
                opacity: 0.52,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: routeStatus === "fallback" ? "#fbbf24" : "#5eead4",
                weight: 5,
                opacity: 0.98,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        ) : null}

        {targetCoord && selectedStop ? (
          <>
            <Circle
              center={targetCoord}
              radius={AUTO_PLAY_RADIUS_M}
              pathOptions={{
                color: "#5eead4",
                weight: 2,
                opacity: 0.95,
                fillColor: "#5eead4",
                fillOpacity: 0.16,
              }}
            />

            <Marker
              position={targetCoord}
              icon={stopIcon(selectedIndex + 1, selectedState)}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                {selectedTitle}
              </Tooltip>
            </Marker>
          </>
        ) : null}

        {location ? (
          <>
            <Circle
              center={[location.lat, location.lng]}
              radius={Math.max(10, location.accuracy || 18)}
              pathOptions={{
                color: "#60a5fa",
                weight: 1.5,
                opacity: 0.78,
                fillColor: "#60a5fa",
                fillOpacity: 0.16,
              }}
            />

            <Marker position={[location.lat, location.lng]} icon={userIcon()}>
              <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                {COPY[language].myLocation}
              </Tooltip>
            </Marker>
          </>
        ) : null}

        <MapControls
          language={language}
          location={location}
          targetCoord={targetCoord}
          routeLine={routeLine}
          googleMapsUrl={googleMapsUrl}
        />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[750] max-w-[58%] rounded-2xl border border-white/15 bg-slate-950/82 px-3 py-2 text-white shadow-2xl backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
          {routeStatus === "fallback" ? copy.directRoute : copy.walkingRoute}
        </p>
        <p className="mt-1 truncate text-sm font-black">
          {selectedIndex + 1}. {selectedTitle}
        </p>
      </div>
    </div>
  );
}
