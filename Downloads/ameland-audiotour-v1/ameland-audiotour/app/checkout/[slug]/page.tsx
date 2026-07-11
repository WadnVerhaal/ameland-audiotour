import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
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
    howItWorksTitle: 'Na je betaling',
    howItWorksText:
      'Je krijgt direct een persoonlijke link naar kaart, route en alle verhalen. Open die link op je telefoon en sta locatie toe.',
    checkoutTitle: 'Veilig afrekenen',
    checkoutIntro: 'Vul het e-mailadres in waarop je de persoonlijke tourlink wilt ontvangen.',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'jouw@email.nl',
    emailHelp: 'Controleer het adres goed: hier sturen we je toegang naartoe.',
    pay: 'Veilig betalen',
    waiting: 'Je betaling wordt gestart…',
    securePayment: 'Veilig betalen via Mollie.',
    directAccess: 'Direct na betaling toegang op dit scherm én per e-mail.',
    accessWindow: 'Je persoonlijke toegang blijft 48 uur actief.',
    onePayment: 'Eén betaling voor alle 9 verhalen en de volledige route.',
    total: 'Totaal',
    agreement: 'Door verder te gaan ga je akkoord met onze',
    terms: 'voorwaarden',
    privacy: 'privacyverklaring',
    and: 'en',
    support: 'Hulp nodig? Mail info@amelandaudiotours.nl.',
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
    howItWorksTitle: 'After payment',
    howItWorksText:
      'You immediately receive a personal link to the map, route and all stories. Open it on your phone and allow location access.',
    checkoutTitle: 'Secure checkout',
    checkoutIntro: 'Enter the email address where you want to receive your personal tour link.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    emailHelp: 'Check the address carefully: this is where we send your access link.',
    pay: 'Pay securely',
    waiting: 'Starting your payment…',
    securePayment: 'Secure payment through Mollie.',
    directAccess: 'Access immediately after payment, on screen and by email.',
    accessWindow: 'Your personal access remains active for 48 hours.',
    onePayment: 'One payment for all 9 stories and the complete route.',
    total: 'Total',
    agreement: 'By continuing, you agree to our',
    terms: 'terms',
    privacy: 'privacy policy',
    and: 'and',
    support: 'Need help? Email info@amelandaudiotours.nl.',
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
    howItWorksTitle: 'Nach der Zahlung',
    howItWorksText:
      'Du erhältst sofort einen persönlichen Link zur Karte, Route und allen Geschichten. Öffne ihn auf deinem Handy und erlaube den Standortzugriff.',
    checkoutTitle: 'Sicher bezahlen',
    checkoutIntro: 'Gib die E-Mail-Adresse ein, an die wir deinen persönlichen Tourlink senden sollen.',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'name@beispiel.de',
    emailHelp: 'Prüfe die Adresse sorgfältig: Dorthin senden wir deinen Zugang.',
    pay: 'Sicher bezahlen',
    waiting: 'Zahlung wird gestartet…',
    securePayment: 'Sichere Zahlung über Mollie.',
    directAccess: 'Direkter Zugang nach der Zahlung – auf dem Bildschirm und per E-Mail.',
    accessWindow: 'Dein persönlicher Zugang bleibt 48 Stunden aktiv.',
    onePayment: 'Eine Zahlung für alle 9 Geschichten und die vollständige Route.',
    total: 'Gesamt',
    agreement: 'Mit dem Fortfahren akzeptierst du unsere',
    terms: 'Bedingungen',
    privacy: 'Datenschutzerklärung',
    and: 'und',
    support: 'Hilfe nötig? Schreib an info@amelandaudiotours.nl.',
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

function getLocalizedValue(
  item: Record<string, unknown>,
  baseKey: string,
  lang: AppLanguage
) {
  const localizedValue = item[`${baseKey}_${lang}`]
  const fallbackNlValue = item[`${baseKey}_nl`]
  const fallbackValue = item[baseKey]

  if (typeof localizedValue === 'string' && localizedValue.trim()) return localizedValue
  if (typeof fallbackNlValue === 'string' && fallbackNlValue.trim()) return fallbackNlValue
  if (typeof fallbackValue === 'string' && fallbackValue.trim()) return fallbackValue
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
          <Link href={`/tours?lang=${lang}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-800">
            <ArrowLeft className="h-4 w-4" /> {t.backToRoutes}
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
  const priceCents = typeof tourRecord.price_cents === 'number' ? tourRecord.price_cents : 0
  const formattedPrice = formatPrice(priceCents, lang)
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
    <main className="min-h-screen bg-[#eef8f5] px-4 py-6 text-slate-900 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/tours?lang=${lang}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <ArrowLeft className="h-4 w-4" /> {t.backToRoutes}
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Headphones className="h-4 w-4" /> {t.label}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 text-lg text-slate-600">{subtitle}</p> : null}
            {description ? <p className="mt-5 leading-7 text-slate-700">{description}</p> : null}

            <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                [t.price, formattedPrice],
                [t.duration, duration ?? t.flexible],
                [t.route, distance ?? t.onLocation],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
                  <p className="mt-1 text-sm font-bold sm:text-lg">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <MapPinned className="mt-1 h-5 w-5 shrink-0 text-emerald-800" />
                <div>
                  <h2 className="font-semibold text-emerald-950">{t.howItWorksTitle}</h2>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">{t.howItWorksText}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <p className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />{t.onePayment}</p>
              <p className="flex gap-2"><Clock3 className="h-5 w-5 shrink-0 text-emerald-700" />{t.accessWindow}</p>
            </div>
          </section>

          <aside className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-8 lg:sticky lg:top-5 lg:self-start">
            <h2 className="text-2xl font-black">{t.checkoutTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.checkoutIntro}</p>

            <form action={checkoutAction} className="mt-6 space-y-5">
              <input type="hidden" name="lang" value={lang} />
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.emailHelp}</p>
              </div>

              <CheckoutSubmitButton idleLabel={`${t.pay} · ${formattedPrice}`} loadingLabel={t.waiting} />
            </form>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-650">
              <p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />{t.securePayment}</p>
              <p className="flex gap-3"><Headphones className="h-5 w-5 shrink-0 text-emerald-700" />{t.directAccess}</p>
              <p className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-emerald-700" />{t.accessWindow}</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
              <span className="text-sm font-medium text-slate-600">{t.total}</span>
              <span className="text-xl font-black">{formattedPrice}</span>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              {t.agreement}{' '}
              <Link href="/voorwaarden" className="font-semibold underline underline-offset-2">{t.terms}</Link>{' '}
              {t.and}{' '}
              <Link href="/privacy" className="font-semibold underline underline-offset-2">{t.privacy}</Link>.
            </p>
            <p className="mt-3 text-center text-xs text-slate-500">{t.support}</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
