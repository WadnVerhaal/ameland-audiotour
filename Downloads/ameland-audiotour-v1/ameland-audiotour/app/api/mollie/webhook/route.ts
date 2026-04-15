import { NextRequest, NextResponse } from 'next/server'
import { mollie } from '@/lib/mollie/client'
import { createServerSupabase } from '@/lib/supabase/server'
import { sendAccessEmail } from '@/lib/mail/send-access-email'

function mapPaymentStatus(status: string) {
  if (status === 'paid') return 'paid'
  if (status === 'failed') return 'failed'
  if (status === 'expired') return 'expired'
  if (status === 'canceled') return 'failed'
  return 'pending'
}

export async function POST(req: NextRequest) {
  try {
    console.log('Mollie webhook ontvangen')

    const formData = await req.formData()
    const paymentId = String(formData.get('id') || '').trim()

    if (!paymentId) {
      console.error('Webhook fout: payment id ontbreekt')
      return NextResponse.json({ ok: false, error: 'Missing payment id' }, { status: 400 })
    }

    console.log('Webhook paymentId:', paymentId)

    const payment = await mollie().payments.get(paymentId)
    const metadata = payment.metadata as { orderId?: string } | undefined
    const orderId = String(metadata?.orderId || '').trim()

    if (!orderId) {
      console.error('Webhook fout: order id ontbreekt in metadata')
      return NextResponse.json({ ok: false, error: 'Missing order id' }, { status: 400 })
    }

    console.log('Webhook orderId:', orderId)

    const supabase = createServerSupabase()
    const paymentStatus = mapPaymentStatus(payment.status)

    console.log('Webhook payment status:', payment.status, '=>', paymentStatus)

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

    if (paymentStatus !== 'paid') {
      console.log('Betaling nog niet betaald, geen token/mail nodig')
      return NextResponse.json({ ok: true })
    }

    const { data: existingToken, error: tokenReadError } = await supabase
      .from('access_tokens')
      .select('id, token')
      .eq('order_id', orderId)
      .maybeSingle()

    if (tokenReadError) {
      console.error('Webhook token lookup failed:', tokenReadError)
      return NextResponse.json({ ok: false, error: 'Token lookup failed' }, { status: 500 })
    }

    let token = existingToken?.token
    const shouldSendEmail = !existingToken

    if (!token) {
      token = crypto.randomUUID()

      const { error: insertError } = await supabase
        .from('access_tokens')
        .insert({
  order_id: orderId,
  token,
  expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
})

      if (insertError) {
        console.error('Webhook token insert failed:', insertError)
        return NextResponse.json({ ok: false, error: 'Token creation failed' }, { status: 500 })
      }

      console.log('Nieuw access token aangemaakt voor order:', orderId)
    } else {
      console.log('Bestaand access token gevonden voor order:', orderId)
    }

    if (!shouldSendEmail) {
      console.log('Mail al eerder voorbereid via bestaand token, mail niet opnieuw verstuurd')
      return NextResponse.json({ ok: true })
    }

    const { data: order, error: orderReadError } = await supabase
      .from('orders')
      .select('id, email, tour_id')
      .eq('id', orderId)
      .single()

    if (orderReadError || !order) {
      console.error('Webhook order read failed:', orderReadError)
      return NextResponse.json({ ok: false, error: 'Order read failed' }, { status: 500 })
    }

    const { data: tour, error: tourReadError } = await supabase
      .from('tours')
      .select('title')
      .eq('id', order.tour_id)
      .single()

    if (tourReadError) {
      console.error('Webhook tour read failed:', tourReadError)
      return NextResponse.json({ ok: false, error: 'Tour read failed' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!appUrl) {
      console.error('Webhook fout: NEXT_PUBLIC_APP_URL ontbreekt')
      return NextResponse.json({ ok: false, error: 'Missing NEXT_PUBLIC_APP_URL' }, { status: 500 })
    }

    const accessUrl = `${appUrl}/access/${token}`

    console.log('Mail wordt verstuurd naar:', order.email)
    console.log('Access URL:', accessUrl)

    try {
      const emailResult = await sendAccessEmail({
        to: order.email,
        tourTitle: tour?.title ?? 'Ameland Audiotour',
        accessUrl,
      })

      console.log('Access mail verzonden:', JSON.stringify(emailResult))
    } catch (emailError) {
      console.error('Access mail verzenden mislukt:', emailError)
      return NextResponse.json({ ok: false, error: 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mollie webhook failed:', error)
    return NextResponse.json({ ok: false, error: 'Webhook failed' }, { status: 500 })
  }
}