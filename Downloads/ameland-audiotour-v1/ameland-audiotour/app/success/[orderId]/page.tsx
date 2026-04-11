import Link from 'next/link'
import { CheckCircle2, Headphones, MapPinned, ArrowLeft } from 'lucide-react'
import { getAccessTokenByOrderId } from '@/lib/data/access'
import { translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ orderId: string }>
}

export default async function SuccessPage({ params }: Props) {
  const { orderId } = await params
  const token = await getAccessTokenByOrderId(orderId)

  const language = await getServerLanguage()
  const t = translations[language]

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      {!token ? (
        <meta httpEquiv="refresh" content="2" />
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="h-28 bg-[linear-gradient(90deg,#ece0b2_0%,#dde8e0_100%)]" />

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            {t.successBadge}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-app-accent">{t.successTitle}</h1>

          <p className="mt-4 text-sm leading-8 text-app-muted">
            {token
              ? t.successText
              : language === 'en'
                ? 'Your payment has been received. We are preparing your personal tour now. This usually only takes a few seconds.'
                : language === 'de'
                  ? 'Deine Zahlung wurde empfangen. Wir bereiten jetzt deine persönliche Tour vor. Das dauert normalerweise nur ein paar Sekunden.'
                  : 'Je betaling is ontvangen. We maken je persoonlijke tour nu klaar. Dit duurt meestal maar een paar seconden.'}
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <div className="space-y-4 text-sm text-app-muted">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>
              {token
                ? t.successBenefit1
                : language === 'en'
                  ? 'Your order was completed successfully'
                  : language === 'de'
                    ? 'Deine Bestellung wurde erfolgreich abgeschlossen'
                    : 'Je bestelling is succesvol afgerond'}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>
              {token
                ? t.successBenefit2
                : language === 'en'
                  ? 'Your personal tour is now being prepared'
                  : language === 'de'
                    ? 'Deine persönliche Tour wird jetzt vorbereitet'
                    : 'Je persoonlijke tour wordt nu klaargezet'}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>
              {token
                ? t.successBenefit3
                : language === 'en'
                  ? 'This page refreshes automatically. You will continue as soon as your tour is ready.'
                  : language === 'de'
                    ? 'Diese Seite aktualisiert sich automatisch. Du gehst weiter, sobald deine Tour bereit ist.'
                    : 'Deze pagina ververst automatisch. Je gaat verder zodra je tour klaar is.'}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        {token ? (
          <Link
            href={`/access/${token}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
          >
            {t.openMyTourNow}
          </Link>
        ) : (
          <div className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card opacity-90">
            {language === 'en'
              ? 'Preparing your tour...'
              : language === 'de'
                ? 'Deine Tour wird vorbereitet...'
                : 'Je tour wordt klaargemaakt...'}
          </div>
        )}

        <Link
          href="/tours"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-app bg-white px-4 py-4 text-sm font-semibold text-app-accent shadow-card transition hover:bg-app-card"
        >
          {t.viewMoreTours}
        </Link>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center text-sm font-medium text-app-muted transition hover:text-app-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToHome}
        </Link>
      </div>
    </main>
  )
}