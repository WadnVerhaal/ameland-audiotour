import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react'
import { getTourByAccessToken } from '@/lib/data/access'
import { TourPlayer } from '@/components/player/tour-player'
import { getServerLanguage } from '@/lib/app-language-server'

function ExpiredAccessCard({
  language,
}: {
  language: 'nl' | 'en' | 'de'
}) {
  const content = {
    nl: {
      badge: 'Toegang verlopen',
      title: 'Deze tour is niet meer beschikbaar via deze link',
      text:
        'Je persoonlijke toegang was 48 uur geldig na aankoop. Die periode is nu verstreken.',
      subtext:
        'Je kunt de tour opnieuw aanschaffen om direct weer toegang te krijgen.',
      primary: 'Nieuwe tour kopen',
      secondary: 'Terug naar homepage',
    },
    en: {
      badge: 'Access expired',
      title: 'This tour is no longer available through this link',
      text:
        'Your personal access was valid for 48 hours after purchase. That period has now ended.',
      subtext:
        'You can purchase the tour again to get access immediately.',
      primary: 'Buy a new tour',
      secondary: 'Back to homepage',
    },
    de: {
      badge: 'Zugang abgelaufen',
      title: 'Diese Tour ist über diesen Link nicht mehr verfügbar',
      text:
        'Dein persönlicher Zugang war nach dem Kauf 48 Stunden gültig. Dieser Zeitraum ist jetzt abgelaufen.',
      subtext:
        'Du kannst die Tour erneut kaufen, um sofort wieder Zugang zu erhalten.',
      primary: 'Neue Tour kaufen',
      secondary: 'Zur Startseite',
    },
  } as const

  const t = content[language]

  return (
    <main className="mx-auto max-w-md px-4 py-6">
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

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await getTourByAccessToken(token)
  const language = await getServerLanguage()

  if (data.status === 'expired') {
    return <ExpiredAccessCard language={language} />
  }

  if (data.status === 'invalid') {
    notFound()
  }

  const resolvedData = data as any
  const tour = resolvedData?.tour ?? resolvedData

  return (
    <main className="mx-auto max-w-md px-4 py-4">
      <TourPlayer
        token={token}
        stops={data.stops}
        language={language}
        tourId={String(tour?.id ?? token)}
        tourSlug={String(tour?.slug ?? token)}
        tourTitle={String(tour?.title ?? 'Ameland audiotour')}
        customerEmail={typeof resolvedData?.order?.email === 'string' ? resolvedData.order.email : null}
        distanceKm={typeof tour?.distance_km === 'number' ? tour.distance_km : 0}
      />
    </main>
  )
}