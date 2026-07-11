import Link from 'next/link'
import { ArrowLeft, Headphones, Mail, MapPinned, ShieldCheck } from 'lucide-react'
import { getTourBySlug } from '@/lib/data/tours'
import { startCheckout } from './actions'
import { CheckoutSubmitButton } from '@/components/checkout/checkout-submit-button'
import { getServerLanguage } from '@/lib/app-language-server'

type AppLanguage = 'nl' | 'en' | 'de'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

const checkoutText = {
  nl: {
    backToRoutes: 'Terug naar routes',
    notFoundTitle: 'Tour niet gevonden',
    notFoundText: 'Deze tour is niet beschikbaar of is tijdelijk offline gehaald.',
    fallbackTitle: 'Ameland audiotour',
    label: 'Audiotour Ameland',
    price: 'Prijs',
    duration: 'Duur',
    route: 'Route',
    flexible: 'Flexibel',
    onLocation: 'Op locatie',
    howItWorksTitle: 'Hoe werkt het?',
    howItWorksText:
      'Na betaling ontvang je toegang tot de tour. Open de tour op je telefoon, geef locatie-toegang en luister onderweg naar de verhalen van Ameland.',
    checkoutTitle: 'Afrekenen',
    checkoutIntro:
      'Vul je e-mailadres in. Daarna sturen we je veilig door naar Mollie.',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'jouw@email.nl',
    pay: 'Betalen',
    waiting: 'Even wachten…',
    securePayment: 'Je betaling wordt veilig verwerkt via Mollie.',
    directAccess: 'Na betaling kun je direct verder naar je tourtoegang.',
    total: 'Totaal',
  },

  en: {
    backToRoutes: 'Back to routes',
    notFoundTitle: 'Tour not found',
    notFoundText: 'This tour is not available or has temporarily been taken offline.',
    fallbackTitle: 'Ameland audio tour',
    label: 'Ameland audio tour',
    price: 'Price',
    duration: 'Duration',
    route: 'Route',
    flexible: 'Flexible',
    onLocation: 'On location',
    howItWorksTitle: 'How does it work?',
    howItWorksText:
      'After payment, you will receive access to the tour. Open the tour on your phone, allow location access and listen to Ameland stories along the way.',
    checkoutTitle: 'Checkout',
    checkoutIntro:
      'Enter your email address. We will then safely redirect you to Mollie.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    pay: 'Pay',
    waiting: 'Please wait…',
    securePayment: 'Your payment is securely processed via Mollie.',
    directAccess: 'After payment, you can continue directly to your tour access.',
    total: 'Total',
  },

  de: {
    backToRoutes: 'Zurück zu den Routen',
    notFoundTitle: 'Tour nicht gefunden',
    notFoundText: 'Diese Tour ist nicht verfügbar oder wurde vorübergehend offline genommen.',
    fallbackTitle: 'Ameland-Audiotour',
    label: 'Ameland-Audiotour',
    price: 'Preis',
    duration: 'Dauer',
    route: 'Route',
    flexible: 'Flexibel',
    onLocation: 'Vor Ort',
    howItWorksTitle: 'Wie funktioniert es?',
    howItWorksText:
      'Nach der Zahlung erhältst du Zugang zur Tour. Öffne die Tour auf deinem Handy, erlaube den Standortzugriff und höre unterwegs die Geschichten von Ameland.',
    checkoutTitle: 'Kasse',
    checkoutIntro:
      'Gib deine E-Mail-Adresse ein. Danach leiten wir dich sicher zu Mollie weiter.',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'name@beispiel.de',
    pay: 'Bezahlen',
    waiting: 'Bitte warten…',
    securePayment: 'Deine Zahlung wird sicher über Mollie verarbeitet.',
    directAccess: 'Nach der Zahlung kannst du direkt zu deinem Tourzugang weitergehen.',
    total: 'Gesamt',
  },
} as const

function normalizeLanguage(value: string | undefined | null): AppLanguage | null {
  if (value === 'en' || value === 'de' || value === 'nl') {
    return value
  }

  return null
}

function formatPrice(amountCents: number | null | undefined, language: AppLanguage) {
  const amount = typeof amountCents === 'number' ? amountCents / 100 : 0

  const locale =
    language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'nl-NL'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function getLocalizedValue(
  item: Record<string, unknown>,
  baseKey: string,
  lang: AppLanguage,
) {
  const localizedKey = `${baseKey}_${lang}`
  const localizedValue = item[localizedKey]
  const fallbackValue = item[baseKey]
  const fallbackNlValue = item[`${baseKey}_nl`]

  if (typeof localizedValue === 'string' && localizedValue.trim()) {
    return localizedValue
  }

  if (typeof fallbackNlValue === 'string' && fallbackNlValue.trim()) {
    return fallbackNlValue
  }

  if (typeof fallbackValue === 'string' && fallbackValue.trim()) {
    return fallbackValue
  }

  return ''
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const rawLang = Array.isArray(resolvedSearchParams.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams.lang

  const serverLanguage = await getServerLanguage()
  const lang = normalizeLanguage(rawLang) ?? normalizeLanguage(serverLanguage) ?? 'nl'
  const t = checkoutText[lang]

  const tour = await getTourBySlug(slug)

  if (!tour || !tour.is_active) {
    return (
      <main className="min-h-screen bg-[#eef8f5] px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <Link
            href={`/tours?lang=${lang}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToRoutes}
          </Link>

          <h1 className="text-2xl font-bold">{t.notFoundTitle}</h1>
          <p className="mt-3 text-slate-600">{t.notFoundText}</p>
        </div>
      </main>
    )
  }

  const tourRecord = tour as unknown as Record<string, unknown>
  const title = getLocalizedValue(tourRecord, 'title', lang) || t.fallbackTitle
  const subtitle = getLocalizedValue(tourRecord, 'subtitle', lang)
  const description = getLocalizedValue(tourRecord, 'description', lang)

  const priceCents =
    typeof tourRecord.price_cents === 'number' ? tourRecord.price_cents : 0

  const duration =
    typeof tourRecord.duration_minutes === 'number'
      ? `${tourRecord.duration_minutes} min`
      : typeof tourRecord.duration === 'string'
        ? tourRecord.duration
        : null

  const distance =
    typeof tourRecord.distance_km === 'number'
      ? `${tourRecord.distance_km} km`
      : typeof tourRecord.distance === 'string'
        ? tourRecord.distance
        : null

  async function checkoutAction(formData: FormData) {
    'use server'
    await startCheckout(slug, formData)
  }

  return (
    <main className="min-h-screen bg-[#eef8f5] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/tours?lang=${lang}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToRoutes}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Headphones className="h-4 w-4" />
              {t.label}
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-3 text-lg text-slate-600">{subtitle}</p>
            ) : null}

            {description ? (
              <p className="mt-5 leading-7 text-slate-700">{description}</p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t.price}
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatPrice(priceCents, lang)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t.duration}
                </p>
                <p className="mt-1 text-lg font-bold">{duration ?? t.flexible}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t.route}
                </p>
                <p className="mt-1 text-lg font-bold">{distance ?? t.onLocation}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <MapPinned className="mt-1 h-5 w-5 shrink-0 text-emerald-800" />
                <div>
                  <h2 className="font-semibold text-emerald-950">
                    {t.howItWorksTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    {t.howItWorksText}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold">{t.checkoutTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t.checkoutIntro}
            </p>

            <form action={checkoutAction} className="mt-6 space-y-5">
              <input type="hidden" name="lang" value={lang} />

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  {t.emailLabel}
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <CheckoutSubmitButton idleLabel={t.pay} loadingLabel={t.waiting} />
            </form>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />
                <p>{t.securePayment}</p>
              </div>

              <div className="flex gap-3">
                <Headphones className="h-5 w-5 shrink-0 text-emerald-700" />
                <p>{t.directAccess}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">{t.total}</span>
                <span className="text-xl font-bold">
                  {formatPrice(priceCents, lang)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
