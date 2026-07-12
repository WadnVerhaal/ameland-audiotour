import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import {
  CheckCircle2,
  Clock3,
  Headphones,
  MapPinned,
  Navigation,
  ShieldCheck,
  Smartphone,
  Sparkles,
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
  image_url?: string | null
}

async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const value =
    cookieStore.get('ameland-audiotours-language')?.value ||
    cookieStore.get('NEXT_LOCALE')?.value

  if (value === 'de' || value === 'en' || value === 'nl') return value
  return 'nl'
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
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const apiKey = serverKey || publicKey
  if (!supabaseUrl || !apiKey || !tourId) return []

  const params = new URLSearchParams({
    select: 'title,title_en,title_de,audio_url,audio_url_nl,image_url,order_index',
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
    eyebrow: 'Audiotours op Ameland',
    title: 'Hoor Ameland zoals je het nog nooit hebt beleefd.',
    text: 'Je persoonlijke eilandgids leidt je langs bijzondere plekken, precies op het moment dat je er staat.',
    primary: 'Ontdek de tours',
    secondary: 'Zo werkt het',
    trustTitle: 'Zonder gedoe op pad',
    trust: [
      ['9 verhalen', 'Zorgvuldig gekozen stops in en rond Hollum'],
      ['± 90 minuten', 'Start wanneer het jou uitkomt'],
      ['Professionele stem', 'Rustig, helder en prettig om naar te luisteren'],
      ['Op je eigen telefoon', 'Geen app-download of gids nodig'],
    ],
    previewTitle: 'Hoor eerst wat je krijgt',
    previewText: 'Luister naar een kort fragment en bekijk alvast de eerste routepunten.',
    howEyebrow: 'Van kiezen naar beleven',
    howTitle: 'Je hoeft alleen maar te wandelen en te luisteren.',
    steps: [
      ['1', 'Kies je tour', 'Bestel veilig online en ontvang direct toegang.'],
      ['2', 'Open op je telefoon', 'Sta locatie en audio toe; de route staat meteen klaar.'],
      ['3', 'Volg je gids', 'Je ziet alleen de volgende stop en hoort het verhaal wanneer je aankomt.'],
    ],
    proof: 'Ontworpen voor buiten',
    proofText: 'Grote knoppen, duidelijke route-instructies en een rustige interface die ook onderweg prettig werkt.',
    safe: 'Luister veilig met één oortje of open-ear audio en blijf alert op verkeer en je omgeving.',
    final: 'Start jouw Ameland-verhaal',
    routeLabel: 'Eerste routepunten',
    noPreview: 'De luisterpreview wordt voorbereid. De volledige tour is wel direct beschikbaar.',
  },
  en: {
    eyebrow: 'Audio tours on Ameland',
    title: 'Hear Ameland as you have never experienced it before.',
    text: 'Your personal island guide leads you to remarkable places and tells each story exactly where it happened.',
    primary: 'Explore the tours',
    secondary: 'How it works',
    trustTitle: 'Easy from the first step',
    trust: [
      ['9 stories', 'Carefully selected stops in and around Hollum'],
      ['± 90 minutes', 'Start whenever it suits you'],
      ['Professional narration', 'Calm, clear and pleasant to listen to'],
      ['On your own phone', 'No app download or guide required'],
    ],
    previewTitle: 'Hear what you are buying',
    previewText: 'Listen to a short sample and preview the first route points.',
    howEyebrow: 'From choosing to experiencing',
    howTitle: 'All you need to do is walk and listen.',
    steps: [
      ['1', 'Choose your tour', 'Book securely online and receive access immediately.'],
      ['2', 'Open it on your phone', 'Allow location and audio; your route is ready.'],
      ['3', 'Follow your guide', 'Only the next stop is shown and the story starts when you arrive.'],
    ],
    proof: 'Designed for outdoors',
    proofText: 'Large controls, clear directions and a calm interface that remains easy to use while walking.',
    safe: 'Listen safely with one earbud or open-ear audio and stay aware of traffic and your surroundings.',
    final: 'Start your Ameland story',
    routeLabel: 'First route points',
    noPreview: 'The listening preview is being prepared. The complete tour is available now.',
  },
  de: {
    eyebrow: 'Audiotouren auf Ameland',
    title: 'Höre Ameland so, wie du es noch nie erlebt hast.',
    text: 'Dein persönlicher Inselguide führt dich zu besonderen Orten und erzählt jede Geschichte genau dort, wo sie passiert ist.',
    primary: 'Touren entdecken',
    secondary: 'So funktioniert es',
    trustTitle: 'Einfach losgehen',
    trust: [
      ['9 Geschichten', 'Sorgfältig ausgewählte Stopps in und um Hollum'],
      ['± 90 Minuten', 'Starte, wann es dir passt'],
      ['Professionelle Stimme', 'Ruhig, klar und angenehm zu hören'],
      ['Auf deinem Handy', 'Kein App-Download und kein Guide nötig'],
    ],
    previewTitle: 'Höre vorher, was dich erwartet',
    previewText: 'Höre eine kurze Probe und sieh dir die ersten Routenpunkte an.',
    howEyebrow: 'Vom Wählen zum Erleben',
    howTitle: 'Du musst nur noch gehen und zuhören.',
    steps: [
      ['1', 'Tour auswählen', 'Sicher online buchen und sofort Zugang erhalten.'],
      ['2', 'Auf dem Handy öffnen', 'Standort und Audio erlauben; die Route ist direkt bereit.'],
      ['3', 'Deinem Guide folgen', 'Nur der nächste Stopp wird gezeigt und die Geschichte startet bei der Ankunft.'],
    ],
    proof: 'Für draußen gemacht',
    proofText: 'Große Bedienelemente, klare Wegführung und eine ruhige Oberfläche für unterwegs.',
    safe: 'Höre sicher mit einem Ohrhörer oder Open-Ear-Audio und achte weiter auf Verkehr und Umgebung.',
    final: 'Starte deine Ameland-Geschichte',
    routeLabel: 'Erste Routenpunkte',
    noPreview: 'Die Hörprobe wird vorbereitet. Die vollständige Tour ist bereits verfügbar.',
  },
} as const

export default async function PremiumHomePage() {
  const lang = await getLang()
  const t = COPY[lang]
  const tours = await getAvailableTours()
  const featuredTour = tours[0] || null
  const previewStops = featuredTour ? await getPreviewStops(featuredTour.id) : []
  const previewStop = previewStops.find((stop) => stop.audio_url_nl || stop.audio_url) || null
  const slug = featuredTour ? getTourSlug(featuredTour) : ''
  const title = featuredTour
    ? localized(featuredTour, 'title', lang, 'Maak kennis met Hollum')
    : 'Maak kennis met Hollum'
  const heroImage =
    (featuredTour ? asText(featuredTour.hero_image_url) : '') ||
    previewStops.find((stop) => stop.image_url)?.image_url ||
    ''
  const duration = featuredTour ? asNumber(featuredTour.duration_minutes) || 90 : 90
  const distance = featuredTour ? asNumber(featuredTour.distance_km) : null
  const previewTitle = previewStop
    ? localized(previewStop as Record<string, unknown>, 'title', lang, title)
    : title
  const previewAudio = previewStop?.audio_url_nl || previewStop?.audio_url || ''

  return (
    <main className="min-h-[100svh] bg-[#efe7da] pb-24 text-[#20372f]">
      <section className="relative isolate min-h-[78svh] overflow-hidden bg-slate-950 text-white">
        {heroImage ? (
          <img
            src={heroImage}
            alt="Ameland"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,.28),rgba(2,6,23,.94))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,.24),transparent_35%)]" />

        <div className="relative mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-between px-5 pb-10 pt-8 sm:px-8 sm:pb-16">
          <div className="flex items-center gap-3">
            <Image
              src="/images/ameland-audiotours-logo.webp"
              alt="Ameland Audiotours"
              width={68}
              height={68}
              className="h-16 w-16 rounded-full border border-white/30 object-cover shadow-2xl"
              priority
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Ameland</p>
              <p className="text-lg font-black">Audiotours</p>
            </div>
          </div>

          <div className="max-w-3xl pt-24 sm:pt-32">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">{t.eyebrow}</p>
            <h1 className="mt-5 text-[clamp(3rem,10vw,6.8rem)] font-black leading-[.88] tracking-[-.065em]">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{t.text}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/tours?lang=${lang}`}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#d86f48] px-7 text-base font-black text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#e37a53]"
              >
                {t.primary} <Navigation className="h-5 w-5" />
              </Link>
              <a
                href="#zo-werkt-het"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 text-base font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                {t.secondary}
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                {duration} min
              </span>
              {distance ? (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                  ± {String(distance).replace('.', ',')} km
                </span>
              ) : null}
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                9 stops
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-1 max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12">
        <section className="rounded-[2.2rem] border border-[#ded4c5] bg-[#fffdf8] p-5 shadow-[0_24px_70px_rgba(31,39,32,.11)] sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-teal-700" />
            <h2 className="text-2xl font-black tracking-tight">{t.trustTitle}</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.trust.map(([label, text], index) => {
              const Icon = [MapPinned, Clock3, Headphones, Smartphone][index]
              return (
                <article key={label} className="rounded-3xl border border-[#ebe3d7] bg-[#f8f2e8] p-5">
                  <Icon className="h-6 w-6 text-[#0f5d67]" />
                  <h3 className="mt-4 text-lg font-black">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#677066]">{text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[2.2rem] border border-[#ded4c5] bg-[#fffdf8] p-5 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#8a887d]">{t.previewTitle}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#626b61]">{t.previewText}</p>

            <div className="mt-6 rounded-3xl bg-[#edf5ea] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#6f806e]">{t.routeLabel}</p>
              <div className="mt-4 space-y-3">
                {previewStops.slice(0, 4).map((stop, index) => (
                  <div key={`${stop.title}-${index}`} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-[#0f5d67] shadow-sm">
                      {index + 1}
                    </span>
                    <span className="font-bold text-[#31473d]">
                      {localized(stop as Record<string, unknown>, 'title', lang, `${index + 1}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {previewAudio ? (
            <TourPreview
              audioUrl={previewAudio}
              title={previewTitle}
              imageUrl={previewStop?.image_url || heroImage}
              language={lang}
            />
          ) : (
            <div className="flex min-h-72 items-center rounded-[2rem] border border-[#ded4c5] bg-slate-950 p-7 text-white">
              <div>
                <Sparkles className="h-8 w-8 text-emerald-300" />
                <p className="mt-5 text-xl font-black">{t.noPreview}</p>
              </div>
            </div>
          )}
        </section>

        <section id="zo-werkt-het" className="rounded-[2.2rem] border border-[#ded4c5] bg-[#fffdf8] p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#8a887d]">{t.howEyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{t.howTitle}</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {t.steps.map(([number, label, text]) => (
              <article key={number} className="rounded-3xl border border-[#ebe3d7] bg-[#f8f2e8] p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0f5d67] text-sm font-black text-white">
                  {number}
                </span>
                <h3 className="mt-5 text-xl font-black">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-[#677066]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-[2.2rem] bg-[#153f45] p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-200">{t.proof}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">{t.proofText}</h2>
            <p className="mt-4 flex max-w-2xl items-start gap-2 text-sm leading-6 text-slate-200">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> {t.safe}
            </p>
          </div>
          <Link
            href={slug ? `/checkout/${slug}?lang=${lang}` : `/tours?lang=${lang}`}
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-white px-7 font-black text-[#153f45] shadow-xl transition hover:bg-emerald-100"
          >
            {t.final}
          </Link>
        </section>

        <p className="pb-2 text-center text-xs font-bold text-[#8a867d]">© Ameland Audiotours</p>
      </div>
    </main>
  )
}
