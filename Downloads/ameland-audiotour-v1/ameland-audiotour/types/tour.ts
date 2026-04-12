export type Tour = {
  id: string
  slug: string
  title: string
  title_en: string | null
  title_de: string | null
  subtitle: string | null
  subtitle_en: string | null
  subtitle_de: string | null
  description: string
  description_en: string | null
  description_de: string | null
  language: string
  duration_minutes: number
  distance_km: number
  mode: string
  price_cents: number
  hero_image_url: string | null
  start_lat: number | null
  start_lng: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TourStop = {
  id: string
  tour_id: string
  order_index: number
  title: string
  title_en: string | null
  title_de: string | null
  short_description: string | null
  short_description_en: string | null
  short_description_de: string | null
  audio_url: string | null
  audio_url_nl: string | null
  audio_url_en: string | null
  audio_url_de: string | null
  image_url: string | null
  lat: number | null
  lng: number | null
  trigger_radius_meters: number
  estimated_duration_seconds: number
  is_active: boolean
  created_at: string
  updated_at: string
}
export type TourWithStops = Tour & {
  stops: TourStop[]
}