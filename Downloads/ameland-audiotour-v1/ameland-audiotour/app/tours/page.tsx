import { getAllTours } from '@/lib/data/tours'
import Link from 'next/link'
import { ArrowLeft, Check, Clock3, MapPinned } from 'lucide-react'
import {
  translations,
  getTourTitle,
  type AppLanguage,
} from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'
import type { Tour } from '@/types/tour'

function getAppCta(language: AppLanguage) {
  if (language === 'de') return 'Jetzt buchen'
  if (language === 'en') return 'Order now'
  return 'Nu bestellen'
}

function getUpcomingBadge(language: AppLanguage) {
  if (language === 'de') return 'Bald verfügbar'
  if (language === 'en') return 'Coming soon'
  return 'Binnenkort'
}

function getUpcomingButton(language: AppLanguage) {
  if (language === 'de') return 'Bald verfügbar'
  if (language === 'en') return 'Coming soon'
  return 'Binnenkort'
}

function getModeLabel(mode: string | null | undefined, language: AppLanguage) {
  const value = (mode ?? '').toLowerCase()

  if (value.includes('fiets') || value.includes('bike') || value.includes('cycle')) {
    return language === 'de'
      ? 'Fahrradtour'
      : language === 'en'
        ? 'Bike tour'
        : 'Fietstour'
  }

  return language === 'de'
    ? 'Wandeltour'
    : language === 'en'
      ? 'Walking tour'
      : 'Wandeltour'
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

function getTourPoints(tour: Tour, language: AppLanguage) {
  const slug = tour.slug?.toLowerCase() ?? ''

  if (slug.includes('hollum')) {
    if (language === 'de') {
      return [
        'Ein ruhiger Spaziergang entlang besonderer Orte',
        'Live-Karte und Audio genau am richtigen Ort',
        'Perfekt als erster Eindruck von Hollum',
      ]
    }

    if (language === 'en') {
      return [
        'A relaxed walk past special places',
        'Live map and audio at exactly the right location',
        'Perfect as a first introduction to Hollum',
      ]
    }

    return [
      'Een rustige wandeling langs bijzondere plekken',
      'Live kaart en audio precies op de juiste locatie',
      'Perfect als eerste kennismaking met Hollum',
    ]
  }

  if (slug.includes('histor')) {
    if (language === 'de') {
      return [
        'Geschichten über das Dorf und seine Geschichte',
        'Selbstständig und einfach zu folgen',
        'Ideal als erste Einführung',
      ]
    }

    if (language === 'en') {
      return [
        'Stories about the village and its history',
        'Easy to follow on your own',
        'Ideal as a first introduction',
      ]
    }

    return [
      'Verhalen over dorp en geschiedenis',
      'Zelfstandig en eenvoudig te volgen',
      'Ideaal als eerste kennismaking',
    ]
  }

  if (slug.includes('duin') || slug.includes('dorp') || slug.includes('fiets')) {
    if (language === 'de') {
      return [
        'Route durch Landschaft und Dorf',
        'An besonderen Orten zuhören',
        'Ein vollständiges Inselerlebnis',
      ]
    }

    if (language === 'en') {
      return [
        'Route through landscape and village',
        'Listen at special locations',
        'A complete island experience',
      ]
    }

    return [
      'Route door landschap en dorp',
      'Luisteren op bijzondere plekken',
      'Een complete eilandbeleving',
    ]
  }

  return []
}

function getDurationLabel(tour: Tour, language: AppLanguage) {
  const minutes = Number(tour.duration_minutes || 0)

  if (minutes <= 0) return '--'

  if (minutes >= 85 && minutes <= 95) {
    return language === 'de' ? '90 Min.' : '90 min'
  }

  if (minutes >= 55 && minutes <= 95) {
    return language === 'de' ? '60–90 Min.' : '60–90 min'
  }

  if (minutes >= 40 && minutes <= 65) {
    return language === 'de' ? '45–60 Min.' : '45–60 min'
  }

  return language === 'de' ? `${minutes} Min.` : `${minutes} min`
}

function TourRow({
  tour,
  language,
}: {
  tour: Tour
  language: AppLanguage
}) {
  const active = tour.is_active
  const title = getTourTitle(tour, language)
  const points = getTourPoints(tour, language)
  const duration = getDurationLabel(tour, language)
  const appCta = getAppCta(language)
  const upcomingLabel = getUpcomingBadge(language)
  const modeLabel = getModeLabel(tour.mode, language)

  return (
    <div
      className={`grid gap-5 px-5 py-5 md:px-6 ${
        active ? '' : 'bg-[#fbfdfd]'
      } md:grid-cols-[220px_1fr_auto] md:items-center`}
    >
      <div className="relative h-52 overflow-hidden rounded-[1.5rem]">
        {tour.hero_image_url ? (
          <img
            src={tour.hero_image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#e7f4f3]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,48,56,0.02)_0%,rgba(8,48,56,0.08)_46%,rgba(8,48,56,0.35)_100%)]" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? 'bg-white/92 text-[#355f65]' : 'bg-[#aeb8bb]/95 text-white'
            }`}
          >
            {active ? modeLabel : upcomingLabel}
          </span>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2
            className={`text-2xl font-semibold tracking-tight md:text-3xl ${
              active ? 'text-[#143a43]' : 'text-[#73858a]'
            }`}
          >
            {title}
          </h2>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              active
                ? 'bg-[#eef8f8] text-[#4c7177]'
                : 'bg-[#f2f6f6] text-[#87979b]'
            }`}
          >
            {duration}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {points.map((point) => (
            <div
              key={point}
              className={`flex items-start gap-3 text-sm ${
                active ? 'text-[#526f75]' : 'text-[#87979b]'
              }`}
            >
              <Check
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  active ? 'text-[#1694a3]' : 'text-[#bcc9cc]'
                }`}
              />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center md:justify-end">
        {active ? (
          <Link
            href={`/checkout/${tour.slug}`}
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-[#0f4b58] px-5 py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            {appCta}
          </Link>
        ) : (
          <span className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-[#dce8e9] bg-[#f8fbfb] px-5 py-3.5 font-semibold text-[#8a9a9e]">
            {getUpcomingButton(language)}
          </span>
        )}
      </div>
    </div>
  )
}

export default async function ToursPage() {
  const tours = await getAllTours()
  const language = await getServerLanguage()
  const t = translations[language]

  const activeTours = tours.filter((tour) => tour.is_active)
  const upcomingTours = tours.filter((tour) => !tour.is_active)
  const orderedTours = [...activeTours, ...upcomingTours]

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
          {getIntro(language)}
        </p>
      </section>

      <section className="mt-5 overflow-hidden rounded-[2.4rem] border border-[#dbecef] bg-white shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        {orderedTours.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#5b757b]">
            {t.noToursAvailable}
          </div>
        ) : (
          <div className="divide-y divide-[#e7f1f2]">
            {orderedTours.map((tour) => (
              <TourRow key={tour.id} tour={tour} language={language} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}