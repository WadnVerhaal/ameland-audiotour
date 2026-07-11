'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import {
  type AftersalesLanguage,
  sendLowRatingAlertEmail,
} from '@/lib/email/send-aftersales'

type ReviewSubmitResult = {
  status?: string
  order_id?: string
  tour?: Record<string, unknown>
}

function normalizeLanguage(value: string): AftersalesLanguage {
  return value === 'en' || value === 'de' ? value : 'nl'
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

async function finishLowRatingAlert(
  reviewToken: string,
  status: 'sent' | 'failed',
  providerId?: string | null,
  error?: string | null
) {
  const supabase = createServerSupabase()
  const { error: finishError } = await supabase.rpc('finish_low_rating_alert', {
    p_review_token: reviewToken,
    p_status: status,
    p_provider_id: providerId ?? null,
    p_error: error?.slice(0, 1000) ?? null,
  })

  if (finishError) {
    console.error('[review] Could not finalize low-rating alert', {
      status,
      message: finishError.message,
    })
  }
}

export async function submitReview(token: string, language: string, formData: FormData) {
  const cleanToken = String(token || '').trim()
  const lang = normalizeLanguage(language)
  const rating = Number(String(formData.get('rating') ?? '').trim())
  const reviewText = String(formData.get('review_text') ?? '').trim().slice(0, 3000)

  if (!cleanToken) throw new Error('Deze reviewlink is niet geldig.')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Geef een geldige score van 1 t/m 5.')
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase.rpc('submit_review_with_token', {
    p_token: cleanToken,
    p_rating: rating,
    p_review_text: reviewText || null,
  })

  if (error) {
    console.error('[review] Secure submission failed', {
      code: error.code || null,
      message: error.message,
    })
    throw new Error('Het opslaan van je beoordeling is mislukt.')
  }

  const result = (data || null) as ReviewSubmitResult | null
  if (!result || result.status !== 'ok' || !result.order_id || !result.tour) {
    throw new Error('Deze reviewlink is niet geldig of is verlopen.')
  }

  if (rating <= 3) {
    const { data: alertMessageId, error: claimError } = await supabase.rpc(
      'claim_low_rating_alert',
      { p_review_token: cleanToken }
    )

    if (claimError) {
      console.error('[review] Could not claim low-rating alert', {
        message: claimError.message,
      })
    } else if (typeof alertMessageId === 'string') {
      try {
        const providerId = await sendLowRatingAlertEmail({
          orderId: result.order_id,
          tourTitle: localizedTitle(result.tour, lang),
          rating,
          feedback: reviewText,
        })
        await finishLowRatingAlert(cleanToken, 'sent', providerId)
      } catch (sendError) {
        await finishLowRatingAlert(
          cleanToken,
          'failed',
          null,
          sendError instanceof Error ? sendError.message : String(sendError)
        )
      }
    }
  }

  redirect(`/review/${encodeURIComponent(cleanToken)}?lang=${lang}&sent=1`)
}
