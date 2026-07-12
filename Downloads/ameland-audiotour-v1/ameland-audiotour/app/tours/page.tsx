import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Clock3,
  Headphones,
  MapPinned,
  Route,
} from 'lucide-react'
import { asNumber, asText, getAvailableTours, getTourSlug } from '@/lib/tour-catalog'

export const dynamic = 'force-dynamic'

type Lang = 'nl' | 'de' | 'en'

function getLang(searchParams?: { lang?: string }): Lang {
  return searchParams?.lang === 'de' || searchParams?.lang === 'en' ? searchParams.lang : 'nl'
}

function localized(tour: Record<string, any>, base: string, language: Lang, fallback = '') {
  const values =
    language === 'en'
      ? [tour[`${base}_en`], tour[base], tour[`${base}_de`]]
      : language === 'de'
      ? [tour[`${base}_de`], tour[base], tour[`${base}_en`]]
      : [tour[base], tour[`${base}_en`], tour[`${base}_de`]]
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || fallback
}

function durationLabel(tour: Record<string, any>) {
  const minutes = asNumber(tour.duration_minutes)
  return minutes ? `${minutes} min` : asText(tour.duration, '90 min')
}

function distanceLabel(tour: Record<string, any>) {
  const km = asNumber(tour.distance_km)
  return km ? `± ${String(km).replace('.', ',')} km` : asText(tour.distance, '± 3 km')
}

function priceLabel(tour: Record<string, any>, lang: Lang) {
  const cents = asNumber(tour.price_cents) || 0
  const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-GB' : 'nl-NL'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const COPY = {
  nl: {
    eyebrow: 'Audiotours op Ameland',
    title: 'Kies je tour',
    intro: 'Eén complete wandeling is nu beschikbaar. Nieuwe dorpen volgen.',
    available: 'Nu beschikbaar',
    features: ['Audio bij iedere stop', 'GPS toont de volgende plek', '48 uur persoonlijke toegang'],
    order: 'Bestel de tour',
    upcoming: 'In voorbereiding',
    upcomingText: 'Na Hollum volgen ook verhalen uit Nes, Ballum en Buren.',
    future: [
      ['Nes', 'Het levendige hart van het eiland.'],
      ['Ballum', 'Bestuur, buitenplaatsen en Cammingha.'],
      ['Buren', 'Boerenleven, duinen en het oosten.'],
    ],
  },
  en: {
    eyebrow: 'Audio tours on Ameland',
    title: 'Choose your tour',
    intro: 'One complete walk is available now. More villages will follow.',
    available: 'Available now',
    features: ['Audio at every stop', 'GPS shows the next location', '48-hour personal access'],
    order: 'Book the tour',
    upcoming: 'In development',
    upcomingText: 'After Hollum, stories from Nes, Ballum and Buren will follow.',
    future: [
      ['Nes', 'The lively heart of the island.'],
      ['Ballum', 'Government, country houses and Cammingha.'],
      ['Buren', 'Farm life, dunes and the east.'],
    ],
  },
  de: {
    eyebrow: 'Audiotouren auf Ameland',
    title: 'Wähle deine Tour',
    intro: 'Eine vollständige Wanderung ist jetzt verfügbar. Weitere Dörfer folgen.',
    available: 'Jetzt verfügbar',
    features: ['Audio an jedem Stopp', 'GPS zeigt den nächsten Ort', '48 Stunden persönlicher Zugang'],
    order: 'Tour buchen',
    upcoming: 'In Vorbereitung',
    upcomingText: 'Nach Hollum folgen Geschichten aus Nes, Ballum und Buren.',
    future: [
      ['Nes', 'Das lebendige Herz der Insel.'],
      ['Ballum', 'Verwaltung, Landhäuser und Cammingha.'],
      ['Buren', 'Bauernleben, Dünen und der Osten.'],
    ],
  },
} as const

export default async function ToursPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const lang = getLang(resolvedSearchParams)
  const t = COPY[lang]
  const tours = await getAvailableTours()

  return (
    <main className="min-h-[100svh] bg-[#f1eadf] pb-20 text-[#20372f]">
      <section className="px-4 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#0f5d67]">{t.eyebrow}</p>
          <h1 className="mt-3 text-[clamp(3rem,8vw,6rem)] font-black leading-[.92] tracking-[-.06em]">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#667067]">{t.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-8">
        <section className="space-y-5">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#7a8875]">{t.available}</p>

          {tours.map((tour: Record<string, any>, index: number) => {
            const slug = getTourSlug(tour)
            const title = localized(tour, 'title', lang, index === 0 ? 'Maak kennis met Hollum' : 'Audiotour Ameland')
            const description = localized(tour, 'description', lang, '')
            const image = asText(tour.hero_image_url)
            const price = priceLabel(tour, lang)

            return (
              <article key={slug} className="overflow-hidden rounded-[2.2rem] border border-[#ddd2c2] bg-[#fffdf8] shadow-[0_24px_70px_rgba(38,48,40,.10)]">
                <div className="grid lg:grid-cols-[1.08fr_.92fr]">
                  <div className="relative min-h-[330px] overflow-hidden bg-slate-900 lg:min-h-[520px]">
                    {image ? <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                      <h2 className="text-4xl font-black leading-[.95] tracking-[-.045em] sm:text-5xl">{title}</h2>
                      {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">{description}</p> : null}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efe7] px-3 py-2 text-xs font-black text-[#315848]"><Clock3 className="h-4 w-4" /> {durationLabel(tour)}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efe7] px-3 py-2 text-xs font-black text-[#315848]"><Route className="h-4 w-4" /> {distanceLabel(tour)}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efe7] px-3 py-2 text-xs font-black text-[#315848]"><MapPinned className="h-4 w-4" /> 9 stops</span>
                      </div>

                      <div className="mt-8 space-y-4">
                        {t.features.map((feature) => (
                          <p key={feature} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#dcebe1] text-[#0f5d67]"><Check className="h-3.5 w-3.5" /></span>
                            {feature}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-10 border-t border-[#e8dfd2] pt-6">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.16em] text-[#7a8875]">Totaal</p>
                          <p className="mt-1 text-3xl font-black tracking-tight">{price}</p>
                        </div>
                        <Headphones className="h-8 w-8 text-[#0f5d67]" />
                      </div>
                      <Link href={`/checkout/${slug}?lang=${lang}`} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#e47750] px-6 font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#ee835c]">
                        {t.order} <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="rounded-[2.2rem] bg-[#153f45] p-6 text-white sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">{t.upcoming}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.035em] sm:text-4xl">{t.upcomingText}</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {t.future.map(([place, description]) => (
              <article key={place} className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xl font-black">{place}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
