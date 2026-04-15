'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { getTourByAccessToken } from '@/lib/data/access';

export async function submitReview(
  token: string,
  rating: number,
  reviewText?: string
) {
  const data = await getTourByAccessToken(token);

  if (data.status !== 'ok') {
    throw new Error('Deze reviewlink is niet meer geldig.');
  }

  const supabase = createServerSupabase();

  await supabase.from('reviews').insert({
    tour_id: data.tour.id,
    order_id: data.order.id,
    rating,
    review_text: reviewText || null,
  });

  return { success: true };
}