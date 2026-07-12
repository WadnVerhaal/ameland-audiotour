import Image from 'next/image'
import Link from 'next/link'
import { Award, CheckCircle2, MapPinned, Star } from 'lucide-react'
import CompletionActions from '@/components/thanks/CompletionActions'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams?: Promise<{ lang?: string; completed?: string; review?: string }>
}

type Language = 'nl' | 'en' | 'de'

const COPY = {
  nl: {
    label: 'Tour voltooid',
    title: 'Mooi gedaan.',
    subtitle: 'Je hebt alle negen verhalen van Maak kennis met Hollum voltooid.',
    saved: 'Je afronding is opgeslagen. De bevestiging is onderweg naar je e-mail.',
    badge: 'Hollum Explorer',
    badgeText: '9 verhalen ontdekt',
    reviewTitle: 'Vertel ons hoe het was',
    reviewText: 'Met een korte beoordeling help je ons de tour verder te verbeteren.',
    reviewButton: 'Geef je beoordeling',
    nextTitle: 'Nog meer Ameland ontdekken',
    nextText: 'Nieuwe audiotours voor Nes, Ballum en Buren zijn in voorbereiding.',
    nextTours: [['Nes', 'Dorpsverhalen'], ['Ballum', 'Bestuur en historie'], ['Buren', 'Duinen en boerenleven']],
    tours: 'Bekijk alle tours',
    home: 'Naar de website',
    shareTitle: 'Ik heb Hollum ontdekt met Ameland Audiotours',
    shareText: 'Ik voltooide de audiotour Maak kennis met Hollum.',
  },
  en: {
    label: 'Tour complete',
    title: 'Well done.',
    subtitle: 'You completed all nine stories in Discover Hollum.',
    saved: 'Your completion has been saved. A confirmation is on its way by email.',
    badge: 'Hollum Explorer',
    badgeText: '9 stories discovered',
    reviewTitle: 'Tell us how it went',
    reviewText: 'A short review helps us continue improving the tour.',
    reviewButton: 'Leave a review',
    nextTitle: 'Discover more of Ameland',
    nextText: 'New audio tours for Nes, Ballum and Buren are in development.',
    nextTours: [['Nes', 'Village stories'], ['Ballum', 'Government and history'], ['Buren', 'Dunes and farm life']],
    tours: 'View all tours',
    home: 'Go to the website',
    shareTitle: 'I discovered Hollum with Ameland Audiotours',
    shareText: 'I completed the Discover Hollum audio tour.',
  },
  de: {
    label: 'Tour abgeschlossen',
    title: 'Sehr schön.',
    subtitle: 'Du hast alle neun Geschichten von Entdecke Hollum abgeschlossen.',
    saved: 'Dein Abschluss wurde gespeichert. Eine Bestätigung ist per E-Mail unterwegs.',
    badge: 'Hollum Explorer',
    badgeText: '9 Geschichten entdeckt',
    reviewTitle: 'Erzähl uns, wie es war',
    reviewText: 'Eine kurze Bewertung hilft uns, die Tour weiter zu verbessern.',
    reviewButton: 'Bewertung abgeben',
    nextTitle: 'Noch mehr Ameland entdecken',
    nextText: 'Neue Audiotouren für Nes, Ballum und Buren sind in Vorbereitung.',
    nextTours: [['Nes', 'Dorfgeschichten'], ['Ballum', 'Verwaltung und Geschichte'], ['Buren', 'Dünen und Bauernleben']],
    tours: 'Alle Touren ansehen',
    home: 'Zur Website',
    shareTitle: 'Ich habe Hollum mit Ameland Audiotours entdeckt',
    shareText: 'Ich habe die Audiotour Entdecke Hollum abgeschlossen.',
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
    <main className="min-h-[100dvh] bg-[#0c1718] px-4 py-6 text-white print:bg-white print:text-slate-950 sm:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.17),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,116,144,.12),transparent_38%)] print:hidden" />

      <section className="relative mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] shadow-2xl print:border-slate-200 print:bg-white print:shadow-none">
          <header className="p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <Image src="/images/ameland-audiotours-logo.webp" alt="Ameland Audiotours" width={52} height={52} className="h-12 w-12 rounded-full border border-white/20 object-cover" priority />
              <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300 print:text-emerald-700">{t.label}</p>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">{t.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300 print:text-slate-700">{t.subtitle}</p>
                {params.completed === '1' ? (
                  <p className="mt-5 flex max-w-xl items-start gap-2 text-sm font-bold leading-6 text-emerald-100 print:text-emerald-800">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {t.saved}
                  </p>
                ) : null}
              </div>

              <div className="min-w-56 rounded-[1.6rem] bg-amber-300 p-5 text-slate-950 print:border print:border-amber-300">
                <Award className="h-7 w-7" />
                <p className="mt-4 text-xl font-black">{t.badge}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-slate-700">{t.badgeText}</p>
              </div>
            </div>
          </header>

          <div className="space-y-4 border-t border-white/10 p-4 sm:p-6 print:border-slate-200 print:p-8">
            <CompletionActions language={language} title={t.shareTitle} text={t.shareText} />

            <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
              <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 print:border-slate-200 print:bg-slate-50">
                <Star className="h-6 w-6 text-amber-300" fill="currentColor" />
                <h2 className="mt-4 text-xl font-black">{t.reviewTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">{t.reviewText}</p>
                <a
                  href={reviewToken ? `/review/${encodeURIComponent(reviewToken)}?lang=${language}` : 'mailto:info@amelandaudiotours.nl?subject=Ervaring%20Ameland%20Audiotours'}
                  className="mt-5 inline-flex rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200 print:hidden"
                >
                  {t.reviewButton}
                </a>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 print:border-slate-200 print:bg-slate-50">
                <h2 className="text-xl font-black">{t.nextTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">{t.nextText}</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {t.nextTours.map(([place, description]) => (
                    <div key={place} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 print:border-slate-200 print:bg-white">
                      <MapPinned className="h-5 w-5 text-emerald-300" />
                      <p className="mt-3 font-black">{place}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400 print:text-slate-600">{description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>

          <footer className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:p-6 print:hidden">
            <Link href={`/tours?lang=${language}`} className="flex-1 rounded-2xl bg-white px-5 py-3 text-center font-black text-slate-950 transition hover:bg-emerald-100">{t.tours}</Link>
            <a href={`https://www.amelandaudiotours.nl/${language}`} className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-black text-white transition hover:bg-white/20">{t.home}</a>
          </footer>
        </div>
      </section>
    </main>
  )
}
