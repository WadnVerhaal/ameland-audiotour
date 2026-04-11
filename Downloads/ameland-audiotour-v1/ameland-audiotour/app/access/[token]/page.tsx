import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Headphones, Play, Clock3, MapPin } from 'lucide-react'
import { getTourByAccessToken } from '@/lib/data/access'
import { getStopTitle, translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ token: string }>
}

function getTourImage(slug: string) {
  if (slug.includes('verborgen-verhalen')) return '/images/tour-dorp.jpg'
  if (slug.includes('fiets')) return '/images/tour-fietsen.jpg'
  return '/images/tour-duinen.jpg'
}

export default async function AccessPage({ params }: Props) {
  const { token } = await params
  const data = await getTourByAccessToken(token)
  if (!data || !data.tour) notFound()

  const language = await getServerLanguage()
  const t = translations[language]

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={getTourImage(data.tour.slug)}
            alt={data.tour.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(247,243,234,0.16)_55%,rgba(247,243,234,0.95)_100%)]" />
        </div>

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            {t.accessBadge}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-app-accent">{data.tour.title}</h1>

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
            <span>{t.accessBenefit1}</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.accessBenefit2}</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.accessBenefit3}</span>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <Link
          href={`/player/${token}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
        >
          <Play className="mr-2 h-4 w-4" />
          {t.startTour}
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