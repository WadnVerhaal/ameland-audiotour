import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Clock3,
  Headphones,
  Mail,
  MapPinned,
  ShieldCheck,
} from 'lucide-react'
import { getTourBySlug } from '@/lib/data/tours'
import { startCheckout } from './actions'
import { CheckoutSubmitButton } from '@/components/checkout/checkout-submit-button'
import { getServerLanguage } from '@/lib/app-language-server'

type AppLanguage = 'nl' | 'en' | 'de'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

const COPY = {
  nl: {
    back: 'Terug naar tours',
    notFoundTitle: 'Tour niet gevonden',
    notFoundText: 'Deze tour is op dit moment niet beschikbaar.',
    fallbackTitle: 'Audiotour Ameland',
    summary: 'Je bestelling',
    included: 'Je ontvangt',
    features: ['Alle 9 verhalen en de volledige route', 'Direct een persoonlijke startlink', '48 uur toegang op je eigen telefoon'],
    checkout: 'Afrekenen',
    intro: 'We sturen de startlink naar dit e-mailadres.',
    email: 'E-mailadres',
    placeholder: 'jouw@email.nl',
    help: 'Controleer het adres voordat je verdergaat.',
    total: 'Totaal',
    pay: 'Naar veilig betalen',
    waiting: 'Betaling wordt gestart…',
    after: 'Na betaling verschijnt je startlink direct en ontvang je hem ook per e-mail.',
    secure: 'Betaling wordt beveiligd verwerkt door Mollie.',
    agreement: 'Door verder te gaan ga je akkoord met onze',
    terms: 'voorwaarden',
    privacy: 'privacyverklaring',
    and: 'en',
  },
  en: {
    back: 'Back to tours',
    notFoundTitle: 'Tour not found',
    notFoundText: 'This tour is currently unavailable.',
    fallbackTitle: 'Ameland audio tour',
    summary: 'Your order',
    included: 'You receive',
    features: ['All 9 stories and the complete route', 'An immediate personal start link', '48-hour access on your own phone'],
    checkout: 'Checkout',
    intro: 'We send the start link to this email address.',
    email: 'Email address',
    placeholder: 'name@example.com',
    help: 'Check the address before continuing.',
    total: 'Total',
    pay: 'Continue to secure payment',
    waiting: 'Starting payment…',
    after: 'After payment, your start link appears immediately and is also sent by email.',
    secure: 'Payment is processed securely by Mollie.',
    agreement: 'By continuing, you agree to our',
    terms: 'terms',
    privacy: 'privacy policy',
    and: 'and',
  },
  de: {
    back: 'Zurück zu den Touren',
    notFoundTitle: 'Tour nicht gefunden',
    notFoundText: 'Diese Tour ist derzeit nicht verfügbar.',
    fallbackTitle: 'Ameland-Audiotour',
    summary: 'Deine Bestellung',
    included: 'Du erhältst',
    features: ['Alle 9 Geschichten und die vollständige Route', 'Sofort einen persönlichen Startlink', '48 Stunden Zugang auf deinem Handy'],
    checkout: 'Bezahlen',
    intro: 'Wir senden den Startlink an diese E-Mail-Adresse.',
    email: 'E-Mail-Adresse',
    placeholder: 'name@beispiel.de',
    help: 'Prüfe die Adresse, bevor du fortfährst.',
    total: 'Gesamt',
    pay: 'Weiter zur sicheren Zahlung',
    waiting: 'Zahlung wird gestartet…',
    after: 'Nach der Zahlung erscheint dein Startlink sofort und wird zusätzlich per E-Mail gesendet.',
    secure: 'Die Zahlung wird sicher über Mollie verarbeitet.',
    agreement: 'Mit dem Fortfahren akzeptierst du unsere',
    terms: 'Bedingungen',
    privacy: 'Datenschutzerklärung',
    and: 'und',
  },
} as const

function normalizeLanguage(value: string | undefined | null): AppLanguage | null {
  return value === 'en' || value === 'de' || value === 'nl' ? value : null
}

function formatPrice(amountCents: number | null | undefined, language: AppLanguage) {
  const amount = typeof amountCents === 'number' ? amountCents / 100 : 0
  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'nl-NL'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount)
}

function getLocalizedValue(item: Record<string, unknown>, baseKey: string, lang: AppLanguage) {
  const values = [item[`${baseKey}_${lang}`], item[`${baseKey}_nl`], item[baseKey]]
  return values.find((value) => typeof value === 'string' && value.trim()) as string | undefined || ''
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const rawLang = Array.isArray(resolvedSearchParams.lang) ? resolvedSearchParams.lang[0] : resolvedSearchParams.lang
  const serverLanguage = await getServerLanguage()
  const lang = normalizeLanguage(rawLang) ?? normalizeLanguage(serverLanguage) ?? 'nl'
  const t = COPY[lang]
  const tour = await getTourBySlug(slug)

  if (!tour || !tour.is_active) {
    return (
      <main className="min-h-screen bg-[#f1eadf] px-4 py-12 text-[#20372f]">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#ddd2c2] bg-[#fffdf8] p-8">
          <Link href={`/tours?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-black text-[#0f5d67]"><ArrowLeft className="h-4 w-4" /> {t.back}</Link>
          <h1 className="mt-8 text-3xl font-black">{t.notFoundTitle}</h1>
          <p className="mt-3 text-[#667067]">{t.notFoundText}</p>
        </div>
      </main>
    )
  }

  const record = tour as unknown as Record<string, unknown>
  const title = getLocalizedValue(record, 'title', lang) || t.fallbackTitle
  const description = getLocalizedValue(record, 'description', lang)
  const image = typeof record.hero_image_url === 'string' ? record.hero_image_url : ''
  const priceCents = typeof record.price_cents === 'number' ? record.price_cents : 0
  const price = formatPrice(priceCents, lang)
  const duration = typeof record.duration_minutes === 'number' ? `${record.duration_minutes} min` : '90 min'
  const distance = typeof record.distance_km === 'number' ? `${String(record.distance_km).replace('.', ',')} km` : '6,5 km'

  async function checkoutAction(formData: FormData) {
    'use server'
    await startCheckout(slug, formData)
  }

  return (
    <main className="min-h-screen bg-[#f1eadf] px-4 pb-16 pt-8 text-[#20372f] sm:px-8 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <Link href={`/tours?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-black text-[#0f5d67] transition hover:gap-3">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Link>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
          <section className="overflow-hidden rounded-[2.2rem] border border-[#ddd2c2] bg-[#fffdf8] shadow-[0_22px_60px_rgba(38,48,40,.08)]">
            {image ? (
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src={image} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <p className="absolute bottom-5 left-5 text-xs font-black uppercase tracking-[.2em] text-emerald-200 sm:bottom-7 sm:left-7">{t.summary}</p>
              </div>
            ) : null}

            <div className="p-6 sm:p-8">
              <h1 className="text-4xl font-black leading-[.95] tracking-[-.045em] sm:text-5xl">{title}</h1>
              {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667067] sm:text-base">{description}</p> : null}

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efe7] px-3 py-2 text-xs font-black text-[#315848]"><Clock3 className="h-4 w-4" /> {duration}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efe7] px-3 py-2 text-xs font-black text-[#315848]"><MapPinned className="h-4 w-4" /> {distance}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efe7] px-3 py-2 text-xs font-black text-[#315848]"><Headphones className="h-4 w-4" /> 9 stops</span>
              </div>

              <div className="mt-8 border-t border-[#e8dfd2] pt-6">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#7a8875]">{t.included}</p>
                <div className="mt-4 space-y-3">
                  {t.features.map((feature) => (
                    <p key={feature} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#dcebe1] text-[#0f5d67]"><Check className="h-3.5 w-3.5" /></span>
                      {feature}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[2.2rem] border border-[#d6e2dc] bg-white p-6 shadow-[0_24px_70px_rgba(38,48,40,.12)] sm:p-8 lg:sticky lg:top-6">
            <h2 className="text-3xl font-black tracking-[-.035em]">{t.checkout}</h2>
            <p className="mt-2 text-sm leading-6 text-[#667067]">{t.intro}</p>

            <div className="mt-7 flex items-end justify-between border-b border-[#e7ece9] pb-5">
              <span className="text-sm font-bold text-[#667067]">{t.total}</span>
              <span className="text-3xl font-black tracking-tight">{price}</span>
            </div>

            <form action={checkoutAction} className="mt-6 space-y-5">
              <input type="hidden" name="lang" value={lang} />
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-black">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8981]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="email"
                    placeholder={t.placeholder}
                    className="w-full rounded-2xl border border-[#cfd9d4] bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-[#0f5d67] focus:ring-4 focus:ring-[#dcebea]"
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[#7a857e]">{t.help}</p>
              </div>

              <CheckoutSubmitButton idleLabel={t.pay} loadingLabel={t.waiting} />
            </form>

            <p className="mt-5 rounded-2xl bg-[#edf5f1] p-4 text-sm font-bold leading-6 text-[#315848]">{t.after}</p>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#6c7770]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f5d67]" /> {t.secure}</p>

            <p className="mt-6 text-center text-xs leading-5 text-[#7a857e]">
              {t.agreement}{' '}
              <Link href="/voorwaarden" className="font-bold underline underline-offset-2">{t.terms}</Link>{' '}
              {t.and}{' '}
              <Link href="/privacy" className="font-bold underline underline-offset-2">{t.privacy}</Link>.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
