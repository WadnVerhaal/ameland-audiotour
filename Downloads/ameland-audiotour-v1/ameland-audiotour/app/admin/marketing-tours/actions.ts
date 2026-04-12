'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'

type Locale = 'nl' | 'en' | 'de'

function parsePoints(value: FormDataEntryValue | null) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function updateMarketingTourAction(formData: FormData) {
  const supabase = createServerSupabase()

  const slug = String(formData.get('slug') || '').trim()
  if (!slug) {
    throw new Error('Slug ontbreekt.')
  }

  const imageUrl = String(formData.get('image_url') || '').trim()
  const featured = String(formData.get('featured') || '') === 'true'
  const available = String(formData.get('available') || '') === 'true'
  const sortOrder = Number(formData.get('sort_order') || 0)

  const { error: marketingError } = await supabase
    .from('tour_marketing')
    .upsert({
      slug,
      image_url: imageUrl,
      featured,
      available,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })

  if (marketingError) {
    throw marketingError
  }

  const locales: Locale[] = ['nl', 'en', 'de']

  for (const locale of locales) {
    const title = String(formData.get(`title_${locale}`) || '').trim()
    const badge = String(formData.get(`badge_${locale}`) || '').trim()
    const durationLabel = String(formData.get(`duration_label_${locale}`) || '').trim()
    const cta = String(formData.get(`cta_${locale}`) || '').trim()
    const points = parsePoints(formData.get(`points_${locale}`))

    const { error: translationError } = await supabase
      .from('tour_marketing_translations')
      .upsert({
        tour_slug: slug,
        locale,
        title,
        badge,
        duration_label: durationLabel,
        cta,
        points,
        updated_at: new Date().toISOString(),
      })

    if (translationError) {
      throw translationError
    }
  }

  revalidatePath('/admin/marketing-tours')
  revalidatePath('/tours')
}