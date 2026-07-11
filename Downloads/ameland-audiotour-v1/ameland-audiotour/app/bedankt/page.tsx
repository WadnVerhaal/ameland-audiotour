import { CheckCircle2, Headphones, Mail, Star } from 'lucide-react'

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
    title: 'Bedankt voor het luisteren',
    subtitle: 'Je audiotour is afgerond. Mooi dat je Hollum op deze manier hebt ontdekt.',
    saved: 'Je afronding is opgeslagen en de nazorgmail is onderweg.',
    reviewTitle: 'Hoe was je ervaring?',
    reviewText: 'Een korte beoordeling helpt ons de tour beter te maken en helpt andere bezoekers kiezen.',
    reviewButton: 'Geef je beoordeling',
    emailTitle: 'Kijk ook in je e-mail',
    emailText: 'Je ontvangt een bedankmail met je reviewlink en de mogelijkheid om nog eens terug te luisteren.',
    supportTitle: 'Was iets niet duidelijk?',
    supportText: 'Stuur ons direct een bericht. We lossen problemen graag persoonlijk op.',
    supportButton: 'Mail ons',
    tours: 'Bekijk meer tours',
    home: 'Naar de website',
  },
  en: {
    title: 'Thanks for listening',
    subtitle: 'Your audio tour is complete. We hope you enjoyed discovering Hollum this way.',
    saved: 'Your completion has been saved and the follow-up email is on its way.',
    reviewTitle: 'How was your experience?',
    reviewText: 'A short review helps us improve the tour and helps other visitors choose.',
    reviewButton: 'Leave a review',
    emailTitle: 'Check your email too',
    emailText: 'You will receive a thank-you email with your review link and the option to listen again.',
    supportTitle: 'Was anything unclear?',
    supportText: 'Send us a message. We prefer to solve problems personally.',
    supportButton: 'Email us',
    tours: 'View more tours',
    home: 'Go to the website',
  },
  de: {
    title: 'Danke fürs Zuhören',
    subtitle: 'Deine Audiotour ist beendet. Schön, dass du Hollum auf diese Weise entdeckt hast.',
    saved: 'Dein Abschluss wurde gespeichert und die Nachfass-E-Mail ist unterwegs.',
    reviewTitle: 'Wie war deine Erfahrung?',
    reviewText: 'Eine kurze Bewertung hilft uns, die Tour zu verbessern, und hilft anderen Besuchern bei der Auswahl.',
    reviewButton: 'Bewertung abgeben',
    emailTitle: 'Schau auch in deine E-Mails',
    emailText: 'Du erhältst eine Dankesmail mit deinem Bewertungslink und der Möglichkeit, noch einmal zuzuhören.',
    supportTitle: 'War etwas unklar?',
    supportText: 'Schreib uns direkt. Wir lösen Probleme gern persönlich.',
    supportButton: 'E-Mail senden',
    tours: 'Weitere Touren ansehen',
    home: 'Zur Website',
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
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.14),transparent_38%)]" />
      <section className="relative mx-auto flex min-h-[90dvh] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur">
          <header className="bg-[linear-gradient(145deg,rgba(15,23,42,.96),rgba(2,6,23,.96))] p-6 sm:p-9">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-300 text-slate-950">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[.26em] text-emerald-300">Ameland Audiotours</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{t.subtitle}</p>
            {params.completed === '1' ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
                <CheckCircle2 className="h-4 w-4" /> {t.saved}
              </p>
            ) : null}
          </header>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
            <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5 sm:col-span-2">
              <Star className="h-7 w-7 text-emerald-300" fill="currentColor" />
              <h2 className="mt-4 text-xl font-black">{t.reviewTitle}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{t.reviewText}</p>
              {reviewToken ? (
                <a
                  href={`/review/${encodeURIComponent(reviewToken)}?lang=${language}`}
                  className="mt-5 inline-flex rounded-full bg-emerald-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
                >
                  {t.reviewButton}
                </a>
              ) : (
                <a
                  href="mailto:info@amelandaudiotours.nl?subject=Ervaring%20Ameland%20Audiotours"
                  className="mt-5 inline-flex rounded-full bg-emerald-300 px-6 py-3 text-sm font-black text-slate-950"
                >
                  {t.reviewButton}
                </a>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
              <Mail className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-4 text-lg font-black">{t.emailTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t.emailText}</p>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
              <Headphones className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-4 text-lg font-black">{t.supportTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t.supportText}</p>
              <a
                href="mailto:info@amelandaudiotours.nl"
                className="mt-4 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                {t.supportButton}
              </a>
            </article>
          </div>

          <footer className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:p-6">
            <a
              href={`/tours?lang=${language}`}
              className="flex-1 rounded-2xl bg-white px-5 py-3 text-center font-black text-slate-950 transition hover:bg-emerald-100"
            >
              {t.tours}
            </a>
            <a
              href={`https://www.amelandaudiotours.nl/${language}`}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-black text-white transition hover:bg-white/20"
            >
              {t.home}
            </a>
          </footer>
        </div>
      </section>
    </main>
  )
}
