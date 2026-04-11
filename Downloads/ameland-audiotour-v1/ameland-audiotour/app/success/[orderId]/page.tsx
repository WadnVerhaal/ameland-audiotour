import Link from 'next/link'
import Script from 'next/script'
import { redirect } from 'next/navigation'
import { CheckCircle2, Headphones, MapPinned, ArrowLeft, RefreshCw } from 'lucide-react'
import { getAccessTokenByOrderId } from '@/lib/data/access'
import { translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ orderId: string }>
}

const waitingCopy = {
  nl: {
    title: 'Je tour staat klaar',
    text: 'Je betaling is ontvangen. We maken je persoonlijke tour nu klaar. Dit duurt meestal maar een paar seconden.',
    benefit1: 'Je bestelling is succesvol afgerond',
    benefit2: 'Je persoonlijke tour wordt nu klaargezet',
    benefit3: 'Deze pagina ververst automatisch. Gebeurt er niets, probeer dan handmatig opnieuw.',
    retry: 'Opnieuw proberen',
  },
  en: {
    title: 'Your tour is ready',
    text: 'Your payment has been received. We are now preparing your personal tour. This usually only takes a few seconds.',
    benefit1: 'Your order was completed successfully',
    benefit2: 'Your personal tour is now being prepared',
    benefit3: 'This page refreshes automatically. If nothing happens, try again manually.',
    retry: 'Try again',
  },
  de: {
    title: 'Deine Tour ist bereit',
    text: 'Deine Zahlung ist eingegangen. Wir bereiten deine persönliche Tour jetzt vor. Das dauert normalerweise nur ein paar Sekunden.',
    benefit1: 'Deine Bestellung wurde erfolgreich abgeschlossen',
    benefit2: 'Deine persönliche Tour wird jetzt vorbereitet',
    benefit3: 'Diese Seite wird automatisch aktualisiert. Falls nichts passiert, versuche es bitte manuell erneut.',
    retry: 'Erneut versuchen',
  },
} as const

export default async function SuccessPage({ params }: Props) {
  const { orderId } = await params
  const language = await getServerLanguage()
  const t = translations[language]
  const waiting = waitingCopy[language]

  const token = await getAccessTokenByOrderId(orderId)

  if (token) {
    redirect(`/access/${token}`)
  }

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <Script id="success-auto-refresh" strategy="afterInteractive">
        {`
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        `}
      </Script>

      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="h-28 bg-[linear-gradient(90deg,#ece0b2_0%,#dde8e0_100%)]" />

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            {t.successBadge}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-app-accent">
            {waiting.title}
          </h1>

          <p className="mt-4 text-sm leading-8 text-app-muted">
            {waiting.text}
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <div className="space-y-4 text-sm text-app-muted">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{waiting.benefit1}</span>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{waiting.benefit2}</span>
          </div>

          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{waiting.benefit3}</span>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <Link
          href={`/success/${orderId}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {waiting.retry}
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