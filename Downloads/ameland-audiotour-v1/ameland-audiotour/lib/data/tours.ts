import { createServerSupabase } from '@/lib/supabase/server'
import { Tour, TourStop, TourWithStops } from '@/types/tour'

export type MarketingTour = {
  slug: string
  image_url: string
  featured: boolean
  available: boolean
  sort_order: number
  title: string
  badge: string
  duration_label: string
  cta: string
  points: string[]
}

export async function getActiveTours(): Promise<Tour[]> {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Tour[]
}

export async function getMarketingTours(locale: 'nl' | 'en' | 'de'): Promise<MarketingTour[]> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('tour_marketing')
    .select(`
      slug,
      image_url,
      featured,
      available,
      sort_order,
      tour_marketing_translations!inner (
        title,
        badge,
        duration_label,
        cta,
        points,
        locale
      )
    `)
    .eq('tour_marketing_translations.locale', locale)
    .order('sort_order', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: any) => {
    const translation = Array.isArray(row.tour_marketing_translations)
      ? row.tour_marketing_translations[0]
      : row.tour_marketing_translations

    return {
      slug: row.slug,
      image_url: row.image_url,
      featured: row.featured,
      available: row.available,
      sort_order: row.sort_order,
      title: translation.title,
      badge: translation.badge,
      duration_label: translation.duration_label,
      cta: translation.cta,
      points: Array.isArray(translation.points) ? translation.points : [],
    }
  })
}

export async function getTourBySlug(slug: string): Promise<TourWithStops | null> {
  const supabase = createServerSupabase()
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .single()

  if (tourError || !tour) return null

  const { data: stops, error: stopsError } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', tour.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (stopsError) throw stopsError

  return {
    ...(tour as Tour),
    stops: (stops ?? []) as TourStop[],
  }
}