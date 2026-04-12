import { NextResponse } from 'next/server'
import { getTranslation, locales, type Locale } from '@/lib/i18n'

export async function GET() {
  const payload = Object.fromEntries(
    locales.map((locale) => {
      const translation = getTranslation(locale as Locale)

      return [
        locale,
        translation.tours.map((tour) => ({
          title: tour.title,
          badge: tour.badge,
          duration: tour.duration,
          image: tour.image,
          points: tour.points,
          cta: tour.cta,
          featured: tour.featured,
          available: tour.available,
        })),
      ]
    })
  )

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
