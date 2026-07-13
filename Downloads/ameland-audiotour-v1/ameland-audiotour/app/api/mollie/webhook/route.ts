import { NextRequest, NextResponse } from 'next/server'
import { mollie } from '@/lib/mollie/client'
import { createServerSupabase } from '@/lib/supabase/server'
import { finalizePaidOrder } from '@/lib/orders/finalize-paid-order'

function mapPaymentStatus(status: string) {
  if (status === 'paid') return 'paid'
  if (status === 'failed') return 'failed'
  if (status === 'expired') return 'expired'
  if (status === 'canceled') return 'failed'
  return 'pending'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const paymentId = String(formData.get('id') || '').trim()

    if (!paymentId) {
      console.error('[mollie-webhook] Missing payment id')
      return NextResponse.json({ received: true, handled: false, reason: 'missing-payment-id' })
    }

    const payment = await mollie().payments.get(paymentId)
    const paymentStatus = mapPaymentStatus(payment.status)

    const metadata = payment.metadata as { orderId?: string; tourId?: string; language?: string } | undefined
    const orderId = String(metadata?.orderId || '').trim()

    if (!orderId) {
      console.error('[mollie-webhook] Missing order id in metadata', {
        paymentId,
        status: payment.status,
      })

      return NextResponse.json({ received: true, handled: false, reason: 'missing-order-id' })
    }

    const supabase = createServerSupabase()

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_reference: paymentId,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[mollie-webhook] Order status update failed:', updateError)
      return NextResponse.json({ received: true, handled: false, reason: 'order-update-failed' })
    }

    if (paymentStatus === 'paid') {
      const finalizeResult = await finalizePaidOrder({
        orderId,
        paymentReference: paymentId,
        language: metadata?.language,
        source: 'webhook',
      })

      if (!finalizeResult.ok) {
        console.error('[mollie-webhook] Finalize paid order failed:', finalizeResult.error)
      }
    }

    return NextResponse.json({
      received: true,
      handled: true,
      status: paymentStatus,
    })
  } catch (error) {
    console.error('[mollie-webhook] Unexpected webhook error:', error)
    return NextResponse.json({
      received: true,
      handled: false,
      reason: 'unexpected-error',
    })
  }
}
