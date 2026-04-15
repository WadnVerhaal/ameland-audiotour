'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { getTourByAccessToken } from '@/lib/data/access';

export async function submitReview(token: string, formData: FormData) {
  const data = await getTourByAccessToken(token);

  if (data.status !== 'ok') {
    throw new Error('Deze reviewlink is niet meer geldig.');
  }

  const ratingValue = String(formData.get('rating') ?? '').trim();
  const reviewTextValue = String(formData.get('review_text') ?? '').trim();

  const rating = Number(ratingValue);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error('Geef een geldige score van 1 t/m 5.');
  }

  const supabase = createServerSupabase();

  const { error } = await supabase.from('reviews').insert({
    tour_id: data.tour.id,
    order_id: data.order.id,
    rating,
    review_text: reviewTextValue || null,
  });

  if (error) {
    throw new Error('Het opslaan van je review is mislukt.');
  }
}