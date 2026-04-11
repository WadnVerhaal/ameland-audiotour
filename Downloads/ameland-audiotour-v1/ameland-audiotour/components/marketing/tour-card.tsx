import Link from 'next/link'
import Image from 'next/image'
import { Clock3, MapPin, Bike, Footprints } from 'lucide-react'
import { Tour } from '@/types/tour'
import { formatEuroFromCents } from '@/lib/utils/money'
import { AppLanguage, getTourSubtitle, getTourTitle, translations } from '@/lib/app-language'

function getTourImage(slug: string) {
  if (slug.includes('verborgen-verhalen')) return '/images/tour-dorp.jpg'
  if (slug.includes('fiets')) return '/images/tour-fietsen.jpg'
  return '/images/tour-duinen.jpg'
}

export function TourCard({
  tour,
  language,
}: {
  tour: Tour
  language: AppLanguage
}) {
  const t = translations[language]
  const modeLabel = tour.mode === 'bike' ? t.bikeTour : t.walkingTour
  const ModeIcon = tour.mode === 'bike' ? Bike : Footprints

  const title = getTourTitle(tour, language)
  const subtitle = getTourSubtitle(tour, language)

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="block overflow-hidden rounded-[1.75rem] border border-app bg-app-card shadow-card transition hover:-translate-y-0.5"
    >
      <div className="relative h-40 w-full">
        <Image
          src={getTourImage(tour.slug)}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full bg-app-soft px-2.5 py-1 text-[11px] font-semibold text-[#6a5c37]">
              {modeLabel}
            </div>

            <h2 className="mt-3 text-lg font-semibold leading-tight text-app-accent">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-1 text-sm text-app-muted">{subtitle}</p>
            ) : null}
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-app-accent shadow-card">
            {formatEuroFromCents(tour.price_cents)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-app-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-card">
            <Clock3 className="h-3.5 w-3.5" />
            {tour.duration_minutes} min
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-card">
            <MapPin className="h-3.5 w-3.5" />
            {tour.distance_km} km
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-card">
            <ModeIcon className="h-3.5 w-3.5" />
            {modeLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}