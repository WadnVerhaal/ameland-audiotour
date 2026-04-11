import { NextRequest, NextResponse } from 'next/server'
import { mollie } from '@/lib/mollie/client'
import { createServerSupabase } from '@/lib/supabase/server'

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
      return NextResponse.json({ ok: false, error: 'Missing payment id' }, { status: 400 })
    }

    const payment = await mollie().payments.get(paymentId)
    const metadata = payment.metadata as { orderId?: string } | undefined
    const orderId = String(metadata?.orderId || '').trim()

    if (!orderId) {
      return NextResponse.json({ ok: false, error: 'Missing order id' }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const paymentStatus = mapPaymentStatus(payment.status)

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_reference: paymentId,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Webhook order update failed:', updateError)
      return NextResponse.json({ ok: false, error: 'Order update failed' }, { status: 500 })
    }

    if (paymentStatus === 'paid') {
      const { data: existingToken, error: tokenReadError } = await supabase
        .from('access_tokens')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle()

      if (tokenReadError) {
        console.error('Webhook token lookup failed:', tokenReadError)
        return NextResponse.json({ ok: false, error: 'Token lookup failed' }, { status: 500 })
      }

      if (!existingToken) {
        const token = crypto.randomUUID()

        const { error: insertError } = await supabase
          .from('access_tokens')
          .insert({
            order_id: orderId,
            token,
            expires_at: null,
          })

        if (insertError) {
          console.error('Webhook token insert failed:', insertError)
          return NextResponse.json({ ok: false, error: 'Token creation failed' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mollie webhook failed:', error)
    return NextResponse.json({ ok: false, error: 'Webhook failed' }, { status: 500 })
  }
}