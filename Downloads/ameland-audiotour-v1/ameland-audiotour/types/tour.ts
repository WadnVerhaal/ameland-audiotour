export type Tour = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  language: string;
  duration_minutes: number;
  distance_km: number;
  mode: string;
  price_cents: number;
  hero_image_url: string | null;
  start_lat: number | null;
  start_lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TourStop = {
  id: string;
  tour_id: string;
  order_index: number;
  title: string;
  short_description: string | null;
  audio_url: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  trigger_radius_meters: number;
  estimated_duration_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TourWithStops = Tour & {
  stops: TourStop[];
};
