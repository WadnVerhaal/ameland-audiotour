import { createServerSupabase } from '@/lib/supabase/server'

export type AccessLookupResult =
  | {
      status: 'ok'
      order: any
      tour: any
      stops: any[]
      expiresAt: string | null
      accessTokenId: string
    }
  | {
      status: 'expired'
    }
  | {
      status: 'invalid'
    }

export async function getTourByAccessToken(token: string): Promise<AccessLookupResult> {
  const cleanToken = String(token || '').trim()
  if (!cleanToken) return { status: 'invalid' }

  const supabase = createServerSupabase()
  const { data: tokenRow, error: tokenError } = await supabase
    .from('access_tokens')
    .select('id, order_id, token, expires_at')
    .eq('token', cleanToken)
    .maybeSingle()

  if (tokenError || !tokenRow) return { status: 'invalid' }
  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return { status: 'expired' }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, tour_id, payment_status, email')
    .eq('id', tokenRow.order_id)
    .maybeSingle()

  if (orderError || !order || order.payment_status !== 'paid') {
    return { status: 'invalid' }
  }

  const [{ data: tour, error: tourError }, { data: stops, error: stopsError }] =
    await Promise.all([
      supabase.from('tours').select('*').eq('id', order.tour_id).maybeSingle(),
      supabase
        .from('tour_stops')
        .select('*')
        .eq('tour_id', order.tour_id)
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
    ])

  if (tourError || !tour || stopsError || !stops?.length) {
    return { status: 'invalid' }
  }

  await supabase
    .from('access_tokens')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', tokenRow.id)

  return {
    status: 'ok',
    order,
    tour,
    stops,
    expiresAt: tokenRow.expires_at,
    accessTokenId: tokenRow.id,
  }
}

export async function getAccessTokenByOrderId(orderId: string) {
  const supabase = createServerSupabase()
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order || order.payment_status !== 'paid') return null

  const { data: tokenRow, error: tokenError } = await supabase
    .from('access_tokens')
    .select('token, expires_at')
    .eq('order_id', orderId)
    .maybeSingle()

  if (tokenError || !tokenRow) return null
  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) return null
  return tokenRow.token
}
