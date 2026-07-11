import Link from 'next/link'
import { CheckCircle2, Heart, MessageCircle, Star } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/server'
import { submitReview } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Language = 'nl' | 'en' | 'de'

type PageProps = {
  params: Promise<{ token: string }>
  searchParams: Promise<{ lang?: string | string[]; sent?: string | string[] }>
}

const copy = {
  nl: {
    eyebrow: 'Ameland Audiotours',
    title: 'Hoe was je ervaring?',
    intro: 'Met jouw beoordeling maken we de route beter en help je andere bezoekers kiezen.',
    rating: 'Jouw score',
    ratingHelp: 'Kies één tot vijf sterren.',
    comment: 'Wil je iets toelichten?',
    commentPlaceholder: 'Wat vond je mooi en wat kunnen we verbeteren?',
    submit: 'Beoordeling versturen',
    privacy: 'Je beoordeling wordt alleen gekoppeld aan deze tour. Je e-mailadres wordt niet openbaar gemaakt.',
    sentTitle: 'Dank je wel voor je reactie',
    sentText: 'Je beoordeling is opgeslagen. We lezen iedere reactie en gebruiken die om de tour verder te verbeteren.',
    tours: 'Bekijk meer tours',
    invalidTitle: 'Deze reviewlink werkt niet',
    invalidText: 'De link is ongeldig of verlopen. Je kunt ons altijd rechtstreeks mailen met je ervaring.',
    contact: 'Mail ons',
    already: 'Je hebt al gereageerd. Je kunt je beoordeling hieronder nog aanpassen.',
  },
  en: {
    eyebrow: 'Ameland Audiotours',
    title: 'How was your experience?',
    intro: 'Your review helps us improve the route and helps other visitors choose.',
    rating: 'Your score',
    ratingHelp: 'Choose one to five stars.',
    comment: 'Would you like to add anything?',
    commentPlaceholder: 'What did you enjoy and what could we improve?',
    submit: 'Submit review',
    privacy: 'Your review is linked only to this tour. Your email address will not be made public.',
    sentTitle: 'Thank you for your feedback',
    sentText: 'Your review has been saved. We read every response and use it to improve the tour.',
    tours: 'View more tours',
    invalidTitle: 'This review link does not work',
    invalidText: 'The link is invalid or expired. You can always email us directly with your experience.',
    contact: 'Email us',
    already: 'You have already responded. You can still update your review below.',
  },
  de: {
    eyebrow: 'Ameland Audiotours',
    title: 'Wie war deine Erfahrung?',
    intro: 'Deine Bewertung hilft uns, die Route zu verbessern, und hilft anderen Besuchern bei der Auswahl.',
    rating: 'Deine Bewertung',
    ratingHelp: 'Wähle einen bis fünf Sterne.',
    comment: 'Möchtest du etwas ergänzen?',
    commentPlaceholder: 'Was hat dir gefallen und was können wir verbessern?',
    submit: 'Bewertung absenden',
    privacy: 'Deine Bewertung wird nur dieser Tour zugeordnet. Deine E-Mail-Adresse wird nicht veröffentlicht.',
    sentTitle: 'Vielen Dank für deine Rückmeldung',
    sentText: 'Deine Bewertung wurde gespeichert. Wir lesen jede Rückmeldung und verbessern damit die Tour.',
    tours: 'Weitere Touren ansehen',
    invalidTitle: 'Dieser Bewertungslink funktioniert nicht',
    invalidText: 'Der Link ist ungültig oder abgelaufen. Du kannst uns deine Erfahrung jederzeit per E-Mail senden.',
    contact: 'E-Mail senden',
    already: 'Du hast bereits geantwortet. Du kannst deine Bewertung unten noch anpassen.',
  },
} as const

function normalizeLanguage(value: unknown): Language {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'en' || raw === 'de' ? raw : 'nl'
}

function localizedTitle(tour: Record<string, unknown> | null, language: Language) {
  if (!tour) return 'Ameland Audiotour'
  const candidates =
    language === 'en'
      ? [tour.title_en, tour.title_nl, tour.title]
      : language === 'de'
      ? [tour.title_de, tour.title_nl, tour.title]
      : [tour.title_nl, tour.title, tour.title_en, tour.title_de]
  return (
    candidates.find((value) => typeof value === 'string' && value.trim()) ||
    'Ameland Audiotour'
  ) as string
}

function MessageCard({ title, text, language }: { title: string; text: string; language: Language }) {
  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto flex min-h-[82dvh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-300 text-slate-950">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-300">{text}</p>
          <Link
            href={`/tours?lang=${language}`}
            className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950 transition hover:bg-emerald-100"
          >
            {copy[language].tours}
          </Link>
        </div>
      </section>
    </main>
  )
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const query = await searchParams
  const language = normalizeLanguage(query.lang)
  const t = copy[language]
  const sent = (Array.isArray(query.sent) ? query.sent[0] : query.sent) === '1'

  if (sent) return <MessageCard title={t.sentTitle} text={t.sentText} language={language} />

  const supabase = createServerSupabase()
  const { data: reviewToken } = await supabase
    .from('review_tokens')
    .select('order_id, expires_at, used_at')
    .eq('token', token)
    .maybeSingle()

  if (!reviewToken || new Date(reviewToken.expires_at).getTime() < Date.now()) {
    return (
      <main className="min-h-[100dvh] bg-slate-950 px-4 py-8 text-white">
        <section className="mx-auto flex min-h-[82dvh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 text-center shadow-2xl">
            <MessageCircle className="mx-auto h-12 w-12 text-amber-300" />
            <h1 className="mt-5 text-3xl font-black">{t.invalidTitle}</h1>
            <p className="mt-3 leading-7 text-slate-300">{t.invalidText}</p>
            <a
              href="mailto:info@amelandaudiotours.nl"
              className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950"
            >
              {t.contact}
            </a>
          </div>
        </section>
      </main>
    )
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, tour_id, payment_status')
    .eq('id', reviewToken.order_id)
    .maybeSingle()

  if (!order || order.payment_status !== 'paid') {
    return <MessageCard title={t.invalidTitle} text={t.invalidText} language={language} />
  }

  const [{ data: tour }, { data: existingReview }] = await Promise.all([
    supabase
      .from('tours')
      .select('title, title_nl, title_en, title_de')
      .eq('id', order.tour_id)
      .maybeSingle(),
    supabase
      .from('reviews')
      .select('rating, review_text')
      .eq('order_id', order.id)
      .maybeSingle(),
  ])

  const tourTitle = localizedTitle(tour as Record<string, unknown> | null, language)

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.12),transparent_36%)]" />
      <section className="relative mx-auto max-w-xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur">
          <header className="bg-[linear-gradient(145deg,rgba(15,23,42,.96),rgba(2,6,23,.96))] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.24em] text-emerald-300">{t.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">{t.title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-300">{t.intro}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
              <Heart className="h-4 w-4 text-emerald-300" />
              {tourTitle}
            </div>
          </header>

          <form action={submitReview.bind(null, token, language)} className="space-y-6 p-5 sm:p-7">
            {reviewToken.used_at || existingReview ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                {t.already}
              </p>
            ) : null}

            <fieldset>
              <legend className="text-lg font-black">{t.rating}</legend>
              <p className="mt-1 text-sm text-slate-400">{t.ratingHelp}</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label
                    key={rating}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center transition hover:border-emerald-300/50 hover:bg-emerald-300/10 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-300 has-[:checked]:text-slate-950"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      required
                      defaultChecked={existingReview?.rating === rating}
                      className="sr-only"
                    />
                    <Star className="mx-auto h-6 w-6" fill="currentColor" />
                    <span className="mt-1 block text-xs font-black">{rating}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-lg font-black">{t.comment}</span>
              <textarea
                name="review_text"
                maxLength={3000}
                defaultValue={existingReview?.review_text ?? ''}
                placeholder={t.commentPlaceholder}
                className="mt-3 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300"
              />
            </label>

            <button className="w-full rounded-2xl bg-emerald-300 px-5 py-4 text-base font-black text-slate-950 shadow-xl transition hover:bg-emerald-200">
              {t.submit}
            </button>
            <p className="text-center text-xs leading-5 text-slate-500">{t.privacy}</p>
          </form>
        </div>
      </section>
    </main>
  )
}
