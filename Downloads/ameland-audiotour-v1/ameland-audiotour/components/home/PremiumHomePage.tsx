import Link from 'next/link'
import { cookies } from 'next/headers'
import {
  ArrowRight,
  Check,
  Clock3,
  Headphones,
  MapPinned,
  Navigation,
  Route,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import TourPreview from './TourPreview'
import { asNumber, asText, getAvailableTours, getTourSlug } from '@/lib/tour-catalog'

type Lang = 'nl' | 'de' | 'en'

type PreviewStop = {
  title?: string | null
  title_en?: string | null
  title_de?: string | null
  audio_url?: string | null
  audio_url_nl?: string | null
}

async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const value =
    cookieStore.get('ameland-audiotours-language')?.value ||
    cookieStore.get('NEXT_LOCALE')?.value
  return value === 'de' || value === 'en' ? value : 'nl'
}

function localized(value: Record<string, unknown>, base: string, lang: Lang, fallback = '') {
  const candidates =
    lang === 'en'
      ? [value[`${base}_en`], value[base], value[`${base}_de`]]
      : lang === 'de'
      ? [value[`${base}_de`], value[base], value[`${base}_en`]]
      : [value[base], value[`${base}_en`], value[`${base}_de`]]

  return (
    candidates.find((candidate) => typeof candidate === 'string' && candidate.trim()) || fallback
  ) as string
}

async function getPreviewStops(tourId: unknown): Promise<PreviewStop[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !apiKey || !tourId) return []

  const params = new URLSearchParams({
    select: 'title,title_en,title_de,audio_url,audio_url_nl,order_index',
    tour_id: `eq.${String(tourId)}`,
    is_active: 'eq.true',
    order: 'order_index.asc',
    limit: '4',
  })

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/tour_stops?${params.toString()}`,
      {
        headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 60 },
      }
    )
    if (!response.ok) return []
    const result = await response.json()
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

const COPY = {
  nl: {
    eyebrow: 'Zelfgeleide audiotour op Ameland',
    title: 'Loop door Hollum. Hoor wat je anders voorbijloopt.',
    intro: 'Negen verhalen leiden je van het oude dorp naar de vuurtoren. Op je eigen tempo, met GPS op je telefoon.',
    start: 'Start de tour',
    preview: 'Luister 20 seconden',
    available: 'Nu te beleven',
    included: 'Dit zit in de tour',
    features: ['Audio bij iedere stop', 'Wandelroute naar de volgende plek', 'Persoonlijke toegang voor 48 uur'],
    route: 'Je begint hier',
    howLabel: 'Zo werkt het',
    howTitle: 'Van aankoop naar het eerste verhaal in drie stappen.',
    steps: [
      ['Kies', 'Bestel de tour veilig online.'],
      ['Open', 'Je persoonlijke startlink verschijnt direct.'],
      ['Loop', 'De kaart begeleidt je van verhaal naar verhaal.'],
    ],
    noApp: 'Geen app nodig',
    noAppText: 'Alles werkt in de browser van je telefoon. Locatie wordt alleen gebruikt om je onderweg te begeleiden.',
    finalTitle: 'Klaar om Hollum anders te zien?',
    finalText: 'Start wanneer het jou uitkomt. Neem alleen je telefoon en oortjes mee.',
    finalCta: 'Bestel Maak kennis met Hollum',
  },
  en: {
    eyebrow: 'Self-guided audio tour on Ameland',
    title: 'Walk through Hollum. Hear what you would otherwise pass by.',
    intro: 'Nine stories lead you from the old village to the lighthouse, at your own pace with GPS on your phone.',
    start: 'Start the tour',
    preview: 'Listen for 20 seconds',
    available: 'Available now',
    included: 'Included in the tour',
    features: ['Audio at every stop', 'Walking route to the next location', 'Personal access for 48 hours'],
    route: 'Your first stops',
    howLabel: 'How it works',
    howTitle: 'From purchase to the first story in three steps.',
    steps: [
      ['Choose', 'Book the tour securely online.'],
      ['Open', 'Your personal start link appears immediately.'],
      ['Walk', 'The map guides you from story to story.'],
    ],
    noApp: 'No app required',
    noAppText: 'Everything works in your phone browser. Location is only used to guide you during the walk.',
    finalTitle: 'Ready to see Hollum differently?',
    finalText: 'Start whenever it suits you. Bring only your phone and earphones.',
    finalCta: 'Book Discover Hollum',
  },
  de: {
    eyebrow: 'Selbstgeführte Audiotour auf Ameland',
    title: 'Spaziere durch Hollum. Höre, was du sonst übersehen würdest.',
    intro: 'Neun Geschichten führen dich vom alten Dorf bis zum Leuchtturm – in deinem Tempo und mit GPS auf dem Handy.',
    start: 'Tour starten',
    preview: '20 Sekunden anhören',
    available: 'Jetzt erlebbar',
    included: 'In der Tour enthalten',
    features: ['Audio an jedem Stopp', 'Fußweg zum nächsten Ort', '48 Stunden persönlicher Zugang'],
    route: 'Hier beginnt deine Route',
    howLabel: 'So funktioniert es',
    howTitle: 'Vom Kauf bis zur ersten Geschichte in drei Schritten.',
    steps: [
      ['Wählen', 'Buche die Tour sicher online.'],
      ['Öffnen', 'Dein persönlicher Startlink erscheint sofort.'],
      ['Losgehen', 'Die Karte führt dich von Geschichte zu Geschichte.'],
    ],
    noApp: 'Keine App erforderlich',
    noAppText: 'Alles funktioniert im Browser deines Handys. Der Standort wird nur für die Wegführung verwendet.',
    finalTitle: 'Bereit, Hollum anders zu erleben?',
    finalText: 'Starte, wann es dir passt. Du brauchst nur dein Handy und Kopfhörer.',
    finalCta: 'Entdecke Hollum buchen',
  },
} as const

export default async function PremiumHomePage() {
  const lang = await getLang()
  const t = COPY[lang]
  const tours = await getAvailableTours()
  const tour = tours[0] || null
  const stops = tour ? await getPreviewStops(tour.id) : []
  const previewStop = stops.find((stop) => stop.audio_url_nl || stop.audio_url) || null
  const slug = tour ? getTourSlug(tour) : ''
  const title = tour ? localized(tour, 'title', lang, 'Maak kennis met Hollum') : 'Maak kennis met Hollum'
  const description = tour ? localized(tour, 'description', lang, '') : ''
  const heroImage = tour ? asText(tour.hero_image_url) : ''
  const duration = tour ? asNumber(tour.duration_minutes) || 90 : 90
  const distance = tour ? asNumber(tour.distance_km) : 6.5
  const previewAudio = previewStop?.audio_url_nl || previewStop?.audio_url || ''
  const checkoutHref = slug ? `/checkout/${slug}?lang=${lang}` : `/tours?lang=${lang}`

  return (
    <main className="min-h-[100svh] bg-[#f1eadf] text-[#20372f]">
      <section className="relative isolate min-h-[82svh] overflow-hidden bg-slate-950 text-white">
        {heroImage ? <img src={heroImage} alt="Hollum op Ameland" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.94)_0%,rgba(2,6,23,.72)_48%,rgba(2,6,23,.32)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,.18),rgba(2,6,23,.88))]" />

        <div className="relative mx-auto flex min-h-[82svh] max-w-6xl items-end px-5 pb-14 pt-36 sm:px-8 sm:pb-20 sm:pt-44">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.23em] text-emerald-200">{t.eyebrow}</p>
            <h1 className="mt-5 text-[clamp(3.2rem,9vw,6.7rem)] font-black leading-[.9] tracking-[-.065em]">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{t.intro}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={checkoutHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#e47750] px-7 font-black text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#ee835c]">
                {t.start} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#preview" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 font-black text-white backdrop-blur transition hover:bg-white/20">
                <Headphones className="h-5 w-5" /> {t.preview}
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-slate-200">
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-300" /> {duration} min</span>
              <span className="inline-flex items-center gap-2"><Route className="h-4 w-4 text-emerald-300" /> ± {String(distance).replace('.', ',')} km</span>
              <span className="inline-flex items-center gap-2"><MapPinned className="h-4 w-4 text-emerald-300" /> 9 stops</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8 sm:py-16">
        <section id="preview" className="overflow-hidden rounded-[2.2rem] border border-[#ddd2c2] bg-[#fffdf8] shadow-[0_24px_70px_rgba(38,48,40,.10)]">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-6 sm:p-9">
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#7a8875]">{t.available}</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">{title}</h2>
              {description ? <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e685f]">{description}</p> : null}

              <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#7a8875]">{t.included}</p>
              <div className="mt-4 space-y-3">
                {t.features.map((feature) => (
                  <p key={feature} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#dcebe1] text-[#0f5d67]"><Check className="h-3.5 w-3.5" /></span>
                    {feature}
                  </p>
                ))}
              </div>
            </div>

            <div className="border-t border-[#e7ded1] bg-[#e8efe7] p-5 sm:p-7 lg:border-l lg:border-t-0">
              {previewAudio ? <TourPreview audioUrl={previewAudio} language={lang} /> : null}
              {stops.length ? (
                <div className="mt-5 rounded-[1.6rem] bg-[#fffdf8] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#7a8875]">{t.route}</p>
                  <div className="mt-4 space-y-3">
                    {stops.map((stop, index) => (
                      <div key={`${stop.title}-${index}`} className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#153f45] text-xs font-black text-white">{index + 1}</span>
                        <span className="text-sm font-bold text-[#31473d]">{localized(stop as Record<string, unknown>, 'title', lang, `${index + 1}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[2.2rem] bg-[#153f45] p-6 text-white sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-200">{t.howLabel}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.035em] sm:text-5xl">{t.howTitle}</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {t.steps.map(([label, text], index) => {
              const Icon = [ShieldCheck, Smartphone, Navigation][index]
              return (
                <article key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5">
                  <Icon className="h-6 w-6 text-emerald-300" />
                  <h3 className="mt-5 text-xl font-black">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-[#ddd2c2] bg-[#fffdf8] p-6 sm:p-9">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#0f5d67]"><Smartphone className="h-4 w-4" /> {t.noApp}</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#5e685f]">{t.noAppText}</p>
        </section>

        <section className="px-2 py-8 text-center sm:py-12">
          <h2 className="text-4xl font-black tracking-[-.045em] sm:text-6xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#667067]">{t.finalText}</p>
          <Link href={checkoutHref} className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#e47750] px-7 font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#ee835c]">
            {t.finalCta} <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </div>
    </main>
  )
}
