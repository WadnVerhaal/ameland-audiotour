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

type CompletionResult = {
  status?: string
  completion_id?: string
  review_token?: string
  order_id?: string
  email?: string
  access_expires_at?: string | null
  tour?: Record<string, unknown>
}

function normalizeLanguage(value: unknown): AftersalesLanguage {
  return value === 'en' || value === 'de' ? value : 'nl'
}

function safeInteger(value: unknown, minimum = 0, maximum = 86400) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
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

async function claimMessage(
  token: string,
  messageType: 'completion' | 'review_reminder',
  scheduledFor?: string | null
) {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.rpc('claim_aftersales_message', {
    p_token: token,
    p_message_type: messageType,
    p_scheduled_for: scheduledFor ?? null,
  })

  if (error) {
    throw new Error(`Aftersales claim failed: ${error.message}`)
  }

  return typeof data === 'string' ? data : null
}

async function finishMessage(
  token: string,
  messageType: 'completion' | 'review_reminder',
  input: {
    status: 'sent' | 'scheduled' | 'failed'
    providerId?: string | null
    scheduledFor?: string | null
    error?: string | null
  }
) {
  const supabase = createServerSupabase()
  const { error } = await supabase.rpc('finish_aftersales_message', {
    p_token: token,
    p_message_type: messageType,
    p_status: input.status,
    p_provider_id: input.providerId ?? null,
    p_error: input.error?.slice(0, 1000) ?? null,
    p_scheduled_for: input.scheduledFor ?? null,
  })

  if (error) {
    console.error('[tour-complete] Could not finalize aftersales status', {
      messageType,
      status: input.status,
      message: error.message,
    })
  }
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

    const { data, error } = await supabase.rpc('register_tour_completion', {
      p_token: token,
      p_language: language,
      p_duration_seconds: durationSeconds,
      p_stops_completed: stopsCompleted,
      p_stops_total: stopsTotal,
    })

    if (error) {
      console.error('[tour-complete] Secure registration failed', {
        code: error.code || null,
        message: error.message,
      })
      return NextResponse.json({ ok: false, error: 'completion-failed' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'invalid-token' }, { status: 404 })
    }

    const result = data as CompletionResult
    if (result.status === 'expired') {
      return NextResponse.json({ ok: false, error: 'expired-token' }, { status: 410 })
    }

    if (
      result.status !== 'ok' ||
      !result.completion_id ||
      !result.review_token ||
      !result.order_id ||
      !result.email ||
      !result.tour
    ) {
      return NextResponse.json({ ok: false, error: 'completion-failed' }, { status: 500 })
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl'
    ).replace(/\/$/, '')
    const accessUrl = `${appUrl}/player/${encodeURIComponent(token)}?lang=${language}`
    const reviewUrl = `${appUrl}/review/${encodeURIComponent(result.review_token)}?lang=${language}`
    const tourTitle = localizedTitle(result.tour, language)
    const reminderAt = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()

    const completionMessageId = await claimMessage(token, 'completion')
    if (completionMessageId) {
      try {
        const providerId = await sendCompletionAftersalesEmail({
          to: result.email,
          language,
          tourTitle,
          accessUrl,
          reviewUrl,
          orderId: result.order_id,
        })
        await finishMessage(token, 'completion', { status: 'sent', providerId })
      } catch (sendError) {
        await finishMessage(token, 'completion', {
          status: 'failed',
          error: sendError instanceof Error ? sendError.message : String(sendError),
        })
      }
    }

    const reminderMessageId = await claimMessage(token, 'review_reminder', reminderAt)
    if (reminderMessageId) {
      try {
        const providerId = await scheduleReviewReminderEmail({
          to: result.email,
          language,
          tourTitle,
          accessUrl,
          reviewUrl,
          orderId: result.order_id,
          scheduledAt: reminderAt,
        })
        await finishMessage(token, 'review_reminder', {
          status: 'scheduled',
          providerId,
          scheduledFor: reminderAt,
        })
      } catch (sendError) {
        await finishMessage(token, 'review_reminder', {
          status: 'failed',
          scheduledFor: reminderAt,
          error: sendError instanceof Error ? sendError.message : String(sendError),
        })
      }
    }

    return NextResponse.json({
      ok: true,
      completionId: result.completion_id,
      reviewUrl,
    })
  } catch (error) {
    console.error('[tour-complete] Failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ ok: false, error: 'completion-failed' }, { status: 500 })
  }
}
