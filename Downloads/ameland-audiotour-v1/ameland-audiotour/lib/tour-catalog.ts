export const upcomingTours = [
  {
    title: 'Historische Dorpswandeling',
    subtitle: 'Verhalen over dorp, geschiedenis en het oude Ameland.',
    duration: '45–60 min',
    distance: '± 2 km',
    label: 'Binnenkort',
  },
  {
    title: 'Fietsroute door Duin & Dorp',
    subtitle: 'Een complete eilandbeleving tussen landschap, dorp en zee.',
    duration: '60–90 min',
    distance: '± 12 km',
    label: 'Binnenkort',
  },
]

const fallbackTour = {
  id: '057516f3-1f33-447d-b631-9151c64ed4af',
  slug: 'Kennismaken-hollum',
  title: 'Maak kennis met Hollum',
  title_en: 'Discover Hollum',
  title_de: 'Entdecke Hollum',
  description: 'Een ontspannen audiotour langs de mooiste verhalen van Hollum, van het oude dorp tot de vuurtoren.',
  description_en: 'A relaxed audio tour through the stories of Hollum, from the old village to the lighthouse.',
  description_de: 'Eine entspannte Audiotour durch die Geschichten von Hollum, vom alten Dorf bis zum Leuchtturm.',
  hero_image_url: '/images/tour-dorp.jpg',
  duration_minutes: 90,
  distance_km: 6.5,
  price_cents: 999,
  is_active: true,
}

export function asText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

export function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

export function getTourSlug(tour: Record<string, any>) {
  return asText(tour.slug) || asText(tour.id)
}

export function isPublishedTour(tour: Record<string, any>) {
  if ('is_active' in tour && tour.is_active === false) return false
  if ('published' in tour && tour.published === false) return false
  if ('status' in tour && typeof tour.status === 'string') {
    const status = tour.status.toLowerCase()
    if (['draft', 'concept', 'inactive', 'coming_soon', 'binnenkort'].includes(status)) return false
  }
  return true
}

export async function getAvailableTours() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const apiKey = serverKey || publicKey

  if (!supabaseUrl || !apiKey) return [fallbackTour]

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/tours?select=*&is_active=eq.true&order=created_at.asc`

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 30 },
    })

    if (!res.ok) return [fallbackTour]
    const data = await res.json()
    if (!Array.isArray(data)) return [fallbackTour]

    const publishedTours = data
      .filter((tour) => tour && typeof tour === 'object')
      .filter((tour) => getTourSlug(tour).length > 0)
      .filter(isPublishedTour)

    return publishedTours.length ? publishedTours : [fallbackTour]
  } catch {
    return [fallbackTour]
  }
}
