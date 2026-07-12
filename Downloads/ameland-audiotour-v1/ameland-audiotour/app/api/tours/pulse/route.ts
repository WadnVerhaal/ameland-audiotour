import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Payload = {
  token?: string
  tourId?: string
  rating?: number
  stopIndex?: number
}

function safeInteger(value: unknown, min: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  const rounded = Math.round(parsed)
  return rounded >= min && rounded <= max ? rounded : null
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Payload
    const token = String(payload.token || '').trim()
    const rating = safeInteger(payload.rating, 1, 5)
    const stopIndex = safeInteger(payload.stopIndex, 1, 250)

    if (!token || rating === null) {
      return NextResponse.json({ ok: false, error: 'invalid-payload' }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const { data: access, error: accessError } = await supabase
      .from('access_tokens')
      .select('id, order_id, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (accessError || !access) {
      return NextResponse.json({ ok: false, error: 'invalid-token' }, { status: 404 })
    }

    if (access.expires_at && new Date(access.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: 'expired-token' }, { status: 410 })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('tour_id')
      .eq('id', access.order_id)
      .maybeSingle()

    if (orderError || !order?.tour_id) {
      return NextResponse.json({ ok: false, error: 'invalid-order' }, { status: 404 })
    }

    const { error: insertError } = await supabase.from('analytics_events').insert({
      event_name: 'tour_pulse_rating',
      session_id: access.id,
      tour_id: order.tour_id,
      metadata_json: {
        rating,
        stop_index: stopIndex,
        claimed_tour_id: String(payload.tourId || '').slice(0, 80) || null,
      },
    })

    if (insertError) {
      console.error('[tour-pulse] Insert failed', { message: insertError.message })
      return NextResponse.json({ ok: false, error: 'insert-failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[tour-pulse] Failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ ok: false, error: 'pulse-failed' }, { status: 500 })
  }
}
