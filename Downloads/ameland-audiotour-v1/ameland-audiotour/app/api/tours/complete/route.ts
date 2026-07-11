import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import {
  type AftersalesLanguage,
  scheduleReviewReminderEmail,
  sendCompletionAftersalesEmail,
} from '@/lib/email/send-aftersales'

export const dynamic = 'force-dynamic'

type CompletionPayload = {
  token?: string
  language?: string
  durationSeconds?: number
  stopsCompleted?: number
  stopsTotal?: number
}

function normalizeLanguage(value: unknown): AftersalesLanguage {
  return value === 'en' || value === 'de' ? value : 'nl'
}

function safeInteger(value: unknown, minimum = 0, maximum = 86400) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.min(maximum, Math.max(minimum, Math.round(parsed)))
}

function localizedTitle(
  tour: Record<string, unknown>,
  language: AftersalesLanguage
) {
  const candidates =
    language === 'en'
      ? [tour.title_en, tour.title_nl, tour.title]
      : language === 'de'
      ? [tour.title_de, tour.title_nl, tour.title]
      : [tour.title_nl, tour.title, tour.title_en, tour.title_de]

  return (
    candidates.find((value) => typeof value === 'string' && value.trim()) ||
    'Ameland Audiotour'
  ) as string
}

async function claimMessage(input: {
  orderId: string
  completionId: string
  messageType: 'completion' | 'review_reminder'
  scheduledFor?: string | null
}) {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('aftersales_messages')
    .insert({
      order_id: input.orderId,
      completion_id: input.completionId,
      message_type: input.messageType,
      status: 'processing',
      scheduled_for: input.scheduledFor ?? null,
      attempts: 1,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error?.code === '23505') return null
  if (error || !data) throw new Error(`Aftersales claim failed: ${error?.message || 'unknown'}`)

  return data.id as string
}

async function finishMessage(
  id: string,
  input: {
    status: 'sent' | 'scheduled' | 'failed'
    providerId?: string | null
    scheduledFor?: string | null
    error?: string | null
  }
) {
  const supabase = createServerSupabase()
  await supabase
    .from('aftersales_messages')
    .update({
      status: input.status,
      provider_id: input.providerId ?? null,
      scheduled_for: input.scheduledFor ?? null,
      sent_at: input.status === 'sent' ? new Date().toISOString() : null,
      last_error: input.error?.slice(0, 1000) ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CompletionPayload
    const token = String(payload.token || '').trim()

    if (!token) {
      return NextResponse.json({ ok: false, error: 'missing-token' }, { status: 400 })
    }

    const language = normalizeLanguage(payload.language)
    const durationSeconds = safeInteger(payload.durationSeconds)
    const stopsCompleted = safeInteger(payload.stopsCompleted, 0, 250)
    const stopsTotal = safeInteger(payload.stopsTotal, 0, 250)
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
      .select('id, email, tour_id, payment_status')
      .eq('id', access.order_id)
      .maybeSingle()

    if (orderError || !order || order.payment_status !== 'paid') {
      return NextResponse.json({ ok: false, error: 'unpaid-order' }, { status: 403 })
    }

    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, slug, title, title_nl, title_en, title_de')
      .eq('id', order.tour_id)
      .maybeSingle()

    if (tourError || !tour) {
      return NextResponse.json({ ok: false, error: 'tour-not-found' }, { status: 404 })
    }

    const completionPayload = {
      tour_id: tour.id,
      tour_slug: tour.slug || String(tour.id),
      order_id: order.id,
      access_token_id: access.id,
      email: order.email,
      language,
      duration_seconds: durationSeconds,
      stops_total: stopsTotal,
      stops_completed: stopsCompleted,
      completed_at: new Date().toISOString(),
    }

    const { data: existingCompletion } = await supabase
      .from('tour_completions')
      .select('id')
      .eq('order_id', order.id)
      .maybeSingle()

    let completionId = existingCompletion?.id as string | undefined

    if (completionId) {
      await supabase.from('tour_completions').update(completionPayload).eq('id', completionId)
    } else {
      const { data: insertedCompletion, error: completionError } = await supabase
        .from('tour_completions')
        .insert(completionPayload)
        .select('id')
        .single()

      if (completionError || !insertedCompletion) {
        if (completionError?.code === '23505') {
          const { data: concurrentCompletion } = await supabase
            .from('tour_completions')
            .select('id')
            .eq('order_id', order.id)
            .single()
          completionId = concurrentCompletion?.id
        } else {
          throw new Error(`Completion insert failed: ${completionError?.message || 'unknown'}`)
        }
      } else {
        completionId = insertedCompletion.id
      }
    }

    if (!completionId) throw new Error('Completion id missing')

    const { data: existingReviewToken } = await supabase
      .from('review_tokens')
      .select('token, expires_at')
      .eq('order_id', order.id)
      .maybeSingle()

    let reviewToken = existingReviewToken?.token as string | undefined

    if (!reviewToken) {
      const newReviewToken = crypto.randomUUID()
      const { data: insertedReviewToken, error: reviewTokenError } = await supabase
        .from('review_tokens')
        .insert({
          order_id: order.id,
          token: newReviewToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('token')
        .single()

      if (reviewTokenError?.code === '23505') {
        const { data: concurrentReviewToken } = await supabase
          .from('review_tokens')
          .select('token')
          .eq('order_id', order.id)
          .single()
        reviewToken = concurrentReviewToken?.token
      } else if (reviewTokenError || !insertedReviewToken) {
        throw new Error(`Review token failed: ${reviewTokenError?.message || 'unknown'}`)
      } else {
        reviewToken = insertedReviewToken.token
      }
    }

    if (!reviewToken) throw new Error('Review token missing')

    await supabase
      .from('access_tokens')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', access.id)

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl'
    ).replace(/\/$/, '')
    const accessUrl = `${appUrl}/player/${encodeURIComponent(token)}?lang=${language}`
    const reviewUrl = `${appUrl}/review/${encodeURIComponent(reviewToken)}?lang=${language}`
    const tourTitle = localizedTitle(tour as Record<string, unknown>, language)
    const reminderAt = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()

    const completionMessageId = await claimMessage({
      orderId: order.id,
      completionId,
      messageType: 'completion',
    })

    if (completionMessageId) {
      try {
        const providerId = await sendCompletionAftersalesEmail({
          to: order.email,
          language,
          tourTitle,
          accessUrl,
          reviewUrl,
          orderId: order.id,
        })
        await finishMessage(completionMessageId, { status: 'sent', providerId })
      } catch (error) {
        await finishMessage(completionMessageId, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    const reminderMessageId = await claimMessage({
      orderId: order.id,
      completionId,
      messageType: 'review_reminder',
      scheduledFor: reminderAt,
    })

    if (reminderMessageId) {
      try {
        const providerId = await scheduleReviewReminderEmail({
          to: order.email,
          language,
          tourTitle,
          accessUrl,
          reviewUrl,
          orderId: order.id,
          scheduledAt: reminderAt,
        })
        await finishMessage(reminderMessageId, {
          status: 'scheduled',
          providerId,
          scheduledFor: reminderAt,
        })
      } catch (error) {
        await finishMessage(reminderMessageId, {
          status: 'failed',
          scheduledFor: reminderAt,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json({
      ok: true,
      completionId,
      reviewUrl,
    })
  } catch (error) {
    console.error('[tour-complete] Failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ ok: false, error: 'completion-failed' }, { status: 500 })
  }
}
