'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { TourStop } from '@/types/tour'

type Position = {
  lat: number
  lng: number
  accuracy?: number
}

type RoutePoint = [number, number]

type Props = {
  position: Position | null
  stop: TourStop | null
  stopTitle: string
  routeLine: RoutePoint[]
  connectorLine: RoutePoint[]
  userLabel: string
  nextStopLabel: string
}

function createFallbackStyle() {
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
      },
    ],
  } as const
}

function getMapStyle() {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY

  if (!key) {
    return createFallbackStyle()
  }

  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`
}

function emptyFeatureCollection() {
  return {
    type: 'FeatureCollection',
    features: [],
  } as any
}

function lineFeatureCollection(points: RoutePoint[]) {
  if (points.length < 2) return emptyFeatureCollection()

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: points.map(([lat, lng]) => [lng, lat]),
        },
      },
    ],
  } as any
}

function createUserMarkerElement(label: string) {
  const wrapper = document.createElement('div')
  wrapper.title = label
  wrapper.innerHTML = `
    <div style="
      width:20px;
      height:20px;
      border-radius:9999px;
      background:#0f4b58;
      border:3px solid #ffffff;
      box-shadow:0 0 0 6px rgba(15,75,88,.16), 0 14px 34px rgba(15,75,88,.16);
    "></div>
  `
  return wrapper
}

function createStopMarkerElement(label: string) {
  const wrapper = document.createElement('div')
  wrapper.title = label
  wrapper.innerHTML = `
    <div style="
      width:22px;
      height:22px;
      border-radius:9999px;
      background:#ef7f63;
      border:3px solid #ffffff;
      box-shadow:0 0 0 6px rgba(239,127,99,.16), 0 14px 34px rgba(239,127,99,.16);
    "></div>
  `
  return wrapper
}

export function PremiumTourMap({
  position,
  stop,
  stopTitle,
  routeLine,
  connectorLine,
  userLabel,
  nextStopLabel,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const stopMarkerRef = useRef<maplibregl.Marker | null>(null)
  const hasInitialFitRef = useRef(false)
  const lastStopKeyRef = useRef<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const mapStyle = useMemo(() => getMapStyle(), [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle as any,
      center: [5.7701, 53.4396],
      zoom: 15.8,
      pitch: 0,
      bearing: 0,
      antialias: true,
      attributionControl: false,
    })

    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      map.addSource('tour-route', {
        type: 'geojson',
        data: emptyFeatureCollection(),
      })

      map.addLayer({
        id: 'tour-route-line',
        type: 'line',
        source: 'tour-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#12879a',
          'line-width': 5,
          'line-opacity': 0.95,
        },
      })

      map.addSource('tour-route-connector', {
        type: 'geojson',
        data: emptyFeatureCollection(),
      })

      map.addLayer({
        id: 'tour-route-connector-line',
        type: 'line',
        source: 'tour-route-connector',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#ef7f63',
          'line-width': 4,
          'line-opacity': 0.9,
          'line-dasharray': [2, 2],
        },
      })

      setIsReady(true)
    })

    return () => {
      userMarkerRef.current?.remove()
      stopMarkerRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [mapStyle])

  useEffect(() => {
    if (!isReady || !mapRef.current) return

    const map = mapRef.current
    const routeSource = map.getSource('tour-route') as GeoJSONSource | undefined
    const connectorSource = map.getSource('tour-route-connector') as GeoJSONSource | undefined

    routeSource?.setData(lineFeatureCollection(routeLine))
    connectorSource?.setData(lineFeatureCollection(connectorLine))
  }, [isReady, routeLine, connectorLine])

  useEffect(() => {
    if (!isReady || !mapRef.current) return

    if (position) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new maplibregl.Marker({
          element: createUserMarkerElement(userLabel),
          anchor: 'center',
        }).addTo(mapRef.current)
      }

      userMarkerRef.current.setLngLat([position.lng, position.lat])
    } else {
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
    }

    if (stop?.lat && stop?.lng) {
      if (!stopMarkerRef.current) {
        stopMarkerRef.current = new maplibregl.Marker({
          element: createStopMarkerElement(`${nextStopLabel}: ${stopTitle}`),
          anchor: 'center',
        }).addTo(mapRef.current)
      }

      stopMarkerRef.current.setLngLat([Number(stop.lng), Number(stop.lat)])
    } else {
      stopMarkerRef.current?.remove()
      stopMarkerRef.current = null
    }
  }, [isReady, position, stop, stopTitle, userLabel, nextStopLabel])

  useEffect(() => {
    if (!isReady || !mapRef.current) return

    const map = mapRef.current
    const stopKey =
      stop?.lat && stop?.lng ? `${stop.id ?? 'stop'}-${stop.lat}-${stop.lng}` : null

    if (position && stop?.lat && stop?.lng) {
      const shouldFit =
        !hasInitialFitRef.current || lastStopKeyRef.current !== stopKey

      if (shouldFit) {
        const bounds = new maplibregl.LngLatBounds(
          [position.lng, position.lat],
          [position.lng, position.lat]
        )

        bounds.extend([Number(stop.lng), Number(stop.lat)])

        map.fitBounds(bounds, {
          padding: { top: 40, right: 40, bottom: 40, left: 40 },
          duration: 900,
          maxZoom: 16.8,
        })

        hasInitialFitRef.current = true
        lastStopKeyRef.current = stopKey
      }

      return
    }

    if (position && !hasInitialFitRef.current) {
      map.jumpTo({
        center: [position.lng, position.lat],
        zoom: 16.2,
      })
      hasInitialFitRef.current = true
      return
    }

    if (stop?.lat && stop?.lng && !hasInitialFitRef.current) {
      map.jumpTo({
        center: [Number(stop.lng), Number(stop.lat)],
        zoom: 16.2,
      })
      hasInitialFitRef.current = true
    }
  }, [isReady, position, stop])

  return <div ref={containerRef} className="h-[340px] w-full" />
}