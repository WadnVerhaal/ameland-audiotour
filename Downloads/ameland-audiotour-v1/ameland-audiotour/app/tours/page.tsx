import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  MapPinned,
  ShieldCheck,
  Smartphone,
  Sparkles,
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
  if (minutes) return `${minutes} min`
  return asText(tour.duration, '90 min')
}

function distanceLabel(tour: Record<string, any>) {
  const km = asNumber(tour.distance_km)
  if (km) return `± ${String(km).replace('.', ',')} km`
  return asText(tour.distance, '± 3 km')
}

const COPY = {
  nl: {
    back: 'Terug naar het begin',
    eyebrow: 'Kies je eilandverhaal',
    title: 'Welke kant van Ameland wil je vandaag horen?',
    intro: 'Elke tour combineert route, professionele audio en heldere navigatie op je eigen telefoon.',
    available: 'Nu beschikbaar',
    badge: 'Direct starten',
    buy: 'Bekijk en bestel',
    included: ['Professioneel ingesproken', 'GPS-route met volgende stop', '48 uur persoonlijke toegang'],
    promise: 'Zo weet je vooraf precies wat je krijgt',
    trust: ['Veilig online betalen', 'Geen app-download', 'Start wanneer je wilt'],
    coming: 'Hierna te ontdekken',
    comingText: 'Nieuwe dorpsverhalen worden voorbereid in dezelfde rustige, persoonlijke stijl.',
    future: [
      ['Nes', 'Steegjes, commandeurs en het levendige hart van Ameland.', 'Wandeltour'],
      ['Ballum', 'Bestuur, buitenplaatsen en het dorp van de Cammingha’s.', 'Wandeltour'],
      ['Buren', 'Boerenleven, duinen en verhalen uit het oosten.', 'Wandeltour'],
    ],
    footer: '© Ameland Audiotours',
  },
  en: {
    back: 'Back to the start',
    eyebrow: 'Choose your island story',
    title: 'Which side of Ameland would you like to hear today?',
    intro: 'Every tour combines a route, professional narration and clear navigation on your own phone.',
    available: 'Available now',
    badge: 'Start immediately',
    buy: 'View and book',
    included: ['Professional narration', 'GPS route to the next stop', '48-hour personal access'],
    promise: 'Know exactly what you are getting',
    trust: ['Secure online payment', 'No app download', 'Start whenever you like'],
    coming: 'Discover next',
    comingText: 'New village stories are being created in the same calm, personal style.',
    future: [
      ['Nes', 'Lanes, sea captains and the lively heart of Ameland.', 'Walking tour'],
      ['Ballum', 'Island government, country houses and the Cammingha village.', 'Walking tour'],
      ['Buren', 'Farm life, dunes and stories from the east.', 'Walking tour'],
    ],
    footer: '© Ameland Audiotours',
  },
  de: {
    back: 'Zurück zum Start',
    eyebrow: 'Wähle deine Inselgeschichte',
    title: 'Welche Seite von Ameland möchtest du heute hören?',
    intro: 'Jede Tour verbindet Route, professionelle Stimme und klare Navigation auf deinem eigenen Handy.',
    available: 'Jetzt verfügbar',
    badge: 'Sofort starten',
    buy: 'Ansehen und buchen',
    included: ['Professionell gesprochen', 'GPS-Route zum nächsten Stopp', '48 Stunden persönlicher Zugang'],
    promise: 'Du weißt vorher genau, was dich erwartet',
    trust: ['Sicher online bezahlen', 'Kein App-Download', 'Start, wann du möchtest'],
    coming: 'Als Nächstes entdecken',
    comingText: 'Neue Dorfgeschichten entstehen im gleichen ruhigen, persönlichen Stil.',
    future: [
      ['Nes', 'Gassen, Kapitäne und das lebendige Herz von Ameland.', 'Wandertour'],
      ['Ballum', 'Inselverwaltung, Landhäuser und das Dorf der Camminghas.', 'Wandertour'],
      ['Buren', 'Bauernleben, Dünen und Geschichten aus dem Osten.', 'Wandertour'],
    ],
    footer: '© Ameland Audiotours',
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
  const availableTours = await getAvailableTours()

  return (
    <main className="min-h-[100svh] bg-[#efe7da] pb-24 text-[#20372f]">
      <header className="bg-[#153f45] px-4 py-10 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <Link href={`/?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-black text-emerald-100 transition hover:text-white">
            ← {t.back}
          </Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[.24em] text-emerald-200">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2.8rem,8vw,5.8rem)] font-black leading-[.9] tracking-[-.06em]">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">{t.intro}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {t.trust.map((item, index) => {
              const Icon = [ShieldCheck, Smartphone, Clock3][index]
              return (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-slate-100 backdrop-blur">
                  <Icon className="h-4 w-4 text-emerald-300" /> {item}
                </span>
              )
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-8 sm:py-12">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#7a8875]">{t.available}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{t.promise}</h2>
            </div>
            <Sparkles className="hidden h-8 w-8 text-[#d86f48] sm:block" />
          </div>

          <div className="grid gap-5">
            {availableTours.map((tour: Record<string, any>, index: number) => {
              const slug = getTourSlug(tour)
              const title = localized(tour, 'title', lang, index === 0 ? 'Maak kennis met Hollum' : 'Audiotour Ameland')
              const subtitle =
                localized(tour, 'subtitle', lang) ||
                localized(tour, 'description', lang, 'Een bijzondere audiotour op Ameland.')
              const image = asText(tour.hero_image_url)

              return (
                <article key={slug} className="overflow-hidden rounded-[2.2rem] border border-[#ded4c5] bg-[#fffdf8] shadow-[0_22px_60px_rgba(31,39,32,.1)]">
                  <div className="grid lg:grid-cols-[1.05fr_.95fr]">
                    <div className="relative min-h-64 overflow-hidden bg-slate-900 lg:min-h-[420px]">
                      {image ? (
                        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                        <span className="inline-flex rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-black text-slate-950">{t.badge}</span>
                        <h3 className="mt-4 text-3xl font-black leading-none tracking-tight sm:text-4xl">{title}</h3>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">{subtitle}</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-5 sm:p-7">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5ea] px-3 py-2 text-xs font-black text-[#315848]">
                            <Clock3 className="h-4 w-4" /> {durationLabel(tour)}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5ea] px-3 py-2 text-xs font-black text-[#315848]">
                            <MapPinned className="h-4 w-4" /> {distanceLabel(tour)}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf5ea] px-3 py-2 text-xs font-black text-[#315848]">
                            <Headphones className="h-4 w-4" /> 9 stops
                          </span>
                        </div>

                        <div className="mt-7 space-y-4">
                          {t.included.map((item) => (
                            <p key={item} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#4f5f55]">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0f5d67]" /> {item}
                            </p>
                          ))}
                        </div>
                      </div>

                      <Link href={`/checkout/${slug}?lang=${lang}`} className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#d86f48] px-6 font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#e37a53]">
                        {t.buy} <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-[#ded4c5] bg-[#fffdf8] p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#7a8875]">{t.coming}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">{t.comingText}</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {t.future.map(([place, description, type], index) => (
              <article key={place} className="rounded-3xl border border-[#ebe3d7] bg-[#f8f2e8] p-5">
                <div className="flex items-center justify-between">
                  <MapPinned className="h-6 w-6 text-[#0f5d67]" />
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#7a8875]">{type}</span>
                </div>
                <h3 className="mt-5 text-2xl font-black">{place}</h3>
                <p className="mt-2 text-sm leading-6 text-[#677066]">{description}</p>
                <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#c96643]">0{index + 1}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="text-center text-xs font-bold text-[#8a867d]">{t.footer}</p>
      </div>
    </main>
  )
}
