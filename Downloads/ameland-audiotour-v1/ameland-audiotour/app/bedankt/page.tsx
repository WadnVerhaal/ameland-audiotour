import { Award, CheckCircle2, Compass, Headphones, Mail, MapPin, Sparkles, Star } from 'lucide-react'
import ShareAchievement from '@/components/bedankt/ShareAchievement'

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
    title: 'Jij bent nu een Hollum Ontdekker',
    subtitle: 'Negen verhalen, één dorp en een flinke dosis eilandgevoel. Mooi dat je Hollum met ons hebt beleefd.',
    saved: 'Je voortgang is opgeslagen en je bedankmail is onderweg.',
    badge: 'Hollum Ontdekker',
    badgeText: 'Je hebt de volledige route afgerond en alle verhalen van deze tour ontdekt.',
    reviewTitle: 'Hoe was je ervaring?',
    reviewText: 'Met een korte beoordeling help je ons de tour verder verbeteren én help je andere bezoekers een goede keuze maken.',
    reviewButton: 'Geef je beoordeling',
    nextTitle: 'Ameland is nog lang niet uitgepraat',
    nextText: 'De volgende verhalen wachten in Nes, Ballum en Buren. Iedere tour krijgt een eigen route, sfeer en verzameling eilandverhalen.',
    nextButton: 'Bekijk de volgende tours',
    reward: 'Beloning na de wandeling',
    rewardText: 'Loop rustig terug richting het dorp en trakteer jezelf op een welverdiend ijsje bij De Fretpot.',
    emailTitle: 'Kijk ook in je e-mail',
    emailText: 'Je ontvangt een bedankmail met je reviewlink en de mogelijkheid om de tour nog eens terug te luisteren.',
    supportTitle: 'Was iets niet duidelijk?',
    supportText: 'Stuur ons direct een bericht. We lossen problemen graag persoonlijk op.',
    supportButton: 'Mail ons',
    home: 'Naar de website',
  },
  en: {
    eyebrow: 'Tour completed',
    title: 'You are now a Hollum Explorer',
    subtitle: 'Nine stories, one village and a generous dose of island atmosphere. Thank you for discovering Hollum with us.',
    saved: 'Your progress has been saved and your follow-up email is on its way.',
    badge: 'Hollum Explorer',
    badgeText: 'You completed the full route and discovered every story in this tour.',
    reviewTitle: 'How was your experience?',
    reviewText: 'A short review helps us improve the tour and helps other visitors make a good choice.',
    reviewButton: 'Leave a review',
    nextTitle: 'Ameland still has many stories to tell',
    nextText: 'More stories await in Nes, Ballum and Buren, each with its own route, atmosphere and island history.',
    nextButton: 'View the next tours',
    reward: 'A reward after your walk',
    rewardText: 'Take an easy walk back towards the village and treat yourself to a well-earned ice cream at De Fretpot.',
    emailTitle: 'Check your email too',
    emailText: 'You will receive a thank-you email with your review link and the option to listen again.',
    supportTitle: 'Was anything unclear?',
    supportText: 'Send us a message. We prefer to solve problems personally.',
    supportButton: 'Email us',
    home: 'Go to the website',
  },
  de: {
    eyebrow: 'Tour abgeschlossen',
    title: 'Du bist jetzt Hollum-Entdecker',
    subtitle: 'Neun Geschichten, ein Dorf und jede Menge Inselgefühl. Schön, dass du Hollum mit uns entdeckt hast.',
    saved: 'Dein Fortschritt wurde gespeichert und deine Dankesmail ist unterwegs.',
    badge: 'Hollum-Entdecker',
    badgeText: 'Du hast die gesamte Route abgeschlossen und alle Geschichten dieser Tour entdeckt.',
    reviewTitle: 'Wie war dein Erlebnis?',
    reviewText: 'Eine kurze Bewertung hilft uns, die Tour weiter zu verbessern, und unterstützt andere Besucher bei ihrer Wahl.',
    reviewButton: 'Bewertung abgeben',
    nextTitle: 'Ameland hat noch viele Geschichten zu erzählen',
    nextText: 'Weitere Geschichten warten in Nes, Ballum und Buren – jeweils mit eigener Route, Atmosphäre und Inselgeschichte.',
    nextButton: 'Weitere Touren ansehen',
    reward: 'Belohnung nach der Wanderung',
    rewardText: 'Spaziere entspannt zurück ins Dorf und gönn dir ein wohlverdientes Eis bei De Fretpot.',
    emailTitle: 'Schau auch in deine E-Mails',
    emailText: 'Du erhältst eine Dankesmail mit deinem Bewertungslink und der Möglichkeit, noch einmal zuzuhören.',
    supportTitle: 'War etwas unklar?',
    supportText: 'Schreib uns direkt. Wir lösen Probleme gern persönlich.',
    supportButton: 'E-Mail senden',
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,.16),transparent_38%)]" />
      <section className="relative mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur">
          <header className="relative overflow-hidden bg-[linear-gradient(145deg,rgba(15,23,42,.97),rgba(2,6,23,.96))] p-6 sm:p-10">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> {t.eyebrow}
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-.05em] sm:text-6xl">{t.title}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t.subtitle}</p>
                {params.completed === '1' ? (
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" /> {t.saved}
                  </p>
                ) : null}
              </div>

              <div className="mx-auto grid h-48 w-48 place-items-center rounded-full border-8 border-white/10 bg-[radial-gradient(circle_at_35%_25%,#fde68a,#f59e0b_45%,#92400e)] text-center shadow-2xl">
                <div>
                  <Award className="mx-auto h-12 w-12 text-slate-950" />
                  <p className="mt-2 text-xs font-black uppercase tracking-[.18em] text-slate-900">Ameland</p>
                  <p className="mt-1 text-xl font-black leading-none text-slate-950">{t.badge}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <article className="rounded-[1.7rem] border border-amber-300/20 bg-amber-300/10 p-5 sm:col-span-2 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-amber-200"><Sparkles className="h-6 w-6" /><span className="text-xs font-black uppercase tracking-[.2em]">Achievement unlocked</span></div>
                  <h2 className="mt-3 text-2xl font-black">{t.badge}</h2>
                  <p className="mt-2 text-sm leading-6 text-amber-50/80">{t.badgeText}</p>
                </div>
                <ShareAchievement language={language} />
              </div>
            </article>

            <article className="rounded-[1.7rem] border border-white/10 bg-slate-950/55 p-5 sm:col-span-2">
              <Star className="h-7 w-7 text-emerald-300" fill="currentColor" />
              <h2 className="mt-4 text-2xl font-black">{t.reviewTitle}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{t.reviewText}</p>
              <a
                href={reviewToken ? `/review/${encodeURIComponent(reviewToken)}?lang=${language}` : 'mailto:info@amelandaudiotours.nl?subject=Ervaring%20Ameland%20Audiotours'}
                className="mt-5 inline-flex rounded-full bg-emerald-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
              >
                {t.reviewButton}
              </a>
            </article>

            <article className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(145deg,rgba(14,116,144,.28),rgba(15,23,42,.65))] p-5 sm:col-span-2 sm:p-6">
              <Compass className="h-7 w-7 text-sky-300" />
              <h2 className="mt-4 text-2xl font-black">{t.nextTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{t.nextText}</p>
              <a href={`/tours?lang=${language}`} className="mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-100">
                {t.nextButton}
              </a>
            </article>

            <article className="rounded-[1.7rem] border border-white/10 bg-slate-950/55 p-5">
              <MapPin className="h-6 w-6 text-amber-300" />
              <h2 className="mt-4 text-lg font-black">{t.reward}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t.rewardText}</p>
            </article>

            <article className="rounded-[1.7rem] border border-white/10 bg-slate-950/55 p-5">
              <Mail className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-4 text-lg font-black">{t.emailTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t.emailText}</p>
            </article>

            <article className="rounded-[1.7rem] border border-white/10 bg-slate-950/55 p-5 sm:col-span-2">
              <Headphones className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-4 text-lg font-black">{t.supportTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t.supportText}</p>
              <a href="mailto:info@amelandaudiotours.nl" className="mt-4 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20">
                {t.supportButton}
              </a>
            </article>
          </div>

          <footer className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:p-6">
            <a href={`/tours?lang=${language}`} className="flex-1 rounded-2xl bg-white px-5 py-3 text-center font-black text-slate-950 transition hover:bg-emerald-100">
              {t.nextButton}
            </a>
            <a href={`https://www.amelandaudiotours.nl/${language}`} className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center font-black text-white transition hover:bg-white/20">
              {t.home}
            </a>
          </footer>
        </div>
      </section>
    </main>
  )
}
