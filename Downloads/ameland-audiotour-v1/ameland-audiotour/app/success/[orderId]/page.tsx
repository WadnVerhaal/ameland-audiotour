import Link from 'next/link'
import { CheckCircle2, Clock3, Mail, RefreshCw, ShieldCheck } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/server'
import { mollie } from '@/lib/mollie/client'
import { finalizePaidOrder } from '@/lib/orders/finalize-paid-order'
import { getServerLanguage } from '@/lib/app-language-server'

export const dynamic = 'force-dynamic'

type AppLanguage = 'nl' | 'en' | 'de'

type PageProps = {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

const successText = {
  nl: {
    label: 'Ameland Audiotour',
    paidTitle: 'Je betaling is gelukt',
    checkingTitle: 'We controleren je betaling',
    paidText: 'Dank je wel. Je toegang tot de audiotour staat klaar.',
    paidEmailText: 'We hebben de toegang ook naar {email} gestuurd.',
    failedText:
      'De betaling lijkt niet afgerond. Is er wel geld afgeschreven? Neem dan contact op, dan maken we je toegang direct in orde.',
    pendingText:
      'Je betaling is ontvangen of wordt nog door Mollie bevestigd. Dit duurt meestal maar een paar seconden. Ververs deze pagina zo nodig één keer.',
    mollieSafe: 'Veilig betaald via Mollie.',
    accessLinked: 'Je toegang wordt gekoppeld aan je bestelling.',
    status: 'Status',
    startTour: 'Start mijn audiotour',
    checkAgain: 'Controleer opnieuw',
    backToTours: 'Terug naar tours',
    technicalNotice: 'Technische melding',
    technicalNoticeSuffix: 'Je betaling blijft veilig geregistreerd.',
  },

  en: {
    label: 'Ameland audio tour',
    paidTitle: 'Your payment was successful',
    checkingTitle: 'We are checking your payment',
    paidText: 'Thank you. Your access to the audio tour is ready.',
    paidEmailText: 'We have also sent the access link to {email}.',
    failedText:
      'The payment does not seem to be completed. If money was deducted, please contact us and we will arrange your access right away.',
    pendingText:
      'Your payment has been received or is still being confirmed by Mollie. This usually only takes a few seconds. Refresh this page once if needed.',
    mollieSafe: 'Securely paid via Mollie.',
    accessLinked: 'Your access is linked to your order.',
    status: 'Status',
    startTour: 'Start my audio tour',
    checkAgain: 'Check again',
    backToTours: 'Back to tours',
    technicalNotice: 'Technical notice',
    technicalNoticeSuffix: 'Your payment remains safely registered.',
  },

  de: {
    label: 'Ameland-Audiotour',
    paidTitle: 'Deine Zahlung war erfolgreich',
    checkingTitle: 'Wir prüfen deine Zahlung',
    paidText: 'Vielen Dank. Dein Zugang zur Audiotour ist bereit.',
    paidEmailText: 'Wir haben den Zugang auch an {email} gesendet.',
    failedText:
      'Die Zahlung scheint nicht abgeschlossen zu sein. Falls Geld abgebucht wurde, kontaktiere uns bitte, dann richten wir deinen Zugang direkt ein.',
    pendingText:
      'Deine Zahlung wurde empfangen oder wird noch von Mollie bestätigt. Das dauert meistens nur ein paar Sekunden. Aktualisiere diese Seite bei Bedarf einmal.',
    mollieSafe: 'Sicher über Mollie bezahlt.',
    accessLinked: 'Dein Zugang wird mit deiner Bestellung verknüpft.',
    status: 'Status',
    startTour: 'Meine Audiotour starten',
    checkAgain: 'Erneut prüfen',
    backToTours: 'Zurück zu den Touren',
    technicalNotice: 'Technische Meldung',
    technicalNoticeSuffix: 'Deine Zahlung bleibt sicher registriert.',
  },
} as const

function normalizeStatus(status?: string | null) {
  if (status === 'paid') return 'paid'
  if (status === 'failed') return 'failed'
  if (status === 'expired') return 'expired'
  if (status === 'canceled') return 'failed'
  return 'pending'
}

function normalizeLanguage(value: string | undefined | null): AppLanguage | null {
  if (value === 'nl' || value === 'en' || value === 'de') {
    return value
  }

  return null
}

function withLanguage(href: string, language: AppLanguage) {
  const separator = href.includes('?') ? '&' : '?'
  return `${href}${separator}lang=${language}`
}

export default async function SuccessPage({ params, searchParams }: PageProps) {
  const { orderId } = await params
  const resolvedSearchParams = await searchParams

  const rawLang = Array.isArray(resolvedSearchParams.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams.lang

  const serverLanguage = await getServerLanguage()
  const lang = normalizeLanguage(rawLang) ?? normalizeLanguage(serverLanguage) ?? 'nl'
  const t = successText[lang]

  const cleanOrderId = String(orderId || '').trim()

  const supabase = createServerSupabase()

  let orderStatus = 'pending'
  let token: string | undefined
  let email: string | undefined
  let paymentReference: string | undefined
  let paymentCheckError: string | undefined
  let finalizedPaidOrder = false

  if (cleanOrderId) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, email, payment_status, payment_reference')
      .eq('id', cleanOrderId)
      .maybeSingle()

    if (orderError) {
      console.error('[success-page] Order lookup failed:', orderError)
      paymentCheckError = 'order-lookup-failed'
    }

    if (order) {
      orderStatus = normalizeStatus(order.payment_status)
      email = order.email
      paymentReference = order.payment_reference || undefined

      if (orderStatus !== 'paid' && paymentReference) {
        try {
          const payment = await mollie().payments.get(paymentReference)
          const mollieStatus = normalizeStatus(payment.status)

          if (mollieStatus === 'paid') {
            finalizedPaidOrder = true
            const finalizeResult = await finalizePaidOrder({
              orderId: cleanOrderId,
              paymentReference,
              language: lang,
              source: 'success-page',
            })

            if (finalizeResult.ok) {
              orderStatus = 'paid'
              token = finalizeResult.token
            } else {
              paymentCheckError = finalizeResult.error
            }
          } else {
            orderStatus = mollieStatus
          }
        } catch (error) {
          console.error('[success-page] Mollie payment check failed:', error)
          paymentCheckError = 'payment-check-failed'
        }
      }

      if (orderStatus === 'paid' && !finalizedPaidOrder) {
        const finalizeResult = await finalizePaidOrder({
          orderId: cleanOrderId,
          paymentReference,
          language: lang,
          source: 'success-page',
        })

        if (finalizeResult.ok) {
          token = finalizeResult.token
        } else {
          paymentCheckError = finalizeResult.error
        }
      }

      if (!token) {
        const { data: existingToken, error: tokenError } = await supabase
          .from('access_tokens')
          .select('token')
          .eq('order_id', cleanOrderId)
          .maybeSingle()

        if (tokenError) {
          console.error('[success-page] Token lookup failed:', tokenError)
        }

        token = existingToken?.token || undefined
      }
    }
  }

  const isPaid = orderStatus === 'paid'
  const playerHref = token ? withLanguage(`/player/${token}`, lang) : undefined
  const retryHref = withLanguage(`/success/${encodeURIComponent(cleanOrderId)}`, lang)
  const toursHref = withLanguage('/tours', lang)

  return (
    <main className="min-h-screen bg-app px-4 py-8 text-app-accent">
      <section className="mx-auto max-w-md rounded-[2rem] border border-app bg-app-card p-6 shadow-soft">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card">
          {isPaid ? (
            <CheckCircle2 className="h-7 w-7 text-green-700" />
          ) : (
            <Clock3 className="h-7 w-7 text-app-accent" />
          )}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          {t.label}
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          {isPaid ? t.paidTitle : t.checkingTitle}
        </h1>

        {isPaid ? (
          <p className="mt-3 text-sm leading-6 text-app-muted">
            {t.paidText}
            {email ? ` ${t.paidEmailText.replace('{email}', email)}` : ''}
          </p>
        ) : orderStatus === 'failed' || orderStatus === 'expired' ? (
          <p className="mt-3 text-sm leading-6 text-app-muted">
            {t.failedText}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-app-muted">
            {t.pendingText}
          </p>
        )}

        <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-card">
          <div className="space-y-4 text-sm text-app-muted">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
              <span>{t.mollieSafe}</span>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
              <span>{t.accessLinked}</span>
            </div>

            {!isPaid && (
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                <span>
                  {t.status}: {orderStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {playerHref ? (
            <Link
              href={playerHref}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              {t.startTour}
            </Link>
          ) : (
            <Link
              href={retryHref}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              {t.checkAgain}
            </Link>
          )}

          <Link
            href={toursHref}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-app-accent shadow-card transition hover:opacity-95"
          >
            {t.backToTours}
          </Link>
        </div>

        {paymentCheckError ? (
          <p className="mt-5 text-xs leading-5 text-app-muted">
            {t.technicalNotice}: {paymentCheckError}. {t.technicalNoticeSuffix}
          </p>
        ) : null}
      </section>
    </main>
  )
}
