'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import {
  type AftersalesLanguage,
  sendLowRatingAlertEmail,
} from '@/lib/email/send-aftersales'

function normalizeLanguage(value: string): AftersalesLanguage {
  return value === 'en' || value === 'de' ? value : 'nl'
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
  const { data: reviewToken, error: tokenError } = await supabase
    .from('review_tokens')
    .select('id, order_id, expires_at, used_at')
    .eq('token', cleanToken)
    .maybeSingle()

  if (tokenError || !reviewToken) throw new Error('Deze reviewlink is niet geldig.')
  if (new Date(reviewToken.expires_at).getTime() < Date.now()) {
    throw new Error('Deze reviewlink is verlopen.')
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, tour_id, payment_status')
    .eq('id', reviewToken.order_id)
    .maybeSingle()

  if (orderError || !order || order.payment_status !== 'paid') {
    throw new Error('De bestelling bij deze reviewlink kon niet worden gevonden.')
  }

  const { data: tour } = await supabase
    .from('tours')
    .select('title, title_nl, title_en, title_de')
    .eq('id', order.tour_id)
    .maybeSingle()

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', order.id)
    .maybeSingle()

  if (existingReview?.id) {
    const { error } = await supabase
      .from('reviews')
      .update({ rating, review_text: reviewText || null })
      .eq('id', existingReview.id)
    if (error) throw new Error('Het bijwerken van je beoordeling is mislukt.')
  } else {
    const { error } = await supabase.from('reviews').insert({
      tour_id: order.tour_id,
      order_id: order.id,
      rating,
      review_text: reviewText || null,
    })
    if (error) throw new Error('Het opslaan van je beoordeling is mislukt.')
  }

  await supabase
    .from('review_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', reviewToken.id)

  if (rating <= 3) {
    const { data: alertMessage, error: claimError } = await supabase
      .from('aftersales_messages')
      .insert({
        order_id: order.id,
        message_type: 'low_rating_alert',
        status: 'processing',
        attempts: 1,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (!claimError && alertMessage?.id) {
      try {
        const titleCandidates =
          lang === 'en'
            ? [tour?.title_en, tour?.title_nl, tour?.title]
            : lang === 'de'
            ? [tour?.title_de, tour?.title_nl, tour?.title]
            : [tour?.title_nl, tour?.title, tour?.title_en, tour?.title_de]
        const tourTitle =
          titleCandidates.find((value) => typeof value === 'string' && value.trim()) ||
          'Ameland Audiotour'
        const providerId = await sendLowRatingAlertEmail({
          orderId: order.id,
          tourTitle,
          rating,
          feedback: reviewText,
        })

        await supabase
          .from('aftersales_messages')
          .update({
            status: 'sent',
            provider_id: providerId,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', alertMessage.id)
      } catch (error) {
        await supabase
          .from('aftersales_messages')
          .update({
            status: 'failed',
            last_error: (error instanceof Error ? error.message : String(error)).slice(0, 1000),
            updated_at: new Date().toISOString(),
          })
          .eq('id', alertMessage.id)
      }
    }
  }

  redirect(`/review/${encodeURIComponent(cleanToken)}?lang=${lang}&sent=1`)
}
