import { createServerSupabase } from '@/lib/supabase/server'
import { sendAccessEmail } from '@/lib/mail/send-access-email'

type FinalizePaidOrderInput = {
  orderId: string
  paymentReference?: string
  source?: 'webhook' | 'success-page' | 'manual'
}

type FinalizePaidOrderResult = {
  ok: boolean
  token?: string
  accessUrl?: string
  emailSent: boolean
  error?: string
}

export async function finalizePaidOrder({
  orderId,
  paymentReference,
  source = 'manual',
}: FinalizePaidOrderInput): Promise<FinalizePaidOrderResult> {
  const cleanOrderId = String(orderId || '').trim()

  if (!cleanOrderId) {
    return { ok: false, emailSent: false, error: 'Missing order id' }
  }

  const supabase = createServerSupabase()

  const updatePayload: Record<string, string> = {
    payment_status: 'paid',
  }

  if (paymentReference) {
    updatePayload.payment_reference = paymentReference
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', cleanOrderId)

  if (updateError) {
    console.error(`[${source}] Order paid update failed:`, updateError)
    return { ok: false, emailSent: false, error: 'Order update failed' }
  }

  const { data: existingToken, error: tokenReadError } = await supabase
    .from('access_tokens')
    .select('id, token')
    .eq('order_id', cleanOrderId)
    .maybeSingle()

  if (tokenReadError) {
    console.error(`[${source}] Access token lookup failed:`, tokenReadError)
    return { ok: false, emailSent: false, error: 'Token lookup failed' }
  }

  let token = existingToken?.token as string | undefined
  let createdNewToken = false

  if (!token) {
    token = crypto.randomUUID()
    createdNewToken = true

    const { error: insertError } = await supabase
      .from('access_tokens')
      .insert({
        order_id: cleanOrderId,
        token,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      })

    if (insertError) {
      console.error(`[${source}] Access token insert failed:`, insertError)
      return { ok: false, emailSent: false, error: 'Token creation failed' }
    }
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl'
  ).replace(/\/$/, '')

  const accessUrl = `${appUrl}/access/${token}`

  if (!createdNewToken) {
    return { ok: true, token, accessUrl, emailSent: false }
  }

  const { data: order, error: orderReadError } = await supabase
    .from('orders')
    .select('id, email, tour_id')
    .eq('id', cleanOrderId)
    .single()

  if (orderReadError || !order) {
    console.error(`[${source}] Order read failed:`, orderReadError)
    return {
      ok: true,
      token,
      accessUrl,
      emailSent: false,
      error: 'Order read failed after token creation',
    }
  }

  const { data: tour, error: tourReadError } = await supabase
    .from('tours')
    .select('title')
    .eq('id', order.tour_id)
    .single()

  if (tourReadError) {
    console.error(`[${source}] Tour read failed:`, tourReadError)
  }

  try {
    await sendAccessEmail({
      to: order.email,
      tourTitle: tour?.title ?? 'Ameland Audiotour',
      accessUrl,
    })

    return { ok: true, token, accessUrl, emailSent: true }
  } catch (emailError) {
    console.error(`[${source}] Access email send failed:`, emailError)
    return {
      ok: true,
      token,
      accessUrl,
      emailSent: false,
      error: 'Email send failed, but access token was created',
    }
  }
}
