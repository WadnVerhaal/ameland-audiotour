export type SupportedAudioLanguage = 'nl' | 'en' | 'de'

export type StopLike = Record<string, any>

export type NormalizedStopAudio = {
  id: string
  order: number
  title: string
  lat: number | null
  lng: number | null
  radiusMeters: number
  audioUrl: string
  fallbackText: string
  original: StopLike
}

function present(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function firstString(...values: unknown[]): string {
  const value = values.find(present)
  return value === undefined || value === null ? '' : String(value).trim()
}

function numberOrNull(...values: unknown[]): number | null {
  for (const value of values) {
    if (!present(value)) continue
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

export function normalizeAudioLanguage(language?: string | null): SupportedAudioLanguage {
  const raw = String(language || 'nl').toLowerCase()

  if (raw.startsWith('en')) return 'en'
  if (raw.startsWith('de')) return 'de'

  return 'nl'
}

function camelLang(language: SupportedAudioLanguage) {
  if (language === 'nl') return 'Nl'
  if (language === 'en') return 'En'
  return 'De'
}

export function getBrowserAudioLanguage(): SupportedAudioLanguage {
  if (typeof window === 'undefined') return 'nl'

  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('lang') || params.get('language')

  if (fromUrl) return normalizeAudioLanguage(fromUrl)

  const fromStorage =
    window.localStorage.getItem('ameland-language') ||
    window.localStorage.getItem('app-language') ||
    window.localStorage.getItem('language') ||
    window.localStorage.getItem('lang')

  return normalizeAudioLanguage(fromStorage || 'nl')
}

export function getStopTitle(stop: StopLike, language: SupportedAudioLanguage): string {
  const langCamel = camelLang(language)

  return firstString(
    stop[`title_${language}`],
    stop[`title${langCamel}`],
    stop.title,
    stop.name,
    stop.label,
    stop.stop_title,
    'Audiostop'
  )
}

export function getStopAudioUrl(stop: StopLike, language: SupportedAudioLanguage): string {
  const langCamel = camelLang(language)

  return firstString(
    stop[`audio_url_${language}`],
    stop[`audioUrl_${language}`],
    stop[`audioUrl${langCamel}`],
    stop[`audio_${language}`],
    stop[`audio${langCamel}`],
    stop.audio_url,
    stop.audioUrl,
    stop.audio,
    stop.sound_url,
    stop.soundUrl
  )
}

export function getStopFallbackText(stop: StopLike, language: SupportedAudioLanguage): string {
  const langCamel = camelLang(language)

  const title = getStopTitle(stop, language)

  const body = firstString(
    stop[`audio_text_${language}`],
    stop[`audioText_${language}`],
    stop[`audioText${langCamel}`],
    stop[`story_${language}`],
    stop[`story${langCamel}`],
    stop[`content_${language}`],
    stop[`content${langCamel}`],
    stop[`description_${language}`],
    stop[`description${langCamel}`],
    stop.audio_text,
    stop.audioText,
    stop.story,
    stop.content,
    stop.description,
    stop.text,
    stop.intro
  )

  if (body) return body

  return title
}

export function normalizeStopAudio(
  stop: StopLike,
  index: number,
  language: SupportedAudioLanguage,
  defaultRadiusMeters = 25
): NormalizedStopAudio {
  const id = firstString(stop.id, stop.stop_id, stop.slug, stop.uuid, `stop-${index + 1}`)
  const orderNumber = numberOrNull(
    stop.order_number,
    stop.order,
    stop.position,
    stop.sort_order,
    stop.sequence
  )

  const lat = numberOrNull(stop.latitude, stop.lat, stop.stop_latitude)
  const lng = numberOrNull(stop.longitude, stop.lng, stop.lon, stop.stop_longitude)

  const radius =
    numberOrNull(stop.trigger_radius_meters, stop.radius_meters, stop.radiusMeters, stop.audio_radius_meters) ||
    defaultRadiusMeters

  return {
    id,
    order: orderNumber ?? index + 1,
    title: getStopTitle(stop, language),
    lat,
    lng,
    radiusMeters: Math.max(5, Math.min(100, radius)),
    audioUrl: getStopAudioUrl(stop, language),
    fallbackText: getStopFallbackText(stop, language),
    original: stop,
  }
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const earthRadius = 6371000
  const toRad = (value: number) => (value * Math.PI) / 180

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}
