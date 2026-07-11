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

type ResolvedTourAccess = {
  status?: string
  access_token_id?: string
  expires_at?: string | null
  order?: any
  tour?: any
  stops?: any[]
}

export async function getTourByAccessToken(token: string): Promise<AccessLookupResult> {
  const cleanToken = String(token || '').trim()
  if (!cleanToken) return { status: 'invalid' }

  const supabase = createServerSupabase()
  const { data, error } = await supabase.rpc('resolve_tour_access', {
    p_token: cleanToken,
  })

  if (error || !data) {
    if (error) {
      console.error('[tour-access] Secure resolver failed', {
        code: error.code || null,
        message: error.message,
      })
    }
    return { status: 'invalid' }
  }

  const resolved = data as ResolvedTourAccess
  if (resolved.status === 'expired') return { status: 'expired' }
  if (
    resolved.status !== 'ok' ||
    !resolved.order ||
    !resolved.tour ||
    !Array.isArray(resolved.stops) ||
    resolved.stops.length === 0 ||
    !resolved.access_token_id
  ) {
    return { status: 'invalid' }
  }

  return {
    status: 'ok',
    order: resolved.order,
    tour: resolved.tour,
    stops: resolved.stops,
    expiresAt: resolved.expires_at ?? null,
    accessTokenId: resolved.access_token_id,
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
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (tokenError || !tokenRow) return null
  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) return null
  return tokenRow.token
}
