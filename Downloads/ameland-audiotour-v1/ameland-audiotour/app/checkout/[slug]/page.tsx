import Link from 'next/link'
import { ArrowLeft, Headphones, Lock, Mail, MapPinned, ShieldCheck } from 'lucide-react'
import { getTourBySlug } from '@/lib/data/tours'
import { startCheckout } from './actions'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

function formatPrice(amountCents?: number | null) {
  const amount = typeof amountCents === 'number' ? amountCents / 100 : 0

  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function getLocalizedValue(
  item: Record<string, unknown>,
  baseKey: string,
  lang: string,
) {
  const localizedKey = `${baseKey}_${lang}`
  const localizedValue = item[localizedKey]
  const fallbackValue = item[baseKey]

  if (typeof localizedValue === 'string' && localizedValue.trim()) {
    return localizedValue
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

  const lang = rawLang === 'en' || rawLang === 'de' ? rawLang : 'nl'

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
            Terug naar routes
          </Link>

          <h1 className="text-2xl font-bold">Tour niet gevonden</h1>
          <p className="mt-3 text-slate-600">
            Deze tour is niet beschikbaar of is tijdelijk offline gehaald.
          </p>
        </div>
      </main>
    )
  }

  const tourRecord = tour as unknown as Record<string, unknown>
  const title = getLocalizedValue(tourRecord, 'title', lang) || 'Ameland audiotour'
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
          Terug naar routes
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Headphones className="h-4 w-4" />
              Audiotour Ameland
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
                  Prijs
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatPrice(priceCents)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duur
                </p>
                <p className="mt-1 text-lg font-bold">{duration ?? 'Flexibel'}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Route
                </p>
                <p className="mt-1 text-lg font-bold">{distance ?? 'Op locatie'}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <MapPinned className="mt-1 h-5 w-5 shrink-0 text-emerald-800" />
                <div>
                  <h2 className="font-semibold text-emerald-950">
                    Hoe werkt het?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    Na betaling ontvang je toegang tot de tour. Open de tour op je
                    telefoon, geef locatie-toegang en luister onderweg naar de
                    verhalen van Ameland.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold">Afrekenen</h2>
            <p className="mt-2 text-sm text-slate-600">
              Vul je e-mailadres in. Daarna sturen we je veilig door naar Mollie.
            </p>

            <form action={checkoutAction} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  E-mailadres
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="jouw@email.nl"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-emerald-900"
              >
                <Lock className="h-5 w-5" />
                Veilig betalen met Mollie
              </button>
            </form>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />
                <p>Je betaling wordt veilig verwerkt via Mollie.</p>
              </div>

              <div className="flex gap-3">
                <Headphones className="h-5 w-5 shrink-0 text-emerald-700" />
                <p>Na betaling kun je direct verder naar je tourtoegang.</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">Totaal</span>
                <span className="text-xl font-bold">{formatPrice(priceCents)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
