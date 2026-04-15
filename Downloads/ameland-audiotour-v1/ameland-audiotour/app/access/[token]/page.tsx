import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CheckCircle2,
  Headphones,
  Play,
  Clock3,
  MapPin,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { getTourByAccessToken } from '@/lib/data/access'
import { getTourTitle, getStopTitle, translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ token: string }>
}

function getTourImage(slug: string) {
  if (slug.includes('verborgen-verhalen')) return '/images/tour-dorp.jpg'
  if (slug.includes('fiets')) return '/images/tour-fietsen.jpg'
  return '/images/tour-duinen.jpg'
}

function ExpiredAccessCard({
  language,
}: {
  language: 'nl' | 'en' | 'de'
}) {
  const content = {
    nl: {
      badge: 'Toegang verlopen',
      title: 'Deze tourlink is verlopen',
      text:
        'Je toegang was 48 uur geldig na aankoop. Die periode is voorbij, waardoor deze link niet meer bruikbaar is.',
      subtext:
        'Geen zorgen — je kunt de tour opnieuw aanschaffen en direct weer verder op pad.',
      primary: 'Bekijk tours',
      secondary: 'Terug naar homepage',
      point1: '48 uur toegang vanaf aankoop',
      point2: 'Na afloop vervalt de persoonlijke link automatisch',
      point3: 'Na een nieuwe aankoop ontvang je direct weer een geldige link',
    },
    en: {
      badge: 'Access expired',
      title: 'This tour link has expired',
      text:
        'Your access was valid for 48 hours after purchase. That period has ended, so this link can no longer be used.',
      subtext:
        'No worries — you can purchase the tour again and continue right away.',
      primary: 'View tours',
      secondary: 'Back to homepage',
      point1: '48 hours of access after purchase',
      point2: 'Your personal link expires automatically afterwards',
      point3: 'A new purchase gives you a new working link immediately',
    },
    de: {
      badge: 'Zugang abgelaufen',
      title: 'Dieser Tour-Link ist abgelaufen',
      text:
        'Dein Zugang war nach dem Kauf 48 Stunden gültig. Dieser Zeitraum ist vorbei, daher kann dieser Link nicht mehr verwendet werden.',
      subtext:
        'Kein Problem — du kannst die Tour erneut kaufen und direkt weitermachen.',
      primary: 'Touren ansehen',
      secondary: 'Zur Startseite',
      point1: '48 Stunden Zugang ab Kauf',
      point2: 'Danach läuft dein persönlicher Link automatisch ab',
      point3: 'Nach einem neuen Kauf erhältst du sofort wieder einen gültigen Link',
    },
  } as const

  const t = content[language]

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative overflow-hidden px-6 pb-8 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(38,68,62,0.10),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(191,161,74,0.12),transparent_40%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4ead6] px-3 py-1 text-xs font-semibold text-[#7a5f1e]">
              <ShieldAlert className="h-4 w-4" />
              {t.badge}
            </div>

            <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7eb] text-[#a06a00] shadow-card">
              <RefreshCw className="h-8 w-8" />
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-app-accent">
              {t.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-app-muted">
              {t.text}
            </p>

            <p className="mt-3 text-sm leading-7 text-app-muted">
              {t.subtext}
            </p>

            <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-card">
              <div className="space-y-4 text-sm text-app-muted">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                  <span>{t.point1}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                  <span>{t.point2}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                  <span>{t.point3}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/tours"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
              >
                {t.primary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-app bg-white px-4 py-4 text-sm font-semibold text-app-accent shadow-card transition hover:bg-app-soft"
              >
                {t.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default async function AccessPage({ params }: Props) {
  const { token } = await params
  const data = await getTourByAccessToken(token)
  const language = await getServerLanguage()

  if (data.status === 'expired') {
    return <ExpiredAccessCard language={language} />
  }

  if (data.status === 'invalid') {
    notFound()
  }

  const t = translations[language]
  const tourTitle = getTourTitle(data.tour, language)

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={getTourImage(data.tour.slug)}
            alt={tourTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(247,243,234,0.16)_55%,rgba(247,243,234,0.95)_100%)]" />
        </div>

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            {t.accessActive}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-app-accent">{tourTitle}</h1>

          <p className="mt-4 text-sm leading-8 text-app-muted">
            {t.accessText}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white p-4 text-center shadow-card">
              <div className="flex items-center justify-center gap-2 text-app-accent">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm font-semibold">{data.tour.duration_minutes} min</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center shadow-card">
              <div className="flex items-center justify-center gap-2 text-app-accent">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-semibold">{data.tour.distance_km} km</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center shadow-card">
              <div className="flex items-center justify-center gap-2 text-app-accent">
                <Headphones className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {data.stops.length} {t.stopsLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <div className="space-y-4 text-sm text-app-muted">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.successBenefit1}</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.successBenefit2}</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.successBenefit3}</span>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <Link
          href={`/player/${token}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
        >
          <Play className="mr-2 h-4 w-4" />
          {t.startMyTour}
        </Link>
      </div>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <h2 className="text-lg font-semibold text-app-accent">{t.routePreview}</h2>

        <div className="mt-4 space-y-3">
          {data.stops.slice(0, 3).map((stop, index) => (
            <div key={stop.id} className="rounded-2xl bg-white p-4 shadow-card">
              <span className="font-semibold text-app-accent">
                {index + 1}. {getStopTitle(stop, language) ?? stop.title}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}