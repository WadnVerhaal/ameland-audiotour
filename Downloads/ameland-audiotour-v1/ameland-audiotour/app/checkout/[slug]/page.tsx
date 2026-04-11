import { redirect } from 'next/navigation'
import { Mail, CheckCircle2, CreditCard } from 'lucide-react'
import { getTourBySlug } from '@/lib/data/tours'
import { startCheckout } from './actions'
import { formatEuroFromCents } from '@/lib/utils/money'
import { translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour || !tour.is_active) {
    redirect('/tours')
  }

  const language = await getServerLanguage()
  const t = translations[language]

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="rounded-[2rem] border border-app bg-app-card p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          {t.checkoutLabel}
        </p>

        <h1 className="mt-3 text-3xl font-bold text-app-accent">{t.almostDone}</h1>

        <p className="mt-3 text-sm leading-6 text-app-muted">
          {t.checkoutText}
        </p>

        <div className="mt-5 rounded-[1.75rem] bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-app-accent">{tour.title}</h2>
              <p className="mt-2 text-sm text-app-muted">
                {tour.duration_minutes} min · {tour.distance_km} km
              </p>
            </div>

            <div className="text-right text-3xl font-bold text-app-accent">
              {formatEuroFromCents(tour.price_cents)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[2rem] border border-app bg-app-card p-6 shadow-card">
        <div className="flex items-center gap-2 text-app-accent">
          <Mail className="h-4 w-4" />
          <label htmlFor="email" className="text-sm font-medium">
            {t.emailAddress}
          </label>
        </div>

        <form action={startCheckout.bind(null, slug)} className="mt-4 space-y-5">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t.emailPlaceholder}
            className="w-full rounded-2xl border border-app bg-white px-4 py-3 text-base text-app-accent outline-none placeholder:text-app-muted"
          />

          <div className="rounded-[1.75rem] bg-white p-5 shadow-card">
            <div className="space-y-4 text-sm text-app-muted">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                <span>{t.paymentBenefit1}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                <span>{t.paymentBenefit2}</span>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                <span>{t.paymentBenefit3}</span>
              </div>
            </div>
          </div>

          <button className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95">
            {t.payAndReceiveLink}
          </button>
        </form>
      </section>
    </main>
  )
}