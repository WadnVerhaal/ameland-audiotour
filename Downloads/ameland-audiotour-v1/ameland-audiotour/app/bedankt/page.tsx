import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  Compass,
  Headphones,
  Mail,
  MapPinned,
  Sparkles,
  Star,
} from 'lucide-react'
import CompletionActions from '@/components/thanks/CompletionActions'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{
    lang?: string
    completed?: string
    review?: string
  }>
}

type Language = 'nl' | 'en' | 'de'

const COPY = {
  nl: {
    eyebrow: 'Tour voltooid',
    title: 'Jij bent nu Hollum Explorer.',
    subtitle: 'Negen verhalen, één dorp en een heleboel Ameland. Mooi dat je met ons op pad bent gegaan.',
    saved: 'Je afronding is opgeslagen en de bedankmail is onderweg.',
    badge: 'Hollum Explorer',
    badgeText: 'Uitgereikt na het voltooien van Maak kennis met Hollum',
    reviewTitle: 'Hoe was je ervaring?',
    reviewText: 'Een korte beoordeling helpt ons de tour beter te maken en helpt andere bezoekers kiezen.',
    reviewButton: 'Geef je beoordeling',
    emailTitle: 'Je kunt nog eens terugluisteren',
    emailText: 'In je e-mail staat je persoonlijke toegang zolang deze geldig is, plus je reviewlink.',
    nextTitle: 'Ameland is nog lang niet uitgepraat',
    nextText: 'De volgende verhalen brengen je naar Nes, Ballum en Buren. Je kunt je route alvast uitkiezen.',
    nextTours: [
      ['Nes', 'Steegjes, commandeurs en verhalen rond het levendige hart van het eiland.'],
      ['Ballum', 'Bestuur, buitenplaatsen en het dorp van de oude Cammingha’s.'],
      ['Buren', 'Boerenleven, duinen en het oosten van Ameland.'],
    ],
    more: 'Bekijk alle tours',
    home: 'Naar de website',
    shareTitle: 'Ik heb Hollum ontdekt met Ameland Audiotours',
    shareText: 'Negen verhalen en een prachtige wandeling door Hollum. Ik ben nu Hollum Explorer.',
  },
  en: {
    eyebrow: 'Tour complete',
    title: 'You are now a Hollum Explorer.',
    subtitle: 'Nine stories, one village and plenty of Ameland. Thank you for joining us.',
    saved: 'Your completion has been saved and the thank-you email is on its way.',
    badge: 'Hollum Explorer',
    badgeText: 'Awarded after completing Discover Hollum',
    reviewTitle: 'How was your experience?',
    reviewText: 'A short review helps us improve the tour and helps other visitors choose.',
    reviewButton: 'Leave a review',
    emailTitle: 'Listen again later',
    emailText: 'Your email contains your personal access while it remains valid, plus your review link.',
    nextTitle: 'Ameland still has many stories to tell',
    nextText: 'The next tours take you to Nes, Ballum and Buren. Choose your next village now.',
    nextTours: [
      ['Nes', 'Lanes, sea captains and stories from the island’s lively heart.'],
      ['Ballum', 'Island government, country houses and the old Cammingha village.'],
      ['Buren', 'Farm life, dunes and the eastern side of Ameland.'],
    ],
    more: 'View all tours',
    home: 'Go to the website',
    shareTitle: 'I discovered Hollum with Ameland Audiotours',
    shareText: 'Nine stories and a wonderful walk through Hollum. I am now a Hollum Explorer.',
  },
  de: {
    eyebrow: 'Tour abgeschlossen',
    title: 'Du bist jetzt Hollum Explorer.',
    subtitle: 'Neun Geschichten, ein Dorf und ganz viel Ameland. Schön, dass du dabei warst.',
    saved: 'Dein Abschluss wurde gespeichert und die Dankesmail ist unterwegs.',
    badge: 'Hollum Explorer',
    badgeText: 'Verliehen nach dem Abschluss von Entdecke Hollum',
    reviewTitle: 'Wie war deine Erfahrung?',
    reviewText: 'Eine kurze Bewertung hilft uns und anderen Besuchern bei der Auswahl.',
    reviewButton: 'Bewertung abgeben',
    emailTitle: 'Später noch einmal hören',
    emailText: 'In deiner E-Mail findest du deinen persönlichen Zugang und den Bewertungslink.',
    nextTitle: 'Ameland hat noch viele Geschichten',
    nextText: 'Die nächsten Touren führen nach Nes, Ballum und Buren. Wähle schon jetzt dein nächstes Dorf.',
    nextTours: [
      ['Nes', 'Gassen, Kapitäne und Geschichten aus dem lebendigen Herzen der Insel.'],
      ['Ballum', 'Inselverwaltung, Landhäuser und das alte Dorf der Camminghas.'],
      ['Buren', 'Bauernleben, Dünen und der Osten von Ameland.'],
    ],
    more: 'Alle Touren ansehen',
    home: 'Zur Website',
    shareTitle: 'Ich habe Hollum mit Ameland Audiotours entdeckt',
    shareText: 'Neun Geschichten und ein wunderschöner Spaziergang durch Hollum. Ich bin jetzt Hollum Explorer.',
  },
} as const

function normalizeLanguage(value: unknown): Language {
  return value === 'en' || value === 'de' ? value : 'nl'
}

export default async function BedanktPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const language = normalizeLanguage(params.lang)
  const t = COPY[language]
  const reviewToken = String(params.review || '').trim()

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-6 text-white print:bg-white print:text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.14),transparent_38%)] print:hidden" />
      <section className="relative mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur print:border-slate-200 print:bg-white print:shadow-none">
          <header className="relative overflow-hidden bg-[linear-gradient(145deg,rgba(15,23,42,.98),rgba(2,6,23,.98))] p-6 sm:p-10 print:bg-white print:text-slate-950">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl print:hidden" />
            <div className="relative flex items-center gap-4">
              <Image
                src="/images/ameland-audiotours-logo.webp"
                alt="Ameland Audiotours"
                width={72}
                height={72}
                className="h-16 w-16 rounded-full border border-white/20 object-cover sm:h-20 sm:w-20"
                priority
              />
              <div>
                <p className="text-xs font-black uppercase tracking-[.24em] text-emerald-300 print:text-emerald-700">{t.eyebrow}</p>
                <p className="mt-1 font-black">Ameland Audiotours</p>
              </div>
            </div>

            <div className="relative mt-8 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-6xl">{t.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 print:text-slate-700">{t.subtitle}</p>
                {params.completed === '1' ? (
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 print:border-emerald-200 print:bg-emerald-50 print:text-emerald-900">
                    <CheckCircle2 className="h-4 w-4" /> {t.saved}
                  </p>
                ) : null}
              </div>

              <div className="rounded-[1.8rem] border border-amber-200/20 bg-amber-300 p-5 text-slate-950 shadow-2xl print:border-amber-300">
                <Award className="h-9 w-9" />
                <p className="mt-4 text-2xl font-black">{t.badge}</p>
                <p className="mt-2 max-w-56 text-sm font-bold leading-5 text-slate-800">{t.badgeText}</p>
              </div>
            </div>
          </header>

          <div className="space-y-4 p-4 sm:p-6 print:p-8">
            <CompletionActions language={language} title={t.shareTitle} text={t.shareText} />

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5 print:border-slate-200 print:bg-slate-50">
                <Star className="h-7 w-7 text-amber-300" fill="currentColor" />
                <h2 className="mt-4 text-xl font-black">{t.reviewTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">{t.reviewText}</p>
                <a
                  href={reviewToken ? `/review/${encodeURIComponent(reviewToken)}?lang=${language}` : 'mailto:info@amelandaudiotours.nl?subject=Ervaring%20Ameland%20Audiotours'}
                  className="mt-5 inline-flex rounded-full bg-emerald-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200 print:hidden"
                >
                  {t.reviewButton}
                </a>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5 print:border-slate-200 print:bg-slate-50">
                <Mail className="h-7 w-7 text-emerald-300" />
                <h2 className="mt-4 text-xl font-black">{t.emailTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">{t.emailText}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-emerald-200 print:text-emerald-700">
                  <Headphones className="h-4 w-4" /> Ameland Audiotours
                </p>
              </article>
            </div>

            <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6 print:border-slate-200 print:bg-white">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{t.nextTitle}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 print:text-slate-700">{t.nextText}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {t.nextTours.map(([place, description], index) => (
                  <article key={place} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 print:border-slate-200 print:bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <MapPinned className="h-5 w-5 text-emerald-300" />
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-300 print:bg-slate-200 print:text-slate-700">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black">{place}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">{description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <footer className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:p-6 print:hidden">
            <Link
              href={`/tours?lang=${language}`}
              className="flex-1 rounded-2xl bg-white px-5 py-3 text-center font-black text-slate-950 transition hover:bg-emerald-100"
            >
              {t.more}
            </Link>
            <a
              href={`https://www.amelandaudiotours.nl/${language}`}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-black text-white transition hover:bg-white/20"
            >
              {t.home}
            </a>
          </footer>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-500 print:text-slate-600">
          <Compass className="h-4 w-4" /> Ameland Audiotours
        </p>
      </section>
    </main>
  )
}
