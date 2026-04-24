import Link from 'next/link'
import { CheckCircle2, Clock3, Mail, RefreshCw, ShieldCheck } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/server'
import { mollie } from '@/lib/mollie/client'
import { finalizePaidOrder } from '@/lib/orders/finalize-paid-order'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ orderId: string }>
}

function normalizeStatus(status?: string | null) {
  if (status === 'paid') return 'paid'
  if (status === 'failed') return 'failed'
  if (status === 'expired') return 'expired'
  if (status === 'canceled') return 'failed'
  return 'pending'
}

export default async function SuccessPage({ params }: PageProps) {
  const { orderId } = await params
  const cleanOrderId = String(orderId || '').trim()

  const supabase = createServerSupabase()

  let orderStatus = 'pending'
  let token: string | undefined
  let email: string | undefined
  let paymentReference: string | undefined
  let paymentCheckError: string | undefined

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
            const finalizeResult = await finalizePaidOrder({
              orderId: cleanOrderId,
              paymentReference,
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
  const accessHref = token ? `/access/${token}` : undefined

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
          Ameland Audiotour
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          {isPaid ? 'Je betaling is gelukt' : 'We controleren je betaling'}
        </h1>

        {isPaid ? (
          <p className="mt-3 text-sm leading-6 text-app-muted">
            Dank je wel. Je toegang tot de audiotour staat klaar.
            {email ? ` We hebben de toegang ook naar ${email} gestuurd.` : ''}
          </p>
        ) : orderStatus === 'failed' || orderStatus === 'expired' ? (
          <p className="mt-3 text-sm leading-6 text-app-muted">
            De betaling lijkt niet afgerond. Is er wel geld afgeschreven? Neem dan contact op,
            dan maken we je toegang direct in orde.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-app-muted">
            Je betaling is ontvangen of wordt nog door Mollie bevestigd. Dit duurt meestal maar
            een paar seconden. Ververs deze pagina zo nodig één keer.
          </p>
        )}

        <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-card">
          <div className="space-y-4 text-sm text-app-muted">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
              <span>Veilig betaald via Mollie.</span>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
              <span>Je toegang wordt gekoppeld aan je bestelling.</span>
            </div>

            {!isPaid && (
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                <span>Status: {orderStatus}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {accessHref ? (
            <Link
              href={accessHref}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              Start mijn audiotour
            </Link>
          ) : (
            <Link
              href={`/success/${encodeURIComponent(cleanOrderId)}`}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              Controleer opnieuw
            </Link>
          )}

          <Link
            href="/tours"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-app-accent shadow-card transition hover:opacity-95"
          >
            Terug naar tours
          </Link>
        </div>

        {paymentCheckError ? (
          <p className="mt-5 text-xs leading-5 text-app-muted">
            Technische melding: {paymentCheckError}. Je betaling blijft veilig geregistreerd.
          </p>
        ) : null}
      </section>
    </main>
  )
}
