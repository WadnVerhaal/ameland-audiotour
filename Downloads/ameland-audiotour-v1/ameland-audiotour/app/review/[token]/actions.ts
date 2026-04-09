'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { getTourByAccessToken } from '@/lib/data/access';

export async function submitReview(token: string, formData: FormData) {
  const rating = Number(formData.get('rating') || 0);
  const reviewText = String(formData.get('review_text') || '').trim();
  if (rating < 1 || rating > 5) throw new Error('Ongeldige reviewscore');

  const data = await getTourByAccessToken(token);
  if (!data) throw new Error('Ongeldige toegang');

  const supabase = createServerSupabase();
  await supabase.from('reviews').insert({
    tour_id: data.tour.id,
    order_id: data.order.id,
    rating,
    review_text: reviewText || null,
  });
}
