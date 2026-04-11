import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, ArrowLeft, Clock3, MapPin, Headphones, Footprints, Bike } from 'lucide-react'
import { getTourBySlug } from '@/lib/data/tours'
import { formatEuroFromCents } from '@/lib/utils/money'
import {
  translations,
  getStopTitle,
  getTourDescription,
  getTourTitle,
} from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ slug: string }>
}

function getTourImage(slug: string) {
  if (slug.includes('verborgen-verhalen')) return '/images/tour-dorp.jpg'
  if (slug.includes('fiets')) return '/images/tour-fietsen.jpg'
  return '/images/tour-duinen.jpg'
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) notFound()

  const language = await getServerLanguage()
  const t = translations[language]

  const modeLabel = tour.mode === 'bike' ? t.bikeTour : t.walkingTour
  const ModeIcon = tour.mode === 'bike' ? Bike : Footprints
  const tourTitle = getTourTitle(tour, language)
  const tourDescription = getTourDescription(tour, language)

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={getTourImage(tour.slug)}
            alt={tourTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(247,243,234,0.16)_55%,rgba(247,243,234,0.95)_100%)]" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
              {modeLabel}
            </span>

            <Link
              href="/tours"
              className="inline-flex items-center text-sm font-medium text-app-muted transition hover:text-app-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToTours}
            </Link>
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            {tourTitle}
          </h1>

          <p className="mt-4 text-sm leading-8 text-app-muted">
            {tourDescription}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm font-semibold">{tour.duration_minutes} min</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-semibold">{tour.distance_km} km</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <Headphones className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {tour.stops.length} {t.stopsLabel}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <ModeIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">{formatEuroFromCents(tour.price_cents)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          {t.whatToExpect}
        </p>

        <div className="mt-4 space-y-4 text-sm text-app-muted">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.discoverAtYourOwnPace}</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.listenAtSpecialPlaces}</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.directStartAfterPurchase}</span>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <h2 className="text-lg font-semibold text-app-accent">{t.routePreview}</h2>

        <div className="mt-4 space-y-3">
          {tour.stops.slice(0, 3).map((stop, index) => (
            <div key={stop.id} className="rounded-2xl bg-white p-4 shadow-card">
              <span className="font-semibold text-app-accent">
                {index + 1}. {getStopTitle(stop, language) ?? stop.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5">
        <Link
          href={`/checkout/${tour.slug}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
        >
          {t.payAndReceiveLink}
        </Link>
      </div>
    </main>
  )
}