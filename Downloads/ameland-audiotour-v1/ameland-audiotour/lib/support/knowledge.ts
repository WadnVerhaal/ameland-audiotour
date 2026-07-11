import type { AppLanguage } from '@/lib/app-language'
import { createServerSupabase } from '@/lib/supabase/server'

export async function getSupportKnowledge(language: AppLanguage) {
  const supabase = createServerSupabase()
  const [faqResult, toursResult] = await Promise.all([
    supabase
      .from('faq_items')
      .select(`sort_order, faq_item_translations!inner(locale, question, answer)`)
      .eq('is_active', true)
      .eq('faq_item_translations.locale', language)
      .order('sort_order', { ascending: true }),
    supabase
      .from('tours')
      .select('slug, title, title_en, title_de, duration_minutes, distance_km, mode, price_cents')
      .eq('is_active', true),
  ])

  const faq = (faqResult.data || []).flatMap((row: any) => {
    const item = Array.isArray(row.faq_item_translations)
      ? row.faq_item_translations[0]
      : row.faq_item_translations
    return item?.question && item?.answer ? [`Q: ${item.question}\nA: ${item.answer}`] : []
  })

  const tours = (toursResult.data || []).map((tour: any) => {
    const title =
      language === 'en'
        ? tour.title_en || tour.title
        : language === 'de'
          ? tour.title_de || tour.title
          : tour.title
    return `${title}: ${tour.distance_km} km, ${tour.duration_minutes} min, ${tour.mode}, EUR ${(tour.price_cents / 100).toFixed(2)}`
  })

  return {
    faq: faq.join('\n\n') || 'No additional FAQ entries are available.',
    tours: tours.join('\n') || 'No tours are currently marked active.',
  }
}
