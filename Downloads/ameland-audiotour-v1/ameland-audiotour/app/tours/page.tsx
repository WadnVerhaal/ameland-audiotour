import Link from 'next/link'
import { ArrowLeft, Check, MapPinned } from 'lucide-react'
import { getActiveTours } from '@/lib/data/tours'
import { translations as appTranslations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type AppLanguage = 'nl' | 'en' | 'de'

type MarketingTour = {
  title: string
  badge: string
  duration: string
  points: string[]
  cta: string
  featured: boolean
  available: boolean
}

type ActiveTourRecord = {
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

const websiteTours: Record<AppLanguage, MarketingTour[]> = {
  nl: [
    {
      title: 'Historische Dorpswandeling',
      badge: 'Binnenkort',
      duration: '45–60 min',
      points: [
        'Verhalen over dorp en geschiedenis',
        'Zelfstandig en eenvoudig te volgen',
        'Ideaal als eerste kennismaking',
      ],
      cta: 'Binnenkort',
      featured: false,
      available: false,
    },
    {
      title: 'Maak kennis met Hollum',
      badge: 'Meest gekozen',
      duration: '90 min',
      points: [
        'Een rustige wandeling langs bijzondere plekken',
        'Live kaart en audio precies op de juiste locatie',
        'Perfect als eerste kennismaking met Hollum',
      ],
      cta: 'Bestel direct',
      featured: true,
      available: true,
    },
    {
      title: 'Fietsroute door Duin & Dorp',
      badge: 'Binnenkort',
      duration: '60–90 min',
      points: [
        'Route door landschap en dorp',
        'Luisteren op bijzondere plekken',
        'Een complete eilandbeleving',
      ],
      cta: 'Binnenkort',
      featured: false,
      available: false,
    },
  ],
  en: [
    {
      title: 'Historic Village Walk',
      badge: 'Coming soon',
      duration: '45–60 min',
      points: [
        'Stories about the village and its history',
        'Easy to follow on your own',
        'Ideal as a first introduction',
      ],
      cta: 'Coming soon',
      featured: false,
      available: false,
    },
    {
      title: 'Meet Hollum',
      badge: 'Most popular',
      duration: '90 min',
      points: [
        'A relaxed walk past special places',
        'Live map and audio at exactly the right location',
        'Perfect as a first introduction to Hollum',
      ],
      cta: 'Order now',
      featured: true,
      available: true,
    },
    {
      title: 'Cycling Route through Dunes & Village',
      badge: 'Coming soon',
      duration: '60–90 min',
      points: [
        'Route through landscape and village',
        'Listen at special locations',
        'A complete island experience',
      ],
      cta: 'Coming soon',
      featured: false,
      available: false,
    },
  ],
  de: [
    {
      title: 'Historischer Dorfrundgang',
      badge: 'Bald verfügbar',
      duration: '45–60 Min.',
      points: [
        'Geschichten über das Dorf und seine Geschichte',
        'Selbstständig und einfach zu folgen',
        'Ideal als erste Einführung',
      ],
      cta: 'Bald verfügbar',
      featured: false,
      available: false,
    },
    {
      title: 'Hollum kennenlernen',
      badge: 'Am beliebtesten',
      duration: '90 Min.',
      points: [
        'Ein ruhiger Spaziergang entlang besonderer Orte',
        'Live-Karte und Audio genau am richtigen Ort',
        'Perfekt als erster Eindruck von Hollum',
      ],
      cta: 'Jetzt buchen',
      featured: true,
      available: true,
    },
    {
      title: 'Fahrradroute durch Dünen & Dorf',
      badge: 'Bald verfügbar',
      duration: '60–90 Min.',
      points: [
        'Route durch Landschaft und Dorf',
        'An besonderen Orten zuhören',
        'Ein vollständiges Inselerlebnis',
      ],
      cta: 'Bald verfügbar',
      featured: false,
      available: false,
    },
  ],
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getDbTitleForLanguage(tour: ActiveTourRecord, language: AppLanguage) {
  if (language === 'en' && tour.title_en) return tour.title_en
  if (language === 'de' && tour.title_de) return tour.title_de
  return tour.title
}

function findMatchingActiveTour(
  marketingTour: MarketingTour,
  activeTours: ActiveTourRecord[],
  language: AppLanguage
) {
  const marketingTitle = normalize(marketingTour.title)

  const exact = activeTours.find(
    (tour) => normalize(getDbTitleForLanguage(tour, language)) === marketingTitle
  )
  if (exact) return exact

  if (marketingTitle.includes('hollum')) {
    const hollum = activeTours.find((tour) =>
      normalize(getDbTitleForLanguage(tour, language)).includes('hollum')
    )
    if (hollum) return hollum
  }

  return activeTours[0] ?? null
}

function getIntro(language: AppLanguage) {
  if (language === 'de') {
    return 'Wähle die Route, die zu deinem Tag auf Ameland passt. Bereits verfügbare Touren kannst du direkt starten. Die anderen siehst du hier schon als Vorschau.'
  }

  if (language === 'en') {
    return 'Choose the route that fits your day on Ameland. Tours that are already available can be started right away. The others are shown here as a preview.'
  }

  return 'Kies de route die past bij jouw dag op Ameland. Tours die al beschikbaar zijn kun je direct starten. De andere zie je hier alvast als voorproefje.'
}

function getWebsiteTourImage(tourTitle: string, language: AppLanguage) {
  const title = normalize(tourTitle)

  if (
    title.includes('maak kennis met hollum') ||
    title.includes('meet hollum') ||
    title.includes('hollum kennenlernen')
  ) {
    return '/images/tour-duinen.jpg'
  }

  if (
    title.includes('historische dorpswandeling') ||
    title.includes('historic village walk') ||
    title.includes('historischer dorfrundgang')
  ) {
    return '/images/tour-fietsen.jpg'
  }

  if (
    title.includes('fietsroute door duin dorp') ||
    title.includes('cycling route through dunes village') ||
    title.includes('fahrradroute durch dunen dorf')
  ) {
    return '/images/tour-dorp.jpg'
  }

  return '/images/tour-duinen.jpg'
}

function TourRow({
  tour,
  actionHref,
  isOrderable,
  buttonLabel,
  language,
}: {
  tour: MarketingTour
  actionHref?: string
  isOrderable: boolean
  buttonLabel: string
  language: AppLanguage
}) {
  const imageUrl = getWebsiteTourImage(tour.title, language)

  return (
    <div
      className={`grid gap-5 px-5 py-5 md:px-6 ${
        tour.available ? '' : 'bg-[#fbfdfd]'
      } md:grid-cols-[220px_1fr_auto] md:items-center`}
    >
      <div className="relative h-52 overflow-hidden rounded-[1.5rem]">
        <img src={imageUrl} alt={tour.title} className="h-full w-full object-cover" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,48,56,0.02)_0%,rgba(8,48,56,0.08)_46%,rgba(8,48,56,0.35)_100%)]" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              tour.available
                ? tour.featured
                  ? 'bg-[#ef7f63] text-white'
                  : 'bg-white/92 text-[#355f65]'
                : 'bg-[#aeb8bb]/95 text-white'
            }`}
          >
            {tour.badge}
          </span>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2
            className={`text-2xl font-semibold tracking-tight md:text-3xl ${
              tour.available ? 'text-[#143a43]' : 'text-[#73858a]'
            }`}
          >
            {tour.title}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              tour.available
                ? 'bg-[#eef8f8] text-[#4c7177]'
                : 'bg-[#f2f6f6] text-[#87979b]'
            }`}
          >
            {tour.duration}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {tour.points.map((point) => (
            <div
              key={point}
              className={`flex items-start gap-3 text-sm ${
                tour.available ? 'text-[#526f75]' : 'text-[#87979b]'
              }`}
            >
              <Check
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  tour.available ? 'text-[#1694a3]' : 'text-[#bcc9cc]'
                }`}
              />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center md:justify-end">
        {isOrderable && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-[#0f4b58] px-5 py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            {buttonLabel}
          </Link>
        ) : (
          <span className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-[#dce8e9] bg-[#f8fbfb] px-5 py-3.5 font-semibold text-[#8a9a9e]">
            {buttonLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export default async function ToursPage() {
  const activeTours = (await getActiveTours()) as ActiveTourRecord[]
  const language = await getServerLanguage()
  const safeLanguage: AppLanguage =
    language === 'en' || language === 'de' ? language : 'nl'
  const t = appTranslations[safeLanguage]

  const marketingTours = websiteTours[safeLanguage]
  const orderedTours = [
    ...marketingTours.filter((tour) => tour.available),
    ...marketingTours.filter((tour) => !tour.available),
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-5 md:px-6">
      <section className="rounded-[2rem] border border-[#dbecef] bg-white p-5 shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-[#5b757b] transition hover:text-[#0f4b58]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Link>

          <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#eef8f8] px-3 py-1 text-xs font-semibold text-[#4f8a8e]">
            <MapPinned className="h-3.5 w-3.5" />
            {t.availableRoutes}
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-[#143a43] md:text-4xl">
          {t.chooseTour}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5b757b] md:text-base">
          {getIntro(safeLanguage)}
        </p>
      </section>

      <section className="mt-5 overflow-hidden rounded-[2.4rem] border border-[#dbecef] bg-white shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        {orderedTours.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#5b757b]">{t.noToursAvailable}</div>
        ) : (
          <div className="divide-y divide-[#e7f1f2]">
            {orderedTours.map((marketingTour) => {
              const matchedActiveTour = marketingTour.available
                ? findMatchingActiveTour(marketingTour, activeTours, safeLanguage)
                : null

              return (
                <TourRow
                  key={`${marketingTour.title}-${marketingTour.duration}`}
                  tour={marketingTour}
                  isOrderable={Boolean(marketingTour.available && matchedActiveTour)}
                  actionHref={
                    marketingTour.available && matchedActiveTour
                      ? `/checkout/${matchedActiveTour.slug}`
                      : undefined
                  }
                  buttonLabel={marketingTour.cta}
                  language={safeLanguage}
                />
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}