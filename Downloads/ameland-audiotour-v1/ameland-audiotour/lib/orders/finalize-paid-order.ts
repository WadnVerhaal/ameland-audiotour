import { createServerSupabase } from '@/lib/supabase/server'
import { sendAccessEmail } from '@/lib/mail/send-access-email'

type FinalizePaidOrderInput = {
  orderId: string
  paymentReference?: string
  language?: string | null
  source?: 'webhook' | 'success-page' | 'manual'
}

type AppLanguage = 'nl' | 'en' | 'de'

function normalizeLanguage(value?: string | null): AppLanguage {
  return value === 'en' || value === 'de' ? value : 'nl'
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
  language: requestedLanguage,
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

  let token: string | undefined
  let createdNewToken = false

  const { data: existingToken, error: tokenReadError } = await supabase
    .from('access_tokens')
    .select('id, token')
    .eq('order_id', cleanOrderId)
    .maybeSingle()

  if (tokenReadError) {
    console.error(`[${source}] Access token lookup failed:`, tokenReadError)
    return { ok: false, emailSent: false, error: 'Token lookup failed' }
  }

  token = existingToken?.token as string | undefined

  if (!token) {
    const newToken = crypto.randomUUID()

    const { data: insertedToken, error: insertError } = await supabase
      .from('access_tokens')
      .insert({
        order_id: cleanOrderId,
        token: newToken,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      })
      .select('token')
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        console.log(`[${source}] Access token already created by another request, reading existing token`)

        const { data: retryToken, error: retryReadError } = await supabase
          .from('access_tokens')
          .select('token')
          .eq('order_id', cleanOrderId)
          .maybeSingle()

        if (retryReadError || !retryToken?.token) {
          console.error(`[${source}] Access token retry lookup failed:`, retryReadError)
          return { ok: false, emailSent: false, error: 'Token retry lookup failed' }
        }

        token = retryToken.token
      } else {
        console.error(`[${source}] Access token insert failed:`, insertError)
        return { ok: false, emailSent: false, error: 'Token creation failed' }
      }
    } else {
      token = insertedToken?.token || newToken
      createdNewToken = true
    }
  } else {
    console.log(`[${source}] Existing access token found; skipping duplicate access email`)
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl'
  ).replace(/\/$/, '')

  const language = normalizeLanguage(requestedLanguage)
  const accessUrl = `${appUrl}/player/${token}?lang=${language}`

  // The token insert is the idempotency boundary for the booking email. Both
  // Mollie's webhook and the success page can finalize the same paid order.
  // Only the request that created the token may send the automatic email.
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
      language,
      orderId: cleanOrderId,
    })

    console.log(`[${source}] Access email sent`, {
      orderId: cleanOrderId,
      createdNewToken,
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
